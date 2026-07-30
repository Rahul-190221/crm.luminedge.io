'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

import { socketService } from '@/lib/socket';
import Cookies from 'js-cookie';
import { getUserIdFromToken } from '@/lib/helpers/jwt';

// BDMs only use the in-app Follow-up Reminders flow; OS-level popups are
// intentionally never shown on the BDM end (see NotificationProvider.tsx).
const isBdmSession = () => getUserIdFromToken()?.role === 'bdm';

interface SocketContextValue {
    service: typeof socketService;
    tick: number;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [connectionTick, setConnectionTick] = useState(0);

    // Connect once on mount; re-connect if token changes (login/logout).
    useEffect(() => {
        const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');

        if (token) {
            socketService.connect(token);
            setConnectionTick(prev => prev + 1);
        } else {
            socketService.disconnect();
        }

        return () => {
            socketService.disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty — reconnect is handled inside socketService.connect()

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;

        if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => undefined);
        }
    }, []);

    useEffect(() => {
        const activeSocket = socketService.socket;
        if (!activeSocket || typeof window === 'undefined' || !('Notification' in window) || isBdmSession()) return;

        const handleBrowserNotification = (notif: { title: string; message: string }) => {
            const pageIsActive = document.visibilityState === 'visible' && document.hasFocus();
            if (pageIsActive || Notification.permission !== 'granted') {
                return;
            }

            const browserNotification = new Notification(notif.title, {
                body: notif.message,
                icon: '/assets/logo.png',
                tag: 'crm-notification'
            });

            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
            };
        };

        activeSocket.on('new-notification', handleBrowserNotification);

        return () => {
            activeSocket.off('new-notification', handleBrowserNotification);
        };
    }, [connectionTick]);

    return (
        <SocketContext.Provider value={{ service: socketService, tick: connectionTick }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext)?.service ?? null;
};

// Use this in any component that needs to re-render when the socket connects/reconnects
export const useSocketTick = () => {
    return useContext(SocketContext)?.tick ?? 0;
};
