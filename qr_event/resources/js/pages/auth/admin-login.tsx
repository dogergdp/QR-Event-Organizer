import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import { store } from '@/routes/login';

export default function AdminLogin() {
    return (
        <AuthCardLayout
            title="Admin Login"
            description="Enter your contact number and password to access admin panel"
        >
            <Head title="Admin Login" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="admin_login" value="1" />

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    type="tel"
                                    name="contact_number"
                                    required
                                    autoFocus
                                    autoComplete="tel"
                                    placeholder="e.g. 09123456789"
                                />
                                <InputError message={errors.contact_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                disabled={processing}
                                data-test="admin-login-button"
                            >
                                {processing && <Spinner />}
                                Log in as admin
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Not an admin?{' '}
                            <TextLink href="/login">
                                User login
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthCardLayout>
    );
}
