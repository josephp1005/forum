import { Router } from "express";
import { getIndex, refreshIndex, getNarrativeData } from "../controllers/indexController.js";

const router = Router();

router.post('/:market_id/refresh', refreshIndex);
router.get('/:market_id', getIndex);
router.get('/:market_id/narrative', getNarrativeData);

export default router;