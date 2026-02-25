// Utility functions for event grouping and filtering

export function getEventsByDate(eventList: Array<any>): Record<string, Array<any>> {
    const groupedEvents: Record<string, Array<any>> = {};
    eventList.forEach((event) => {
        const dateKey = event.date; // Assuming date is already in YYYY-MM-DD format
        if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
        }
        groupedEvents[dateKey].push(event);
    });
    return groupedEvents;
}

export function getNextEventTime(eventList: Array<any>): string {
    const now = new Date();
    const upcomingEvents = eventList
        .filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && !event.is_finished;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingEvents.length === 0) {
        return 'No events';
    }

    const nextEvent = upcomingEvents[0];
    const eventDate = new Date(nextEvent.date);
    const daysUntil = Math.ceil(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil === 0) {
        return 'Today';
    } else if (daysUntil === 1) {
        return 'Tomorrow';
    } else if (daysUntil < 7) {
        return `${daysUntil}d`;
    } else {
        return `${Math.ceil(daysUntil / 7)}w`;
    }
}

export function getUpcomingThisWeek(eventList: Array<any>): Array<any> {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return eventList
        .filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= weekEnd && !event.is_finished;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
}
