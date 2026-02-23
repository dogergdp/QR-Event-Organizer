import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface QrCodeData {
    id: number;
    name: string;
    type: 'static' | 'timed';
    is_active: boolean;
    expires_at: string | null;
    valid: boolean;
    event: {
        id: number;
        name: string;
        description: string | null;
        date: string;
        location: string;
    };
}

type DisplayProps = {
    qrCode: QrCodeData;
    token: string;
};

export default function Display({ qrCode, token }: DisplayProps) {
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

    useEffect(() => {
        if (!qrCode.expires_at) return;

        const calculateTimeRemaining = () => {
            const expiresAt = new Date(qrCode.expires_at!).getTime();
            const now = new Date().getTime();
            const diff = expiresAt - now;

            if (diff <= 0) {
                setTimeRemaining('Expired');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m remaining`);
            } else if (minutes > 0) {
                setTimeRemaining(`${minutes}m ${seconds}s remaining`);
            } else {
                setTimeRemaining(`${seconds}s remaining`);
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [qrCode.expires_at]);

    const isExpired = 
        qrCode.expires_at && new Date(qrCode.expires_at) < new Date();
    const isValid = qrCode.valid && qrCode.is_active && !isExpired;
    const hasDescription = Boolean(qrCode.event.description && qrCode.event.description.trim());

    const handleProceedToAttendance = () => {
        window.location.href = `/events/${qrCode.event.id}`;
    };

    // If invalid QR, show simplified message
    if (!isValid) {
        return (
            <>
                <Head title="Invalid QR Code" />
                <div className="min-h-screen bg-gradient-to-br from-background to-background flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-background border border-sidebar-border/70 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <AlertCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-4">
                                Invalid QR Code
                            </h1>
                            <p className="text-sm font-mono text-muted-foreground bg-sidebar/40 px-3 py-2 rounded break-all">
                                ID: {qrCode.id}
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`${qrCode.name} - ${qrCode.event.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden">
                    {/* Status Header */}
                    <div
                        className={`p-6 text-center ${
                            isValid
                                ? 'bg-green-50 border-b-4 border-green-500'
                                : 'bg-red-50 border-b-4 border-red-500'
                        }`}
                    >
                        <div className="flex justify-center mb-2">
                            {isValid ? (
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            ) : (
                                <AlertCircle className="w-12 h-12 text-red-600" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {isValid ? 'Valid QR Code' : 'Invalid QR Code'}
                        </h1>
                        <p
                            className={`text-sm font-medium ${
                                isValid ? 'text-green-700' : 'text-red-700'
                            }`}
                        >
                            {!qrCode.is_active
                                ? 'This QR code has been deactivated'
                                : isExpired
                                ? 'This QR code has expired'
                                : 'Ready to mark attendance'}
                        </p>
                    </div>

                    {/* QR Code Display */}
                    {isValid && (
                        <div className="p-6 text-center border-b">
                            <div className="bg-gray-50 p-4 inline-block rounded-lg">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                        `${window.location.origin}/qr/${token}`
                                    )}`}
                                    alt="QR Code"
                                    className="w-48 h-48"
                                />
                            </div>
                        </div>
                    )}

                    {/* Event Details */}
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                Event
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                                {qrCode.event.name}
                            </p>
                            {hasDescription && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {qrCode.event.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                    Date
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(qrCode.event.date).toLocaleDateString(
                                        'en-US',
                                        {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                    Location
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {qrCode.event.location}
                                </p>
                            </div>
                        </div>

                        {/* QR Code Info */}
                        <div className="pt-4 border-t space-y-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                    QR Code Name
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {qrCode.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                                    Type
                                </p>
                                <p className="text-sm font-medium text-gray-900 capitalize">
                                    {qrCode.type}
                                </p>
                            </div>
                            {qrCode.expires_at && (
                                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-blue-700 font-semibold">
                                            Expires
                                        </p>
                                        <p className="text-xs text-blue-600 font-medium">
                                            {new Date(
                                                qrCode.expires_at
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        {timeRemaining && (
                                            <p className="text-xs text-blue-700 font-semibold mt-1">
                                                {timeRemaining}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-6 border-t bg-gray-50">
                        {isValid ? (
                            <button
                                onClick={handleProceedToAttendance}
                                className="w-full h-12 text-base font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Proceed to Mark Attendance
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full h-12 text-base font-semibold bg-gray-400 text-gray-600 rounded-lg cursor-not-allowed"
                            >
                                Cannot Process
                            </button>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="px-6 py-4 bg-gray-100 text-center text-xs text-gray-600">
                        <p>Token ID: {token.substring(0, 16)}...</p>
                    </div>
                </div>
            </div>
        </>
    );
}
