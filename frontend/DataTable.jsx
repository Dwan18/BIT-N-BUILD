// Reusable table. columns: [{ key, header, render?(row), className?, hideBelow? ('sm'|'md'|'lg') }]
const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' };

export default function DataTable({ columns, rows, rowKey = '_id', onRowClick, empty = 'Nothing to show yet.' }) {
  if (!rows?.length) return <p className="p-6 text-center text-sm text-slate-400">{empty}</p>;

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-700/70 text-xs text-slate-400">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-5 py-2.5 font-medium ${c.hideBelow ? HIDE[c.hideBelow] : ''} ${c.className || ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700/50">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer transition-colors hover:bg-ink-700/40' : ''}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-5 py-3 align-middle ${c.hideBelow ? HIDE[c.hideBelow] : ''} ${c.className || ''}`}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
