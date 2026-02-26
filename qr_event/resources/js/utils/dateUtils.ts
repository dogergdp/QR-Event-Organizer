// Utility functions for date and time formatting





export function formatDateTime12Hour(dateTimeString: string | null): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatTime12Hour(time: string | null): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}


export function calculateAge(birthdate: string | null): string {
    if (!birthdate) return 'N/A';

    const match = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return 'N/A';

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return 'N/A';

    const today = new Date();
    let age = today.getFullYear() - year;

    const hasHadBirthdayThisYear =
        today.getMonth() + 1 > month ||
        (today.getMonth() + 1 === month && today.getDate() >= day);

    if (!hasHadBirthdayThisYear) {
        age -= 1;
    }

    return age >= 0 && age <= 130 ? age.toString() : 'N/A';
}


export function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Previous month's days (grayed out)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push(new Date(year, month, -i));
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
    }

    // Next month's days (grayed out)
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
        days.push(new Date(year, month + 1, day));
    }

    return days;
}

export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
