import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react'; // Added router
import AppLayout from '@/layouts/app-layout';
import { Copy, Eye, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QrCode {
    id: number;
    name: string;
    type: 'static' | 'timed';
    purpose: 'pre-registration' | 'attendance';
    is_dynamic: boolean;
    code: string;
    is_active: boolean;
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
    const [qrPurpose, setQrPurpose] = useState<'pre-registration' | 'attendance'>('attendance');
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'static' as 'static' | 'timed',
        purpose: 'attendance' as 'pre-registration' | 'attendance',
        is_dynamic: false,
        expires_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/events/${event.id}/qr`, {
            onSuccess: () => {
                reset();
                setShowForm(false);
                toast.success('QR Code created successfully');
            },
            onError: () => {
                toast.error('Failed to create QR Code');
            }
        });
    };

    const handleToggle = (qrCode: QrCode) => {
        const method = qrCode.is_active ? 'deactivate' : 'activate';
        
        // Use Inertia router instead of fetch
        router.put(`/events/${event.id}/qr/${qrCode.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`QR Code ${method}d successfully`);
            },
            onError: () => {
                toast.error('Failed to update QR Code');
            }
        });
    };

    const handleDelete = (qrCode: QrCode) => {
        if (!confirm(`Are you sure you want to delete the QR code "${qrCode.name}"?`)) {
            return;
        }

        // Use Inertia router instead of fetch
        router.delete(`/events/${event.id}/qr/${qrCode.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('QR Code deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete QR Code');
            }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const isExpired = (qrCode: QrCode) => {
        if (!qrCode.expires_at) return false;
        return new Date(qrCode.expires_at) < new Date();
    };

    const getStatusBadge = (qrCode: QrCode) => {
        if (!qrCode.is_active) {
            return <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-[#555c63] text-gray-800 dark:text-gray-200 rounded">Inactive</span>;
        }
        if (isExpired(qrCode)) {
            return <span className="px-2 py-1 text-xs bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">Expired</span>;
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
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold mb-2">{event.name} - QR Codes</h1>
                            </div>

                            {!showForm ? (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mb-6 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
                                >
                                    + Create New QR Code
                                </button>
                            ) : (
                                <div className="bg-gray-50 dark:bg-[#444a4e] p-6 rounded-lg mb-6 border border-gray-200 dark:border-[#555c63]">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New QR Code</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                            {errors.type && (
                                                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                                            )}
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
                                                <option value="pre-registration">Pre-Registration (Social Media Link)</option>
                                                <option value="attendance">Attendance (Check-in Scanner)</option>
                                            </select>
                                            {errors.purpose && (
                                                <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                id="is_dynamic"
                                                type="checkbox"
                                                checked={data.is_dynamic}
                                                onChange={(e) => setData('is_dynamic', e.target.checked)}
                                                className="w-4 h-4 border border-gray-300 dark:border-[#555c63] rounded bg-white dark:bg-[#444a4e] accent-blue-600"
                                            />
                                            <label htmlFor="is_dynamic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Enable Dynamic QR (Time-rotating code - logged-in users only)
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

                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition font-medium"
                                            >
                                                {processing ? 'Creating...' : 'Create QR Code'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                    QR Codes ({qrCodes.length})
                                </h2>
                                {qrCodes.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">No QR codes created yet. Create one to get started!</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {qrCodes.map((qrCode) => (
                                            <div key={qrCode.id} className="bg-gray-50 dark:bg-[#444a4e] border border-gray-200 dark:border-[#555c63] rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition">
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{qrCode.name}</h3>
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
                                                    <code className="text-xs text-gray-900 dark:text-gray-100 block break-all">{qrCode.token.substring(0, 16)}...</code>
                                                </div>

                                                {qrCode.expires_at && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                        Expires: {new Date(qrCode.expires_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
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
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-blue-600 dark:text-blue-400"
                                                        title="View QR Code"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => copyToClipboard(`${window.location.origin}/qr/${qrCode.token}`)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-blue-600 dark:text-blue-400"
                                                        title="Copy URL"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggle(qrCode)}
                                                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition ${
                                                            qrCode.is_active
                                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                        }`}
                                                        title={qrCode.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(qrCode)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-red-600 dark:text-red-400"
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