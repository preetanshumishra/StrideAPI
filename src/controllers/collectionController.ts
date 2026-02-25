import { Response } from 'express';
import Collection from '../models/Collection';
import Place from '../models/Place';
import { AuthRequest } from '../middleware/auth';
import { getErrorMessage } from '../utils/errorResponse';
import { isValidObjectId } from '../utils/validateObjectId';

export const createCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { name, icon, shared } = req.body;

    if (!name) {
      res.status(400).json({
        status: 'error',
        message: 'Collection name is required',
      });
      return;
    }

    const collection = new Collection({
      name,
      icon,
      shared,
      userId: req.user.userId,
    });

    await collection.save();

    res.status(201).json({
      status: 'success',
      message: 'Collection created successfully',
      data: collection,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to create collection'),
    });
  }
};

export const getCollections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const collections = await Collection.find({ userId: req.user.userId }).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      data: collections,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch collections'),
    });
  }
};

export const getCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const collection = await Collection.findOne({ _id: id, userId: req.user.userId });
    if (!collection) {
      res.status(404).json({ status: 'error', message: 'Collection not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: collection,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch collection'),
    });
  }
};

export const updateCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const collection = await Collection.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!collection) {
      res.status(404).json({ status: 'error', message: 'Collection not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Collection updated successfully',
      data: collection,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to update collection'),
    });
  }
};

export const deleteCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const collection = await Collection.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!collection) {
      res.status(404).json({ status: 'error', message: 'Collection not found' });
      return;
    }

    // Unlink places from this collection
    await Place.updateMany(
      { collectionId: id, userId: req.user.userId },
      { $unset: { collectionId: '' } }
    );

    res.status(200).json({
      status: 'success',
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to delete collection'),
    });
  }
};
