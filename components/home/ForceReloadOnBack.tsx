'use client';

import { useEffect } from 'react';

// Forces a full page reload when the user navigates back to this page
// via the browser back/forward buttons (bfcache / persisted page).
export default function ForceReloadOnBack() {
  useEffect(() => {
    const handler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handler);
    return () => window.removeEventListener('pageshow', handler);
  }, []);

  return null;
}
