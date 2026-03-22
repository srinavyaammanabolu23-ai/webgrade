import { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      onSearch(trimmed);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search products, medicines, food... (e.g. paracetamol 500mg, nutella)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          id="search-input"
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="search-submit"
          disabled={isLoading || query.trim().length < 2}
          id="search-submit"
        >
          {isLoading ? (
            <span className="search-spinner" />
          ) : (
            'Search'
          )}
        </button>
      </div>
    </form>
  );
}
