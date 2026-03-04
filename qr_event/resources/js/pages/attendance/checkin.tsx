import { Head, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

interface CheckInProps {
    event: {
        id: number;
        name: string;
        date: string;
        start_time: string | null;
        end_time: string | null;
        location: string;
        description: string | null;
        banner_image?: string | null;
    };
    token: string;
    isAlreadyRegistered: boolean;
    isAlreadyAttended: boolean;
    isFirstTime: boolean;
    hasAnsweredFirstTime?: boolean;
}

function formatTime12Hour(time: string | null): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export default function CheckIn({
    event,
    token,
    isAlreadyRegistered,
    isAlreadyAttended,
    isFirstTime: initialIsFirstTime,
    hasAnsweredFirstTime = false,
}: CheckInProps) {
    const [confirmed, setConfirmed] = useState(false);
    const confirmRef = useRef<HTMLInputElement | null>(null);
    const [isFirstTime, setIsFirstTime] = useState(initialIsFirstTime);
    const { data, setData, post, processing, errors } = useForm({
        token,
        event_id: event.id,
        confirm_attendance: false,
        data_privacy_consent: false,
        is_first_time: (hasAnsweredFirstTime ? initialIsFirstTime : null) as boolean | null,
    });

    const handleConfirm = () => {
        setData('confirm_attendance', !confirmed);
        setConfirmed(!confirmed);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isChecked = confirmRef.current ? confirmRef.current.checked : confirmed;
        if (isChecked) {
            setData('confirm_attendance', true);
            post('/attendance/confirm');
        }
    };

    const defaultBanner = '/images/default-event.png';
    const hasDescription = Boolean(event.description && event.description.trim());

    return (
        <>
            <Head title={`Check In - ${event.name}`} />
            <div 
                className="fixed inset-0 z-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
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
            <div className="flex flex-col gap-6">
                {/* Event Details */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-foreground">
                        {event.name}
                    </h1>

                    <div className="mt-4 grid gap-3 text-sm">
                        <div>
                            <p className="font-semibold text-muted-foreground">DATE</p>
                            <p className="text-foreground">
                                {new Date(event.date).toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground">TIME</p>
                            <p className="text-foreground">
                                {formatTime12Hour(event.start_time)} - {formatTime12Hour(event.end_time)}
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground">LOCATION</p>
                            <p className="text-foreground">{event.location}</p>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                {isAlreadyAttended && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/40">
                        <p className="text-xs font-semibold text-green-800 dark:text-green-200">
                            ✓ You have already checked in to this event
                        </p>
                    </div>
                )}

                {isAlreadyRegistered && !isAlreadyAttended && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/40">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                            You are already registered. Please confirm your attendance below.
                        </p>
                    </div>
                )}

                {/* Confirmation Section */}
                {!isAlreadyAttended && (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        {!hasAnsweredFirstTime && (
                            <div className="mb-4">
                                <p className="text-xs font-medium text-foreground mb-2">
                                    Is this your first time joining such an event?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('is_first_time', true)}
                                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-medium text-xs ${
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
                                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-medium text-xs ${
                                            data.is_first_time === false
                                                ? 'bg-primary border-primary text-primary-foreground'
                                                : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        )}

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                ref={confirmRef}
                                type="checkbox"
                                checked={confirmed}
                                onChange={handleConfirm}
                                className="h-4 w-4 rounded border-gray-300 mt-1"
                            />
                            <span className="text-xs text-foreground">
                                I confirm my attendance at this event and that this information is correct, including any people who may be with me.
                            </span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer relative">
                            <div className="mt-1 relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={data.data_privacy_consent}
                                    onChange={(e) => setData('data_privacy_consent', e.target.checked)}
                                    className="appearance-none h-4 w-4 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                />
                                {data.data_privacy_consent && (
                                    <svg className="absolute top-0 left-0 w-4 h-4 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-xs text-foreground">
                                I consent to data privacy collection for attendance processing of me and any individuals accompanying me.
                            </span>
                        </label>

                        {errors.data_privacy_consent && (
                            <p className="text-xs text-red-600">{errors.data_privacy_consent}</p>
                        )}

                        <button
                            type="submit"
                            disabled={!confirmed || !data.data_privacy_consent || processing || (data.is_first_time === null && !hasAnsweredFirstTime)}
                            className="w-full rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                        >
                            {processing
                                ? 'Confirming...'
                                : 'Confirm Attendance'}
                        </button>
                    </form>
                )}

                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
