import { Head, Link, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { formatDateTime12Hour, calculateAge } from '@/utils/dateUtils';
import AddAttendeeManualModal from './modals/add-attendee-manual-modal';
import AttendeePlusOnesModal from './modals/attendee-plus-ones-modal';
import EditFamilyColorModal from './modals/edit-family-color-modal';
import UpdatePaymentModal from './modals/update-payment-modal';
import ImportFamiliesCsvModal from './modals/import-families-csv-modal';
import UpdateAttendanceModal from './modals/update-attendance-modal';
import { useFilters } from './hooks/useFilters';
import { useAttendeeModals } from './hooks/useAttendeeModals';
import { calculateCostByAge } from './utils/attendee-utils';
import { AttendanceService, PaymentService, PlusOnesService, FamilyColorService } from './services/AttendeeService';

import type { Attendee, EventShowProps } from './types';

export default function EventAttendeesAdmin() {
    const { event, attendees, users = [], filters, userCapabilities } = usePage<any>().props as EventShowProps;

    // Initialize hooks
    const {
        attendeesUrl,
        activeAdminTab,
        firstTimeFilter,
        walkInFilter,
        paidFilter,
        colorFilter,
        minAgeFilter,
        maxAgeFilter,
        searchValue,
        setActiveAdminTab,
        setFirstTimeFilter,
        setWalkInFilter,
        setPaidFilter,
        setColorFilter,
        setAgeRangeFilter,
    } = useFilters({ filters, eventId: event.id });

    const {
        selectedAttendee,
        editablePlusOnes,
        savingPlusOnes,
        setSavingPlusOnes,
        openAttendeeModal,
        closeAttendeeModal,
        updatePlusOneField,
        addPlusOneRow,
        removePlusOneRow,
        paymentModalAttendee,
        paymentIsPaid,
        paymentAmount,
        paymentType,
        paymentRemarks,
        setPaymentIsPaid,
        setPaymentAmount,
        setPaymentType,
        setPaymentRemarks,
        openPaymentModal,
        closePaymentModal,
        attendanceModalAttendee,
        newAttendanceStatus,
        selectedPlusOnes,
        savingAttendance,
        setSavingAttendance,
        setNewAttendanceStatus,
        setSelectedPlusOnes,
        openAttendanceModal,
        closeAttendanceModal,
        colorModalAttendee,
        familyColor,
        setFamilyColor,
        openFamilyColorModal,
        closeFamilyColorModal,
        addAttendeeModalOpen,
        setAddAttendeeModalOpen,
        importFamiliesModalOpen,
        setImportFamiliesModalOpen,
        expandedFamilies,
        toggleFamily,
    } = useAttendeeModals();

    const calculateDueAmount = (attendee: Attendee) => {
        let total = 0;
        const userBirthdate = attendee.user.birthdate;
        if (userBirthdate) {
            const age = new Date().getFullYear() - new Date(userBirthdate).getFullYear();
            total += calculateCostByAge(age);
        }
        (attendee.plus_ones ?? []).forEach((plusOne) => {
            total += calculateCostByAge(plusOne.age);
        });
        return total;
    };

    const saveAttendanceStatus = () => {
        if (!attendanceModalAttendee) {
            return;
        }

        if (!window.confirm('Are you sure you want to update the attendance status?')) {
            return;
        }

        setSavingAttendance(true);
        AttendanceService.updateAttendance(event.id, attendanceModalAttendee.id, {
            is_attended: newAttendanceStatus,
            plus_ones_attended: selectedPlusOnes,
        }, {
            onSuccess: closeAttendanceModal,
            onError: () => setSavingAttendance(false),
        });
    };

    const savePaymentDetails = () => {
        if (!paymentModalAttendee) {
            return;
        }

        const validation = PaymentService.validateAmount(paymentAmount);
        if (!validation.valid) {
            window.alert(validation.error);
            return;
        }

        PaymentService.updatePayment(paymentModalAttendee.id, {
            is_paid: paymentIsPaid,
            amount_paid: paymentIsPaid ? Number(paymentAmount) : null,
            payment_type: paymentType || null,
            payment_remarks: paymentRemarks || null,
        }, {
            onSuccess: () => {
                closePaymentModal();
                location.reload();
            },
        });
    };

    const savePlusOnes = () => {
        if (!selectedAttendee) {
            return;
        }

        setSavingPlusOnes(true);
        PlusOnesService.updatePlusOnes(selectedAttendee.id, editablePlusOnes, {
            onSuccess: () => {
                closeAttendeeModal();
                location.reload();
            },
        });
    };

    const saveFamilyColor = () => {
        if (!colorModalAttendee) {
            return;
        }

        FamilyColorService.updateColor(colorModalAttendee.id, familyColor, {
            onSuccess: closeFamilyColorModal,
        });
    };

    const formatPhoneNumber = (phoneNumber: string): string => {
        if (!phoneNumber) return '';
        const digits = phoneNumber.replace(/\D/g, '');
        if (digits.length < 10) return phoneNumber;
        const areaCode = digits.substring(digits.length - 10, digits.length - 6);
        const exchange = digits.substring(digits.length - 6, digits.length - 3);
        const subscriber = digits.substring(digits.length - 3);
        return `(${areaCode}) ${exchange}-${subscriber}`;
    };

    const exportToCSV = () => {
        const headers = [
            'Family Name',
            'Member Name',
            'Age',
            'Contact Number',
            'First Time',
            'Walk-in',
            'Paid',
            'Amount Paid',
            'Family Color',
            'Status',
            'Attended Time',
        ];

        const rows: string[][] = [];

        allAttendees.forEach((attendee: Attendee) => {
            const familyLastName = attendee.user.last_name;
            const attendeeFirstName = attendee.user.first_name;
            const attendeeAge = calculateAge(attendee.user.birthdate);
            const formattedContact = formatPhoneNumber(attendee.user.contact_number || '');

            // Add main attendee row
            rows.push([
                familyLastName,
                attendeeFirstName,
                attendeeAge === 'N/A' ? '' : attendeeAge,
                formattedContact,
                attendee.is_first_time ? 'Yes' : 'No',
                attendee.is_walk_in ? 'Yes' : 'No',
                attendee.is_paid ? 'Yes' : 'No',
                attendee.amount_paid?.toString() || '0',
                String(attendee.assigned_values?.family_color || '—'),
                attendee.is_attended ? 'Attended' : 'Registered',
                attendee.attended_time ? formatDateTime12Hour(attendee.attended_time) : '',
            ]);

            // Add plus ones as separate rows
            if (attendee.plus_ones && attendee.plus_ones.length > 0) {
                attendee.plus_ones.forEach((plusOne) => {
                    rows.push([
                        familyLastName,
                        plusOne.full_name || '',
                        plusOne.age?.toString() || '',
                        formattedContact, // Include formatted contact number from main attendee
                        '', // First time not applicable for plus ones
                        '', // Walk-in not applicable for plus ones
                        '', // Paid status not tracked for plus ones individually
                        '', // Amount paid not tracked for plus ones individually
                        String(attendee.assigned_values?.family_color || '—'),
                        plusOne.is_attended ? 'Attended' : 'Registered',
                        '', // Attended time not tracked for plus ones
                    ]);
                });
            }
        });

        // Add empty row and export date
        const exportDate = new Date();
        const formattedDate = exportDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        rows.push([]);
        rows.push([`Exported on: ${formattedDate}`]);

        // Convert to CSV format
        const csvContent = [
            headers.map((h) => `"${h}"`).join(','),
            rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n'),
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendees-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        <div className="mb-4 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={exportToCSV}
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Export to CSV
                            </button>
                        </div>
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
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPaymentModal(attendee)}
                                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                                            attendee.is_paid
                                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                                        }`}
                                                                    >
                                                                        {attendee.is_paid ? 'Paid' : 'Unpaid'}
                                                                    </button>
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
                                                            {userCapabilities?.canMarkAttendance ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openAttendanceModal(attendee)}
                                                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                                                                        attendee.is_attended
                                                                            ? 'border-sidebar-border/70 text-green-600 hover:text-green-700'
                                                                            : 'border-sidebar-border/70 text-gray-600 hover:text-gray-700'
                                                                    }`}
                                                                >
                                                                    {activeAdminTab === 'attendance' ? (
                                                                        attendee.attended_time
                                                                            ? formatDateTime12Hour(attendee.attended_time)
                                                                            : 'Registered'
                                                                    ) : (
                                                                        attendee.is_attended ? 'Attended' : 'Registered'
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-500 cursor-not-allowed`}>
                                                                    {activeAdminTab === 'attendance' ? (
                                                                        attendee.attended_time
                                                                            ? formatDateTime12Hour(attendee.attended_time)
                                                                            : 'Registered'
                                                                    ) : (
                                                                        attendee.is_attended ? 'Attended' : 'Registered'
                                                                    )}
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
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPaymentModal(attendee)}
                                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                                                                            attendee.is_paid
                                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                                        }`}
                                                                    >
                                                                        {attendee.is_paid ? 'Paid' : 'Unpaid'}
                                                                    </button>
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
                                                            {userCapabilities?.canMarkAttendance ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openAttendanceModal(attendee)}
                                                                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                                                                        attendee.is_attended
                                                                            ? 'border-sidebar-border/70 text-green-600 hover:text-green-700'
                                                                            : 'border-sidebar-border/70 text-gray-600 hover:text-gray-700'
                                                                    }`}
                                                                >
                                                                    {activeAdminTab === 'attendance' ? (
                                                                        attendee.attended_time
                                                                            ? formatDateTime12Hour(attendee.attended_time)
                                                                            : 'Registered'
                                                                    ) : (
                                                                        attendee.is_attended ? 'Attended' : 'Registered'
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-500 cursor-not-allowed`}>
                                                                    {activeAdminTab === 'attendance' ? (
                                                                        attendee.attended_time
                                                                            ? formatDateTime12Hour(attendee.attended_time)
                                                                            : 'Registered'
                                                                    ) : (
                                                                        attendee.is_attended ? 'Attended' : 'Registered'
                                                                    )}
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
                                                                        {userCapabilities?.canMarkAttendance ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openAttendanceModal(attendee)}
                                                                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                                                                                    attendee.is_attended
                                                                                        ? 'border-sidebar-border/70 text-green-600 hover:text-green-700'
                                                                                        : 'border-sidebar-border/70 text-gray-600 hover:text-gray-700'
                                                                                }`}
                                                                            >
                                                                                {activeAdminTab === 'attendance' ? (
                                                                                    attendee.attended_time
                                                                                        ? formatDateTime12Hour(attendee.attended_time)
                                                                                        : 'Registered'
                                                                                ) : (
                                                                                    attendee.is_attended ? 'Attended' : 'Registered'
                                                                                )}
                                                                            </button>
                                                                        ) : (
                                                                            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-500 cursor-not-allowed`}>
                                                                                {activeAdminTab === 'attendance' ? (
                                                                                    attendee.attended_time
                                                                                        ? formatDateTime12Hour(attendee.attended_time)
                                                                                        : 'Registered'
                                                                                ) : (
                                                                                    attendee.is_attended ? 'Attended' : 'Registered'
                                                                                )}
                                                                            </span>
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
                                                                    {userCapabilities?.canMarkAttendance ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openAttendanceModal(attendee)}
                                                                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                                                                                plusOne.is_attended
                                                                                    ? 'border-sidebar-border/70 text-green-600 hover:text-green-700'
                                                                                    : 'border-sidebar-border/70 text-gray-600 hover:text-gray-700'
                                                                            }`}
                                                                        >
                                                                            {activeAdminTab === 'attendance' ? (
                                                                                plusOne.is_attended ? 'Attended' : 'Registered'
                                                                            ) : (
                                                                                plusOne.is_attended ? 'Attended' : 'Registered'
                                                                            )}
                                                                        </button>
                                                                    ) : (
                                                                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-500 cursor-not-allowed`}>
                                                                            {plusOne.is_attended ? 'Attended' : 'Registered'}
                                                                        </span>
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
                    onClose={closeAttendeeModal}
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
                    onClose={closePaymentModal}
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
                    onClose={closeFamilyColorModal}
                    onSave={saveFamilyColor}
                />

                <UpdateAttendanceModal
                    open={!!attendanceModalAttendee}
                    attendee={attendanceModalAttendee}
                    newAttendanceStatus={newAttendanceStatus}
                    selectedPlusOnes={selectedPlusOnes}
                    savingAttendance={savingAttendance}
                    onClose={closeAttendanceModal}
                    onAttendanceStatusChange={setNewAttendanceStatus}
                    onPlusOneToggle={(plusOneId) => {
                        if (selectedPlusOnes.includes(plusOneId)) {
                            setSelectedPlusOnes((prev) => prev.filter((id) => id !== plusOneId));
                        } else {
                            setSelectedPlusOnes((prev) => [...prev, plusOneId]);
                        }
                    }}
                    onSave={saveAttendanceStatus}
                />
            </div>
        </AppLayout>
    );
}
