import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchUserByName, updateUser } from '../services/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function parseUser(payload) {
  const root = payload?.message ?? payload?.data ?? payload;
  if (root && typeof root === 'object' && !Array.isArray(root)) {
    if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
      return root.data;
    }
    if (root.message && typeof root.message === 'object' && !Array.isArray(root.message)) {
      return root.message;
    }
    return root;
  }
  return null;
}

export default function UserDetailPage() {
  const { userName } = useParams();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const authParams = useMemo(
    () => ({ token: auth?.token || null, sessionId: auth?.sessionId || null }),
    [auth?.token, auth?.sessionId],
  );

  const [initialData, setInitialData] = useState(null);
  const [formState, setFormState] = useState({
    name1: '',
    age: '',
    gender: '',
    react_js_assignment: '',
    company_name: '',
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      setIsLoading(true);
      setStatus({ type: null, message: '' });
      try {
        const response = await fetchUserByName(userName, authParams);
        if (!isMounted) return;
        const data = parseUser(response);

        if (!data) {
          setStatus({ type: 'error', message: 'User not found.' });
          return;
        }

        setInitialData(data);
        setFormState({
          name1: data.name1 || data.name || userName || '',
          age: data.age ?? '',
          gender: data.gender ?? '',
          react_js_assignment: data.react_js_assignment || data.react_assignment || '',
          company_name: data.company_name ?? '',
        });
      } catch (err) {
        if (!isMounted) return;
        setStatus({ type: 'error', message: err.message || 'Failed to load user.' });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (authParams.token || authParams.sessionId || auth?.successFlag) {
      loadUser();
    }
    return () => {
      isMounted = false;
    };
  }, [userName, authParams, auth?.successFlag]);

  const isDirty = useMemo(() => {
    if (!initialData) {
      return false;
    }
    return (
      formState.name1 !== (initialData.name1 || initialData.name || '') ||
      String(formState.age || '') !== String(initialData.age || '') ||
      (formState.gender || '') !== (initialData.gender || '') ||
      (formState.react_js_assignment || '') !==
        (initialData.react_js_assignment || initialData.react_assignment || '') ||
      (formState.company_name || '') !== (initialData.company_name || '')
    );
  }, [formState, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!authParams.token && !authParams.sessionId && !auth?.successFlag) {
      setStatus({ type: 'error', message: 'You must be logged in to perform this action.' });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, message: '' });
    try {
      const payload = {
        name1: formState.name1,
        age: formState.age,
        gender: formState.gender,
        react_js_assignment: formState.react_js_assignment,
        company_name: formState.company_name,
      };

      const response = await updateUser(userName, payload, authParams);
      const nextData = parseUser(response) || { ...initialData, ...payload };
      setInitialData(nextData);
      setFormState({
        name1: nextData.name1 || nextData.name || formState.name1,
        age: nextData.age ?? '',
        gender: nextData.gender ?? '',
        react_js_assignment: nextData.react_js_assignment || nextData.react_assignment || '',
        company_name: nextData.company_name ?? '',
      });
      setStatus({ type: 'success', message: 'User saved successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Could not save changes.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page page--centered">
        <p className="status-text">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <button className="button button--ghost" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <h1 className="header__title">{formState.name1 || userName}</h1>
          <p className="header__subtitle">Review and update user details.</p>
        </div>
        <button className="button" type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <form className="card card--form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">User Name</span>
            <input
              className="field__input"
              name="name1"
              value={formState.name1}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">User Age</span>
            <input
              className="field__input"
              name="age"
              type="number"
              value={formState.age}
              onChange={handleChange}
              min="0"
            />
          </label>

          <label className="field">
            <span className="field__label">User Gender</span>
            <select
              className="field__input"
              name="gender"
              value={formState.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="field field--full">
            <span className="field__label">React JS Assignment</span>
            <textarea
              className="field__input field__input--textarea"
              name="react_js_assignment"
              value={formState.react_js_assignment}
              onChange={handleChange}
              rows="4"
            />
          </label>

          <label className="field field--full">
            <span className="field__label">User Company Name</span>
            <input
              className="field__input"
              name="company_name"
              value={formState.company_name}
              onChange={handleChange}
            />
          </label>
        </div>

        {status.message && (
          <p
            className={`status-text ${status.type === 'error' ? 'status-text--error' : 'status-text--success'}`}
            role={status.type === 'error' ? 'alert' : 'status'}
          >
            {status.message}
          </p>
        )}

        <div className="actions">
          <Link className="button button--ghost" to="/users">
            Cancel
          </Link>
          <button className="button button--primary" type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
