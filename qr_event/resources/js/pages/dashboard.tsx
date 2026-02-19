import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

function formatTime12Hour(time: string | null): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export default function Dashboard() {
    const { auth, events, isAdmin } = usePage().props as {
        auth?: {
            user?: {
                first_name?: string;
                last_name?: string;
                name?: string;
                contact_number?: string;
            };
        };
        events?: Array<{
            id: number;
            name: string;
            date: string;
            start_time: string | null;
            end_time: string | null;
            description: string;
            location: string;
            banner_image?: string | null;
            is_finished?: boolean;
        }>;
        isAdmin?: boolean;
    };
    const displayName = auth?.user
        ? [auth.user.first_name, auth.user.last_name]
              .filter(Boolean)
              .join(' ') || auth.user.name || auth.user.contact_number
        : null;
    const eventList = events ?? [];
    const upcomingEvents = eventList.filter((event) => !event.is_finished);
    const finishedEvents = eventList.filter((event) => event.is_finished);
    const defaultBanner = '/images/default-event.png';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h1 className="text-xl font-semibold text-foreground">
                        Welcome{displayName ? `, ${displayName}` : ''}!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAdmin
                            ? 'Manage your events or create new ones.'
                            : 'Check your upcoming events and track your attendance.'}
                    </p>
                </div>

                {/* Upcoming Events Section */}
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                {isAdmin ? 'All Events' : 'Upcoming Events'}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {isAdmin
                                    ? 'Create and manage your events.'
                                    : 'Click on an event to view details.'}
                            </p>
                        </div>
                        {isAdmin && (
                            <Link
                                href="/events/create"
                                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            >
                                Create Event
                            </Link>
                        )}
                    </div>

                    {upcomingEvents.length === 0 ? (
                        <div className="mt-4 rounded-md border border-dashed border-sidebar-border/70 p-6 text-sm text-muted-foreground">
                            {isAdmin
                                ? 'No events yet. Create one to get started.'
                                : 'No upcoming events.'}
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {upcomingEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="group rounded-lg border border-sidebar-border/70 bg-background p-3 transition-all hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="aspect-video overflow-hidden rounded-md border border-sidebar-border/70">
                                        <img
                                            src={
                                                event.banner_image || defaultBanner
                                            }
                                            alt={event.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                            {event.name}
                                        </h3>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {event.date}
                                            {event.start_time && (
                                                <>
                                                    {' • '}
                                                    {formatTime12Hour(event.start_time)}
                                                    {event.end_time && (
                                                        <> - {formatTime12Hour(event.end_time)}</>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {event.location}
                                        </p>
                                    </div>
                                    {isAdmin && (
                                        <Link
                                            href={`/events/${event.id}/edit`}
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Finished Events Section (Admin Only) */}
                {isAdmin && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            Finished Events
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your event history.
                        </p>

                        {finishedEvents.length === 0 ? (
                            <div className="mt-4 rounded-md border border-dashed border-sidebar-border/70 p-6 text-sm text-muted-foreground">
                                No finished events yet.
                            </div>
                        ) : (
                            <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                                {finishedEvents.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/events/${event.id}`}
                                        className="group rounded-lg border border-sidebar-border/70 bg-background p-3 transition-all hover:border-primary/50 hover:shadow-md"
                                    >
                                        <div className="aspect-video overflow-hidden rounded-md border border-sidebar-border/70">
                                            <img
                                                src={
                                                    event.banner_image ||
                                                    defaultBanner
                                                }
                                                alt={event.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                                {event.name}
                                            </h3>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {event.date}
                                                {event.start_time && (
                                                    <>
                                                        {' • '}
                                                        {formatTime12Hour(event.start_time)}
                                                        {event.end_time && (
                                                            <> - {formatTime12Hour(event.end_time)}</>
                                                        )}
                                                    </>
                                                )}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {event.location}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/events/${event.id}/edit`}
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Admin Dashboard: Links to Management Pages */}
            {isAdmin && (
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h2 className="text-lg font-semibold text-foreground">
                        Admin Tools
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage users and track attendance
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <Link
                            href="/admin/users"
                            className="rounded-lg border border-sidebar-border/70 bg-background p-4 transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <h3 className="font-semibold text-foreground group-hover:text-primary">
                                Registered Users
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                View all registered users in the system
                            </p>
                            <p className="mt-3 text-xs font-medium text-primary">
                                View All →
                            </p>
                        </Link>

                        <Link
                            href="/admin/attendees"
                            className="rounded-lg border border-sidebar-border/70 bg-background p-4 transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <h3 className="font-semibold text-foreground group-hover:text-primary">
                                Event Attendees
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Track all event attendance registrations
                            </p>
                            <p className="mt-3 text-xs font-medium text-primary">
                                View All →
                            </p>
                        </Link>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

