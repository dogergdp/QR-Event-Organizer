import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import QRScanner from '@/components/QRScanner';
import { useState } from 'react';
import { Download, BarChart3, Calendar, Users, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, Clock, ListTodo, Users2, Activity } from 'lucide-react';

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

function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Previous month's days (grayed out)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push(new Date(year, month, -i));
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
    }

    // Next month's days (grayed out)
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
        days.push(new Date(year, month + 1, day));
    }

    return days;
}

function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getEventsByDate(eventList: Array<any>): Record<string, Array<any>> {
    const groupedEvents: Record<string, Array<any>> = {};
    
    eventList.forEach((event) => {
        const dateKey = event.date; // Assuming date is already in YYYY-MM-DD format
        if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
        }
        groupedEvents[dateKey].push(event);
    });

    return groupedEvents;
}

function getNextEventTime(eventList: Array<any>): string {
    const now = new Date();
    const upcomingEvents = eventList
        .filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && !event.is_finished;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingEvents.length === 0) {
        return 'No events';
    }

    const nextEvent = upcomingEvents[0];
    const eventDate = new Date(nextEvent.date);
    const daysUntil = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil === 0) {
        return 'Today';
    } else if (daysUntil === 1) {
        return 'Tomorrow';
    } else if (daysUntil < 7) {
        return `${daysUntil}d`;
    } else {
        return `${Math.ceil(daysUntil / 7)}w`;
    }
}

function getUpcomingThisWeek(eventList: Array<any>): Array<any> {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return eventList
        .filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= weekEnd && !event.is_finished;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
}

