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
    const defaultBannerUrl = '/images/default-event.jpg';

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


    const downloadQRImage = async (withBanner: boolean) => {
        setIsDownloading(true);
        try {
            if (!qrCanvasRef.current) {
                toast.error('QR canvas not ready');
                return;
            }

            const sourceCanvas = qrCanvasRef.current;

            if (withBanner) {
                const outputSize = 1200;
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = outputSize;
                exportCanvas.height = outputSize; // Square export

                const context = exportCanvas.getContext('2d');
                if (!context) {
                    toast.error('Unable to create image context');
                    return;
                }

                // 1. Solid White Background
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, outputSize, outputSize);

                // --- NEW DYNAMIC LAYOUT ---

                // A. Define QR and Text areas first to know how much room is left for image
                const qrSize = 650;
                const qrX = (outputSize - qrSize) / 2;
                const qrY = (outputSize - qrSize) / 2 - 40; // Shifted up slightly to allow more space below for text

                const textPadding = 120; // Increased padding from 80
                const titleFontSize = 50;
                const eventFontSize = 32;

                const titleY = qrY + qrSize + textPadding;
                const eventY = titleY + 60;
                const tokenIdY = outputSize - 30;

                // B. Calculate Banner Area
                // The banner area starts from top (0) and ends at the top of the QR plate
                const bannerPadding = 40;
                const qrPlatePadding = 60;
                const qrPlateY = qrY - qrPlatePadding / 2;
                const bannerMaxHeight = qrPlateY - bannerPadding;

                // 2. Draw Banner with Black Row filling
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, outputSize, bannerMaxHeight);

                const bannerUrlToUse = "/images/ccf-logo.png";
                try {
                    const banner = await loadImage(bannerUrlToUse);

                    // Center the image within the black bar
                    const targetHeight = bannerMaxHeight * 0.8; // Use 80% of available height
                    const bannerAspect = banner.width / banner.height;
                    const targetWidth = targetHeight * bannerAspect;

                    const drawX = (outputSize - targetWidth) / 2;
                    const drawY = (bannerMaxHeight - targetHeight) / 2;

                    context.drawImage(banner, drawX, drawY, targetWidth, targetHeight);
                } catch (err) {
                    console.error("Banner load failed", err);
                }

                // 3. Draw QR Code (Dead Center)
                const bgX = qrX - qrPlatePadding / 2;
                const bgY = qrPlateY;
                const bgSize = qrSize + qrPlatePadding;
                const radius = 40;

                context.fillStyle = '#f3f4f6';
                const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, r: number) => {
                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.lineTo(x + width - r, y);
                    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
                    ctx.lineTo(x + width, y + height - r);
                    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
                    ctx.lineTo(x + r, y + height);
                    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
                    ctx.lineTo(x, y + r);
                    ctx.quadraticCurveTo(x, y, x + r, y);
                    ctx.closePath();
                    ctx.fill();
                };

                drawRoundedRect(context, bgX, bgY, bgSize, bgSize, radius);
                context.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

                // 4. Draw Text (Black text below QR)
                context.fillStyle = '#000000';
                context.textAlign = 'center';
                context.font = `bold ${titleFontSize}px sans-serif`;
                context.fillText(qrCode.name, outputSize / 2, titleY);

                context.font = `${eventFontSize}px sans-serif`;
                context.fillText(qrCode.event.name, outputSize / 2, eventY);

                // 5. Tiny ID at the absolute bottom
                context.fillStyle = '#9ca3af';
                context.font = '18px monospace';
                context.fillText(qrCode.token.substring(0, 8), outputSize / 2, tokenIdY);

                downloadCanvas(exportCanvas, createFilename());
            } else {
                const qrOnlyCanvas = document.createElement('canvas');
                const outputSize = 900;
                qrOnlyCanvas.width = outputSize;
                qrOnlyCanvas.height = outputSize;

                const context = qrOnlyCanvas.getContext('2d');
                if (!context) {
                    toast.error('Unable to create image context');
                    return;
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
                        <div className="rounded-2xl bg-background/90 p-4 border-4 border-sidebar-border/50 shadow-lg">
                            <QRCodeSVG
                                value={qrValue}
                                size={256}
                                level="H"
                                marginSize={3}
                            />
                            <QRCodeCanvas
                                value={qrValue}
                                size={256}
                                level="H"
                                className="hidden"
                                ref={qrCanvasRef}
                                marginSize={3}
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
