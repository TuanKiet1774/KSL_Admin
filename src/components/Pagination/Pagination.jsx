import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ 
  total = 0, 
  pageSize = 10, 
  currentPage = 1, 
  onPageChange,
  showInfo = true
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="pagination-container">
      {showInfo && (
        <div className="pagination-info">
          Hiển thị <strong>{Math.min(pageSize, total)}</strong> trên tổng số <strong>{total}</strong> bản ghi
        </div>
      )}
      
      <div className="pagination-actions">
        <button 
          className="pagination-btn" 
          onClick={handlePrev} 
          disabled={currentPage === 1}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="page-numbers">
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                type="button"
              >
                {page}
              </button>
            );
          })}
        </div>

        <button 
          className="pagination-btn" 
          onClick={handleNext} 
          disabled={currentPage === totalPages}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
