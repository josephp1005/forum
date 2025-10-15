import type { Request, Response, NextFunction } from 'express';
import { refreshAttentionIndex } from '../services/indexService.js';

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

    res.status(200).json({ message: `Fetched current index data for market ${market_id}` });
  } catch (error) {
    next(error);
  }
}