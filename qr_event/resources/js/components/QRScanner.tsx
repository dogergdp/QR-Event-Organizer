import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
    const scannerRef = useRef<any>(null);
    const [hasScanned, setHasScanned] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Clean up scanner when modal closes
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .catch((err: any) => console.error('Error stopping scanner:', err));
                scannerRef.current = null;
            }
            setHasScanned(false);
            setError(null);
            return;
        }

        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            'qr-scanner-container',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true,
                aspectRatio: 1.0,
            },
            false
        );

        const onScanSuccess = (decodedText: string) => {
            setHasScanned(true);
            (scanner as any)
                .stop()
                .then(() => {
                    setError(null);
                    onScan(decodedText);
                })
                .catch((err: any) => console.error('Error stopping scanner:', err));
        };

        const onScanError = (error: any) => {
            // Ignore QR code decode errors, they're normal during scanning
            const errorStr = String(error);
            if (!errorStr.includes('QR code parse error')) {
                console.warn('QR Scanner error:', error);
            }
        };

        try {
            scanner.render(onScanSuccess, onScanError);
            scannerRef.current = scanner;
        } catch (err: any) {
            console.error('Scanner error:', err);
            setError(
                'Unable to access camera. Please check permissions and try again.'
            );
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .catch((err: any) => console.error('Error cleaning up scanner:', err));
                scannerRef.current = null;
            }
        };
    }, [isOpen, onScan]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Scan QR Code</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-muted-foreground hover:text-foreground"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!error ? (
                    <>
                        <div
                            id="qr-scanner-container"
                            className="mb-4 overflow-hidden rounded-lg"
                        />
                        <p className="text-center text-sm text-muted-foreground">
                            Position the QR code in front of your camera
                        </p>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setError(null);
                            setHasScanned(false);
                        }}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-lg border border-sidebar-border/70 bg-background px-4 py-2 text-foreground hover:bg-muted"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
