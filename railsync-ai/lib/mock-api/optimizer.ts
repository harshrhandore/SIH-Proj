// =============================================================================
// Mock AI Optimizer API
// =============================================================================
// Simulates XGBoost priority scoring, OR-Tools CP-SAT scheduling,
// and SHAP explainability responses. Latency: 1200-2000ms.
// =============================================================================

import type {
  BlockProposal,
  TrainService,
  OptimizationResult,
  ShapExplanation,
  PunctualityImpact,
  ConflictRecord,
} from '@/types/railway';
import { withLatency } from '@/lib/utils/simulateLatency';

/**
 * Generate a mock SHAP explanation for a proposal's AI priority score.
 */
function generateShapExplanation(
  proposal: BlockProposal,
  trains: TrainService[]
): ShapExplanation {
  const affectedHighPriority = trains.filter(
    (t) =>
      proposal.affectedTrains.includes(t.trainNumber) && t.priority === 1
  );

  return {
    topFeatures: [
      {
        featureName: 'train_priority_weighted_impact',
        featureValue: affectedHighPriority.length,
        shapValue: affectedHighPriority.length > 0 ? -0.15 : 0.08,
        humanLabel: affectedHighPriority.length > 0
          ? `${affectedHighPriority.length} Rajdhani/Shatabdi affected — score reduced`
          : 'No premium services affected — score improved',
      },
      {
        featureName: 'maintenance_urgency_score',
        featureValue: proposal.aiPriorityScore > 0.7 ? 'HIGH' : 'MEDIUM',
        shapValue: 0.22,
        humanLabel: `Maintenance urgency classified as ${proposal.aiPriorityScore > 0.7 ? 'HIGH' : 'MEDIUM'} based on last inspection date and asset condition`,
      },
      {
        featureName: 'block_duration_efficiency',
        featureValue: proposal.requestedDuration,
        shapValue: proposal.requestedDuration <= 90 ? 0.12 : -0.08,
        humanLabel: proposal.requestedDuration <= 90
          ? `${proposal.requestedDuration}-min block is within optimal window`
          : `${proposal.requestedDuration}-min block exceeds optimal 90-min window — consider splitting`,
      },
      {
        featureName: 'joint_block_bundling_savings',
        featureValue: proposal.blockType === 'JOINT' ? 'YES' : 'NO',
        shapValue: proposal.blockType === 'JOINT' ? 0.18 : 0.0,
        humanLabel: proposal.blockType === 'JOINT'
          ? 'Bundling as joint block saves 240 train-minutes of impact vs. separate blocks'
          : 'Single department block — no bundling efficiency gain',
      },
      {
        featureName: 'time_of_day_traffic_density',
        featureValue: 'OFF-PEAK',
        shapValue: 0.09,
        humanLabel: 'Requested window falls in off-peak traffic density period',
      },
    ],
    baseScore: 0.5,
    finalScore: proposal.aiPriorityScore,
    narrativeSummary: `This ${proposal.department} block request at km ${proposal.section.fromKm}–${proposal.section.toKm} has been scored ${proposal.aiPriorityScore.toFixed(2)} by the XGBoost priority model. ${proposal.blockType === 'JOINT' ? 'Bundling as a joint block with OHE and S&T saves approximately 240 train-minutes compared to scheduling separate blocks.' : ''} The primary score driver is maintenance urgency (${proposal.aiPriorityScore > 0.7 ? 'high' : 'moderate'} condition-based need), partially offset by impact on ${affectedHighPriority.length} premium service${affectedHighPriority.length !== 1 ? 's' : ''}.`,
  };
}

/**
 * Generate mock punctuality impact for each affected train.
 */
function generatePunctualityImpact(
  proposal: BlockProposal,
  trains: TrainService[]
): PunctualityImpact[] {
  return proposal.affectedTrains
    .map((tn) => {
      const train = trains.find((t) => t.trainNumber === tn);
      if (!train) return null;

      const baseDelta = Math.ceil(proposal.requestedDuration / 30) + (train.priority === 1 ? 2 : 0);
      const delta = Math.min(baseDelta, proposal.punctualityImpactMinutes + Math.floor(Math.random() * 3));

      return {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        scheduledTime: train.scheduledDeparture,
        predictedTime: new Date(
          new Date(train.scheduledDeparture).getTime() + delta * 60000
        ).toISOString(),
        deltaMinutes: delta,
        priority: train.priority,
      };
    })
    .filter((x): x is PunctualityImpact => x !== null);
}

/**
 * Run the mock AI optimizer (XGBoost + CP-SAT + SHAP).
 * Simulates 1200-2000ms latency.
 */
