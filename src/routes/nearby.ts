import express from 'express';
import { getNearby } from '../controllers/nearbyController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/v1/nearby:
 *   post:
 *     summary: Get nearby saved places and linked pending errands
 *     tags: [Nearby]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *               radiusKm:
 *                 type: number
 *                 example: 1
 *                 description: Search radius in km (default 1)
 *     responses:
 *       200:
 *         description: Nearby places and linked pending errands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     nearbyPlaces:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Place with distanceKm added
 *                     linkedErrands:
 *                       type: array
 *                       items:
 *                         type: object
 *                     radiusKm:
 *                       type: number
 *                       example: 1
 *       400:
 *         description: Invalid latitude or longitude
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, getNearby);

export default router;
