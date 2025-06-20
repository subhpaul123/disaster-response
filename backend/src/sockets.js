import { Server } from 'socket.io';
import { logger } from './utils/logger.js';

let io;

export function initSockets(server) {
    io = new Server(server, {
        cors: {
            origin: [
                'https://disaster-response-bgzp8tc3w-subhojit-pauls-projects-0529b500.vercel.app', // Vercel frontend
                'http://localhost:4001' // local testing
            ],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        logger.info({ action: 'socket_connected', id: socket.id });
    });
}

export function emit(event, data) {
    if (io) io.emit(event, data);
}
