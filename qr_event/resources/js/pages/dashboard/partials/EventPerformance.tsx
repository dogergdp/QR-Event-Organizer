import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { BarChart3, Users2, Download } from 'lucide-react';

type PerformanceEvent = {
    id: number;
    name: string;
    date: string;
    total_registered: number;
    total_attended: number;
    rsvp: Array<{
        id: number;
        name: string;
        contact_number: string;
        is_attended: boolean;
        created_at?: string;
        plus_ones?: Array<unknown>;
    }>;
    attendees: Array<{
        id: number;
        name: string;
        contact_number: string;
        is_attended: boolean;
        is_first_time: boolean;
        is_walk_in?: boolean;
        attended_time?: string;
        plus_ones?: Array<{ id?: string; full_name: string; is_first_time: boolean }>;
    }>;
};

type EventPerformanceProps = {
    reportEvents: PerformanceEvent[];
};

export default function EventPerformance({ reportEvents }: EventPerformanceProps) {
    const performanceEvents = reportEvents ?? [];
    const latestEventId: number | 'all' = performanceEvents.length > 0
        ? performanceEvents.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].id
        : 'all';

    const [selectedPerformanceId, setSelectedPerformanceId] = useState<number | 'all'>(latestEventId);
    const [activePerformanceTab, setActivePerformanceTab] = useState<'rsvp' | 'attendees' | 'first_timers'>('rsvp');

    const selectedPerformanceEvent = performanceEvents.find((e) => e.id === selectedPerformanceId);

    const getPeopleCount = (list: Array<{ plus_ones?: Array<unknown> }>) => {
        return list.reduce((total, person) => total + 1 + (person.plus_ones?.length ?? 0), 0);
    };

    const getRsvpCount = (list: Array<{ is_attended: boolean; plus_ones?: Array<unknown> }>) => {
        return list.reduce((total, person) => {
            const primaryNotAttended = person.is_attended ? 0 : 1;
            const plusOnesNotAttended = person.plus_ones?.length ?? 0;

            return total + primaryNotAttended + plusOnesNotAttended;
        }, 0);
    };

    const getFirstTimerCount = (list: Array<{ is_first_time: boolean; plus_ones?: Array<{ is_first_time: boolean }> }>) => {
        return list.reduce((total, person) => {
            const primaryFirstTimer = person.is_first_time ? 1 : 0;
            const plusOnesFirstTimer = (person.plus_ones ?? []).filter((member) => member.is_first_time).length;

            return total + primaryFirstTimer + plusOnesFirstTimer;
        }, 0);
    };

    // Derived Data
    const sortedRSVP = selectedPerformanceEvent?.rsvp
        ? [...selectedPerformanceEvent.rsvp].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')) : [];
    const sortedAttendees = selectedPerformanceEvent?.attendees
        ? [...selectedPerformanceEvent.attendees].sort((a, b) => (b.attended_time || '').localeCompare(a.attended_time || '')) : [];
    const sortedFirstTimers = selectedPerformanceEvent?.attendees
        ? [...selectedPerformanceEvent.attendees]
            .filter((person) => person.is_first_time || person.plus_ones?.some((member) => member.is_first_time))
            .map((person) => ({
                ...person,
                plus_ones: (person.plus_ones ?? []).filter((member) => member.is_first_time),
            }))
            .sort((a, b) => (b.attended_time || '').localeCompare(a.attended_time || ''))
        : [];

    const getActiveListData = () => {
        if (activePerformanceTab === 'rsvp') return sortedRSVP;
        if (activePerformanceTab === 'attendees') return sortedAttendees;
        return sortedFirstTimers;
    };

    const activeListData = getActiveListData();

    const registeredCount = selectedPerformanceEvent?.total_registered ?? 0;
    const attendedCount = selectedPerformanceEvent?.total_attended ?? 0;
    const attendedPercent = Math.round((attendedCount / Math.max(registeredCount, 1)) * 100);

    return (
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
                        <p className="rounded-md border border-dashed border-sidebar-border/70 p-4 text-sm text-muted-foreground">Select a specific event in Event Performance to view registered and attendee lists.</p>
                    ) : (
                        <>
                            <div className="mb-3">
                                <Link href={`/events/${selectedPerformanceEvent.id}`} className="text-sm font-semibold text-primary hover:underline">{selectedPerformanceEvent.name}</Link>
                            </div>
                            <div className="border-b border-sidebar-border/70">
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setActivePerformanceTab('rsvp')} className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${activePerformanceTab === 'rsvp' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                        Registered ({getRsvpCount(selectedPerformanceEvent.rsvp)})
                                    </button>
                                    <button onClick={() => setActivePerformanceTab('attendees')} className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${activePerformanceTab === 'attendees' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                        Attendees ({getPeopleCount(selectedPerformanceEvent.attendees)})
                                    </button>
                                    <button onClick={() => setActivePerformanceTab('first_timers')} className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${activePerformanceTab === 'first_timers' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                        First Timers ({getFirstTimerCount(sortedFirstTimers)})
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
                                    Export {activePerformanceTab === 'rsvp' ? 'Registered' : activePerformanceTab === 'attendees' ? 'Attendance' : 'First Timers'}
                                </a>
                            </div>
                            <div className="mt-3 h-80 overflow-y-auto">
                                {activeListData.length === 0 ? (
                                    <div className="flex h-full items-center justify-center rounded-md border border-dashed border-sidebar-border/70 p-4 text-center text-sm text-muted-foreground">No data for this tab yet</div>
                                ) : (
                                    <div className="space-y-2">
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

                                                {Array.isArray(person.plus_ones) && person.plus_ones.length > 0 && (
                                                    <div className="mt-2 border-t border-sidebar-border/70 pt-2">
                                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Plus Ones</p>
                                                        {activePerformanceTab === 'rsvp' && (
                                                            <p className="text-[10px] text-muted-foreground">Not attended</p>
                                                        )}
                                                        <div className="mt-1 space-y-1">
                                                            {person.plus_ones.map((member: any) => (
                                                                <div key={member.id || member.full_name} className="rounded bg-background/60 px-2 py-1">
                                                                    <p className="text-xs font-medium text-foreground">
                                                                        {member.full_name}
                                                                        {member.is_first_time && (
                                                                            <span className="ml-1 rounded bg-primary/15 px-1 py-0.5 text-[9px] font-semibold text-primary">FIRST TIME</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
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
    );
}
