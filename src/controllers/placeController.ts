import { Response } from 'express';
import Place from '../models/Place';
import { AuthRequest } from '../middleware/auth';
import { getErrorMessage } from '../utils/errorResponse';
import { isValidObjectId } from '../utils/validateObjectId';

export const createPlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { name, address, latitude, longitude, category, tags, notes, personalRating, collectionId, source } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        status: 'error',
        message: 'Name, address, latitude, and longitude are required',
      });
      return;
    }

    const place = new Place({
      name,
      address,
      latitude,
      longitude,
      category,
      tags,
      notes,
      personalRating,
      collectionId,
      source,
      userId: req.user.userId,
    });

    await place.save();

    res.status(201).json({
      status: 'success',
      message: 'Place created successfully',
      data: place,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to create place'),
    });
  }
};

export const getPlaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const filter: Record<string, unknown> = { userId: req.user.userId };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.collectionId) {
      filter.collectionId = req.query.collectionId;
    }

    const places = await Place.find(filter).sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: places,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch places'),
    });
  }
};

export const getPlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const place = await Place.findOne({ _id: id, userId: req.user.userId });
    if (!place) {
      res.status(404).json({ status: 'error', message: 'Place not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: place,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch place'),
    });
  }
};

export const updatePlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const place = await Place.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!place) {
      res.status(404).json({ status: 'error', message: 'Place not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Place updated successfully',
      data: place,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to update place'),
    });
  }
};

export const deletePlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const place = await Place.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!place) {
      res.status(404).json({ status: 'error', message: 'Place not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Place deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to delete place'),
    });
  }
};
