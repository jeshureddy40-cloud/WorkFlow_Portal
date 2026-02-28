import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M3 4.5 21 19.5M10.6 6.2A10 10 0 0 1 12 6c6.7 0 10.5 6 10.5 6a18 18 0 0 1-4.2 4.8M8.3 8.4A14.5 14.5 0 0 0 1.5 12s3.8 7 10.5 7c1.3 0 2.5-.2 3.6-.6M10.1 10.2a3.2 3.2 0 0 0 3.7 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginPage() {
  const { state, login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  if (state.session.loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const submitLogin = (event) => {
    event.preventDefault();
    setError('');
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Username and password are required.');
      return;
    }
    const result = login({
      username: credentials.username,
      password: credentials.password
    });
    if (!result.ok) {
      setError(result.message);
    }
  };

  return (
    <section className="login-screen">
      <div className="login-shell">
        <aside className="login-panel" aria-hidden="true">
          <p className="login-badge">Workflow Suite</p>
          <h2>Task Workflow Portal</h2>
          <p>Manage assignments, track deadlines, and keep project delivery on schedule.</p>
          <ul className="login-points">
            <li>Real-time Kanban workflow</li>
            <li>Deadline and calendar tracking</li>
            <li>Manager and employee dashboards</li>
          </ul>
        </aside>

        <form className="login-card login-form" onSubmit={submitLogin}>
          <header className="login-header">
            <h1>Sign In</h1>
            <p className="login-subtitle">Use your assigned username and password</p>
          </header>

          <div className="login-fields">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials((prev) => ({
                    ...prev,
                    username: event.target.value
                  }))
                }
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: event.target.value
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
          </div>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="primary-btn login-submit">
            Enter Workspace
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
