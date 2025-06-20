import express from 'express';
const router = express.Router();

router.get('/', (_req, res) => {
    res.json({ token: process.env.MAPBOX_TOKEN });
});

export default router;