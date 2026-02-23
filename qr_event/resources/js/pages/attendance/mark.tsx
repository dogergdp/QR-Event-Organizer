import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    location: string;
    date: string;
}

interface QrCode {
    id: number;
    name: string;
}

type MarkAttendanceProps = {
    event: Event;
    qrCode: QrCode;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function MarkAttendance({ event, qrCode }: MarkAttendanceProps) {
    const { data, setData, post, processing } = useForm({
        confirm_attendance: false,
    });

    const handleMarkAttendance = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.confirm_attendance) {
            return;
        }
        post(`/events/${event.id}/mark-attendance`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Mark Attendance - ${event.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Confirm Attendance</h1>

                    <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">{event.name}</h2>
                                <p className="text-sm text-muted-foreground">{event.location}</p>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                                <p className="text-sm text-muted-foreground mt-2">Check-in Point: {qrCode.name}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleMarkAttendance} className="space-y-4">
                        <div className="bg-background border-2 border-sidebar-border/100 rounded-lg p-6">
                            <p className="text-foreground mb-4">
                                Confirm your attendance at this event.
                            </p>

                            <label className="flex items-start gap-3 cursor-pointer mb-6">
                                <input
                                    type="checkbox"
                                    checked={data.confirm_attendance}
                                    onChange={(e) => setData('confirm_attendance', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">
                                    I confirm my attendance for this event.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={processing || !data.confirm_attendance}
                                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition font-medium"
                            >
                                {processing ? 'Marking...' : 'Confirm Attendance'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
