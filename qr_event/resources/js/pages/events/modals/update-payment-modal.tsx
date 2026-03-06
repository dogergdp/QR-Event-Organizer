import type { Attendee } from '../types';

type UpdatePaymentModalProps = {
    open: boolean;
    attendee: Attendee | null;
    paymentIsPaid: boolean;
    paymentAmount: string;
    paymentType: string;
    paymentRemarks: string;
    onClose: () => void;
    onTogglePaid: () => void;
    onPaymentAmountChange: (value: string) => void;
    onPaymentTypeChange: (value: string) => void;
    onPaymentRemarksChange: (value: string) => void;
    onSave: () => void;
};

export default function UpdatePaymentModal({
    open,
    attendee,
    paymentIsPaid,
    paymentAmount,
    paymentType,
    paymentRemarks,
    onClose,
    onTogglePaid,
    onPaymentAmountChange,
    onPaymentTypeChange,
    onPaymentRemarksChange,
    onSave,
}: UpdatePaymentModalProps) {
    if (!open || !attendee) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="w-full max-w-md rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Update Payment</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">
                    {attendee.user.first_name} {attendee.user.last_name}
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-xs font-medium text-muted-foreground">Payment Status</label>
                        <div className="inline-flex gap-1 rounded-md border border-sidebar-border/70 bg-background p-1">
                            <button
                                type="button"
                                onClick={onTogglePaid}
                                className={`rounded px-3 py-2 text-xs font-semibold transition-all ${
                                    !paymentIsPaid 
                                        ? 'bg-amber-500 text-white shadow-md' 
                                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950'
                                }`}
                            >
                                ✕ Unpaid
                            </button>
                            <button
                                type="button"
                                onClick={onTogglePaid}
                                className={`rounded px-3 py-2 text-xs font-semibold transition-all ${
                                    paymentIsPaid 
                                        ? 'bg-green-600 text-white shadow-md' 
                                        : 'bg-green-50 text-green-600 dark:bg-green-950'
                                }`}
                            >
                                ✓ Paid
                            </button>
                        </div>
                    </div>

                    {paymentIsPaid && (
                        <>
                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Amount (PHP)</label>
                                <div className="flex items-center rounded-md border border-sidebar-border/70 px-3 py-2">
                                    <span className="mr-2 text-sm text-muted-foreground">₱</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) => onPaymentAmountChange(e.target.value)}
                                        className="w-full bg-transparent text-sm text-foreground outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Payment Type</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => onPaymentTypeChange(e.target.value)}
                                    className="w-full rounded-md border border-sidebar-border/70 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                                >
                                    <option value="">Select payment type</option>
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-muted-foreground">Remarks</label>
                                <input
                                    type="text"
                                    value={paymentRemarks}
                                    onChange={(e) => onPaymentRemarksChange(e.target.value)}
                                    placeholder="Extra remarks (optional)"
                                    className="w-full rounded-md border border-sidebar-border/70 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                                />
                            </div>
                        </>
                    )}

                </div>

                <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sidebar/50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
