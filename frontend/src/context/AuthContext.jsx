import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser } from '../services/client.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'react-task-auth';

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse stored auth data', error);
    return null;
  }
}

function persistAuth(authState) {
  if (typeof window === 'undefined') {
    return;
  }
  if (!authState) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
}

function normalizeSection(payload, fallbackUser) {
  const section = payload?.message ?? payload?.data ?? payload;
  const objectSection =
    section && typeof section === 'object' && !Array.isArray(section) ? section : null;

  const token =
    objectSection?.access_token ||
    objectSection?.accessToken ||
    objectSection?.token ||
    objectSection?.auth_token ||
    objectSection?.data?.access_token ||
    payload?.access_token ||
    payload?.token ||
    null;

  const sessionId =
    objectSection?.sid ||
    objectSection?.session_id ||
    objectSection?.session ||
    objectSection?.data?.sid ||
    objectSection?.data?.session_id ||
    payload?.sid ||
    null;

  const user =
    objectSection?.user ||
    objectSection?.username ||
    objectSection?.usr ||
    objectSection?.data?.user ||
    payload?.user ||
    fallbackUser ||
    null;

  const statusCandidates = [];
  if (objectSection) {
    statusCandidates.push(
      objectSection.success,
      objectSection.status,
      objectSection.msg,
      objectSection.message,
    );
  }
  statusCandidates.push(payload?.success, payload?.status, payload?.msg, payload?.message);
  const statusRaw = statusCandidates.find((value) => value !== undefined && value !== null && value !== '');

  let successFlag = false;
  if (typeof statusRaw === 'string') {
    successFlag = /success|logged\s*in|ok/i.test(statusRaw);
  } else if (typeof statusRaw === 'boolean') {
    successFlag = statusRaw;
  }

  const errorText =
    objectSection?.error ||
    objectSection?.exc ||
    objectSection?.exception ||
    (typeof statusRaw === 'string' && /error|invalid|failed/i.test(statusRaw) ? statusRaw : null);

  if (!successFlag && !errorText) {
    successFlag = true;
  }

  return { section, token, sessionId, user, successFlag, errorText };
}

function extractAuthDetails(payload, fallbackUser) {
  const normalized = normalizeSection(payload, fallbackUser);
  return {
    token: normalized.token,
    user: normalized.user,
    sessionId: normalized.sessionId,
    successFlag: normalized.successFlag,
    errorText: normalized.errorText,
    raw: payload,
  };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    persistAuth(auth);
  }, [auth]);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser({ username, password });
      const details = extractAuthDetails(response, username);

      if (!details.token && !details.sessionId && !details.successFlag) {
        const message =
          details.errorText ||
          'Login response did not include token or session information. Please verify the API.';
        throw new Error(message);
      }

      const authState = {
        token: details.token || null,
        sessionId: details.sessionId || null,
        user: details.user,
        successFlag: details.successFlag,
        raw: details.raw,
        loggedInAt: new Date().toISOString(),
      };

      setAuth(authState);
      return { success: true, data: authState };
    } catch (err) {
      setError(err.message || 'Unable to login');
      setAuth(null);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuth(null);
    setError(null);
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token || auth?.sessionId || auth?.successFlag),
      login,
      logout,
      isLoading,
      error,
    }),
    [auth, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
