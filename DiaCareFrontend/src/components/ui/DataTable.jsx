import { useState, useEffect, useRef } from 'react'
import { MoreHorizontal } from 'lucide-react'
import Pagination from './Pagination'

const MOBILE_BP = 768

export default function DataTable({
  columns, rows, total, emptyMsg = 'No data found',
  sortKey, sortDir, onSort,
  page, totalPages, totalElements, pageSize, onPageChange,
  cardRender, rowActions,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BP)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const hasPagination = totalPages != null && onPageChange != null

  // Enforce max 5 visible columns — rest hidden in actions
  const visibleCols = columns.slice(0, 5)

  return (
    <div style={wrapStyle}>
      {isMobile
        ? <CardView rows={rows} emptyMsg={emptyMsg} cardRender={cardRender} columns={visibleCols} rowActions={rowActions} />
        : <TableView columns={visibleCols} rows={rows} emptyMsg={emptyMsg} sortKey={sortKey} sortDir={sortDir} onSort={onSort} rowActions={rowActions} />
      }
      {hasPagination
        ? <Pagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={onPageChange} />
        : <div style={footerStyle}>Showing {rows.length} of {total ?? rows.length}</div>
      }
    </div>
  )
}

// ── Desktop table ──────────────────────────────────────────────────────────
function TableView({ columns, rows, emptyMsg, sortKey, sortDir, onSort, rowActions }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
            {columns.map(col => (
              <th key={col.label} onClick={() => col.key && onSort?.(col.key)} style={thStyle(!!col.key && !!onSort)}>
                {col.label}
                {col.key && sortKey === col.key && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
            ))}
            {rowActions && <th style={thStyle(false)}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + (rowActions ? 1 : 0)} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{emptyMsg}</td></tr>
          ) : rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => row._onClick?.()}
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: i % 2 !== 0 ? 'var(--color-bg-subtle)' : 'transparent',
                cursor: row._onClick ? 'pointer' : 'default',
              }}
              className="hover:bg-[#EFF6F8] transition-colors"
            >
              {columns.map(col => (
                <td key={col.label} style={tdStyle}>
                  {col.render ? col.render(col.key ? row[col.key] : null, row) : row[col.key]}
                </td>
              ))}
              {rowActions && (
                <td style={{ ...tdStyle, width: 48 }} onClick={e => e.stopPropagation()}>
                  <RowActionsMenu actions={rowActions(row)} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Row actions popover ────────────────────────────────────────────────────
function RowActionsMenu({ actions }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!actions?.length) return null

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-center w-7 h-7 rounded-md border border-[#E2E8F0] bg-white hover:bg-[#F8FAFB] text-[#64748B] transition cursor-pointer"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false) }}
              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-left bg-transparent border-0 cursor-pointer hover:bg-[#F8FAFB] transition whitespace-nowrap
                ${action.danger ? 'text-[#DC2626]' : 'text-[#1E293B]'}`}
            >
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Mobile cards ───────────────────────────────────────────────────────────
function CardView({ rows, emptyMsg, cardRender, columns, rowActions }) {
  if (rows.length === 0)
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{emptyMsg}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem' }}>
      {rows.map((row, i) =>
        cardRender
          ? <div key={row.id ?? i}>{cardRender(row)}</div>
          : <GenericCard key={row.id ?? i} row={row} columns={columns} rowActions={rowActions} />
      )}
    </div>
  )
}

// ── Generic fallback card ──────────────────────────────────────────────────
function GenericCard({ row, columns, rowActions }) {
  const primaryCol = columns[0]
  const restCols   = columns.slice(1)
  const actions    = rowActions?.(row)

  return (
    <div
      onClick={() => row._onClick?.()}
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px #0000000a', cursor: row._onClick ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', flex: 1, minWidth: 0 }}>
          {primaryCol?.render ? primaryCol.render(primaryCol.key ? row[primaryCol.key] : null, row) : row[primaryCol?.key]}
        </div>
        {actions?.length > 0 && (
          <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
            <RowActionsMenu actions={actions} />
          </div>
        )}
      </div>
      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {restCols.map((col, i) => (
          <div key={col.label} style={{ padding: '0.65rem 1rem', borderBottom: i < restCols.length - 2 ? '1px solid var(--color-border)' : 'none', borderRight: i % 2 === 0 ? '1px solid var(--color-border)' : 'none' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{col.label}</p>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {col.render ? col.render(col.key ? row[col.key] : null, row) : (row[col.key] ?? '—')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const wrapStyle   = { backgroundColor: 'var(--color-surface)', borderRadius: '10px', border: '1px solid var(--color-border)', overflow: 'hidden' }
const footerStyle = { padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }
const thStyle     = (sortable) => ({ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', cursor: sortable ? 'pointer' : 'default', userSelect: 'none' })
const tdStyle     = { padding: '0.75rem 1rem', color: 'var(--color-text-muted)', verticalAlign: 'middle' }
