import type { Request, Response, NextFunction } from 'express';
import { fetchMarkets, fetchFullMarket } from '../services/marketService.js';

export const getMarkets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const markets = await fetchMarkets();
        res.json(markets);
    } catch (error) {
        next(error);
    }
}

export const getFullMarket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const marketId = parseInt(req.params.id);
        
        if (isNaN(marketId)) {
            return res.status(400).json({ error: 'Invalid market ID' });
        }

        const market = await fetchFullMarket(marketId);
        res.json(market);
    } catch (error) {
        next(error);
    }
}