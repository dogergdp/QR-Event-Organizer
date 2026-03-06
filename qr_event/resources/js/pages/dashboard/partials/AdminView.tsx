import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Users, CheckCircle, ChevronLeft, ChevronRight, Clock, ListTodo, Activity, Download } from 'lucide-react';
import { formatTime12Hour, getDaysInMonth, formatDateKey } from '@/utils/dateUtils';
import { getEventsByDate, getNextEventTime, getUpcomingThisWeek } from '@/utils/eventUtils';
import EventPerformance from './EventPerformance';
import type { DashboardProps } from '../types';

export default function AdminView({ stats, reportEvents, activityLogs, events }: DashboardProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const recentActivityLogs = (activityLogs ?? []).slice(0, 10);
    const upcomingThisWeek = getUpcomingThisWeek(events ?? []);
    const nextEventTime = getNextEventTime(events ?? []);

    const transformedReportEvents = (reportEvents ?? []).map(event => ({
        ...event,
        attendees: (event.attendees ?? []).map(attendee => ({
            ...attendee,
            is_walk_in: false,
            attended_time: attendee.attended_time ?? undefined,
        })),
    }));

    return (
        <>
            {/* EventPerformance Component */}
            <EventPerformance reportEvents={transformedReportEvents} />

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
