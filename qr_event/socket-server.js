import http from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.SOCKET_IO_PORT || 6002);
const host = process.env.SOCKET_IO_HOST || '0.0.0.0';
const secret = process.env.SOCKET_IO_SERVER_SECRET || '';
const allowedOrigin = process.env.SOCKET_IO_CORS_ORIGIN || '*';

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        return;
    }

    if (req.method === 'POST' && req.url === '/internal/dashboard-update') {
        const incomingSecret = req.headers['x-live-secret'];

        if (secret && incomingSecret !== secret) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Unauthorized' }));
            return;
        }

        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            let payload = {};

            try {
                payload = body ? JSON.parse(body) : {};
            } catch {
                payload = {};
            }

            io.emit('dashboard:update', {
                ...(payload || {}),
                emitted_at: new Date().toISOString(),
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
        });

        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    socket.emit('dashboard:connected', { connected_at: new Date().toISOString() });
});

server.listen(port, host, () => {
    console.log(`Socket.IO server listening on http://${host}:${port}`);
});
