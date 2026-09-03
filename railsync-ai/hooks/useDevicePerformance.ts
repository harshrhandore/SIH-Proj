'use client';

// =============================================================================
// useDevicePerformance — 30ms Canvas Benchmark on Mount
// =============================================================================
// Renders 500 canvas arc operations in an offscreen canvas.
// If elapsed > 20ms or prefers-reduced-motion is true, flags low-performance mode.
// =============================================================================

import { useEffect } from 'react';
import { usePerformanceStore } from '@/store/performanceStore';

export function useDevicePerformance() {
  const isLowPerformance = usePerformanceStore((s) => s.isLowPerformance);
  const benchmarkMs = usePerformanceStore((s) => s.benchmarkMs);
  const setBenchmarkResult = usePerformanceStore((s) => s.setBenchmarkResult);

  useEffect(() => {
    // Only run once if not already benchmarked
    if (benchmarkMs !== null || typeof window === 'undefined') return;

    // Check prefers-reduced-motion first
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setBenchmarkResult(99); // Force low performance / static mode
      return;
    }

    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = 300;
      offscreen.height = 300;
      const ctx = offscreen.getContext('2d');

      if (!ctx) {
        setBenchmarkResult(0);
        return;
      }

      const start = performance.now();

      // Render 500 arc operations to measure GPU / 2D canvas throughput
      for (let i = 0; i < 500; i++) {
        ctx.beginPath();
        ctx.arc(150, 150, (i % 100) + 1, 0, Math.PI * 2);
        ctx.strokeStyle = '#0284C7';
        ctx.stroke();
      }

      const elapsed = performance.now() - start;
      setBenchmarkResult(elapsed);
    } catch {
      setBenchmarkResult(0);
    }
  }, [benchmarkMs, setBenchmarkResult]);

  return { isLowPerformance, benchmarkMs };
}
