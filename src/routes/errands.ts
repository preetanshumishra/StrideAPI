import express from 'express';
import { createErrand, getErrands, getErrand, updateErrand, completeErrand, deleteErrand } from '../controllers/errandController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/v1/errands:
 *   post:
 *     summary: Create a new errand
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Pick up prescription
 *               category:
 *                 type: string
 *                 example: pharmacy
 *               linkedPlaceId:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               recurring:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   intervalDays:
 *                     type: number
 *                   nextDue:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       201:
 *         description: Errand created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createErrand);

/**
 * @swagger
 * /api/v1/errands:
 *   get:
 *     summary: Get all errands for the current user
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, done]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of errands
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getErrands);

/**
 * @swagger
 * /api/v1/errands/{id}:
 *   get:
 *     summary: Get a specific errand
 *     tags: [Errands]
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
 *         description: Errand details
 *       404:
 *         description: Errand not found
 */
router.get('/:id', authenticate, getErrand);

/**
 * @swagger
 * /api/v1/errands/{id}:
 *   put:
 *     summary: Update an errand
 *     tags: [Errands]
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
 *             $ref: '#/components/schemas/Errand'
 *     responses:
 *       200:
 *         description: Errand updated successfully
 *       404:
 *         description: Errand not found
 */
router.put('/:id', authenticate, updateErrand);

/**
 * @swagger
 * /api/v1/errands/{id}/complete:
 *   patch:
 *     summary: Mark an errand as complete
 *     tags: [Errands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completedAtPlaceId:
 *                 type: string
 *                 description: ID of the place where the errand was completed
 *     responses:
 *       200:
 *         description: Errand completed
 *       404:
 *         description: Pending errand not found
 */
router.patch('/:id/complete', authenticate, completeErrand);

/**
 * @swagger
 * /api/v1/errands/{id}:
 *   delete:
 *     summary: Delete an errand
 *     tags: [Errands]
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
 *         description: Errand deleted successfully
 *       404:
 *         description: Errand not found
 */
router.delete('/:id', authenticate, deleteErrand);

export default router;
