import { NavLink } from 'react-router-dom';

function Sidebar({
  users,
  session,
  onLogout,
  onToggleTheme,
  theme,
  notificationCount,
  notificationsOpen,
  onToggleNotifications
}) {
  const activeUser = users.find((user) => user.id === session.userId);
  const avatarSrc = activeUser?.avatarDataUrl
    ? activeUser.avatarDataUrl
    : activeUser?.githubUsername
      ? `https://github.com/${activeUser.githubUsername}.png`
      : '';

  return (
    <aside className="sidebar">
      <h2>Workflow Portal</h2>

      <div className="sidebar-user">
        {avatarSrc ? (
          <img src={avatarSrc} alt={`${activeUser?.name || 'User'} avatar`} className="sidebar-avatar" />
        ) : (
          <div className="sidebar-avatar sidebar-avatar-fallback" aria-hidden="true">
            {activeUser?.name?.charAt(0) || 'U'}
          </div>
        )}
        <p className="muted">
          {activeUser ? activeUser.name : 'User'} ({session.role})
        </p>
      </div>

      <div className="sidebar-tools">
        <button
          type="button"
          className={`notification-bell ${notificationsOpen ? 'active' : ''}`}
          aria-label={`Notifications ${notificationCount}`}
          onClick={onToggleNotifications}
        >
          <span className="bell-icon" aria-hidden="true">
            Bell
          </span>
          <span className="bell-count">{notificationCount}</span>
        </button>
        <button type="button" className="ghost-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'side-link active' : 'side-link')}>
          Dashboard
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'side-link active' : 'side-link')}>
          Analytics
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'side-link active' : 'side-link')}>
          Profile
        </NavLink>
      </nav>

      <button type="button" className="ghost-btn" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
