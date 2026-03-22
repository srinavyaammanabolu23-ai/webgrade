import './SuggestionsPanel.css';

export default function SuggestionsPanel({ suggestions = [], query = '', onSuggestionClick }) {
  if (!suggestions || suggestions.length === 0) return null;

  const handleClick = (suggestion) => {
    // Extract the quoted search term from "Try: ..." format
    const match = suggestion.match(/"([^"]+)"/);
    if (match) {
      onSuggestionClick(match[1]);
    }
  };

  return (
    <div className="suggestions-panel fade-in">
      <div className="suggestions-icon">💡</div>
      <div className="suggestions-content">
        <h3 className="suggestions-title">Your search is too broad</h3>
        <p className="suggestions-subtitle">
          "{query}" returned too many possible matches. Try a more specific search:
        </p>
        <div className="suggestions-list">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => handleClick(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
