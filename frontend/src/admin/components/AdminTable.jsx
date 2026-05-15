export function AdminTable({
  columns,
  rows = [],
  keyField = "id",
  emptyMessage = "No records found.",
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#eadcc0]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#eadcc0] text-left text-sm">
          <thead className="bg-[#fff8eb] text-stone-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2e8d4] bg-white text-stone-700">
            {rows.length ? (
              rows.map((row) => (
                <tr key={row[keyField]}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4 align-top">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-stone-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
