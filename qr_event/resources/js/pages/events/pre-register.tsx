import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    location: string;
    description: string;
}

type PreRegisterProps = {
    event: Event;
    fromQr?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function PreRegister({ event, fromQr }: PreRegisterProps) {
    const { data, setData, post, processing } = useForm({
        confirm_rsvp: false,
    });

    const handleRSVP = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.confirm_rsvp) {
            return;
        }
        post(`/events/${event.id}/confirm-rsvp`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`RSVP - ${event.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Confirm Your RSVP</h1>

                    <div className="rounded-lg border-2 border-primary/50 bg-primary/10 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4">{event.name}</h2>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Date & Time</p>
                                <p className="text-foreground font-medium">{event.date}</p>
                                {event.start_time && (
                                    <p className="text-sm text-muted-foreground">
                                        {event.start_time}
                                        {event.end_time && ` - ${event.end_time}`}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="text-foreground font-medium">{event.location}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="text-foreground">{event.description}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleRSVP} className="space-y-4">
                        <div className="bg-background border-2 border-sidebar-border/100 rounded-lg p-6">
                            <p className="text-foreground mb-4">
                                {fromQr
                                    ? 'You scanned the QR code for this event. Would you like to register your attendance?'
                                    : 'Would you like to register for this event?'}
                            </p>

                            <label className="flex items-start gap-3 cursor-pointer mb-6">
                                <input
                                    type="checkbox"
                                    checked={data.confirm_rsvp}
                                    onChange={(e) => setData('confirm_rsvp', e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">
                                    I confirm that I will attend this event and understand that this RSVP is a commitment to participate.
                                </span>
                            </label>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing || !data.confirm_rsvp}
                                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition font-medium"
                                >
                                    {processing ? 'Registering...' : 'Yes, RSVP Now'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.visit('/dashboard')}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
