import { Search, SlidersHorizontal } from 'lucide-react'

export default function FilterBar({ search, onSearch, placeholder, filters, activeFilter, onFilter }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white outline-none focus:border-[#0A4174] transition"
        />
      </div>

      {/* Filter pills — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <SlidersHorizontal size={15} className="text-[#94A3B8] shrink-0" />
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => onFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer whitespace-nowrap shrink-0
              ${activeFilter === f.value
                ? 'bg-[#0A4174] text-white border-[#0A4174]'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFB]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
