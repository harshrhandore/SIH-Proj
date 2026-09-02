'use client';

// =============================================================================
// useMareyDiagram Hook — HTML5 Canvas Time-Distance Renderer
// =============================================================================
// Renders the Marey diagram for the Ghaziabad–Kanpur corridor (km 0 to 412).
// X-axis: Time (6:00 to 24:00 IST)
// Y-axis: Distance (km 0 at Ghaziabad to km 412 at Kanpur Central)
// Smooth rendering with requestAnimationFrame, pan, zoom, and interactive clicks.
// =============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TrainService, BlockProposal, TrackSegment } from '@/types/railway';
import { STATIONS } from '@/data/seed';
import { useThemeStore } from '@/store/themeStore';

interface UseMareyDiagramProps {
  trains: TrainService[];
  proposals: BlockProposal[];
  selectedProposalId: string | null;
  onSelectBlock: (proposalId: string) => void;
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

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1); // 1 = full 18-hour view
  const [panX, setPanX] = useState(0); // in pixels
  const [hoveredBlock, setHoveredBlock] = useState<{
    proposal: BlockProposal;
    x: number;
    y: number;
  } | null>(null);

  // Drag state
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const currentPanXRef = useRef(0);

  // Time domain constants: 6:00 (360 min) to 24:00 (1440 min)
  const START_MINUTE = 6 * 60; // 360
  const END_MINUTE = 24 * 60;  // 1440
  const TOTAL_MINUTES = END_MINUTE - START_MINUTE; // 1080 min (18 hours)
  const TOTAL_KM = 412;

  // Margin configuration
  const MARGIN = { top: 30, right: 30, bottom: 40, left: 110 };

  // Parse ISO date string to minutes since midnight IST
  const getMinutesFromISO = (isoStr: string): number => {
    try {
      const d = new Date(isoStr);
      // Convert to IST
      const istHours = d.getUTCHours() + 5 + Math.floor((d.getUTCMinutes() + 30) / 60);
      const istMinutes = (d.getUTCMinutes() + 30) % 60;
      return (istHours % 24) * 60 + istMinutes;
    } catch {
      return 720;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear background
      ctx.fillStyle = isDark ? '#0B0F17' : '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const plotWidth = width - MARGIN.left - MARGIN.right;
      const plotHeight = height - MARGIN.top - MARGIN.bottom;

      // Coordinate transformers
      const timeToX = (minutes: number) => {
        const normalized = (minutes - START_MINUTE) / TOTAL_MINUTES;
        return MARGIN.left + (normalized * plotWidth * zoom) + panX;
      };

      const kmToY = (km: number) => {
        return MARGIN.top + (km / TOTAL_KM) * plotHeight;
      };

      // 1. Draw station horizontal lines & labels (Y-axis)
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      STATIONS.forEach((station) => {
        const y = kmToY(station.kmMark);

        // Station line
        ctx.strokeStyle = isDark ? '#21262D' : '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MARGIN.left, y);
        ctx.lineTo(width - MARGIN.right, y);
        ctx.stroke();

        // Station label & km
        ctx.fillStyle = isDark ? '#94A3B8' : '#334155';
        ctx.fillText(station.stationName, MARGIN.left - 10, y - 6);
        ctx.fillStyle = isDark ? '#484F58' : '#64748B';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`km ${station.kmMark}`, MARGIN.left - 10, y + 6);
        ctx.font = '11px Inter, sans-serif';
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
          ? (isDark ? '#38455A' : '#CBD5E1')
          : isHour
            ? (isDark ? '#263040' : '#E2E8F0')
            : (isDark ? '#151B26' : '#F1F5F9');
        ctx.lineWidth = is2Hour ? 1.5 : 1;

        ctx.beginPath();
        ctx.moveTo(x, MARGIN.top);
        ctx.lineTo(x, height - MARGIN.bottom);
        ctx.stroke();

        if (isHour) {
          const hour = Math.floor(m / 60);
          ctx.fillStyle = is2Hour
            ? (isDark ? '#F1F5F9' : '#0F172A')
            : (isDark ? '#94A3B8' : '#64748B');
          ctx.font = is2Hour ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
          ctx.fillText(`${hour.toString().padStart(2, '0')}:00`, x, height - MARGIN.bottom + 8);
        }
      }

      // Clip to diagram plot area for blocks and train paths
      ctx.save();
      ctx.beginPath();
      ctx.rect(MARGIN.left, MARGIN.top, plotWidth, plotHeight);
      ctx.clip();

      // 3. Draw Approved Block Windows (#238636 rectangles at 20% opacity)
      proposals
        .filter((p) => p.status === 'APPROVED' || p.status === 'ACTIVE')
        .forEach((p) => {
          const startMin = getMinutesFromISO(p.actualGrantedStart || p.requestedStart);
          const duration = p.actualGrantedDuration || p.requestedDuration;
          const endMin = startMin + duration;

          const x1 = timeToX(startMin);
          const x2 = timeToX(endMin);
          const y1 = kmToY(p.section.fromKm);
          const y2 = kmToY(p.section.toKm);

          const blockW = Math.max(x2 - x1, 4);
          const blockH = Math.max(Math.abs(y2 - y1), 6);
          const blockY = Math.min(y1, y2);

          // Fill
          ctx.fillStyle = isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(21, 128, 61, 0.15)';
          ctx.fillRect(x1, blockY, blockW, blockH);

          // Border
          ctx.strokeStyle = isDark ? '#22C55E' : '#15803D';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x1, blockY, blockW, blockH);

          // Text label
          ctx.fillStyle = isDark ? '#22C55E' : '#15803D';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(`[${p.blockType}] km ${p.section.fromKm}–${p.section.toKm}`, x1 + 6, blockY + 12);
        });

      // 4. Draw Shadow Block Slots (AI-Recommended) — dashed-border
      proposals
        .filter((p) => p.status === 'AI_RECOMMENDED' || p.status === 'PENDING' || p.status === 'UNDER_REVIEW')
        .forEach((p) => {
          const startMin = getMinutesFromISO(p.requestedStart);
          const endMin = startMin + p.requestedDuration;

          const x1 = timeToX(startMin);
          const x2 = timeToX(endMin);
          const y1 = kmToY(p.section.fromKm);
          const y2 = kmToY(p.section.toKm);

          const blockW = Math.max(x2 - x1, 4);
          const blockH = Math.max(Math.abs(y2 - y1), 6);
          const blockY = Math.min(y1, y2);

          const isSelected = selectedProposalId === p.proposalId;

          // Dashed border
          ctx.save();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = isSelected
            ? (isDark ? '#A5D6FF' : '#0284C7')
            : (isDark ? '#38BDF8' : '#0284C7');
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.strokeRect(x1, blockY, blockW, blockH);

          if (isSelected) {
            ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.12)';
            ctx.fillRect(x1, blockY, blockW, blockH);
          }
          ctx.restore();

          // Label
          ctx.fillStyle = isSelected
            ? (isDark ? '#A5D6FF' : '#0284C7')
            : (isDark ? '#38BDF8' : '#0369A1');
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(`AI SLOT ${p.proposalId}`, x1 + 4, blockY + 12);
        });

      // 5. Draw Conflict Zones
      proposals
        .filter((p) => p.status === 'PENDING' && p.aiPriorityScore < 0.5)
        .forEach((p) => {
          const startMin = getMinutesFromISO(p.requestedStart);
          const x1 = timeToX(startMin);
          const x2 = timeToX(startMin + p.requestedDuration);
          const y1 = kmToY(p.section.fromKm);
          const y2 = kmToY(p.section.toKm);

          ctx.fillStyle = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(185, 28, 28, 0.15)';
          ctx.fillRect(x1, Math.min(y1, y2), x2 - x1, Math.abs(y2 - y1));
        });

      // 6. Draw Train Paths
      trains.forEach((train) => {
        const depMin = getMinutesFromISO(train.scheduledDeparture) + train.currentDelayMinutes;
        const arrMin = getMinutesFromISO(train.scheduledArrival) + train.currentDelayMinutes;

        // Path coordinates from GZB (km 0) to CNB (km 412)
        const x1 = timeToX(depMin);
        const y1 = kmToY(0);
        const x2 = timeToX(arrMin);
        const y2 = kmToY(412);

        // Styling by priority
        ctx.save();
        if (train.priority === 1) {
          ctx.strokeStyle = isDark ? '#38BDF8' : '#0284C7'; // P1: bold blue
          ctx.lineWidth = 2.5;
        } else if (train.priority === 2) {
          ctx.strokeStyle = isDark ? '#94A3B8' : '#64748B'; // P2: slate
          ctx.lineWidth = 1.5;
        } else if (train.serviceType === 'ENGINEERING_SPECIAL') {
          ctx.strokeStyle = isDark ? '#F59E0B' : '#B45309'; // Engineering
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
        } else {
          ctx.strokeStyle = isDark ? '#475569' : '#94A3B8'; // Freight / ECS
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 4]);
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Train Number Label rotated along path angle
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        if (midX >= MARGIN.left && midX <= width - MARGIN.right) {
          const angle = Math.atan2(y2 - y1, x2 - x1);
          ctx.translate(midX, midY);
          ctx.rotate(angle);

          ctx.fillStyle = isDark ? '#7DD3FC' : '#0369A1';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(train.trainNumber, 0, -3);

          ctx.rotate(-angle);
          ctx.translate(-midX, -midY);
        }

        ctx.restore();
      });

      ctx.restore(); // Restore clipping
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [trains, proposals, selectedProposalId, zoom, panX, isDark]);

  // Handle Canvas Pan & Zoom Mouse Events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    currentPanXRef.current = panX;
  }, [panX]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current;
      setPanX(currentPanXRef.current + deltaX);
      return;
    }

    // Check hit test for hover tooltip
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const plotWidth = canvas.width - MARGIN.left - MARGIN.right;
    const plotHeight = canvas.height - MARGIN.top - MARGIN.bottom;

    const timeToX = (minutes: number) => {
      const normalized = (minutes - START_MINUTE) / TOTAL_MINUTES;
      return MARGIN.left + (normalized * plotWidth * zoom) + panX;
    };
    const kmToY = (km: number) => MARGIN.top + (km / TOTAL_KM) * plotHeight;

    // Find if hovering over a block proposal
    let found = false;
    for (const p of proposals) {
      const startMin = getMinutesFromISO(p.requestedStart);
      const x1 = timeToX(startMin);
      const x2 = timeToX(startMin + p.requestedDuration);
      const y1 = kmToY(p.section.fromKm);
      const y2 = kmToY(p.section.toKm);

      const blockX = Math.min(x1, x2);
      const blockW = Math.max(Math.abs(x2 - x1), 6);
      const blockY = Math.min(y1, y2);
      const blockH = Math.max(Math.abs(y2 - y1), 6);

      if (
        mouseX >= blockX &&
        mouseX <= blockX + blockW &&
        mouseY >= blockY &&
        mouseY <= blockY + blockH
      ) {
        setHoveredBlock({ proposal: p, x: e.clientX, y: e.clientY });
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredBlock(null);
    }
  }, [panX, zoom, proposals]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.max(0.6, Math.min(4.0, prev * zoomFactor)));
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredBlock) {
      onSelectBlock(hoveredBlock.proposal.proposalId);
    }
  }, [hoveredBlock, onSelectBlock]);

  return {
    canvasRef,
    hoveredBlock,
    zoom,
    setZoom,
    setPanX,
    events: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
      onClick: handleClick,
    },
  };
}
