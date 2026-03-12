import { router } from '@inertiajs/react';

export const ImportService = {
    importFamiliesCSV: (
        eventId: number,
        file: File,
        options: {
            onSuccess?: () => void;
            onError?: (errors: any) => void;
        } = {},
    ) => {
        const formData = new FormData();
        formData.append('file', file);

        return router.post(
            `/events/${eventId}/attendees/import-families`,
            formData as any,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: options.onSuccess,
                onError: options.onError,
            },
        );
    },

    validateCSVFile: (file: File): { valid: boolean; error?: string } => {
        if (!file.name.endsWith('.csv') && !file.type.includes('text')) {
            return {
                valid: false,
                error: 'Please select a CSV file',
            };
        }
        return { valid: true };
    },
};
