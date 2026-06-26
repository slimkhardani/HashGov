import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import "./search-input.css";

const SearchInput = ({ 
  placeholder = "Search in this page...", 
  onSearch, 
  className = "" 
}) => {
  const [query, setQuery] = useState("");

  // Use debounce to avoid excessive search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Clear search input
  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className={`search-input-container ${className}`}>
      <Search size={18} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button 
          className="search-clear-button" 
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
