import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
    logger.error({ message: err.message, stack: err.stack });
    res.status(err.status || 500).json({ error: err.message });
}
