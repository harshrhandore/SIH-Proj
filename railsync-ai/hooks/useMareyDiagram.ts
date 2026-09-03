'use client';

// =============================================================================
// useMareyDiagram Hook — Interactive HTML5 Canvas Renderer
// =============================================================================
// Pointer Events API implementation:
// - Single-pointer drag pan with momentum decay (0.92/frame)
// - Two-pointer pinch-to-zoom anchored to touch midpoint
// - Tap detection (<8px move) with 20px radius hit testing
// - Train path tap tooltip
// - DPR-aware canvas scaling
// - Low-performance / reduced-motion dirty flag rendering
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TrainService, BlockProposal } from '@/types/railway';
import { useThemeStore } from '@/store/themeStore';
import { usePerformanceStore } from '@/store/performanceStore';

interface UseMareyDiagramProps {
  trains: TrainService[];
  proposals: BlockProposal[];
  selectedProposalId: string | null;
  onSelectBlock: (proposalId: string) => void;
}

export interface HoveredBlockState {
  proposal: BlockProposal;
  x: number;
  y: number;
}

export interface SelectedTrainState {
  train: TrainService;
  x: number;
  y: number;
}

// 8 Corridor Stations along Ghaziabad – Kanpur Central (412 km)
const STATIONS = [
  { code: 'GZB', stationName: 'Ghaziabad', kmMark: 0 },
  { code: 'ALJN', stationName: 'Aligarh Jn', kmMark: 106 },
  { code: 'TDL', stationName: 'Tundla Jn', kmMark: 205 },
  { code: 'SKB', stationName: 'Shikohabad', kmMark: 241 },
  { code: 'ETW', stationName: 'Etawah Jn', kmMark: 297 },
  { code: 'PHD', stationName: 'Phaphund', kmMark: 352 },
  { code: 'RURA', stationName: 'Rura', kmMark: 385 },
  { code: 'CNB', stationName: 'Kanpur Central', kmMark: 412 },
];

const TOTAL_KM = 412;
const START_MINUTE = 0; // 00:00 IST
const END_MINUTE = 1440; // 24:00 IST
const TOTAL_MINUTES = 1440;

