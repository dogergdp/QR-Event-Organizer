import { FilterButton } from './FilterButton';
import { COLORS, COLOR_LABELS } from '@/pages/events/constants/attendee-constants';

type FilterOption = 'all' | 'yes' | 'no';

interface FilterControlsProps {
  firstTimeFilter: FilterOption;
  walkInFilter: FilterOption;
  paidFilter: FilterOption;
  colorFilter: string;
  minAgeFilter: number;
  maxAgeFilter: number;
  onFirstTimeChange: (value: FilterOption) => void;
  onWalkInChange: (value: FilterOption) => void;
  onPaidChange: (value: FilterOption) => void;
  onColorChange: (value: string) => void;
  onAgeRangeChange: (min: number, max: number) => void;
  onExportCSV: () => void;
  onResetFilters: () => void;
}

export function FilterControls({
  firstTimeFilter,
  walkInFilter,
  paidFilter,
  colorFilter,
  minAgeFilter,
  maxAgeFilter,
  onFirstTimeChange,
  onWalkInChange,
  onPaidChange,
  onColorChange,
  onAgeRangeChange,
  onExportCSV,
  onResetFilters,
}: FilterControlsProps) {
  return (
    <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-sidebar p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* First Time Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">First time:</span>
          <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
            <FilterButton
              label="All"
              isActive={firstTimeFilter === 'all'}
              onClick={() => onFirstTimeChange('all')}
            />
            <FilterButton
              label="Yes"
              isActive={firstTimeFilter === 'yes'}
              onClick={() => onFirstTimeChange('yes')}
            />
            <FilterButton
              label="No"
              isActive={firstTimeFilter === 'no'}
              onClick={() => onFirstTimeChange('no')}
            />
          </div>
        </div>

        {/* Walk-in Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Walk-in:</span>
          <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
            <FilterButton
              label="All"
              isActive={walkInFilter === 'all'}
              onClick={() => onWalkInChange('all')}
            />
            <FilterButton
              label="Yes"
              isActive={walkInFilter === 'yes'}
              onClick={() => onWalkInChange('yes')}
            />
            <FilterButton
              label="No"
              isActive={walkInFilter === 'no'}
              onClick={() => onWalkInChange('no')}
            />
          </div>
        </div>

        {/* Paid Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Paid:</span>
          <div className="inline-flex rounded-md border border-sidebar-border/70 bg-background p-1">
            <FilterButton
              label="All"
              isActive={paidFilter === 'all'}
              onClick={() => onPaidChange('all')}
            />
            <FilterButton
              label="Yes"
              isActive={paidFilter === 'yes'}
              onClick={() => onPaidChange('yes')}
            />
            <FilterButton
              label="No"
              isActive={paidFilter === 'no'}
              onClick={() => onPaidChange('no')}
            />
          </div>
        </div>

        {/* Color Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Family Color:</span>
          <select
            value={colorFilter}
            onChange={(e) => onColorChange(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value="all">All Colors</option>
            {Object.entries(COLOR_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Age Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Age Range:</span>
          <input
            type="number"
            min="0"
            max="150"
            value={minAgeFilter}
            onChange={(e) => onAgeRangeChange(Number(e.target.value), maxAgeFilter)}
            placeholder="Min"
            className="h-7 w-16 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="number"
            min="0"
            max="150"
            value={maxAgeFilter}
            onChange={(e) => onAgeRangeChange(minAgeFilter, Number(e.target.value))}
            placeholder="Max"
            className="h-7 w-16 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
          />
        </div>

        {/* Export and Reset Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            title="Export to CSV"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
