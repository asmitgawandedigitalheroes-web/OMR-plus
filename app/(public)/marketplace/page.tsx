'use client';

import { waUrl } from '@/lib/contact';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_sar: number;
  type: string | null;
  image_url: string | null;
  file_url: string | null;
}

const categories = [
  { name: 'Supplements', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )},
  { name: 'Healthy Snacks', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M12 8.25v-1.5m0 0c-1.354 0-2.7.055-4.024.166C6.845 6.885 6 7.647 6 8.55V6.75m6 1.5V6.75M12 8.25V6.75" />
    </svg>
  )},
  { name: 'Nutrition Items', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  )},
  { name: 'Ebooks & Guides', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  )},
];

export default function MarketplacePage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const { addItem, count, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price_sar, type, image_url, file_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data ?? []);
      } catch {
        // silent — empty state shown
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  const handleBuy = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?next=/marketplace'); return; }
    setBuyingId(product.id);
    try {
      const res = await fetch('/api/stripe/create-product-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBuyingId(null);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price_sar: product.price_sar, type: product.type, image_url: product.image_url });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const hasProducts = !loadingProducts && products.length > 0;

  return (
    <>
      <style>{`
        .mkt-page { background: #0B0B0B; }
        .mkt-hero { padding: 9rem 0 6rem; position: relative; overflow: hidden; }
        @media (max-width: 640px) { .mkt-hero { padding: 4rem 0 3rem; } }
        .mkt-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 35%, rgba(201,168,76,0.07) 0%, transparent 58%);
          pointer-events: none;
        }
        .mkt-grain {
          position: absolute; inset: 0; opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.5; }
          50%  { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .mkt-pulse  { position: absolute; inset: -20px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.2); animation: pulse-ring 3s ease-in-out infinite; }
        .mkt-pulse-2 { position: absolute; inset: -40px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.1); animation: pulse-ring 3s ease-in-out infinite 0.5s; }
        .mkt-cat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .mkt-cat-card:hover { border-color: rgba(201,168,76,0.18); background: rgba(255,255,255,0.045); }
        .mkt-notify-btn {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.9rem 2.2rem; font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: #C9A84C;
          border: 1px solid rgba(201,168,76,0.4); background: transparent; border-radius: 10px;
          cursor: pointer; transition: background 0.3s ease, border-color 0.3s ease;
        }
        .mkt-notify-btn:hover { background: rgba(201,168,76,0.07); border-color: rgba(201,168,76,0.7); }
        .mkt-product-card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; overflow: hidden; display: flex; flex-direction: column;
          transition: border-color 0.3s ease, transform 0.2s ease;
        }
        .mkt-product-card:hover { border-color: rgba(201,168,76,0.22); transform: translateY(-2px); }
        .mkt-buy-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.45rem;
          width: 100%; padding: 0.72rem 1rem;
          background: linear-gradient(135deg, #C9A84C, #E8C76A);
          color: #0B0B0B; font-weight: 800; font-size: 0.74rem; letter-spacing: 0.1em; text-transform: uppercase;
          border: none; border-radius: 10px; cursor: pointer; transition: opacity 0.2s ease;
        }
        .mkt-buy-btn:hover:not(:disabled) { opacity: 0.88; }
        .mkt-buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .mkt-cart-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          width: 100%; padding: 0.7rem 1rem;
          background: rgba(201,168,76,0.08); color: #C9A84C;
          font-weight: 700; font-size: 0.74rem; letter-spacing: 0.06em;
          border: 1.5px solid rgba(201,168,76,0.3); border-radius: 10px; cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .mkt-cart-btn:hover { background: rgba(201,168,76,0.14); border-color: rgba(201,168,76,0.55); }
        .mkt-cart-btn.added { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.35); }
        .mkt-cart-fab {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 100;
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #C9A84C, #E8CC6E);
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(201,168,76,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .mkt-cart-fab:hover { transform: scale(1.08); box-shadow: 0 12px 40px rgba(201,168,76,0.45); }
        .mkt-cart-fab-badge {
          position: absolute; top: -4px; right: -4px;
          width: 20px; height: 20px; border-radius: 50%;
          background: #ef4444; color: white;
          font-size: 0.62rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #0B0B0B;
        }
        @media (max-width: 480px) { .mkt-product-img { height: 160px !important; } }
      `}</style>

      <div className="mkt-page flex flex-col min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <CartDrawer />

        {hasProducts ? (
          /* ── Live product listing ─────────────────────────────── */
          <main className="flex-1 pt-16 sm:pt-20 lg:pt-24 pb-24">
            <div className="mkt-glow" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#C9A84C' }}>
                    {t('marketplace.badge')}
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                  {t('marketplace.title')}{' '}
                  <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {t('marketplace.titleHighlight')}
                  </span>
                </h1>
                <p className="text-white/40 text-sm max-w-lg mx-auto">{t('marketplace.subtitle')}</p>
              </div>

              {/* Product grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(280px, 100%),1fr))', gap: '1.5rem' }}>
                {products.map(product => {
                  const isEbook = product.type === 'ebook';
                  const isAdded = addedId === product.id;
                  return (
                    <div key={product.id} className="mkt-product-card">
                      {/* Clickable image → detail page */}
                      <Link href={`/marketplace/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="mkt-product-img" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: '100%', height: 160, background: 'rgba(201,168,76,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: 40, height: 40, color: 'rgba(201,168,76,0.3)' }} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                            </svg>
                          </div>
                        )}
                      </Link>

                      <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.65rem' }}>
                        {/* Name + price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <Link href={`/marketplace/${product.id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>{product.name}</p>
                          </Link>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 6, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)', whiteSpace: 'nowrap' }}>
                            {product.price_sar} AED
                          </span>
                        </div>

                        {product.type && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', padding: '0.18rem 0.45rem', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', alignSelf: 'flex-start' }}>
                            {product.type}
                          </span>
                        )}

                        {product.description && (
                          <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.description}
                          </p>
                        )}

                        {/* CTA buttons */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {isEbook ? (
                            /* Ebook: single buy & download */
                            <button className="mkt-buy-btn" disabled={buyingId === product.id} onClick={() => handleBuy(product)}>
                              {buyingId === product.id ? 'Processing…' : (
                                <>
                                  <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                  {isRTL ? 'شراء وتنزيل' : 'Buy & Download'}
                                </>
                              )}
                            </button>
                          ) : (
                            /* Physical: Add to Cart + Buy Now */
                            <>
                              <button className={`mkt-cart-btn${isAdded ? ' added' : ''}`} onClick={() => handleAddToCart(product)}>
                                {isAdded ? (
                                  <>
                                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Added to Cart
                                  </>
                                ) : (
                                  <>
                                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                    </svg>
                                    Add to Cart
                                  </>
                                )}
                              </button>
                              <button className="mkt-buy-btn" disabled={buyingId === product.id} onClick={() => handleBuy(product)}>
                                {buyingId === product.id ? 'Processing…' : (
                                  <>
                                    <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                    </svg>
                                    {isRTL ? 'اشتر الآن' : 'Buy Now'}
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating cart button */}
            {count > 0 && (
              <button className="mkt-cart-fab" onClick={openCart} aria-label="Open cart">
                <svg style={{ width: 22, height: 22, color: '#0B0B0B' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <span className="mkt-cart-fab-badge">{count}</span>
              </button>
            )}
          </main>

        ) : (
          /* ── Coming Soon state ───────────────────────────────── */
          <section className="mkt-hero flex-1">
            <div className="mkt-glow" />
            <div className="mkt-grain" />
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-10 rounded-full"
                style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C9A84C' }} />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#C9A84C' }}>
                  {t('marketplace.comingSoon')}
                </span>
              </div>
              <div className="relative w-24 h-24 mx-auto mb-10">
                <div className="mkt-pulse" />
                <div className="mkt-pulse-2" />
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)' }}>
                  <svg className="w-10 h-10" style={{ color: '#C9A84C' }} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]">
                {t('marketplace.title')}{' '}
                <span style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C76A, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {t('marketplace.titleHighlight')}
                </span>
              </h1>
              <p className="text-white/40 text-base leading-[1.9] max-w-xl mx-auto mb-10">{t('marketplace.subtitle')}</p>
              <a href={waUrl('I want to be notified when the OMR+ marketplace launches')} target="_blank" rel="noopener noreferrer" className="mkt-notify-btn">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {t('marketplace.notifyBtn')}
              </a>
              <div className="h-px max-w-sm mx-auto my-14" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
              <div className="mb-8">
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>What&apos;s Coming</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {categories.map((cat, i) => (
                    <div key={i} className="mkt-cat-card flex-col text-center" style={{ flexDirection: 'column' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.14)', color: '#C9A84C' }}>
                        {cat.icon}
                      </div>
                      <p className="text-xs font-medium text-white/60">{cat.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs tracking-wide" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span>{' '}Exclusive member pricing &nbsp;·&nbsp;
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span>{' '}Curated for performance &nbsp;·&nbsp;
                <span style={{ color: 'rgba(201,168,76,0.4)' }}>✓</span>{' '}Digital downloads included
              </p>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
