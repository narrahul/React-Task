import { ENDPOINTS } from './endpoints.js';

function buildUrl(url, params) {
  if (!params) {
    return url;
  }
  const search = new URLSearchParams(params);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${search.toString()}`;
}

async function request(url, { method = 'GET', params, body, token, sessionId } = {}) {
  const options = {
    method,
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  };

  if (method !== 'GET') {
    options.headers['Content-Type'] = 'application/json';
  }

  if (token) {
    options.headers.Authorization = `token ${token}`;
  }

  if (sessionId) {
    options.headers['X-Frappe-Sid'] = sessionId;
  }

  let requestUrl = url;
  if (params) {
    requestUrl = buildUrl(url, params);
  }

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(requestUrl, options);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson ? payload?.message || payload : payload;
    const error = new Error(typeof message === 'string' ? message : 'Request failed');
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

export async function loginUser({ username, password }) {
  return request(ENDPOINTS.LOGIN_USER, {
    method: 'GET',
    params: {
      usr: username,
      pwd: password,
    },
  });
}

export async function fetchUsers({ token, sessionId }) {
  return request(ENDPOINTS.READ_ALL_USERS_DATA, {
    method: 'GET',
    token,
    sessionId,
  });
}

export async function fetchUserByName(userName, { token, sessionId }) {
  return request(ENDPOINTS.READ_SINGLE_USER_DATA, {
    method: 'GET',
    params: {
      user_name: userName,
    },
    token,
    sessionId,
  });
}

export async function updateUser(userName, data, { token, sessionId }) {
  return request(`${ENDPOINTS.UPDATE_USER_DATA}/${encodeURIComponent(userName)}`, {
    method: 'PUT',
    body: data,
    token,
    sessionId,
  });
}
