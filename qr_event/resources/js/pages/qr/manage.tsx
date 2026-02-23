import React, { useState } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Copy, Eye, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QrCode {
    id: number;
    name: string;
    type: 'static' | 'timed';
    purpose: 'pre-registration' | 'attendance';
    code: string;
    is_active: boolean;
    is_dynamic: boolean;
    expires_at: string | null;
    token: string;
    created_at: string;
}

interface Event {
    id: number;
    name: string;
}

type ManageProps = {
    event: Event;
    qrCodes: QrCode[];
};

export default function Manage({ event, qrCodes }: ManageProps) {
    const [showForm, setShowForm] = useState(false);
    const [qrType, setQrType] = useState<'static' | 'timed'>('static');
    const [qrPurpose, setQrPurpose] = useState<'pre-registration' | 'attendance'>('pre-registration');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'static',
        purpose: 'pre-registration',
        is_dynamic: false,
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/events/${event.id}/qr`, {
            onSuccess: () => {
                setShowForm(false);
                reset();
                toast.success('QR Code created successfully');
            },
        });
    };

    const handleToggle = (qrCode: QrCode) => {
        const action = qrCode.is_active ? 'deactivate' : 'activate';
        router.put(`/events/qr/${qrCode.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`QR Code ${action}d successfully`),
            onError: () => toast.error('Failed to update QR Code'),
        });
    };

    const handleDelete = (qrCode: QrCode) => {
        if (confirm('Are you sure you want to delete this QR code?')) {
            router.delete(`/events/${event.id}/qr/${qrCode.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('QR Code deleted'),
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getStatusBadge = (qrCode: QrCode) => {
        if (!qrCode.is_active) {
            return <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-[#555c63] text-gray-800 dark:text-gray-200 rounded">Inactive</span>;
        }
        return <span className="px-2 py-1 text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">Active</span>;
    };

    return (
        <AppLayout>
            <Head title={`Manage QR Codes - ${event.name}`} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#313638] overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{event.name} - QR Codes</h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Manage your event QR codes. Toggle visibility, track expiration, or create new ones.
                                    </p>
                                </div>
                                {!showForm && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
                                    >
                                        + Create New QR Code
                                    </button>
                                )}
                            </div>

                            {showForm && (
                                <div className="bg-gray-50 dark:bg-[#444a4e] p-6 rounded-lg mb-8 border border-gray-200 dark:border-[#555c63]">
                                    <h2 className="text-xl font-semibold mb-4">Create New QR Code</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">QR Code Name</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Main Entrance"
                                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">QR Type</label>
                                                <select
                                                    value={data.type}
                                                    onChange={(e) => {
                                                        const val = e.target.value as 'static' | 'timed';
                                                        setQrType(val);
                                                        setData('type', val);
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="static">Static (No Expiration)</option>
                                                    <option value="timed">Timed (Set Expiration)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">QR Purpose</label>
                                                <select
                                                    value={data.purpose}
                                                    onChange={(e) => setData('purpose', e.target.value as 'pre-registration' | 'attendance')}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="pre-registration">Pre-Registration (Social Media Link)</option>
                                                    <option value="attendance">Attendance (Check-in Scanner)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                id="is_dynamic"
                                                type="checkbox"
                                                checked={data.is_dynamic}
                                                onChange={(e) => setData('is_dynamic', e.target.checked)}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                            <label htmlFor="is_dynamic" className="text-sm font-medium">
                                                Enable Dynamic QR (Time-rotating code)
                                            </label>
                                        </div>

                                        {qrType === 'timed' && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Expires At</label>
                                                <input
                                                    type="datetime-local"
                                                    value={data.expires_at}
                                                    onChange={(e) => setData('expires_at', e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                                            >
                                                {processing ? 'Creating...' : 'Create QR Code'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowForm(false); reset(); }}
                                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="mt-4">
                                <h2 className="text-xl font-semibold mb-4">
                                    QR Codes ({qrCodes.length})
                                </h2>
                                {qrCodes.length === 0 ? (
                                    <p className="text-gray-500">No QR codes found for this event.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {qrCodes.map((qrCode) => (
                                            <div key={qrCode.id} className="bg-gray-50 dark:bg-[#444a4e] border border-gray-200 dark:border-[#555c63] rounded-lg p-4 hover:shadow-md transition">
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-semibold mb-1">{qrCode.name}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded capitalize">
                                                            {qrCode.type}
                                                        </span>
                                                        <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded capitalize">
                                                            {qrCode.purpose.replace('-', ' ')}
                                                        </span>
                                                        {getStatusBadge(qrCode)}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white dark:bg-[#555c63] rounded p-3 mb-3 border border-gray-200 dark:border-[#666d75]">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Token:</div>
                                                    <code className="text-xs block break-all">{qrCode.token.substring(0, 24)}...</code>
                                                </div>

                                                {qrCode.expires_at && (
                                                    <div className="text-xs text-gray-500 mb-3">
                                                        Expires: {new Date(qrCode.expires_at).toLocaleString()}
                                                    </div>
                                                )}

                                                {qrCode.is_dynamic && (
                                                    <div className="text-xs text-green-600 dark:text-green-400 mb-3 font-medium">
                                                        ✓ Dynamic QR Enabled
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                    <Link
                                                        href={`/admin/qr/${qrCode.id}/view`}
                                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-blue-600 dark:text-blue-400"
                                                        title="View QR Code"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => copyToClipboard(`${window.location.origin}/qr/${qrCode.token}`)}
                                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-blue-600 dark:text-blue-400"
                                                        title="Copy URL"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(qrCode)}
                                                        className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition ${
                                                            qrCode.is_active ? 'text-yellow-600' : 'text-green-600'
                                                        }`}
                                                        title={qrCode.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(qrCode)}
                                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}