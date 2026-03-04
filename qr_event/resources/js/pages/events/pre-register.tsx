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
    shareImage?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function PreRegister({ event, fromQr, alreadyRsvpd = false, shareImage }: PreRegisterProps) {
    const absoluteShareImage = shareImage ? `${window.location.origin}${shareImage}` : undefined;
    const { data, setData, post, processing, errors } = useForm({
        confirm_rsvp: false,
        is_first_time: null as boolean | null,
        has_plus_ones: false,
        plus_ones: [] as Array<{
            full_name: string;
            age: string;
            gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
            is_first_time: boolean | null;
            remarks: string;
        }>,
        data_privacy_consent: false,
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

    const hasInvalidPlusOne = data.plus_ones.some(
        (member) =>
            !member.full_name.trim() ||
            member.age === '' ||
            member.gender === '' ||
            member.is_first_time === null,
    );

    const addPlusOne = () => {
        setData('plus_ones', [
            ...data.plus_ones,
            {
                full_name: '',
                age: '',
                gender: '',
                is_first_time: null,
                remarks: '',
            },
        ]);
    };

    const removePlusOne = (index: number) => {
        setData(
            'plus_ones',
            data.plus_ones.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const updatePlusOne = <K extends keyof (typeof data.plus_ones)[number]>(
        index: number,
        key: K,
        value: (typeof data.plus_ones)[number][K],
    ) => {
        setData(
            'plus_ones',
            data.plus_ones.map((member, itemIndex) =>
                itemIndex === index ? { ...member, [key]: value } : member,
            ),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`RSVP - ${event.name}`}>
                <meta property="og:title" content={`RSVP for ${event.name}`} />
                <meta property="og:description" content={`Join us for ${event.name} on ${event.date}. Location: ${event.location}`} />
                {absoluteShareImage && <meta property="og:image" content={absoluteShareImage} />}
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:type" content="website" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content={`RSVP for ${event.name}`} />
                <meta property="twitter:description" content={`Join us for ${event.name} on ${event.date}. Location: ${event.location}`} />
                {absoluteShareImage && <meta property="twitter:image" content={absoluteShareImage} />}
            </Head>

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
                                    {Object.keys(errors).length > 0 && (
                                        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                            <p className="font-medium">Please fix the following before confirming RSVP:</p>
                                            <ul className="mt-1 list-disc pl-5">
                                                {Object.values(errors).map((message, index) => (
                                                    <li key={index}>{message}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

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

                                    <div className="mb-6 rounded-lg border border-sidebar-border/70 p-4">
                                        <p className="text-sm font-medium text-foreground mb-3">
                                            Do you have more members (plus ones / family) joining?
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setData('has_plus_ones', true)}
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                    data.has_plus_ones
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('has_plus_ones', false);
                                                    setData('plus_ones', []);
                                                }}
                                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                    !data.has_plus_ones
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    {data.has_plus_ones && (
                                        <div className="mb-6 space-y-4 rounded-lg border border-sidebar-border/70 p-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-foreground">Plus Ones / Family Members</p>
                                                <button
                                                    type="button"
                                                    onClick={addPlusOne}
                                                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                                                >
                                                    Add member
                                                </button>
                                            </div>

                                            {data.plus_ones.length === 0 && (
                                                <p className="text-sm text-muted-foreground">Add at least one member.</p>
                                            )}

                                            {data.plus_ones.map((member, index) => (
                                                <div key={index} className="space-y-3 rounded-md border border-sidebar-border/70 p-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-foreground">Member {index + 1}</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removePlusOne(index)}
                                                            className="text-xs text-red-600 hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                                                        <input
                                                            type="text"
                                                            value={member.full_name}
                                                            onChange={(e) => updatePlusOne(index, 'full_name', e.target.value)}
                                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="grid gap-2">
                                                            <label className="text-xs font-medium text-muted-foreground">Age</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={120}
                                                                value={member.age}
                                                                onChange={(e) => updatePlusOne(index, 'age', e.target.value)}
                                                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <label className="text-xs font-medium text-muted-foreground">Gender</label>
                                                            <select
                                                                value={member.gender}
                                                                onChange={(e) => updatePlusOne(index, 'gender', e.target.value as (typeof member.gender))}
                                                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                                <option value="other">Other</option>
                                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <label className="text-xs font-medium text-muted-foreground">First time?</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => updatePlusOne(index, 'is_first_time', true)}
                                                                className={`flex-1 rounded-md border px-3 py-2 text-xs ${member.is_first_time === true ? 'bg-primary text-primary-foreground border-primary' : 'border-sidebar-border/70'}`}
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updatePlusOne(index, 'is_first_time', false)}
                                                                className={`flex-1 rounded-md border px-3 py-2 text-xs ${member.is_first_time === false ? 'bg-primary text-primary-foreground border-primary' : 'border-sidebar-border/70'}`}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <label className="text-xs font-medium text-muted-foreground">Remarks</label>
                                                        <input
                                                            type="text"
                                                            value={member.remarks}
                                                            onChange={(e) => updatePlusOne(index, 'remarks', e.target.value)}
                                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="flex items-start gap-3 cursor-pointer mb-6 relative">
                                        <div className="mt-1 relative flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={data.data_privacy_consent}
                                                onChange={(e) => setData('data_privacy_consent', e.target.checked)}
                                                className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                            />
                                            {data.data_privacy_consent && (
                                                <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground">
                                            I consent to data privacy collection for myself and my declared plus ones / family members for event registration and attendance processing.
                                        </span>
                                    </label>

                                    {errors.data_privacy_consent && (
                                        <p className="-mt-4 mb-4 text-sm text-red-600">{errors.data_privacy_consent}</p>
                                    )}

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

                                    {errors.plus_ones && (
                                        <p className="-mt-4 mb-4 text-sm text-red-600">{errors.plus_ones}</p>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                !data.confirm_rsvp ||
                                                !data.data_privacy_consent ||
                                                data.is_first_time === null ||
                                                (data.has_plus_ones && (data.plus_ones.length === 0 || hasInvalidPlusOne))
                                            }
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
