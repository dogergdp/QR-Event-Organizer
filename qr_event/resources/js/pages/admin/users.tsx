import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

function calculateAge(birthdate: string | null): string {
    if (!birthdate) return 'N/A';

    const match = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return 'N/A';

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return 'N/A';

    const today = new Date();
    let age = today.getFullYear() - year;

    const hasHadBirthdayThisYear =
        today.getMonth() + 1 > month ||
        (today.getMonth() + 1 === month && today.getDate() >= day);

    if (!hasHadBirthdayThisYear) {
        age -= 1;
    }

    return age >= 0 && age <= 130 ? age.toString() : 'N/A';
}

export default function AdminUsers() {
    const { users } = usePage<any>().props as {
        users: Array<{
            id: number;
            first_name: string;
            last_name: string;
            dg_leader_name: string;
            contact_number: string;
            birthdate: string | null;
            created_at: string;
        }>;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Registered Users', href: '/admin/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registered Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h1 className="text-2xl font-bold text-foreground">
                        Registered Users
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        View all registered users in the system
                    </p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    {!users || users.length === 0 ? (
                        <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                            No users registered yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70">
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            DG Leader
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Contact Number
                                        </th>

                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Age
                                        </th>

                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Registration Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-sidebar-border/70 hover:bg-sidebar/50"
                                        >
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {user.id}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {user.first_name} {user.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.dg_leader_name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.contact_number}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {calculateAge(user.birthdate)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(
                                                    user.created_at
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4 text-sm text-muted-foreground">
                                Total users: <span className="font-semibold text-foreground">{users.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
