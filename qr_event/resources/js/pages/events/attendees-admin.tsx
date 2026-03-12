import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { formatDateTime12Hour, calculateAge } from '@/utils/dateUtils';
import AddAttendeeManualModal from './modals/add-attendee-manual-modal';
import AttendeePlusOnesModal from './modals/attendee-plus-ones-modal';
import EditFamilyColorModal from './modals/edit-family-color-modal';
import UpdatePaymentModal from './modals/update-payment-modal';
import ImportFamiliesCsvModal from './modals/import-families-csv-modal';

import type { Attendee, EventShowProps } from './types';

export default function EventAttendeesAdmin() {
    const { event, attendees, users = [], filters, userCapabilities } = usePage<any>().props as EventShowProps;

    const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
    const [expandedFamilies, setExpandedFamilies] = useState<Set<number>>(new Set());
    const [editablePlusOnes, setEditablePlusOnes] = useState<Array<{
        id?: string;
        full_name?: string;
        age?: number;
        gender?: string;
        is_first_time?: boolean;
        remarks?: string;
        is_attended?: boolean;
    }>>([]);
    const [savingPlusOnes, setSavingPlusOnes] = useState(false);
    const [paymentModalAttendee, setPaymentModalAttendee] = useState<Attendee | null>(null);
    const [paymentIsPaid, setPaymentIsPaid] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('0');
    const [paymentType, setPaymentType] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');
    const [addAttendeeModalOpen, setAddAttendeeModalOpen] = useState(false);
    const [colorModalAttendee, setColorModalAttendee] = useState<Attendee | null>(null);
    const [familyColor, setFamilyColor] = useState('');
    const [attendanceModalAttendee, setAttendanceModalAttendee] = useState<Attendee | null>(null);
    const [newAttendanceStatus, setNewAttendanceStatus] = useState(false);
    const [selectedPlusOnes, setSelectedPlusOnes] = useState<string[]>([]);
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [importFamiliesModalOpen, setImportFamiliesModalOpen] = useState(false);

    const activeAdminTab = filters?.status ?? 'rsvp';
    const firstTimeFilter = filters?.first_time ?? 'all';
    const walkInFilter = filters?.walk_in ?? 'all';
    const paidFilter = filters?.paid ?? 'all';
    const colorFilter = filters?.color ?? 'all';
    const minAgeFilter = filters?.min_age ? Number(filters.min_age) : 0;
    const maxAgeFilter = filters?.max_age ? Number(filters.max_age) : 150;
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

    const setColorFilter = (color: string) => {
        router.get(attendeesUrl, { ...filters, color }, { preserveState: true, replace: true });
    };

    const setAgeRangeFilter = (minAge: number, maxAge: number) => {
        router.get(attendeesUrl, { ...filters, min_age: minAge, max_age: maxAge }, { preserveState: true, replace: true });
    };

    const calculateCostByAge = (age: number | undefined | null) => {
        if (age === undefined || age === null) return 0;
        if (age >= 12) return 200;
        if (age >= 5) return 100;
        return 0;
    };

    const calculateDueAmount = (attendee: Attendee) => {
        let total = 0;
        // Add attendee's cost (if they have a birthdate/age)
        const userBirthdate = attendee.user.birthdate;
        if (userBirthdate) {
            const age = new Date().getFullYear() - new Date(userBirthdate).getFullYear();
            total += calculateCostByAge(age);
        }
        // Add all plus-ones' costs
        (attendee.plus_ones ?? []).forEach((plusOne) => {
            total += calculateCostByAge(plusOne.age);
        });
        return total;
    };

    const openAttendeeModal = (attendee: Attendee) => {
        setSelectedAttendee(attendee);
        setEditablePlusOnes(
            (attendee.plus_ones ?? []).map((plusOne, index) => ({
                id: plusOne.id ?? `plus-one-${index}`,
                full_name: plusOne.full_name ?? '',
                age: plusOne.age,
                gender: plusOne.gender ?? '',
                is_first_time: !!plusOne.is_first_time,
                remarks: plusOne.remarks ?? '',
                is_attended: !!plusOne.is_attended,
            })),
        );
    };

    const toggleFamily = (attendeeId: number) => {
        const newExpanded = new Set(expandedFamilies);
        if (newExpanded.has(attendeeId)) {
            newExpanded.delete(attendeeId);
        } else {
            newExpanded.add(attendeeId);
        }
        setExpandedFamilies(newExpanded);
    };

    const openPaymentModal = (attendee: Attendee) => {
        setPaymentModalAttendee(attendee);
        setPaymentIsPaid(attendee.is_paid);
        setPaymentAmount(attendee.amount_paid ?? '0');
        setPaymentType(attendee.payment_type ?? '');
        setPaymentRemarks(attendee.payment_remarks ?? '');
    };

    const openFamilyColorModal = (attendee: Attendee) => {
        setColorModalAttendee(attendee);
        setFamilyColor(String(attendee.assigned_values?.family_color ?? 'none'));
    };

    const openAttendanceModal = (attendee: Attendee) => {
        setAttendanceModalAttendee(attendee);
        setNewAttendanceStatus(attendee.is_attended);
        // Only show plus ones that exist for this attendee
        setSelectedPlusOnes(
            (attendee.plus_ones ?? [])
                .filter((plusOne) => plusOne.id)
                .map((plusOne) => String(plusOne.id)),
        );
    };

    const saveAttendanceStatus = () => {
        if (!attendanceModalAttendee) {
            return;
        }

        if (!window.confirm('Are you sure you want to update the attendance status?')) {
            return;
        }

        setSavingAttendance(true);

        router.patch(
            `/events/${event.id}/attendees/${attendanceModalAttendee.id}/attendance`,
            {
                is_attended: newAttendanceStatus,
                plus_ones_attended: selectedPlusOnes,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setAttendanceModalAttendee(null);
                    setSavingAttendance(false);
                },
                onError: () => {
                    setSavingAttendance(false);
                },
            },
        );
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

    const updatePlusOneField = (
        index: number,
        field: 'full_name' | 'age' | 'gender' | 'is_first_time' | 'remarks',
        value: string | number | boolean,
    ) => {
        setEditablePlusOnes((prev) =>
            prev.map((plusOne, currentIndex) =>
                currentIndex === index
                    ? {
                          ...plusOne,
                          [field]: value,
                      }
                    : plusOne,
            ),
        );
    };

    const addPlusOneRow = () => {
        setEditablePlusOnes((prev) => [
            ...prev,
            {
                id: `plus-one-${Date.now()}`,
                full_name: '',
                age: undefined,
                gender: '',
                is_first_time: false,
                remarks: '',
                is_attended: selectedAttendee?.is_attended ?? false,
            },
        ]);
    };

    const removePlusOneRow = (index: number) => {
        setEditablePlusOnes((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const savePlusOnes = () => {
        if (!selectedAttendee) {
            return;
        }

        setSavingPlusOnes(true);

        const normalizedPlusOnes = editablePlusOnes.map((plusOne) => ({
            id: plusOne.id,
            full_name: plusOne.full_name?.trim() || null,
            age:
                plusOne.age === undefined || plusOne.age === null || Number.isNaN(Number(plusOne.age))
                    ? null
                    : Number(plusOne.age),
            gender: plusOne.gender?.trim() || null,
            is_first_time: !!plusOne.is_first_time,
            remarks: plusOne.remarks?.trim() || null,
            is_attended: !!plusOne.is_attended,
        }));

        router.patch(
            `/admin/attendees/${selectedAttendee.id}/plus-ones`,
            {
                plus_ones: normalizedPlusOnes,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setSelectedAttendee(null);
                    router.reload({ only: ['attendees'] });
                },
                onFinish: () => {
                    setSavingPlusOnes(false);
                },
            },
        );
    };

    const saveFamilyColor = () => {
        if (!colorModalAttendee) {
            return;
        }

        const normalizedColor = (familyColor || 'none').toLowerCase();

        router.patch(
            `/admin/attendees/${colorModalAttendee.id}/assigned-values`,
            {
                family_color: normalizedColor,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setColorModalAttendee(null);
                    router.reload({ only: ['attendees'] });
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
                            {userCapabilities?.canManagePayments && (
                                <button
                                    type="button"
                                    onClick={() => setImportFamiliesModalOpen(true)}
                                    className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Import Families CSV
                                </button>
                            )}
                            {userCapabilities?.canManageAttendees && (
                                <button
                                    type="button"
                                    onClick={() => setAddAttendeeModalOpen(true)}
                                    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Add Attendee Manually
                                </button>
                            )}
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
                                Registered {activeAdminTab === 'rsvp' && `(${attendees?.total ?? 0})`}
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
                        <input type="hidden" name="color" value={colorFilter} />
                        <input type="hidden" name="min_age" value={minAgeFilter} />
                        <input type="hidden" name="max_age" value={maxAgeFilter} />
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

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Family Color:</span>
                                <select
                                    value={colorFilter}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    className="h-7 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                                >
                                    <option value="all">All Colors</option>
                                    <option value="red">Red</option>
                                    <option value="blue">Blue</option>
                                    <option value="green">Green</option>
                                    <option value="yellow">Yellow</option>
                                    <option value="purple">Purple</option>
                                    <option value="orange">Orange</option>
                                    <option value="pink">Pink</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Age Range:</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="150"
                                    value={minAgeFilter}
                                    onChange={(e) => setAgeRangeFilter(Number(e.target.value), maxAgeFilter)}
                                    placeholder="Min"
                                    className="h-7 w-16 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                                />
                                <span className="text-xs text-muted-foreground">to</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="150"
                                    value={maxAgeFilter}
                                    onChange={(e) => setAgeRangeFilter(minAgeFilter, Number(e.target.value))}
                                    placeholder="Max"
                                    className="h-7 w-16 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70">
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Family Name</th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Age</th>
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
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Assigned Values</th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        {activeAdminTab === 'attendance' ? 'Attended Time' : 'Status'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAttendees.map((attendee: Attendee) => {
                                    const familyLastName = attendee.user.last_name;
                                    const attendeeFirstName = attendee.user.first_name;
                                    const attendeeAge = calculateAge(attendee.user.birthdate);
                                    const isExpanded = expandedFamilies.has(attendee.id);
                                    const hasPlusOnes = attendee.plus_ones && attendee.plus_ones.length > 0;
                                    
                                    return (
                                        <>
                                            {/* Family row - collapsed shows just family name, expanded shows tree */}
                                            <tr
                                                key={`attendee-${attendee.id}`}
                                                className="border-b border-sidebar-border/70 transition-colors hover:bg-sidebar/50"
                                            >
                                                <td className="px-4 py-3 text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        {hasPlusOnes && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleFamily(attendee.id)}
                                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                                title={isExpanded ? 'Collapse' : 'Expand'}
                                                            >
                                                                {isExpanded ? '▼' : '▶'}
                                                            </button>
                                                        )}
                                                        {!hasPlusOnes && <span className="w-4"></span>}
                                                        <span className="text-left text-muted-foreground">
                                                            {familyLastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Collapsed row - show all data except age */}
                                                {!isExpanded && (
                                                    <>
                                                        <td className="px-4 py-3 text-muted-foreground"></td>
                                                        <td className="px-4 py-3 text-muted-foreground">{attendee.user.contact_number}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{attendee.is_first_time ? 'Yes' : 'No'}</td>

                                                        {activeAdminTab === 'rsvp' && (
                                                            <>
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
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                                        attendee.is_paid
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-amber-100 text-amber-800'
                                                                    }`}>
                                                                        {attendee.is_paid ? 'Paid' : 'Unpaid'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">₱{attendee.amount_paid ?? '0'}</td>
                                                            </>
                                                        )}

                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                                                                Color: {String(attendee.assigned_values?.family_color ?? '—')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {activeAdminTab === 'attendance' ? (
                                                                userCapabilities?.canMarkAttendance ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openAttendanceModal(attendee)}
                                                                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                                                                            attendee.is_attended
                                                                                ? 'border-sidebar-border/70 text-green-600 hover:text-green-700'
                                                                                : 'border-sidebar-border/70 text-red-600 hover:text-red-700'
                                                                        }`}
                                                                    >
                                                                        <span className="text-lg">{attendee.is_attended ? '✓' : '✕'}</span>
                                                                        {attendee.attended_time
                                                                            ? formatDateTime12Hour(attendee.attended_time)
                                                                            : 'Not attended'}
                                                                    </button>
                                                                ) : (
                                                                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-500 cursor-not-allowed`}>
                                                                        <span className="text-lg">{attendee.is_attended ? '✓' : '✕'}</span>
                                                                        {attendee.attended_time
                                                                            ? formatDateTime12Hour(attendee.attended_time)
                                                                            : 'Not attended'}
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                                    attendee.is_attended
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {attendee.is_attended ? '✓ Attended' : '✕ Not attended'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                                {/* Expanded row - show full details of head */}
                                                {isExpanded && (
                                                    <>
                                                        <td className="px-4 py-3 text-muted-foreground">{attendeeAge}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{attendee.user.contact_number}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{attendee.is_first_time ? 'Yes' : 'No'}</td>

                                                        {activeAdminTab === 'rsvp' && (
                                                            <>
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
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {userCapabilities?.canManagePayments ? (
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
                                                                    ) : (
                                                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                                            attendee.is_paid
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-amber-100 text-amber-800'
                                                                        }`}>
                                                                            {attendee.is_paid ? 'Paid' : 'Unpaid'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">₱{attendee.amount_paid ?? '0'}</td>
                                                            </>
                                                        )}

                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                                                                    Color: {String(attendee.assigned_values?.family_color ?? '—')}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openFamilyColorModal(attendee)}
                                                                    className="rounded-md border border-sidebar-border/70 px-2 py-1 text-xs font-medium text-foreground hover:bg-sidebar/50"
                                                                >
                                                                    Edit Color
                                                                </button>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {activeAdminTab === 'attendance' ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openAttendanceModal(attendee)}
                                                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                                                                        attendee.is_attended
                                                                            ? 'border-sidebar-border/70 text-green-600 hover:text-green-700'
                                                                            : 'border-sidebar-border/70 text-red-600 hover:text-red-700'
                                                                    }`}
                                                                >
                                                                    <span className="text-lg">{attendee.is_attended ? '✓' : '✕'}</span>
                                                                    {attendee.attended_time
                                                                        ? formatDateTime12Hour(attendee.attended_time)
                                                                        : 'Not attended'}
                                                                </button>
                                                            ) : (
                                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                                    attendee.is_attended
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {attendee.is_attended ? '✓ Attended' : '✕ Not attended'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>

                                            {/* Expanded tree view - show head + plus ones who meet age criteria */}
                                            {isExpanded && (
                                                <>
                                                    {/* Head of family in expanded tree */}
                                                    {(() => {
                                                        const headAgeStr = attendee.user.birthdate ? calculateAge(attendee.user.birthdate) : null;
                                                        const headAge = headAgeStr && headAgeStr !== 'N/A' ? parseInt(headAgeStr) : null;
                                                        const headMeetsAge = headAge !== null && headAge >= minAgeFilter && headAge <= maxAgeFilter;

                                                        if (headMeetsAge) {
                                                            return (
                                                                <tr
                                                                    key={`head-${attendee.id}`}
                                                                    className="border-b border-sidebar-border/70 bg-sidebar/30 hover:bg-sidebar/50 transition-colors"
                                                                >
                                                                    <td className="px-4 py-3 text-foreground pl-10">
                                                                        {attendeeFirstName} {familyLastName}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-muted-foreground">{headAgeStr}</td>
                                                                    <td className="px-4 py-3 text-muted-foreground">{attendee.user.contact_number}</td>
                                                                    <td className="px-4 py-3 text-muted-foreground">{attendee.is_first_time ? 'Yes' : 'No'}</td>
                                                                    {activeAdminTab === 'rsvp' && <td className="px-4 py-3 text-muted-foreground"></td>}
                                                                    {activeAdminTab === 'rsvp' && <td className="px-4 py-3 text-muted-foreground"></td>}
                                                                    {activeAdminTab === 'rsvp' && <td className="px-4 py-3 text-muted-foreground"></td>}
                                                                    <td className="px-4 py-3 text-muted-foreground"></td>
                                                                    <td className="px-4 py-3 text-muted-foreground">
                                                                        {activeAdminTab === 'attendance' && (
                                                                            <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                                                                                attendee.is_attended
                                                                                    ? 'border-sidebar-border/70 text-green-600'
                                                                                    : 'border-sidebar-border/70 text-red-600'
                                                                            }`}>
                                                                                <span className="text-lg">{attendee.is_attended ? '✓' : '✕'}</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {/* Plus ones - only show those who meet age criteria */}
                                                    {hasPlusOnes && attendee.plus_ones.map((plusOne) => {
                                                        const plusOneAge = plusOne.age ?? null;
                                                        const plusOneMeetsAge = plusOneAge !== null && plusOneAge >= minAgeFilter && plusOneAge <= maxAgeFilter;

                                                        if (!plusOneMeetsAge) {
                                                            return null;
                                                        }

                                                        return (
                                                            <tr
                                                                key={`plus-one-${attendee.id}-${plusOne.full_name}`}
                                                                className="border-b border-sidebar-border/70 bg-sidebar/30 hover:bg-sidebar/50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-foreground pl-10">
                                                                    {familyLastName}, {plusOne.full_name?.split(' ')[0] || '—'}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">{plusOne.age ?? '—'}</td>
                                                                <td className="px-4 py-3 text-muted-foreground"></td>
                                                                <td className="px-4 py-3 text-muted-foreground"></td>
                                                                {activeAdminTab === 'rsvp' && <td className="px-4 py-3 text-muted-foreground"></td>}
                                                                {activeAdminTab === 'rsvp' && <td className="px-4 py-3 text-muted-foreground"></td>}
                                                                {activeAdminTab === 'rsvp' && <td className="px-4 py-3 text-muted-foreground"></td>}
                                                                <td className="px-4 py-3 text-muted-foreground"></td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {activeAdminTab === 'attendance' && (
                                                                        <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                                                                            plusOne.is_attended
                                                                                ? 'border-sidebar-border/70 text-green-600'
                                                                                : 'border-sidebar-border/70 text-red-600'
                                                                        }`}>
                                                                            <span className="text-lg">{plusOne.is_attended ? '✓' : '✕'}</span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {attendees && attendees.data.length === 0 && (
                        <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                            {activeAdminTab === 'rsvp'
                                ? 'No registered found for this selection'
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

                <ImportFamiliesCsvModal
                    open={importFamiliesModalOpen}
                    event={event}
                    attendeesUrl={attendeesUrl}
                    onClose={() => setImportFamiliesModalOpen(false)}
                />

                <AddAttendeeManualModal
                    open={addAttendeeModalOpen}
                    event={event}
                    users={users}
                    attendeesUrl={attendeesUrl}
                    onClose={() => setAddAttendeeModalOpen(false)}
                />

                <AttendeePlusOnesModal
                    open={!!selectedAttendee}
                    attendee={selectedAttendee}
                    editablePlusOnes={editablePlusOnes}
                    savingPlusOnes={savingPlusOnes}
                    onClose={() => setSelectedAttendee(null)}
                    onAddPlusOne={addPlusOneRow}
                    onRemovePlusOne={removePlusOneRow}
                    onUpdatePlusOneField={updatePlusOneField}
                    onSave={savePlusOnes}
                />

                <UpdatePaymentModal
                    open={!!paymentModalAttendee}
                    attendee={paymentModalAttendee}
                    paymentIsPaid={paymentIsPaid}
                    paymentAmount={paymentAmount}
                    paymentType={paymentType}
                    paymentRemarks={paymentRemarks}
                    dueAmount={paymentModalAttendee ? calculateDueAmount(paymentModalAttendee) : undefined}
                    onClose={() => setPaymentModalAttendee(null)}
                    onTogglePaid={() => setPaymentIsPaid((prev) => !prev)}
                    onPaymentAmountChange={setPaymentAmount}
                    onPaymentTypeChange={setPaymentType}
                    onPaymentRemarksChange={setPaymentRemarks}
                    onSave={savePaymentDetails}
                />

                <EditFamilyColorModal
                    open={!!colorModalAttendee}
                    attendee={colorModalAttendee}
                    familyColor={familyColor}
                    onFamilyColorChange={setFamilyColor}
                    onClose={() => setColorModalAttendee(null)}
                    onSave={saveFamilyColor}
                />

                {/* Attendance Status Modal */}
                {attendanceModalAttendee && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setAttendanceModalAttendee(null)}
                    >
                        <div
                            className="w-full max-w-md rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="mb-4 text-xl font-semibold text-foreground">
                                Mark Attendance: {attendanceModalAttendee.user.first_name}{' '}
                                {attendanceModalAttendee.user.last_name}
                            </h2>

                            <div className="space-y-4">
                                {/* Main attendee status */}
                                <div className="rounded-md border border-sidebar-border/70 p-4">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={newAttendanceStatus}
                                            onChange={(e) => setNewAttendanceStatus(e.target.checked)}
                                            className="h-4 w-4 rounded border-sidebar-border/70"
                                        />
                                        <span className="text-sm font-medium text-foreground">
                                            Mark {attendanceModalAttendee.user.first_name} as attended
                                        </span>
                                    </label>
                                </div>

                                {/* Plus ones */}
                                {attendanceModalAttendee.plus_ones && attendanceModalAttendee.plus_ones.length > 0 && (
                                    <div className="rounded-md border border-sidebar-border/70 p-4">
                                        <h3 className="mb-3 font-medium text-foreground">Plus Ones Available</h3>
                                        <div className="space-y-2">
                                            {attendanceModalAttendee.plus_ones.map((plusOne) => (
                                                <label
                                                    key={plusOne.id}
                                                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-sidebar/50"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlusOnes.includes(String(plusOne.id))}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedPlusOnes((prev) => [...prev, String(plusOne.id)]);
                                                            } else {
                                                                setSelectedPlusOnes((prev) =>
                                                                    prev.filter((id) => id !== String(plusOne.id)),
                                                                );
                                                            }
                                                        }}
                                                        className="h-4 w-4 rounded border-sidebar-border/70"
                                                    />
                                                    <span className="text-sm text-foreground">
                                                        {plusOne.full_name} {plusOne.age ? `(Age ${plusOne.age})` : ''}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setAttendanceModalAttendee(null)}
                                        className="flex-1 rounded-md border border-sidebar-border/70 px-4 py-2 font-medium text-foreground hover:bg-sidebar/50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={saveAttendanceStatus}
                                        disabled={savingAttendance}
                                        className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {savingAttendance ? 'Saving...' : 'Confirm & Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
