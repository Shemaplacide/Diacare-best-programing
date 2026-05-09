import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, totalElements, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, totalElements)

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] flex-wrap gap-2">
      <span className="text-xs text-[#64748B]">
        Showing {from}–{to} of {totalElements}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFB] transition cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#94A3B8]">…</span>
            : <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold border transition cursor-pointer
                  ${p === page
                    ? 'bg-[#0A4174] text-white border-[#0A4174]'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFB]'}`}
              >
                {p}
              </button>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFB] transition cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
