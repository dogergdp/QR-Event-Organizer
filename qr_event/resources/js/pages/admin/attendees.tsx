import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function AdminAttendees() {
    const { attendees } = usePage().props as {
        attendees: Array<{
            id: number;
            user_id: number;
            event_id: number;
            is_attended: boolean;
            attended_time: string | null;
            created_at: string;
            user: {
                first_name: string;
                last_name: string;
                contact_number: string;
            };
            event: {
                id: number;
                name: string;
            };
        }>;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Attendees', href: '/admin/attendees' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Event Attendees" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h1 className="text-2xl font-bold text-foreground">
                        Event Attendees
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Track all event attendance registrations
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    {!attendees || attendees.length === 0 ? (
                        <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                            No attendees registered yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70">
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Contact Number
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Event
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                                            Attended
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Attended Time
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Registered
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendees.map((attendee) => (
                                        <tr
                                            key={attendee.id}
                                            className="border-b border-sidebar-border/70 hover:bg-sidebar/50"
                                        >
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {attendee.user.first_name}{' '}
                                                {attendee.user.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {attendee.user.contact_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/events/${attendee.event.id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {attendee.event.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {attendee.is_attended ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                        ✓ Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {attendee.attended_time
                                                    ? new Date(
                                                          attendee.attended_time
                                                      ).toLocaleTimeString(
                                                          'en-US',
                                                          {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          }
                                                      )
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(
                                                    attendee.created_at
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4 text-sm text-muted-foreground">
                                Total registrations:{' '}
                                <span className="font-semibold text-foreground">
                                    {attendees.length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
