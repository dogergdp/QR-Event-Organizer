import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

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
    const [hasPlusOnes, setHasPlusOnes] = useState(false);
    const [plusOnesData, setPlusOnesData] = useState<Array<{
        full_name: string;
        age: string;
        gender: string;
        is_first_time: boolean;
        remarks: string;
    }>>([]);

    const rsvpForm = useForm({
        confirm_rsvp: false,
        is_first_time: null as boolean | null,
        has_plus_ones: false,
        plus_ones: [] as Array<{ full_name: string; age: number; gender: string; is_first_time: boolean; remarks: string }>,
        data_privacy_consent: false,
        qr_token: qrToken ?? '',
    });

    const addPlusOne = () => {
        setPlusOnesData([...plusOnesData, {
            full_name: '',
            age: '',
            gender: '',
            is_first_time: false,
            remarks: '',
        }]);
    };

    const removePlusOne = (index: number) => {
        setPlusOnesData(plusOnesData.filter((_, i) => i !== index));
    };

    const updatePlusOne = (index: number, field: string, value: any) => {
        const updated = [...plusOnesData];
        updated[index] = { ...updated[index], [field]: value };
        setPlusOnesData(updated);
    };

    const handleConfirmRsvp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rsvpForm.data.confirm_rsvp || !rsvpForm.data.data_privacy_consent || rsvpForm.data.is_first_time === null) {
            return;
        }

        // Convert plus ones data to proper format
        const formattedPlusOnes = hasPlusOnes ? plusOnesData.filter(p => p.full_name.trim()).map(p => ({
            full_name: p.full_name,
            age: parseInt(p.age) || 0,
            gender: p.gender,
            is_first_time: p.is_first_time,
            remarks: p.remarks,
        })) : [];

        rsvpForm.setData({
            confirm_rsvp: rsvpForm.data.confirm_rsvp,
            is_first_time: rsvpForm.data.is_first_time,
            has_plus_ones: hasPlusOnes,
            plus_ones: formattedPlusOnes,
            data_privacy_consent: true,
            qr_token: rsvpForm.data.qr_token,
        });

        rsvpForm.post(`/events/${event.id}/confirm-rsvp`);
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
                        <form onSubmit={handleConfirmRsvp} className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-foreground mb-3">
                                        Is this your first time joining such an event?
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => rsvpForm.setData('is_first_time', true)}
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                rsvpForm.data.is_first_time === true
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => rsvpForm.setData('is_first_time', false)}
                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                rsvpForm.data.is_first_time === false
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-foreground mb-4">Account Created</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Your account has been successfully created. Now please confirm your RSVP for this event.
                                </p>

                                <div className="mb-6">
                                    <label className="flex items-start gap-3 cursor-pointer relative mb-4">
                                        <div className="mt-1 relative flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={hasPlusOnes}
                                                onChange={(e) => {
                                                    setHasPlusOnes(e.target.checked);
                                                    rsvpForm.setData('has_plus_ones', e.target.checked);
                                                    if (!e.target.checked) {
                                                        setPlusOnesData([]);
                                                    }
                                                }}
                                                className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                            />
                                            {hasPlusOnes && (
                                                <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-foreground">Do you have family members/plus ones attending?</span>
                                    </label>

                                    {hasPlusOnes && (
                                        <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                                            {plusOnesData.map((member, index) => (
                                                <div key={index} className="space-y-3 p-4 border border-border rounded-lg relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => removePlusOne(index)}
                                                        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`name-${index}`} className="text-xs font-medium">Full Name *</Label>
                                                            <Input
                                                                id={`name-${index}`}
                                                                value={member.full_name}
                                                                onChange={(e) => updatePlusOne(index, 'full_name', e.target.value)}
                                                                placeholder="e.g. Juan Dela Cruz"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor={`age-${index}`} className="text-xs font-medium">Age *</Label>
                                                            <Input
                                                                id={`age-${index}`}
                                                                type="number"
                                                                min="0"
                                                                max="120"
                                                                value={member.age}
                                                                onChange={(e) => updatePlusOne(index, 'age', e.target.value)}
                                                                placeholder="e.g. 25"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`gender-${index}`} className="text-xs font-medium">Gender *</Label>
                                                        <select
                                                            id={`gender-${index}`}
                                                            value={member.gender}
                                                            onChange={(e) => updatePlusOne(index, 'gender', e.target.value)}
                                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                                            required
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                                        </select>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor={`remarks-${index}`} className="text-xs font-medium">Remarks</Label>
                                                        <Input
                                                            id={`remarks-${index}`}
                                                            value={member.remarks}
                                                            onChange={(e) => updatePlusOne(index, 'remarks', e.target.value)}
                                                            placeholder="Any special needs or remarks"
                                                        />
                                                    </div>

                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.is_first_time}
                                                            onChange={(e) => updatePlusOne(index, 'is_first_time', e.target.checked)}
                                                            className="h-4 w-4"
                                                        />
                                                        <span className="text-xs text-foreground">First time attending such an event</span>
                                                    </label>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                onClick={addPlusOne}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Add Another Plus One
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <label className="flex items-start gap-3 cursor-pointer relative mb-6">
                                    <div className="mt-1 relative flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={rsvpForm.data.data_privacy_consent}
                                            onChange={(e) => rsvpForm.setData('data_privacy_consent', e.target.checked)}
                                            className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                        />
                                        {rsvpForm.data.data_privacy_consent && (
                                            <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-foreground">
                                        I consent to data privacy collection for attendance processing.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer relative">
                                    <div className="mt-1 relative flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={rsvpForm.data.confirm_rsvp}
                                            onChange={(e) => rsvpForm.setData('confirm_rsvp', e.target.checked)}
                                            className="appearance-none h-6 w-6 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                        />
                                        {rsvpForm.data.confirm_rsvp && (
                                            <svg className="absolute top-0 left-0 w-6 h-6 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
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
                                disabled={rsvpForm.processing || !rsvpForm.data.confirm_rsvp || rsvpForm.data.is_first_time === null || !rsvpForm.data.data_privacy_consent}
                                className="w-full"
                                size="lg"
                            >
                                {rsvpForm.processing ? 'Confirming RSVP...' : 'Confirm RSVP'}
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
