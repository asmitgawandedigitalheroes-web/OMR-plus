/**
 * GET /api/invoices/receipt?sub_id=<uuid>
 *
 * Returns a print-ready branded HTML receipt for any subscription
 * (works for both Stripe-billed and admin-assigned plans).
 * The client opens this in a new tab; user can print → Save as PDF.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const subId = req.nextUrl.searchParams.get('sub_id');
  if (!subId) {
    return NextResponse.json({ error: 'Missing sub_id' }, { status: 400 });
  }

  const db = createServerClient();

  // Fetch the subscription — must belong to the authenticated user
  const { data: sub, error } = await db
    .from('subscriptions')
    .select('id, user_id, plan_name, status, price_sar, started_at, expires_at, created_at')
    .eq('id', subId)
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error || !sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }

  // Fetch the user's display name + email
  const { data: profile } = await db
    .from('profiles')
    .select('full_name, email')
    .eq('id', auth.userId)
    .maybeSingle();

  const name = profile?.full_name ?? 'Valued Client';
  const email = profile?.email ?? '';
  const receiptNo = `RCP-${sub.id.slice(0, 8).toUpperCase()}`;
  const issuedDate = new Date(sub.created_at ?? sub.started_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const periodStart = new Date(sub.started_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const periodEnd = sub.expires_at
    ? new Date(sub.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  const amount = Number(sub.price_sar).toFixed(2);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt ${receiptNo} — OMR+</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #f5f5f0;
      color: #1a1a1a;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .page {
      max-width: 620px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,0.10);
    }

    /* Header */
    .header {
      background: #0d0d0d;
      padding: 36px 40px 32px;
      position: relative;
      overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a, #C9A84C);
    }
    .logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 800;
      color: #C9A84C;
      letter-spacing: -0.02em;
    }
    .receipt-badge {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(201,168,76,0.7);
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.25);
      padding: 4px 12px;
      border-radius: 999px;
    }
    .receipt-no {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    .receipt-date {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
    }

    /* Body */
    .body { padding: 36px 40px; }

    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #999;
      margin-bottom: 12px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 32px;
    }
    .info-block label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #999;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .info-block p {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }
    .info-block .email {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
      word-break: break-all;
    }

    /* Line items */
    .line-items {
      border: 1px solid #e8e8e0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .line-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      padding: 10px 16px;
      background: #f8f8f4;
      border-bottom: 1px solid #e8e8e0;
    }
    .line-header span {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #999;
    }
    .line-header span:last-child { text-align: right; }
    .line-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0ea;
    }
    .line-row:last-child { border-bottom: none; }
    .line-name {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }
    .line-desc {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
    }
    .line-amount {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
      text-align: right;
      white-space: nowrap;
    }

    /* Total */
    .total-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px;
      background: #0d0d0d;
      border-radius: 10px;
      margin-bottom: 28px;
    }
    .total-label {
      font-size: 13px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .total-amount {
      font-size: 22px;
      font-weight: 800;
      color: #C9A84C;
      letter-spacing: -0.02em;
    }
    .total-currency {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,0.35);
      margin-left: 4px;
    }

    /* Status badge */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(34,197,94,0.1);
      color: #16a34a;
      border: 1px solid rgba(34,197,94,0.25);
      margin-bottom: 24px;
    }
    .status-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #16a34a;
    }

    /* Footer */
    .footer {
      padding: 20px 40px 28px;
      border-top: 1px solid #f0f0ea;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #aaa;
      line-height: 1.6;
    }
    .footer strong { color: #666; }

    /* Print */
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }

    /* Print button */
    .print-bar {
      text-align: center;
      padding: 20px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      background: #C9A84C;
      color: #000;
      font-size: 13px;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      letter-spacing: 0.02em;
      transition: background 0.18s;
    }
    .btn-print:hover { background: #d4b458; }
    .btn-close {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      background: transparent;
      color: #666;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.18s;
    }
    .btn-close:hover { background: #f5f5f0; }
  </style>
</head>
<body>

  <!-- Print / Save actions (hidden when printing) -->
  <div class="print-bar no-print">
    <button class="btn-print" onclick="window.print()">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.75 19.5m10.56-5.671-.001.096m0 0L17.25 19.5M4.5 7.5a1.5 1.5 0 0 1 1.5-1.5h12a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V7.5Z"/></svg>
      Save as PDF / Print
    </button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>

  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="logo-row">
        <span class="logo-text">OMR+</span>
        <span class="receipt-badge">Payment Receipt</span>
      </div>
      <div class="receipt-no">${receiptNo}</div>
      <div class="receipt-date">Issued on ${issuedDate}</div>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Status -->
      <div class="status-pill">
        <div class="status-dot"></div>
        ${sub.status === 'active' || sub.status === 'trialing' ? 'Paid · Active' : sub.status}
      </div>

      <!-- Billed to / Period -->
      <p class="section-title">Details</p>
      <div class="info-grid">
        <div class="info-block">
          <label>Billed to</label>
          <p>${name}</p>
          <p class="email">${email}</p>
        </div>
        <div class="info-block">
          <label>Access Period</label>
          <p>${periodStart}</p>
          <p class="email">until ${periodEnd}</p>
        </div>
      </div>

      <!-- Line items -->
      <p class="section-title">Summary</p>
      <div class="line-items">
        <div class="line-header">
          <span>Description</span>
          <span>Amount</span>
        </div>
        <div class="line-row">
          <div>
            <div class="line-name">${sub.plan_name} — Coaching Plan</div>
            <div class="line-desc">OMR+ Fitness Coaching Membership · Monthly</div>
          </div>
          <div class="line-amount">AED ${amount}</div>
        </div>
      </div>

      <!-- Total -->
      <div class="total-row">
        <span class="total-label">Total Paid</span>
        <span>
          <span class="total-amount">AED ${amount}</span>
          <span class="total-currency">AED</span>
        </span>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>OMR+ Fitness Coaching</strong> · omrplus.com</p>
      <p>For support or billing queries contact us at <strong>aoa12@hotmail.com</strong></p>
      <p style="margin-top:6px;font-size:11px;color:#ccc;">Receipt ID: ${sub.id}</p>
    </div>

  </div>

</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}
