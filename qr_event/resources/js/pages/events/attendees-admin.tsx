import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { formatDateTime12Hour } from '@/utils/dateUtils';
import AddAttendeeManualModal from './modal/add-attendee-manual-modal';

import type { Attendee, EventShowProps } from './types';

export default function EventAttendeesAdmin() {
    const { event, attendees, users = [], filters } = usePage<any>().props as EventShowProps;

    const [paymentModalAttendee, setPaymentModalAttendee] = useState<Attendee | null>(null);
    const [paymentIsPaid, setPaymentIsPaid] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('0');
    const [paymentType, setPaymentType] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');
    const [addAttendeeModalOpen, setAddAttendeeModalOpen] = useState(false);

    const activeAdminTab = filters?.status ?? 'rsvp';
    const firstTimeFilter = filters?.first_time ?? 'all';
    const walkInFilter = filters?.walk_in ?? 'all';
    const paidFilter = filters?.paid ?? 'all';
    const searchValue = filters?.search ?? '';
    const attendeesUrl = `/events/${event.id}/attendees`;

    const setActiveAdminTab = (tab: 'rsvp' | 'attendance') => {
        router.get(attendeesUrl, { ...filters, status: tab }, { preserveState: true, replace: true });
    };

    const setFirstTimeFilter = (filter: 'all' | 'yes' | 'no') => {
        router.get(attendeesUrl, { ...filters, first_time: filter }, { preserveState: true, replace: true });
    };

    const setWalkInFilter = (filter: 'all' | 'yes' | 'no') => {
        router.get(attendeesUrl, { ...filters, walk_in: filter }, { preserveState: true, replace: true });
    };

    const setPaidFilter = (filter: 'all' | 'yes' | 'no') => {
        router.get(attendeesUrl, { ...filters, paid: filter }, { preserveState: true, replace: true });
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: event.name, href: `/events/${event.id}` },
        { title: 'Attendees', href: attendeesUrl },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${event.name} Attendees`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-foreground">Event Attendees</h2>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setAddAttendeeModalOpen(true)}
                                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Add Attendee Manually
                            </button>
                            <Link
                                href={`/events/${event.id}`}
                                className="rounded-md border border-sidebar-border/70 px-3 py-2 text-sm text-foreground hover:bg-sidebar/50"
                            >
                                Back to Event
                            </Link>
                        </div>
                    </div>

                    <div className="border-b border-sidebar-border/70">
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
                                RSVP {activeAdminTab === 'rsvp' && `(${attendees?.total ?? 0})`}
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
                                Attendance {activeAdminTab === 'attendance' && `(${attendees?.total ?? 0})`}
                            </button>
                        </div>
                    </div>

                    <form method="get" action={attendeesUrl} className="mt-4 flex flex-wrap gap-2">
                        <input type="hidden" name="status" value={activeAdminTab} />
                        <input type="hidden" name="first_time" value={firstTimeFilter} />
                        <input type="hidden" name="walk_in" value={walkInFilter} />
                        <input type="hidden" name="paid" value={paidFilter} />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchValue}
                            placeholder="Search name or contact number"
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm md:flex-1"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            Search
                        </button>
                    </form>

                    <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-sidebar p-4">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">First time:</span>
                                <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
                                    <button
                                        type="button"
                                        onClick={() => setFirstTimeFilter('all')}
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
                                        onClick={() => setFirstTimeFilter('yes')}
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
                                        onClick={() => setFirstTimeFilter('no')}
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

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Walk-in:</span>
                                <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
                                    <button
                                        type="button"
                                        onClick={() => setWalkInFilter('all')}
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            walkInFilter === 'all'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWalkInFilter('yes')}
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            walkInFilter === 'yes'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWalkInFilter('no')}
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            walkInFilter === 'no'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Paid:</span>
                                <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
                                    <button
                                        type="button"
                                        onClick={() => setPaidFilter('all')}
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            paidFilter === 'all'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaidFilter('yes')}
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            paidFilter === 'yes'
                                                ? 'bg-muted text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaidFilter('no')}
                                        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                            paidFilter === 'no'
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
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Name</th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Contact</th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">First Time</th>
                                    {activeAdminTab === 'rsvp' && (
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">Walk-in</th>
                                    )}
                                    {activeAdminTab === 'rsvp' && (
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">Paid</th>
                                    )}
                                    {activeAdminTab === 'rsvp' && (
                                        <th className="px-4 py-2 text-left font-semibold text-foreground">Amount Paid</th>
                                    )}
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        {activeAdminTab === 'attendance' ? 'Attended Time' : 'Status'}
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
                                            {attendee.user.first_name} {attendee.user.last_name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{attendee.user.contact_number}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{attendee.is_first_time ? 'Yes' : 'No'}</td>

                                        {activeAdminTab === 'rsvp' && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                        attendee.is_walk_in
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {attendee.is_walk_in ? 'Walk-in' : 'Regular'}
                                                </span>
                                            </td>
                                        )}

                                        {activeAdminTab === 'rsvp' && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <button
                                                    type="button"
                                                    onClick={() => openPaymentModal(attendee)}
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

                                        {activeAdminTab === 'rsvp' && (
                                            <td className="px-4 py-3 text-muted-foreground">₱{attendee.amount_paid ?? '0'}</td>
                                        )}

                                        <td className="px-4 py-3 text-muted-foreground">
                                            {activeAdminTab === 'attendance' ? (
                                                attendee.attended_time ? (
                                                    formatDateTime12Hour(attendee.attended_time)
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
                                                className="cursor-not-allowed rounded-md border border-sidebar-border/70 px-3 py-1 text-sm font-medium text-muted-foreground opacity-50"
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

                <AddAttendeeManualModal
                    open={addAttendeeModalOpen}
                    event={event}
                    users={users}
                    attendeesUrl={attendeesUrl}
                    onClose={() => setAddAttendeeModalOpen(false)}
                />

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
            </div>
        </AppLayout>
    );
}
