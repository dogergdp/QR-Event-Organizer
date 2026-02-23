import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, UserPlus, Eye } from 'lucide-react';

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
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const { users, filters } = usePage<any>().props as {
        users: {
            data: Array<{
                id: number;
                first_name: string;
                last_name: string;
                dg_leader_name: string;
                contact_number: string;
                birthdate: string | null;
                created_at: string;
            }>;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            total: number;
            from: number | null;
            to: number | null;
        };
        filters: {
            search?: string;
            sort?: 'id' | 'name' | 'age' | 'created_at';
            direction?: 'asc' | 'desc';
        };
    };

    const currentSort = filters?.sort ?? 'created_at';
    const currentDirection = filters?.direction ?? 'desc';

    const applySort = (column: 'id' | 'name' | 'age' | 'created_at') => {
        const nextDirection = currentSort === column && currentDirection === 'asc' ? 'desc' : 'asc';
        router.get(
            '/admin/users',
            {
                search: filters?.search ?? '',
                sort: column,
                direction: nextDirection,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const renderSortIcon = (column: 'id' | 'name' | 'age' | 'created_at') => {
        if (currentSort !== column) {
            return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
        }

        return currentDirection === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary" />
        ) : (
            <ArrowDown className="h-3.5 w-3.5 text-primary" />
        );
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Registered Users
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                View all registered users in the system
                            </p>
                        </div>
                        <Link
                            href="/admin/users/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <form method="get" action="/admin/users" className="mb-4 flex gap-2">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters?.search ?? ''}
                            placeholder="Search name or contact number"
                            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            Search
                        </button>
                    </form>

                    {!users || users.data.length === 0 ? (
                        <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                            No users registered yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70">
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            <button
                                                type="button"
                                                onClick={() => applySort('id')}
                                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                ID {renderSortIcon('id')}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            <button
                                                type="button"
                                                onClick={() => applySort('name')}
                                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                Name {renderSortIcon('name')}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            DG Leader
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Contact Number
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            <button
                                                type="button"
                                                onClick={() => applySort('age')}
                                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                Age {renderSortIcon('age')}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            <button
                                                type="button"
                                                onClick={() => applySort('created_at')}
                                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                Registration Date {renderSortIcon('created_at')}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-sidebar-border/70 hover:bg-sidebar/50"
                                        >
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {user.id}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser(user)}
                                                    className="hover:text-primary hover:underline transition-colors text-left"
                                                >
                                                    {user.first_name} {user.last_name}
                                                </button>
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
                                            <td className="px-4 py-3 opacity-0 hover:opacity-100 transition-opacity flex items-center gap-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser(user)}
                                                    className="inline-flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-green-600 dark:text-green-400"
                                                    title="View user details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    href={`/admin/users/${user.id}/edit`}
                                                    className="inline-flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-blue-600 dark:text-blue-400"
                                                    title="Edit user"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4 flex items-center justify-between gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Showing {users.from ?? 0} to {users.to ?? 0} of{' '}
                                    <span className="font-semibold text-foreground">{users.total}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {users.links.map((link, index) => {
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
                        </div>
                    )}

                    {/* User Details Modal */}
                    {selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedUser(null)}>
                            <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-foreground">User Details</h2>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 border-t border-sidebar-border/70 pt-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Name</p>
                                        <p className="text-sm font-medium text-foreground">{selectedUser.first_name} {selectedUser.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Contact Number</p>
                                        <p className="text-sm text-foreground">{selectedUser.contact_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Age</p>
                                        <p className="text-sm text-foreground">{calculateAge(selectedUser.birthdate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">DG Leader</p>
                                        <p className="text-sm text-foreground">{selectedUser.dg_leader_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Registration Date</p>
                                        <p className="text-sm text-foreground">{new Date(selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                                    <Link
                                        href={`/admin/users/${selectedUser.id}/edit`}
                                        className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        Edit User
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground hover:bg-sidebar/50 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
