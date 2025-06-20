import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';
import { supabase } from '../config/supabase.js';
import { emit } from '../sockets.js';

const router = express.Router();

router.get('/:id/social-media', async (req, res, next) => {
    try {
        const key = `social:${req.params.id}`;
        let posts = await getCache(key);
        if (!posts) {
            // mock data
            posts = [
                { post: '#floodrelief Need food in NYC', user: 'citizen1' },
                { post: 'Offering shelter in Queens', user: 'reliefOrg' }
            ];
            await setCache(key, posts);
        }
        emit('social_media_updated', { id: req.params.id, posts });
        res.json(posts);
    } catch (e) { next(e) }
});

export default router;
