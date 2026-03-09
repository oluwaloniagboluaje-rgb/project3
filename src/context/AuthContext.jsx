import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
const TOKEN_EXPIRY_MINUTES = 30;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  // ── Logout ────────────────────────────────────────────────────
  // useCallback so it's stable and safe to call inside useEffect
  const logout = useCallback(() => {
    clearTimeout(timerRef.current);
    localStorage.removeItem('sr_token');
    localStorage.removeItem('sr_user');
    localStorage.removeItem('sr_expiry');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    // Navigate without useNavigate (which can't be used above the Router)
    window.location.href = '/login';
  }, []);

  // Helper: start the auto-logout countdown
  const scheduleLogout = useCallback((msUntilExpiry) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, msUntilExpiry);
  }, [logout]);

  // ── Restore session on app load ───────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    const token  = localStorage.getItem('sr_token');
    const expiry = localStorage.getItem('sr_expiry');

    if (stored && token && expiry) {
      const msLeft = parseInt(expiry) - Date.now();
      if (msLeft > 0) {
        setUser(JSON.parse(stored));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        scheduleLogout(msLeft);
      } else {
        // Token already expired — clear storage silently (no redirect yet)
        localStorage.removeItem('sr_token');
        localStorage.removeItem('sr_user');
        localStorage.removeItem('sr_expiry');
      }
    }
    setLoading(false);

    return () => clearTimeout(timerRef.current);
  }, [scheduleLogout]);

  // ── Login ─────────────────────────────────────────────────────
  const login = async (email, password, role = 'user') => {
    try {
      const ep = role === 'driver' ? '/auth/login/driver' : '/auth/login/user';
      const res = await api.post(ep, { email, password });
      const { token, user: u, role: dbRole } = res.data;
      const full = { ...u, role: dbRole || u.role || role };
      const expiry = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000;

      localStorage.setItem('sr_token', token);
      localStorage.setItem('sr_user', JSON.stringify(full));
      localStorage.setItem('sr_expiry', expiry.toString());
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(full);
      scheduleLogout(TOKEN_EXPIRY_MINUTES * 60 * 1000);

      return full;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  // ── Register ──────────────────────────────────────────────────
  const register = async (data, role = 'user') => {
    try {
      const ep = role === 'driver' ? '/auth/register/driver' : '/auth/register/user';
      const res = await api.post(ep, data);
      const { token, user: u, role: dbRole } = res.data;
      const full = { ...u, role: dbRole || u.role || role };
      const expiry = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000;

      localStorage.setItem('sr_token', token);
      localStorage.setItem('sr_user', JSON.stringify(full));
      localStorage.setItem('sr_expiry', expiry.toString());
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(full);
      scheduleLogout(TOKEN_EXPIRY_MINUTES * 60 * 1000);

      return full;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);