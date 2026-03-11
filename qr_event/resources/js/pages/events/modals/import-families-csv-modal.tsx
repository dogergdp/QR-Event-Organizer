import { router } from '@inertiajs/react';
import { useState } from 'react';

interface ImportFamiliesCsvModalProps {
    open: boolean;
    event: any;
    attendeesUrl: string;
    onClose: () => void;
}

export default function ImportFamiliesCsvModal({
    open,
    event,
    attendeesUrl,
    onClose,
}: ImportFamiliesCsvModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('text')) {
                setError('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleImport = () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post(
            `/events/${event.id}/attendees/import-families`,
            formData as any,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setFile(null);
                    setError(null);
                    onClose();
                },
                onError: (errors: any) => {
                    const fileError = errors.file?.[0] || errors?.file || 'Import failed. Please check your CSV file.';
                    setError(Array.isArray(fileError) ? fileError.join(', ') : String(fileError));
                    setIsImporting(false);
                },
            },
        );
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-lg border border-sidebar-border/70 bg-background p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-xl font-semibold text-foreground">Import Families from CSV</h2>

                <div className="space-y-4">
                    {/* CSV Format Help */}
                    <div className="rounded-md border border-sidebar-border/70 bg-sidebar/50 p-4">
                        <h3 className="mb-2 font-medium text-foreground">CSV Format Required:</h3>
                        <code className="block bg-background p-2 text-xs text-muted-foreground">
                            surname,first_name,age,gender,contact_number
                        </code>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <li>• <span className="font-medium">surname</span>: Family last name</li>
                            <li>• <span className="font-medium">first_name</span>: Person's first name</li>
                            <li>• <span className="font-medium">age</span>: Integer (1-150)</li>
                            <li>• <span className="font-medium">gender</span>: M or F</li>
                            <li>• <span className="font-medium">contact_number</span>: Required for family grouping</li>
                        </ul>
                        <div className="mt-3 rounded bg-blue-50 p-2 text-xs text-blue-700">
                            <strong>Note:</strong> Families with the same surname + contact number will be grouped together.
                            The oldest member (M preferred) becomes the main attendee, others are plus-ones.
                        </div>
                    </div>

                    {/* File Input */}
                    <div className="rounded-md border border-dashed border-sidebar-border/70 p-6 text-center">
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-file"
                        />
                        <label htmlFor="csv-file" className="cursor-pointer">
                            <div className="text-center">
                                {file ? (
                                    <>
                                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-foreground">Click to select CSV file</p>
                                        <p className="text-xs text-muted-foreground">or drag and drop</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Example */}
                    <div className="rounded-md border border-sidebar-border/70 bg-sidebar/50 p-4">
                        <h3 className="mb-2 text-sm font-medium text-foreground">Example:</h3>
                        <code className="block whitespace-pre-wrap text-xs text-muted-foreground">
{`Garcia,Juan,45,M,09123456789
Garcia,Maria,42,F,09123456789
Garcia,Pedro,15,M,09123456789
Reyes,Ana,38,F,09987654321
Reyes,Carlo,40,M,09987654321`}
                        </code>
                    </div>

                    {/* Action Buttons */}
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
                            onClick={handleImport}
                            disabled={!file || isImporting}
                            className="flex-1 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isImporting ? 'Importing...' : 'Import Families'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
