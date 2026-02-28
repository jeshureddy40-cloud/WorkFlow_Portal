// Loading indicator component
export const LoadingState = ({ message = 'Loading tasks...' }) => {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};