function getMinutesFromISO(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

function formatMinutesToTime(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes)) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function useMareyDiagram({
  trains,
  proposals,
  selectedProposalId,
  onSelectBlock,
}: UseMareyDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const isLowPerformance = usePerformanceStore((s) => s.isLowPerformance);
  const canvasDirty = usePerformanceStore((s) => s.canvasDirty);
  const setCanvasDirty = usePerformanceStore((s) => s.setCanvasDirty);

  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [hoveredBlock, setHoveredBlock] = useState<HoveredBlockState | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<SelectedTrainState | null>(null);

  // Multi-pointer tracking
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartRef = useRef<{ x: number; y: number; initialPan: number } | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);

  // Momentum velocity
  const velocityRef = useRef<number>(0);
  const lastPanTimeRef = useRef<number>(0);
  const lastPanXRef = useRef<number>(0);
  const momentumAnimRef = useRef<number | null>(null);

  // Margins responsive
  const getMargin = useCallback((canvasWidth: number) => {
    const isNarrow = canvasWidth < 600;
    return {
      top: 40,
      bottom: 30,
      left: isNarrow ? 65 : 90,
      right: isNarrow ? 20 : 30,
    };
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const MARGIN = getMargin(width);

      // Clear background
      ctx.fillStyle = isDark ? '#0B0F17' : '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const plotWidth = width - MARGIN.left - MARGIN.right;
      const plotHeight = height - MARGIN.top - MARGIN.bottom;

      // Coordinate transformers
      const timeToX = (minutes: number) => {
        const normalized = (minutes - START_MINUTE) / TOTAL_MINUTES;
        return MARGIN.left + normalized * plotWidth * zoom + panX;
      };

      const kmToY = (km: number) => {
        return MARGIN.top + (km / TOTAL_KM) * plotHeight;
      };

      // 1. Draw station horizontal lines & labels (Y-axis)
      ctx.font = width < 500 ? '9px Inter, sans-serif' : '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      STATIONS.forEach((station) => {
        const y = kmToY(station.kmMark);

        ctx.strokeStyle = isDark ? '#21262D' : '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MARGIN.left, y);
        ctx.lineTo(width - MARGIN.right, y);
        ctx.stroke();

        ctx.fillStyle = isDark ? '#94A3B8' : '#334155';
        ctx.fillText(station.stationName, MARGIN.left - 6, y - 5);
        ctx.fillStyle = isDark ? '#484F58' : '#64748B';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(`km ${station.kmMark}`, MARGIN.left - 6, y + 6);
        ctx.font = width < 500 ? '9px Inter, sans-serif' : '11px Inter, sans-serif';
      });

      // 2. Draw time vertical lines & labels (X-axis)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let m = START_MINUTE; m <= END_MINUTE; m += 30) {
        const x = timeToX(m);
        if (x < MARGIN.left || x > width - MARGIN.right) continue;

        const isHour = m % 60 === 0;
        const is2Hour = m % 120 === 0;

        ctx.strokeStyle = is2Hour
          ? isDark
            ? '#38455A'
            : '#CBD5E1'
          : isHour
            ? isDark
              ? '#263040'
              : '#E2E8F0'
            : isDark
              ? '#151B26'
              : '#F1F5F9';
        ctx.lineWidth = is2Hour ? 1.5 : 1;

        ctx.beginPath();
        ctx.moveTo(x, MARGIN.top);
        ctx.lineTo(x, height - MARGIN.bottom);
        ctx.stroke();

        if (isHour) {
          ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(formatMinutesToTime(m), x, MARGIN.top - 20);
        }
      }

      // Clip plot area for dynamic items
      ctx.save();
      ctx.beginPath();
      ctx.rect(MARGIN.left, MARGIN.top, plotWidth, plotHeight);
      ctx.clip();

      // 3. Draw Conflict Translucent Overlays
      proposals.forEach((p) => {
        if (p.affectedTrains && p.affectedTrains.length > 0 && p.status === 'UNDER_REVIEW') {
          const startMin = getMinutesFromISO(p.requestedStart);
          const x1 = timeToX(startMin);
          const x2 = timeToX(startMin + p.requestedDuration);
          const y1 = kmToY(p.section.fromKm);
          const y2 = kmToY(p.section.toKm);

          // Low-performance devices render solid without composite blending
          if (isLowPerformance) {
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
          } else {
            ctx.fillStyle = isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.15)';
            ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
          }
        }
      });

      // 4. Draw Shadow Block Proposals
      proposals.forEach((p) => {
        const startMin = getMinutesFromISO(p.requestedStart);
        const x1 = timeToX(startMin);
        const x2 = timeToX(startMin + p.requestedDuration);
        const y1 = kmToY(p.section.fromKm);
        const y2 = kmToY(p.section.toKm);

        const isSelected = selectedProposalId === p.proposalId;
        const isRecommended = p.status === 'AI_RECOMMENDED';
        const isApproved = p.status === 'APPROVED';

        let fillColor = isDark ? 'rgba(180, 83, 9, 0.25)' : 'rgba(180, 83, 9, 0.18)';
        let strokeColor = '#B45309';

        if (isApproved) {
          fillColor = isDark ? 'rgba(21, 128, 61, 0.25)' : 'rgba(21, 128, 61, 0.18)';
          strokeColor = '#15803D';
        } else if (isRecommended) {
          fillColor = isDark ? 'rgba(2, 132, 199, 0.25)' : 'rgba(2, 132, 199, 0.18)';
          strokeColor = '#0284C7';
        }

        const rectX = Math.min(x1, x2);
        const rectY = Math.min(y1, y2);
        const rectW = Math.max(Math.abs(x2 - x1), 8);
        const rectH = Math.max(Math.abs(y2 - y1), 8);

        ctx.fillStyle = fillColor;
        ctx.fillRect(rectX, rectY, rectW, rectH);

        ctx.strokeStyle = isSelected ? '#38BDF8' : strokeColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        if (!isApproved) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.strokeRect(rectX, rectY, rectW, rectH);
        ctx.setLineDash([]);

        // Label
        if (rectW > 24) {
          ctx.fillStyle = isDark ? '#F1F5F9' : '#0F172A';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(p.department, rectX + 4, rectY + 12);
        }
      });

      // 5. Draw Train Paths
      trains.forEach((train) => {
        const depMin = getMinutesFromISO(train.scheduledDeparture) + train.currentDelayMinutes;
        const arrMin = getMinutesFromISO(train.scheduledArrival) + train.currentDelayMinutes;

        const x1 = timeToX(depMin);
        const y1 = kmToY(0);
        const x2 = timeToX(arrMin);
        const y2 = kmToY(412);

        ctx.save();
        if (train.priority === 1) {
          ctx.strokeStyle = isDark ? '#38BDF8' : '#0284C7';
          ctx.lineWidth = 2.5;
        } else if (train.priority === 2) {
          ctx.strokeStyle = isDark ? '#94A3B8' : '#64748B';
          ctx.lineWidth = 1.5;
        } else if (train.serviceType === 'ENGINEERING_SPECIAL') {
          ctx.strokeStyle = isDark ? '#F59E0B' : '#B45309';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
        } else {
          ctx.strokeStyle = isDark ? '#475569' : '#94A3B8';
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 4]);
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Path Labels (skipped on low-performance devices if benchmark elapsed > 20ms)
        if (!isLowPerformance) {
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          if (midX >= MARGIN.left && midX <= width - MARGIN.right) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.translate(midX, midY);
            ctx.rotate(angle);

            ctx.fillStyle = isDark ? '#7DD3FC' : '#0369A1';
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(train.trainNumber, 0, -2);

            ctx.rotate(-angle);
            ctx.translate(-midX, -midY);
          }
        }

        ctx.restore();
      });

      ctx.restore(); // Restore clipping
      ctx.restore(); // Restore DPR scale
      setCanvasDirty(false);

      if (!isLowPerformance) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [trains, proposals, selectedProposalId, zoom, panX, isDark, isLowPerformance, canvasDirty, getMargin, setCanvasDirty]);

  // Pointer Events API Implementation
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(e.pointerId);
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };

      // Single pointer pan start
      if (activePointersRef.current.size === 1) {
        dragStartRef.current = { x: e.clientX, y: e.clientY, initialPan: panX };
        lastPanTimeRef.current = performance.now();
        lastPanXRef.current = e.clientX;
        velocityRef.current = 0;

        if (momentumAnimRef.current) {
          cancelAnimationFrame(momentumAnimRef.current);
          momentumAnimRef.current = null;
        }
      } else if (activePointersRef.current.size === 2) {
        // Two-pointer pinch zoom start
        const pts = Array.from(activePointersRef.current.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchDistanceRef.current = dist;
      }
    },
    [panX]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Two-pointer Pinch Zoom
      if (activePointersRef.current.size === 2 && pinchDistanceRef.current) {
        const pts = Array.from(activePointersRef.current.values());
        const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const factor = newDist / pinchDistanceRef.current;

        setZoom((prev) => Math.max(0.6, Math.min(4.0, prev * factor)));
        pinchDistanceRef.current = newDist;
        return;
      }

      // Single pointer Pan
      if (activePointersRef.current.size === 1 && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const now = performance.now();
        const dt = now - lastPanTimeRef.current;

        if (dt > 10) {
          const dx = e.clientX - lastPanXRef.current;
          velocityRef.current = dx / dt;
          lastPanTimeRef.current = now;
          lastPanXRef.current = e.clientX;
        }

        setPanX(dragStartRef.current.initialPan + deltaX);
        return;
      }
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (canvas && canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }

      // Check for tap (< 8px movement)
      if (pointerDownPosRef.current) {
        const dist = Math.hypot(
          e.clientX - pointerDownPosRef.current.x,
          e.clientY - pointerDownPosRef.current.y
        );

        if (dist < 8) {
          // Tap detected! Hit-test shadow blocks with 20px radius
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const tapX = e.clientX - rect.left;
            const tapY = e.clientY - rect.top;

            const MARGIN = getMargin(canvas.clientWidth);
            const plotWidth = canvas.clientWidth - MARGIN.left - MARGIN.right;
            const plotHeight = canvas.clientHeight - MARGIN.top - MARGIN.bottom;

            const timeToX = (minutes: number) => {
              const normalized = (minutes - START_MINUTE) / TOTAL_MINUTES;
              return MARGIN.left + normalized * plotWidth * zoom + panX;
            };
            const kmToY = (km: number) => MARGIN.top + (km / TOTAL_KM) * plotHeight;

            let selectedBlock = false;
            for (const p of proposals) {
              const startMin = getMinutesFromISO(p.requestedStart);
              const x1 = timeToX(startMin);
              const x2 = timeToX(startMin + p.requestedDuration);
              const y1 = kmToY(p.section.fromKm);
              const y2 = kmToY(p.section.toKm);

              const blockX = Math.min(x1, x2) - 20; // 20px expanded tap zone
              const blockW = Math.max(Math.abs(x2 - x1), 8) + 40;
              const blockY = Math.min(y1, y2) - 20;
              const blockH = Math.max(Math.abs(y2 - y1), 8) + 40;

              if (tapX >= blockX && tapX <= blockX + blockW && tapY >= blockY && tapY <= blockY + blockH) {
                onSelectBlock(p.proposalId);
                selectedBlock = true;
                break;
              }
            }

            // If not a block tap, check if tapping a train path
            if (!selectedBlock) {
              let foundTrain = false;
              for (const t of trains) {
                const depMin = getMinutesFromISO(t.scheduledDeparture) + t.currentDelayMinutes;
                const arrMin = getMinutesFromISO(t.scheduledArrival) + t.currentDelayMinutes;
                const x1 = timeToX(depMin);
                const y1 = kmToY(0);
                const x2 = timeToX(arrMin);
                const y2 = kmToY(412);

                // Distance from tap point to line segment
                const d = distToSegment(tapX, tapY, x1, y1, x2, y2);
                if (d < 16) {
                  setSelectedTrain({ train: t, x: e.clientX, y: e.clientY });
                  foundTrain = true;
                  break;
                }
              }

              if (!foundTrain) {
                setSelectedTrain(null);
              }
            }
          }
        }
      }

      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size === 0) {
        dragStartRef.current = null;
        pointerDownPosRef.current = null;
        pinchDistanceRef.current = null;

        // Apply momentum scroll
        if (Math.abs(velocityRef.current) > 0.2) {
          let currentVelocity = velocityRef.current * 16;
          const applyMomentum = () => {
            currentVelocity *= 0.92;
            if (Math.abs(currentVelocity) > 0.5) {
              setPanX((prev) => prev + currentVelocity);
              momentumAnimRef.current = requestAnimationFrame(applyMomentum);
            }
          };
          momentumAnimRef.current = requestAnimationFrame(applyMomentum);
        }
      }
    },
    [getMargin, zoom, panX, proposals, trains, onSelectBlock]
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.max(0.6, Math.min(4.0, prev * zoomFactor)));
  }, []);

  return {
    canvasRef,
    hoveredBlock,
    selectedTrain,
    setSelectedTrain,
    zoom,
    setZoom,
    setPanX,
    events: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onWheel: handleWheel,
    },
  };
}

// Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}
