import { BUTTON_STYLES } from '@/pages/events/constants/attendee-constants';

interface StatusBadgeProps {
  type: 'paid' | 'walkIn' | 'attendance';
  value: boolean | string | null | undefined;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function StatusBadge({
  type,
  value,
  onClick,
  disabled = false,
  children,
}: StatusBadgeProps) {
  if (type === 'paid') {
    const isPaid = value === true;
    const className = isPaid ? BUTTON_STYLES.statusPaid : BUTTON_STYLES.statusUnpaid;
    const content = isPaid ? 'Paid' : 'Unpaid';

    return onClick ? (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    ) : (
      <span className={className}>{content}</span>
    );
  }

  if (type === 'walkIn') {
    const isWalkIn = value === true;
    const className = isWalkIn ? BUTTON_STYLES.walkInTrue : BUTTON_STYLES.walkInFalse;
    const content = isWalkIn ? 'Walk-in' : 'Regular';

    return <span className={className}>{content}</span>;
  }

  if (type === 'attendance') {
    const isAttended = value === true;
    const baseClass = isAttended
      ? BUTTON_STYLES.attendanceActive
      : BUTTON_STYLES.attendanceInactive;

    if (disabled) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-500 cursor-not-allowed">
          {children}
        </span>
      );
    }

    return (
      <button type="button" onClick={onClick} className={baseClass}>
        {children}
      </button>
    );
  }

  return null;
}
