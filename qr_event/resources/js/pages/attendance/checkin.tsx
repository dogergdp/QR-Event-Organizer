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
        description: string | null;
        banner_image?: string | null;
    };
    token: string;
    isAlreadyRegistered: boolean;
    isAlreadyAttended: boolean;
    isFirstTime: boolean;
    hasAnsweredFirstTime?: boolean;
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
    isFirstTime: initialIsFirstTime,
    hasAnsweredFirstTime = false,
}: CheckInProps) {
    const [confirmed, setConfirmed] = useState(false);
    const [isFirstTime, setIsFirstTime] = useState(initialIsFirstTime);
    const { data, setData, post, processing, errors } = useForm({
        token,
        event_id: event.id,
        confirm_attendance: false,
        data_privacy_consent: false,
        is_first_time: (hasAnsweredFirstTime ? initialIsFirstTime : null) as boolean | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Check In', href: '/attendance/scan' },
    ];

    const handleConfirm = () => {
        setData('confirm_attendance', !confirmed);
        setConfirmed(!confirmed);
    };

    const handleFirstTimeToggle = () => {
        setData('is_first_time', !isFirstTime);
        setIsFirstTime(!isFirstTime);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmed) {
            post('/attendance/confirm');
        }
    };

    const defaultBanner = '/images/default-event.png';
    const hasDescription = Boolean(event.description && event.description.trim());

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
                {hasDescription && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                        <h2 className="text-xl font-semibold text-foreground">
                            About This Event
                        </h2>
                        <p className="mt-4 text-foreground">{event.description}</p>
                    </div>
                )}

                {/* Status Messages */}
                {isAlreadyAttended && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                            ✓ You have already checked in to this event
                        </p>
                    </div>
                )}

                {isAlreadyRegistered && !isAlreadyAttended && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
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
                            {!hasAnsweredFirstTime && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-foreground mb-3">
                                        Is this your first time joining such an event?
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setData('is_first_time', true)}
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                data.is_first_time === true
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('is_first_time', false)}
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                data.is_first_time === false
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center gap-3 cursor-pointer mb-6">
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={handleConfirm}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                                <span className="text-foreground">
                                    I confirm my attendance at this event.
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer mb-6 relative">
                                <div className="mt-1 relative flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={data.data_privacy_consent}
                                        onChange={(e) => setData('data_privacy_consent', e.target.checked)}
                                        className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                    />
                                    {data.data_privacy_consent && (
                                        <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm text-foreground">
                                    I consent to data privacy collection for attendance processing.
                                </span>
                            </label>

                            {errors.data_privacy_consent && (
                                <p className="-mt-4 mb-4 text-sm text-red-600">{errors.data_privacy_consent}</p>
                            )}

                            <button
                                type="submit"
                                disabled={!confirmed || !data.data_privacy_consent || processing || (data.is_first_time === null && !hasAnsweredFirstTime)}
                                className="inline-flex items-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
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
