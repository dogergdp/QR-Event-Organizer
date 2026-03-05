import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import BackgroundSlideshow from '@/components/background-slideshow';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
    onClose,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
    onClose?: () => void;
}>) {
    return (
        <>
            <BackgroundSlideshow />
            <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-white/50 dark:bg-black/40 pointer-events-none z-10" />
            <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 p-4 md:p-8 z-20">
                <div className="flex w-full max-w-2xl flex-col gap-10">
                    <div className="relative w-full">
                        <Card className="rounded-2xl relative shadow-2xl backdrop-blur-lg bg-white/60 dark:bg-black/40">
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute right-4 top-4 text-2xl text-muted-foreground hover:text-foreground focus:outline-none"
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                            )}
                            <div className="flex justify-center items-center w-full gap-2">
                            <img
                                src="/images/ccf-logo.png"
                                alt="Event Banner"
                                className="h-64 w-auto px-32 object-contain rounded-lg mx-auto"
                            />
                            </div>
                            <CardHeader className="px-12 pt-6 pb-0 text-center">
                                <CardTitle className="text-xl">{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                            <CardContent className="px-16 py-10">
                                {children}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
