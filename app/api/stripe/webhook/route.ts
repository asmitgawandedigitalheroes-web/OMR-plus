import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import {
  sendSubscriptionConfirmed,
  sendSubscriptionRenewed,
  sendSubscriptionCancelled,
  sendPaymentFailed,
  sendOrderConfirmed,
} from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: get user email + name from profiles table
async function getUserInfo(userId: string): Promise<{ email: string; name: string } | null> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .maybeSingle();
  if (!data?.email) return null;
  return { email: data.email, name: data.full_name ?? data.email.split('@')[0] };
}

// Helper: get user info from a Stripe subscription id
async function getUserInfoBySubId(stripeSubId: string): Promise<{ email: string; name: string; userId: string } | null> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, profiles(email, full_name)')
    .eq('stripe_subscription_id', stripeSubId)
    .maybeSingle();
  if (!data?.user_id) return null;
  const profile = (data.profiles as unknown as { email: string; full_name: string | null } | null);
  if (!profile?.email) return null;
  return {
    userId: data.user_id,
    email: profile.email,
    name: profile.full_name ?? profile.email.split('@')[0],
  };
}

// Map Stripe's subscription statuses to our enum values
// Enum: 'active' | 'cancelled' | 'expired' | 'pending'
function toDbStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':   return 'active';
    case 'canceled': return 'cancelled';
    case 'past_due':
    case 'unpaid':
    case 'trialing':
    case 'incomplete':
    case 'incomplete_expired':
    default:         return 'pending';
  }
}

// Helper: extract subscription fields safely across Stripe SDK versions
function getSubFields(sub: Record<string, unknown>) {
  return {
    periodEnd: sub.current_period_end as number | undefined,
    startDate: sub.start_date as number | undefined,
    status: sub.status as string,
    cancelAtPeriodEnd: sub.cancel_at_period_end as boolean,
    priceAmount: (() => {
      const items = sub.items as { data?: { price?: { unit_amount?: number } }[] } | undefined;
      const amt = items?.data?.[0]?.price?.unit_amount;
      return amt ? amt / 100 : 0;
    })(),
  };
}

