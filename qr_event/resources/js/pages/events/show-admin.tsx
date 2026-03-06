import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Pencil } from 'lucide-react';
import {formatTime12Hour, formatDateTime12Hour} from '@/utils/dateUtils';
import { show as showRoute } from '@/routes/events';
import { useState } from 'react';

import type { Attendee, EventShowProps } from './types';

export default function ShowEventAdmin() {
    const { event, attendees, filters } = usePage<any>()
        .props as EventShowProps;

    const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
        null,
    );
    const [paymentModalAttendee, setPaymentModalAttendee] = useState<Attendee | null>(null);
    const [paymentIsPaid, setPaymentIsPaid] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('0');
    const [paymentType, setPaymentType] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');

    const activeAdminTab = filters?.status ?? 'rsvp';
    const firstTimeFilter = filters?.first_time ?? 'all';
    const walkInFilter = filters?.walk_in ?? 'all';
    const paidFilter = filters?.paid ?? 'all';

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

    const setWalkInFilter = (filter: 'all' | 'yes' | 'no') => {
        router.get(
            showRoute.url(event.id),
            { ...filters, walk_in: filter },
            { preserveState: true, replace: true },
        );
    };

    const setPaidFilter = (filter: 'all' | 'yes' | 'no') => {
        router.get(
            showRoute.url(event.id),
            { ...filters, paid: filter },
            { preserveState: true, replace: true },
        );
    };

    const openPaymentModal = (attendee: Attendee) => {
        setPaymentModalAttendee(attendee);
        setPaymentIsPaid(attendee.is_paid);
        setPaymentAmount(attendee.amount_paid ?? '0');
        setPaymentType(attendee.payment_type ?? '');
        setPaymentRemarks(attendee.payment_remarks ?? '');
    };

    const savePaymentDetails = () => {
        if (!paymentModalAttendee) {
            return;
        }

        const parsedAmount = Number(paymentAmount);
        if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
            window.alert('Please enter a valid amount in pesos.');
            return;
        }

        router.patch(
            `/admin/attendees/${paymentModalAttendee.id}/payment`,
            {
                is_paid: paymentIsPaid,
                amount_paid: paymentIsPaid ? parsedAmount : null,
                payment_type: paymentType || null,
                payment_remarks: paymentRemarks || null,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setPaymentModalAttendee(null);
                },
            },
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
                            <h2 className="text-base font-semibold text-foreground">Login Method for This Event</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose how attendees log in from this event's QR.
                            </p>
                        </div>
                        <div className="inline-flex rounded-md border border-sidebar-border/70 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    router.patch(
                                        `/events/${event.id}/login-method`,
                                        { login_requires_birthdate: false },
                                        { preserveScroll: true },
                                    );
                                }}
                                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                    !event.login_requires_birthdate
                                        ? 'bg-green-100 text-green-800'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Use Number Only
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    router.patch(
                                        `/events/${event.id}/login-method`,
                                        { login_requires_birthdate: true },
                                        { preserveScroll: true },
                                    );
                                }}
                                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                    event.login_requires_birthdate
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Require Birthdate
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">Event Attendees</h2>
                            <p className="mt-1 text-sm text-muted-foreground">View and manage attendees on a dedicated page.</p>
                        </div>

                        <Link
                            href={`/events/${event.id}/attendees`}
                            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            View Attendees
                        </Link>
                    </div>
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

                {paymentModalAttendee && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setPaymentModalAttendee(null)}
                    >
                        <div
                            className="w-full max-w-md rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-foreground">Update Payment</h2>
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalAttendee(null)}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="mb-4 text-sm text-muted-foreground">
                                {paymentModalAttendee.user.first_name} {paymentModalAttendee.user.last_name}
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Payment Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentIsPaid((prev) => !prev)}
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                            paymentIsPaid
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {paymentIsPaid ? 'Paid' : 'Unpaid'}
                                    </button>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Amount (PHP)</label>
                                    <div className="flex items-center rounded-md border border-sidebar-border/70 px-3 py-2">
                                        <span className="mr-2 text-sm text-muted-foreground">₱</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="w-full bg-transparent text-sm text-foreground outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Payment Type</label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        className="w-full rounded-md border border-sidebar-border/70 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                                    >
                                        <option value="">Select payment type</option>
                                        <option value="cash">Cash</option>
                                        <option value="gcash">GCash</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-muted-foreground">Remarks</label>
                                    <input
                                        type="text"
                                        value={paymentRemarks}
                                        onChange={(e) => setPaymentRemarks(e.target.value)}
                                        placeholder="Extra remarks (optional)"
                                        className="w-full rounded-md border border-sidebar-border/70 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalAttendee(null)}
                                    className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sidebar/50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={savePaymentDetails}
                                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                    Event Attendee Details
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

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Registration Type
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.is_walk_in ? 'Walk-in' : 'Regular'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Payment Status
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.is_paid ? 'Paid' : 'Unpaid'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Amount Paid (PHP)
                                    </p>
                                    <p className="text-sm text-foreground">
                                        ₱{selectedAttendee.amount_paid ?? '0'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Attendance Status
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.is_attended ? 'Attended' : 'RSVP Only'}
                                    </p>
                                </div>

                                {selectedAttendee.attended_time && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Attended Time
                                        </p>
                                        <p className="text-sm text-foreground">
                                            {formatDateTime12Hour(selectedAttendee.attended_time)}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        First Time Attendee
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedAttendee.is_first_time ? 'Yes' : 'No'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Plus Ones ({selectedAttendee.plus_ones?.length ?? 0})
                                    </p>
                                    {selectedAttendee.plus_ones && selectedAttendee.plus_ones.length > 0 ? (
                                        <ul className="mt-1 space-y-1 text-sm text-foreground">
                                            {selectedAttendee.plus_ones.map((plusOne, index) => (
                                                <li key={plusOne.id ?? index}>
                                                    {plusOne.full_name ?? 'Unnamed'}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-foreground">None</p>
                                    )}
                                </div>

                                {selectedAttendee.plus_ones && selectedAttendee.plus_ones.length > 0 && (
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Plus One Details
                                        </p>
                                        <div className="mt-1 space-y-2 text-xs text-foreground">
                                            {selectedAttendee.plus_ones.map((plusOne, index) => (
                                                <div key={`${plusOne.id ?? 'plus-one'}-${index}`} className="rounded-md border border-sidebar-border/70 p-2">
                                                    <p><span className="font-medium">Name:</span> {plusOne.full_name ?? '—'}</p>
                                                    <p><span className="font-medium">Age:</span> {plusOne.age ?? '—'}</p>
                                                    <p><span className="font-medium">Gender:</span> {plusOne.gender ?? '—'}</p>
                                                    <p><span className="font-medium">First Time:</span> {plusOne.is_first_time ? 'Yes' : 'No'}</p>
                                                    <p><span className="font-medium">Remarks:</span> {plusOne.remarks || '—'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
