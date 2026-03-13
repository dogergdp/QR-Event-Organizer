import type { Attendee } from '../types';
import { StatusBadge } from './StatusBadge';
import { FamilyColorDisplay } from './FamilyColorDisplay';
import { formatDateTime12Hour, calculateAge } from '@/utils/dateUtils';
import { agePassesFilter } from '../utils/attendee-table-utils';
import { ADMIN_TABS } from '@/pages/events/constants/attendee-constants';

interface AttendeeTableRowProps {
  attendee: Attendee;
  isExpanded: boolean;
  hasPlusOnes: boolean;
  activeAdminTab: string;
  minAgeFilter: number;
  maxAgeFilter: number;
  userCanMarkAttendance: boolean;
  onToggleExpand: () => void;
  onOpenPlusOnesModal: (attendee: Attendee) => void;
  onOpenPaymentModal: (attendee: Attendee) => void;
  onOpenColorModal: (attendee: Attendee) => void;
  onOpenAttendanceModal: (attendee: Attendee) => void;
}

export function AttendeeTableRow({
  attendee,
  isExpanded,
  hasPlusOnes,
  activeAdminTab,
  minAgeFilter,
  maxAgeFilter,
  userCanMarkAttendance,
  onToggleExpand,
  onOpenPlusOnesModal,
  onOpenPaymentModal,
  onOpenColorModal,
  onOpenAttendanceModal,
}: AttendeeTableRowProps) {
  const familyLastName = attendee.user.last_name;
  const attendeeFirstName = attendee.user.first_name;
  const attendeeAge = calculateAge(attendee.user.birthdate);

  return (
    <>
      {/* Family header row */}
      <tr className="border-b border-sidebar-border/70 transition-colors hover:bg-sidebar/50">
        <td className="px-4 py-3 text-foreground">
          <div className="flex items-center gap-2">
            {hasPlusOnes && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasPlusOnes && <span className="w-4"></span>}
            <button
              type="button"
              onClick={() => onOpenPlusOnesModal(attendee)}
              className="text-left text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
              title="Click to edit plus ones"
            >
              {familyLastName}
            </button>
          </div>
        </td>
        
        {isExpanded ? (
          // Expanded row details
          <AttendeeRowDetails
            attendee={attendee}
            familyLastName={familyLastName}
            attendeeFirstName={attendeeFirstName}
            attendeeAge={attendeeAge}
            activeAdminTab={activeAdminTab}
            userCanMarkAttendance={userCanMarkAttendance}
            onOpenPaymentModal={onOpenPaymentModal}
            onOpenColorModal={onOpenColorModal}
            onOpenAttendanceModal={onOpenAttendanceModal}
          />
        ) : (
          // Collapsed row details
          <AttendeeRowDetails
            attendee={attendee}
            familyLastName={familyLastName}
            attendeeFirstName={attendeeFirstName}
            attendeeAge={undefined}
            activeAdminTab={activeAdminTab}
            userCanMarkAttendance={userCanMarkAttendance}
            onOpenPaymentModal={onOpenPaymentModal}
            onOpenColorModal={onOpenColorModal}
            onOpenAttendanceModal={onOpenAttendanceModal}
          />
        )}
      </tr>

      {/* Expanded tree view */}
      {isExpanded && (
        <>
          {/* Head of family row */}
          <ExpandedHeadRow
            attendee={attendee}
            attendeeFirstName={attendeeFirstName}
            familyLastName={familyLastName}
            attendeeAge={attendeeAge}
            activeAdminTab={activeAdminTab}
            minAgeFilter={minAgeFilter}
            maxAgeFilter={maxAgeFilter}
            userCanMarkAttendance={userCanMarkAttendance}
            onOpenAttendanceModal={onOpenAttendanceModal}
          />

          {/* Plus ones rows */}
          {hasPlusOnes &&
            attendee.plus_ones.map((plusOne) => {
              const plusOneAge = plusOne.age ?? null;
              const plusOneMeetsAge = agePassesFilter(plusOneAge, minAgeFilter, maxAgeFilter);

              if (!plusOneMeetsAge) return null;

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
                  {activeAdminTab === ADMIN_TABS.RSVP && <td className="px-4 py-3"></td>}
                  {activeAdminTab === ADMIN_TABS.RSVP && <td className="px-4 py-3"></td>}
                  {activeAdminTab === ADMIN_TABS.RSVP && <td className="px-4 py-3"></td>}
                  <td className="px-4 py-3 text-muted-foreground"></td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <StatusBadge
                      type="attendance"
                      value={plusOne.is_attended}
                      onClick={() => onOpenAttendanceModal(attendee)}
                      disabled={!userCanMarkAttendance}
                    >
                      {activeAdminTab === ADMIN_TABS.ATTENDANCE
                        ? plusOne.is_attended
                          ? 'Attended'
                          : 'Registered'
                        : plusOne.is_attended
                          ? 'Attended'
                          : 'Registered'}
                    </StatusBadge>
                  </td>
                </tr>
              );
            })}
        </>
      )}
    </>
  );
}

