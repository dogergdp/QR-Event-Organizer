import { Link } from '@inertiajs/react';
import { formatTime12Hour } from '@/utils/dateUtils';
import type { DashboardProps } from '../types';

interface UserViewProps {
    events: DashboardProps['events'];
    onScanClick: () => void;
}

export default function UserView({ events = [], onScanClick }: UserViewProps) {
    const isEventOngoing = (event: any) => event?.is_ongoing ?? false;

    const upcomingEvents = events.filter((event) => !event.is_finished && !isEventOngoing(event));
    const ongoingEvents = events.filter((event) => !event.is_finished && isEventOngoing(event));
    const defaultBanner = '/images/default-event.jpg';

    return (
        <div className="space-y-4">
            <button
                onClick={onScanClick}
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Scan QR Code
            </button>

            {/* Ongoing Events Section */}
            {ongoingEvents.length > 0 && (
                <div className="mt-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Ongoing Events</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Events happening now</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {ongoingEvents.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-[#555c63] dark:bg-[#313638]"
                            >
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={event.banner_image ? `/storage/${event.banner_image}` : defaultBanner}
                                        alt={event.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                            ● Ongoing
                                        </span>
                                        {event.is_attended ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                ● Attended
                                            </span>
                                        ) : event.has_rsvp && (
                                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground dark:bg-white/10 dark:text-white">
                                                RSVP'd
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-2 truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                        {event.name}
                                    </h3>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {event.date}
                                        {event.start_time && (
                                            <>
                                                {' • '}
                                                {formatTime12Hour(event.start_time)}
                                                {event.end_time && <> - {formatTime12Hour(event.end_time)}</>}
                                            </>
                                        )}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">{event.location}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}





            {/* Upcoming Events Section */}
            <div className="mt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Click on an event to view details.</p>
                    </div>
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="mt-4 rounded-md border-2 border-dashed border-sidebar-border/100 p-6 text-sm text-muted-foreground">
                        No upcoming events.
                    </div>
                ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {upcomingEvents.map((event) => (
                            <div
                                key={event.id}
                                className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-[#555c63] dark:bg-[#313638]"
                            >
                                <Link href={`/events/${event.id}`}>
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={event.banner_image ? `/storage/${event.banner_image}` : defaultBanner}
                                            alt={event.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            {event.is_attended ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                    ● Attended
                                                </span>
                                            ) : event.has_rsvp && (
                                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground dark:bg-white/10 dark:text-white">
                                                    RSVP'd
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                                            {event.name}
                                        </h3>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {event.date}
                                            {event.start_time && (
                                                <>
                                                    {' • '}
                                                    {formatTime12Hour(event.start_time)}
                                                    {event.end_time && <> - {formatTime12Hour(event.end_time)}</>}
                                                </>
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">{event.location}</p>
                                    </div>
                                </Link>

                                {!event.has_rsvp && (
                                    <Link
                                        href={`/events/${event.id}/rsvp`}
                                        className="mx-3 mb-3 block w-[calc(100%-1.5rem)] rounded-lg bg-black px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        RSVP Now
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
