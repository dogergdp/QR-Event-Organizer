import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import BackgroundSlideshow from '@/components/background-slideshow';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <BackgroundSlideshow />
            <div className="relative min-h-screen flex items-center justify-start z-10">
                <main className="w-full max-w-xl mx-auto p-8 lg:p-20 flex items-center justify-start lg:ml-24">
                    <div className="relative w-full">
                        <div
                            className="absolute inset-0 bg-white/80 dark:bg-black/70 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none"
                            style={{
                                WebkitMaskImage:
                                    'linear-gradient(to top left, transparent 0%, transparent 15%, black 40%, black 100%)',
                                maskImage:
                                    'linear-gradient(to top left, transparent 0%, transparent 15%, black 40%, black 100%)',
                                zIndex: 1,
                            }}
                        />
                        <div className="relative z-10 p-12 w-full flex flex-col items-center lg:items-start lg:text-left">
                            <img
                                src="/images/ccf-logo.png"
                                alt="Organization Banner"
                                className="h-[12rem] object-contain rounded-lg mx-auto lg:mx-0 lg:self-start"
                            />
                            <h1 className="text-3xl font-bold mb-2 text-center lg:text-left">Join our community of engaged members.</h1>
                            <p className="mb-8 text-base leading-relaxed text-gray-700 dark:text-gray-300 text-center lg:text-left">
                                Register to participate in events, connect with others, and stay updated with the latest.
                            </p>
                            <nav className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-md bg-blue-600 px-6 py-2.5 text-center text-base font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login.url()}
                                            className="rounded-md border dark:bg-black/70 px-6 py-2.5 text-center text-base font-medium bg-white transition hover:bg-white transition shadow"
                                        >
                                            Log In
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register.url()}
                                                className="rounded-md bg-yellow-300 px-6 py-2.5 text-center text-yellow-900 font-medium text-white transition hover:bg-yellow-600 shadow"
                                            >
                                                Register Now
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
