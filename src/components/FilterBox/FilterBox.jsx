import React from 'react';
import { Filter } from 'lucide-react';
import './FilterBox.css';

const FilterBox = ({ 
    value, 
    onChange, 
    options = [], 
    placeholder = "Lọc theo...", 
    icon : Icon = Filter,
    className = "" 
}) => {
    return (
        <div className={`filter-box-container ${className}`}>
            <div className="filter-box-wrapper">
                <Icon className="filter-box-icon" size={18} />
                <select 
                    className="filter-box-select"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="all">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterBox;
