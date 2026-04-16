/**
 * lib/email.ts
 * ─────────────────────────────────────────────────────────────────
 * Transactional email for OMR+ / AthloCode.
 * Transport: Resend SMTP  (smtp.resend.com:465)
 *
 * .env.local keys required:
 *   SMTP_HOST=smtp.resend.com
 *   SMTP_PORT=465
 *   SMTP_USER=resend
 *   SMTP_PASS=re_xxxxxxxxxxxx   ← your Resend API key
 *   EMAIL_FROM=AthloCode <noreply@omrplus.com>
 *   ADMIN_EMAIL=aoa12@hotmail.com
 */
import nodemailer from 'nodemailer';

// ── SMTP transporter (created once, reused across calls) ─────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.resend.com',
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,          // port 465 uses implicit TLS
    auth: {
      user: process.env.SMTP_USER ?? 'resend',
      pass: process.env.SMTP_PASS ?? '',
    },
  });
}

const FROM      = process.env.EMAIL_FROM   ?? 'AthloCode <onboarding@resend.dev>';
const ADMIN     = process.env.ADMIN_EMAIL  ?? 'aoa12@hotmail.com';
const APP_URL   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://omrplus.com';
// TEST MODE: when domain is not yet verified, Resend only allows sending to your
// own registered email. Setting EMAIL_TEST_MODE=true redirects all mail to ADMIN.
const TEST_MODE = process.env.EMAIL_TEST_MODE === 'true';

// ── Shared brand styles ──────────────────────────────────────────
const BASE_STYLE = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0B0B0B;color:#FFFFFF;margin:0;padding:0;`;
const CONTAINER  = `max-width:560px;margin:40px auto;background:#111111;border:1px solid rgba(201,168,76,0.2);border-radius:16px;overflow:hidden;`;
const HEADER     = `background:linear-gradient(135deg,#C9A84C 0%,#E8CC6E 50%,#C9A84C 100%);padding:28px 32px 22px;`;
const BODY       = `padding:32px;`;
const FOOTER_CSS = `padding:20px 32px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;font-size:12px;color:rgba(255,255,255,0.3);`;
const GOLD_BTN   = `display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#C9A84C,#E8CC6E,#C9A84C);color:#0B0B0B;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;margin-top:20px;`;
const DIVIDER    = `border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;`;
const MUTED      = `color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;`;
const H2         = `font-size:22px;font-weight:700;color:#FFFFFF;margin:0 0 8px;`;
const P          = `font-size:15px;line-height:1.7;color:rgba(255,255,255,0.75);margin:12px 0;`;
const STAT_ROW   = `display:flex;gap:12px;margin:20px 0;`;
const STAT_BOX   = `flex:1;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.18);border-radius:10px;padding:14px 16px;text-align:center;`;
const STAT_LABEL = `font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;`;
const STAT_VALUE = `font-size:14px;font-weight:700;color:#C9A84C;`;

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="${BASE_STYLE}">
  <div style="${CONTAINER}">
    <div style="${HEADER}">
      <div style="font-size:20px;font-weight:800;color:#0B0B0B;letter-spacing:-0.5px;">AthloCode</div>
      <div style="font-size:11px;font-weight:700;color:rgba(0,0,0,0.55);letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Premium Fitness Coaching</div>
    </div>
    <div style="${BODY}">${body}</div>
    <div style="${FOOTER_CSS}">
      © ${new Date().getFullYear()} AthloCode · omrplus.com<br/>
      You are receiving this because you have an account at AthloCode.
    </div>
  </div>
