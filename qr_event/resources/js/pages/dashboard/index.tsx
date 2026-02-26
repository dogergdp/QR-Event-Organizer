import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import QRScanner from '@/components/QRScanner';

// Hooks & Sub-components
import { useDashboardSocket } from './hooks/useDashboardSocket';
import { useScanHandler } from './hooks/useScanHandler';
import AdminView from './partials/AdminView';
import UserView from './partials/UserView';
import type { DashboardProps } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const props = usePage().props as DashboardProps;
    const { auth, isAdmin, events } = props;

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScan = useScanHandler(setIsScannerOpen);
    useDashboardSocket(!!isAdmin);

    const displayName = auth?.user
        ? [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ') || auth.user.name || auth.user.contact_number
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {/* Global Modals */}
            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-muted/40 dark:bg-muted/20 p-4">
                {/* Header Context */}
                <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                        Welcome{displayName ? `, ${displayName}` : ''}!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAdmin
                            ? 'Overview of system performance and activity.'
                            : 'Check your upcoming events and track your attendance.'}
                    </p>
                </div>

                {/* Conditional View Injection */}
                {isAdmin ? (
                    <AdminView {...props} />
                ) : (
                    <UserView
                        events={events}
                        onScanClick={() => setIsScannerOpen(true)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
