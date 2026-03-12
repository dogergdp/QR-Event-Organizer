import { router } from '@inertiajs/react';
import { normalizePlusOne, normalizeFamilyColor, validatePaymentAmount } from '../utils/attendee-utils';

interface AttendancePayload extends Record<string, any> {
    is_attended: boolean;
    plus_ones_attended: string[];
}

interface PaymentPayload extends Record<string, any> {
    is_paid: boolean;
    amount_paid: number | null;
    payment_type: string | null;
    payment_remarks: string | null;
}

interface PlusOnesPayload extends Record<string, any> {
    plus_ones: ReturnType<typeof normalizePlusOne>[];
}

export const AttendanceService = {
    updateAttendance: (
        eventId: number,
        attendeeId: number,
        payload: AttendancePayload,
        options: { onSuccess?: () => void; onError?: () => void } = {},
    ) => {
        return router.patch(
            `/events/${eventId}/attendees/${attendeeId}/attendance`,
            payload,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: options.onSuccess,
                onError: options.onError,
            },
        );
    },
};

export const PaymentService = {
    updatePayment: (
        attendeeId: number,
        payload: PaymentPayload,
        options: { onSuccess?: () => void } = {},
    ) => {
        return router.patch(
            `/admin/attendees/${attendeeId}/payment`,
            payload,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: options.onSuccess,
            },
        );
    },

    validateAmount: (amount: string) => validatePaymentAmount(amount),
};

export const PlusOnesService = {
    updatePlusOnes: (
        attendeeId: number,
        plusOnes: any[],
        options: { onSuccess?: () => void } = {},
    ) => {
        const normalized = plusOnes.map(normalizePlusOne);
        return router.patch(
            `/admin/attendees/${attendeeId}/plus-ones`,
            { plus_ones: normalized },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: options.onSuccess,
            },
        );
    },
};

export const FamilyColorService = {
    updateColor: (
        attendeeId: number,
        color: string,
        options: { onSuccess?: () => void } = {},
    ) => {
        return router.patch(
            `/admin/attendees/${attendeeId}/assigned-values`,
            { family_color: normalizeFamilyColor(color) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: options.onSuccess,
            },
        );
    },
};
