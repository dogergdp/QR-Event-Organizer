import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Event {
    id: number;
    name: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    location: string;
    description: string;
}

interface AttendeeMatch {
    id: number;
    first_name: string;
    last_name: string;
    user_id: number;
    type?: 'already-registered' | 'existing-user';
}

type RegisterFromQRProps = {
    event: Event;
    qrToken: string;
};

export default function RegisterFromQR({ event, qrToken }: RegisterFromQRProps) {
    const [step, setStep] = useState<'contact-lookup' | 'register' | 'confirm-identity'>('contact-lookup');
    const [contactNumber, setContactNumber] = useState('');
    const [matchedAttendee, setMatchedAttendee] = useState<AttendeeMatch | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [hasDgLeader, setHasDgLeader] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        contact_number: '',
        birthdate: '',
        marital_status: '',
        has_dg_leader: '',
        dg_leader_name: '',
        password: '',
        password_confirmation: '',
        qr_token: qrToken,
    });

    const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Get only digits from the input
        const value = e.target.value.replace(/\D/g, '');
        
        // Format as YYYY-MM-DD
        let formatted = value;
        if (value.length >= 4) {
            formatted = value.slice(0, 4);
        }
        if (value.length > 4) {
            formatted = value.slice(0, 4) + '-' + value.slice(4, 6);
        }
        if (value.length > 6) {
            formatted = value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 8);
        }
        
        setData('birthdate', formatted);
    };

    const handleHasDgLeaderChange = (value: string) => {
        setHasDgLeader(value);
        setData('has_dg_leader', value);
    }

    const formatPhoneNumber = (value: string): string => {
        // Remove all non-digit characters
        const cleaned = value.replace(/\D/g, '');
        
        // Allow 10-11 digits for Philippine numbers (09XX-XXX-XXXX or 09XX-XXXX-XXXX)
        if (cleaned.length > 11) {
            return cleaned.slice(0, 11);
        }
        
        return cleaned;
    };

    const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setContactNumber(formatted);
    };

    const handleContactLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLookupLoading(true);
        setLookupError('');

        try {
            const response = await fetch(`/api/attendee-lookup?contact_number=${encodeURIComponent(contactNumber)}&event_id=${event.id}`);
            const result = await response.json();

            if (result.found) {
                // User exists - either already registered for this event or registered in system
                setMatchedAttendee({
                    ...result.attendee,
                    type: result.type,
                });
                setStep('confirm-identity');
            } else {
                // User doesn't exist - show registration form
                setContactNumber('');
                setData('contact_number', contactNumber);
                setStep('register');
            }
        } catch (err) {
            setLookupError('Error looking up contact. Please try again.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleConfirmIdentity = (isConfirmed: boolean) => {
        if (isConfirmed && matchedAttendee?.user_id) {
            // Redirect to login - works for both already-registered and existing-user
            window.location.href = `/login?redirect_url=${encodeURIComponent(`/events/${event.id}`)}`;
        } else {
            // User chose not to login, proceed to create new account
            setMatchedAttendee(null);
            setData('contact_number', contactNumber);
            setStep('register');
        }
    };

    const handleFormContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setData('contact_number', formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/qr-register', {
            onSuccess: () => {
                // Registration successful, user will be redirected by the server
            },
        });
    };

    return (
        <>
            <Head title={`Register - ${event.name}`} />

            <div className="min-h-screen bg-white dark:bg-[#313638] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.name}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.location}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                    </div>

                    {/* Step 1: Contact Number Lookup */}
                    {step === 'contact-lookup' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verify your contact number</h2>
                                <form onSubmit={handleContactLookup} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="lookup_contact">Contact Number</Label>
                                        <Input
                                            id="lookup_contact"
                                            type="tel"
                                            value={contactNumber}
                                            onChange={handleContactNumberChange}
                                            placeholder="e.g. 09152872043"
                                            inputMode="numeric"
                                            maxLength={11}
                                            required
                                        />
                                        {lookupError && <p className="text-red-500 text-sm">{lookupError}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={lookupLoading || !contactNumber || contactNumber.length < 10}
                                        className="w-full mt-6"
                                    >
                                        {lookupLoading ? 'Looking up...' : 'Continue'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirm Identity */}
                    {step === 'confirm-identity' && matchedAttendee && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {matchedAttendee.type === 'already-registered'
                                        ? 'You\'re Already Registered'
                                        : 'Is this you?'}
                                </h2>
                                <div className="bg-blue-50 dark:bg-[#444a4e] rounded-lg p-6 mb-6 border border-blue-200 dark:border-[#555c63]">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {matchedAttendee.first_name} {matchedAttendee.last_name}
                                    </p>
                                </div>
                                {matchedAttendee.type === 'already-registered' && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        You've already registered for this event. Please log in to continue.
                                    </p>
                                )}
                                {matchedAttendee.type === 'existing-user' && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        We found your account. Would you like to log in?
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleConfirmIdentity(true)}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {matchedAttendee.type === 'already-registered'
                                        ? 'Log in'
                                        : 'Yes, log me in'}
                                </Button>
                                {matchedAttendee.type !== 'already-registered' && (
                                    <Button
                                        onClick={() => handleConfirmIdentity(false)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        No, I'm new
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Registration Form */}
                    {step === 'register' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Details</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                placeholder="e.g. Juan"
                                                required
                                            />
                                            <InputError message={errors.first_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                placeholder="e.g. Dela Cruz"
                                                required
                                            />
                                            <InputError message={errors.last_name} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="contact_number">Contact Number</Label>
                                        <Input
                                            id="contact_number"
                                            name="contact_number"
                                            type="tel"
                                            value={data.contact_number}
                                            onChange={handleFormContactNumberChange}
                                            placeholder="e.g. 09152872043"
                                            inputMode="numeric"
                                            maxLength={11}
                                            required
                                        />
                                        <InputError message={errors.contact_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="birthdate">Birthdate</Label>
                                        <Input
                                            id="birthdate"
                                            name="birthdate"
                                            type="text"
                                            value={data.birthdate}
                                            onChange={handleBirthdateChange}
                                            inputMode="numeric"
                                            placeholder="YYYY-MM-DD"
                                            pattern="\d{4}-\d{2}-\d{2}"
                                            title="Use format YYYY-MM-DD"
                                            required
                                        />
                                        <InputError message={errors.birthdate} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="marital_status">Marital Status</Label>
                                        <select
                                            id="marital_status"
                                            name="marital_status"
                                            value={data.marital_status}
                                            onChange={(e) => setData('marital_status', e.target.value)}
                                            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select marital status</option>
                                            <option value="single">Single</option>
                                            <option value="married">Married</option>
                                            <option value="separated">Separated</option>
                                            <option value="widowed">Widowed</option>
                                        </select>
                                        <InputError message={errors.marital_status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="has_dg_leader">Are you in a DG Group?</Label>
                                        <select
                                            id="has_dg_leader"
                                            name="has_dg_leader"
                                            value={hasDgLeader}
                                            onChange={(e) => handleHasDgLeaderChange(e.target.value)}
                                            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select an option</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                        <InputError message={errors.has_dg_leader} />
                                    </div>

                                    {hasDgLeader === 'yes' && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="dg_leader_name">DG Leader Name</Label>
                                            <Input
                                                id="dg_leader_name"
                                                name="dg_leader_name"
                                                type="text"
                                                value={data.dg_leader_name}
                                                onChange={(e) => setData('dg_leader_name', e.target.value)}
                                                placeholder="Enter your DG Leader's name"
                                                required={hasDgLeader === 'yes'}
                                            />
                                            <InputError message={errors.dg_leader_name} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enter a Password</h2>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                            required
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm password"
                                            required
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2"
                            >
                                {processing ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
