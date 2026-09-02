'use client';

// =============================================================================
// CorridorGIS Component — Dynamic Leaflet wrapper for Next.js SSR safety
// =============================================================================

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { BlockProposal, TSR } from '@/types/railway';
import { parseAndValidateGeoJSON } from '@/lib/utils/geojson';
import { CORRIDOR_GEOJSON } from '@/data/geojson/corridorGeoJson';
import type { FeatureCollection } from 'geojson';

// Dynamically import LeafletMapInner with SSR disabled to prevent `window is not defined`
const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 'calc(100vh - 210px)',
        minHeight: 450,
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-panel)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      Loading Corridor GIS Map...
    </div>
  ),
});

interface CorridorGISProps {
  selectedProposal: BlockProposal | null;
  tsrs: TSR[];
}

export default function CorridorGIS({ selectedProposal, tsrs }: CorridorGISProps) {
  const [sanitizedData, setSanitizedData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    // Sanitize GeoJSON
    const validated = parseAndValidateGeoJSON(CORRIDOR_GEOJSON);
    if (validated.isValid && validated.data) {
      setSanitizedData(validated.data);
    }
  }, []);

  return (
    <LeafletMapInner
      sanitizedData={sanitizedData}
      selectedProposal={selectedProposal}
      tsrs={tsrs}
    />
  );
}
