import { Router } from "express";
import { getIndex, refreshIndex } from "../controllers/indexController.js";

const router = Router();

router.post('/:market_id/refresh', refreshIndex);
router.get('/:market_id', getIndex);

export default router;