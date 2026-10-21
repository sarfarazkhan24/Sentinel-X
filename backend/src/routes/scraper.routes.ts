import { Router, Request, Response } from 'express';
import { regionalScraperService, NearbyMiningActivity } from '../services/RegionalScraperService';

export const scraperRouter = Router();

export { NearbyMiningActivity };

/**
 * GET /api/scraper/nearby-activities
 * 
 * Returns authentic, location-specific mining activity and hazard notices
 * for the monitored quarry cluster (Huluvenahalli–Madapatna–Tavarekere, Karnataka).
 * 
 * Preserves 100% data contract compatibility with the existing SentinelX UI.
 * Optional query parameter: ?refresh=true triggers immediate live news re-fetch.
 */
scraperRouter.get('/nearby-activities', async (req: Request, res: Response) => {
  try {
    const shouldRefresh = req.query.refresh === 'true';
    const result = await regionalScraperService.getNearbyActivities(shouldRefresh);
    return res.json(result);
  } catch (error: any) {
    console.error('[ScraperService] Failed to fetch nearby activities:', error);
    return res.status(500).json({
      error: 'Failed to retrieve regional activities',
      details: error?.message,
    });
  }
});

/**
 * GET /api/scraper/status
 * 
 * Diagnostic endpoint for automated health checks, test runners, and scraper status verification.
 */
scraperRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const report = await regionalScraperService.getStatusReport();
    return res.json({
      status: 'ok',
      report,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});
