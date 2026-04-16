import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <style>{`
        .nf-root {
          min-height: 100vh;
          background: #0B0B0B;
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1rem;
          position: relative; overflow: hidden;
        }
        .nf-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 60%);
          pointer-events: none;
        }
        .nf-card {
          position: relative; z-index: 10;
          text-align: center; max-width: 480px; width: 100%;
        }
        .nf-code {
          font-size: clamp(6rem, 20vw, 9rem);
          font-weight: 800; line-height: 1;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.04em;
        }
        .nf-title {
          font-size: 1.5rem; font-weight: 700; color: white;
          margin-top: 0.5rem; margin-bottom: 0.75rem;
        }
        .nf-sub {
          font-size: 0.9rem; color: rgba(255,255,255,0.38);
          line-height: 1.6; margin-bottom: 2.5rem;
        }
        .nf-links {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
          justify-content: center;
        }
        .nf-btn-gold {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.5rem; border-radius: 12px;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #0B0B0B;
          background: linear-gradient(135deg, #C9A84C 0%, #E5C76B 55%, #C9A84C 100%);
          text-decoration: none;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .nf-btn-gold:hover { opacity: 0.88; transform: translateY(-2px); }
        .nf-btn-ghost {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.5rem; border-radius: 12px;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          text-decoration: none;
          transition: color 0.25s ease, background 0.25s ease;
        }
        .nf-btn-ghost:hover { color: white; background: rgba(255,255,255,0.07); }
        .nf-divider {
          width: 60px; height: 1px; margin: 2rem auto;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent);
        }
        .nf-nav {
          display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem;
          justify-content: center;
          font-size: 0.75rem; color: rgba(255,255,255,0.25);
        }
        .nf-nav a {
          color: rgba(255,255,255,0.3); text-decoration: none;
          transition: color 0.2s ease;
        }
        .nf-nav a:hover { color: #C9A84C; }
      `}</style>

      <div className="nf-root">
        <div className="nf-glow" />
        <div className="nf-card">
          <div className="nf-code">404</div>
          <h1 className="nf-title">Page Not Found</h1>
          <p className="nf-sub">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="nf-links">
            <Link href="/" className="nf-btn-gold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12 11.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Go Home
            </Link>
            <Link href="/login" className="nf-btn-ghost">
              Sign In
            </Link>
          </div>

          <div className="nf-divider" />

          <nav className="nf-nav" aria-label="Site links">
            <Link href="/programs">Programs</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </>
  );
}