function AttendeeRowDetails({
  attendee,
  familyLastName,
  attendeeFirstName,
  attendeeAge,
  activeAdminTab,
  userCanMarkAttendance,
  onOpenPaymentModal,
  onOpenColorModal,
  onOpenAttendanceModal,
}: {
  attendee: Attendee;
  familyLastName: string;
  attendeeFirstName: string;
  attendeeAge: string | undefined;
  activeAdminTab: string;
  userCanMarkAttendance: boolean;
  onOpenPaymentModal: (attendee: Attendee) => void;
  onOpenColorModal: (attendee: Attendee) => void;
  onOpenAttendanceModal: (attendee: Attendee) => void;
}) {
  return (
    <>
      <td className="px-4 py-3 text-muted-foreground">{attendeeAge}</td>
      <td className="px-4 py-3 text-muted-foreground">{attendee.user.contact_number}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {attendee.is_first_time ? 'Yes' : 'No'}
      </td>

      {activeAdminTab === ADMIN_TABS.RSVP && (
        <>
          <td className="px-4 py-3 text-muted-foreground">
            <StatusBadge type="walkIn" value={attendee.is_walk_in} />
          </td>
          <td className="px-4 py-3 text-muted-foreground">
            <StatusBadge
              type="paid"
              value={attendee.is_paid}
              onClick={() => onOpenPaymentModal(attendee)}
            />
          </td>
          <td className="px-4 py-3 text-muted-foreground">₱{attendee.amount_paid ?? '0'}</td>
        </>
      )}

      <td className="px-4 py-3 text-muted-foreground">
        <FamilyColorDisplay
          color={attendee.assigned_values?.family_color}
          onEditClick={() => onOpenColorModal(attendee)}
        />
      </td>

      <td className="px-4 py-3 text-muted-foreground">
        <StatusBadge
          type="attendance"
          value={attendee.is_attended}
          onClick={() => onOpenAttendanceModal(attendee)}
          disabled={!userCanMarkAttendance}
        >
          {activeAdminTab === ADMIN_TABS.ATTENDANCE
            ? attendee.attended_time
              ? formatDateTime12Hour(attendee.attended_time)
              : 'Registered'
            : attendee.is_attended
              ? 'Attended'
              : 'Registered'}
        </StatusBadge>
      </td>
    </>
  );
}

function ExpandedHeadRow({
  attendee,
  attendeeFirstName,
  familyLastName,
  attendeeAge,
  activeAdminTab,
  minAgeFilter,
  maxAgeFilter,
  userCanMarkAttendance,
  onOpenAttendanceModal,
}: {
  attendee: Attendee;
  attendeeFirstName: string;
  familyLastName: string;
  attendeeAge: string;
  activeAdminTab: string;
  minAgeFilter: number;
  maxAgeFilter: number;
  userCanMarkAttendance: boolean;
  onOpenAttendanceModal: (attendee: Attendee) => void;
}) {
  const ageNum =
    attendeeAge && attendeeAge !== 'N/A' ? parseInt(attendeeAge) : null;
  const headMeetsAge = ageNum !== null && agePassesFilter(ageNum, minAgeFilter, maxAgeFilter);

  if (!headMeetsAge) return null;

  return (
    <tr className="border-b border-sidebar-border/70 bg-sidebar/30 hover:bg-sidebar/50 transition-colors">
      <td className="px-4 py-3 text-foreground pl-10">
        {attendeeFirstName} {familyLastName}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{attendeeAge}</td>
      <td className="px-4 py-3 text-muted-foreground">{attendee.user.contact_number}</td>
      <td className="px-4 py-3 text-muted-foreground">
        {attendee.is_first_time ? 'Yes' : 'No'}
      </td>
      {activeAdminTab === ADMIN_TABS.RSVP && <td className="px-4 py-3"></td>}
      {activeAdminTab === ADMIN_TABS.RSVP && <td className="px-4 py-3"></td>}
      {activeAdminTab === ADMIN_TABS.RSVP && <td className="px-4 py-3"></td>}
      <td className="px-4 py-3"></td>
      <td className="px-4 py-3 text-muted-foreground">
        <StatusBadge
          type="attendance"
          value={attendee.is_attended}
          onClick={() => onOpenAttendanceModal(attendee)}
          disabled={!userCanMarkAttendance}
        >
          {activeAdminTab === ADMIN_TABS.ATTENDANCE
            ? attendee.attended_time
              ? formatDateTime12Hour(attendee.attended_time)
              : 'Registered'
            : attendee.is_attended
              ? 'Attended'
              : 'Registered'}
        </StatusBadge>
      </td>
    </tr>
  );
}
