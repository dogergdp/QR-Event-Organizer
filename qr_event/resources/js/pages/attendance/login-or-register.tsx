import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

interface Event {
    id: number;
    name: string;
    location: string;
    date: string;
}

type LoginOrRegisterProps = {
    event: Event;
    qrToken: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/events',
    },
];

export default function LoginOrRegister({ event, qrToken }: LoginOrRegisterProps) {
    const [mode, setMode] = useState<'lookup' | 'login' | 'register'>('lookup');
    const { data, setData, post, processing, errors } = useForm({
        contact_number: '',
        password: '',
    });

    const handleLookup = (e: React.FormEvent) => {
        e.preventDefault();
        // Lookup by contact number to verify pre-registration
        post(`/attendance/lookup?token=${qrToken}`);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onSuccess: () => {
                // Redirect to mark attendance
                window.location.href = `/qr/${qrToken}`;
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Attendance Check-in - ${event.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-2xl">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Event Check-in</h1>

                    <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-foreground mb-2">{event.name}</h2>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>

                    {mode === 'lookup' && (
                        <div className="space-y-4">
                            <div className="bg-background border-2 border-sidebar-border/100 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">How would you like to check in?</h3>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => setMode('lookup')}
                                        className="w-full p-4 border-2 border-sidebar-border/100 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        <p className="font-medium text-foreground">Look up by Contact Number</p>
                                        <p className="text-sm text-muted-foreground mt-1">If you pre-registered with your phone number</p>
                                    </button>

                                    <form onSubmit={handleLookup} className="space-y-3">
                                        <div>
                                            <label htmlFor="contact" className="block text-sm font-medium text-foreground mb-1">
                                                Contact Number
                                            </label>
                                            <input
                                                id="contact"
                                                type="tel"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                                placeholder="09123456789"
                                                className="w-full px-3 py-2 border-2 border-sidebar-border/100 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                            {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition font-medium"
                                        >
                                            {processing ? 'Looking up...' : 'Look up Attendance'}
                                        </button>
                                    </form>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-sidebar-border/100" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-background text-muted-foreground">Or</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setMode('login')}
                                        className="w-full p-4 border-2 border-sidebar-border/100 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        <p className="font-medium text-foreground">Log in to Your Account</p>
                                        <p className="text-sm text-muted-foreground mt-1">If you already have an account</p>
                                    </button>

                                    <button
                                        onClick={() => setMode('register')}
                                        className="w-full p-4 border-2 border-sidebar-border/100 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        <p className="font-medium text-foreground">Register First</p>
                                        <p className="text-sm text-muted-foreground mt-1">New to this event?</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="bg-background border-2 border-sidebar-border/100 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Log in</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                            Email or Contact Number
                                        </label>
                                        <input
                                            id="email"
                                            type="text"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-sidebar-border/100 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-sidebar-border/100 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition font-medium"
                                        >
                                            {processing ? 'Logging in...' : 'Log in'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMode('lookup')}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {mode === 'register' && (
                        <div className="bg-background border-2 border-sidebar-border/100 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Register</h3>
                            <p className="text-muted-foreground mb-4">
                                You will need to register for this event before checking in.
                            </p>
                            <Link
                                href={`/register?qr_token=${qrToken}`}
                                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                            >
                                Go to Registration
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
