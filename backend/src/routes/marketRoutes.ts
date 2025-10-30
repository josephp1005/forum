import { Router } from "express";
import { getMarkets, getFullMarket } from "../controllers/marketController.js";

const router = Router();

router.get('/', getMarkets);
router.get('/:id/full', getFullMarket);

export default router;