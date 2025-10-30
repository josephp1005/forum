import type { Request, Response, NextFunction } from 'express';
import { refreshAttentionIndex, fetchIndexData, fetchNarrativeData } from '../services/indexService.js';

export const refreshIndex = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { market_id } = req.params;

    await refreshAttentionIndex(Number(market_id));

    res.status(201).json({ message: `Refreshed index data for market ${market_id}` });
  } catch (error) {
    next(error);
  }
}

export const getIndex = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { market_id } = req.params;
    const { timeframe } = req.query;

    // Validate timeframe parameter
    const validTimeframes = ['3h', '24h', '7d', '30d'];
    const selectedTimeframe = typeof timeframe === 'string' && validTimeframes.includes(timeframe) 
      ? timeframe 
      : '3h'; // Default to 3h

    const indexData = await fetchIndexData(Number(market_id), selectedTimeframe);

    res.status(200).json(indexData);
  } catch (error) {
    next(error);
  }
}

export const getNarrativeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { market_id } = req.params;
    const { timeframe } = req.query;

    // Default to 1d if no timeframe specified
    const selectedTimeframe = typeof timeframe === 'string' ? timeframe : '1d';

    const narrativeData = await fetchNarrativeData(Number(market_id), selectedTimeframe);

    res.status(200).json(narrativeData);
  } catch (error) {
    next(error);
  }
}