// =============================================================================
// GeoJSON Validation & Sanitization Utility
// =============================================================================
// Validates GeoJSON input for the Ghaziabad–Kanpur corridor display.
// Enforces coordinate bounds for India, feature count limits, and strips
// any embedded script injections from properties.
// =============================================================================

import type { FeatureCollection, Feature, Geometry, Position } from 'geojson';

// India geographic bounds
const INDIA_BOUNDS = {
  latMin: 8,
  latMax: 37,
  lonMin: 68,
  lonMax: 97,
} as const;

const MAX_FEATURE_COUNT = 500;

export interface GeoJSONValidationResult {
  isValid: boolean;
  data: FeatureCollection | null;
  errors: string[];
  warnings: string[];
}

/**
 * Parse, validate, and sanitize GeoJSON input for rail corridor display.
 *
 * Validates:
 * - Valid JSON structure
 * - FeatureCollection type
 * - Coordinate bounds within India (lat 8–37, lon 68–97)
 * - Feature count ≤ 500
 * - No embedded scripts in properties
 */
export function parseAndValidateGeoJSON(
  raw: string | object
): GeoJSONValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Parse if string
  let parsed: unknown;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { isValid: false, data: null, errors: ['Invalid JSON'], warnings };
    }
  } else {
    parsed = raw;
  }

  // 2. Validate GeoJSON structure
  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      data: null,
      errors: ['Input is not an object'],
      warnings,
    };
  }

  const geojson = parsed as Record<string, unknown>;

  if (geojson.type !== 'FeatureCollection') {
    return {
      isValid: false,
      data: null,
      errors: [`Expected FeatureCollection, got: ${geojson.type}`],
      warnings,
    };
  }

  if (!Array.isArray(geojson.features)) {
    return {
      isValid: false,
      data: null,
      errors: ['Missing features array'],
      warnings,
    };
  }

  // 3. Check feature count
  if (geojson.features.length > MAX_FEATURE_COUNT) {
    return {
      isValid: false,
      data: null,
      errors: [
        `Feature count ${geojson.features.length} exceeds maximum ${MAX_FEATURE_COUNT}`,
      ],
      warnings,
    };
  }

  // 4. Validate each feature
  const sanitizedFeatures: Feature[] = [];

  for (let i = 0; i < geojson.features.length; i++) {
    const feature = geojson.features[i] as Record<string, unknown>;

    if (!feature || feature.type !== 'Feature') {
      warnings.push(`Feature ${i}: not a valid Feature object, skipping`);
      continue;
    }

    // 4a. Validate geometry coordinates
    const geometry = feature.geometry as Geometry | null;
    if (geometry) {
      const coordErrors = validateCoordinates(geometry, i);
      if (coordErrors.length > 0) {
        errors.push(...coordErrors);
      }
    }

    // 4b. Sanitize properties (strip script injections)
    const sanitizedProps = sanitizeProperties(
      (feature.properties as Record<string, unknown>) || {}
    );

    sanitizedFeatures.push({
      type: 'Feature',
      geometry: geometry as Geometry,
      properties: sanitizedProps,
    });
  }

  if (errors.length > 0) {
    return { isValid: false, data: null, errors, warnings };
  }

  const result: FeatureCollection = {
    type: 'FeatureCollection',
    features: sanitizedFeatures,
  };

  return { isValid: true, data: result, errors, warnings };
}

/**
 * Recursively validate that all coordinates fall within India bounds.
 */
function validateCoordinates(
  geometry: Geometry,
  featureIndex: number
): string[] {
  const errors: string[] = [];
  const coords = extractCoordinates(geometry);

  for (const [lon, lat] of coords) {
    if (
      lat < INDIA_BOUNDS.latMin ||
      lat > INDIA_BOUNDS.latMax ||
      lon < INDIA_BOUNDS.lonMin ||
      lon > INDIA_BOUNDS.lonMax
    ) {
      errors.push(
        `Feature ${featureIndex}: coordinate [${lon}, ${lat}] is outside India bounds`
      );
      break; // Report first violation only per feature
    }
  }

  return errors;
}

/**
 * Extract all coordinate pairs from any geometry type.
 */
function extractCoordinates(geometry: Geometry): Position[] {
  switch (geometry.type) {
    case 'Point':
      return [geometry.coordinates];
    case 'MultiPoint':
    case 'LineString':
      return geometry.coordinates;
    case 'MultiLineString':
    case 'Polygon':
      return geometry.coordinates.flat();
    case 'MultiPolygon':
      return geometry.coordinates.flat(2);
    case 'GeometryCollection':
      return geometry.geometries.flatMap(extractCoordinates);
    default:
      return [];
  }
}

/**
 * Sanitize GeoJSON properties by stripping script-like content from strings.
 */
function sanitizeProperties(
  props: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      // Strip HTML tags, javascript: protocol, event handlers
      let clean = value.replace(/<\/?[^>]+(>|$)/gi, '');
      clean = clean.replace(/javascript\s*:/gi, '');
      clean = clean.replace(/\bon\w+\s*=/gi, '');
      sanitized[key] = clean;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeProperties(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
