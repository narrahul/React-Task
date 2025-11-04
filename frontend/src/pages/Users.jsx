import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUsers } from '../services/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function parseUsers(payload) {
  const root = payload?.message ?? payload?.data ?? payload;
  if (Array.isArray(root)) {
    return root;
  }
  if (Array.isArray(root?.data)) {
    return root.data;
  }
  if (Array.isArray(root?.message)) {
    return root.message;
  }
  return [];
}

export default function UsersPage() {
  const { auth, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const authParams = useMemo(
    () => ({ token: auth?.token || null, sessionId: auth?.sessionId || null }),
    [auth?.token, auth?.sessionId],
  );

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchUsers(authParams);
        if (!isMounted) return;
        setUsers(parseUsers(response));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load users');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    if (authParams.token || authParams.sessionId || auth?.successFlag) {
      loadUsers();
    }
    return () => {
      isMounted = false;
    };
  }, [authParams, auth?.successFlag]);

  const hasUsers = useMemo(() => users && users.length > 0, [users]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="header__title">Assignment Users</h1>
          <p className="header__subtitle">Browse all available user records.</p>
        </div>
        <button className="button" type="button" onClick={logout}>
          Log out
        </button>
      </header>

      {isLoading && <p className="status-text">Loading users...</p>}
      {error && <p className="status-text status-text--error">{error}</p>}

      {!isLoading && !error && !hasUsers && (
        <p className="status-text">No users were found.</p>
      )}

      {hasUsers && (
        <ul className="grid">
          {users.map((user) => {
            const userName = user?.name1 || user?.user_name || user?.name;
            return (
              <li key={userName} className="card card--link">
                <Link to={`/users/${encodeURIComponent(userName)}`} className="card__link">
                  <h2 className="card__title">{userName}</h2>
                  <dl className="meta">
                    {user?.gender && (
                      <div className="meta__row">
                        <dt>Gender</dt>
                        <dd>{user.gender}</dd>
                      </div>
                    )}
                    {user?.age && (
                      <div className="meta__row">
                        <dt>Age</dt>
                        <dd>{user.age}</dd>
                      </div>
                    )}
                    {user?.company_name && (
                      <div className="meta__row">
                        <dt>Company</dt>
                        <dd>{user.company_name}</dd>
                      </div>
                    )}
                  </dl>
                  <span className="card__cta">View details &gt;</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
