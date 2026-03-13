interface FamilyColorDisplayProps {
  color: string | number | boolean | null | undefined;
  onEditClick: () => void;
}

const COLOR_MAP: Record<string, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#FBBF24',
};

export function FamilyColorDisplay({ color, onEditClick }: FamilyColorDisplayProps) {
  const colorValue = String(color ?? '').toLowerCase();
  const hexColor = COLOR_MAP[colorValue] || '#D1D5DB';
  
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded-full border border-sidebar-border/50 cursor-pointer hover:border-sidebar-border transition-colors"
        style={{ backgroundColor: hexColor }}
        onClick={onEditClick}
        title="Click to edit color"
      />
      <button
        type="button"
        onClick={onEditClick}
        className="rounded-md border border-sidebar-border/70 px-2 py-1 text-xs font-medium text-foreground hover:bg-sidebar/50"
      >
        Edit
      </button>
    </div>
  );
}
