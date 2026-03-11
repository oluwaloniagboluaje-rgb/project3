import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Package, Clock, Truck, CheckCircle, ArrowRight, Plus, User, Camera, Save, X } from 'lucide-react';
import OrderBadge from '../components/OrderBadge';
import { fmtPrice } from '../utils/Pricing';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Profile'];

function DashboardSkeleton() {
  const pulse = {
    background: 'linear-gradient(90deg, var(--navy-3) 25%, rgba(255,255,255,.04) 50%, var(--navy-3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 10,
  };
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...pulse, height: 36, width: 260, marginBottom: 10 }} />
        <div style={{ ...pulse, height: 18, width: 180 }} />
      </div>

      {/* Stats skeleton */}
      <div className="resp-grid-4" style={{ marginBottom: 28 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ ...pulse, height: 12, width: 100, marginBottom: 12 }} />
                <div style={{ ...pulse, height: 38, width: 60 }} />
              </div>
              <div style={{ ...pulse, width: 38, height: 38, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Banner skeleton */}
      <div style={{ ...pulse, height: 90, marginBottom: 28, borderRadius: 'var(--radius-lg)' }} />

      {/* Orders skeleton */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ ...pulse, height: 20, width: 130 }} />
          <div style={{ ...pulse, height: 20, width: 70 }} />
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, flex: 1 }}>
              <div style={{ ...pulse, width: 38, height: 38, borderRadius: 9, flexShrink: 0 }} />
              <div>
                <div style={{ ...pulse, height: 14, width: 100, marginBottom: 8 }} />
                <div style={{ ...pulse, height: 12, width: 140 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ ...pulse, height: 14, width: 50 }} />
              <div style={{ ...pulse, height: 22, width: 70, borderRadius: 20 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function UserDashboard() {
  const { user, loading: authLoading, setUser } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '', bio: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(r => { const d = r.data; setOrders(Array.isArray(d) ? d : (d?.orders || [])); })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', bio: user.bio || '' });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  // Show skeleton while auth is resolving or orders are loading
  if (authLoading || ordersLoading) return <DashboardSkeleton />;

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    transit:   orders.filter(o => ['picked_up', 'in_transit', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', profileForm.name);
      fd.append('phone', profileForm.phone);
      fd.append('address', profileForm.address);
      fd.append('bio', profileForm.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const r = await api.patch('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (setUser) setUser(r.data.user);
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--white)' }}>
            {greeting}, <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{user?.name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p style={{ color: 'var(--text-2)', marginTop: 4, fontWeight: 300 }}>Here's your delivery overview</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--navy-3)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === t ? 'var(--gold)' : 'transparent',
              color: tab === t ? 'var(--navy)' : 'var(--text-2)',
              transition: 'all .15s',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'Overview' && (
        <>
          {/* Stats */}
          <div className="resp-grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Shipments', value: stats.total,     icon: Package,     color: 'var(--gold)'  },
              { label: 'Pending',         value: stats.pending,   icon: Clock,       color: 'var(--amber)' },
              { label: 'In Transit',      value: stats.transit,   icon: Truck,       color: 'var(--blue)'  },
              { label: 'Delivered',       value: stats.delivered, icon: CheckCircle, color: 'var(--green)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Place order banner */}
          <div style={{
            marginBottom: 28, padding: 'clamp(16px,3vw,24px) clamp(16px,3vw,28px)',
            background: 'linear-gradient(135deg, rgba(201,168,76,.12), rgba(201,168,76,.04))',
            border: '1px solid rgba(201,168,76,.25)', borderRadius: 'var(--radius-lg)',
          }} className="resp-order-banner">
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Ready to ship?</h3>
              <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 300 }}>Fast, insured delivery anywhere across the UK. Instant quotes.</p>
            </div>
            <Link to="/place-order" className="btn btn-gold" style={{ flexShrink: 0 }}>
              <Plus size={16} /> New Shipment
            </Link>
          </div>

          {/* Recent orders */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Orders</h3>
              <Link to="/orders" className="btn btn-ghost btn-sm">View all <ArrowRight size={14} /></Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                <Package size={44} style={{ opacity: .15, margin: '0 auto 14px', display: 'block' }} />
                <div style={{ fontSize: 15, marginBottom: 8 }}>No orders yet</div>
                <Link to="/place-order" style={{ color: 'var(--gold)', fontSize: 14 }}>Place your first order →</Link>
              </div>
            ) : (
              <div>
                {orders.slice(0, 6).map(o => (
                  <Link to={`/orders/${o._id}`} key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 10, textDecoration: 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0, flex: 1 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--navy-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                        <Package size={16} color="var(--gold)" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{o.orderNumber || `#${o._id?.slice(-6).toUpperCase()}`}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.pickup?.city} → {o.delivery?.city}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtPrice(o.pricing?.total || 0)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{o.createdAt ? formatDistanceToNow(new Date(o.createdAt), { addSuffix: true }) : ''}</div>
                      </div>
                      <OrderBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'Profile' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: 28 }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(201,168,76,.4)', overflow: 'hidden', background: 'var(--navy-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={32} color="var(--text-3)" />
                  }
                </div>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--navy-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={12} color="#0b1120" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--white)' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{user?.email}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+44 7700 900000" />
              </div>
              <div className="field">
                <label>Address</label>
                <input value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} placeholder="Your address" />
              </div>
              <div className="field">
                <label>Bio <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} placeholder="A short note about yourself..." rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-gold" onClick={handleSaveProfile} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <span className="spinner" style={{ width: 15, height: 15 }} /> : <><Save size={14} /> Save Changes</>}
                </button>
                {avatarFile && (
                  <button className="btn btn-ghost" onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatar || null); }}>
                    <X size={14} /> Discard
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}