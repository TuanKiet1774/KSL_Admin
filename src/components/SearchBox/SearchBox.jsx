import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBox.css';

const SearchBox = ({ value, onChange, placeholder = "Tìm kiếm...", className = "" }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`search-box-container ${className}`}>
      <div className={`search-box ${value ? 'has-value' : ''}`}>
        <Search className="search-box-icon" size={18} />
        <input
          type="text"
          className="search-box-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button 
            className="search-box-clear" 
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
