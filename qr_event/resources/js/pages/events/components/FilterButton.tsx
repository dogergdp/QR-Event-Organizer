import { BUTTON_STYLES } from '@/pages/events/constants/attendee-constants';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={isActive ? BUTTON_STYLES.filterActive : BUTTON_STYLES.filterInactive}
    >
      {label}
    </button>
  );
}
