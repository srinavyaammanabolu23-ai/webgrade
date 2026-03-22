import './ErrorState.css';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state fade-in">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button className="error-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
