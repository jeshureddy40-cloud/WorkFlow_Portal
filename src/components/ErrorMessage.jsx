function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-wrap" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="secondary-btn" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export default ErrorMessage;
