import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    vehicleType: '', vehiclePlate: '', vehicleModel: '',
    rememberMe: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('user');

  const isLogin = mode === 'login';
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = isLogin
        ? await login(form.email, form.password, role)
        : await register({ ...form, role }, role);
      toast.success(`Welcome${u.name ? `, ${u.name}` : ''}!`);
      navigate(u.role === 'admin' ? '/admin' : u.role === 'driver' ? '/driver' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'user',   label: 'Customer' },
    { key: 'driver', label: 'Driver'   },
  ];

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#333', marginBottom: 7,
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: '1.5px solid #e0e0e0', fontSize: 14, color: '#1a1a2e',
    background: '#fff', fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'border-color .15s', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#101521',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(16px,4vw,32px) 16px', fontFamily: 'var(--font-body)',
    }}>

      {/* Logo + heading */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), #a07830)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={17} color="#0b1120" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, color: '#ffffff' }}>
            Swift<span style={{ color: 'var(--gold)' }}>Route</span>
          </span>
        </div>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: '#ffffff', marginBottom: 5, fontFamily: 'var(--font-display)' }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 14, color: '#8899aa' }}>
          {isLogin ? 'Sign in to your account' : 'Join Swift Route today'}
        </p>
      </div>

      {/* Card */}
      <div className="auth-card" style={{
        width: '100%', maxWidth: 440, background: '#fff',
        borderRadius: 16, padding: 'clamp(20px,5vw,28px) clamp(16px,4vw,24px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Role tabs */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 9, fontWeight: 500 }}>Select role</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {roles.map(r => (
              <button key={r.key} type="button" onClick={() => setRole(r.key)} style={{
                flex: 1, padding: '9px 8px', borderRadius: 24,
                border: `1.5px solid ${role === r.key ? 'var(--gold)' : '#e0e0e0'}`,
                background: role === r.key ? 'rgba(201,168,76,0.07)' : '#fff',
                color: role === r.key ? '#b8862e' : '#666',
                fontSize: 13, fontWeight: role === r.key ? 700 : 500,
                cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-body)',
              }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

          {!isLogin && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. James Harrington" required style={inputStyle} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="demo@swiftroute.co.uk" required style={inputStyle} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              {/* ── Forgot password link ── */}
              {isLogin && (
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500, textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="••••••••" required
                style={{ ...inputStyle, paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 0 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+44 7700 900000" style={inputStyle} />
            </div>
          )}

          {!isLogin && role === 'driver' && (
            <>
              <div style={{ height: 1, background: '#f0f0f0' }} />
              <p style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', margin: 0 }}>Vehicle Details</p>
              <div>
                <label style={labelStyle}>Vehicle Type</label>
                <select value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} style={inputStyle}>
                  <option value="">Select vehicle</option>
                  <option value="bike">Motorcycle / Bike</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck / Lorry</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Reg. Plate</label>
                  <input value={form.vehiclePlate} onChange={e => set('vehiclePlate', e.target.value)} placeholder="AB21 CDE" style={{ ...inputStyle, textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label style={labelStyle}>Vehicle Model</label>
                  <input value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)} placeholder="e.g. Ford Transit" style={inputStyle} />
                </div>
              </div>
            </>
          )}

          {isLogin && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginTop: -2 }}>
              <input type="checkbox" checked={form.rememberMe} onChange={e => set('rememberMe', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }} />
              <span style={{ fontSize: 14, color: '#555' }}>Remember me</span>
            </label>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 10, marginTop: 2,
            background: loading ? '#5a9de6' : '#4a90e2',
            color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s',
          }}>
            {loading
              ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: '#888' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'} style={{ color: '#4a90e2', fontWeight: 600, textDecoration: 'none' }}>
            {isLogin ? 'Create one' : 'Sign in'}
          </Link>
        </p>
      </div>

      {/* Back to home */}
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        marginTop: 20, fontSize: 13, color: '#556', textDecoration: 'none',
        transition: 'color .2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
        onMouseLeave={e => e.currentTarget.style.color = '#556'}
      >
        <ArrowLeft size={13} /> Back to home
      </Link>

      <p style={{ marginTop: 12, fontSize: 12, color: '#334', textAlign: 'center' }}>
        © {new Date().getFullYear()} Swift Route Ltd · Registered in England & Wales
      </p>
    </div>
  );
}