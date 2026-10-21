/**
 * Regional Mining Activity Monitoring Configuration
 * 
 * Reusable configuration for monitoring quarrying, blasting, excavation,
 * and safety operations in designated industrial mining corridors.
 * 
 * Primary Configured Region:
 * Huluvenahalli–Madapatna–Tavarekere quarry cluster, Karnataka, India.
 */

export interface LandmarkCentroid {
  name: string;
  aliases: string[];
  latitude: number;
  longitude: number;
  tier: 'NEARBY' | 'LOCAL_AREA' | 'REGIONAL';
  approxDistanceKm: number;
  direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
}

export interface MonitoredMiningRegion {
  id: string;
  name: string;
  state: string;
  country: string;
  centerLatitude: number;
  centerLongitude: number;
  defaultMonitoringRadiusKm: number;
  maxMonitoringRadiusKm: number;
  primaryQuarries: string[];
  landmarks: LandmarkCentroid[];
  searchQueries: string[];
}

export const CURRENT_MONITORED_REGION: MonitoredMiningRegion = {
  id: 'REG-KA-BLR-SOUTH-01',
  name: 'Huluvenahalli–Madapatna–Tavarekere Quarry Cluster',
  state: 'Karnataka',
  country: 'India',
  centerLatitude: 12.9302,
  centerLongitude: 77.3495,
  defaultMonitoringRadiusKm: 10.0,
  maxMonitoringRadiusKm: 20.0,
  primaryQuarries: [
    'Basaveshwara Stone Quarry',
    'Udayashankar Kaveri Quarry',
    'Sai Ram Stone Crusher Unit',
    'Huluvenahalli Granite Extraction Pit',
  ],
  landmarks: [
    {
      name: 'Basaveshwara Stone Quarry (Madapatna Pit)',
      aliases: ['basaveshwara', 'basaveshwara quarry', 'basaveshwara stone'],
      latitude: 12.9302,
      longitude: 77.3495,
      tier: 'NEARBY',
      approxDistanceKm: 0.8,
      direction: 'NE',
    },
    {
      name: 'Udayashankar / Kaveri Quarry Area',
      aliases: ['udayashankar', 'kaveri quarry', 'kaveri crusher'],
      latitude: 12.9320,
      longitude: 77.3480,
      tier: 'NEARBY',
      approxDistanceKm: 1.1,
      direction: 'N',
    },
    {
      name: 'Madapatna Quarry Ridge',
      aliases: ['madapatna', 'madapattana', 'madapatna village'],
      latitude: 12.9315,
      longitude: 77.3490,
      tier: 'NEARBY',
      approxDistanceKm: 0.6,
      direction: 'E',
    },
    {
      name: 'Huluvenahalli Quarry Ridge',
      aliases: ['huluvenahalli', 'huluvanehalli', 'huluvenahalli village'],
      latitude: 12.9280,
      longitude: 77.3510,
      tier: 'NEARBY',
      approxDistanceKm: 1.5,
      direction: 'SE',
    },
    {
      name: 'Tavarekere Sub-Division Mining Area',
      aliases: ['tavarekere', 'tavarakere', 'tavarekere hobli'],
      latitude: 12.9420,
      longitude: 77.3650,
      tier: 'NEARBY',
      approxDistanceKm: 2.8,
      direction: 'NE',
    },
    {
      name: 'Kumbalgodu Industrial & Haulage Corridor',
      aliases: ['kumbalgodu', 'kumbalagodu', 'mysuru road corridor'],
      latitude: 12.8900,
      longitude: 77.4400,
      tier: 'LOCAL_AREA',
      approxDistanceKm: 8.5,
      direction: 'SE',
    },
    {
      name: 'Bengaluru South Taluk Mining Perimeter',
      aliases: ['bengaluru south', 'bangalore south', 'kengeri'],
      latitude: 12.8750,
      longitude: 77.4100,
      tier: 'LOCAL_AREA',
      approxDistanceKm: 9.4,
      direction: 'SE',
    },
    {
      name: 'Magadi Road Quarry Transit Route',
      aliases: ['magadi road', 'magadi', 'tavarekere-magadi'],
      latitude: 12.9550,
      longitude: 77.3300,
      tier: 'LOCAL_AREA',
      approxDistanceKm: 7.2,
      direction: 'NW',
    },
    {
      name: 'Ramanagara District Mining Boundary',
      aliases: ['ramanagara', 'ramanagar', 'bidadi', 'channapatna'],
      latitude: 12.7950,
      longitude: 77.3850,
      tier: 'REGIONAL',
      approxDistanceKm: 16.5,
      direction: 'S',
    },
  ],
  searchQueries: [
    'Huluvenahalli quarry',
    'Madapatna quarry',
    'Tavarekere quarry',
    'Bengaluru South quarry accident',
    'Ramanagara stone quarry',
    'Karnataka quarry blasting',
    'Bengaluru quarry boulder collapse',
    'Tavarekere mining buffer zone',
  ],
};

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates geographical great-circle distance between two points in km.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates compass heading direction from reference point to target point.
 */
export function calculateCompassDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' {
  const y = Math.sin(deg2rad(lon2 - lon1)) * Math.cos(deg2rad(lat2));
  const x =
    Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
    Math.sin(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.cos(deg2rad(lon2 - lon1));
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const directions: Array<'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'> = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}
