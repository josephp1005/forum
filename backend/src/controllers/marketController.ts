import type { Request, Response, NextFunction } from 'express';
import { fetchMarkets } from '../services/marketService.js';

export const getMarkets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const markets = await fetchMarkets();

        res.json(markets);
    } catch (error) {
        next(error);
    }
}