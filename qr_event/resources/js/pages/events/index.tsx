import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Pencil } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/events',
    },
];

function formatTime12Hour(time: string | null): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export default function EventsIndex() {
    const { events } = usePage().props as {
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
            is_ongoing?: boolean;
        }>;
    };

    const eventList = events ?? [];
    const allEvents = eventList.filter((event) => !event.is_finished);
    const finishedEvents = eventList.filter((event) => event.is_finished);
    const defaultBanner = '/images/default-event.png';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                            Events
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create and manage your events.
                        </p>
                    </div>
                    <Link
                        href="/events/create"
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Create Event
                    </Link>
                </div>

                <div className="mt-2">
                    <h2 className="text-lg font-semibold text-foreground">
                        All Events
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Upcoming and ongoing events.
                    </p>

                    {allEvents.length === 0 ? (
                        <div className="mt-4 rounded-md border border-dashed border-sidebar-border/70 p-6 text-sm text-muted-foreground">
                            No events yet. Create one to get started.
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {allEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="group rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-900"
                                >
                                    <Link href={`/events/${event.id}`} className="block">
                                    <div className="aspect-video overflow-hidden rounded-md">
                                        <img
                                            src={
                                                event.banner_image
                                                    ? `/storage/${event.banner_image}`
                                                    : defaultBanner
                                            }
                                            alt={event.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        {!!event.is_ongoing && (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                ● Ongoing
                                            </span>
                                        )}
                                        <h3 className="mt-2 truncate text-sm font-semibold text-foreground group-hover:text-primary">
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
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
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
                                <div
                                    key={event.id}
                                    className="group rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-900"
                                >
                                    <Link href={`/events/${event.id}`} className="block">
                                    <div className="aspect-video overflow-hidden rounded-md">
                                        <img
                                            src={
                                                event.banner_image
                                                    ? `/storage/${event.banner_image}`
                                                    : defaultBanner
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
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
