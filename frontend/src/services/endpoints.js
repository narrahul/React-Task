const FALLBACK_API_BASE = 'https://assignment.8848digitalerp.com';
const DEV_PROXY_BASE = '/assignment-api';

function resolveApiBase() {
  const envBase = import.meta.env.VITE_API_BASE?.trim();
  if (envBase) {
    return envBase;
  }
  if (import.meta.env.DEV) {
    return DEV_PROXY_BASE;
  }
  return FALLBACK_API_BASE;
}

export const API_BASE = resolveApiBase();

export const ENDPOINTS = {
  LOGIN_USER: `${API_BASE}/api/method/assignment.API.access_token.get_access_token`,
  READ_ALL_USERS_DATA: `${API_BASE}/api/method/assignment.API.all_users_api.get_user`,
  READ_SINGLE_USER_DATA: `${API_BASE}/api/method/assignment.API.specific_user.get_specific`,
  UPDATE_USER_DATA: `${API_BASE}/api/resource/Assignment`,
};
