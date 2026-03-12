import { router } from '@inertiajs/react';

interface UseFiltersProps {
    filters: any;
    eventId: number;
}

export const useFilters = ({ filters, eventId }: UseFiltersProps) => {
    const attendeesUrl = `/events/${eventId}/attendees`;

    const activeAdminTab = filters?.status ?? 'rsvp';
    const firstTimeFilter = filters?.first_time ?? 'all';
    const walkInFilter = filters?.walk_in ?? 'all';
    const paidFilter = filters?.paid ?? 'all';
    const colorFilter = filters?.color ?? 'all';
    const minAgeFilter = filters?.min_age ? Number(filters.min_age) : 0;
    const maxAgeFilter = filters?.max_age ? Number(filters.max_age) : 150;
    const searchValue = filters?.search ?? '';

    const updateFilter = (newFilters: any) => {
        router.get(attendeesUrl, { ...filters, ...newFilters }, { preserveState: true, replace: true });
    };

    const setActiveAdminTab = (tab: 'rsvp' | 'attendance') => {
        updateFilter({ status: tab });
    };

    const setFirstTimeFilter = (filter: 'all' | 'yes' | 'no') => {
        updateFilter({ first_time: filter });
    };

    const setWalkInFilter = (filter: 'all' | 'yes' | 'no') => {
        updateFilter({ walk_in: filter });
    };

    const setPaidFilter = (filter: 'all' | 'yes' | 'no') => {
        updateFilter({ paid: filter });
    };

    const setColorFilter = (color: string) => {
        updateFilter({ color });
    };

    const setAgeRangeFilter = (minAge: number, maxAge: number) => {
        updateFilter({ min_age: minAge, max_age: maxAge });
    };

    return {
        attendeesUrl,
        activeAdminTab,
        firstTimeFilter,
        walkInFilter,
        paidFilter,
        colorFilter,
        minAgeFilter,
        maxAgeFilter,
        searchValue,
        setActiveAdminTab,
        setFirstTimeFilter,
        setWalkInFilter,
        setPaidFilter,
        setColorFilter,
        setAgeRangeFilter,
    };
};
