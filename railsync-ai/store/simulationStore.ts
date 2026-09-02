// =============================================================================
// Simulation Store (Zustand)
// =============================================================================
// Manages: disruption simulation state, delay injection parameters,
// optimization results, and cross-page state updates.
// =============================================================================

import { create } from 'zustand';
import type { OptimizationResult, PunctualityImpact } from '@/types/railway';

export type SimulationStatus = 'idle' | 'running' | 'complete' | 'error';

interface SimulationState {
  // Simulation parameters
  selectedTrainNumber: string | null;
  delayMinutes: number;
  status: SimulationStatus;

  // Results
  result: OptimizationResult | null;
  punctualityImpacts: PunctualityImpact[];
  narrativeSummary: string;
  solveTimeMs: number;
  errorMessage: string | null;

  // Before/after state for visualization
  originalDelays: Record<string, number>; // trainNumber → original delay

  // High-impact alert
  highImpactAlert: boolean;
  highImpactDismissed: boolean;

  // Actions
  setSelectedTrain: (trainNumber: string | null) => void;
  setDelayMinutes: (minutes: number) => void;
  startSimulation: () => void;
  completeSimulation: (
    result: OptimizationResult,
    narrative: string
  ) => void;
  failSimulation: (error: string) => void;
  resetSimulation: () => void;
  setOriginalDelays: (delays: Record<string, number>) => void;
  dismissHighImpactAlert: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  selectedTrainNumber: null,
  delayMinutes: 30,
  status: 'idle',
  result: null,
  punctualityImpacts: [],
  narrativeSummary: '',
  solveTimeMs: 0,
  errorMessage: null,
  originalDelays: {},
  highImpactAlert: false,
  highImpactDismissed: false,

  setSelectedTrain: (trainNumber) => set({ selectedTrainNumber: trainNumber }),
  setDelayMinutes: (minutes) => set({ delayMinutes: minutes }),

  startSimulation: () =>
    set({
      status: 'running',
      result: null,
      errorMessage: null,
      highImpactAlert: false,
      highImpactDismissed: false,
    }),

  completeSimulation: (result, narrative) =>
    set((state) => ({
      status: 'complete',
      result,
      punctualityImpacts: result.punctualityImpact,
      narrativeSummary: narrative,
      solveTimeMs: result.solveTimeMs,
      highImpactAlert: state.delayMinutes > 60,
    })),

  failSimulation: (error) =>
    set({
      status: 'error',
      errorMessage: error,
    }),

  resetSimulation: () =>
    set({
      status: 'idle',
      result: null,
      punctualityImpacts: [],
      narrativeSummary: '',
      solveTimeMs: 0,
      errorMessage: null,
      highImpactAlert: false,
      highImpactDismissed: false,
    }),

  setOriginalDelays: (delays) => set({ originalDelays: delays }),

  dismissHighImpactAlert: () => set({ highImpactDismissed: true }),
}));
