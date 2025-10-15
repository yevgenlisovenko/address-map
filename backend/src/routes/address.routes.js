/**
 * Address geocoding routes
 */

import express from 'express';
import * as addressController from '../controllers/address.controller.js';

const router = express.Router();

/**
 * Submit a new address for geocoding
 * POST /api/address
 */
router.post('/address', addressController.submitAddress);

export default router;
