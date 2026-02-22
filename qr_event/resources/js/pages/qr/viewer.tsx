import { Head, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Download, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

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
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const downloadQRImage = async (withBanner: boolean) => {
        setIsDownloading(true);
        try {
            if (withBanner && qrContainerRef.current) {
                // Download with banner background
                const canvas = await html2canvas(qrContainerRef.current, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                });
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `${qrCode.event.name.replace(/\s+/g, '_')}_${qrCode.name.replace(/\s+/g, '_')}.png`;
                link.click();
            } else {
                // Download just QR code as SVG
                const svg = document.querySelector('svg') as SVGSVGElement;
                if (svg) {
                    const canvas = await html2canvas(svg.parentElement!, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                    });
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `qr_${qrCode.id}.png`;
                    link.click();
                }
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
        <div className="min-h-screen bg-white dark:bg-[#313638] flex items-center justify-center p-4">
            <Head title={`QR Code - ${qrCode.name}`} />

            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-2">{qrCode.name}</h1>
                    <p className="text-muted-foreground">{qrCode.event.name}</p>
                </div>

                {/* QR Code Display with Optional Banner */}
                <div
                    ref={qrContainerRef}
                    className={`bg-white rounded-lg overflow-hidden border-2 border-[#555c63] mb-6 ${
                        qrCode.event.banner_image ? 'relative' : ''
                    }`}
                >
                    {/* Banner Background */}
                    {qrCode.event.banner_image && (
                        <div className="absolute inset-0 opacity-30">
                            <img
                                src={qrCode.event.banner_image}
                                alt={qrCode.event.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* QR Code Container */}
                    <div className="relative p-8 flex flex-col items-center justify-center">
                        {/* QR Code using qrcode.react */}
                        <div className="rounded-lg bg-white p-4 border-4 border-white shadow-lg">
                            <QRCodeSVG
                                value={`${window.location.origin}/qr/${qrCode.token}`}
                                size={256}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        {/* Subtle ID Display */}
                        <div className="mt-6 text-center">
                            <div className="flex items-center gap-2 justify-center">
                                <p className="text-xs text-gray-400 font-mono">
                                    {showId ? qrCode.token.substring(0, 8) : '••••••••'}
                                </p>
                                <button
                                    onClick={() => setShowId(!showId)}
                                    className="text-gray-400 hover:text-gray-600 transition"
                                    title={showId ? 'Hide ID' : 'Show ID'}
                                >
                                    {showId ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>

                        {/* QR Info */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 mb-3">Scan this code to register or check-in</p>
                            <button
                                onClick={() => copyToClipboard(`${window.location.origin}/qr/${qrCode.token}`)}
                                className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                            >
                                <Copy className="w-3 h-3" />
                                Copy URL
                            </button>
                        </div>
                    </div>
                </div>

                {/* Download Options */}
                <div className="bg-white dark:bg-[#444a4e] border-2 border-[#555c63] rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Download QR Code</h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => downloadQRImage(false)}
                            disabled={isDownloading}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download QR Code Only
                        </button>

                        {qrCode.event.banner_image && (
                            <button
                                onClick={() => downloadQRImage(true)}
                                disabled={isDownloading}
                                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download with Banner
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        The QR code ID (<code className="bg-gray-100 dark:bg-[#555c63] px-1 rounded text-[10px]">{qrCode.token.substring(0, 8)}</code>) is embedded in the image
                    </p>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-blue-50 dark:bg-[#444a4e] border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">QR Code Details</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Event:</strong> {qrCode.event.name}</p>
                        <p><strong>Code Name:</strong> {qrCode.name}</p>
                        <p><strong>Full ID:</strong> <code className="bg-gray-100 dark:bg-[#555c63] px-1 rounded text-xs font-mono">{qrCode.token}</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
