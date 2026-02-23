import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Copy, Eye, Power, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
}

interface QRCode {
    id: number;
    name: string;
    purpose: 'pre-registration' | 'attendance';
    is_active: boolean;
    expires_at: string | null;
    token: string;
    created_at: string;
    is_valid: boolean;
    event: {
        id: number;
        name: string;
    };
}

type QRIndexProps = {
    qrCodes: QRCode[];
    events: Event[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'QR Codes',
        href: '/admin/qr-codes',
    },
];

export default function QRIndex() {
    const { qrCodes, events } = usePage().props as unknown as QRIndexProps;
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [qrType, setQrType] = useState<'static' | 'timed'>('static');
    const [qrPurpose, setQrPurpose] = useState<'pre-registration' | 'attendance'>('attendance');
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'static' as 'static' | 'timed',
        purpose: 'attendance' as 'pre-registration' | 'attendance',
        is_dynamic: false,
        expires_at: '',
    });

    const filteredQRCodes = qrCodes.filter((qr) =>
        qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateQR = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) {
            toast.error('Please select an event');
            return;
        }
        post(`/events/${selectedEventId}/qr`, {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
                setSelectedEventId(null);
                toast.success('QR Code created successfully');
            },
            onError: () => {
                toast.error('Failed to create QR Code');
            }
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setSelectedEventId(null);
        reset();
    };

    const handleToggle = (qr: QRCode) => {
        const action = qr.is_active ? 'deactivated' : 'activated';
        router.put(`/events/qr/${qr.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`QR code ${action}`);
            },
            onError: () => {
                toast.error('Failed to update QR code status');
            },
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getStatusBadge = (qr: QRCode) => {
        if (!qr.is_active) {
                            return <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-[#555c63] text-gray-800 dark:text-gray-200 rounded">Inactive</span>;
        }
        return <span className="px-2 py-1 text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">Active</span>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Codes" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 bg-white dark:bg-[#313638]">

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by QR code name or event..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#555c63] rounded-lg bg-white dark:bg-[#444a4e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* QR Codes Table */}
                {filteredQRCodes.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-300 dark:border-[#555c63] p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {qrCodes.length === 0
                            ? 'No QR codes created yet.'
                            : 'No QR codes match your search.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-[#555c63]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-300 dark:border-[#555c63] bg-gray-50 dark:bg-[#444a4e]">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Event</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Purpose</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Expires At</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Token</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Created</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQRCodes.map((qr) => (
                                    <tr
                                        key={qr.id}
                                        className="border-b border-gray-200 dark:border-[#555c63] hover:bg-gray-50 dark:hover:bg-[#444a4e] text-gray-900 dark:text-gray-100"
                                    >
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/events/${qr.event.id}`}
                                                className="font-semibold text-black dark:text-white transition-all hover:underline hover:scale-[1.03]"
                                            >
                                                {qr.event.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 capitalize">
                                            {qr.purpose.replace('-', ' ')}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(qr)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {qr.expires_at
                                                ? new Date(qr.expires_at).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )
                                                : 'Never'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <code className="text-xs bg-gray-100 dark:bg-[#555c63] px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                                                {qr.token.substring(0, 8)}...
                                            </code>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {new Date(qr.created_at).toLocaleDateString(
                                                'en-US',
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    href={`/admin/qr/${qr.id}/view`}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-black dark:text-white"
                                                    title="View QR Code"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            `${window.location.origin}/qr/${qr.token}`
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-black dark:text-white"
                                                    title="Copy URL"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(qr)}
                                                    className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition ${
                                                        qr.is_active
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}
                                                    title={qr.is_active ? 'Deactivate QR code' : 'Activate QR code'}
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Showing {filteredQRCodes.length} of {qrCodes.length} QR codes
                </p>

                {/* Create QR Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#313638] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#555c63] bg-white dark:bg-[#313638]">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New QR Code</h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateQR} className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Event
                                    </label>
                                    <select
                                        id="event"
                                        value={selectedEventId || ''}
                                        onChange={(e) => setSelectedEventId(Number(e.target.value))}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select an event...</option>
                                        {events.map((event) => (
                                            <option key={event.id} value={event.id}>
                                                {event.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        QR Code Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Entry Gate, VIP Section"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            QR Type
                                        </label>
                                        <select
                                            id="type"
                                            value={qrType}
                                            onChange={(e) => {
                                                setQrType(e.target.value as 'static' | 'timed');
                                                setData('type', e.target.value as 'static' | 'timed');
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="static">Static (No Expiration)</option>
                                            <option value="timed">Timed (Set Expiration)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            QR Purpose
                                        </label>
                                        <select
                                            id="purpose"
                                            value={qrPurpose}
                                            onChange={(e) => {
                                                setQrPurpose(e.target.value as 'pre-registration' | 'attendance');
                                                setData('purpose', e.target.value as 'pre-registration' | 'attendance');
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pre-registration">Pre-Registration (Social Media)</option>
                                            <option value="attendance">Attendance (Check-in)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="is_dynamic"
                                        type="checkbox"
                                        checked={data.is_dynamic}
                                        onChange={(e) => setData('is_dynamic', e.target.checked)}
                                        className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 accent-blue-600"
                                    />
                                    <label htmlFor="is_dynamic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Enable Dynamic QR (Time-rotating code)
                                    </label>
                                </div>

                                {qrType === 'timed' && (
                                    <div>
                                        <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Expires At
                                        </label>
                                        <input
                                            id="expires_at"
                                            type="datetime-local"
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                            required={qrType === 'timed'}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.expires_at && (
                                            <p className="text-red-500 text-sm mt-1">{errors.expires_at}</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition font-medium"
                                    >
                                        {processing ? 'Creating...' : 'Create QR Code'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
