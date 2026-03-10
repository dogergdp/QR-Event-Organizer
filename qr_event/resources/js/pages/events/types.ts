export interface AttendeeUser {
    id: number;
    first_name: string;
    last_name: string;
    contact_number: string;
    birthdate: string | null;
    is_first_time: boolean;
    remarks: string | null;
    want_to_join_dg: string | null;
}

export interface Attendee {
    id: number;
    user_id: number;
    is_attended: boolean;
    is_first_time: boolean; // IMPORTANT: event-specific first-time flag
    is_paid: boolean;
    is_walk_in: boolean;
    amount_paid: string | null;
    payment_type: string | null;
    payment_remarks: string | null;
    assigned_values: Record<string, string | number | boolean | null>;
    plus_ones: Array<{
        id?: string;
        full_name?: string;
        age?: number;
        gender?: string;
        is_first_time?: boolean;
        remarks?: string;
        is_attended?: boolean;
    }>;
    attended_time: string | null;
    user: AttendeeUser;
}

export interface EventShowProps {
    event: {
        id: number;
        name: string;
        date: string;
        start_time: string | null;
        end_time: string | null;
        description: string | null;
        location: string;
        banner_image?: string | null;
        is_finished?: boolean;
        is_ongoing?: boolean;
        login_requires_birthdate?: boolean;
        created_at: string;
        updated_at: string;
    };
    isAdmin: boolean;
    userAttendance?: {
        id: number;
        user_id: number;
        event_id: number;
        is_attended: boolean;
        is_paid?: boolean;
        amount_paid?: string | null;
        attended_time: string | null;
        family_name?: string | null;
        family_color?: string | null;
        assigned_values?: Record<string, string | number | boolean | null>;
        plus_ones?: Array<{
            id?: string;
            full_name?: string;
            age?: number | null;
        }>;
        attending_plus_ones?: Array<{
            id: string;
            full_name: string;
            age?: number | null;
        }>;
    } | null;
    attendedUsers?: Array<{
        id: number;
        name: string;
        family_name?: string | null;
        family_color?: string | null;
        attended_time?: string | null;
    }>;
    attendees?: {
        data: Attendee[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
        from: number | null;
        to: number | null;
    };
    users?: Array<{
        id: number;
        first_name: string;
        last_name: string;
        contact_number: string;
    }>;
    filters?: {
        status?: 'rsvp' | 'attendance';
        first_time?: 'all' | 'yes' | 'no';
        walk_in?: 'all' | 'yes' | 'no';
        paid?: 'all' | 'yes' | 'no';
        search?: string;
    };
}