export default function Dashboard() {
    const { auth, events, isAdmin, stats, reportEvents, topAttendees, activityLogs } = usePage().props as {
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
            is_ongoing?: boolean;
            has_rsvp?: boolean;
        }>;
        isAdmin?: boolean;
        stats?: {
            total_events: number;
            finished_events: number;
            total_attendees: number;
            total_attendances: number;
            average_attendance_rate: number;
        };
        reportEvents?: Array<{
            id: number;
            name: string;
            date: string;
            start_time: string | null;
            location: string;
            total_registered: number;
            total_attended: number;
        }>;
        topAttendees?: Array<{
            id: number;
            name: string;
            contact_number: string;
            events_attended: number;
            is_first_time: boolean;
        }>;
        activityLogs?: Array<{
            id: number;
            action: string;
            target_type: string | null;
            target_id: number | null;
            description: string | null;
            user: string;
            created_at: string;
        }>;
    };

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const isEventOngoing = (event: any) => {
        return event?.is_ongoing ?? false;
    };

    const handleScan = (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);
        setIsScannerOpen(false);
        
        // The decodedText should be a URL like /attendance/scan?token=xxx
        // Extract path and query from the URL
        let url = decodedText;
        
        // If it's a full URL, extract just the path and query
        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                url = urlObj.pathname + urlObj.search;
            } catch (e) {
                console.error('Invalid URL:', url, e);
                return;
            }
        }
        
        if (!url.startsWith('/')) {
            url = `/${url}`;
        }

        const currentPath = window.location.pathname + window.location.search;
        const absoluteUrl = `${window.location.origin}${url}`;

        console.log('Navigating to:', url);
        try {
            router.visit(url, {
                preserveState: false,
                preserveScroll: false,
            });
        } catch (error) {
            console.error('Navigation error:', error);
            console.log('Falling back to window.location.href');
            window.location.href = absoluteUrl;
        }

        window.setTimeout(() => {
            const nextPath = window.location.pathname + window.location.search;
            if (nextPath === currentPath) {
                console.log('Inertia navigation did not change location, forcing full redirect');
                window.location.href = absoluteUrl;
            }
        }, 600);
    };
    const displayName = auth?.user
        ? [auth.user.first_name, auth.user.last_name]
              .filter(Boolean)
              .join(' ') || auth.user.name || auth.user.contact_number
        : null;
    const eventList = events ?? [];
    const upcomingEvents = eventList.filter((event) => !event.is_finished && !event.is_ongoing);
    const ongoingEvents = eventList.filter((event) => !event.is_finished && isEventOngoing(event));
    const defaultBanner = '/images/default-event.png';
    const performanceEvents = reportEvents ?? [];
    const [selectedPerformanceId, setSelectedPerformanceId] = useState<number | 'all'>(
        performanceEvents.length > 0 ? 'all' : (performanceEvents[0]?.id ?? null)
    );
    const selectedPerformanceEvent = performanceEvents.find(
        (event) => event.id === selectedPerformanceId
    );
    const registeredCount = selectedPerformanceEvent?.total_registered ?? 0;
    const attendedCount = selectedPerformanceEvent?.total_attended ?? 0;
    const registeredTotal = Math.max(registeredCount, 1);
    const attendedPercent = Math.round((attendedCount / registeredTotal) * 100);
    const recentActivityLogs = (activityLogs ?? []).slice(0, 10);
    
    // Calendar data
    const calendarDays = getDaysInMonth(currentMonth);
    const eventsByDate = getEventsByDate(eventList);
    const nextEventTime = getNextEventTime(eventList);
    const upcomingThisWeek = getUpcomingThisWeek(eventList);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-muted/40 dark:bg-muted/20 p-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Welcome{displayName ? `, ${displayName}` : ''}!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAdmin
                            ? ''
                            : 'Check your upcoming events and track your attendance.'}
                    </p>
                </div>

                {/* Scanner Button for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Scan QR Code
                    </button>
                )}

                {isAdmin && stats && (
                    <>
                        <div className="mt-2">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">Dashboard Overview</h2>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                                {/* Analytics Stats Column - takes 2 columns */}
                                <div className="flex flex-col lg:col-span-2">
                                    <h3 className="mb-4 text-base font-semibold text-foreground">Analytics</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative overflow-hidden rounded-lg border-2 border-black/30 bg-black p-4 shadow-sm">
                                            <div className="flex h-full flex-col">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white/70">Total Events</p>
                                                    <p className="mt-2 text-5xl font-bold leading-none text-yellow-300">{stats.total_events}</p>
                                                    <p className="mt-2 text-xs text-white/70">{stats.finished_events} finished</p>
                                                </div>
                                                <div className="pointer-events-none absolute -bottom-2 -right-2">
                                                    <Calendar className="h-16 w-16 text-white/15" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative overflow-hidden rounded-lg border-2 border-orange-500/30 bg-orange-600 p-4 shadow-sm">
                                            <div className="flex h-full flex-col">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white/80">Total Registered</p>
                                                    <p className="mt-2 text-5xl font-bold leading-none text-white">{stats.total_attendees}</p>
                                                </div>
                                                <div className="pointer-events-none absolute -bottom-2 -right-2">
                                                    <Users className="h-16 w-16 text-white/20" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative overflow-hidden rounded-lg border-2 border-purple-500/30 bg-purple-600 p-4 shadow-sm">
                                            <div className="flex h-full flex-col">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white/80">Total Attendances</p>
                                                    <p className="mt-2 text-5xl font-bold leading-none text-white">{stats.total_attendances}</p>
                                                </div>
                                                <div className="pointer-events-none absolute -bottom-2 -right-2">
                                                    <CheckCircle className="h-16 w-16 text-white/20" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative overflow-hidden rounded-lg border-2 border-blue-500/30 bg-blue-600 p-4 shadow-sm">
                                            <div className="flex h-full flex-col">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white/80">Next Event is in</p>
                                                    <p className="mt-2 text-5xl font-bold leading-none text-white">{nextEventTime}</p>
                                                </div>
                                                <div className="pointer-events-none absolute -bottom-2 -right-2">
                                                    <Clock className="h-16 w-16 text-white/20" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming This Week */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-[#555c63] dark:bg-[#313638] lg:col-span-1">
                                    <h3 className="mb-3 text-base font-semibold text-foreground flex items-center gap-2">
                                        <ListTodo className="h-5 w-5" />
                                        This Week
                                    </h3>
                                    {upcomingThisWeek.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No events scheduled</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {upcomingThisWeek.map((event) => (
                                                <Link
                                                    key={event.id}
                                                    href={`/events/${event.id}`}
                                                    className="block rounded-md bg-muted/50 p-2 hover:bg-muted transition-colors"
                                                >
                                                    <p className="text-xs font-medium text-foreground truncate">{event.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(event.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                                        {event.start_time && (
                                                            <> • {formatTime12Hour(event.start_time)}</>
                                                        )}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Mini Calendar */}
                                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-[#555c63] dark:bg-[#313638] lg:col-span-1">
                                    <h3 className="mb-2 text-base font-semibold text-foreground flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Calendar
                                    </h3>
                                    <div className="flex items-center justify-between mb-2">
                                        <button
                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                            className="rounded p-0.5 hover:bg-muted dark:hover:bg-white/10"
                                        >
                                            <ChevronLeft className="h-3 w-3" />
                                        </button>
                                        <span className="text-xs font-semibold text-foreground">
                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button
                                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                            className="rounded p-0.5 hover:bg-muted dark:hover:bg-white/10"
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>

                                    {/* Traditional calendar table */}
                                    <div className="space-y-1">
                                        {/* Day headers */}
                                        <div className="grid grid-cols-7 gap-0 text-[10px] font-semibold text-muted-foreground text-center">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                                <div key={day} className="py-0.5">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar weeks */}
                                        <div className="space-y-1">
                                            {(() => {
                                                const weeks = [];
                                                for (let i = 0; i < calendarDays.length; i += 7) {
                                                    weeks.push(calendarDays.slice(i, i + 7));
                                                }
                                                return weeks.map((week, weekIndex) => (
                                                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                                                        {week.map((date, dayIndex) => {
                                                            const dateKey = formatDateKey(date);
                                                            const dayEvents = eventsByDate[dateKey] || [];
                                                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                                            const isToday = dateKey === formatDateKey(new Date());

                                                            return (
                                                                <div
                                                                    key={dayIndex}
                                                                    className="group relative flex flex-col items-center"
                                                                >
                                                                    {/* Date number with circle envelope */}
                                                                    <div className="relative">
                                                                        {dayEvents.length > 0 && (
                                                                            <div
                                                                                className={`absolute inset-0 rounded-full ${
                                                                                    dayEvents.some(e => e.is_ongoing)
                                                                                        ? 'bg-green-500/30'
                                                                                        : dayEvents.some(e => !e.is_finished)
                                                                                        ? 'bg-blue-500/30'
                                                                                        : 'bg-gray-400/30'
                                                                                }`}
                                                                            />
                                                                        )}
                                                                        <span
                                                                            className={`relative text-[11px] font-semibold px-1.5 py-0.5 rounded transition-all ${
                                                                                isCurrentMonth
                                                                                    ? isToday
                                                                                        ? 'bg-primary/30 text-primary font-bold'
                                                                                        : 'text-foreground'
                                                                                    : 'text-muted-foreground opacity-50'
                                                                            }`}
                                                                        >
                                                                            {date.getDate()}
                                                                        </span>
                                                                    </div>

                                                                    {/* Hover tooltip */}
                                                                    {dayEvents.length > 0 && (
                                                                        <div className="absolute top-full mt-1 hidden group-hover:block z-50">
                                                                            <div className="bg-foreground text-background rounded-md shadow-lg p-2 text-left text-xs whitespace-nowrap">
                                                                                {dayEvents.slice(0, 2).map((event) => (
                                                                                    <Link
                                                                                        key={event.id}
                                                                                        href={`/events/${event.id}`}
                                                                                        className="block py-0.5 hover:underline truncate max-w-[150px]"
                                                                                    >
                                                                                        {event.name}
                                                                                    </Link>
                                                                                ))}
                                                                                {dayEvents.length > 2 && (
                                                                                    <div className="text-xs text-opacity-70 pt-0.5 border-t border-background/30">
                                                                                        +{dayEvents.length - 2} more
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Second Row: Performance & Top Attendees */}
                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {performanceEvents.length > 0 && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Event Performance
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="event-performance" className="text-xs font-medium text-muted-foreground">
                                                Select event
                                            </label>
                                            <select
                                                id="event-performance"
                                                value={selectedPerformanceId ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSelectedPerformanceId(value === 'all' ? 'all' : Number(value));
                                                }}
                                                className="h-9 rounded-md border border-input bg-white px-3 text-sm text-foreground dark:border-[#555c63] dark:bg-[#444a4e]"
                                            >
                                                <option value="all">All events</option>
                                                {performanceEvents.map((event) => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-orange-700 via-orange-500 to-orange-300" />
                                            <span>Registered</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-sm bg-gradient-to-t from-purple-700 via-purple-500 to-purple-300" />
                                            <span>Attended</span>
                                        </div>
                                    </div>

                                    {selectedPerformanceId === 'all' ? (
                                        <div className="mt-6 overflow-x-auto pb-2">
                                            <div className="min-w-[640px] rounded-lg border border-gray-200 bg-background/40 p-4 dark:border-[#555c63]">
                                                <div className="flex h-72 items-end gap-3">
                                                    {performanceEvents.map((event) => {
                                                        const registeredHeight = Math.max((event.total_registered / Math.max(...performanceEvents.map((item) => Math.max(item.total_registered, item.total_attended)), 1)) * 100, 2);
                                                        const attendedHeight = Math.max((event.total_attended / Math.max(...performanceEvents.map((item) => Math.max(item.total_registered, item.total_attended)), 1)) * 100, 2);

                                                        return (
                                                            <div key={event.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                                                <div className="flex h-56 w-full items-end justify-center gap-1.5">
                                                                    <div className="flex w-12 flex-col items-center">
                                                                        <span className="mb-1 text-[10px] font-semibold text-muted-foreground">{event.total_registered}</span>
                                                                        <div className="relative h-44 w-full overflow-hidden rounded-t-md bg-muted/40">
                                                                            <div
                                                                                className="bar-animate absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-orange-700 via-orange-500 to-orange-300"
                                                                                style={{ height: `${registeredHeight}%` }}
                                                                                title={`Registered: ${event.total_registered}`}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex w-12 flex-col items-center">
                                                                        <span className="mb-1 text-[10px] font-semibold text-muted-foreground">{event.total_attended}</span>
                                                                        <div className="relative h-44 w-full overflow-hidden rounded-t-md bg-muted/40">
                                                                            <div
                                                                                className="bar-animate absolute inset-x-0 bottom-0 rounded-t-md bg-gradient-to-t from-purple-700 via-purple-500 to-purple-300"
                                                                                style={{ height: `${attendedHeight}%` }}
                                                                                title={`Attended: ${event.total_attended}`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <Link
                                                                    href={`/events/${event.id}`}
                                                                    className="w-full truncate text-center text-xs font-medium text-primary hover:underline"
                                                                    title={event.name}
                                                                >
                                                                    {event.name}
                                                                </Link>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        selectedPerformanceEvent && (
                                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="flex items-center justify-center">
                                                    <div
                                                        className="donut-animate relative flex h-44 w-44 items-center justify-center rounded-full shadow-lg"
                                                        style={{
                                                            background: `conic-gradient(#7c3aed 0% ${attendedPercent}%, #f97316 ${attendedPercent}% 100%)`,
                                                        }}
                                                        aria-label="Attendance donut chart"
                                                    >
                                                        <div className="absolute inset-5 rounded-full bg-background" />
                                                        <div className="relative text-center">
                                                            <p className="text-xs text-muted-foreground">Attended</p>
                                                            <p className="text-2xl font-semibold text-foreground">
                                                                {attendedPercent}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Event</p>
                                                        <Link
                                                            href={`/events/${selectedPerformanceEvent.id}`}
                                                            className="text-sm font-semibold text-primary hover:underline"
                                                        >
                                                            {selectedPerformanceEvent.name}
                                                        </Link>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="rounded-md bg-muted/30 p-3">
                                                            <p className="text-xs text-muted-foreground">Registered</p>
                                                            <p className="text-lg font-semibold text-foreground">
                                                                {registeredCount}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-md bg-muted/30 p-3">
                                                            <p className="text-xs text-muted-foreground">Attended</p>
                                                            <p className="text-lg font-semibold text-foreground">
                                                                {attendedCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {attendedCount} of {registeredCount} registered attendees checked in.
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            {topAttendees && topAttendees.length > 0 && (
                                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                                    <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                                        <Users2 className="h-5 w-5" />
                                        Top Attendees
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-sidebar-border/100">
                                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Name</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-foreground">Contact</th>
                                                    <th className="px-4 py-2 text-center font-semibold text-foreground">Events Attended</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topAttendees.map((attendee) => (
                                                    <tr key={attendee.id} className="border-b-2 border-sidebar-border/100 hover:bg-muted/50">
                                                        <td className="px-4 py-3 font-medium text-foreground">{attendee.name}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{attendee.contact_number}</td>
                                                        <td className="px-4 py-3 text-center text-foreground">{attendee.events_attended}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Third Row: Logs & Exports */}
                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Logs Section */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Recent Activity
                                    </h2>
                                    <Link
                                        href="/admin/logs"
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        View all
                                    </Link>
                                </div>
                                {recentActivityLogs.length === 0 ? (
                                    <p className="mt-3 text-xs text-muted-foreground">No activity yet.</p>
                                ) : (
                                    <div className="mt-4 space-y-2">
                                        {recentActivityLogs.map((log) => (
                                            <div key={log.id} className="rounded-md bg-muted/30 px-3 py-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {log.created_at}
                                                </p>
                                                <p className="text-sm text-foreground">
                                                    <span className="font-semibold">{log.user}</span>{' '}
                                                    {log.description ?? log.action}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Export Section */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                                    <Download className="h-5 w-5" />
                                    Export Reports to CSV
                                </h2>
                                <div className="space-y-3">
                                    <a
                                        href="/admin/reports/export/events"
                                        className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted dark:hover:bg-muted/60"
                                        download
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Events CSV
                                    </a>

                                    <a
                                        href="/admin/reports/export/attendees"
                                        className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted dark:hover:bg-muted/60"
                                        download
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Registered Users CSV
                                    </a>

                                    <a
                                        href="/admin/reports/export/attendance-details"
                                        className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted dark:hover:bg-muted/60"
                                        download
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Attendance Details CSV
                                    </a>

                                    <a
                                        href="/admin/reports/export/logs"
                                        className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted dark:hover:bg-muted/60"
                                        download
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Activity Logs CSV
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                
                {!isAdmin && (
                    <>
                        {/* Ongoing Events Section */}
                        {ongoingEvents.length > 0 && (
                            <div className="mt-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Ongoing Events
                                        </h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Events happening now
                                        </p>
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
                                                    src={
                                                        event.banner_image ? `/storage/${event.banner_image}` : defaultBanner
                                                    }
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
                                                    {event.has_rsvp && (
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
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Events Section */}
                        <div className="mt-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Upcoming Events
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Click on an event to view details.
                                    </p>
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
                                                        src={
                                                            event.banner_image ? `/storage/${event.banner_image}` : defaultBanner
                                                        }
                                                        alt={event.name}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {event.has_rsvp && (
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
                    </>
                )}
            </div>


        </AppLayout>
    );
}



