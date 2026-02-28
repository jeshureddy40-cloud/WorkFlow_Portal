// Error display component
export const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p className="error-message">{error || 'An unexpected error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      )}
    </div>
  );
};
