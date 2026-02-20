import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface CheckInProps {
    event: {
        id: number;
        name: string;
        date: string;
        start_time: string | null;
        end_time: string | null;
        location: string;
        description: string;
        banner_image?: string | null;
    };
    token: string;
    isAlreadyRegistered: boolean;
    isAlreadyAttended: boolean;
}

function formatTime12Hour(time: string | null): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export default function CheckIn({
    event,
    token,
    isAlreadyRegistered,
    isAlreadyAttended,
}: CheckInProps) {
    const [confirmed, setConfirmed] = useState(false);
    const { data, setData, post, processing } = useForm({
        token,
        event_id: event.id,
        confirm_attendance: false,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Check In', href: '/attendance/scan' },
    ];

    const handleConfirm = () => {
        setData('confirm_attendance', !confirmed);
        setConfirmed(!confirmed);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmed) {
            post('/attendance/confirm');
        }
    };

    const defaultBanner = '/images/default-event.png';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Check In - ${event.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Event Banner */}
                <div className="aspect-video overflow-hidden rounded-xl border border-sidebar-border/70">
                    <img
                        src={event.banner_image ? `/storage/${event.banner_image}` : defaultBanner}
                        alt={event.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Event Details */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                    <h1 className="text-3xl font-bold text-foreground">
                        {event.name}
                    </h1>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">
                                DATE
                            </p>
                            <p className="mt-1 text-lg text-foreground">
                                {new Date(event.date).toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">
                                START TIME
                            </p>
                            <p className="mt-1 text-lg text-foreground">
                                {formatTime12Hour(event.start_time)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">
                                END TIME
                            </p>
                            <p className="mt-1 text-lg text-foreground">
                                {formatTime12Hour(event.end_time)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">
                                LOCATION
                            </p>
                            <p className="mt-1 text-lg text-foreground">
                                {event.location}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                    <h2 className="text-xl font-semibold text-foreground">
                        About This Event
                    </h2>
                    <p className="mt-4 text-foreground">{event.description}</p>
                </div>

                {/* Status Messages */}
                {isAlreadyAttended && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-sm font-semibold text-green-800">
                            ✓ You have already checked in to this event
                        </p>
                    </div>
                )}

                {isAlreadyRegistered && !isAlreadyAttended && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-800">
                            You are already registered for this event. Please
                            confirm your attendance below.
                        </p>
                    </div>
                )}

                {/* Confirmation Section */}
                {!isAlreadyAttended && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                        <h2 className="text-xl font-semibold text-foreground">
                            Confirm Your Attendance
                        </h2>

                        <form onSubmit={handleSubmit} className="mt-6">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={handleConfirm}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                                <span className="text-foreground">
                                    I confirm my attendance at this event
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={!confirmed || processing}
                                className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                            >
                                {processing
                                    ? 'Confirming...'
                                    : 'Confirm Attendance'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Back to Dashboard */}
                <div>
                    <a
                        href="/dashboard"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Dashboard
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
