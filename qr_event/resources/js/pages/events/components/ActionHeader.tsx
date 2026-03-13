import { Link } from '@inertiajs/react';

interface ActionHeaderProps {
  eventId: number;
  eventName: string;
  attendeesUrl: string;
  userCanManagePayments: boolean;
  userCanManageAttendees: boolean;
  onImportFamiliesClick: () => void;
  onAddAttendeeClick: () => void;
}

export function ActionHeader({
  eventId,
  eventName,
  attendeesUrl,
  userCanManagePayments,
  userCanManageAttendees,
  onImportFamiliesClick,
  onAddAttendeeClick,
}: ActionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold text-foreground">Event Attendees</h2>
      <div className="flex items-center gap-2">
        {userCanManagePayments && (
          <button
            type="button"
            onClick={onImportFamiliesClick}
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Import Families CSV
          </button>
        )}
        {userCanManageAttendees && (
          <button
            type="button"
            onClick={onAddAttendeeClick}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Attendee Manually
          </button>
        )}
        <Link
          href={`/events/${eventId}`}
          className="rounded-md border border-sidebar-border/70 px-3 py-2 text-sm text-foreground hover:bg-sidebar/50"
        >
          Back to Event
        </Link>
      </div>
    </div>
  );
}
