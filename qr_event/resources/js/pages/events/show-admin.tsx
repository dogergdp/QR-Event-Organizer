import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Pencil } from 'lucide-react';
import {formatTime12Hour, formatDateTime12Hour, calculateAge, formatDate} from '@/utils/dateUtils';
import { show as showRoute } from '@/routes/events';
import { useState } from 'react';

import type { Attendee, EventShowProps } from './types';

export default function ShowEventAdmin() {
    const { event, attendees, filters, loginRequiresBirthdate } = usePage<any>()
        .props as EventShowProps;

    const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
        null,
    );

    const activeAdminTab = filters?.status ?? 'rsvp';
    const firstTimeFilter = filters?.first_time ?? 'all';

    const setActiveAdminTab = (tab: 'rsvp' | 'attendance') => {
        router.get(
            showRoute.url(event.id),
            { ...filters, status: tab },
            { preserveState: true, replace: true },
        );
    };

    const setFirstTimeFilter = (filter: 'all' | 'yes' | 'no') => {
        router.get(
            showRoute.url(event.id),
            { ...filters, first_time: filter },
            { preserveState: true, replace: true },
        );
    };

    const allAttendees = attendees?.data ?? [];
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

                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={`/events/${event.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Event
                            </Link>
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

                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">User Login Method</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Enable birthdate login, or keep number-only login.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                router.patch(
                                    '/admin/settings/login-birthdate',
                                    { login_with_birthdate: !loginRequiresBirthdate },
                                    { preserveScroll: true },
                                );
                            }}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                loginRequiresBirthdate
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                            }`}
                        >
                            {loginRequiresBirthdate ? 'Birthdate Required' : 'Number Only'}
                        </button>
                    </div>
                </div>

                {/* Attendees List Section */}
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
                            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors"
                        >
                            <span>↓</span>
                            Download CSV
                        </a>
                    </div>

                    <div className="mt-4 border-b border-sidebar-border/70">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveAdminTab('rsvp')
                                    }
                                    className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                                        activeAdminTab === 'rsvp'
                                            ? 'bg-muted text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    RSVP {activeAdminTab === 'rsvp' && `(${attendees?.total ?? 0})`}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveAdminTab('attendance')
                                    }
                                    className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                                        activeAdminTab === 'attendance'
                                            ? 'bg-muted text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Attendance {activeAdminTab === 'attendance' && `(${attendees?.total ?? 0})`}
                                </button>
                            </div>

                            {/* First-time filter toggle */}
                            <div className="flex items-center gap-2 pb-2 md:pb-0">
                                <span className="text-xs font-medium text-muted-foreground">
                                    First time:
                                </span>

                                <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFirstTimeFilter('all')
                                        }
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            firstTimeFilter === 'all'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFirstTimeFilter('yes')
                                        }
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            firstTimeFilter === 'yes'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFirstTimeFilter('no')
                                        }
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            firstTimeFilter === 'no'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
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
                                    {activeAdminTab === 'rsvp' && (
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">
                                            Paid
                                        </th>
                                    )}
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        {activeAdminTab === 'attendance'
                                            ? 'Attended Time'
                                            : 'Status'}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {allAttendees.map((attendee: Attendee) => (
                                    <tr
                                        key={attendee.id}
                                        className="border-b border-sidebar-border/70 transition-colors hover:bg-sidebar/50"
                                    >
                                        <td className="px-4 py-3 text-foreground">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedAttendee(
                                                        attendee,
                                                    )
                                                }
                                                className="text-left transition-colors hover:text-primary hover:underline"
                                            >
                                                {attendee.user.first_name}{' '}
                                                {attendee.user.last_name}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 text-muted-foreground">
                                            {attendee.user.contact_number}
                                        </td>

                                        <td className="px-4 py-3 text-muted-foreground">
                                            {attendee.is_first_time
                                                ? 'Yes'
                                                : 'No'}
                                        </td>

                                        {activeAdminTab === 'rsvp' && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        router.patch(
                                                            `/admin/attendees/${attendee.id}/payment`,
                                                            { is_paid: !attendee.is_paid },
                                                            {
                                                                preserveScroll: true,
                                                                preserveState: true,
                                                            },
                                                        );
                                                    }}
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                        attendee.is_paid
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {attendee.is_paid ? 'Paid' : 'Unpaid'}
                                                </button>
                                            </td>
                                        )}

                                        <td className="px-4 py-3 text-muted-foreground">
                                            {activeAdminTab ===
                                            'attendance' ? (
                                                attendee.attended_time ? (
                                                    formatDateTime12Hour(
                                                        attendee.attended_time,
                                                    )
                                                ) : (
                                                    '—'
                                                )
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
                    </div>

                    {attendees && attendees.data.length === 0 && (
                        <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                            {activeAdminTab === 'rsvp'
                                ? 'No RSVPs found for this selection'
                                : 'No attendance records found for this selection'}
                        </div>
                    )}

                    {attendees && attendees.data.length > 0 && (
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">
                                Showing {attendees.from ?? 0} to {attendees.to ?? 0} of{' '}
                                <span className="font-semibold text-foreground">{attendees.total}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {attendees.links.map((link: any, index: number) => {
                                    const isDisabled = !link.url;
                                    const label = link.label.replace(/&laquo;|&raquo;/g, (match: string) => {
                                        return match === '&laquo;' ? '«' : '»';
                                    });

                                    if (isDisabled) {
                                        return (
                                            <span
                                                key={`${link.label}-${index}`}
                                                className="rounded-md px-3 py-1 text-sm font-medium border border-sidebar-border/70 text-muted-foreground cursor-not-allowed opacity-50"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <button
                                            key={`${link.label}-${index}`}
                                            onClick={() => {
                                                window.location.href = link.url as string;
                                            }}
                                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border border-sidebar-border/70 text-foreground hover:bg-sidebar/50'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* User Details Modal */}
                {selectedAttendee && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setSelectedAttendee(null)}
                    >
                        <div
                            className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-foreground">
                                    User Details
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setSelectedAttendee(null)}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 border-t border-sidebar-border/70 pt-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Name
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {selectedAttendee.user.first_name}{' '}
                                        {selectedAttendee.user.last_name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Contact Number
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.user.contact_number}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Age
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {calculateAge(selectedAttendee.user.birthdate)} years old
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Birthday
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {formatDate(selectedAttendee.user.birthdate)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Wants to join a DG group?
                                    </p>
                                    <p className="text-sm text-foreground capitalize">
                                        {selectedAttendee.user.want_to_join_dg === 'yes' ? 'Yes' : selectedAttendee.user.want_to_join_dg === 'no' ? 'No' : 'Not specified'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        First Time Attendee
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.is_first_time
                                            ? 'Yes'
                                            : 'No'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Remarks
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.user.remarks ||
                                            'No remarks'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAttendee(null)}
                                    className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sidebar/50"
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
