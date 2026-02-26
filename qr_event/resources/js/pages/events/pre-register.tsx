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
    description: string | null;
}

type PreRegisterProps = {
    event: Event;
    fromQr?: boolean;
    alreadyRsvpd?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function PreRegister({ event, fromQr, alreadyRsvpd = false }: PreRegisterProps) {
    const { data, setData, post, processing } = useForm({
        confirm_rsvp: false,
        is_first_time: null as boolean | null,
    });
    const hasDescription = Boolean(event.description && event.description.trim());

    const formatTime = (time: string | null): string => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

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

                    <div className="rounded-xl border border-sidebar-border/70 bg-background p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">{event.name}</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">DATE & TIME</p>
                                <p className="text-foreground font-medium">{event.date}</p>
                                {(event.start_time || event.end_time) && (
                                    <p className="text-sm text-muted-foreground">
                                        {event.start_time && formatTime(event.start_time)}
                                        {event.start_time && event.end_time && ' - '}
                                        {event.end_time && formatTime(event.end_time)}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">LOCATION</p>
                                <p className="text-foreground font-medium">{event.location}</p>
                            </div>

                            {hasDescription && (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">DESCRIPTION</p>
                                    <p className="text-foreground">{event.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleRSVP} className="space-y-4">
                        <div className="bg-background border border-sidebar-border/70 rounded-xl p-6">
                            {alreadyRsvpd ? (
                                <>
                                    <p className="text-foreground mb-4 text-lg font-semibold text-green-600">
                                        ✓ You've Already RSVP'd
                                    </p>
                                    <p className="text-foreground mb-6">
                                        Thank you! Your RSVP for this event has been confirmed. We look forward to seeing you!
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.visit('/dashboard')}
                                        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                                    >
                                        Back to Dashboard
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <p className="text-sm font-medium text-foreground mb-3">
                                            Is this your first time joining such an event?
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setData('is_first_time', true)}
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                    data.is_first_time === true
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('is_first_time', false)}
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                    data.is_first_time === false
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-foreground mb-4">
                                        {fromQr
                                            ? 'You scanned the QR code for this event. Would you like to register your attendance?'
                                            : 'Would you like to register for this event?'}
                                    </p>

                                    <label className="flex items-start gap-3 cursor-pointer mb-6 relative">
                                        <div className="mt-1 relative flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={data.confirm_rsvp}
                                                onChange={(e) => setData('confirm_rsvp', e.target.checked)}
                                                className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                            />
                                            {data.confirm_rsvp && (
                                                <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground">
                                            I confirm that I will attend this event and understand that this RSVP is a commitment to participate.
                                        </span>
                                    </label>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={processing || !data.confirm_rsvp || data.is_first_time === null}
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
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
