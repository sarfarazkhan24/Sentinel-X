import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  calculateCompassDirection,
  CURRENT_MONITORED_REGION,
} from '../src/config/regionalMonitoring.config';
import { regionalScraperService } from '../src/services/RegionalScraperService';

describe('Regional Scraper Module', () => {
  it('calculates accurate Haversine distance and bearing from quarry center', () => {
    // Madapatna center (12.9302° N, 77.3495° E)
    const lat1 = CURRENT_MONITORED_REGION.centerLatitude;
    const lon1 = CURRENT_MONITORED_REGION.centerLongitude;

    // Test a point ~1.1 km North (Udayashankar / Kaveri area)
    const lat2 = 12.9402;
    const lon2 = 77.3495;

    const distance = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(1.0);
    expect(distance).toBeLessThan(1.2);

    const direction = calculateCompassDirection(lat1, lon1, lat2, lon2);
    expect(direction).toBe('N');
  });

  it('correctly configures the Huluvenahalli-Madapatna target mining region', () => {
    expect(CURRENT_MONITORED_REGION.name).toContain('Huluvenahalli');
    expect(CURRENT_MONITORED_REGION.name).toContain('Madapatna');
    expect(CURRENT_MONITORED_REGION.name).toContain('Tavarekere');
    expect(CURRENT_MONITORED_REGION.defaultMonitoringRadiusKm).toBe(10);
    expect(CURRENT_MONITORED_REGION.landmarks.length).toBeGreaterThan(5);
  });

  it('retrieves activities conforming to the frontend contract', async () => {
    const data = await regionalScraperService.getNearbyActivities();

    expect(data.status).toBe('ok');
    expect(data.region).toBe(CURRENT_MONITORED_REGION.name);
    expect(Array.isArray(data.activities)).toBe(true);
    expect(data.activities.length).toBeGreaterThan(0);

    const first = data.activities[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('company');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('distanceKm');
    expect(first).toHaveProperty('direction');
    expect(first).toHaveProperty('coordinates');
    expect(first).toHaveProperty('riskLevel');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('impactDescription');
    expect(first).toHaveProperty('source');
    expect(first).toHaveProperty('timestamp');

    // Valid categories according to frontend contract
    const validCategories = [
      'Blasting',
      'Excavation',
      'Heavy Transport',
      'Drilling',
      'Structural Concrete',
    ];
    expect(validCategories).toContain(first.category);

    // Valid directions
    const validDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    expect(validDirections).toContain(first.direction);

    // Valid risk levels
    expect(['LOW', 'MODERATE', 'HIGH']).toContain(first.riskLevel);
  });

  it('ranks higher-relevance / nearby hazards higher in results', async () => {
    const data = await regionalScraperService.getNearbyActivities();
    if (data.activities.length >= 2) {
      const top1 = data.activities[0];
      const top2 = data.activities[1];
      if (top1.relevanceScore !== undefined && top2.relevanceScore !== undefined) {
        expect(top1.relevanceScore).toBeGreaterThanOrEqual(top2.relevanceScore);
      }
    }
  });

  it('provides status diagnostics report', async () => {
    const report = await regionalScraperService.getStatusReport();
    expect(report).toHaveProperty('region');
    expect(report).toHaveProperty('itemsStored');
    expect(report.itemsStored).toBeGreaterThan(0);
    expect(report.monitoringRadiusKm).toBe(10);
  });
});
