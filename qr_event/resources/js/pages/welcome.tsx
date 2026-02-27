import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

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
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#313638] dark:text-[#EDEDEC]">
                {/* Main Content */}
                <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-8">
                    <main className="w-full max-w-83.75 lg:max-w-5xl">
                        <div className="flex flex-col-reverse gap-0 overflow-hidden rounded-lg shadow-lg lg:flex-row lg:gap-0">
                            {/* Content Section */}
                            <div className="flex flex-1 flex-col justify-between rounded-br-lg rounded-bl-lg bg-[#000000] p-8 lg:rounded-tl-lg lg:rounded-tr-none lg:rounded-bl-none lg:p-12 dark:bg-[#000000]">
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4">
                                        <img
                                            src="/images/default-event.png"
                                            alt="Event Banner"
                                            className="h-auto w-full object-contain"
                                        />
                                    </div>
                                    <p className="mb-8 text-sm leading-relaxed text-gray-300">
                                        Join our community of engaged members.
                                        Register to participate in events,
                                        connect with others, and stay updated
                                        with the latest.
                                    </p>
                                </div>

                                {/* Navigation Links */}
                                <nav className="flex flex-col justify-center gap-3 sm:flex-row">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="rounded-md bg-blue-600 px-6 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="inline-block rounded-md border border-white/20 px-6 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10"
                                            >
                                                Log In
                                            </Link>
                                            {canRegister && (
                                                <Link
                                                    href={register()}
                                                    className="rounded-md bg-white px-6 py-2.5 text-center text-sm font-medium text-black transition hover:bg-gray-200"
                                                >
                                                    Register Now
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </nav>
                            </div>

                            {/* Image Section */}
                            <div className="flex-1 overflow-hidden rounded-tl-lg rounded-tr-lg bg-[#000000] lg:rounded-tl-none lg:rounded-tr-lg">
                                <img
                                    src="/images/dove.png"
                                    alt="Movement Event"
                                    className="h-64 w-full object-contain lg:h-full lg:min-h-100"
                                />
                            </div>
                        </div>
                    </main>
                </div>

                {/* Footer spacing */}
                <div className="hidden h-14 lg:block"></div>
            </div>
        </>
    );
}
