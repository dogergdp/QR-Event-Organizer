import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import QRScanner from '@/components/QRScanner';
import { useState } from 'react';
import {formatTime12Hour, formatDateTime12Hour} from '@/utils/dateUtils';
import { show as showRoute } from '@/routes/events';

import type { EventShowProps } from './types';

export default function ShowEventUser() {
    const { event, userAttendance } = usePage<any>().props as EventShowProps;

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScan = (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);
        setIsScannerOpen(false);

        let url = decodedText;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                url = urlObj.pathname + urlObj.search;
            } catch (e) {
                console.error('Invalid URL:', url, e);
                return;
            }
        }

        if (!url.startsWith('/')) {
            url = `/${url}`;
        }

        const currentPath = window.location.pathname + window.location.search;
        const absoluteUrl = `${window.location.origin}${url}`;

        console.log('Navigating to:', url);

        try {
            router.visit(url, {
                preserveState: false,
                preserveScroll: false,
            });
        } catch (error) {
            console.error('Navigation error:', error);
            console.log('Falling back to window.location.href');
            window.location.href = absoluteUrl;
        }

        window.setTimeout(() => {
            const nextPath = window.location.pathname + window.location.search;
            if (nextPath === currentPath) {
                console.log(
                    'Inertia navigation did not change location, forcing full redirect',
                );
                window.location.href = absoluteUrl;
            }
        }, 600);
    };

    const defaultBanner = '/images/default-event.jpg';
    const hasDescription = Boolean(
        event.description && event.description.trim(),
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: event.name, href: `/events/${event.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.name} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Event Banner */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                    <div className="aspect-video overflow-hidden rounded-xl">
                        <img
                            src={
                                event.banner_image
                                    ? `/storage/${event.banner_image}`
                                    : defaultBanner
                            }
                            alt={event.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                {/* Event Details Section */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground">
                                {event.name}
                            </h1>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        DATE
                                    </p>
                                    <p className="mt-1 text-lg text-foreground">
                                        {new Date(
                                            event.date,
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        START TIME
                                    </p>
                                    <p className="mt-1 text-lg text-foreground">
                                        {event.start_time
                                            ? formatTime12Hour(event.start_time)
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        END TIME
                                    </p>
                                    <p className="mt-1 text-lg text-foreground">
                                        {event.end_time
                                            ? formatTime12Hour(event.end_time)
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        LOCATION
                                    </p>
                                    <p className="mt-1 text-lg text-foreground">
                                        {event.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {hasDescription && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                        <h2 className="text-xl font-semibold text-foreground">
                            About This Event
                        </h2>
                        <p className="mt-4 text-foreground">
                            {event.description}
                        </p>
                    </div>
                )}

                {/* RSVP Section (for non-registered users) */}
                {!event.is_finished && !userAttendance && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-foreground">
                                    Register for This Event
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    RSVP now to confirm your attendance
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="rounded-lg border-2 border-black bg-transparent px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/10"
                                >
                                    Scan QR to RSVP
                                </button>

                                <Link
                                    href={`/events/${event.id}/rsvp`}
                                    className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                    RSVP Now
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Section */}
                {!event.is_finished && userAttendance && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-foreground">
                                    Your Attendance
                                </h2>

                                {userAttendance.is_attended ? (
                                    <p className="mt-2 text-sm text-green-600">
                                        ✓ You have attended this event
                                        {userAttendance.attended_time && (
                                            <>
                                                {' '}
                                                (
                                                {formatDateTime12Hour(
                                                    userAttendance.attended_time,
                                                )}
                                                )
                                            </>
                                        )}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        You are registered for this event. Scan
                                        the attendance QR code at the venue to
                                        mark your attendance.
                                    </p>
                                )}
                            </div>

                            {!userAttendance.is_attended && (
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                    Scan QR to Mark Attendance
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* QR Scanner Modal */}
                <QRScanner
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScan={handleScan}
                />
            </div>
        </AppLayout>
    );
}
