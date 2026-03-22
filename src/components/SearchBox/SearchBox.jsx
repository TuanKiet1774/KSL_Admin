import React from 'react';
import { Search } from 'lucide-react';
import './SearchBox.css';

const SearchBox = ({ value, onChange, placeholder = "Tìm kiếm...", className = "" }) => {
  return (
    <div className={`search-box ${className}`}>
      <input
        type="text"
        className="search-box-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Search className="search-box-icon" size={18} />
    </div>
  );
};

export default SearchBox;
