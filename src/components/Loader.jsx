function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader-spinner" />
      <p>{message}</p>
    </div>
  );
}

export default Loader;
