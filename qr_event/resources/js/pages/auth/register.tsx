import { Form, Head } from '@inertiajs/react';
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
    const [hasDgLeader, setHasDgLeader] = useState('');
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
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="Last Name"
                                    />
                                    <InputError
                                        message={errors.last_name}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="First Name"
                                    />
                                    <InputError
                                        message={errors.first_name}
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
                                    placeholder="ex. 09152872043"
                                />
                                <InputError message={errors.contact_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birthdate">Birthdate</Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    required
                                    tabIndex={6}
                                    name="birthdate"
                                />
                                <InputError message={errors.birthdate} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="marital_status">Marital Status</Label>
                                <select
                                    id="marital_status"
                                    name="marital_status"
                                    required
                                    tabIndex={7}
                                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                    value={hasDgLeader}
                                    onChange={(e) => setHasDgLeader(e.target.value)}
                                    className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                        type="text"
                                        required
                                        tabIndex={9}
                                        autoComplete="off"
                                        name="dg_leader_name"
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
