import { useState } from 'react';
import { Form, Head, Link, usePage, router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';

export default function EditUser() {
    const today = new Date().toISOString().split('T')[0];
    const { user } = usePage<any>().props as {
        user: {
            id: number;
            first_name: string;
            last_name: string;
            contact_number: string;
            birthdate: string | null;
            marital_status: string;
            has_dg_leader: string;
            dg_leader_name: string | null;
            want_to_join_dg: string | null;
            remarks: string | null;
        };
    };

    const form = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        contact_number: user.contact_number,
        birthdate: user.birthdate ?? '',
        marital_status: user.marital_status,
        has_dg_leader: user.has_dg_leader,
        dg_leader_name: user.dg_leader_name ?? '',
        want_to_join_dg: user.want_to_join_dg ?? '',
        remarks: user.remarks ?? '',
        password: '',
        password_confirmation: '',
    });

    const { data, setData, processing, errors } = form;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Registered Users', href: '/admin/users' },
        { title: 'Edit User', href: `/admin/users/${user.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
                    <p className="mt-1 text-muted-foreground">Update user details</p>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <Form
                        {...UserController.update.form({ user: user.id })}
                        className="grid gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        name="contact_number"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="birthdate">Birthdate</Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        name="birthdate"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                        max={today}
                                        required
                                    />
                                    <InputError message={errors.birthdate} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="marital_status">Marital Status</Label>
                                    <select
                                        id="marital_status"
                                        name="marital_status"
                                        value={data.marital_status}
                                        onChange={(e) => setData('marital_status', e.target.value)}
                                        required
                                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    >
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="separated">Separated</option>
                                        <option value="widowed">Widowed</option>
                                    </select>
                                    <InputError message={errors.marital_status} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="has_dg_leader">Are you in a DG Group?</Label>
                                    <select
                                        id="has_dg_leader"
                                        name="has_dg_leader"
                                        value={data.has_dg_leader}
                                        onChange={(e) => setData('has_dg_leader', e.target.value)}
                                        required
                                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                    <InputError message={errors.has_dg_leader} />
                                </div>

                                {data.has_dg_leader === 'no' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="want_to_join_dg">Do you want to join a DG group?</Label>
                                        <select
                                            id="want_to_join_dg"
                                            name="want_to_join_dg"
                                            value={data.want_to_join_dg}
                                            onChange={(e) => setData('want_to_join_dg', e.target.value)}
                                            required
                                            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">Select an option</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                        </select>
                                        <InputError message={errors.want_to_join_dg} />
                                    </div>
                                )}

                                {data.has_dg_leader === 'yes' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="dg_leader_name">DG Leader Name</Label>
                                        <Input
                                            id="dg_leader_name"
                                            name="dg_leader_name"
                                            value={data.dg_leader_name}
                                            onChange={(e) => setData('dg_leader_name', e.target.value)}
                                            placeholder="DG Leader Name"
                                            required
                                        />
                                        <InputError message={errors.dg_leader_name} />
                                    </div>
                                )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="remarks">Admin Remarks</Label>
                                        <textarea
                                            id="remarks"
                                            name="remarks"
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            placeholder="Optional notes about this user (admin only)"
                                            className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                        <InputError message={errors.remarks} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">New Password (optional)</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Leave blank to keep current"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm new password"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>

                                <div className="mt-2 flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Save Changes
                                    </Button>
                                    <Link href="/admin/users" className="text-sm text-muted-foreground hover:underline">
                                        Cancel
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
                                                router.delete(`/admin/users/${user.id}`, {
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                        className="ml-auto inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete User
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