export async function POST(req: NextRequest) {
  console.log('========== [WEBHOOK] HIT ==========');

  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  console.log('[webhook] sig present:', !!sig);
  console.log('[webhook] body length:', rawBody.length);
  console.log('[webhook] STRIPE_WEBHOOK_SECRET present:', !!process.env.STRIPE_WEBHOOK_SECRET);

  if (!sig) {
    console.error('[webhook] NO stripe-signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('[webhook] signature VERIFIED, event type:', event.type);
  } catch (err) {
    console.error('[webhook] signature verification FAILED:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── New subscription created via Checkout ──────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[webhook] checkout session mode:', session.mode);
        console.log('[webhook] session metadata:', JSON.stringify(session.metadata));
        console.log('[webhook] session.subscription:', session.subscription);

        // ── One-time product purchase ──────────────────────────
        if (session.mode === 'payment') {
          const userId = session.metadata?.supabase_user_id;
          const checkoutType = session.metadata?.checkout_type;
          const paymentIntentId = session.payment_intent as string ?? null;

          console.log('[webhook] payment mode — userId:', userId, 'checkoutType:', checkoutType);

          if (!userId) {
            console.error('[webhook] MISSING userId in payment session metadata');
            break;
          }

          // ── Cart checkout: order already exists, just mark as completed ──
          if (checkoutType === 'cart') {
            const orderId = session.metadata?.order_id;
            if (!orderId) { console.error('[webhook] MISSING order_id for cart checkout'); break; }

            const { error } = await supabaseAdmin
              .from('orders')
              .update({ status: 'completed', stripe_payment_id: paymentIntentId })
              .eq('id', orderId);

            if (error) {
              console.error('[webhook] failed to complete cart order:', error.message);
            } else {
              console.log(`[webhook] SUCCESS — cart order ${orderId} marked completed`);
              // Email: cart order confirmed
              const userInfo = await getUserInfo(userId);
              if (userInfo) {
                const { data: orderItems } = await supabaseAdmin
                  .from('order_items')
                  .select('quantity, price_sar, products(name)')
                  .eq('order_id', orderId);
                const items = (orderItems ?? []).map((i: Record<string, unknown>) => ({
                  name: (i.products as { name: string } | null)?.name ?? 'Product',
                  quantity: i.quantity as number,
                  price: i.price_sar as number,
                }));
                const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
                await sendOrderConfirmed({ to: userInfo.email, name: userInfo.name, orderId, items, total });
              }
            }
            break;
          }

          // ── Single product checkout ──
          const productId = session.metadata?.product_id;
          const productPrice = parseFloat(session.metadata?.product_price ?? '0');

          console.log('[webhook] single product — productId:', productId);

          if (!productId) {
            console.error('[webhook] MISSING productId in payment session metadata');
            break;
          }

          // Create order row
          const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
              user_id: userId,
              total_sar: productPrice,
              status: 'completed',
              stripe_payment_id: paymentIntentId,
            })
            .select('id')
            .single();

          if (orderError || !order) {
            console.error('[webhook] failed to insert order:', orderError?.message);
            break;
          }

          const { error: itemError } = await supabaseAdmin
            .from('order_items')
            .insert({
              order_id: order.id,
              product_id: productId,
              quantity: 1,
              price_sar: productPrice,
            });

          if (itemError) {
            console.error('[webhook] failed to insert order_item:', itemError.message);
          } else {
            console.log(`[webhook] SUCCESS — order created for user ${userId}, product ${productId}`);
            // Email: single product order confirmed
            const userInfo = await getUserInfo(userId);
            if (userInfo && order) {
              const { data: product } = await supabaseAdmin.from('products').select('name, price_sar').eq('id', productId).maybeSingle();
              await sendOrderConfirmed({
                to: userInfo.email,
                name: userInfo.name,
                orderId: order.id,
                items: [{ name: product?.name ?? 'Product', quantity: 1, price: productPrice }],
                total: productPrice,
              });
            }
          }
          break;
        }

        if (session.mode !== 'subscription') {
          console.log('[webhook] not subscription mode, skipping');
          break;
        }

        const userId = session.metadata?.supabase_user_id;
        const planName = session.metadata?.plan_name ?? 'Unknown';
        const stripeSubId = session.subscription as string;

        console.log('[webhook] userId:', userId);
        console.log('[webhook] planName:', planName);
        console.log('[webhook] stripeSubId:', stripeSubId);

        if (!userId || !stripeSubId) {
          console.error('[webhook] MISSING userId or stripeSubId in session metadata');
          break;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = await stripe.subscriptions.retrieve(stripeSubId) as any;
        const { periodEnd, startDate, priceAmount } = getSubFields(sub);
        console.log('[webhook] retrieved stripe sub — status:', sub.status, 'periodEnd:', periodEnd, 'priceAmount:', priceAmount);

        const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const startedAt = startDate ? new Date(startDate * 1000).toISOString() : new Date().toISOString();

        // Check if a subscription row already exists for this user
        const { data: existing, error: lookupError } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('[webhook] existing lookup:', JSON.stringify({ existing, lookupError }));

        let dbError;
        if (existing) {
          console.log('[webhook] UPDATING existing row:', existing.id);
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({
              plan_name: planName,
              status: 'active',
              price_sar: priceAmount,
              stripe_subscription_id: stripeSubId,
              started_at: startedAt,
              expires_at: expiresAt,
              cancel_at_period_end: false,
              cancelled_at: null,
            })
            .eq('id', existing.id);
          dbError = error;
        } else {
          console.log('[webhook] INSERTING new subscription row');
          const insertData = {
            user_id: userId,
            plan_name: planName,
            status: 'active',
            price_sar: priceAmount,
            stripe_subscription_id: stripeSubId,
            started_at: startedAt,
            expires_at: expiresAt,
          };
          console.log('[webhook] insert data:', JSON.stringify(insertData));
          const { error, data } = await supabaseAdmin
            .from('subscriptions')
            .insert(insertData)
            .select();
          console.log('[webhook] insert result:', JSON.stringify({ data, error }));
          dbError = error;
        }

        if (dbError) {
          console.error('[webhook] DB WRITE ERROR:', JSON.stringify(dbError));
          throw new Error(dbError.message);
        }

        console.log(`[webhook] SUCCESS — subscription activated for user ${userId}`);

        // Email: subscription confirmed
        const userInfo = await getUserInfo(userId);
        if (userInfo) {
          const nextBilling = new Date((sub.current_period_end as number) * 1000)
            .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          await sendSubscriptionConfirmed({
            to: userInfo.email,
            name: userInfo.name,
            planName,
            amount: priceAmount,
            nextBillingDate: nextBilling,
          });
        }
        break;
      }

      // ── Subscription renewed or updated ───────────────────
      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        const { periodEnd, status } = getSubFields(sub);
        console.log('[webhook] subscription.updated for:', sub.id, 'status:', status);

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: toDbStatus(status),
            ...(periodEnd && { expires_at: new Date(periodEnd * 1000).toISOString() }),
          })
          .eq('stripe_subscription_id', sub.id);

        if (error) console.error('[webhook] subscription.updated error:', error.message);
        else console.log('[webhook] subscription.updated SUCCESS');
        break;
      }

      // ── Subscription cancelled ─────────────────────────────
      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        console.log('[webhook] subscription.deleted for:', sub.id);

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', sub.id);

        if (error) {
          console.error('[webhook] subscription.deleted error:', error.message);
        } else {
          // Email: subscription cancelled
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cancelledSub = event.data.object as any;
          const info = await getUserInfoBySubId(cancelledSub.id);
          if (info) {
            const accessUntil = new Date((cancelledSub.current_period_end ?? 0) * 1000)
              .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const { data: subRow } = await supabaseAdmin
              .from('subscriptions').select('plan_name').eq('stripe_subscription_id', cancelledSub.id).maybeSingle();
            await sendSubscriptionCancelled({
              to: info.email,
              name: info.name,
              planName: subRow?.plan_name ?? 'Your Plan',
              accessUntil,
            });
          }
        }
        break;
      }

      // ── Payment failed ─────────────────────────────────────
      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const stripeSubId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!stripeSubId) break;

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'pending' })
          .eq('stripe_subscription_id', stripeSubId);

        if (error) {
          console.error('[webhook] payment_failed error:', error.message);
        } else {
          // Email: payment failed
          const info = await getUserInfoBySubId(stripeSubId);
          if (info) {
            const amountDue = typeof invoice.amount_due === 'number' ? invoice.amount_due / 100 : 0;
            const { data: subRow } = await supabaseAdmin
              .from('subscriptions').select('plan_name').eq('stripe_subscription_id', stripeSubId).maybeSingle();
            await sendPaymentFailed({
              to: info.email,
              name: info.name,
              planName: subRow?.plan_name ?? 'Your Plan',
              amount: amountDue,
            });
          }
        }
        break;
      }

      // ── Invoice paid (renewal) ─────────────────────────────
      case 'invoice.paid': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        const stripeSubId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;
        if (!stripeSubId) break;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = await stripe.subscriptions.retrieve(stripeSubId) as any;
        const { periodEnd, priceAmount: renewedAmount } = getSubFields(sub);

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            ...(periodEnd && { expires_at: new Date(periodEnd * 1000).toISOString() }),
          })
          .eq('stripe_subscription_id', stripeSubId);

        if (error) {
          console.error('[webhook] invoice.paid error:', error.message);
        } else if (invoice.billing_reason === 'subscription_cycle') {
          // Only email on renewal (not on first payment — that's handled by checkout.session.completed)
          const info = await getUserInfoBySubId(stripeSubId);
          if (info) {
            const nextBilling = periodEnd
              ? new Date(periodEnd * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : '—';
            const { data: subRow } = await supabaseAdmin
              .from('subscriptions').select('plan_name').eq('stripe_subscription_id', stripeSubId).maybeSingle();
            await sendSubscriptionRenewed({
              to: info.email,
              name: info.name,
              planName: subRow?.plan_name ?? 'Your Plan',
              amount: renewedAmount,
              nextBillingDate: nextBilling,
            });
          }
        }
        break;
      }

      default:
        console.log('[webhook] unhandled event type:', event.type);
        break;
    }
  } catch (err) {
    console.error(`[webhook] HANDLER ERROR for ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
