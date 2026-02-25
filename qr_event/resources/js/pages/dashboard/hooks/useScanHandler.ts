import { router } from '@inertiajs/react';

export const useScanHandler = (setIsScannerOpen: (isOpen: boolean) => void) => {
    return (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);
        setIsScannerOpen(false);

        let url = decodedText;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                url = urlObj.pathname + urlObj.search;
            } catch (e) {
                console.error('Invalid URL:', url, e);
                return;
            }
        }

        if (!url.startsWith('/')) {
            url = `/${url}`;
        }

        const currentPath = window.location.pathname + window.location.search;
        const absoluteUrl = `${window.location.origin}${url}`;

        console.log('Navigating to:', url);
        try {
            router.visit(url, {
                preserveState: false,
                preserveScroll: false,
            });
        } catch (error) {
            console.error('Navigation error:', error);
            window.location.href = absoluteUrl;
        }

        window.setTimeout(() => {
            const nextPath = window.location.pathname + window.location.search;
            if (nextPath === currentPath) {
                window.location.href = absoluteUrl;
            }
        }, 600);
    };
};