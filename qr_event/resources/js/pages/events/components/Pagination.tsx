interface PaginationLink {
  label: string;
  url: string | null;
  active: boolean;
}

interface PaginationProps {
  from: number;
  to: number;
  total: number;
  links: PaginationLink[];
}

export function Pagination({ from, to, total, links }: PaginationProps) {
  const formatLabel = (label: string): string => {
    return label.replace(/&laquo;|&raquo;/g, (match: string) => {
      return match === '&laquo;' ? '«' : '»';
    });
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        Showing {from ?? 0} to {to ?? 0} of{' '}
        <span className="font-semibold text-foreground">{total}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {links.map((link: PaginationLink, index: number) => {
          const isDisabled = !link.url;
          const label = formatLabel(link.label);

          if (isDisabled) {
            return (
              <span
                key={`${link.label}-${index}`}
                className="cursor-not-allowed rounded-md border border-sidebar-border/70 px-3 py-1 text-sm font-medium text-muted-foreground opacity-50"
              >
                {label}
              </span>
            );
          }

          return (
            <button
              key={`${link.label}-${index}`}
              onClick={() => {
                window.location.href = link.url as string;
              }}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                link.active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-sidebar-border/70 text-foreground hover:bg-sidebar/50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
