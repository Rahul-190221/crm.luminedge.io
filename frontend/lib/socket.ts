import { io, Socket } from 'socket.io-client';
import { API_ORIGIN } from './api/base';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const sameOriginAsApi = (url: string): boolean => {
    try {
        return !!API_ORIGIN && new URL(url).origin === new URL(API_ORIGIN).origin;
    } catch {
        return false;
    }
};

const SOCKET_URL = (() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
    if (socketUrl) {
        const normalized = socketUrl.replace(/\/+$/, '');
        // The socket host must always be a separate always-on process from the
        // serverless API (see README "Realtime Notifications"). If they're the
        // same origin, no socket host has actually been stood up — whatever the
        // env var says (e.g. a stale build-time value) — so treat it as unset
        // rather than hammering a host that can never serve /socket.io.
        if (sameOriginAsApi(normalized)) {
            return null;
        }
        return normalized;
    }

    if (API_URL && /localhost|127\.0\.0\.1|\[::1\]/.test(API_URL)) {
        return API_URL.replace(/\/api\/?$/, '');
    }

    return null;
})();

class ClientSocketService {
    public socket: Socket | null = null;
    private connectedToken: string | null = null;
    private authFailed = false;
    private consecutiveErrors = 0;

    public connect(token: string) {
        if (!token) {
            return;
        }

        if (!SOCKET_URL) {
            if (process.env.NODE_ENV === 'production') {
                console.warn('NEXT_PUBLIC_SOCKET_URL is not set; realtime notifications are disabled.');
            }
            this.disconnect();
            return;
        }

        // Don't keep retrying with a token that already failed auth
        if (this.authFailed && this.connectedToken === token) {
            return;
        }

        if (this.socket && this.connectedToken === token) {
            if (!this.socket.connected) {
                this.authFailed = false;
                this.socket.io.opts.reconnection = true;
                this.socket.connect();
            }
            return;
        }

        this.disconnect();

        this.connectedToken = token;
        this.authFailed = false;
        this.consecutiveErrors = 0;
        this.socket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
        });

        this.socket.on('connect', () => {
            this.authFailed = false;
            this.consecutiveErrors = 0;
            console.log('Connected to socket server', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('connect_error', (err) => {
            if (err.message === 'Authentication error') {
                // Stop retrying immediately — same token won't suddenly become valid
                this.authFailed = true;
                if (this.socket?.io) {
                    this.socket.io.opts.reconnection = false;
                }
                return;
            }

            // Any other persistent failure (e.g. host doesn't serve /socket.io at
            // all) — give it one retry for transient blips, then stop rather than
            // burning through all reconnectionAttempts every page load.
            this.consecutiveErrors += 1;
            if (this.consecutiveErrors >= 2 && this.socket?.io) {
                this.socket.io.opts.reconnection = false;
            }
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectedToken = null;
        this.authFailed = false;
        this.consecutiveErrors = 0;
    }
}

export const socketService = new ClientSocketService();
