// =============================================================================
// Operational Store (Zustand)
// =============================================================================
// Manages: block proposals, train services, TSRs, active block windows,
// and division status. Initialized from seed data.
// =============================================================================

import { create } from 'zustand';
import type {
  BlockProposal,
  TrainService,
  TSR,
  DivisionStatus,
  BlockStatus,
  OptimizationResult,
} from '@/types/railway';
import {
  BLOCK_PROPOSALS,
  TRAIN_SERVICES,
  ACTIVE_TSRS,
  DIVISION_STATUS,
} from '@/data/seed';

interface OperationalStore {
  // State
  proposals: BlockProposal[];
  trains: TrainService[];
  tsrs: TSR[];
  divisionStatus: DivisionStatus;
  selectedProposalId: string | null;
  activeOptimizationResult: OptimizationResult | null;

  // Proposal actions
  setProposals: (proposals: BlockProposal[]) => void;
  updateProposalStatus: (proposalId: string, status: BlockStatus) => void;
  addProposal: (proposal: BlockProposal) => void;
  getProposalById: (proposalId: string) => BlockProposal | undefined;
  selectProposal: (proposalId: string | null) => void;

  // Train actions
  updateTrainDelay: (trainNumber: string, delayMinutes: number) => void;
  resetTrainDelays: () => void;

  // Optimization
  setOptimizationResult: (result: OptimizationResult | null) => void;
  applyOptimizationResult: (result: OptimizationResult) => void;

  // TSR actions
  getTSRsInRange: (fromKm: number, toKm: number) => TSR[];

  // Division status
  updateOpsState: (state: DivisionStatus['opsState']) => void;

  // Computed
  getPendingProposals: () => BlockProposal[];
  getNextApprovedBlock: () => BlockProposal | undefined;
}

export const useOperationalStore = create<OperationalStore>((set, get) => ({
  // Initialize from seed data
  proposals: BLOCK_PROPOSALS,
  trains: TRAIN_SERVICES,
  tsrs: ACTIVE_TSRS,
  divisionStatus: DIVISION_STATUS,
  selectedProposalId: null,
  activeOptimizationResult: null,

  setProposals: (proposals) => set({ proposals }),

  updateProposalStatus: (proposalId, status) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.proposalId === proposalId ? { ...p, status } : p
      ),
    })),

  addProposal: (proposal) =>
    set((state) => ({
      proposals: [...state.proposals, proposal],
    })),

  getProposalById: (proposalId) => {
    return get().proposals.find((p) => p.proposalId === proposalId);
  },

  selectProposal: (proposalId) => set({ selectedProposalId: proposalId }),

  updateTrainDelay: (trainNumber, delayMinutes) =>
    set((state) => ({
      trains: state.trains.map((t) =>
        t.trainNumber === trainNumber
          ? { ...t, currentDelayMinutes: delayMinutes }
          : t
      ),
    })),

  resetTrainDelays: () =>
    set((state) => ({
      trains: state.trains.map((t) => ({
        ...t,
        currentDelayMinutes: TRAIN_SERVICES.find(
          (st) => st.trainNumber === t.trainNumber
        )?.currentDelayMinutes ?? 0,
      })),
    })),

  setOptimizationResult: (result) =>
    set({ activeOptimizationResult: result }),

  applyOptimizationResult: (result) =>
    set((state) => ({
      activeOptimizationResult: result,
      proposals: state.proposals.map((p) => {
        if (p.proposalId === result.proposalId) {
          return {
            ...p,
            actualGrantedStart: result.recommendedStart,
            actualGrantedDuration: result.recommendedDuration,
          };
        }
        return p;
      }),
    })),

  getTSRsInRange: (fromKm, toKm) => {
    return get().tsrs.filter(
      (tsr) => tsr.isActive && tsr.fromKm <= toKm && tsr.toKm >= fromKm
    );
  },

  updateOpsState: (opsState) =>
    set((state) => ({
      divisionStatus: { ...state.divisionStatus, opsState },
    })),

  getPendingProposals: () => {
    return get().proposals.filter(
      (p) => p.status === 'PENDING' || p.status === 'AI_RECOMMENDED' || p.status === 'UNDER_REVIEW'
    );
  },

  getNextApprovedBlock: () => {
    const now = new Date();
    return get()
      .proposals.filter(
        (p) =>
          (p.status === 'APPROVED' || p.status === 'ACTIVE') &&
          p.actualGrantedStart &&
          new Date(p.actualGrantedStart) >= now
      )
      .sort(
        (a, b) =>
          new Date(a.actualGrantedStart!).getTime() -
          new Date(b.actualGrantedStart!).getTime()
      )[0];
  },
}));
