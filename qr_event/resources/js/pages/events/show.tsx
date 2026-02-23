import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import QRScanner from '@/components/QRScanner';
import { useState } from 'react';
import { Pencil, Eye } from 'lucide-react';

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
    const [activeAdminTab, setActiveAdminTab] = useState<'rsvp' | 'attendance'>('rsvp');
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const allAttendees = attendees ?? [];
    const rsvpAttendees = allAttendees.filter((attendee) => !attendee.is_attended);
    const attendanceAttendees = allAttendees.filter((attendee) => attendee.is_attended);

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
                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    href={`/events/${event.id}/edit`}
                                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit Event
                                </Link>
                            </div>
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

                {/* RSVP Section (for non-registered users) */}
                {!isAdmin && !event.is_finished && !userAttendance && (
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
                                    className="rounded-lg border-2 border-primary bg-transparent px-6 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                                >
                                    Scan QR to RSVP
                                </button>
                                <Link
                                    href={`/events/${event.id}/rsvp`}
                                    className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
                                        You are registered for this event. Scan the attendance QR code at the venue to mark your attendance.
                                    </p>
                                )}
                            </div>
                            {!userAttendance.is_attended && (
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                >
                                    Scan QR to Mark Attendance
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

                        <div className="mt-4 border-b border-sidebar-border/70">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveAdminTab('rsvp')}
                                    className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                                        activeAdminTab === 'rsvp'
                                            ? 'bg-muted text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    RSVP ({rsvpAttendees.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveAdminTab('attendance')}
                                    className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                                        activeAdminTab === 'attendance'
                                            ? 'bg-muted text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Attendance ({attendanceAttendees.length})
                                </button>
                            </div>
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
                                            {activeAdminTab === 'attendance' ? 'Attended Time' : 'Status'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeAdminTab === 'rsvp'
                                        ? rsvpAttendees
                                        : attendanceAttendees
                                    ).map((attendee) => (
                                        <tr
                                            key={attendee.id}
                                            className="border-b border-sidebar-border/70 hover:bg-sidebar/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-foreground">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser(attendee.user)}
                                                    className="hover:text-primary hover:underline transition-colors text-left"
                                                >
                                                    {attendee.user.first_name}{' '}
                                                    {attendee.user.last_name}
                                                </button>
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
                                                {activeAdminTab === 'attendance' ? (
                                                    attendee.attended_time
                                                        ? formatDateTime12Hour(
                                                              attendee.attended_time
                                                          )
                                                        : '—'
                                                ) : attendee.is_attended ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                        Attended
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                                        RSVP Only
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        {(activeAdminTab === 'rsvp'
                            ? rsvpAttendees.length === 0
                            : attendanceAttendees.length === 0) ? (
                            <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                                {activeAdminTab === 'rsvp'
                                    ? 'No RSVPs yet'
                                    : 'No attendance records yet'}
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

                {/* User Details Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedUser(null)}>
                        <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-foreground">User Details</h2>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 border-t border-sidebar-border/70 pt-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Name</p>
                                    <p className="text-sm font-medium text-foreground">{selectedUser.first_name} {selectedUser.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Contact Number</p>
                                    <p className="text-sm text-foreground">{selectedUser.contact_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">First Time Attendee</p>
                                    <p className="text-sm text-foreground">{selectedUser.is_first_time ? 'Yes' : 'No'}</p>
                                </div>
                                {selectedUser.remarks && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Remarks</p>
                                        <p className="text-sm text-foreground">{selectedUser.remarks}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground hover:bg-sidebar/50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
