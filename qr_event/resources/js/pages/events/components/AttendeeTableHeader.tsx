import { ADMIN_TABS } from '@/pages/events/constants/attendee-constants';

interface TableHeaderProps {
  activeAdminTab: string;
}

export function AttendeeTableHeader({ activeAdminTab }: TableHeaderProps) {
  const columns = ['Family Name', 'Age', 'Contact', 'First Time'];

  if (activeAdminTab === ADMIN_TABS.RSVP) {
    columns.push('Walk-in', 'Paid', 'Amount Paid');
  }

  columns.push('Assigned Values');
  columns.push(activeAdminTab === ADMIN_TABS.ATTENDANCE ? 'Attended Time' : 'Status');

  return (
    <thead>
      <tr className="border-b border-sidebar-border/70">
        {columns.map((column) => (
          <th
            key={column}
            className="px-4 py-2 text-left font-semibold text-foreground"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}
