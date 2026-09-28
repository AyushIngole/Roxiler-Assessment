export default function SortableTable({ columns, rows, sortBy, sortOrder, onSort, renderRow }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => col.sortable !== false && onSort(col.key)}
              className={col.sortable === false ? '' : 'sortable'}
            >
              {col.label}
              {sortBy === col.key ? (sortOrder === 'ASC' ? ' ▲' : ' ▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="empty-cell">
              No records found
            </td>
          </tr>
        ) : (
          rows.map(renderRow)
        )}
      </tbody>
    </table>
  );
}
