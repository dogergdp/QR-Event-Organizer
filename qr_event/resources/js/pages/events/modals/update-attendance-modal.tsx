import type { Attendee } from '../types';

interface UpdateAttendanceModalProps {
    open: boolean;
    attendee: Attendee | null;
    newAttendanceStatus: boolean;
    selectedPlusOnes: string[];
    savingAttendance: boolean;
    onClose: () => void;
    onAttendanceStatusChange: (status: boolean) => void;
    onPlusOneToggle: (plusOneId: string) => void;
    onSave: () => void;
}

export default function UpdateAttendanceModal({
    open,
    attendee,
    newAttendanceStatus,
    selectedPlusOnes,
    savingAttendance,
    onClose,
    onAttendanceStatusChange,
    onPlusOneToggle,
    onSave,
}: UpdateAttendanceModalProps) {
    if (!open || !attendee) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Mark Attendance: {attendee.user.first_name} {attendee.user.last_name}
                </h2>

                <div className="space-y-4">
                    {/* Main attendee status */}
                    <div className="rounded-md border border-sidebar-border/70 p-4">
                        <label className="flex cursor-pointer items-center gap-3">
                            <input
                                type="checkbox"
                                checked={newAttendanceStatus}
                                onChange={(e) => onAttendanceStatusChange(e.target.checked)}
                                className="h-4 w-4 rounded border-sidebar-border/70"
                            />
                            <span className="text-sm font-medium text-foreground">
                                Mark {attendee.user.first_name} as attended
                            </span>
                        </label>
                    </div>

                    {/* Plus ones */}
                    {attendee.plus_ones && attendee.plus_ones.length > 0 && (
                        <div className="rounded-md border border-sidebar-border/70 p-4">
                            <h3 className="mb-3 font-medium text-foreground">Plus Ones Available</h3>
                            <div className="space-y-2">
                                {attendee.plus_ones.map((plusOne) => (
                                    <label
                                        key={plusOne.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-sidebar/50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPlusOnes.includes(String(plusOne.id))}
                                            onChange={() => onPlusOneToggle(String(plusOne.id))}
                                            className="h-4 w-4 rounded border-sidebar-border/70"
                                        />
                                        <span className="text-sm text-foreground">
                                            {plusOne.full_name} {plusOne.age ? `(Age ${plusOne.age})` : ''}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-md border border-sidebar-border/70 px-4 py-2 font-medium text-foreground hover:bg-sidebar/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={savingAttendance}
                            className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {savingAttendance ? 'Saving...' : 'Confirm & Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
