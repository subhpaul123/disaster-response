export const logger = {
    info: (obj) => console.log(JSON.stringify({ level: 'info', ...obj })),
    error: (obj) => console.error(JSON.stringify({ level: 'error', ...obj })),
};
