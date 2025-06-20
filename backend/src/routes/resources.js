import express from 'express';
import { supabase } from '../config/supabase.js';
import { emit } from '../sockets.js';

const router = express.Router();

router.get('/:id/resources', async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        const { data } = await supabase.rpc('get_nearby_resources', {
            disaster_id: req.params.id, latitude: parseFloat(lat), longitude: parseFloat(lon)
        });
        emit('resources_updated', { id: req.params.id, resources: data });
        res.json(data);
    } catch (e) { next(e) }
});

export default router;
