import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
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
    isAttendanceQr?: boolean;
    shareImage?: string;
    loginRequiresBirthdate?: boolean;
};

export default function RegisterFromQR({ event, qrToken, shareImage, loginRequiresBirthdate = false }: RegisterFromQRProps) {    const absoluteShareImage = shareImage ? `${window.location.origin}${shareImage}` : undefined;    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const [step, setStep] = useState<'contact-lookup' | 'register' | 'confirm-identity'>('contact-lookup');
    const [contactNumber, setContactNumber] = useState('');
    const [matchedAttendee, setMatchedAttendee] = useState<AttendeeMatch | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [identityError, setIdentityError] = useState('');
    const [hasDgLeader, setHasDgLeader] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        contact_number: '',
        birthdate: '',
        marital_status: '',
        has_dg_leader: '',
        dg_leader_name: '',
        want_to_join_dg: '',
        qr_token: qrToken,
        data_privacy: false,
    });
    const [contactValid, setContactValid] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    const [loginProcessing, setLoginProcessing] = useState(false);
    const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

    // Auto-validate contact number when it changes
    useEffect(() => {
        setContactValid(/^09\d{9}$/.test(data.contact_number));
    }, [data.contact_number]);

    const years = useMemo(
        () => Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index)),
        [currentYear],
    );

    const months = useMemo(
        () => [
            { value: '01', label: 'Jan' },
            { value: '02', label: 'Feb' },
            { value: '03', label: 'Mar' },
            { value: '04', label: 'Apr' },
            { value: '05', label: 'May' },
            { value: '06', label: 'Jun' },
            { value: '07', label: 'Jul' },
            { value: '08', label: 'Aug' },
            { value: '09', label: 'Sep' },
            { value: '10', label: 'Oct' },
            { value: '11', label: 'Nov' },
            { value: '12', label: 'Dec' },
        ],
        [],
    );

    const maxDays = useMemo(() => {
        if (!birthYear || !birthMonth) return 31;
        return new Date(Number(birthYear), Number(birthMonth), 0).getDate();
    }, [birthYear, birthMonth]);

    const days = useMemo(
        () => Array.from({ length: maxDays }, (_, index) => String(index + 1).padStart(2, '0')),
        [maxDays],
    );

    const birthdatePassword =
        birthYear && birthMonth && birthDay
            ? `${birthYear}-${birthMonth}-${birthDay}`
            : '';

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

        if (formatted.length === 10 && formatted > today) {
            formatted = today;
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
                setIdentityError('');
                setBirthYear('');
                setBirthMonth('');
                setBirthDay('');
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

    const handleIdentityLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (loginRequiresBirthdate && !birthdatePassword) {
            setIdentityError('Please select your birthdate.');
            return;
        }

        setIdentityError('');
        setLoginErrors({});
        setLoginProcessing(true);

        router.post('/login', {
            contact_number: contactNumber,
            password: loginRequiresBirthdate ? birthdatePassword : 'contact-only-login',
            redirect_url: `/qr/${qrToken}`,
        }, {
            preserveScroll: true,
            onError: (errors) => {
                setLoginErrors(errors as Record<string, string>);
                setLoginProcessing(false);
            },
            onFinish: () => {
                setLoginProcessing(false);
            },
        });
    };

    const handleBackToLookup = () => {
        setMatchedAttendee(null);
        setIdentityError('');
        setLookupError('');
        setBirthYear('');
        setBirthMonth('');
        setBirthDay('');
        setContactNumber('');
        setStep('contact-lookup');
    };

    const handleFormContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setData('contact_number', val);
        setContactValid(/^09\d{9}$/.test(val));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError('');
        
        // Validate all required fields before submission
        if (!data.first_name || !data.last_name || !data.contact_number || 
            !data.birthdate || !data.marital_status || !data.has_dg_leader || !data.data_privacy) {
            setSubmissionError('Please fill in all required fields');
            console.error('Missing required fields:', {
                first_name: data.first_name,
                last_name: data.last_name,
                contact_number: data.contact_number,
                birthdate: data.birthdate,
                marital_status: data.marital_status,
                has_dg_leader: data.has_dg_leader,
                data_privacy: data.data_privacy,
            });
            return;
        }
        
        // Validate conditional fields
        if (data.has_dg_leader === 'yes' && !data.dg_leader_name) {
            setSubmissionError('Please enter your DG leader name');
            console.error('DG leader name is required when in a DG group');
            return;
        }
        
        if (data.has_dg_leader === 'no' && !data.want_to_join_dg) {
            setSubmissionError('Please answer if you want to join a DG group');
            console.error('Want to join DG field is required');
            return;
        }
        
        post('/qr-register', {
            onSuccess: () => {
                // Registration successful, user will be redirected by the server
            },
            onError: (errors) => {
                setSubmissionError('Failed to create account. Please check your details and try again.');
                console.error('Registration error:', errors);
            },
        });
    };

    return (
        <>
            <Head title={`Register - ${event.name}`}>
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

            <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-white/70 p-6 shadow-2xl backdrop-blur-lg dark:bg-black/45">
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
                                        disabled={lookupLoading || !contactNumber || !/^09\d{9}$/.test(contactNumber)}
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
                                    Is this you?
                                </h2>
                                <div className="bg-blue-50 dark:bg-[#444a4e] rounded-lg p-6 mb-6 border border-blue-200 dark:border-[#555c63]">
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {matchedAttendee.first_name} {matchedAttendee.last_name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    {loginRequiresBirthdate
                                        ? 'Confirm your birthdate to continue with attendance.'
                                        : 'Confirm to continue with attendance.'}
                                </p>
                            </div>

                            <form onSubmit={handleIdentityLogin} className="space-y-4">
                                {loginRequiresBirthdate && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="birth_year">Birthdate</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <select
                                                id="birth_year"
                                                required
                                                value={birthYear}
                                                onChange={(e) => setBirthYear(e.target.value)}
                                                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                            >
                                                <option value="">Year</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                id="birth_month"
                                                required
                                                value={birthMonth}
                                                onChange={(e) => setBirthMonth(e.target.value)}
                                                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                            >
                                                <option value="">Month</option>
                                                {months.map((month) => (
                                                    <option key={month.value} value={month.value}>
                                                        {month.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                id="birth_day"
                                                required
                                                value={birthDay}
                                                onChange={(e) => setBirthDay(e.target.value)}
                                                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                            >
                                                <option value="">Day</option>
                                                {days.map((day) => (
                                                    <option key={day} value={day}>
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {(identityError || loginErrors.contact_number || loginErrors.password) && (
                                    <p className="text-red-500 text-sm">
                                        {identityError || loginErrors.contact_number || loginErrors.password}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loginProcessing || (loginRequiresBirthdate && !birthdatePassword)}
                                    className="w-full bg-green-600 hover:bg-green-700 font-white font-bold"
                                >
                                    {loginProcessing ? 'Verifying...' : 'Yes, this is me'}
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleBackToLookup}
                                    variant="outline"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                                >
                                    This is not me, re-enter number
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Registration Form */}
                    {step === 'register' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {submissionError && (
                                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                                    <p className="text-sm text-red-700 dark:text-red-300">{submissionError}</p>
                                </div>
                            )}
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
                                            placeholder="e.g. 09123456789"
                                            inputMode="numeric"
                                            maxLength={11}
                                            required
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">Format: 11 digits starting with 09 (e.g., 09123456789)</p>
                                        <InputError message={errors.contact_number} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="data_privacy"
                                            name="data_privacy"
                                            checked={data.data_privacy}
                                            onChange={e => setData('data_privacy', e.target.checked)}
                                            required
                                        />
                                        <Label htmlFor="data_privacy" className="text-xs">I agree to the data privacy policy</Label>
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
                                        <p className="text-[10px] text-muted-foreground italic">Format: YYYY-MM-DD (e.g., 1990-01-31)</p>
                                        <InputError message={errors.birthdate} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="marital_status">Marital Status</Label>
                                        <select
                                            id="marital_status"
                                            name="marital_status"
                                            value={data.marital_status}
                                            onChange={(e) => setData('marital_status', e.target.value)}
                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select an option</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                        <InputError message={errors.has_dg_leader} />
                                    </div>

                                    {hasDgLeader === 'no' && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="want_to_join_dg">Do you want to join a DG group?</Label>
                                            <select
                                                id="want_to_join_dg"
                                                name="want_to_join_dg"
                                                required
                                                value={data.want_to_join_dg}
                                                onChange={(e) => setData('want_to_join_dg', e.target.value)}
                                                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Select an option</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                            <InputError message={errors.want_to_join_dg} />
                                        </div>
                                    )}

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



                            <Button
                                type="submit"
                                disabled={
                                    processing || 
                                    !contactValid || 
                                    !data.data_privacy ||
                                    !data.first_name ||
                                    !data.last_name ||
                                    !data.birthdate ||
                                    !data.marital_status ||
                                    !data.has_dg_leader ||
                                    (data.has_dg_leader === 'yes' && !data.dg_leader_name) ||
                                    (data.has_dg_leader === 'no' && !data.want_to_join_dg)
                                }
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
