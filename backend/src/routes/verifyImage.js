import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../utils/cache.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const GEMINI_MODEL = 'gemini-1.5-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

// POST /disasters/report/:report_id/verify-image
router.post('/report/:report_id/verify-image', async (req, res, next) => {
    try {
        const { image_url } = req.body;
        const reportId = req.params.report_id;
        const cacheKey = `verify:${image_url}`;

        let result = await getCache(cacheKey);
        if (!result) {
            let imageBuffer;
            let mimeType;

            try {
                const imageResponse = await axios.get(image_url, {
                    responseType: 'arraybuffer'
                });
                imageBuffer = Buffer.from(imageResponse.data);

                const contentTypeHeader = imageResponse.headers['content-type'];
                if (contentTypeHeader && (contentTypeHeader.startsWith('image/jpeg') || contentTypeHeader.startsWith('image/png') || contentTypeHeader.startsWith('image/webp'))) {
                    mimeType = contentTypeHeader.split(';')[0].trim();
                }
            } catch (imageFetchError) {
                console.error('Failed to fetch image:', imageFetchError.message);
                return res.status(400).json({ error: 'Failed to fetch image from provided URL.' });
            }

            if (!mimeType) {
                console.warn('Could not determine MIME type from headers, falling back to extension:', image_url);
                const lowerImageUrl = image_url.toLowerCase();
                if (lowerImageUrl.endsWith('.jpg') || lowerImageUrl.endsWith('.jpeg')) {
                    mimeType = 'image/jpeg';
                } else if (lowerImageUrl.endsWith('.png')) {
                    mimeType = 'image/png';
                } else if (lowerImageUrl.endsWith('.webp')) {
                    mimeType = 'image/webp';
                } else {
                    console.warn('Unknown image MIME type, defaulting to image/jpeg.');
                    mimeType = 'image/jpeg';
                }
            }

            if (!mimeType) {
                console.error('Failed to determine a valid MIME type.');
                return res.status(400).json({ error: 'Failed to determine a valid MIME type for the image.' });
            }

            const base64Image = imageBuffer.toString('base64');

            const response = await axios.post(GEMINI_URL, {
                contents: [
                    {
                        parts: [
                            {
                                text: "Analyze this image for signs of manipulation or verify if it's disaster-related. Provide a concise verification status (e.g., 'verified', 'manipulated', 'unrelated')."
                            },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ]
            });

            const output = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'unverified';
            result = {
                status: output.toLowerCase().includes('verified') ? 'verified'
                    : output.toLowerCase().includes('manipulated') ? 'manipulated'
                        : 'unrelated'
            };
            await setCache(cacheKey, result);
        }

        const { error } = await supabase
            .from('reports')
            .update({ verification_status: result.status })
            .eq('id', reportId);

        if (error) throw error;

        res.json(result);
    } catch (err) {
        console.error('Error in verify-image:', err.response?.data || err.message);
        res.status(400).json({
            error: err.response?.data?.error?.message || err.message,
            details: err.response?.data || null
        });
    }
});

export default router;