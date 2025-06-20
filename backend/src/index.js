import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import { limiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSockets } from './sockets.js';

import disasters from './routes/disasters.js';
import geocode from './routes/geocode.js';
import socialMedia from './routes/socialMedia.js';
import resources from './routes/resources.js';
import updates from './routes/updates.js';
import verifyImage from './routes/verifyImage.js';
import reports from './routes/reports.js';

import { supabase } from './config/supabase.js';
import { setupPriorityAlerts } from './utils/classifier.js';
import mapboxTokenRoute from './routes/mapboxToken.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(limiter);

app.use('/disasters', disasters);
app.use('/geocode', geocode);
app.use('/disasters', socialMedia);
app.use('/disasters', resources);
app.use('/disasters', updates);
app.use('/disasters', verifyImage);
app.use('/reports', reports);
app.use('/mapbox-token', mapboxTokenRoute);

app.use(errorHandler);

const server = http.createServer(app);
initSockets(server);

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        const { data, error } = await supabase
            .from('disasters')
            .select('id')
            .limit(1);
        if (error) throw error;
        console.log('Supabase connected, sample row:', data);

        // Initialize optional features like alert classifier
        await setupPriorityAlerts();

        server.listen(PORT, () => {
            console.log(`Listening on ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
