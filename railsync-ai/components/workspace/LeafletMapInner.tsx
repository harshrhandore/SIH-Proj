'use client';

// =============================================================================
// LeafletMapInner — Client-only Leaflet Map renderer
// =============================================================================

import type { BlockProposal, TSR } from '@/types/railway';
import type { FeatureCollection } from 'geojson';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -28],
});

interface LeafletMapInnerProps {
  sanitizedData: FeatureCollection | null;
  selectedProposal: BlockProposal | null;
  tsrs: TSR[];
}

export default function LeafletMapInner({
  sanitizedData,
  selectedProposal,
  tsrs,
}: LeafletMapInnerProps) {
  // Extract station markers and corridor track coordinates from GeoJSON
  const stations = (sanitizedData?.features || [])
    .filter((f) => f.properties?.type === 'station')
    .map((f) => ({
      name: (f.properties?.name as string) || 'Station',
      code: (f.properties?.code as string) || 'STN',
      km: (f.properties?.km as number) || 0,
      coords: [(f.geometry as any).coordinates[1], (f.geometry as any).coordinates[0]] as [number, number],
    }));

  const trackFeature = (sanitizedData?.features || []).find(
    (f) => f.properties?.type === 'rail_line'
  );

  const trackCoords: [number, number][] = trackFeature
    ? ((trackFeature.geometry as any).coordinates as number[][]).map((c) => [c[1], c[0]])
    : [];

  return (
    <div
      style={{
        height: 'calc(100vh - 210px)',
        minHeight: 450,
        borderRadius: 'var(--radius-panel)',
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
        position: 'relative',
      }}
    >
      <MapContainer
        center={[27.3, 78.8]}
        zoom={7}
        maxZoom={12}
        preferCanvas={true}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        closePopupOnClick={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={12}
        />

        {/* Corridor Track Polyline */}
        {trackCoords.length > 0 && (
          <Polyline
            positions={trackCoords}
            pathOptions={{
              color: '#1F6FEB',
              weight: 4,
              opacity: 0.85,
            }}
          />
        )}

        {/* Stations */}
        {stations.map((stn) => (
          <Marker key={stn.code} position={stn.coords} icon={defaultIcon}>
            <Popup>
              <div style={{ color: '#E6EDF3', fontSize: '12px' }}>
                <strong style={{ color: '#1F6FEB' }}>
                  {stn.name} ({stn.code})
                </strong>
                <div style={{ color: '#8B949E', marginTop: 2 }}>Chainage: km {stn.km}</div>
                <div style={{ color: '#8B949E' }}>Division: NR-GZB</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active TSR Circle Overlays */}
        {tsrs
          .filter((t) => t.isActive)
          .map((tsr) => {
            const ratio = tsr.fromKm / 412;
            const lat = 28.6692 - ratio * (28.6692 - 26.4496);
            const lon = 77.4181 + ratio * (80.35 - 77.4181);

            return (
              <CircleMarker
                key={tsr.tsrId}
                center={[lat, lon]}
                radius={10}
                pathOptions={{
                  color: '#D29922',
                  fillColor: '#D29922',
                  fillOpacity: 0.45,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ color: '#E6EDF3', fontSize: '11px', maxWidth: 220 }}>
                    <strong style={{ color: '#D29922' }}>
                      Active TSR: {tsr.speedLimitKmph} km/h
                    </strong>
                    <div style={{ marginTop: 2 }}>
                      Span: km {tsr.fromKm} to km {tsr.toKm}
                    </div>
                    <div style={{ color: '#8B949E', marginTop: 2 }}>Reason: {tsr.reason}</div>
                    <div style={{ color: '#8B949E', marginTop: 2 }}>Order: {tsr.denReference}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      {/* Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 'var(--spacing-3)',
          left: 'var(--spacing-3)',
          background: 'rgba(22, 27, 34, 0.9)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-data)',
          padding: '6px 10px',
          fontSize: '11px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 3, background: '#1F6FEB' }} />
          <span>Double Line Electrified Track (412 km)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D29922' }} />
          <span>Active Speed Restriction (TSR)</span>
        </div>
      </div>
    </div>
  );
}
