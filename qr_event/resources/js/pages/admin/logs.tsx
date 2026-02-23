import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Logs', href: '/admin/logs' },
];

type LogItem = {
    id: number;
    action: string;
    target_type: string | null;
    target_id: number | null;
    description: string | null;
    user: string;
    created_at: string;
};

type LogsPageProps = {
    logs: {
        data: LogItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        from: number | null;
        to: number | null;
    };
};

export default function LogsPage() {
    const { logs } = usePage().props as LogsPageProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Logs</h1>
                            <p className="mt-1 text-muted-foreground">
                                Activity history for admin actions and user events.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {!logs || logs.data.length === 0 ? (
                    <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                        No logs found.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-slate-900">
                            <table className="w-full text-sm">
                                <thead className="bg-primary/10 dark:bg-primary/20">
                                    <tr className="border-b border-sidebar-border/70">
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Time</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">User</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Action</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="border-b border-sidebar-border/70">
                                            <td className="px-4 py-3 text-muted-foreground">{log.created_at}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{log.user}</td>
                                            <td className="px-4 py-3 text-foreground">
                                                {log.description ?? log.action}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {log.target_type ? `${log.target_type} #${log.target_id ?? '—'}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">
                                Showing {logs.from ?? 0} to {logs.to ?? 0} of{' '}
                                <span className="font-semibold text-foreground">{logs.total}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {logs.links.map((link, index) => {
                                    const isDisabled = !link.url;
                                    const label = link.label.replace(/&laquo;|&raquo;/g, (match) => {
                                        return match === '&laquo;' ? '«' : '»';
                                    });

                                    if (isDisabled) {
                                        return (
                                            <span
                                                key={`${link.label}-${index}`}
                                                className="rounded-md px-3 py-1 text-sm font-medium border border-sidebar-border/70 text-muted-foreground cursor-not-allowed opacity-50"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <button
                                            key={`${link.label}-${index}`}
                                            onClick={() => {
                                                window.location.href = link.url as string;
                                            }}
                                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border border-sidebar-border/70 text-foreground hover:bg-sidebar/50'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
