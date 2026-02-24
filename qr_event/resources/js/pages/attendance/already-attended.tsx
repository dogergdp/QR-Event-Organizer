import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    location: string;
    date: string;
}

interface Attendee {
    id: number;
    is_attended: boolean;
    attended_time: string | null;
}

type AlreadyAttendedProps = {
    event: Event;
    attendee: Attendee;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function AlreadyAttended({ event, attendee }: AlreadyAttendedProps) {
    const formatTime = (time: string | null): string => {
        if (!time) return '';
        return new Date(time).toLocaleString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Already Attended - ${event.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Already Checked In</h1>

                    <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">{event.name}</h2>
                                <p className="text-sm text-muted-foreground">{event.location}</p>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background border-2 border-green-500/30 rounded-lg p-6">
                        <div className="text-center space-y-4">
                            <p className="text-lg font-semibold text-green-600">✓ Attendance Confirmed</p>
                            <p className="text-foreground">
                                Your attendance has already been recorded for this event.
                            </p>
                            {attendee.attended_time && (
                                <p className="text-sm text-muted-foreground">
                                    Checked in: {formatTime(attendee.attended_time)}
                                </p>
                            )}
                            <a
                                href="/dashboard"
                                className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                            >
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
