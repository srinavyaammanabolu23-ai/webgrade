import './SuggestionsPanel.css';

export default function SuggestionsPanel({ suggestions = [], query = '', onSuggestionClick, onForceSearch }) {
  if (!suggestions || suggestions.length === 0) return null;

  const handleClick = (suggestion) => {
    // Extract the quoted search term from "Try: ..." format
    const match = suggestion.match(/"([^"]+)"/);
    if (match) {
      onSuggestionClick(match[1]);
    } else {
      // Handle plain text suggestions
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div className="suggestions-panel fade-in">
      <div className="suggestions-header">
        <div className="suggestions-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div>
          <h3 className="suggestions-title">Refine your search</h3>
          <p className="suggestions-subtitle">
            "{query}" could match many products. Try being more specific:
          </p>
        </div>
      </div>
      <div className="suggestions-list">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => handleClick(s)}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            {s}
          </button>
        ))}
      </div>
      {onForceSearch && (
        <button className="suggestion-force-btn" onClick={onForceSearch}>
          Search "{query}" anyway →
        </button>
      )}
    </div>
  );
}
