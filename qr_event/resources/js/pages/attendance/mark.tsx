import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle, Check, X } from 'lucide-react';
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

interface PlusOne {
    id: string;
    full_name: string;
    age: number;
    gender: string;
    is_first_time: boolean;
    remarks?: string;
    is_attended?: boolean;
}

type MarkAttendanceProps = {
    event: Event;
    qrCode: QrCode;
    primaryUserName: string;
    plusOnes: PlusOne[];
    isFirstTime: boolean;
    hasAnsweredFirstTime?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/dashboard',
    },
];

export default function MarkAttendance({ event, qrCode, primaryUserName, plusOnes, isFirstTime: initialIsFirstTime, hasAnsweredFirstTime = false }: MarkAttendanceProps) {
    const defaultAttendingIds = ['primary', ...plusOnes.map((member) => member.id)];

    const { data, setData, post, processing, errors } = useForm({
        confirm_attendance: false,
        data_privacy_consent: false,
        attending_member_ids: defaultAttendingIds,
        is_first_time: (hasAnsweredFirstTime ? initialIsFirstTime : null) as boolean | null,
    });

    const toggleAttendingMember = (memberId: string) => {
        const selected = data.attending_member_ids.includes(memberId);

        if (memberId === 'primary' && selected) {
            return;
        }

        setData(
            'attending_member_ids',
            selected
                ? data.attending_member_ids.filter((id) => id !== memberId)
                : [...data.attending_member_ids, memberId],
        );
    };

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
                            {!hasAnsweredFirstTime && (
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
                            )}

                            <p className="text-foreground mb-4">
                                Confirm your attendance at this event.
                            </p>

                            <div className="mb-6 rounded-lg border border-sidebar-border/70 p-4">
                                <p className="text-sm font-semibold text-foreground mb-3">Who is attending today?</p>

                                <div className={`flex items-center gap-3 py-3 px-3 rounded-lg border-2 transition ${
                                    data.attending_member_ids.includes('primary')
                                        ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                                        : 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={data.attending_member_ids.includes('primary')}
                                        onChange={() => toggleAttendingMember('primary')}
                                        className="h-4 w-4"
                                    />
                                    {data.attending_member_ids.includes('primary') ? (
                                        <Check className="w-5 h-5 flex-shrink-0" />
                                    ) : (
                                        <X className="w-5 h-5 flex-shrink-0" />
                                    )}
                                    <span className="text-sm font-medium">{primaryUserName} (Main RSVP)</span>
                                </div>

                                {plusOnes.map((member) => (
                                    <div key={member.id} className={`flex items-center gap-3 py-3 px-3 rounded-lg border-2 transition mt-2 ${
                                        data.attending_member_ids.includes(member.id)
                                            ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                                            : 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={data.attending_member_ids.includes(member.id)}
                                            onChange={() => toggleAttendingMember(member.id)}
                                            className="h-4 w-4"
                                        />
                                        {data.attending_member_ids.includes(member.id) ? (
                                            <Check className="w-5 h-5 flex-shrink-0" />
                                        ) : (
                                            <X className="w-5 h-5 flex-shrink-0" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {member.full_name}
                                            <span className="ml-1 text-xs opacity-75">({member.age}, {member.gender})</span>
                                        </span>
                                    </div>
                                ))}

                                {plusOnes.length === 0 && (
                                    <p className="text-xs text-muted-foreground">No plus ones declared for this RSVP.</p>
                                )}
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer mb-6 relative">
                                <div className="mt-1 relative flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={data.confirm_attendance}
                                        onChange={(e) => setData('confirm_attendance', e.target.checked)}
                                        className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                    />
                                    {data.confirm_attendance && (
                                        <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm text-foreground">
                                    I confirm my attendance for this event.
                                </span>
                            </label>

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
                                    I consent to data privacy collection for attendance processing of me and my selected members.
                                </span>
                            </label>

                            {errors.data_privacy_consent && (
                                <p className="-mt-4 mb-4 text-sm text-red-600">{errors.data_privacy_consent}</p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.confirm_attendance ||
                                    !data.data_privacy_consent ||
                                    !data.attending_member_ids.includes('primary') ||
                                    (data.is_first_time === null && !hasAnsweredFirstTime)
                                }
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
