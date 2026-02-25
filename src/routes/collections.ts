import express from 'express';
import { createCollection, getCollections, getCollection, updateCollection, deleteCollection } from '../controllers/collectionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/v1/collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Pharmacies
 *               icon:
 *                 type: string
 *                 example: "\U0001F48A"
 *               shared:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Collection created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createCollection);

/**
 * @swagger
 * /api/v1/collections:
 *   get:
 *     summary: Get all collections for the current user
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of collections
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getCollections);

/**
 * @swagger
 * /api/v1/collections/{id}:
 *   get:
 *     summary: Get a specific collection
 *     tags: [Collections]
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
 *         description: Collection details
 *       404:
 *         description: Collection not found
 */
router.get('/:id', authenticate, getCollection);

/**
 * @swagger
 * /api/v1/collections/{id}:
 *   put:
 *     summary: Update a collection
 *     tags: [Collections]
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
 *             $ref: '#/components/schemas/Collection'
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *       404:
 *         description: Collection not found
 */
router.put('/:id', authenticate, updateCollection);

/**
 * @swagger
 * /api/v1/collections/{id}:
 *   delete:
 *     summary: Delete a collection (unlinks associated places)
 *     tags: [Collections]
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
 *         description: Collection deleted successfully
 *       404:
 *         description: Collection not found
 */
router.delete('/:id', authenticate, deleteCollection);

export default router;
