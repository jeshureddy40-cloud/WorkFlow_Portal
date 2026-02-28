function NotificationList({
  items,
  toast,
  open,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onRemove,
  onUndo,
  onDismissToast
}) {
  return (
    <>
      {open ? (
        <aside className="notification-panel" aria-label="Notifications center">
          <header className="notification-panel-head">
            <h3>Notifications</h3>
            <div className="notification-panel-actions">
              <button type="button" className="secondary-btn" onClick={onMarkAllRead}>
                Mark all read
              </button>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close notifications">
                x
              </button>
            </div>
          </header>

          <div className="notification-panel-list">
            {items.length === 0 ? <p className="small muted">No notifications yet.</p> : null}
            {items.map((item) => (
              <article
                key={item.id}
                className={`notification-row ${item.read ? 'read' : 'unread'} ${item.type || 'info'}`}
              >
                <p>{item.message}</p>
                <div className="notification-row-actions">
                  {!item.read ? (
                    <button type="button" className="secondary-btn" onClick={() => onMarkRead(item.id)}>
                      Read
                    </button>
                  ) : null}
                  <button type="button" className="danger-btn" onClick={() => onRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </aside>
      ) : null}

      {toast ? (
        <div className="notification-toast-wrap" aria-live="polite" aria-label="Latest notification">
          <div className="notification info">
            <span>{toast.message}</span>
            <div className="toast-actions">
              {toast.undoable ? (
                <button type="button" className="secondary-btn" onClick={onUndo}>
                  Undo
                </button>
              ) : null}
              <button type="button" className="icon-btn" onClick={onDismissToast} aria-label="Dismiss">
                x
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default NotificationList;
