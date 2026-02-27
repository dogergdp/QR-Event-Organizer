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
        created_at: string;
        updated_at: string;
    };
    isAdmin: boolean;
    userAttendance?: {
        id: number;
        user_id: number;
        event_id: number;
        is_attended: boolean;
        attended_time: string | null;
    } | null;
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
    filters?: {
        status?: 'rsvp' | 'attendance';
        first_time?: 'all' | 'yes' | 'no';
    };
}
