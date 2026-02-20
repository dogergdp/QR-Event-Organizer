import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
    event: {
        id: number;
        name: string;
        date: string;
        start_time?: string;
        end_time?: string;
        location: string;
        description?: string;
        banner_image?: string | null;
        is_finished: boolean;
    };
}


export default function QRDisplay() {
    const { event } = usePage().props as unknown as QRDisplayProps;
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(45);

    const generateQRCode = async () => {
        try {
            const response = await axios.get(`/api/events/${event.id}/qr-code`);
            setQrUrl(response.data.url);
            setTimeRemaining(45);
            setError(null);
        } catch (err) {
            console.error('QR Code Error:', err);
            setError('Failed to generate QR code. Make sure you are logged in as admin.');
        }
    };

    useEffect(() => {
        generateQRCode();
    }, [event.id]);

    // Auto-refresh QR code every 45 seconds
    useEffect(() => {
        const interval = setInterval(generateQRCode, 45000);
        return () => clearInterval(interval);
    }, [event.id]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 45));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="flex h-screen w-full flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${event.banner_image ? `/storage/${event.banner_image}` : '/images/default-event.png'}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Back Button */}
            <button
                onClick={() => window.history.back()}
                className="absolute left-6 top-6 rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white hover:bg-black/80 transition-colors z-10"
            >
                ← Back
            </button>

            {/* QR Code Display - Center of Screen */}
            <div className="flex flex-col items-center justify-center">
                {error ? (
                    <div className="flex flex-col items-center justify-center rounded-lg bg-red-600/90 p-12">
                        <p className="max-w-md text-center text-lg text-white">{error}</p>
                    </div>
                ) : qrUrl ? (
                    <button
                        onClick={() => window.history.back()}
                        className="cursor-pointer transition-transform hover:scale-105"
                        title="Click to go back"
                    >
                        <div className="rounded-lg bg-white p-8 shadow-2xl">
                            <QRCodeSVG value={qrUrl} size={400} level="H" includeMargin={true} />
                        </div>
                    </button>
                ) : (
                    <div className="rounded-lg bg-white/20 backdrop-blur p-8">
                        <p className="text-white">Loading QR code...</p>
                    </div>
                )}

                {/* Timer at bottom of QR */}
                {!error && (
                    <div className="mt-8 text-center text-white">
                        <p className="text-sm font-medium opacity-80">
                            Refreshes in <span className="font-bold text-yellow-300">{timeRemaining}</span>s
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
