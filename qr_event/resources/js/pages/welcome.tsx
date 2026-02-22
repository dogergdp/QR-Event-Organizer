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
                    <main className="w-full max-w-[335px] lg:max-w-5xl">
                        <div className="flex flex-col-reverse gap-0 rounded-lg overflow-hidden shadow-lg lg:flex-row lg:gap-0">
                            {/* Content Section */}
                            <div className="flex flex-1 flex-col justify-between rounded-bl-lg rounded-br-lg bg-white p-8 lg:rounded-bl-none lg:rounded-tr-none lg:rounded-tl-lg lg:p-12 dark:bg-[#444a4e]">
                                <img></img>
                                <div>
                                    <h1 className="mb-2 text-3xl font-semibold tracking-tight lg:text-4xl">
                                        Welcome to Movement
                                    </h1>
                                    <p className="mb-8 text-sm leading-relaxed text-[#6b6b63] dark:text-[#a8a8a1]">
                                        Join our community of engaged members. Register to participate in events, connect with others, and stay updated with the latest from our movement.
                                    </p>
                                </div>

                                {/* Navigation Links */}
                                <nav className="flex flex-col gap-3 sm:flex-row">
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
                                                className="inline-block rounded-md border border-[#ccc] px-6 py-2.5 text-center text-sm font-medium transition hover:bg-[#f5f5f5] dark:border-[#3E3E3A] dark:hover:bg-[#1f1f1e]"
                                            >
                                                Log In
                                            </Link>
                                            {canRegister && (
                                                <Link
                                                    href={register()}
                                                    className="rounded-md bg-black px-6 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                                >
                                                    Register Now
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </nav>
                            </div>

                            {/* Image Section */}
                            <div className="flex-1 overflow-hidden rounded-tl-lg rounded-tr-lg lg:rounded-tl-none lg:rounded-tr-lg">
                                <img
                                    src="./images/dove.png"
                                    alt="Movement Event"
                                    className="h-64 w-full object-cover lg:h-auto"
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
