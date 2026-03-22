import React from 'react';
import Pagination from '../Pagination/Pagination';
import './DataTable.css';

const DataTable = ({ 
  columns = [], 
  data = [], 
  loading = false, 
  error = null, 
  pagination = null 
}) => {
  if (error) {
    return (
      <div className="empty-state" style={{ color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={{ width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <tr key={`skeleton-${index}`} className="skeleton-row">
                {columns.map((_, colIndex) => (
                  <td key={`skeleton-col-${colIndex}`}>
                    <div className="skeleton-line"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : row[column.key] || "N/A"
                    }
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty-state">
                Không có dữ liệu hiển thị.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination 
          total={pagination.total} 
          pageSize={pagination.pageSize || 10}
          currentPage={pagination.currentPage}
          onPageChange={pagination.onPageChange || (() => {})}
        />
      ) || null}
    </div>
  );
};

export default DataTable;
