import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [formState, setFormState] = useState({ email: 'administrator', password: 'Anand' });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/users', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const email = formState.email.trim();
    const password = formState.password.trim();

    if (!email || !password) {
      setFormError('Both email and password are required.');
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setFormError(result.error?.message || 'Unable to login. Please try again.');
    }
  };

  return (
    <div className="page page--centered">
      <form className="card card--auth" onSubmit={handleSubmit}>
        <h1 className="card__title">Welcome Back</h1>
        <p className="card__subtitle">Log in to manage the assignment users.</p>

        <label className="field">
          <span className="field__label">User Email ID</span>
          <input
            className="field__input"
            type="text"
            name="email"
            autoComplete="username"
            value={formState.email}
            onChange={handleChange}
            placeholder="administrator"
            disabled={isLoading}
          />
        </label>

        <label className="field">
          <span className="field__label">User Password</span>
          <input
            className="field__input"
            type="password"
            name="password"
            autoComplete="current-password"
            value={formState.password}
            onChange={handleChange}
            placeholder="******"
            disabled={isLoading}
          />
        </label>

        {(formError || error) && (
          <p className="form-error" role="alert">
            {formError || error}
          </p>
        )}

        <button className="button button--primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
