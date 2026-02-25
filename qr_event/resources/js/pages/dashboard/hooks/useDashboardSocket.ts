import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { io } from 'socket.io-client';

export const useDashboardSocket = (isAdmin: boolean) => {
    useEffect(() => {
        if (!isAdmin) return;

        const socketUrl = import.meta.env.VITE_SOCKET_IO_URL;
        if (!socketUrl) return;

        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
        });

        const refreshDashboard = () => {
            router.reload({
                only: ['events', 'stats', 'reportEvents', 'topAttendees', 'activityLogs'],
            });
        };

        socket.on('dashboard:update', refreshDashboard);

        return () => {
            socket.off('dashboard:update', refreshDashboard);
            socket.disconnect();
        };
    }, [isAdmin]);
};