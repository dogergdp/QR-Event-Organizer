import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    location: string;
    date: string;
}

type NotRegisteredProps = {
    event: Event;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function NotRegistered({ event }: NotRegisteredProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Not Registered - ${event.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Not Registered</h1>

                    <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">{event.name}</h2>
                                <p className="text-sm text-muted-foreground">{event.location}</p>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background border-2 border-sidebar-border/100 rounded-lg p-6 mb-6">
                        <p className="text-foreground mb-4">
                            You are logged in, but you have not registered for this event yet.
                        </p>
                        <p className="text-muted-foreground text-sm mb-6">
                            To mark your attendance, you must first register for the event through the RSVP link or registration page.
                        </p>

                        <Link
                            href="/dashboard"
                            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
