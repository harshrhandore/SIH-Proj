// =============================================================================
// PerformanceStore — Device Capability & Render State Management
// =============================================================================
// Tracks:
// 1. isLowPerformance (Snapdragon 680 / mid-range mobile flag from benchmark)
// 2. canvasDirty (Dirty flag for static-render mode on low-perf devices)
// 3. benchmarkMs (Elapsed time for 500 canvas arc benchmark)
// =============================================================================

import { create } from 'zustand';

interface PerformanceState {
  isLowPerformance: boolean;
  benchmarkMs: number | null;
  canvasDirty: boolean;
  setBenchmarkResult: (elapsedMs: number) => void;
  setCanvasDirty: (dirty: boolean) => void;
  setLowPerformanceOverride: (isLow: boolean) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  isLowPerformance: false,
  benchmarkMs: null,
  canvasDirty: true,

  setBenchmarkResult: (elapsedMs: number) => {
    // If elapsed time > 20ms, flag as low-performance device
    const isLow = elapsedMs > 20;
    set({
      benchmarkMs: elapsedMs,
      isLowPerformance: isLow,
      canvasDirty: true,
    });
  },

  setCanvasDirty: (dirty: boolean) => set({ canvasDirty: dirty }),

  setLowPerformanceOverride: (isLow: boolean) =>
    set({ isLowPerformance: isLow, canvasDirty: true }),
}));
