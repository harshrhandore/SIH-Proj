'use client';

// =============================================================================
// useNavMode — Responsive Navigation Mode Hook
// =============================================================================
// Returns 'desktop' (>=1440px) | 'laptop' (1024px–1439px) | 'mobile' (<1024px)
// Uses ResizeObserver on document.documentElement for debounce-free efficiency.
// =============================================================================

import { useState, useEffect } from 'react';

export type NavMode = 'desktop' | 'laptop' | 'mobile';

export function useNavMode(): NavMode {
  const [navMode, setNavMode] = useState<NavMode>('desktop');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getMode = (width: number): NavMode => {
      if (width >= 1440) return 'desktop';
      if (width >= 1024) return 'laptop';
      return 'mobile';
    };

    // Set initial
    setNavMode(getMode(window.innerWidth));

    // Observe layout changes via ResizeObserver on document root
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setNavMode(getMode(width));
      }
    });

    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return navMode;
}
