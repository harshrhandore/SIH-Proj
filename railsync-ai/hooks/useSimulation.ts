// =============================================================================
// useSimulation Hook
// =============================================================================
// Manages the disruption injection workflow:
// 1. Capture original train delays
// 2. Inject delay on selected train
// 3. Trigger mock optimizer (1200-2000ms)
// 4. Update operational store with results
// 5. Handle timeout (EC-02)
// =============================================================================

'use client';

import { useCallback } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { useOperationalStore } from '@/store/operationalStore';
import { runDisruptionSimulation } from '@/lib/mock-api/optimizer';

export function useSimulation() {
  const {
    selectedTrainNumber,
    delayMinutes,
    status,
    result,
    highImpactAlert,
    highImpactDismissed,
    setSelectedTrain,
    setDelayMinutes,
    startSimulation,
    completeSimulation,
    failSimulation,
    resetSimulation,
    setOriginalDelays,
    dismissHighImpactAlert,
  } = useSimulationStore();

  const trains = useOperationalStore((s) => s.trains);
  const proposals = useOperationalStore((s) => s.proposals);
  const updateTrainDelay = useOperationalStore((s) => s.updateTrainDelay);
  const applyOptimizationResult = useOperationalStore((s) => s.applyOptimizationResult);

  const injectDelay = useCallback(async () => {
    if (!selectedTrainNumber) return;

    // 1. Capture original delays
    const originals: Record<string, number> = {};
    trains.forEach((t) => {
      originals[t.trainNumber] = t.currentDelayMinutes;
    });
    setOriginalDelays(originals);

    // 2. Update train delay in operational store
    updateTrainDelay(selectedTrainNumber, delayMinutes);

    // 3. Start simulation
    startSimulation();

    // 4. Find the most relevant affected proposal
    const affectedProposal = proposals.find(
      (p) =>
        (p.status === 'APPROVED' || p.status === 'ACTIVE' || p.status === 'PENDING') &&
        p.affectedTrains.includes(selectedTrainNumber)
    ) || proposals.find(
      (p) => p.status === 'APPROVED' || p.status === 'ACTIVE'
    );

    if (!affectedProposal) {
      failSimulation('No active or approved block found for rescheduling.');
      return;
    }

    // 5. Set a timeout for EC-02 (2 seconds)
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 4000) // 4s total timeout (API is 1.2-2s)
    );

    // 6. Run optimizer
    try {
      const response = await Promise.race([
        runDisruptionSimulation(
          selectedTrainNumber,
          delayMinutes,
          affectedProposal,
          trains
        ),
        timeoutPromise,
      ]);

      if (!response) {
        failSimulation(
          'Optimizer unavailable — manual review required. Contact ADRM Operations Cell.'
        );
        return;
      }

      if (!response.success || !response.result) {
        failSimulation(response.error || 'Optimization failed.');
        return;
      }

      // 7. Update stores
      completeSimulation(response.result, response.narrative || '');
      applyOptimizationResult(response.result);

      // 8. Update train delays from punctuality impacts
      response.result.punctualityImpact.forEach((impact) => {
        updateTrainDelay(
          impact.trainNumber,
          (originals[impact.trainNumber] || 0) + impact.deltaMinutes
        );
      });
    } catch {
      failSimulation(
        'Optimizer unavailable — manual review required. Contact ADRM Operations Cell.'
      );
    }
  }, [
    selectedTrainNumber,
    delayMinutes,
    trains,
    proposals,
    updateTrainDelay,
    startSimulation,
    completeSimulation,
    failSimulation,
    applyOptimizationResult,
    setOriginalDelays,
  ]);

  return {
    selectedTrainNumber,
    delayMinutes,
    status,
    result,
    highImpactAlert: highImpactAlert && !highImpactDismissed,
    setSelectedTrain,
    setDelayMinutes,
    injectDelay,
    resetSimulation,
    dismissHighImpactAlert,
  };
}
