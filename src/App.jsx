import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Sidebar from './components/Sidebar';
import NotificationList from './components/NotificationList';
import { useAppContext } from './context/AppContext';

function App() {
  const {
    state,
    initialize,
    logout,
    toggleTheme,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    undoLastAction,
    dismissToast
  } = useAppContext();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.body.setAttribute('data-theme', state.theme || 'light');
  }, [state.theme]);

  const showShell = state.session.loggedIn && location.pathname !== '/login';

  const currentUserLabel = useMemo(() => {
    const user = state.users.find((item) => item.id === state.session.userId);
    return user ? `${user.name} (${state.session.role})` : state.session.role;
  }, [state.session.role, state.session.userId, state.users]);

  const completion = useMemo(() => {
    const total = state.tasks.length;
    if (total === 0) {
      return 0;
    }
    const completed = state.tasks.filter((task) => task.status === 'Completed').length;
    return Math.round((completed / total) * 100);
  }, [state.tasks]);

  const completionTone = completion <= 30 ? 'low' : completion <= 70 ? 'medium' : 'high';
  const layoutClassName = showShell ? 'portal-layout' : 'portal-layout portal-layout-auth';
  const mainClassName = showShell ? 'portal-main' : 'portal-main portal-main-auth';
  const unreadCount = useMemo(
    () => state.notifications.filter((item) => !item.read).length,
    [state.notifications]
  );

  return (
    <div className={layoutClassName}>
      {showShell ? (
        <Sidebar
          users={state.users}
          session={state.session}
          onLogout={logout}
          onToggleTheme={toggleTheme}
          theme={state.theme}
          notificationCount={unreadCount}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((prev) => !prev)}
        />
      ) : null}

      <main className={mainClassName}>
        {showShell ? <div className="top-banner">Active: {currentUserLabel}</div> : null}
        {showShell ? (
          <section className="global-progress-block" aria-label="Global progress">
            <div className="progress-head">
              <strong>Overall Task Progress</strong>
              <span>{completion}%</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Overall progress ${completion}%`}
            >
              <div className={`progress-fill ${completionTone}`} style={{ width: `${completion}%` }} />
            </div>
          </section>
        ) : null}
        <AppRoutes />
      </main>

      <NotificationList
        items={state.notifications}
        toast={state.toast}
        open={showShell && notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onRemove={removeNotification}
        onUndo={undoLastAction}
        onDismissToast={dismissToast}
      />
    </div>
  );
}

export default App;
