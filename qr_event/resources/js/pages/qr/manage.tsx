import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Copy, Eye, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface QrCode {
    id: number;
    name: string;
    type: 'static' | 'timed';
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
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'static' as 'static' | 'timed',
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
        });
    };

    const handleToggle = (qrCode: QrCode) => {
        const method = qrCode.is_active ? 'deactivate' : 'activate';
        fetch(`/events/${event.id}/qr/${qrCode.id}/toggle`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '',
            },
        })
            .then(() => {
                toast.success(
                    `QR Code ${method}d successfully`
                );
                window.location.reload();
            })
            .catch(() => toast.error('Failed to update QR Code'));
    };

    const handleDelete = (qrCode: QrCode) => {
        if (!confirm(`Are you sure you want to delete the QR code "${qrCode.name}"?`)) {
            return;
        }
        fetch(`/events/${event.id}/qr/${qrCode.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '',
            },
        })
            .then(() => {
                toast.success('QR Code deleted successfully');
                window.location.reload();
            })
            .catch(() => toast.error('Failed to delete QR Code'));
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
            return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">Inactive</span>;
        }
        if (isExpired(qrCode)) {
            return <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded">Expired</span>;
        }
        return <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded">Active</span>;
    };

    return (
        <AppLayout>
            <Head title={`Manage QR Codes - ${event.name}`} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold mb-2">{event.name} - QR Codes</h1>
                            </div>

                            {!showForm ? (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    + Create New QR Code
                                </button>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold mb-4">Create New QR Code</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                QR Code Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Entry Gate, VIP Section"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                QR Type
                                            </label>
                                            <select
                                                id="type"
                                                value={qrType}
                                                onChange={(e) => {
                                                    setQrType(e.target.value as 'static' | 'timed');
                                                    setData('type', e.target.value as 'static' | 'timed');
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="static">Static (No Expiration)</option>
                                                <option value="timed">Timed (Set Expiration)</option>
                                            </select>
                                            {errors.type && (
                                                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                                            )}
                                        </div>

                                        {qrType === 'timed' && (
                                            <div>
                                                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Expiration Date & Time
                                                </label>
                                                <input
                                                    id="expires_at"
                                                    type="datetime-local"
                                                    value={data.expires_at}
                                                    onChange={(e) => setData('expires_at', e.target.value)}
                                                    required={qrType === 'timed'}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                                            >
                                                {processing ? 'Creating...' : 'Create QR Code'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowForm(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4">
                                    QR Codes ({qrCodes.length})
                                </h2>
                                {qrCodes.length === 0 ? (
                                    <p className="text-gray-500">No QR codes created yet. Create one to get started!</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b-2 border-gray-300">
                                                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Expires At</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Token</th>
                                                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {qrCodes.map((qrCode) => (
                                                    <tr key={qrCode.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium">
                                                            {qrCode.name}
                                                        </td>
                                                        <td className="py-3 px-4 capitalize">
                                                            {qrCode.type}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {getStatusBadge(qrCode)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {qrCode.expires_at
                                                                ? new Date(
                                                                    qrCode.expires_at
                                                                ).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })
                                                                : 'Never'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                {qrCode.token.substring(0, 8)}...
                                                            </code>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                <a
                                                                    href={route('qr.view', { token: qrCode.token })}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-2 hover:bg-gray-100 rounded transition"
                                                                    title="View QR Code"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </a>
                                                                <button
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            `${window.location.origin}/qr/${qrCode.token}`
                                                                        )
                                                                    }
                                                                    className="p-2 hover:bg-gray-100 rounded transition"
                                                                    title="Copy URL"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggle(qrCode)}
                                                                    className={`p-2 rounded transition ${
                                                                        qrCode.is_active
                                                                            ? 'hover:bg-yellow-100 text-yellow-600'
                                                                            : 'hover:bg-green-100 text-green-600'
                                                                    }`}
                                                                    title={
                                                                        qrCode.is_active
                                                                            ? 'Deactivate'
                                                                            : 'Activate'
                                                                    }
                                                                >
                                                                    <Power className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(qrCode)
                                                                    }
                                                                    className="p-2 hover:bg-red-100 text-red-600 rounded transition"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
