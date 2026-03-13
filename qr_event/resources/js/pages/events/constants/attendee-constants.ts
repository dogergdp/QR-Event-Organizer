export const FILTER_OPTIONS = {
  all: 'all',
  yes: 'yes',
  no: 'no',
} as const;

export const COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
} as const;

export const COLOR_LABELS = {
  [COLORS.RED]: 'Red',
  [COLORS.BLUE]: 'Blue',
  [COLORS.GREEN]: 'Green',
  [COLORS.YELLOW]: 'Yellow',
} as const;

export const ADMIN_TABS = {
  RSVP: 'rsvp',
  ATTENDANCE: 'attendance',
} as const;

export const BUTTON_STYLES = {
  filterActive:
    'rounded px-2.5 py-1 text-xs font-medium transition-colors bg-muted text-foreground',
  filterInactive:
    'rounded px-2.5 py-1 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground',
  statusActive:
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200',
  statusPaid:
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200',
  statusUnpaid:
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200',
  walkInTrue:
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800',
  walkInFalse:
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800',
  attendanceActive:
    'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors border-sidebar-border/70 text-green-600 hover:text-green-700',
  attendanceInactive:
    'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors border-sidebar-border/70 text-gray-600 hover:text-gray-700',
} as const;
