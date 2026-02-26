import { Response } from 'express';
import Place from '../models/Place';
import Errand from '../models/Errand';
import { AuthRequest } from '../middleware/auth';
import { getErrorMessage } from '../utils/errorResponse';
import { calculateDistance } from '../utils/haversine';

export const getNearby = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const radius = typeof radiusKm === 'number' ? radiusKm : 1;

    const places = await Place.find({ userId: req.user.userId });

    const nearbyPlaces = places
      .map((place) => {
        const distanceKm = calculateDistance(latitude, longitude, place.latitude, place.longitude);
        return { place, distanceKm };
      })
      .filter(({ distanceKm }) => distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map(({ place, distanceKm }) => ({ ...place.toObject(), distanceKm }));

    const nearbyPlaceIds = nearbyPlaces.map((p) => p._id);

    const linkedErrands = await Errand.find({
      userId: req.user.userId,
      status: 'pending',
      linkedPlaceId: { $in: nearbyPlaceIds },
    });

    res.status(200).json({
      status: 'success',
      data: {
        nearbyPlaces,
        linkedErrands,
        radiusKm: radius,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: getErrorMessage(error, 'Failed to fetch nearby data'),
    });
  }
};
