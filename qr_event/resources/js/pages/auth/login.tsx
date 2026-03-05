import { Form, Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    loginRequiresBirthdate: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
    loginRequiresBirthdate,
}: Props) {
    const currentYear = new Date().getFullYear();
    const contactInputRef = useRef<HTMLInputElement>(null);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const redirectUrl = params.get('redirect_url');
    const preFilledContactNumber = params.get('contact_number');
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');

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

    const birthdateValue =
        birthYear && birthMonth && birthDay
            ? `${birthYear}-${birthMonth}-${birthDay}`
            : '';

    useEffect(() => {
        // Pre-fill contact number if provided in URL
        if (preFilledContactNumber && contactInputRef.current) {
            contactInputRef.current.value = preFilledContactNumber;
        }
    }, [preFilledContactNumber]);

    return (
        <AuthCardLayout
            title="Log in to your account"
            description={
                loginRequiresBirthdate
                    ? 'Enter your contact number and birthdate below to log in'
                    : 'Enter your contact number below to log in'
            }
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {redirectUrl && (
                            <input
                                type="hidden"
                                name="redirect_url"
                                value={redirectUrl}
                            />
                        )}
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    ref={contactInputRef}
                                    id="contact_number"
                                    type="tel"
                                    name="contact_number"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="tel"
                                    placeholder="e.g. 09123456789"
                                />
                                <InputError message={errors.contact_number} />
                            </div>

                            {loginRequiresBirthdate && (
                                <div className="grid gap-2">
                                    <Label htmlFor="birth_year">Birthdate</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <select
                                            id="birth_year"
                                            required
                                            value={birthYear}
                                            onChange={(e) => setBirthYear(e.target.value)}
                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            tabIndex={2}
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
                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            tabIndex={3}
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
                                            className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            tabIndex={4}
                                        >
                                            <option value="">Day</option>
                                            {days.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                            )}

                            <input
                                type="hidden"
                                name="password"
                                value={loginRequiresBirthdate ? birthdateValue : 'contact-only-login'}
                            />

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={loginRequiresBirthdate ? 5 : 2}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={loginRequiresBirthdate ? 6 : 3}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={loginRequiresBirthdate ? 7 : 4}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthCardLayout>
    );
}
