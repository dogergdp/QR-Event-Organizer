import { Head, usePage } from '@inertiajs/react';

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

// New imports for refactored components
import { ActionHeader } from './components/ActionHeader';
import { FilterControls } from './components/FilterControls';
import { AttendeeTableHeader } from './components/AttendeeTableHeader';
import { AttendeeTableRow } from './components/AttendeeTableRow';
import { Pagination } from './components/Pagination';
import {
  formatPhoneNumber,
  calculateDueAmount,
  buildCSVContent,
  downloadCSV,
} from './utils/attendee-table-utils';

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

  const handleOpenPlusOnesModal = (attendee: Attendee) => {
    openAttendeeModal(attendee);
  };

  const exportToCSV = () => {
    const headers = [
      'Family Name',
      'Member Name',
      'Age',
      'Gender',
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
      const attendeeGender = attendee.user.gender || '';

      // Add main attendee row
      rows.push([
        familyLastName,
        attendeeFirstName,
        attendeeAge === 'N/A' ? '' : attendeeAge,
        attendeeGender,
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
            plusOne.gender || '',
            formattedContact,
            '',
            '',
            '',
            '',
            String(attendee.assigned_values?.family_color || '—'),
            plusOne.is_attended ? 'Attended' : 'Registered',
            '',
          ]);
        });
      }
    });

    // Format and download
    const exportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const csvContent = buildCSVContent(headers, rows, exportDate);
    const filename = `attendees-export-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
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
          <ActionHeader
            eventId={event.id}
            eventName={event.name}
            attendeesUrl={attendeesUrl}
            userCanManagePayments={userCapabilities?.canManagePayments ?? false}
            userCanManageAttendees={userCapabilities?.canManageAttendees ?? false}
            onImportFamiliesClick={() => setImportFamiliesModalOpen(true)}
            onAddAttendeeClick={() => setAddAttendeeModalOpen(true)}
          />

          {/* Tab navigation */}
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

          {/* Search form */}
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

          {/* Refactored filter controls */}
          <FilterControls
            firstTimeFilter={firstTimeFilter}
            walkInFilter={walkInFilter}
            paidFilter={paidFilter}
            colorFilter={colorFilter}
            minAgeFilter={minAgeFilter}
            maxAgeFilter={maxAgeFilter}
            onFirstTimeChange={setFirstTimeFilter}
            onWalkInChange={setWalkInFilter}
            onPaidChange={setPaidFilter}
            onColorChange={setColorFilter}
            onAgeRangeChange={setAgeRangeFilter}
            onExportCSV={exportToCSV}
          />

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <AttendeeTableHeader activeAdminTab={activeAdminTab} />
              <tbody>
                {allAttendees.map((attendee: Attendee) => {
                  const isExpanded = expandedFamilies.has(attendee.id);
                  const hasPlusOnes = attendee.plus_ones && attendee.plus_ones.length > 0;

                  return (
                    <AttendeeTableRow
                      key={`attendee-${attendee.id}`}
                      attendee={attendee}
                      isExpanded={isExpanded}
                      hasPlusOnes={hasPlusOnes}
                      activeAdminTab={activeAdminTab}
                      minAgeFilter={minAgeFilter}
                      maxAgeFilter={maxAgeFilter}
                      userCanMarkAttendance={userCapabilities?.canMarkAttendance ?? false}
                      onToggleExpand={() => toggleFamily(attendee.id)}
                      onOpenPlusOnesModal={handleOpenPlusOnesModal}
                      onOpenPaymentModal={openPaymentModal}
                      onOpenColorModal={openFamilyColorModal}
                      onOpenAttendanceModal={openAttendanceModal}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {attendees && attendees.data.length === 0 && (
            <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
              {activeAdminTab === 'rsvp'
                ? 'No registered found for this selection'
                : 'No attendance records found for this selection'}
            </div>
          )}

          {/* Refactored pagination */}
          {attendees && attendees.data.length > 0 && (
            <Pagination
              from={attendees.from ?? 0}
              to={attendees.to ?? 0}
              total={attendees.total}
              links={attendees.links}
            />
          )}
        </div>

        {/* Modals */}
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
          dueAmount={
            paymentModalAttendee
              ? calculateDueAmount(paymentModalAttendee, calculateCostByAge)
              : undefined
          }
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
