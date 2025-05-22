import React from "react";

export default function DataTable({
  data,
  columns,
  isLoading,
  onSearch,
  totalPages,
  onPageChange,
  page = 1,
}) {
  return (
    <div className="overflow-x-auto">
      {/* Optional Search Input */}
      {onSearch && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
            className="px-4 py-2 border rounded"
          />
        </div>
      )}

      <table className="min-w-full border">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="text-left px-4 py-2 border-b">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                No data available.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={item.id || rowIndex}>
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column.key}`} className="border px-4 py-2">
                    {item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