</body>
</html>`;
}

// ── Safe send (never throws — warns & skips if credentials missing) ─
async function send(to: string, subject: string, html: string) {
  const pass = process.env.SMTP_PASS ?? '';
  if (!pass || pass.startsWith('re_xxx')) {
    console.warn(`[email] SMTP_PASS not configured — skipping email to ${to}: "${subject}"`);
    return;
  }

  // In test mode all mail goes to the admin inbox so Resend's unverified-domain
  // restriction (can only send to your own account email) does not block delivery.
  const recipient = TEST_MODE ? ADMIN : to;
  const finalSubject = TEST_MODE && to !== ADMIN
    ? `[TEST → ${to}] ${subject}`
    : subject;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: FROM, to: recipient, subject: finalSubject, html });
    console.log(`[email] sent → ${recipient}${TEST_MODE ? ` (test-mode, original: ${to})` : ''} | ${finalSubject}`);
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}

// ══════════════════════════════════════════════════════════════════
// 1. SUBSCRIPTION CONFIRMED
// ══════════════════════════════════════════════════════════════════
export async function sendSubscriptionConfirmed(opts: {
  to: string; name: string; planName: string; amount: number; nextBillingDate: string;
}) {
  const html = layout('Your AthloCode Subscription is Active!', `
    <h2 style="${H2}">Welcome aboard, ${opts.name}! 🎉</h2>
    <p style="${P}">Your <strong style="color:#C9A84C">${opts.planName}</strong> subscription is now active. Your coaching journey starts today.</p>
    <hr style="${DIVIDER}"/>
    <div style="${STAT_ROW}">
      <div style="${STAT_BOX}">
        <div style="${STAT_LABEL}">Plan</div>
        <div style="${STAT_VALUE}">${opts.planName}</div>
      </div>
      <div style="${STAT_BOX}">
        <div style="${STAT_LABEL}">Amount</div>
        <div style="${STAT_VALUE}">SAR ${opts.amount}</div>
      </div>
      <div style="${STAT_BOX}">
        <div style="${STAT_LABEL}">Next Billing</div>
        <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.8);">${opts.nextBillingDate}</div>
      </div>
    </div>
    <p style="${P}">Log in to your dashboard to complete your onboarding, view your meal plan, and connect with your coach.</p>
    <a href="${APP_URL}/dashboard/client" style="${GOLD_BTN}">Go to Dashboard →</a>
  `);
  await send(opts.to, `✅ Subscription Confirmed — ${opts.planName}`, html);
}

// ══════════════════════════════════════════════════════════════════
// 2. PAYMENT FAILED
// ══════════════════════════════════════════════════════════════════
export async function sendPaymentFailed(opts: {
  to: string; name: string; planName: string; amount: number;
}) {
  const html = layout('Action Required: Payment Failed', `
    <h2 style="${H2}">Payment Unsuccessful</h2>
    <p style="${P}">Hi ${opts.name}, we were unable to process your payment for <strong style="color:#C9A84C">${opts.planName}</strong> (SAR ${opts.amount}).</p>
    <p style="${P}">Your dashboard access may be limited until the payment is resolved. Please update your payment method to continue your coaching.</p>
    <a href="${APP_URL}/checkout" style="${GOLD_BTN}">Update Payment Method →</a>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">If you believe this is an error, contact us at <a href="mailto:${ADMIN}" style="color:#C9A84C">${ADMIN}</a></p>
  `);
  await send(opts.to, '⚠️ Payment Failed — Action Required', html);
  await send(ADMIN, `[Alert] Payment failed — ${opts.name} (${opts.to}) — ${opts.planName}`, html);
}

// ══════════════════════════════════════════════════════════════════
// 3. SUBSCRIPTION CANCELLED
// ══════════════════════════════════════════════════════════════════
export async function sendSubscriptionCancelled(opts: {
  to: string; name: string; planName: string; accessUntil: string;
}) {
  const html = layout('Your Subscription Has Been Cancelled', `
    <h2 style="${H2}">Subscription Cancelled</h2>
    <p style="${P}">Hi ${opts.name}, your <strong style="color:#C9A84C">${opts.planName}</strong> subscription has been cancelled.</p>
    <p style="${P}">You will retain full access until <strong style="color:#C9A84C">${opts.accessUntil}</strong>.</p>
    <hr style="${DIVIDER}"/>
    <p style="${P}">We would love to have you back — resubscribe any time.</p>
    <a href="${APP_URL}/pricing" style="${GOLD_BTN}">View Plans →</a>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">Did not cancel? Contact us at <a href="mailto:${ADMIN}" style="color:#C9A84C">${ADMIN}</a></p>
  `);
  await send(opts.to, 'Subscription Cancelled — AthloCode', html);
}

// ══════════════════════════════════════════════════════════════════
// 4. SUBSCRIPTION RENEWED
// ══════════════════════════════════════════════════════════════════
export async function sendSubscriptionRenewed(opts: {
  to: string; name: string; planName: string; amount: number; nextBillingDate: string;
}) {
  const html = layout('Subscription Renewed Successfully', `
    <h2 style="${H2}">Renewed &amp; Ready to Go! 💪</h2>
    <p style="${P}">Hi ${opts.name}, your <strong style="color:#C9A84C">${opts.planName}</strong> has been renewed successfully.</p>
    <div style="${STAT_ROW}">
      <div style="${STAT_BOX}">
        <div style="${STAT_LABEL}">Amount Charged</div>
        <div style="${STAT_VALUE}">SAR ${opts.amount}</div>
      </div>
      <div style="${STAT_BOX}">
        <div style="${STAT_LABEL}">Next Renewal</div>
        <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.8);">${opts.nextBillingDate}</div>
      </div>
    </div>
    <a href="${APP_URL}/dashboard/client" style="${GOLD_BTN}">View Dashboard →</a>
  `);
  await send(opts.to, `🔄 Subscription Renewed — ${opts.planName}`, html);
}

// ══════════════════════════════════════════════════════════════════
// 5. ORDER CONFIRMED (marketplace)
// ══════════════════════════════════════════════════════════════════
export async function sendOrderConfirmed(opts: {
  to: string; name: string; orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const rows = opts.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.8);font-size:14px;">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.45);font-size:14px;text-align:center;">×${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#C9A84C;font-size:14px;text-align:right;">SAR ${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const html = layout('Order Confirmed — AthloCode', `
    <h2 style="${H2}">Order Confirmed! 🛍️</h2>
    <p style="${P}">Hi ${opts.name}, your order has been placed successfully.</p>
    <p style="${MUTED}">Order ID: <span style="color:#C9A84C;font-family:monospace;">${opts.orderId.slice(0,8).toUpperCase()}</span></p>
    <hr style="${DIVIDER}"/>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;padding-bottom:8px;letter-spacing:0.06em;">Item</th>
          <th style="text-align:center;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;padding-bottom:8px;letter-spacing:0.06em;">Qty</th>
          <th style="text-align:right;font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;padding-bottom:8px;letter-spacing:0.06em;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top:14px;font-weight:700;color:rgba(255,255,255,0.6);font-size:14px;">Total</td>
          <td style="padding-top:14px;font-weight:700;color:#C9A84C;font-size:16px;text-align:right;">SAR ${opts.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <a href="${APP_URL}/dashboard/client" style="${GOLD_BTN}">View My Orders →</a>
  `);
  await send(opts.to, `✅ Order Confirmed — SAR ${opts.total.toFixed(2)}`, html);
}

// ══════════════════════════════════════════════════════════════════
// 6. COACH WELCOME
// ══════════════════════════════════════════════════════════════════
export async function sendCoachWelcome(opts: {
  to: string; name: string; tempPassword: string;
}) {
  const html = layout('Your AthloCode Coach Account is Ready', `
    <h2 style="${H2}">Welcome, Coach ${opts.name}!</h2>
    <p style="${P}">Your coach account has been created. Use the credentials below to sign in for the first time.</p>
    <div style="background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:18px 20px;margin:20px 0;">
      <div style="${MUTED}">Email</div>
      <div style="color:#FFFFFF;font-size:15px;font-weight:600;margin-bottom:12px;">${opts.to}</div>
      <div style="${MUTED}">Temporary Password</div>
      <div style="color:#C9A84C;font-size:17px;font-weight:700;font-family:monospace;letter-spacing:0.05em;">${opts.tempPassword}</div>
    </div>
    <p style="${P}">Please change your password after your first login.</p>
    <a href="${APP_URL}/login" style="${GOLD_BTN}">Sign In →</a>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">Not expecting this? Contact <a href="mailto:${ADMIN}" style="color:#C9A84C">${ADMIN}</a></p>
  `);
  await send(opts.to, '🏋️ Your AthloCode Coach Account is Ready', html);
}

// ══════════════════════════════════════════════════════════════════
// 7. CONTACT FORM → admin
// ══════════════════════════════════════════════════════════════════
export async function sendContactFormToAdmin(opts: {
  name: string; email: string; phone?: string; subject: string; message: string;
}) {
  const html = layout('New Contact Form Submission', `
    <h2 style="${H2}">New Message from Website</h2>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:20px;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:0.06em;width:90px;">Name</td>
            <td style="padding:6px 0;color:#FFFFFF;font-size:14px;">${opts.name}</td></tr>
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
            <td style="padding:6px 0;font-size:14px;"><a href="mailto:${opts.email}" style="color:#C9A84C;">${opts.email}</a></td></tr>
        ${opts.phone ? `<tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Phone</td>
            <td style="padding:6px 0;color:#FFFFFF;font-size:14px;">${opts.phone}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Subject</td>
            <td style="padding:6px 0;color:#FFFFFF;font-size:14px;font-weight:600;">${opts.subject}</td></tr>
      </table>
    </div>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">Message:</p>
    <p style="${P}">${opts.message.replace(/\n/g, '<br/>')}</p>
  `);
  await send(ADMIN, `📬 Contact: ${opts.subject} — from ${opts.name}`, html);
}

