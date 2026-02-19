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
    const hasScannedRef = useRef(false);
    const [error, setError] = useState<string | null>(null);

    console.log('QRScanner component rendered, isOpen:', isOpen);

    useEffect(() => {
        console.log('QRScanner useEffect triggered, isOpen:', isOpen);

        const cleanupScanner = (reason: string) => {
            if (!scannerRef.current) return;
            console.log('Cleaning up scanner:', reason);
            const scanner = scannerRef.current;
            scannerRef.current = null;
            if (typeof scanner.clear === 'function') {
                scanner.clear().catch((err: any) =>
                    console.error('Error clearing scanner:', err)
                );
            }
            if (typeof scanner.stop === 'function') {
                scanner.stop().catch((err: any) =>
                    console.error('Error stopping scanner:', err)
                );
            }
        };

        if (!isOpen) {
            console.log('isOpen is false, cleaning up...');
            // Clean up scanner when modal closes
            cleanupScanner('modal closed');
            setHasScanned(false);
            hasScannedRef.current = false;
            setError(null);
            return;
        }

        console.log('Starting scanner initialization...');

        const initializeScanner = async () => {
            console.log('initializeScanner function called');
            try {
                // Request camera permission explicitly
                console.log('Requesting camera permission...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                });
                
                // Stop the stream - we just wanted to request permission
                stream.getTracks().forEach(track => track.stop());
                console.log('Camera permission granted');

                // Initialize scanner
                const scanner = new Html5QrcodeScanner(
                    'qr-scanner-container',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        rememberLastUsedCamera: true,
                        aspectRatio: 1.0,
                        videoConstraints: { facingMode: { ideal: 'environment' } },
                    },
                    false
                );

                const onScanSuccess = (decodedText: string) => {
                    if (hasScannedRef.current) {
                        return;
                    }
                    hasScannedRef.current = true;
                    const cleanedText = decodedText.trim();
                    console.log('QR code scanned successfully:', cleanedText);
                    setHasScanned(true);
                    setError(null);
                    console.log('Invoking onScan callback');
                    queueMicrotask(() => onScan(cleanedText));
                    (scanner as any)
                        .stop()
                        .catch((err: any) => console.error('Error stopping scanner:', err));
                };

                const onScanError = (error: any) => {
                    // Ignore QR code decode errors, they're normal during scanning
                    const errorStr = String(error);
                    if (!errorStr.includes('QR code parse error')) {
                        console.warn('QR Scanner error:', error);
                    }
                };

                console.log('Rendering scanner...');
                scanner.render(onScanSuccess, onScanError);
                scannerRef.current = scanner;
                console.log('Scanner initialized successfully');
                setError(null);
            } catch (err: any) {
                console.error('Camera access error:', err);
                const errorMsg = err?.message || String(err);
                
                let userMessage = 'Unable to access camera.';
                if (errorMsg.includes('Permission denied')) {
                    userMessage = 'Camera permission denied. Please allow camera access in System Preferences > Security & Privacy.';
                } else if (errorMsg.includes('NotFoundError')) {
                    userMessage = 'No camera found on this device.';
                } else {
                    userMessage = `Camera error: ${errorMsg}`;
                }
                
                console.log('Setting error:', userMessage);
                setError(userMessage);
            }
        };

        console.log('Calling initializeScanner...');
        initializeScanner();

        return () => {
            cleanupScanner('effect cleanup');
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
