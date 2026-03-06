import { Head, Link } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

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

export default function AlreadyAttended({ event, attendee }: AlreadyAttendedProps) {
    const formatTime = (time: string | null): string => {
        if (!time) return '';
        return new Date(time).toLocaleString();
    };

    return (
        <>
            <Head title={`Already Attended - ${event.name}`} />

            <div className="fixed inset-0 z-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url("/images/slideshow/slide1.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    minHeight: '100vh',
                    height: '100%',
                }}
            />
            <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-white/50 dark:bg-black/40 pointer-events-none z-10" />

            <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 p-4 md:p-8 z-20">
                <div className="flex w-full max-w-2xl flex-col gap-10">
                    <Card className="rounded-2xl relative shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40">
                        <CardContent className="px-8 py-10">
                            <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <h1 className="text-lg font-semibold text-foreground">Already Checked In</h1>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Your attendance has already been recorded for this event.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-foreground mb-6">
                                <p><span className="font-bold">Event:</span> {event.name}</p>
                                <p><span className="font-bold">Date:</span> {event.date}</p>
                                <p><span className="font-bold">Location:</span> {event.location}</p>
                                {attendee.attended_time && (
                                    <p><span className="font-bold">Checked In:</span> {formatTime(attendee.attended_time)}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Link
                                    href="/dashboard"
                                    className="flex-1 rounded-lg border border-sidebar-border/70 px-4 py-2 text-center text-sm font-medium text-foreground bg-black text-white hover:bg-sidebar/50"
                                >
                                    Back to Dashboard
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
