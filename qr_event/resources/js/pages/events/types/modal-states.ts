// Type definitions for editable plus ones
export type EditablePlusOne = {
    id?: string;
    full_name?: string;
    age?: number;
    gender?: string;
    is_first_time?: boolean;
    remarks?: string;
    is_attended?: boolean;
};

// Payment state type
export type PaymentState = {
    attendee: any | null;
    isPaid: boolean;
    amount: string;
    type: string;
    remarks: string;
};

// Attendance state type
export type AttendanceState = {
    attendee: any | null;
    status: boolean;
    selectedPlusOnes: string[];
    isSaving: boolean;
};

// Color selection state type
export type ColorState = {
    attendee: any | null;
    color: string;
};
