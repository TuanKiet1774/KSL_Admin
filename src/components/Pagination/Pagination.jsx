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

  const handlePageChange = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  return (
    <div className="pagination-container">
      <div style={{ flex: 1 }}></div>
      
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
          {(() => {
            const range = [];
            const delta = 2; // Number of pages to show before and after current page
            
            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - delta && i <= currentPage + delta)
              ) {
                range.push(i);
              } else if (
                i === currentPage - delta - 1 || 
                i === currentPage + delta + 1
              ) {
                range.push('...');
              }
            }

            return range.map((page, index) => {
              if (page === '...') {
                return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
              }
              return (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  type="button"
                >
                  {page}
                </button>
              );
            });
          })()}
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
