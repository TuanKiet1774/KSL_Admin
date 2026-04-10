import React, { useState, useRef, useEffect } from 'react';
import Pagination from '../Pagination/Pagination';
import { ArrowUpDown, Clock, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import './DataTable.css';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  pagination = null,
  sortConfig = { sortBy: 'createdAt', sortOrder: 'desc' },
  onSortChange = () => { }
}) => {
  const [showSort, setShowSort] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSort(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (error) {
    return (
      <div className="empty-state" style={{ color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  const handleSort = (key, order) => {
    onSortChange({ sortBy: key, sortOrder: order });
    setShowSort(null);
  };

  const getSortLabel = (colKey) => {
    if (sortConfig.sortBy === 'createdAt') {
      return sortConfig.sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất';
    }
    if (sortConfig.sortBy === colKey) {
      return sortConfig.sortOrder === 'asc' ? 'A-Z' : 'Z-A';
    }
    return 'Mặc định';
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={{ width: column.width, textAlign: column.textAlign || 'center' }}>
                <div className="header-wrapper" style={{ justifyContent: column.textAlign === 'left' ? 'flex-start' : 'center' }}>
                  <span>{column.header}</span>
                  {column.sortable && (
                    <div className="header-sort" ref={index === 0 ? dropdownRef : null}>
                      <button 
                        className={`sort-trigger ${sortConfig.sortBy === column.sortKey || sortConfig.sortBy === 'createdAt' ? 'active' : ''}`}
                        onClick={() => setShowSort(showSort === index ? null : index)}
                      >
                        <ArrowUpDown size={14} />
                      </button>
                      
                      {showSort === index && (
                        <div className="sort-dropdown">
                          <button onClick={() => handleSort('createdAt', 'desc')} className={sortConfig.sortBy === 'createdAt' && sortConfig.sortOrder === 'desc' ? 'active' : ''}>
                            <Clock size={14} /> <span>Mới nhất (Thời gian ↓)</span>
                          </button>
                          <button onClick={() => handleSort('createdAt', 'asc')} className={sortConfig.sortBy === 'createdAt' && sortConfig.sortOrder === 'asc' ? 'active' : ''}>
                            <Clock size={14} /> <span>Cũ nhất (Thời gian ↑)</span>
                          </button>
                          <button onClick={() => handleSort(column.sortKey, 'asc')} className={sortConfig.sortBy === column.sortKey && sortConfig.sortOrder === 'asc' ? 'active' : ''}>
                            <SortAsc size={14} /> <span>Bảng chữ cái (A-Z)</span>
                          </button>
                          <button onClick={() => handleSort(column.sortKey, 'desc')} className={sortConfig.sortBy === column.sortKey && sortConfig.sortOrder === 'desc' ? 'active' : ''}>
                            <SortDesc size={14} /> <span>Bảng chữ cái (Z-A)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
          onPageChange={pagination.onPageChange || (() => { })}
        />
      ) || null}
    </div>
  );
};

export default DataTable;
