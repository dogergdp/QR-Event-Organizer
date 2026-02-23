import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState, useRef } from 'react';
import { Download, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

interface QRCode {
    id: number;
    name: string;
    token: string;
    code: string;
    event: {
        id: number;
        name: string;
        banner_image?: string;
    };
}

type QRViewerProps = {
    qrCode: QRCode;
};

export default function QRViewer() {
    const { qrCode } = usePage().props as any as QRViewerProps;
    const [showId, setShowId] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [bannerLoadFailed, setBannerLoadFailed] = useState(false);
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const defaultBannerUrl = '/images/default-event.png';

    const qrValue = `${window.location.origin}/qr/${qrCode.token}`;

    const bannerUrl = useMemo(() => {
        const image = qrCode.event.banner_image;
        if (!image) return defaultBannerUrl;

        if (
            image.startsWith('http://') ||
            image.startsWith('https://') ||
            image.startsWith('data:') ||
            image.startsWith('blob:') ||
            image.startsWith('/')
        ) {
            return image;
        }

        return `/storage/${image}`;
    }, [qrCode.event.banner_image, defaultBannerUrl]);

    const canUseBanner = Boolean(bannerUrl && !bannerLoadFailed);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const createFilename = () => {
        const safeEvent = qrCode.event.name.replace(/[^a-zA-Z0-9-_]+/g, '_');
        const safeName = qrCode.name.replace(/[^a-zA-Z0-9-_]+/g, '_');
        return `${safeEvent}_${safeName}.png`;
    };

    const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        link.click();
    };

    const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });

    const drawImageCover = (
        context: CanvasRenderingContext2D,
        image: HTMLImageElement,
        x: number,
        y: number,
        width: number,
        height: number
    ) => {
        const imageRatio = image.width / image.height;
        const targetRatio = width / height;

        let sourceWidth = image.width;
        let sourceHeight = image.height;
        let sourceX = 0;
        let sourceY = 0;

        if (imageRatio > targetRatio) {
            sourceWidth = image.height * targetRatio;
            sourceX = (image.width - sourceWidth) / 2;
        } else {
            sourceHeight = image.width / targetRatio;
            sourceY = (image.height - sourceHeight) / 2;
        }

        context.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            x,
            y,
            width,
            height
        );
    };

    const downloadQRImage = async (withBanner: boolean) => {
        setIsDownloading(true);
        try {
            if (!qrCanvasRef.current) {
                throw new Error('QR canvas not ready');
            }

            const sourceCanvas = qrCanvasRef.current;

            if (withBanner) {
                const outputSize = 1200;
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = outputSize;
                exportCanvas.height = outputSize;

                const context = exportCanvas.getContext('2d');
                if (!context) {
                    throw new Error('Unable to create image context');
                }

                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, outputSize, outputSize);

                if (canUseBanner && bannerUrl) {
                    try {
                        const banner = await loadImage(bannerUrl);
                        context.globalAlpha = 0.9;
                        drawImageCover(context, banner, 0, 0, outputSize, outputSize);
                        context.globalAlpha = 1;
                    } catch {
                        setBannerLoadFailed(true);
                    }
                }

                const qrSize = 640;
                const qrX = (outputSize - qrSize) / 2;
                const qrY = 180;

                context.fillStyle = '#ffffff';
                context.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
                context.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

                context.fillStyle = '#FFFF00';
                context.font = 'bold 46px sans-serif';
                context.textAlign = 'center';
                context.fillText(qrCode.name, outputSize / 2, 70);

                context.fillStyle = '#FFFF00';
                context.font = '34px sans-serif';
                context.fillText(qrCode.event.name, outputSize / 2, 120);

                context.fillStyle = '#FFFF00';
                context.font = '22px monospace';
                context.fillText(qrCode.token.substring(0, 8), outputSize / 2, 900);

                downloadCanvas(exportCanvas, createFilename());
            } else {
                const qrOnlyCanvas = document.createElement('canvas');
                const outputSize = 900;
                qrOnlyCanvas.width = outputSize;
                qrOnlyCanvas.height = outputSize;

                const context = qrOnlyCanvas.getContext('2d');
                if (!context) {
                    throw new Error('Unable to create image context');
                }

                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, outputSize, outputSize);

                const qrSize = 760;
                const offset = (outputSize - qrSize) / 2;
                context.drawImage(sourceCanvas, offset, offset, qrSize, qrSize);

                downloadCanvas(qrOnlyCanvas, `qr_${qrCode.id}.png`);
            }

            toast.success('QR code downloaded');
        } catch (error) {
            toast.error('Failed to download QR code');
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-background flex items-center justify-center p-4">
            <Head title={`QR Code - ${qrCode.name}`} />

            <div className="max-w-2xl w-full">
                <div className="mb-4">
                    <Link
                        href="/admin/qr-codes"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to QR Codes
                    </Link>
                </div>
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{qrCode.name}</h1>
                    <p className="text-muted-foreground">{qrCode.event.name}</p>
                </div>

                {/* QR Code Display with Optional Banner */}
                <div
                    className={`bg-background/80 rounded-lg overflow-hidden border-2 border-sidebar-border/50 mb-6 ${
                        canUseBanner ? 'relative' : ''
                    }`}
                >
                    {/* Banner Background */}
                    {canUseBanner && bannerUrl && (
                        <div className="absolute inset-0 opacity-90">
                            <img
                                src={bannerUrl}
                                alt={qrCode.event.name}
                                className="w-full h-full object-cover"
                                onError={() => setBannerLoadFailed(true)}
                            />
                        </div>
                    )}

                    {/* QR Code Container */}
                    <div className="relative p-8 flex flex-col items-center justify-center">
                        {/* QR Code using qrcode.react */}
                        <div className="rounded-lg bg-background/90 p-4 border-4 border-sidebar-border/50 shadow-lg">
                            <QRCodeSVG
                                value={qrValue}
                                size={256}
                                level="H"
                                includeMargin={true}
                            />
                            <QRCodeCanvas
                                value={qrValue}
                                size={256}
                                level="H"
                                includeMargin={true}
                                className="hidden"
                                ref={qrCanvasRef}
                            />
                        </div>

                        {/* Subtle ID Display */}
                        <div className="mt-6 text-center">
                            <div className="flex items-center gap-2 justify-center">
                                <p className="text-xs text-muted-foreground font-mono">
                                    {showId ? qrCode.token.substring(0, 8) : '••••••••'}
                                </p>
                                <button
                                    onClick={() => setShowId(!showId)}
                                    className="text-muted-foreground hover:text-foreground transition"
                                    title={showId ? 'Hide ID' : 'Show ID'}
                                >
                                    {showId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>

                        {/* QR Info */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground mb-3">Scan this code to register or check-in</p>
                            <button
                                onClick={() => copyToClipboard(qrValue)}
                                className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-sidebar/40 hover:bg-sidebar/60 text-foreground rounded transition font-medium"
                            >
                                <Copy className="w-3 h-3" />
                                Copy URL
                            </button>
                        </div>
                    </div>
                </div>

                {/* Download Options */}
                <div className="bg-background/80 border-2 border-sidebar-border/50 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Download QR Code</h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => downloadQRImage(false)}
                            disabled={isDownloading}
                            className="w-full px-4 py-3 bg-black hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download QR Code Only
                        </button>

                        {canUseBanner && (
                            <button
                                onClick={() => downloadQRImage(true)}
                                disabled={isDownloading}
                                className="w-full px-4 py-3 bg-purple-600 hover:bg-black disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download with Banner
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        The QR code ID (<code className="bg-sidebar/40 px-1 rounded text-[10px] font-mono">{qrCode.token.substring(0, 8)}</code>) is embedded in the image
                    </p>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-background/80 border-2 border-sidebar-border/50 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">QR Code Details</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Event:</strong> {qrCode.event.name}</p>
                        <p><strong>Code Name:</strong> {qrCode.name}</p>
                        <p><strong>Full ID:</strong> <code className="bg-sidebar/40 px-1 rounded text-xs font-mono">{qrCode.token}</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
