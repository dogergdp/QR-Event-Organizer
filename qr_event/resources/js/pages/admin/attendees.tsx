import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

function calculateAge(birthdate: string | null): string {
    if (!birthdate) return 'N/A';

    const match = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return 'N/A';

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return 'N/A';

    const today = new Date();
    let age = today.getFullYear() - year;

    const hasHadBirthdayThisYear =
        today.getMonth() + 1 > month ||
        (today.getMonth() + 1 === month && today.getDate() >= day);

    if (!hasHadBirthdayThisYear) {
        age -= 1;
    }

    return age >= 0 && age <= 130 ? age.toString() : 'N/A';
}

export default function AdminAttendees() {
    const [userSearch, setUserSearch] = useState('');
    
    const { attendees, users, events, filters } = usePage<any>().props as {
        attendees: {
            data: Array<{
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
        users: Array<{
            id: number;
            first_name: string;
            last_name: string;
            contact_number: string;
        }>;
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
                    <div className="mb-4 rounded-lg border border-sidebar-border/70 p-4">
                        <h2 className="text-base font-semibold text-foreground">Add Attendee Manually</h2>
                        <p className="text-xs text-muted-foreground mt-1 mb-3">Automatically marks user as registered and attended</p>
                        <Form method="post" action="/admin/attendees" className="mt-3 grid gap-3 md:grid-cols-3">
                            {({ processing, errors }) => {
                                const filteredUsers = users.filter((user: any) => {
                                    const searchLower = userSearch.toLowerCase();
                                    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
                                    const contact = user.contact_number.toLowerCase();
                                    return fullName.includes(searchLower) || contact.includes(searchLower);
                                });

                                return (
                                    <>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                placeholder="Search by name or contact number"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mb-2"
                                            />
                                            <select
                                                name="user_id"
                                                required
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                            >
                                                <option value="">Select user</option>
                                                {filteredUsers.map((user: any) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.first_name} {user.last_name} - {user.contact_number}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.user_id && (
                                                <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <select
                                                name="event_id"
                                                required
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                            >
                                                <option value="">Select event</option>
                                                {events.map((event: any) => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.name} ({event.date})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.event_id && (
                                                <p className="mt-1 text-xs text-red-600">{errors.event_id}</p>
                                            )}
                                        </div>

                                        <input type="hidden" name="is_attended" value="1" />

                                        <div className="md:col-span-3">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                                            >
                                                Add Attendee
                                            </button>
                                        </div>
                                    </>
                                );
                            }}
                        </Form>
                    </div>

                    <form method="get" action="/admin/attendees" className="mb-4 flex gap-2">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters?.search ?? ''}
                            placeholder="Search name or contact number"
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            Search
                        </button>
                    </form>

                    {!attendees || attendees.data.length === 0 ? (
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
                                            className="border-b border-sidebar-border/70 hover:bg-sidebar/50"
                                        >
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {attendee.user.first_name}{' '}
                                                {attendee.user.last_name}
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
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-red-600 dark:text-red-400"
                                                    title="Delete attendee"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Showing {attendees.from ?? 0} to {attendees.to ?? 0} of{' '}
                                    <span className="font-semibold text-foreground">{attendees.total}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {attendees.links.map((link, index) => (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url ?? '#'}
                                            preserveScroll
                                            className={`rounded-md px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'border border-sidebar-border/70 text-foreground'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
