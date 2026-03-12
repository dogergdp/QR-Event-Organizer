import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        admin_login: '1',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted with data:', data);
        console.log('Processing:', processing);
        console.log('Errors:', errors);
        post('/login', {
            onError: (errors) => {
                console.error('Login failed with errors:', errors);
            },
            onSuccess: () => {
                console.log('Login successful!');
            },
        });
    };

    return (
        <AuthCardLayout
            title="Admin Login"
            description="Enter your email and password to access admin panel"
        >
            <Head title="Admin Login" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="e.g. admin@qrevent.local"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        disabled={processing || !data.email || !data.password}
                        data-test="admin-login-button"
                        onClick={() => console.log('Button clicked', { email: data.email, password: data.password, processing })}
                    >
                        {processing ? (
                            <>
                                <Spinner />
                                <span className="ml-2">Logging in...</span>
                            </>
                        ) : (
                            'Log in as admin'
                        )}
                    </Button>

                    {processing && (
                        <div className="text-center text-sm text-blue-600">
                            Authenticating your credentials...
                        </div>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Not an admin?{' '}
                    <TextLink href="/login">
                        User login
                    </TextLink>
                </div>
            </form>
        </AuthCardLayout>
    );
}
