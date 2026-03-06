import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

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
    shareImage?: string;
};

export default function PreRegisterConfirm({ event, qrToken, shareImage }: PreRegisterConfirmProps) {
    const absoluteShareImage = shareImage ? `${window.location.origin}${shareImage}` : undefined;
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

    const confirmRef = useRef<HTMLInputElement | null>(null);
    const consentRef = useRef<HTMLInputElement | null>(null);

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
        const confirmChecked = confirmRef.current ? confirmRef.current.checked : rsvpForm.data.confirm_rsvp;
        const consentChecked = consentRef.current ? consentRef.current.checked : rsvpForm.data.data_privacy_consent;

        if (!confirmChecked || !consentChecked || rsvpForm.data.is_first_time === null) {
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

        rsvpForm.transform((currentData) => ({
            ...currentData,
            confirm_rsvp: confirmChecked,
            has_plus_ones: hasPlusOnes,
            plus_ones: formattedPlusOnes,
            data_privacy_consent: consentChecked,
        }));

        rsvpForm.post(`/events/${event.id}/confirm-rsvp`);
    };

    return (
        <>
            <Head title={`RSVP Confirmation - ${event.name}`}>
                <meta property="og:title" content={`RSVP for ${event.name}`} />
                <meta property="og:description" content={`Confirm your attendance for ${event.name} on ${event.date}. Location: ${event.location}`} />
                {absoluteShareImage && <meta property="og:image" content={absoluteShareImage} />}
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:type" content="website" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content={`RSVP for ${event.name}`} />
                <meta property="twitter:description" content={`Confirm your attendance for ${event.name} on ${event.date}. Location: ${event.location}`} />
                {absoluteShareImage && <meta property="twitter:image" content={absoluteShareImage} />}
            </Head>
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
                            <h1 className="text-3xl font-bold text-foreground mb-3">RSVP Confirmation</h1>

                            <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div className="text-base">
                                        <h2 className="text-lg font-semibold text-foreground mb-1">{event.name}</h2>
                                        <p className="text-sm text-muted-foreground mb-1">{event.location}</p>
                                        <p className="text-sm text-muted-foreground">{event.date} {event.start_time && `at ${event.start_time}`}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <form onSubmit={handleConfirmRsvp} className="space-y-3">
                            <div className="rounded-lg border border-border bg-card/40 p-4">
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-foreground mb-2">
                                        Is this your first time joining such an event?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => rsvpForm.setData('is_first_time', true)}
                                            className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-medium text-sm ${
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
                                            className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                rsvpForm.data.is_first_time === false
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-foreground mb-2 text-lg">Account Created</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Your account has been successfully created. Now please confirm your RSVP for this event.
                                </p>

                                <div className="mb-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground mb-2">
                                            Do you have family members/plus ones attending?
                                        </p>
                                        <div className="flex gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHasPlusOnes(true);
                                                    rsvpForm.setData('has_plus_ones', true);
                                                }}
                                                className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                    hasPlusOnes === true
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHasPlusOnes(false);
                                                    rsvpForm.setData('has_plus_ones', false);
                                                    setPlusOnesData([]);
                                                }}
                                                className={`flex-1 px-3 py-2 rounded-lg border-2 transition font-medium text-sm ${
                                                    hasPlusOnes === false
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-sidebar-border/70 hover:bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    {hasPlusOnes && (
                                        <div className="space-y-3 bg-muted/20 p-3 rounded-lg">
                                            {plusOnesData.map((member, index) => (
                                                <div key={index} className="space-y-2 p-3 border border-border rounded-lg relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => removePlusOne(index)}
                                                        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="grid gap-1">
                                                            <Label htmlFor={`name-${index}`} className="text-sm font-medium">Full Name *</Label>
                                                            <Input
                                                                id={`name-${index}`}
                                                                value={member.full_name}
                                                                onChange={(e) => updatePlusOne(index, 'full_name', e.target.value)}
                                                                placeholder="e.g. Juan Dela Cruz"
                                                                className="text-sm h-9"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="grid gap-1">
                                                            <Label htmlFor={`age-${index}`} className="text-sm font-medium">Age *</Label>
                                                            <Input
                                                                id={`age-${index}`}
                                                                type="number"
                                                                min="0"
                                                                max="120"
                                                                value={member.age}
                                                                onChange={(e) => updatePlusOne(index, 'age', e.target.value)}
                                                                placeholder="e.g. 25"
                                                                className="text-sm h-9"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-1">
                                        <Label htmlFor={`gender-${index}`} className="text-sm font-medium">Gender *</Label>
                                                        <select
                                                            id={`gender-${index}`}
                                                            value={member.gender}
                                                            onChange={(e) => updatePlusOne(index, 'gender', e.target.value)}
                                                            className="flex h-9 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
                                                            required
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                                        </select>
                                                    </div>

                                                    <div className="grid gap-1">
                                        <Label htmlFor={`remarks-${index}`} className="text-sm font-medium">Remarks</Label>
                                                        <Input
                                                            id={`remarks-${index}`}
                                                            value={member.remarks}
                                                            onChange={(e) => updatePlusOne(index, 'remarks', e.target.value)}
                                                            placeholder="Any special needs"
                                                            className="text-sm h-9"
                                                        />
                                                    </div>

                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.is_first_time}
                                                            onChange={(e) => updatePlusOne(index, 'is_first_time', e.target.checked)}
                                                            className="h-4 w-4"
                                                        />
                                                        <span className="text-sm text-foreground">First time attending</span>
                                                    </label>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                onClick={addPlusOne}
                                                variant="outline"
                                                className="w-full text-sm h-9"
                                            >
                                                Add Another Plus One
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <label className="flex items-start gap-2 cursor-pointer relative mb-3">
                                    <div className="mt-1 relative flex-shrink-0">
                                        <input
                                            ref={consentRef}
                                            type="checkbox"
                                            checked={rsvpForm.data.data_privacy_consent}
                                            onChange={(e) => rsvpForm.setData('data_privacy_consent', e.target.checked)}
                                            className="appearance-none h-4 w-4 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                        />
                                        {rsvpForm.data.data_privacy_consent && (
                                            <svg className="absolute top-0 left-0 w-4 h-4 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-foreground">
                                        I consent to data privacy collection for attendance processing.
                                    </span>
                                </label>

                                <label className="flex items-start gap-2 cursor-pointer relative">
                                    <div className="mt-1 relative flex-shrink-0">
                                        <input
                                            ref={confirmRef}
                                            type="checkbox"
                                            checked={rsvpForm.data.confirm_rsvp}
                                            onChange={(e) => rsvpForm.setData('confirm_rsvp', e.target.checked)}
                                            className="appearance-none h-4 w-4 border-2 border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 cursor-pointer checked:bg-primary dark:checked:bg-primary checked:border-primary dark:checked:border-primary peer"
                                        />
                                        {rsvpForm.data.confirm_rsvp && (
                                            <svg className="absolute top-0 left-0 w-4 h-4 text-white dark:text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm text-foreground">
                                        I confirm that I will attend this event and understand that this RSVP is a commitment.
                                    </span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={rsvpForm.processing || !rsvpForm.data.confirm_rsvp || rsvpForm.data.is_first_time === null || !rsvpForm.data.data_privacy_consent || (hasPlusOnes === true && plusOnesData.length === 0)}
                                className="w-full mt-4 text-base py-2"
                                size="lg"
                            >
                                {rsvpForm.processing ? 'Confirming RSVP...' : 'Confirm RSVP'}
                            </Button>
                        </form>
                    </div>

                    <p className="mt-4 text-sm text-muted-foreground text-center">
                        {qrToken
                            ? "After confirming your RSVP, you'll confirm your attendance."
                            : "You'll be able to mark your attendance at the event."}
                    </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