export async function runOptimizer(
  proposal: BlockProposal,
  allProposals: BlockProposal[],
  trains: TrainService[]
): Promise<{
  success: boolean;
  result?: OptimizationResult;
  error?: string;
}> {
  const explanation = generateShapExplanation(proposal, trains);
  const punctualityImpact = generatePunctualityImpact(proposal, trains);

  // Find proposals that can be bundled (same km range, pending)
  const bundleable = allProposals.filter(
    (p) =>
      p.proposalId !== proposal.proposalId &&
      p.section.fromKm <= proposal.section.toKm &&
      p.section.toKm >= proposal.section.fromKm &&
      (p.status === 'PENDING' || p.status === 'AI_RECOMMENDED')
  );

  const solveTimeMs = Math.floor(Math.random() * (800 - 200 + 1)) + 200;

  const result: OptimizationResult = {
    proposalId: proposal.proposalId,
    recommendedStart: proposal.requestedStart,
    recommendedDuration: proposal.requestedDuration,
    bundledWith: bundleable.map((p) => p.proposalId),
    conflictsResolved: [],
    punctualityImpact,
    solveTimeMs,
    explanation,
  };

  return withLatency({ success: true, result }, 1200, 2000);
}

/**
 * Run disruption simulation — re-optimize after a train delay injection.
 * Returns rescheduled block windows and updated punctuality impacts.
 */
export async function runDisruptionSimulation(
  delayedTrainNumber: string,
  delayMinutes: number,
  affectedProposal: BlockProposal,
  trains: TrainService[]
): Promise<{
  success: boolean;
  result?: OptimizationResult;
  narrative?: string;
  error?: string;
}> {
  const delayedTrain = trains.find((t) => t.trainNumber === delayedTrainNumber);
  if (!delayedTrain) {
    return withLatency(
      { success: false, error: `Train ${delayedTrainNumber} not found` },
      80,
      400
    );
  }

  // Calculate time shift for the block
  const shiftMinutes = Math.ceil(delayMinutes * 0.75); // Block shifts by ~75% of delay

  const newStart = new Date(
    new Date(affectedProposal.requestedStart).getTime() + shiftMinutes * 60000
  ).toISOString();

  const punctualityImpact: PunctualityImpact[] = [
    {
      trainNumber: delayedTrain.trainNumber,
      trainName: delayedTrain.trainName,
      scheduledTime: delayedTrain.scheduledDeparture,
      predictedTime: new Date(
        new Date(delayedTrain.scheduledDeparture).getTime() + delayMinutes * 60000
      ).toISOString(),
      deltaMinutes: delayMinutes,
      priority: delayedTrain.priority,
    },
    ...affectedProposal.affectedTrains
      .filter((tn) => tn !== delayedTrainNumber)
      .slice(0, 3)
      .map((tn) => {
        const train = trains.find((t) => t.trainNumber === tn);
        const cascadeDelta = Math.ceil(delayMinutes * 0.3);
        return {
          trainNumber: tn,
          trainName: train?.trainName || tn,
          scheduledTime: train?.scheduledDeparture || '',
          predictedTime: train
            ? new Date(
                new Date(train.scheduledDeparture).getTime() + cascadeDelta * 60000
              ).toISOString()
            : '',
          deltaMinutes: cascadeDelta,
          priority: (train?.priority || 2) as 1 | 2 | 3,
        };
      }),
  ];

  const solveTimeMs = Math.floor(Math.random() * (800 - 200 + 1)) + 200;

  const explanation = generateShapExplanation(affectedProposal, trains);

  const conflictsResolved: ConflictRecord[] = delayMinutes > 30
    ? [
        {
          conflictId: `CFR-${Date.now()}`,
          proposalIdA: affectedProposal.proposalId,
          proposalIdB: 'TRAIN-PATH',
          overlapKmStart: affectedProposal.section.fromKm,
          overlapKmEnd: affectedProposal.section.toKm,
          overlapTimeStart: affectedProposal.requestedStart,
          overlapTimeEnd: new Date(
            new Date(affectedProposal.requestedStart).getTime() +
              affectedProposal.requestedDuration * 60000
          ).toISOString(),
          resolution: `Block shifted by ${shiftMinutes} minutes to avoid conflict with delayed Train #${delayedTrainNumber}`,
        },
      ]
    : [];

  const result: OptimizationResult = {
    proposalId: affectedProposal.proposalId,
    recommendedStart: newStart,
    recommendedDuration: affectedProposal.requestedDuration,
    bundledWith: [],
    conflictsResolved,
    punctualityImpact,
    solveTimeMs,
    explanation,
  };

  const startTimeStr = new Date(newStart).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  const narrative = `Train #${delayedTrainNumber} (${delayedTrain.trainName}) delay of ${delayMinutes} min has cascaded to km ${affectedProposal.section.fromKm}–${affectedProposal.section.toKm} block. OR-Tools CP-SAT rescheduled ${affectedProposal.department} block from ${new Date(affectedProposal.requestedStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} to ${startTimeStr} IST (${shiftMinutes}-min shift).${affectedProposal.blockType === 'JOINT' ? ' Joint OHE and S&T blocks follow.' : ''} Net punctuality cost: +${punctualityImpact.reduce((sum, p) => sum + p.deltaMinutes, 0)} min across ${punctualityImpact.length} services. Recommended approval by ${new Date(new Date(newStart).getTime() - 45 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST.`;

  return withLatency({ success: true, result, narrative }, 1200, 2000);
}
