import { apiClient } from './api/axiosInstance';

const AUTH_KEY = 'shopsphere_token'
const USER_KEY = 'shopsphere_user'
const CART_KEY = 'shopsphere_cart'
const STACK_KEY = 'shopsphere_cart_stack'

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_KEY))
}

export async function logout() {
  try {
    const token = localStorage.getItem(AUTH_KEY);
    if (token) {
      await apiClient.post('/api/logout');
    }
  } catch (_) {
    // Ignore — always clear locally
  }
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(CART_KEY)
  sessionStorage.removeItem('admin_token')
  sessionStorage.removeItem('admin_user')
  try {
    sessionStorage.removeItem(STACK_KEY)
  } catch (_) {
    // ignored
  }
  window.dispatchEvent(new Event('auth-change'));
}

export function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

export function getUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function getAdminUser() {
  const data = sessionStorage.getItem('admin_user');
  return data ? JSON.parse(data) : null;
}

export function isAdminAuthenticated() {
  return Boolean(sessionStorage.getItem('admin_token'));
}

export async function loginWithCredentials(email, password) {
  try {
    const res = await apiClient.post('/api/login', { email, password });
    const payload = res.data;
    localStorage.setItem(AUTH_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    window.dispatchEvent(new Event('auth-change'));
    return payload.user;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Invalid login';
    throw new Error(message);
  }
}

export async function loginAsAdmin(email, password) {
  try {
    const res = await apiClient.post('/api/admin/login', { email, password });
    const payload = res.data;
    sessionStorage.setItem('admin_token', payload.token);
    sessionStorage.setItem('admin_user', JSON.stringify(payload.user));
    window.dispatchEvent(new Event('auth-change'));
    return payload.user;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Invalid admin login';
    throw new Error(message);
  }
}
