import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import QRScanner from '@/components/QRScanner';
import { useState } from 'react';

function formatTime12Hour(time: string | null): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function formatDateTime12Hour(dateTimeString: string | null): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

interface Attendee {
    id: number;
    user_id: number;
    is_attended: boolean;
    attended_time: string | null;
    user: {
        first_name: string;
        last_name: string;
        contact_number: string;
        is_first_time: boolean;
    };
}

interface EventShowProps {
    event: {
        id: number;
        name: string;
        date: string;
        start_time: string | null;
        end_time: string | null;
        description: string;
        location: string;
        banner_image?: string | null;
        is_finished?: boolean;
        created_at: string;
        updated_at: string;
    };
    isAdmin: boolean;
    userAttendance?: {
        id: number;
        user_id: number;
        event_id: number;
        is_attended: boolean;
        attended_time: string | null;
    } | null;
    attendees?: Attendee[];
}

export default function ShowEvent() {
    const { event, isAdmin, userAttendance, attendees } =
        usePage<any>().props as EventShowProps;

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const defaultBanner = '/images/default-event.png';

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
                console.log('Inertia navigation did not change location, forcing full redirect');
                window.location.href = absoluteUrl;
            }
        }, 600);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: event.name,
            href: `/events/${event.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 m-8">
                {/* Event Banner */}
                <div className="aspect-video overflow-hidden rounded-xl border border-sidebar-border/70">
                    <img
                        src={event.banner_image ? `/storage/${event.banner_image}` : defaultBanner}
                        alt={event.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Event Details Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
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
                                            event.date
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
                        {isAdmin && (
                            <Link
                                href={`/events/${event.id}/edit`}
                                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            >
                                Edit Event
                            </Link>
                        )}
                    </div>
                </div>

                {/* Description Section */}
                <div className="">
                    <h2 className="text-xl font-semibold text-foreground">
                        About This Event
                    </h2>
                    <p className="mt-4 text-foreground">
                        {event.description}
                    </p>
                </div>

                {/* QR Code Display (Admin Only) */}
                {isAdmin && !event.is_finished && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                        <h2 className="mb-4 text-xl font-semibold text-foreground">
                            Attendance QR Code
                        </h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Display the QR code on a monitor for attendees to scan
                        </p>
                        <Link
                            href={`/events/${event.id}/qr-display`}
                            className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            Open QR Display
                        </Link>
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
                                                {' '}(
                                                {formatDateTime12Hour(
                                                    userAttendance.attended_time
                                                )}
                                                )
                                            </>
                                        )}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        You are registered for this event
                                    </p>
                                )}
                            </div>
                            {!userAttendance.is_attended && (
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                >
                                    Mark Attendance
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Attendees List Section (Admin Only) */}
                {isAdmin && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-foreground">
                                    Event Attendees
                                </h2>
                                {!event.is_finished && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Track attendance for this upcoming event
                                    </p>
                                )}
                            </div>
                            <a
                                href={`/admin/reports/export/event/${event.id}/attendees`}
                                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white  transition-colors gap-2"
                            >
                                <span>↓</span>
                                Download CSV
                            </a>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70">
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">
                                            Contact
                                        </th>
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">
                                            First Time
                                        </th>
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendees?.map((attendee) => (
                                        <tr
                                            key={attendee.id}
                                            className="border-b border-sidebar-border/70"
                                        >
                                            <td className="px-4 py-3 text-foreground">
                                                {attendee.user.first_name}{' '}
                                                {attendee.user.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {attendee.user.contact_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                {attendee.user.is_first_time ? (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                        New
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {attendee.attended_time
                                                    ? formatDateTime12Hour(
                                                          attendee.attended_time
                                                      )
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        {!usePage().props.attendees ||
                            usePage<any>().props.attendees.length === 0 ? (
                                <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                                    No attendees yet
                                </div>
                            ) : null}
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
