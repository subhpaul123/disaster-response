import express from 'express';
import { supabase } from '../config/supabase.js';
import { auth } from '../middleware/auth.js';
import { emit } from '../sockets.js';

const router = express.Router();

router.post('/', auth, async (req, res, next) => {
    try {
        console.log('▶️ body:', req.body);

        const { data, error } = await supabase
            .from('disasters')
            .insert([{
                title: req.body.title,
                location_name: req.body.location_name,
                description: req.body.description,
                tags: req.body.tags,
                owner_id: req.user.id,
                audit_trail: [
                    { action: 'create', user_id: req.user.id, timestamp: new Date().toISOString() }
                ]
            }])
            .select('*')
            .single();

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(400).json({ error: error.message });
        }

        console.log('✅ Inserted:', data);
        emit('disaster_updated', data);
        res.json(data);

    } catch (err) {
        next(err);
    }
});


router.get('/', async (req, res, next) => {
    try {
        const { tag } = req.query;
        let q = supabase.from('disasters').select('*');
        if (tag) q = q.contains('tags', [tag]);
        const { data } = await q;
        res.json(data);
    } catch (e) { next(e) }
});

router.put('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const fields = req.body;

        const { data: prev, error: fetchErr } = await supabase
            .from('disasters')
            .select('audit_trail')
            .eq('id', id)
            .single();
        if (fetchErr) return res.status(500).json({ error: fetchErr.message });

        const newEntry = {
            action: 'update',
            user_id: req.user.id,
            timestamp: new Date().toISOString(),
        };
        const updatedTrail = Array.isArray(prev.audit_trail)
            ? [...prev.audit_trail, newEntry]
            : [newEntry];

        const { data, error } = await supabase
            .from('disasters')
            .update({ ...fields, audit_trail: updatedTrail })
            .select('*')
            .eq('id', id)
            .single();

        console.log('🔄 UPDATE RESULT:', { data, error });
        if (error) return res.status(500).json({ error: error.message });

        emit('disaster_updated', data);
        res.json(data);

    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, location_name, description, tags } = req.body;

        if (!title || !location_name || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const cacheKey = `geo:${location_name.toLowerCase()}`;
        let geo = await getCache(cacheKey);

        if (!geo) {
            const response = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location_name)}.json`,
                {
                    params: {
                        access_token: process.env.MAPBOX_TOKEN,
                        limit: 1
                    }
                }
            );
            const feature = response.data.features?.[0];
            if (!feature || !feature.geometry) {
                return res.status(404).json({ error: 'Could not geocode location.' });
            }

            const [lon, lat] = feature.geometry.coordinates;
            geo = { lon, lat };
            await setCache(cacheKey, geo);
        }

        const location = `SRID=4326;POINT(${geo.lon} ${geo.lat})`; // WKT format with SRID

        const { data, error } = await supabase.from('disasters').insert([
            {
                title,
                location_name,
                description,
                tags,
                location
            }
        ]).select('*').single();

        if (error) throw error;

        res.status(201).json({ success: true, disaster: data });
    } catch (err) {
        console.error('Error creating disaster:', err.message);
        res.status(500).json({ error: 'Failed to create disaster' });
    }
});




router.delete('/:id', auth, async (req, res, next) => {
    try {
        const { id } = req.params;
        await supabase.from('disasters').delete().eq('id', id);
        emit('disaster_updated', { id });
        res.json({ deleted: id });
    } catch (e) { next(e) }
});

export default router;