// ══════════════════════════════════════════════════════════════════
// 8. CONTACT FORM → auto-reply to sender
// ══════════════════════════════════════════════════════════════════
export async function sendContactFormReply(opts: { to: string; name: string }) {
  const html = layout("We've Received Your Message", `
    <h2 style="${H2}">Thanks for reaching out, ${opts.name}!</h2>
    <p style="${P}">We have received your message and will get back to you within 24 hours.</p>
    <p style="${P}">In the meantime, feel free to explore our programs or book a free consultation.</p>
    <a href="${APP_URL}/consultation" style="${GOLD_BTN}">Book Free Consultation →</a>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">Questions? Email us at <a href="mailto:${ADMIN}" style="color:#C9A84C">${ADMIN}</a></p>
  `);
  await send(opts.to, "We've received your message — AthloCode", html);
}

// ══════════════════════════════════════════════════════════════════
// 9. EMAIL CONFIRMATION (Supabase Auth Hook)
// ══════════════════════════════════════════════════════════════════
export async function sendEmailConfirmation(opts: {
  to: string; confirmUrl: string; name?: string;
}) {
  const greeting = opts.name ? `Hi ${opts.name},` : 'Welcome!';
  const html = layout('Confirm Your AthloCode Email Address', `
    <h2 style="${H2}">Almost there!</h2>
    <p style="${P}">${greeting} Please confirm your email address to activate your AthloCode account and begin your fitness journey.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${opts.confirmUrl}" style="${GOLD_BTN}">Confirm Email Address →</a>
    </div>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    <p style="${MUTED}">Having trouble with the button? Copy and paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:12px;color:rgba(201,168,76,0.6);margin-top:8px;">${opts.confirmUrl}</p>
  `);
  await send(opts.to, '✅ Confirm your AthloCode email address', html);
}

