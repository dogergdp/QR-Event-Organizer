import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import { Download, BarChart3 } from 'lucide-react';

interface EventReport {
    id: number;
    name: string;
    date: string;
    start_time: string | null;
    location: string;
    total_registered: number;
    total_attended: number;
}

interface AttendeeInfo {
    id: number;
    name: string;
    contact_number: string;
    events_attended: number;
    is_first_time: boolean;
}

interface ReportStats {
    total_events: number;
    finished_events: number;
    total_attendees: number;
    total_attendances: number;
    average_attendance_rate: number;
}

interface ReportPageProps {
    stats: ReportStats;
    events: EventReport[];
    topAttendees: AttendeeInfo[];
}

export default function ReportsPage() {
    const { stats, events, topAttendees } = usePage<any>().props as ReportPageProps;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Reports',
            href: '/admin/reports',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="">
                    <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View detailed statistics and export reports
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-sidebar-border/70 bg-background p-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.total_events}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.finished_events} finished</p>
                    </div>

                    <div className="rounded-lg border border-sidebar-border/70 bg-background p-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Registered</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.total_attendees}</p>
                    </div>

                    <div className="rounded-lg border border-sidebar-border/70 bg-background p-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Attendances</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.total_attendances}</p>
                    </div>

                    <div className="rounded-lg border border-sidebar-border/70 bg-background p-4">
                        <p className="text-sm font-medium text-muted-foreground">Avg. Events per Attendee</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.average_attendance_rate}</p>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="rounded-lg border border-sidebar-border/70 bg-background p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Reports to CSV
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <a
                            href="/admin/reports/export/events"
                            className="inline-flex items-center border border-sidebar-border/70 justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium  transition-colors"
                            download
                        >
                            <Download className="h-4 w-4" />
                            Download Events CSV
                        </a>
                        <a
                            href="/admin/reports/export/attendees"
                            className="inline-flex items-center border border-sidebar-border/70 justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium  transition-colors"
                            download
                        >
                            <Download className="h-4 w-4" />
                            Download Registered Users CSV
                        </a>
                        <a
                            href="/admin/reports/export/attendance-details"
                            className="inline-flex items-center border border-sidebar-border/70 justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                            download
                        >
                            <Download className="h-4 w-4" />
                            Download Attendance Details CSV
                        </a>
                    </div>
                </div>

                {/* Event Reports */}
                <div className="rounded-lg border border-sidebar-border/70 bg-background p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Event Performance
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70">
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        Event Name
                                    </th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        Date
                                    </th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        Location
                                    </th>
                                    <th className="px-4 py-2 text-center font-semibold text-foreground">
                                        Registered
                                    </th>
                                    <th className="px-4 py-2 text-center font-semibold text-foreground">
                                        Attended
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events?.map((event) => (
                                    <tr key={event.id} className="border-b border-sidebar-border/70 hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="hover:underline text-primary"
                                            >
                                                {event.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(event.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {event.location}
                                        </td>
                                        <td className="px-4 py-3 text-center text-foreground">
                                            {event.total_registered}
                                        </td>
                                        <td className="px-4 py-3 text-center text-foreground">
                                            {event.total_attended}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!events || events.length === 0 && (
                            <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                                No events yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Attendees */}
                <div className="rounded-lg border border-sidebar-border/70 bg-background p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Top Attendees</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/70">
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        Name
                                    </th>
                                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                                        Contact
                                    </th>
                                    <th className="px-4 py-2 text-center font-semibold text-foreground">
                                        Events Attended
                                    </th>
                                    <th className="px-4 py-2 text-center font-semibold text-foreground">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topAttendees?.map((attendee) => (
                                    <tr key={attendee.id} className="border-b border-sidebar-border/70 hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {attendee.name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {attendee.contact_number}
                                        </td>
                                        <td className="px-4 py-3 text-center text-foreground">
                                            {attendee.events_attended}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {attendee.is_first_time ? (
                                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                    New
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    Regular
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!topAttendees || topAttendees.length === 0 && (
                            <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                                No attendees yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
