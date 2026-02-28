import { useMemo, useState } from 'react';

const MODES = {
  SIGN_IN: 'sign-in',
  CREATE_ACCOUNT: 'create-account'
};

const CAPTCHA_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const CAPTCHA_LENGTH = 6;

const createCaptcha = () => {
  let text = '';
  for (let index = 0; index < CAPTCHA_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARSET.length);
    text += CAPTCHA_CHARSET[randomIndex];
  }
  return {
    text
  };
};

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

function LoginPage({ onLogin, onRegister, isLoading, error, message }) {
  const [mode, setMode] = useState(MODES.SIGN_IN);
  const [captcha, setCaptcha] = useState(() => createCaptcha());
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    confirmPassword: '',
    captchaInput: ''
  });

  const headingText = useMemo(() => {
    return mode === MODES.SIGN_IN ? '' : 'Create your account';
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetCaptcha = () => {
    setCaptcha(createCaptcha());
    setFormData((prev) => ({
      ...prev,
      captchaInput: ''
    }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setLocalError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    resetCaptcha();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    if (formData.captchaInput.trim().toLowerCase() !== captcha.text.toLowerCase()) {
      setLocalError('Captcha is incorrect. Please try again.');
      resetCaptcha();
      return;
    }

    if (mode === MODES.SIGN_IN) {
      await onLogin({
        username: formData.username,
        password: formData.password
      });
      resetCaptcha();
      return;
    }

    if (!formData.displayName.trim()) {
      setLocalError('Display name is required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const created = await onRegister({
      displayName: formData.displayName,
      username: formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    resetCaptcha();
    if (created) {
      setMode(MODES.SIGN_IN);
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    }
  };

  return (
    <div className="login-screen">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Task Workflow Portal</h1>
        {headingText && <p className="login-subtitle">{headingText}</p>}

        <div className="login-mode-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            className={`auth-tab ${mode === MODES.SIGN_IN ? 'active' : ''}`}
            aria-selected={mode === MODES.SIGN_IN}
            onClick={() => handleModeChange(MODES.SIGN_IN)}
            disabled={isLoading}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            className={`auth-tab ${mode === MODES.CREATE_ACCOUNT ? 'active' : ''}`}
            aria-selected={mode === MODES.CREATE_ACCOUNT}
            onClick={() => handleModeChange(MODES.CREATE_ACCOUNT)}
            disabled={isLoading}
          >
            Create Account
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === MODES.CREATE_ACCOUNT && (
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                autoComplete="name"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                autoComplete={mode === MODES.SIGN_IN ? 'current-password' : 'new-password'}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {mode === MODES.CREATE_ACCOUNT && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          <div className="captcha-row">
            <div className="captcha-question" aria-label="Captcha challenge">
              {captcha.text}
            </div>
            <button
              type="button"
              className="captcha-refresh"
              onClick={resetCaptcha}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="captchaInput">Captcha</label>
            <input
              id="captchaInput"
              name="captchaInput"
              type="text"
              value={formData.captchaInput}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          {(localError || error) && <p className="login-error">{localError || error}</p>}
          {message && <p className="login-success">{message}</p>}

          <button className="btn-primary login-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : mode === MODES.SIGN_IN ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
