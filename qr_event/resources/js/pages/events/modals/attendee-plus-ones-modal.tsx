import { formatDateTime12Hour } from '@/utils/dateUtils';
import type { Attendee } from '../types';

type EditablePlusOne = {
    id?: string;
    full_name?: string;
    age?: number;
    gender?: string;
    is_first_time?: boolean;
    remarks?: string;
};

type AttendeePlusOnesModalProps = {
    open: boolean;
    attendee: Attendee | null;
    editablePlusOnes: EditablePlusOne[];
    savingPlusOnes: boolean;
    onClose: () => void;
    onAddPlusOne: () => void;
    onRemovePlusOne: (index: number) => void;
    onUpdatePlusOneField: (
        index: number,
        field: 'full_name' | 'age' | 'gender' | 'is_first_time' | 'remarks',
        value: string | number | boolean,
    ) => void;
    onSave: () => void;
};

export default function AttendeePlusOnesModal({
    open,
    attendee,
    editablePlusOnes,
    savingPlusOnes,
    onClose,
    onAddPlusOne,
    onRemovePlusOne,
    onUpdatePlusOneField,
    onSave,
}: AttendeePlusOnesModalProps) {
    if (!open || !attendee) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Event Attendee Details</h2>
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

                <div className="space-y-3 border-b border-sidebar-border/70 pb-4">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Contact Number</p>
                        <p className="text-sm text-foreground">{attendee.user.contact_number}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Registration Type</p>
                        <p className="text-sm text-foreground">{attendee.is_walk_in ? 'Walk-in' : 'Regular'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Attendance Status</p>
                        <p className="text-sm text-foreground">{attendee.is_attended ? 'Attended' : 'RSVP Only'}</p>
                    </div>
                    {attendee.attended_time && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Attended Time</p>
                            <p className="text-sm text-foreground">{formatDateTime12Hour(attendee.attended_time)}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">First Time Attendee</p>
                        <p className="text-sm text-foreground">{attendee.is_first_time ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Plus Ones ({attendee.plus_ones?.length ?? 0})</p>
                        <p className="text-sm text-foreground">Edit plus ones below.</p>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Edit Plus Ones</p>
                        <button
                            type="button"
                            onClick={onAddPlusOne}
                            className="rounded-md border border-sidebar-border/70 px-3 py-1 text-xs font-medium text-foreground hover:bg-sidebar/50"
                        >
                            Add Plus One
                        </button>
                    </div>

                    {editablePlusOnes.length === 0 ? (
                        <div className="rounded-md border border-dashed border-sidebar-border/70 p-3 text-xs text-muted-foreground">
                            No plus ones yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {editablePlusOnes.map((plusOne, index) => (
                                <div key={`${plusOne.id ?? 'plus-one'}-${index}`} className="rounded-md border border-sidebar-border/70 p-3">
                                    <div className="grid gap-2 md:grid-cols-2">
                                        <input
                                            type="text"
                                            value={plusOne.full_name ?? ''}
                                            onChange={(e) => onUpdatePlusOneField(index, 'full_name', e.target.value)}
                                            placeholder="Full name"
                                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            value={plusOne.age ?? ''}
                                            onChange={(e) =>
                                                onUpdatePlusOneField(
                                                    index,
                                                    'age',
                                                    e.target.value === '' ? NaN : Number(e.target.value),
                                                )
                                            }
                                            placeholder="Age"
                                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
                                        />
                                        <input
                                            type="text"
                                            value={plusOne.gender ?? ''}
                                            onChange={(e) => onUpdatePlusOneField(index, 'gender', e.target.value)}
                                            placeholder="Gender"
                                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
                                        />
                                        <input
                                            type="text"
                                            value={plusOne.remarks ?? ''}
                                            onChange={(e) => onUpdatePlusOneField(index, 'remarks', e.target.value)}
                                            placeholder="Remarks"
                                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <label className="inline-flex items-center gap-2 text-xs text-foreground">
                                            <input
                                                type="checkbox"
                                                checked={!!plusOne.is_first_time}
                                                onChange={(e) => onUpdatePlusOneField(index, 'is_first_time', e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            First time
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => onRemovePlusOne(index)}
                                            className="text-xs font-medium text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-2 border-t border-sidebar-border/70 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-sidebar-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sidebar/50"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={savingPlusOnes}
                        className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        {savingPlusOnes ? 'Saving...' : 'Save Plus Ones'}
                    </button>
                </div>
            </div>
        </div>
    );
}
