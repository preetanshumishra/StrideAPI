import { Response } from 'express';
import Errand from '../models/Errand';
import { IPlace } from '../models/Place';
import { AuthRequest } from '../middleware/auth';
import { getErrorMessage } from '../utils/errorResponse';
import { isValidObjectId } from '../utils/validateObjectId';
import { calculateDistance } from '../utils/haversine';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const getErrandRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { latitude, longitude, radiusKm } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({
        status: 'error',
        message: 'latitude and longitude must be numbers',
      });
      return;
    }

    const maxRadius = typeof radiusKm === 'number' ? radiusKm : 50;

    const errands = await Errand.find({ userId: req.user.userId, status: 'pending' }).populate<{
      linkedPlaceId: IPlace | null;
    }>('linkedPlaceId');

    const withLocation: Array<{ errand: (typeof errands)[number]; distanceKm: number }> = [];
    const withoutLocation: Array<(typeof errands)[number]> = [];

    for (const errand of errands) {
      const place = errand.linkedPlaceId as IPlace | null;
      if (place && typeof place.latitude === 'number' && typeof place.longitude === 'number') {
        const dist = calculateDistance(latitude, longitude, place.latitude, place.longitude);
        if (dist <= maxRadius) {
          withLocation.push({ errand, distanceKm: dist });
        }
      } else {
        withoutLocation.push(errand);
      }
    }

    withLocation.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      const pa = PRIORITY_ORDER[a.errand.priority] ?? 1;
      const pb = PRIORITY_ORDER[b.errand.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      const da = a.errand.deadline ? new Date(a.errand.deadline).getTime() : Infinity;
      const db = b.errand.deadline ? new Date(b.errand.deadline).getTime() : Infinity;
      return da - db;
    });

    withoutLocation.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 1;
      const pb = PRIORITY_ORDER[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return da - db;
    });

    const sortedErrands = [
      ...withLocation.map(({ errand, distanceKm }) => ({ ...errand.toObject(), distanceKm })),
      ...withoutLocation.map((errand) => errand.toObject()),
    ];

    res.status(200).json({
      status: 'success',
      data: sortedErrands,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to compute errand route'),
    });
  }
};

export const createErrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { title, category, linkedPlaceId, priority, deadline, recurring } = req.body;

    if (!title) {
      res.status(400).json({
        status: 'error',
        message: 'Errand title is required',
      });
      return;
    }

    const errand = new Errand({
      title,
      category,
      linkedPlaceId,
      priority,
      deadline,
      recurring,
      userId: req.user.userId,
    });

    await errand.save();

    res.status(201).json({
      status: 'success',
      message: 'Errand created successfully',
      data: errand,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to create errand'),
    });
  }
};

export const getErrands = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const filter: Record<string, unknown> = { userId: req.user.userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const errands = await Errand.find(filter).sort({ deadline: 1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: errands,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch errands'),
    });
  }
};

export const getErrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const errand = await Errand.findOne({ _id: id, userId: req.user.userId });
    if (!errand) {
      res.status(404).json({ status: 'error', message: 'Errand not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: errand,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch errand'),
    });
  }
};

export const updateErrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const errand = await Errand.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!errand) {
      res.status(404).json({ status: 'error', message: 'Errand not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Errand updated successfully',
      data: errand,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to update errand'),
    });
  }
};

export const completeErrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const { completedAtPlaceId } = req.body;

    const errand = await Errand.findOneAndUpdate(
      { _id: id, userId: req.user.userId, status: 'pending' },
      {
        status: 'done',
        completedAt: new Date(),
        ...(completedAtPlaceId && { completedAtPlaceId }),
      },
      { new: true, runValidators: true }
    );

    if (!errand) {
      res.status(404).json({ status: 'error', message: 'Pending errand not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Errand completed',
      data: errand,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to complete errand'),
    });
  }
};

export const deleteErrand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;
    if (!isValidObjectId(id, res)) return;

    const errand = await Errand.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!errand) {
      res.status(404).json({ status: 'error', message: 'Errand not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Errand deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to delete errand'),
    });
  }
};
