import express from 'express';
import { createPlace, getPlaces, getPlace, updatePlace, deletePlace, recordVisit } from '../controllers/placeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/v1/places:
 *   post:
 *     summary: Create a new place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, latitude, longitude]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Blue Bottle Coffee
 *               address:
 *                 type: string
 *                 example: 450 W 15th St, New York, NY
 *               latitude:
 *                 type: number
 *                 example: 40.7425
 *               longitude:
 *                 type: number
 *                 example: -74.0061
 *               category:
 *                 type: string
 *                 example: coffee
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["best cortado", "wifi"]
 *               notes:
 *                 type: string
 *                 example: Ask for Mike
 *               personalRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               collectionId:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [manual, auto-suggested, from-errand]
 *     responses:
 *       201:
 *         description: Place created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createPlace);

/**
 * @swagger
 * /api/v1/places:
 *   get:
 *     summary: Get all places for the current user
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: collectionId
 *         schema:
 *           type: string
 *         description: Filter by collection
 *     responses:
 *       200:
 *         description: List of places
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getPlaces);

/**
 * @swagger
 * /api/v1/places/{id}:
 *   get:
 *     summary: Get a specific place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place details
 *       404:
 *         description: Place not found
 */
router.get('/:id', authenticate, getPlace);

/**
 * @swagger
 * /api/v1/places/{id}/visit:
 *   patch:
 *     summary: Record a visit to a place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit recorded, returns updated place with incremented visitCount and lastVisited
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Place not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/visit', authenticate, recordVisit);

/**
 * @swagger
 * /api/v1/places/{id}:
 *   put:
 *     summary: Update a place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Place'
 *     responses:
 *       200:
 *         description: Place updated successfully
 *       404:
 *         description: Place not found
 */
router.put('/:id', authenticate, updatePlace);

/**
 * @swagger
 * /api/v1/places/{id}:
 *   delete:
 *     summary: Delete a place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Place deleted successfully
 *       404:
 *         description: Place not found
 */
router.delete('/:id', authenticate, deletePlace);

export default router;
