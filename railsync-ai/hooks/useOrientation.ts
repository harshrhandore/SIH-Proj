'use client';

// =============================================================================
// useOrientation — Cross-Device Orientation Hook
// =============================================================================
// Returns 'portrait' | 'landscape'
// Updates dynamically on orientationchange event with window resize fallback.
// =============================================================================

import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('landscape');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkOrientation = (): Orientation => {
      if (typeof window.screen !== 'undefined' && window.screen.orientation) {
        return window.screen.orientation.type.includes('portrait')
          ? 'portrait'
          : 'landscape';
      }
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    };

    setOrientation(checkOrientation());

    const handleOrientationChange = () => {
      // 250ms timeout ensures layout reflow finishes before measurement
      setTimeout(() => {
        setOrientation(checkOrientation());
      }, 250);
    };

    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);
    }

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      }
    };
  }, []);

  return orientation;
}
