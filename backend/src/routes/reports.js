import express from 'express';
import { supabase } from '../config/supabase.js';
import { isPriority, classifyReport } from '../utils/classifier.js';
import { emit } from '../sockets.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /reports
router.post('/', async (req, res) => {
    try {
        const { disaster_id, user_id, content, image_url } = req.body;

        if (!disaster_id || !user_id || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Optional features
        const priority = isPriority(content);
        const category = classifyReport(content);

        const { data, error } = await supabase
            .from('reports')
            .insert([
                {
                    disaster_id,
                    user_id,
                    content,
                    image_url,
                    verification_status: 'pending',
                    priority,
                    category,
                }
            ])
            .select('*')
            .single();

        if (error) throw error;

        // WebSocket notification (optional)
        emit('report_submitted', data);

        // Structured logging (optional bonus)
        logger.info({
            action: 'report_created',
            user_id,
            disaster_id,
            priority,
            category,
        });

        res.status(201).json({ success: true, report: data });
    } catch (err) {
        logger.error({ action: 'report_error', message: err.message });
        res.status(500).json({ error: 'Failed to create report' });
    }
});

// GET /reports
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        logger.error({ action: 'report_fetch_error', message: err.message });
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

export default router;
