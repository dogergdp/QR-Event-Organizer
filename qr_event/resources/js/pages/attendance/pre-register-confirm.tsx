import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    location: string;
    date: string;
    start_time: string | null;
}

type PreRegisterConfirmProps = {
    event: Event;
    qrToken?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function PreRegisterConfirm({ event, qrToken }: PreRegisterConfirmProps) {
    const { data, setData, post, processing } = useForm({
        confirm_rsvp: false,
        qr_token: qrToken ?? '',
    });

    const handleConfirmRsvp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.confirm_rsvp) {
            return;
        }
        post(`/events/${event.id}/confirm-rsvp`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`RSVP Confirmation - ${event.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">RSVP Confirmation</h1>

                    <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">{event.name}</h2>
                                <p className="text-sm text-muted-foreground mb-1">{event.location}</p>
                                <p className="text-sm text-muted-foreground">{event.date} {event.start_time && `at ${event.start_time}`}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h3 className="font-semibold text-foreground mb-4">Account Created</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Your account has been successfully created. Now please confirm your RSVP for this event.
                            </p>
                        </div>

                        <form onSubmit={handleConfirmRsvp} className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-6">
                                <label className="flex items-start gap-3 cursor-pointer relative">
                                    <div className="mt-1 relative flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={data.confirm_rsvp}
                                            onChange={(e) => setData('confirm_rsvp', e.target.checked)}
                                            className="appearance-none h-6 w-6 border-2 border-primary dark:border-primary rounded bg-white dark:bg-[#2a2d30] cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary peer"
                                        />
                                        {data.confirm_rsvp && (
                                            <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-foreground">
                                        I confirm that I will attend this event and understand that this RSVP is a commitment to participate.
                                    </span>
                                </label>
                            </div>
                            
                            <Button
                                type="submit"
                                disabled={processing || !data.confirm_rsvp}
                                className="w-full"
                                size="lg"
                            >
                                {processing ? 'Confirming RSVP...' : 'Confirm RSVP'}
                            </Button>
                        </form>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground text-center">
                        {qrToken
                            ? "After confirming your RSVP, you'll confirm your attendance."
                            : "You'll be able to mark your attendance at the event."}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
