'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Пагинация"
      className="flex items-center justify-between"
    >
      <p className="text-sm text-slate-500">
        Показано {from}-{to} из {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Предыдущая страница"
          className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-50"
        >
          ←
        </button>
        {getVisiblePages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Страница ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`rounded px-3 py-1 text-sm ${
              p === page
                ? 'bg-slate-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Следующая страница"
          className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-50"
        >
          →
        </button>
      </div>
    </nav>
  );
}
