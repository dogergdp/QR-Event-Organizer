import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { BarChart3, Calendar, Users, CheckCircle, ChevronLeft, ChevronRight, Clock, ListTodo, Users2, Activity, Download } from 'lucide-react';
import { formatTime12Hour, getDaysInMonth, formatDateKey } from '@/utils/dateUtils';
import { getEventsByDate, getNextEventTime, getUpcomingThisWeek } from '@/utils/eventUtils';
import type { DashboardProps } from '../types';

export default function AdminView({ stats, reportEvents, activityLogs, events }: DashboardProps) {
    const performanceEvents = reportEvents ?? [];
    const latestEventId: number | 'all' = performanceEvents.length > 0
        ? performanceEvents.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].id
        : 'all';

    const [selectedPerformanceId, setSelectedPerformanceId] = useState<number | 'all'>(latestEventId);
    const [activePerformanceTab, setActivePerformanceTab] = useState<'rsvp' | 'attendees' | 'first_timers'>('rsvp');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const selectedPerformanceEvent = performanceEvents.find((e) => e.id === selectedPerformanceId);

    // Derived Data
    const sortedRSVP = selectedPerformanceEvent?.rsvp
        ? [...selectedPerformanceEvent.rsvp].sort((a, b) => (b.attended_time || '').localeCompare(a.attended_time || '')) : [];
    const sortedAttendees = selectedPerformanceEvent?.attendees
        ? [...selectedPerformanceEvent.attendees].sort((a, b) => (b.attended_time || '').localeCompare(a.attended_time || '')) : [];
    const sortedFirstTimers = selectedPerformanceEvent?.attendees
        ? [...selectedPerformanceEvent.attendees].filter(a => a.is_first_time).sort((a, b) => (b.attended_time || '').localeCompare(a.attended_time || '')) : [];

    const getActiveListData = () => {
        if (activePerformanceTab === 'rsvp') return sortedRSVP;
        if (activePerformanceTab === 'attendees') return sortedAttendees;
        return sortedFirstTimers;
    };

    const activeListData = getActiveListData();

    const registeredCount = selectedPerformanceEvent?.total_registered ?? 0;
    const attendedCount = selectedPerformanceEvent?.total_attended ?? 0;
    const attendedPercent = Math.round((attendedCount / Math.max(registeredCount, 1)) * 100);
    const recentActivityLogs = (activityLogs ?? []).slice(0, 10);
    const upcomingThisWeek = getUpcomingThisWeek(events ?? []);
    const nextEventTime = getNextEventTime(events ?? []);

    return (
        <>
            {/* Top Row: Event Performance & Event People */}
            <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <BarChart3 className="h-5 w-5" />
                    Event Performance
                </h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Performance Chart / Donut */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638] lg:col-span-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="event-performance" className="text-xs font-medium text-muted-foreground">Select event</label>
                                <select
                                    id="event-performance"
                                    value={selectedPerformanceId ?? ''}
                                    onChange={(e) => setSelectedPerformanceId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="h-9 rounded-md border border-input bg-white px-3 text-sm text-foreground dark:border-[#555c63] dark:bg-[#444a4e]"
                                >
                                    <option value="all">All events</option>
                                    {performanceEvents.map((event) => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-orange-600" />
                                <span>Registered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-purple-600" />
                                <span>Attended</span>
                            </div>
                        </div>

                        {selectedPerformanceId === 'all' ? (
                            <div className="mt-6 overflow-x-auto pb-2">
                                <div className="min-w-[640px] rounded-lg border border-gray-200 bg-background/40 p-4 dark:border-[#555c63]">
                                    <div className="flex h-72 items-end gap-3">
                                        {performanceEvents.map((event) => {
                                            const maxVal = Math.max(...performanceEvents.map(i => Math.max(i.total_registered, i.total_attended)), 1);
                                            const regHeight = Math.max((event.total_registered / maxVal) * 100, 2);
                                            const attHeight = Math.max((event.total_attended / maxVal) * 100, 2);
                                            return (
                                                <div key={event.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                                    <div className="flex h-56 w-full items-end justify-center gap-1.5">
                                                        <div className="flex w-12 flex-col items-center">
                                                            <span className="mb-1 text-[10px] font-semibold text-muted-foreground">{event.total_registered}</span>
                                                            <div className="relative h-44 w-full overflow-hidden rounded-t-md bg-muted/40">
                                                                <div className="bar-animate absolute inset-x-0 bottom-0 rounded-t-md bg-orange-600" style={{ height: `${regHeight}%` }} title={`Registered: ${event.total_registered}`} />
                                                            </div>
                                                        </div>
                                                        <div className="flex w-12 flex-col items-center">
                                                            <span className="mb-1 text-[10px] font-semibold text-muted-foreground">{event.total_attended}</span>
                                                            <div className="relative h-44 w-full overflow-hidden rounded-t-md bg-muted/40">
                                                                <div className="bar-animate absolute inset-x-0 bottom-0 rounded-t-md bg-purple-600" style={{ height: `${attHeight}%` }} title={`Attended: ${event.total_attended}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link href={`/events/${event.id}`} className="w-full truncate text-center text-xs font-medium text-primary hover:underline" title={event.name}>
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
                                    <div className="flex h-72 items-center justify-center">
                                        <div
                                            className="donut-animate relative flex h-64 w-64 items-center justify-center rounded-full shadow-lg"
                                            style={{
                                                background: `conic-gradient(#9333ea 0% var(--donut-percent), #ea580c var(--donut-percent) 100%)`,
                                                ['--donut-percent' as any]: `${attendedPercent}%`
                                            }}
                                        >
                                            <div className="absolute inset-12 rounded-full bg-background" />
                                            <div className="relative text-center">
                                                <p className="text-xs text-muted-foreground">Attended</p>
                                                <p className="text-3xl font-semibold text-foreground">{attendedPercent}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground">Event</p>
                                            <Link href={`/events/${selectedPerformanceEvent.id}`} className="text-sm font-semibold text-primary hover:underline">{selectedPerformanceEvent.name}</Link>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="relative overflow-hidden rounded-lg border-2 border-orange-500/30 bg-orange-600 p-4 shadow-sm">
                                                <div className="flex h-full flex-col">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white/80">Registered</p>
                                                        <p className="mt-2 text-5xl font-bold leading-none text-white">{registeredCount}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative overflow-hidden rounded-lg border-2 border-purple-500/30 bg-purple-600 p-4 shadow-sm">
                                                <div className="flex h-full flex-col">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white/80">Attended</p>
                                                        <p className="mt-2 text-5xl font-bold leading-none text-white">{attendedCount}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{attendedCount} of {registeredCount} registered attendees checked in.</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Event People */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638] lg:col-span-4">
                        <h3 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2"><Users2 className="h-5 w-5" /> Event People</h3>
                        {selectedPerformanceId === 'all' || !selectedPerformanceEvent ? (
                            <p className="rounded-md border border-dashed border-sidebar-border/70 p-4 text-sm text-muted-foreground">Select a specific event in Event Performance to view RSVP and attendee lists.</p>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <Link href={`/events/${selectedPerformanceEvent.id}`} className="text-sm font-semibold text-primary hover:underline">{selectedPerformanceEvent.name}</Link>
                                </div>
                                <div className="border-b border-sidebar-border/70">
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => setActivePerformanceTab('rsvp')} className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${activePerformanceTab === 'rsvp' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                            RSVP ({selectedPerformanceEvent.rsvp.length})
                                        </button>
                                        <button onClick={() => setActivePerformanceTab('attendees')} className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${activePerformanceTab === 'attendees' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                            Attendees ({selectedPerformanceEvent.attendees.length})
                                        </button>
                                        <button onClick={() => setActivePerformanceTab('first_timers')} className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${activePerformanceTab === 'first_timers' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                            First Timers ({sortedFirstTimers.length})
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {activePerformanceTab === 'rsvp' ? 'Pre-registered' : activePerformanceTab === 'attendees' ? 'Checked-in' : 'New Members'}
                                    </p>
                                    <a
                                        href={`/admin/reports/export/event/${selectedPerformanceEvent.id}/attendees?type=${activePerformanceTab === 'first_timers' ? 'first_time' : activePerformanceTab === 'attendees' ? 'attendance' : 'rsvp'}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                        download
                                    >
                                        <Download className="h-3 w-3" />
                                        Export {activePerformanceTab === 'rsvp' ? 'RSVP' : activePerformanceTab === 'attendees' ? 'Attendance' : 'First Timers'}
                                    </a>
                                </div>
                                <div className="mt-3 h-80 overflow-y-auto">
                                    {activeListData.length === 0 ? (
                                        <div className="flex h-full items-center justify-center rounded-md border border-dashed border-sidebar-border/70 p-4 text-center text-sm text-muted-foreground">No data for this tab yet</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {activeListData.slice(0, 50).map((person: any) => (
                                                <div key={person.id} className="rounded-md border border-sidebar-border/70 bg-muted/20 px-3 py-2 relative overflow-hidden">
                                                    {person.is_first_time && (
                                                        <div className="absolute top-0 right-0">
                                                            <div className="bg-primary text-[8px] font-bold text-primary-foreground px-1.5 py-0.5 rounded-bl-md">
                                                                FIRST TIME
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-sm font-medium text-foreground">{person.name}</p>
                                                    <p className="text-xs text-muted-foreground">{person.contact_number}</p>
                                                    {(activePerformanceTab === 'attendees' || activePerformanceTab === 'first_timers') && person.attended_time && (
                                                        <p className="mt-1 text-xs text-muted-foreground">Checked in: {person.attended_time}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Middle Row: Overview, Stats & Calendar */}
            {stats && (
                <div className="mt-2">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Dashboard Overview</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        <div className="flex flex-col lg:col-span-2">
                            <h3 className="mb-4 text-base font-semibold text-foreground">Analytics</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Stat Cards */}
                                <div className="relative overflow-hidden rounded-lg border-2 border-muted/30 bg-white p-4 shadow-sm dark:bg-[#444a4e]">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                                            <p className="mt-2 text-5xl font-bold leading-none text-foreground">{stats.total_events}</p>
                                            <p className="mt-2 text-xs text-muted-foreground">{stats.finished_events} finished</p>
                                        </div>
                                        <div className="pointer-events-none absolute -bottom-2 -right-2"><Calendar className="h-16 w-16 text-foreground/5" /></div>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-lg border-2 border-muted/30 bg-white p-4 shadow-sm dark:bg-[#444a4e]">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                                            <p className="mt-2 text-5xl font-bold leading-none text-foreground">{stats.total_attendees}</p>
                                        </div>
                                        <div className="pointer-events-none absolute -bottom-2 -right-2"><Users className="h-16 w-16 text-foreground/5" /></div>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-lg border-2 border-muted/30 bg-white p-4 shadow-sm dark:bg-[#444a4e]">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Attendances</p>
                                            <p className="mt-2 text-5xl font-bold leading-none text-foreground">{stats.total_attendances}</p>
                                        </div>
                                        <div className="pointer-events-none absolute -bottom-2 -right-2"><CheckCircle className="h-16 w-16 text-foreground/5" /></div>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-lg border-2 border-muted/30 bg-white p-4 shadow-sm dark:bg-[#444a4e]">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Next Event is in</p>
                                            <p className="mt-2 text-5xl font-bold leading-none text-foreground">{nextEventTime}</p>
                                        </div>
                                        <div className="pointer-events-none absolute -bottom-2 -right-2"><Clock className="h-16 w-16 text-foreground/5" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* This Week */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-[#555c63] dark:bg-[#313638] lg:col-span-1">
                            <h3 className="mb-3 text-base font-semibold text-foreground flex items-center gap-2"><ListTodo className="h-5 w-5" /> This Week</h3>
                            {upcomingThisWeek.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No events scheduled</p>
                            ) : (
                                <div className="space-y-2">
                                    {upcomingThisWeek.map((event) => (
                                        <Link key={event.id} href={`/events/${event.id}`} className="block rounded-md bg-muted/50 p-2 hover:bg-muted transition-colors">
                                            <p className="text-xs font-medium text-foreground truncate">{event.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                                {event.start_time && <> • {formatTime12Hour(event.start_time)}</>}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mini Calendar */}
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-[#555c63] dark:bg-[#313638] lg:col-span-1">
                            <h3 className="mb-2 text-base font-semibold text-foreground flex items-center gap-2"><Calendar className="h-5 w-5" /> Calendar</h3>
                            <div className="flex items-center justify-between mb-2">
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="rounded p-0.5 hover:bg-muted dark:hover:bg-white/10"><ChevronLeft className="h-3 w-3" /></button>
                                <span className="text-xs font-semibold text-foreground">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="rounded p-0.5 hover:bg-muted dark:hover:bg-white/10"><ChevronRight className="h-3 w-3" /></button>
                            </div>
                            <div className="space-y-1">
                                <div className="grid grid-cols-7 gap-0 text-[10px] font-semibold text-muted-foreground text-center">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="py-0.5">{day}</div>)}
                                </div>
                                <div className="space-y-1">
                                    {(() => {
                                        const calendarDays = getDaysInMonth(currentMonth);
                                        const eventsByDate = getEventsByDate(events ?? []);
                                        const weeks = [];
                                        for (let i = 0; i < calendarDays.length; i += 7) weeks.push(calendarDays.slice(i, i + 7));

                                        return weeks.map((week, wIdx) => (
                                            <div key={wIdx} className="grid grid-cols-7 gap-2">
                                                {week.map((date, dIdx) => {
                                                    const dateKey = formatDateKey(date);
                                                    const dayEvents = eventsByDate[dateKey] || [];
                                                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                                    const isToday = dateKey === formatDateKey(new Date());

                                                    return (
                                                        <div key={dIdx} className="group relative flex flex-col items-center">
                                                            <div className="relative">
                                                                {dayEvents.length > 0 && (
                                                                    <div className={`absolute inset-0 rounded-full ${dayEvents.some((e:any) => e.is_ongoing) ? 'bg-green-500/30' : dayEvents.some((e:any) => !e.is_finished) ? 'bg-blue-500/30' : 'bg-gray-400/30'}`} />
                                                                )}
                                                                <span className={`relative text-[11px] font-semibold px-1.5 py-0.5 rounded transition-all ${isCurrentMonth ? isToday ? 'bg-primary/30 text-primary font-bold' : 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
                                                                    {date.getDate()}
                                                                </span>
                                                            </div>
                                                            {dayEvents.length > 0 && (
                                                                <div className="absolute top-full mt-1 hidden group-hover:block z-50">
                                                                    <div className="bg-foreground text-background rounded-md shadow-lg p-2 text-left text-xs whitespace-nowrap">
                                                                        {dayEvents.slice(0, 2).map((e:any) => <Link key={e.id} href={`/events/${e.id}`} className="block py-0.5 hover:underline truncate max-w-[150px]">{e.name}</Link>)}
                                                                        {dayEvents.length > 2 && <div className="text-xs text-opacity-70 pt-0.5 border-t border-background/30">+{dayEvents.length - 2} more</div>}
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
            )}

            {/* Bottom Row: Logs & Exports */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Activity</h2>
                        <Link href="/admin/logs" className="text-xs font-medium text-primary hover:underline">View all</Link>
                    </div>
                    {recentActivityLogs.length === 0 ? <p className="mt-3 text-xs text-muted-foreground">No activity yet.</p> : (
                        <div className="mt-4 space-y-2">
                            {recentActivityLogs.map((log) => (
                                <div key={log.id} className="rounded-md bg-muted/30 px-3 py-2">
                                    <p className="text-xs text-muted-foreground">{log.created_at}</p>
                                    <p className="text-sm text-foreground"><span className="font-semibold">{log.user}</span> {log.description ?? log.action}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-[#555c63] dark:bg-[#313638]">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"><Download className="h-5 w-5" /> Export Reports to CSV</h2>
                    <div className="space-y-3">
                        <a href="/admin/reports/export/events" className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted" download><Download className="h-4 w-4" /> Download Events CSV</a>
                        <a href="/admin/reports/export/attendees" className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted" download><Download className="h-4 w-4" /> Download Registered Users CSV</a>
                        <a href="/admin/reports/export/attendance-details" className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted" download><Download className="h-4 w-4" /> Download Attendance Details CSV</a>
                        <a href="/admin/reports/export/logs" className="flex items-center gap-2 rounded-md p-3 bg-muted/40 font-medium text-primary transition-colors hover:bg-muted" download><Download className="h-4 w-4" /> Download Activity Logs CSV</a>
                    </div>
                </div>
            </div>
        </>
    );
}
