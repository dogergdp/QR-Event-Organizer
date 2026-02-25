export interface DashboardProps {
    auth?: {
        user?: {
            first_name?: string;
            last_name?: string;
            name?: string;
            contact_number?: string;
        };
    };
    events?: Array<{
        id: number;
        name: string;
        date: string;
        start_time: string | null;
        end_time: string | null;
        description: string;
        location: string;
        banner_image?: string | null;
        is_finished?: boolean;
        is_ongoing?: boolean;
        has_rsvp?: boolean;
    }>;
    isAdmin?: boolean;
    stats?: {
        total_events: number;
        finished_events: number;
        total_attendees: number;
        total_attendances: number;
        average_attendance_rate: number;
    };
    reportEvents?: Array<{
        id: number;
        name: string;
        date: string;
        start_time: string | null;
        location: string;
        total_registered: number;
        total_attended: number;
        rsvp: Array<{
            id: number;
            name: string;
            contact_number: string;
            attended_time: string | null;
        }>;
        attendees: Array<{
            id: number;
            name: string;
            contact_number: string;
            attended_time: string | null;
        }>;
    }>;
    topAttendees?: Array<{
        id: number;
        name: string;
        contact_number: string;
        events_attended: number;
        is_first_time: boolean;
    }>;
    activityLogs?: Array<{
        id: number;
        action: string;
        target_type: string | null;
        target_id: number | null;
        description: string | null;
        user: string;
        created_at: string;
    }>;
}