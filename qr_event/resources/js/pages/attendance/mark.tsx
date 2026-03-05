import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Check, X } from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

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
    isPaid?: boolean;
    amountPaid?: string | number | null;
};

export default function MarkAttendance({ event, qrCode, primaryUserName, plusOnes, isFirstTime: initialIsFirstTime, hasAnsweredFirstTime = false, isPaid = false, amountPaid = null }: MarkAttendanceProps) {
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
        <>
            <Head title={`Mark Attendance - ${event.name}`} />
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
                    <h1 className="text-xl font-bold text-foreground mb-3">Confirm Attendance</h1>

                    <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <div className="text-sm">
                                <h2 className="font-semibold text-foreground mb-1">{event.name}</h2>
                                <p className="text-xs text-muted-foreground">{event.location}</p>
                                <p className="text-xs text-muted-foreground">{event.date}</p>
                                <p className="text-xs text-muted-foreground mt-1">Check-in: {qrCode.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 rounded-lg border border-sidebar-border/70 p-3 text-xs text-foreground">
                        <p><span className="font-semibold">Payment Status:</span> {isPaid ? 'Paid' : 'Unpaid'}</p>
                        <p><span className="font-semibold">Amount Paid:</span> {amountPaid ?? '—'}</p>
                    </div>

                    <form onSubmit={handleMarkAttendance} className="space-y-3">
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

                        <div className="mb-3 rounded-lg border border-sidebar-border/70 p-3">
                            <p className="text-xs font-semibold text-foreground mb-2">Who is attending today?</p>
                            <p className="text-xs text-muted-foreground mb-3">
                                Check each person actually with you. Uncheck anyone not present.
                            </p>

                            <div className={`flex items-center gap-3 py-2 px-3 rounded-lg border-2 transition ${
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
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                    <X className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span className="text-xs font-medium">{primaryUserName}</span>
                            </div>

                            {plusOnes.map((member) => (
                                <div key={member.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg border-2 transition mt-2 ${
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
                                        <Check className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <X className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    <span className="text-xs font-medium">
                                        {member.full_name} ({member.age}, {member.gender})
                                    </span>
                                </div>
                            ))}

                            {plusOnes.length === 0 && (
                                <p className="text-xs text-muted-foreground">No plus ones registered.</p>
                            )}
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer relative">
                            <div className="mt-1 relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={data.confirm_attendance}
                                    onChange={(e) => setData('confirm_attendance', e.target.checked)}
                                    className="appearance-none h-4 w-4 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                />
                                {data.confirm_attendance && (
                                    <svg className="absolute top-0 left-0 w-4 h-4 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-xs text-foreground">
                                I confirm my attendance and that all selected attendees are present with me.
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
                                I consent to data privacy collection for attendance processing of me and my selected members.
                            </span>
                        </label>

                        {errors.data_privacy_consent && (
                            <p className="text-xs text-red-600">{errors.data_privacy_consent}</p>
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
                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm"
                        >
                            {processing ? 'Marking...' : 'Confirm Attendance'}
                        </button>
                    </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
