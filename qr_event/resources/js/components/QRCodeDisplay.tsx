import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

interface QRCodeDisplayProps {
    eventId: number;
}

export default function QRCodeDisplay({ eventId }: QRCodeDisplayProps) {
    const [qrUrl, setQrUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(45);

    useEffect(() => {
        const fetchQRCode = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `/api/events/${eventId}/qr-code`
                );
                setQrUrl(response.data.url);
                setTimeRemaining(45);
                setError(null);
            } catch (err) {
                console.error('QR Code Error:', err);
                setError('Failed to generate QR code. Make sure you are logged in as admin.');
            } finally {
                setLoading(false);
            }
        };

        fetchQRCode();

        // Regenerate QR code every 45 seconds
        const interval = setInterval(fetchQRCode, 45000);

        return () => clearInterval(interval);
    }, [eventId]);

    // Timer for UI feedback
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) return 45;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
            <h2 className="text-xl font-semibold text-foreground">
                Event Check-in QR Code
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Display this code to attendees for check-in. Code refreshes
                every 45 seconds.
            </p>

            <div className="mt-6 flex flex-col items-center gap-4">
                {loading ? (
                    <div className="h-64 w-64 animate-pulse rounded-lg bg-sidebar" />
                ) : qrUrl ? (
                    <div className="flex flex-col items-center rounded-lg border border-sidebar-border/70 p-4">
                        <QRCodeSVG
                            value={qrUrl}
                            size={256}
                            level="H"
                            includeMargin={true}
                        />
                        <p className="mt-4 text-sm font-semibold text-foreground">
                            Refreshes in: {timeRemaining}s
                        </p>
                    </div>
                ) : null}

                <div className="w-full max-w-sm rounded-lg bg-blue-50 p-4">
                    <p className="text-xs text-blue-800">
                        <strong>Instructions:</strong> Users can scan this QR
                        code with their phone camera to check in to the event.
                        Each code is valid for 60 seconds from generation.
                    </p>
                </div>
            </div>
        </div>
    );
}
