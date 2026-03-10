import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { calculateAge, formatDate } from '@/utils/dateUtils';


export default function AdminAttendees() {
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { attendees, events, filters } = usePage<any>().props as {
        attendees: {
            data: Array<{
                id: number;
                user_id: number;
                event_id: number;
                is_attended: boolean;
                is_first_time: boolean;
                attended_time: string | null;
                created_at: string;
                user: {
                    first_name: string;
                    last_name: string;
                    contact_number: string;
                    birthdate: string | null;
                };
                event: {
                    id: number;
                    name: string;
                };
            }>;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            total: number;
            from: number | null;
            to: number | null;
        };
        events: Array<{
            id: number;
            name: string;
            date: string;
        }>;
        filters: {
            search?: string;
        };
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
                    <form method="get" action="/admin/attendees" className="mt-4 flex flex-wrap gap-2">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters?.search ?? ''}
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

                    {!attendees || attendees.data.length === 0 ? (
                        <div className="mt-4 rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                            No attendees registered yet.
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#444a4e]">
                                        <tr className="border-b border-gray-200 dark:border-[#555c63]">
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Contact Number
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Age
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Event
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Attended Time
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Registration Date
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendees.data.map((attendee) => (
                                        <tr
                                            key={attendee.id}
                                            className="group border-b border-gray-200 hover:bg-gray-50 dark:border-[#555c63] dark:hover:bg-[#444a4e]"
                                        >
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser(attendee.user)}
                                                    className="cursor-pointer font-semibold transition-all hover:underline hover:scale-[1.03]"
                                                >
                                                    {attendee.user.first_name}{' '}
                                                    {attendee.user.last_name}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {attendee.user.contact_number}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {calculateAge(attendee.user.birthdate)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/events/${attendee.event.id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {attendee.event.name}
                                                </Link>
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
                                                    : attendee.is_attended
                                                    ? '—'
                                                    : 'RSVP'}
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
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Delete this attendee record?')) {
                                                            router.delete(`/admin/attendees/${attendee.id}`, {
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                    className="p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 rounded bg-red-600 text-white transition hover:bg-red-700"
                                                    title="Delete attendee"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Showing {attendees.from ?? 0} to {attendees.to ?? 0} of{' '}
                                    <span className="font-semibold text-foreground">{attendees.total}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {attendees.links.map((link, index) => {
                                        const isDisabled = !link.url;
                                        const label = link.label.replace(/&laquo;|&raquo;/g, (match) => {
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
                        </>
                    )}

                    {/* Attendee Details Modal */}
                    {selectedUser && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                            onClick={() => setSelectedUser(null)}
                        >
                            <div
                                className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-foreground">Attendee Details</h2>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 border-t border-sidebar-border/70 pt-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Name</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {selectedUser.first_name} {selectedUser.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Contact Number</p>
                                        <p className="text-sm text-foreground">{selectedUser.contact_number}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Age</p>
                                            <p className="text-sm text-foreground">
                                                {calculateAge(selectedUser.birthdate)} years old
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Birthday</p>
                                            <p className="text-sm text-foreground">
                                                {formatDate(selectedUser.birthdate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">DG Leader</p>
                                        <p className="text-sm text-foreground">{selectedUser.dg_leader_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Wants to join a DG group?</p>
                                        <p className="text-sm text-foreground capitalize">
                                            {selectedUser.want_to_join_dg === 'yes' ? 'Yes' : selectedUser.want_to_join_dg === 'no' ? 'No' : 'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                                    <Link
                                        href={`/admin/users/${selectedUser.id}/edit`}
                                        className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        Edit User
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground hover:bg-sidebar/50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