// ══════════════════════════════════════════════════════════════════
// 10. PASSWORD RESET (Supabase Auth Hook)
// ══════════════════════════════════════════════════════════════════
export async function sendPasswordResetEmail(opts: {
  to: string; resetUrl: string; name?: string;
}) {
  const greeting = opts.name ? `Hi ${opts.name},` : 'Hello,';
  const html = layout('Reset Your AthloCode Password', `
    <h2 style="${H2}">Password Reset Request</h2>
    <p style="${P}">${greeting} we received a request to reset the password for your AthloCode account.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${opts.resetUrl}" style="${GOLD_BTN}">Reset My Password →</a>
    </div>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">This link is valid for 1 hour. If you did not request a password reset, please ignore this email — your account is safe.</p>
    <p style="${MUTED}">Having trouble with the button? Copy and paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:12px;color:rgba(201,168,76,0.6);margin-top:8px;">${opts.resetUrl}</p>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">If you did not make this request, contact us at <a href="mailto:${ADMIN}" style="color:#C9A84C">${ADMIN}</a></p>
  `);
  await send(opts.to, '🔐 Reset your AthloCode password', html);
}

// ══════════════════════════════════════════════════════════════════
// 11. EMAIL CHANGE CONFIRMATION (Supabase Auth Hook)
// ══════════════════════════════════════════════════════════════════
export async function sendEmailChangeConfirmation(opts: {
  to: string; confirmUrl: string; name?: string;
}) {
  const greeting = opts.name ? `Hi ${opts.name},` : 'Hello,';
  const html = layout('Confirm Your New Email Address', `
    <h2 style="${H2}">Confirm New Email</h2>
    <p style="${P}">${greeting} you requested an email address change on your AthloCode account. Click below to confirm your new address.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${opts.confirmUrl}" style="${GOLD_BTN}">Confirm New Email →</a>
    </div>
    <hr style="${DIVIDER}"/>
    <p style="${MUTED}">This link expires in 24 hours. If you did not request this change, contact us immediately at <a href="mailto:${ADMIN}" style="color:#C9A84C">${ADMIN}</a></p>
  `);
  await send(opts.to, '📧 Confirm your new AthloCode email address', html);
}
