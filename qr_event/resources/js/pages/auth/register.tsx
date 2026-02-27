import { Form, Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { useState } from 'react';

export default function Register() {
    const today = new Date().toISOString().split('T')[0];
    const { data, setData } = useForm({
        has_dg_leader: '',
        want_to_join_dg: '',
        dg_leader_name: '',
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

        if (formatted.length === 10 && formatted > today) {
            formatted = today;
        }

        e.target.value = formatted;
    };
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account for Movement"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div>Enter Your Details</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="e.g. Juan"
                                    />
                                    <InputError
                                        message={errors.first_name}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="e.g. Dela Cruz"
                                    />
                                    <InputError
                                        message={errors.last_name}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                                                       <div className="grid gap-2">
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    type="tel"
                                    required
                                    tabIndex={5}
                                    autoComplete="tel"
                                    name="contact_number"
                                    placeholder="e.g. 09152872043"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Format: 11 digits starting with 09 (e.g., 09123456789)</p>
                                <InputError message={errors.contact_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birthdate">Birthdate</Label>
                                <Input
                                    id="birthdate"
                                    type="text"
                                    required
                                    tabIndex={6}
                                    name="birthdate"
                                    inputMode="numeric"
                                    autoComplete="bday"
                                    placeholder="YYYY-MM-DD"
                                    pattern="\d{4}-\d{2}-\d{2}"
                                    title="Use format YYYY-MM-DD"
                                    onChange={handleBirthdateChange}
                                />
                                <p className="text-[10px] text-muted-foreground italic">Format: YYYY-MM-DD (e.g., 1990-01-31)</p>
                                <InputError message={errors.birthdate} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="marital_status">Marital Status</Label>
                                <select
                                    id="marital_status"
                                    name="marital_status"
                                    required
                                    tabIndex={7}
                                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                    required
                                    tabIndex={8}
                                    value={data.has_dg_leader}
                                    onChange={(e) => setData('has_dg_leader', e.target.value)}
                                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select an option</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                                <InputError message={errors.has_dg_leader} />
                            </div>

                            {data.has_dg_leader === 'no' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="want_to_join_dg">Do you want to join a DG group?</Label>
                                    <select
                                        id="want_to_join_dg"
                                        name="want_to_join_dg"
                                        required
                                        tabIndex={8.5}
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

                            {data.has_dg_leader === 'yes' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="dg_leader_name">DG Leader Name</Label>
                                    <Input
                                        id="dg_leader_name"
                                        type="text"
                                        required
                                        tabIndex={9}
                                        autoComplete="off"
                                        name="dg_leader_name"
                                        value={data.dg_leader_name}
                                        onChange={(e) => setData('dg_leader_name', e.target.value)}
                                        placeholder="Enter your DG Leader's name"
                                    />
                                    <InputError message={errors.dg_leader_name} />
                                </div>
                            )}

                            <div>Enter a Password</div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>



                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={10}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={11}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
