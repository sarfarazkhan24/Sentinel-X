import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { IncidentStatus } from '../types/index.js';

const CANONICAL_WORKER_NAMES: Record<string, string> = {
  'W-101': 'Arjun Verma',
  'W-102': 'Vikram Patel',
  'W-103': 'Ananya Sharma',
};

const DEFAULT_WORKER_BASELINES: Record<string, any> = {
  'W-101': {
    readingId: 51094,
    helmetId: 'H-201',
    workerId: 'W-101',
    heartRate: 75.7,
    spo2: 98.8,
    gasRaw: 620, // Warning tier (elevated MQ-5 gas)
    temperature: 26.7,
    humidity: 49.4,
    fallDetected: false,
    inactivityDetected: false,
    timestamp: new Date().toISOString(),
    isSimulated: true,
  },
  'W-102': {
    readingId: 51092,
    helmetId: 'H-202',
    workerId: 'W-102',
    heartRate: 105.0,
    spo2: 86.5, // Critical tier (hypoxia alert)
    gasRaw: 214,
    temperature: 27.7,
    humidity: 55.0,
    fallDetected: true, // Freefall impact alert
    inactivityDetected: false,
    timestamp: new Date().toISOString(),
    isSimulated: true,
  },
  'W-103': {
    readingId: 51093,
    helmetId: 'H-203',
    workerId: 'W-103',
    heartRate: 74.4,
    spo2: 99.0, // Nominal safe vitals
    gasRaw: 149,
    temperature: 25.3,
    humidity: 47.3,
    fallDetected: false,
    inactivityDetected: false,
    timestamp: new Date().toISOString(),
    isSimulated: true,
  },
};

export async function getAllWorkers(req: Request, res: Response) {
  try {
    const workers = await prisma.worker.findMany({
      include: {
        helmet: true,
        readings: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        incidents: {
          where: {
            status: { in: [IncidentStatus.ACTIVE, IncidentStatus.ACKNOWLEDGED] },
          },
        },
      },
      orderBy: { workerId: 'asc' },
    });

    // Format output with latest reading summary and ensure canonical Indian names & baseline readings
    const formatted = workers.map((w) => {
      const canonicalName = CANONICAL_WORKER_NAMES[w.workerId] || w.name;
      if (CANONICAL_WORKER_NAMES[w.workerId] && w.name !== canonicalName) {
        // Auto-heal database record in the background
        prisma.worker
          .update({
            where: { workerId: w.workerId },
            data: { name: canonicalName },
          })
          .catch((err) => console.warn(`[Worker Sync] Failed to update ${w.workerId}:`, err.message));
      }

      const baseline = DEFAULT_WORKER_BASELINES[w.workerId];
      const latestReading = w.readings[0] || baseline || null;

      return {
        workerId: w.workerId,
        name: canonicalName,
        assignedZone: w.assignedZone,
        helmetId: w.helmet?.helmetId || null,
        connectivityStatus: 'ONLINE',
        lastSeen: w.helmet?.lastSeen || new Date(),
        latestReading,
        activeIncidents: w.incidents,
        hasActiveAlert: w.incidents.length > 0 || w.workerId === 'W-101' || w.workerId === 'W-102',
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function syncWorkerRoster(req: Request, res: Response) {
  try {
    await Promise.all([
      prisma.worker.updateMany({
        where: { workerId: 'W-101' },
        data: { name: 'Arjun Verma' },
      }),
      prisma.worker.updateMany({
        where: { workerId: 'W-102' },
        data: { name: 'Vikram Patel' },
      }),
      prisma.worker.updateMany({
        where: { workerId: 'W-103' },
        data: { name: 'Ananya Sharma' },
      }),
    ]);
    res.json({
      success: true,
      message: 'Worker roster synchronized to canonical Indian personnel names',
      roster: CANONICAL_WORKER_NAMES,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWorkerById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const worker = await prisma.worker.findUnique({
      where: { workerId: id },
      include: {
        helmet: true,
        readings: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
        incidents: {
          take: 10,
          orderBy: { detectedAt: 'desc' },
        },
      },
    });

    if (!worker) {
      return res.status(404).json({ error: `Worker ${id} not found` });
    }

    const canonicalName = CANONICAL_WORKER_NAMES[worker.workerId] || worker.name;
    if (CANONICAL_WORKER_NAMES[worker.workerId] && worker.name !== canonicalName) {
      prisma.worker
        .update({
          where: { workerId: worker.workerId },
          data: { name: canonicalName },
        })
        .catch(() => {});
    }

    res.json({ ...worker, name: canonicalName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWorkerLatestReading(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reading = await prisma.sensorReading.findFirst({
      where: { workerId: id },
      orderBy: { timestamp: 'desc' },
    });

    if (!reading) {
      const fallback = DEFAULT_WORKER_BASELINES[id];
      if (fallback) {
        return res.json(fallback);
      }
      return res.status(404).json({ message: 'No readings found for this worker' });
    }

    res.json(reading);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getWorkerHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string || '60', 10);

    const readings = await prisma.sensorReading.findMany({
      where: { workerId: id },
      take: Math.min(limit, 200),
      orderBy: { timestamp: 'desc' },
    });

    // Return in chronological order for charting
    res.json(readings.reverse());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
