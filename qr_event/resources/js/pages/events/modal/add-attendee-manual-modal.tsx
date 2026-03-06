import { Form } from '@inertiajs/react';
import { useState } from 'react';

type ModalEvent = {
    id: number;
    name: string;
};

type ModalUser = {
    id: number;
    first_name: string;
    last_name: string;
    contact_number: string;
};

type AddAttendeeManualModalProps = {
    open: boolean;
    event: ModalEvent;
    users: ModalUser[];
    attendeesUrl: string;
    onClose: () => void;
};

export default function AddAttendeeManualModal({
    open,
    event,
    users,
    attendeesUrl,
    onClose,
}: AddAttendeeManualModalProps) {
    const [userSearch, setUserSearch] = useState('');

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Add Attendee Manually</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">Event: {event.name}</p>

                <Form
                    action="/admin/attendees"
                    method="post"
                    className="grid gap-3"
                    onSuccess={() => {
                        onClose();
                        setUserSearch('');
                    }}
                >
                    {({ errors }) => {
                        const filteredUsers = users.filter((user) => {
                            const searchLower = userSearch.toLowerCase();
                            const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
                            const contact = user.contact_number.toLowerCase();
                            return fullName.includes(searchLower) || contact.includes(searchLower);
                        });

                        return (
                            <>
                                <input type="hidden" name="event_id" value={event.id} />
                                <input type="hidden" name="redirect_to" value={attendeesUrl} />

                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search user by name or contact"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                />

                                <div>
                                    <select
                                        name="user_id"
                                        required
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                    >
                                        <option value="">Select user</option>
                                        {filteredUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.first_name} {user.last_name} - {user.contact_number}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>}
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs text-foreground">Paid Amount (PHP)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="amount_paid"
                                            placeholder="0.00"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                        />
                                        {errors.amount_paid && (
                                            <p className="mt-1 text-xs text-red-600">{errors.amount_paid}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-foreground">Payment Type</label>
                                        <select
                                            name="payment_type"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                        >
                                            <option value="">Select payment type</option>
                                            <option value="cash">Cash</option>
                                            <option value="gcash">GCash</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.payment_type && (
                                            <p className="mt-1 text-xs text-red-600">{errors.payment_type}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-foreground">Payment Remarks</label>
                                        <input
                                            type="text"
                                            name="payment_remarks"
                                            placeholder="Extra remarks (optional)"
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                                        />
                                        {errors.payment_remarks && (
                                            <p className="mt-1 text-xs text-red-600">{errors.payment_remarks}</p>
                                        )}
                                    </div>
                                </div>

                                <label className="inline-flex items-center gap-2 text-xs text-foreground">
                                    <input type="checkbox" name="is_attended" value="1" className="h-4 w-4" />
                                    Mark as already attended
                                </label>

                                <div className="mt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 rounded-md border border-sidebar-border/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-sidebar/50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                    >
                                        Add Attendee
                                    </button>
                                </div>
                            </>
                        );
                    }}
                </Form>
            </div>
        </div>
    );
}
