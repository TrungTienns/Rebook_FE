import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CustomSearchableDropdown.scss';

// Custom Dropdown for Cartoon UI with Search
export default function CustomSearchableDropdown({ value, options, onChange, placeholder, icon, searchable = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedOption = options.find(opt => String(opt.value) === String(value)) || { label: placeholder, value: '' };
  
  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className="custom-searchable-dropdown">
      <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
        {icon && <i className={icon}></i>}
        <span>{selectedOption.label}</span>
        <i className={`fa-solid fa-chevron-down toggle-icon ${isOpen ? 'open' : ''}`}></i>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {searchable && (
              <div className="search-input-wrapper">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div 
              className="options-list" 
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div 
                    key={opt.value} 
                    className={`dropdown-item ${String(opt.value) === String(value) ? 'active' : ''}`}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="dropdown-item no-results">Không tìm thấy kết quả</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
