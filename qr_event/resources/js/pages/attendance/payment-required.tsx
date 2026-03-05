import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

type PaymentRequiredProps = {
    event: {
        id: number;
        name: string;
        location: string;
        date: string;
    };
    attendee: {
        is_paid: boolean;
        amount_paid: string | number | null;
        is_walk_in: boolean;
    };
};

export default function PaymentRequired({ event, attendee }: PaymentRequiredProps) {
    return (
        <>
            <Head title={`Payment Required - ${event.name}`} />
            <div className="fixed inset-0 z-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url("/images/slideshow/slide1.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    minHeight: '100vh',
                    height: '100%'
                }}
            />
            <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-white/50 dark:bg-black/40 pointer-events-none z-10" />
            <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 p-4 md:p-8 z-20">
                <div className="flex w-full max-w-2xl flex-col gap-10">
                    <Card className="rounded-2xl relative shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40">
                        <CardContent className="px-8 py-10">
                            <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                    <div>
                                        <h1 className="text-lg font-semibold text-foreground">Payment Required</h1>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            You are registered for {event.name}, but your payment status is currently unpaid.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-foreground mb-6">
                                <p><span className="font-medium">Event:</span> {event.name}</p>
                                <p><span className="font-medium">Date:</span> {event.date}</p>
                                <p><span className="font-medium">Location:</span> {event.location}</p>
                                <p><span className="font-medium">Payment Status:</span> {attendee.is_paid ? 'Paid' : 'Unpaid'}</p>
                                <p><span className="font-medium">Amount Paid:</span> {attendee.amount_paid ?? '—'}</p>
                                {attendee.is_walk_in && (
                                    <p><span className="font-medium">Registration Type:</span> Walk-in</p>
                                )}
                            </div>

                            <p className="text-sm text-foreground mb-6">
                                Please proceed to the designated payment area. Once admin marks you as paid, you can scan the QR again to check in.
                            </p>

                            <div className="flex gap-3">
                                <Link
                                    href="/dashboard"
                                    className="flex-1 rounded-lg border border-sidebar-border/70 px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-sidebar/50"
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
