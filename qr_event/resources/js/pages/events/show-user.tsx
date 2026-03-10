import { Head, Link, usePage, router } from '@inertiajs/react';
import QRScanner from '@/components/QRScanner';
import { useState } from 'react';
import {formatTime12Hour, formatDateTime12Hour} from '@/utils/dateUtils';

import type { EventShowProps } from './types';

export default function ShowEventUser() {
    const { event, userAttendance, auth } = usePage<any>().props as EventShowProps & {
        auth?: {
            user?: {
                first_name?: string;
                last_name?: string;
                name?: string;
                age?: number | null;
            };
        };
    };

    const userFirstName =
        auth?.user?.first_name ||
        auth?.user?.name?.trim().split(' ')[0] ||
        'You';

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScan = (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);
        setIsScannerOpen(false);

        let url = decodedText;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                url = urlObj.pathname + urlObj.search;
            } catch (e) {
                console.error('Invalid URL:', url, e);
                return;
            }
        }

        if (!url.startsWith('/')) {
            url = `/${url}`;
        }

        const currentPath = window.location.pathname + window.location.search;
        const absoluteUrl = `${window.location.origin}${url}`;

        console.log('Navigating to:', url);

        try {
            router.visit(url, {
                preserveState: false,
                preserveScroll: false,
            });
        } catch (error) {
            console.error('Navigation error:', error);
            console.log('Falling back to window.location.href');
            window.location.href = absoluteUrl;
        }

        window.setTimeout(() => {
            const nextPath = window.location.pathname + window.location.search;
            if (nextPath === currentPath) {
                console.log(
                    'Inertia navigation did not change location, forcing full redirect',
                );
                window.location.href = absoluteUrl;
            }
        }, 600);
    };

    const defaultBanner = '/images/default-event.jpg';
    const hasDescription = Boolean(
        event.description && event.description.trim(),
    );

    const normalizedFamilyColor =
        typeof userAttendance?.family_color === 'string'
            ? userAttendance.family_color.toLowerCase()
            : null;

    const familyColorName =
        normalizedFamilyColor === 'blue' ||
        normalizedFamilyColor === 'green' ||
        normalizedFamilyColor === 'red' ||
        normalizedFamilyColor === 'yellow'
            ? normalizedFamilyColor.charAt(0).toUpperCase() + normalizedFamilyColor.slice(1)
            : 'None';

    const familyColorHex =
        normalizedFamilyColor === 'blue'
            ? '#2563eb'
            : normalizedFamilyColor === 'green'
              ? '#16a34a'
              : normalizedFamilyColor === 'red'
                ? '#dc2626'
                : normalizedFamilyColor === 'yellow'
                  ? '#eab308'
                  : '#9ca3af';

    const calculateCostByAge = (age: number | undefined | null) => {
        if (age === undefined || age === null) return 'N/A';
        if (age >= 12) return '200 pesos';
        if (age >= 5) return '100 pesos';
        return 'Free';
    };

    const calculateCostAmount = (age: number | undefined | null) => {
        if (age === undefined || age === null) return 0;
        if (age >= 12) return 200;
        if (age >= 5) return 100;
        return 0;
    };

    const calculateTotalDueAmount = () => {
        let total = 0;
        // Add user's cost
        total += calculateCostAmount(auth?.user?.age);
        // Add plus-ones' costs
        userAttendance?.attending_plus_ones?.forEach((plusOne) => {
            total += calculateCostAmount(plusOne.age);
        });
        return total;
    };

    return (
        <>
            <Head title={event.name} />

            <div
                className="fixed inset-0 z-0 w-full h-full min-h-screen overflow-hidden pointer-events-none"
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

            <div className="relative flex min-h-screen flex-col gap-6 overflow-x-auto p-4 md:p-8 z-20 max-w-4xl mx-auto">
                {/* Event Banner */}
                <div className="rounded-2xl border border-white/30 shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40 overflow-hidden">
                    <div className="aspect-video overflow-hidden rounded-xl">
                        <img
                            src={
                                event.banner_image
                                    ? `/storage/${event.banner_image}`
                                    : defaultBanner
                            }
                            alt={event.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>

                {/* Event Details Section */}
                <div className="rounded-2xl border border-white/30 shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40 p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-foreground">
                                {event.name}
                            </h1>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        DATE
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {new Date(
                                            event.date,
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        START TIME
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {event.start_time
                                            ? formatTime12Hour(event.start_time)
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        END TIME
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {event.end_time
                                            ? formatTime12Hour(event.end_time)
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        LOCATION
                                    </p>
                                    <p className="mt-1 text-sm text-foreground">
                                        {event.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {hasDescription && (
                    <div className="rounded-2xl border border-white/30 shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40 p-6">
                        <h2 className="text-xl font-semibold text-foreground">
                            About This Event
                        </h2>
                        <p className="mt-4 text-foreground">
                            {event.description}
                        </p>
                    </div>
                )}

                {/* RSVP Section (for non-registered users) */}
                {!event.is_finished && !userAttendance && (
                    <div className="rounded-2xl border border-white/30 shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-foreground">
                                    Register for This Event
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    RSVP now to confirm your attendance
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="rounded-lg border-2 border-black bg-transparent px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-black/5 dark:border-white dark:text-white dark:hover:bg-white/10"
                                >
                                    Scan QR to RSVP
                                </button>

                                <Link
                                    href={`/events/${event.id}/rsvp`}
                                    className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                    RSVP Now
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Section */}
                {!event.is_finished && userAttendance && (
                    <div className="rounded-2xl border border-white/30 shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40 p-8">
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="w-full max-w-2xl">
                                <h2 className="text-2xl font-bold text-foreground">
                                    Your Attendance
                                </h2>

                                {userAttendance.is_attended ? (
                                    <p className="mt-4 text-base font-bold text-foreground">
                                        ✓ You have attended this event
                                        {userAttendance.attended_time && (
                                            <>
                                                {' '}
                                                (
                                                {formatDateTime12Hour(
                                                    userAttendance.attended_time,
                                                )}
                                                )
                                            </>
                                        )}
                                    </p>
                                ) : (
                                    <p className="mt-4 text-base text-muted-foreground">
                                        You are registered for this event. Scan
                                        the attendance QR code at the venue to
                                        mark your attendance.
                                    </p>
                                )}

                                {userAttendance.is_attended && (
                                    <div className="mt-6 text-base text-foreground space-y-3">
                                        <p>
                                            Family Name: <span className="font-semibold">{userAttendance.family_name || 'N/A'}</span>
                                        </p>
                                        <p>
                                            Family Color:{' '}
                                            <span className="inline-flex items-center gap-2 font-semibold">
                                                <span
                                                    className="inline-block h-4 w-4 rounded-full border border-sidebar-border/70"
                                                    style={{ backgroundColor: familyColorHex }}
                                                />
                                                {familyColorName}
                                            </span>
                                        </p>

                                        <div className="mt-4">
                                            <p className="font-bold text-lg">
                                                Attending (Headcount:{' '}
                                                {1 + (userAttendance.attending_plus_ones?.length ?? 0)})
                                            </p>
                                            <ul className="mt-2 list-inside list-disc text-base text-foreground space-y-1">
                                                <li>
                                                    {userFirstName}
                                                    {auth?.user?.age && (
                                                        <>
                                                            {' '}({auth.user.age} years old) -{' '}
                                                            <span className="font-medium">{calculateCostByAge(auth.user.age)}</span>
                                                        </>
                                                    )}
                                                </li>
                                                {userAttendance.attending_plus_ones?.map((plusOne) => (
                                                    <li key={plusOne.id || plusOne.full_name}>
                                                        {plusOne.full_name || 'Unnamed'}
                                                        {plusOne.age && (
                                                            <>
                                                                {' '}({plusOne.age} years old) -{' '}
                                                                <span className="font-medium">{calculateCostByAge(plusOne.age)}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            {(!userAttendance.attending_plus_ones || userAttendance.attending_plus_ones.length === 0) && (
                                                <p className="text-base text-muted-foreground">No additional attendees.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {typeof userAttendance.is_paid !== 'undefined' && (
                                    <div className="mt-4 space-y-2">
                                        <p className={`text-base font-bold ${userAttendance.is_paid ? 'text-foreground' : 'text-amber-600'}`}>
                                            Payment: {userAttendance.is_paid ? 'Paid' : 'Unpaid'}
                                        </p>
                                        <p className="text-base font-semibold text-foreground">
                                            Due Amount: <span className="font-bold">{calculateTotalDueAmount()} pesos</span>
                                        </p>
                                        {userAttendance.amount_paid ? (
                                            <p className="text-sm text-muted-foreground">Amount Paid: {userAttendance.amount_paid}</p>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            {!userAttendance.is_attended && (
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="rounded-lg bg-black px-8 py-3 text-base font-medium text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                    Scan QR to Mark Attendance
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div>
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* QR Scanner Modal */}
                <QRScanner
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScan={handleScan}
                />
            </div>
        </>
    );
}
