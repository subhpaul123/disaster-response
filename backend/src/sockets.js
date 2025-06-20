import { Server } from 'socket.io';
import { logger } from './utils/logger.js';

let io;
export function initSockets(server) {
    io = new Server(server, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
        logger.info({ action: 'socket_connected', id: socket.id });
    });
}

export function emit(event, data) {
    if (io) io.emit(event, data);
}
