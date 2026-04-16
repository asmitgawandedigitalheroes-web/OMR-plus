'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, total, count, isOpen, closeCart } = useCart();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCheckout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      closeCart();
      router.push('/login?next=/marketplace');
      return;
    }

    try {
      const res = await fetch('/api/stripe/create-cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
          userId: user.id,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      }
    } catch {
      // silent — user can retry
    }
  };

  return (
    <>
      <style>{`
        .cart-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          transition: opacity 0.3s ease;
        }
        .cart-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 2001;
          width: 100%; max-width: 420px;
          background: #141414;
          border-left: 1px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column;
          box-shadow: -24px 0 80px rgba(0,0,0,0.6);
          transition: transform 0.32s cubic-bezier(0.32,0,0.15,1);
        }
        .cart-drawer.open { transform: translateX(0); }
        .cart-drawer.closed { transform: translateX(100%); }
        .cart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.4rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .cart-close-btn {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: background 0.2s;
        }
        .cart-close-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .cart-items { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; }
        .cart-items::-webkit-scrollbar { display: none; }
        .cart-items { scrollbar-width: none; }
        .cart-item {
          display: flex; gap: 0.9rem; align-items: flex-start;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-img {
          width: 64px; height: 64px; border-radius: 10px; flex-shrink: 0;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .cart-item-placeholder {
          width: 64px; height: 64px; border-radius: 10px; flex-shrink: 0;
          background: rgba(201,168,76,0.07); border: 1px solid rgba(201,168,76,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .cart-qty-ctrl {
          display: flex; align-items: center; gap: 0.5rem; margin-top: 0.55rem;
        }
        .cart-qty-btn {
          width: 26px; height: 26px; border-radius: 6px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.6);
          font-size: 0.9rem; font-weight: 700;
          transition: background 0.15s;
        }
        .cart-qty-btn:hover { background: rgba(255,255,255,0.12); color: white; }
        .cart-remove-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(248,113,113,0.45); padding: 4px;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .cart-remove-btn:hover { color: rgba(248,113,113,0.8); }
        .cart-footer {
          flex-shrink: 0;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
        }
        .cart-checkout-btn {
          width: 100%; padding: 0.82rem 1.5rem;
          background: linear-gradient(135deg, #C9A84C 0%, #E8CC6E 50%, #C9A84C 100%);
          color: #0B0B0B; font-weight: 800;
          font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
          border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .cart-checkout-btn:hover { opacity: 0.88; }
        .cart-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 2rem; text-align: center;
        }
      `}</style>

      {/* Overlay */}
      {isOpen && (
        <div className="cart-overlay" onClick={closeCart} aria-hidden="true" />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : 'closed'}`} role="dialog" aria-label="Shopping cart">

        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <svg style={{ width: 18, height: 18, color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Your Cart</p>
            {count > 0 && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: 20, background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
                {count} item{count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="cart-empty">
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <svg style={{ width: 26, height: 26, color: 'rgba(201,168,76,0.5)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>Your cart is empty</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)' }}>Browse the marketplace to add products</p>
          </div>
        ) : (
          /* Items list */
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="cart-item-img" />
                ) : (
                  <div className="cart-item-placeholder">
                    <svg style={{ width: 22, height: 22, color: 'rgba(201,168,76,0.4)' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349" />
                    </svg>
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  {item.type && (
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', marginBottom: '0.1rem' }}>{item.type}</p>
                  )}
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C9A84C' }}>
                    AED {(item.price_sar * item.quantity).toFixed(2)}
                  </p>
                  <div className="cart-qty-ctrl">
                    <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>

                <button className="cart-remove-btn" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                  <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>Subtotal ({count} item{count !== 1 ? 's' : ''})</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>AED {total.toFixed(2)}</p>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.85rem', textAlign: 'center' }}>
              Secure checkout · Powered by Stripe
            </p>
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Checkout · AED {total.toFixed(2)}
            </button>
            <button
              onClick={clearCart}
              style={{ width: '100%', marginTop: '0.65rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', textDecoration: 'underline', padding: '0.25rem' }}
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
