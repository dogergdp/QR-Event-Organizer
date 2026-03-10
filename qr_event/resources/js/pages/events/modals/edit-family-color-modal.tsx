import type { Attendee } from '../types';

type EditFamilyColorModalProps = {
    open: boolean;
    attendee: Attendee | null;
    familyColor: string;
    onFamilyColorChange: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
};

export default function EditFamilyColorModal({
    open,
    attendee,
    familyColor,
    onFamilyColorChange,
    onClose,
    onSave,
}: EditFamilyColorModalProps) {
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
                    <h2 className="text-xl font-semibold text-foreground">Edit Family Color</h2>
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

                <div className="space-y-2">
                    <label className="block text-xs font-medium text-muted-foreground">Family Color</label>
                    <select
                        value={familyColor || 'none'}
                        onChange={(e) => onFamilyColorChange(e.target.value)}
                        className="h-10 w-full rounded-md border border-sidebar-border/70 bg-transparent px-3 text-sm text-foreground outline-none"
                    >
                        <option value="none">None</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="red">Red</option>
                        <option value="yellow">Yellow</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Stored in assigned_values.family_color</p>
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
