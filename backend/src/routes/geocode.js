import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';

const router = express.Router();

router.get('/', (_req, res) => res.json({ status: 'geocode OK' }));

router.post('/', async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Missing text field' });

        const cacheKey = `geo:${text.toLowerCase()}`;
        let result = await getCache(cacheKey);

        if (!result) {
            const match = text.match(/near (.+)$/i);
            const location_name = match ? match[1] : text;

            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location_name)}.json`;
            const response = await axios.get(url, {
                params: {
                    access_token: process.env.MAPBOX_TOKEN,
                    limit: 1
                }
            });

            const feature = response.data.features?.[0];
            if (!feature || !feature.geometry) {
                return res.status(404).json({ error: 'Location not found' });
            }

            const [lon, lat] = feature.geometry.coordinates;
            result = { location_name, lon, lat };
            await setCache(cacheKey, result);
        }

        res.json(result);
    } catch (err) {
        console.error('Geocode error:', err.message);
        next(err);
    }
});

export default router;
