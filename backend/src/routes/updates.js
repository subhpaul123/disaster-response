import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';

const router = express.Router();


router.get('/:id/official-updates', async (req, res, next) => {
    try {
        const key = `updates:${req.params.id}`;
        let updates = await getCache(key);
        if (!updates) {
            const resp = await axios.get(
                'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=5'
            );
            const records = resp.data.DisasterDeclarationsSummaries || [];
            updates = records.map(item => item.declarationTitle || item.disasterNumber);
            await setCache(key, updates);
        }
        res.json(updates);
    } catch (err) {
        next(err);
    }
});

export default router;
