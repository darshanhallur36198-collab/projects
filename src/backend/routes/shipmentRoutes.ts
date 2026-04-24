import { Router } from 'express';
import { updateShipmentStatus, getEstimate } from '../controllers/shipmentController';

const router = Router();

router.post('/update-status', updateShipmentStatus);
router.post('/estimate', getEstimate);

export default router;
