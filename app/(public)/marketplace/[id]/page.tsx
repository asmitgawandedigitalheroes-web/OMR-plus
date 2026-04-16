'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price_sar: number;
  type: string | null;
  image_url: string | null;
  file_url: string | null;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, name_ar, description, description_ar, price_sar, type, image_url, file_url')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setProduct(data);

      // Fetch related products (same type, exclude current)
      const { data: rel } = await supabase
        .from('products')
        .select('id, name, name_ar, description, description_ar, price_sar, type, image_url, file_url')
        .eq('is_active', true)
        .eq('type', data.type ?? '')
        .neq('id', id)
        .limit(4);
      setRelated(rel ?? []);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const handleBuyNow = async () => {
    if (!product) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?next=/marketplace/' + id); return; }

    setBuyingNow(true);
    try {
      const res = await fetch('/api/stripe/create-product-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBuyingNow(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price_sar: product.price_sar, type: product.type, image_url: product.image_url });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const displayName = (p: Product) => isRTL && p.name_ar ? p.name_ar : p.name;
  const displayDesc = (p: Product) => isRTL && p.description_ar ? p.description_ar : p.description;

  if (loading) {
    return (
      <>
        <div style={{ background: '#0B0B0B', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(201,168,76,0.15)', borderTopColor: '#C9A84C', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <div style={{ background: '#0B0B0B', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Product not found</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.28)', marginBottom: '1.5rem' }}>This product may no longer be available.</p>
            <Link href="/marketplace" style={{ color: '#C9A84C', fontSize: '0.82rem', textDecoration: 'underline' }}>← Back to Marketplace</Link>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const isEbook = product.type === 'ebook';

  return (
    <>
      <style>{`
        .pdp-page { background: #0B0B0B; min-height: 100vh; }
        .pdp-glow {
          position: fixed; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 60% 30%, rgba(201,168,76,0.05) 0%, transparent 55%);
        }
        .pdp-back {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-size: 0.78rem; color: rgba(255,255,255,0.35);
          text-decoration: none; transition: color 0.2s;
          margin-bottom: 2rem;
        }
        .pdp-back:hover { color: rgba(201,168,76,0.8); }
        .pdp-img-wrap {
          border-radius: 20px; overflow: hidden;
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          aspect-ratio: 1 / 1;
          display: flex; align-items: center; justify-content: center;
        }
        .pdp-add-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.55rem;
          padding: 0.85rem 1.5rem; border-radius: 12px; cursor: pointer;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.06em;
          background: rgba(201,168,76,0.1); color: #C9A84C;
          border: 1.5px solid rgba(201,168,76,0.35);
          transition: background 0.2s, border-color 0.2s;
        }
        .pdp-add-btn:hover { background: rgba(201,168,76,0.16); border-color: rgba(201,168,76,0.6); }
        .pdp-add-btn.added { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.35); }
        .pdp-buy-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.55rem;
          padding: 0.85rem 1.5rem; border-radius: 12px; cursor: pointer;
          font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
          background: linear-gradient(135deg, #C9A84C 0%, #E8CC6E 50%, #C9A84C 100%);
          color: #0B0B0B; border: none;
          transition: opacity 0.2s;
        }
        .pdp-buy-btn:hover:not(:disabled) { opacity: 0.88; }
        .pdp-buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pdp-related-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden;
          transition: border-color 0.25s, transform 0.2s;
          text-decoration: none; display: block;
        }
        .pdp-related-card:hover {
          border-color: rgba(201,168,76,0.22);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="pdp-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="pdp-glow" />
        <Navbar />
        <CartDrawer />

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>

          {/* Back link */}
          <Link href="/marketplace" className="pdp-back">
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Marketplace
          </Link>

          {/* Product layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: '3.5rem', alignItems: 'start' }}>

            {/* ── Left: Image ── */}
            <div className="pdp-img-wrap" style={{ position: 'sticky', top: '6rem' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={displayName(product)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg style={{ width: 80, height: 80, color: 'rgba(201,168,76,0.2)' }} fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              )}
            </div>

            {/* ── Right: Info ── */}
            <div>
              {/* Category badge */}
              {product.type && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0.25rem 0.7rem', borderRadius: 6, background: 'rgba(201,168,76,0.08)', color: 'rgba(201,168,76,0.7)', border: '1px solid rgba(201,168,76,0.18)' }}>
                    {product.type}
                  </span>
                </div>
              )}

              {/* Name */}
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                {displayName(product)}
              </h1>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#C9A84C', lineHeight: 1 }}>AED {product.price_sar.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />

              {/* Description */}
              {displayDesc(product) && (
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>About this product</p>
                  <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>{displayDesc(product)}</p>
                </div>
              )}

              {/* Trust badges */}
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {[
                  { icon: '🔒', text: 'Secure Payment' },
                  { icon: '⚡', text: isEbook ? 'Instant Download' : 'Fast Delivery' },
                  { icon: '✓', text: 'Quality Guaranteed' },
                ].map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem' }}>{b.icon}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{b.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {isEbook ? (
                  /* Ebook: Buy & Download only */
                  <button className="pdp-buy-btn" style={{ flex: 1 }} disabled={buyingNow} onClick={handleBuyNow}>
                    {buyingNow ? 'Redirecting…' : (
                      <>
                        <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Buy &amp; Download
                      </>
                    )}
                  </button>
                ) : (
                  /* Physical: Add to Cart + Buy Now */
                  <>
                    <button className={`pdp-add-btn${addedToCart ? ' added' : ''}`} onClick={handleAddToCart}>
                      {addedToCart ? (
                        <>
                          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Added!
                        </>
                      ) : (
                        <>
                          <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button className="pdp-buy-btn" disabled={buyingNow} onClick={handleBuyNow}>
                      {buyingNow ? 'Redirecting…' : 'Buy Now'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          {related.length > 0 && (
            <div style={{ marginTop: '5rem' }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '3rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem' }}>You may also like</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
                {related.map(p => (
                  <Link key={p.id} href={`/marketplace/${p.id}`} className="pdp-related-card">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: 120, background: 'rgba(201,168,76,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: 32, height: 32, color: 'rgba(201,168,76,0.2)' }} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18" />
                        </svg>
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '0.4rem' }}>{p.name}</p>
                      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C9A84C' }}>AED {p.price_sar.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </main>

        <Footer />
      </div>
    </>
  );
}
