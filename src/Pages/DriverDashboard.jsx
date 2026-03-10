import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import OrderBadge from '../components/OrderBadge';
import { fmtPrice } from '../utils/Pricing';
import { Package, CheckCircle, Clock, Navigation, Truck, ChevronLeft, ChevronRight, History, User, Camera, Save, X, Star } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const HISTORY_PAGE_SIZE = 5;
const TABS = ['Dashboard', 'Profile'];

export default function DriverDashboard() {
  const { user, setUser } = useAuth();
  const { emitLocation } = useSocket();
  const [tab, setTab] = useState('Dashboard');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [updating, setUpdating] = useState({});
  const watchRef = useRef(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/orders/driver/assigned')
      .then(r => { const d = r.data; setOrders(Array.isArray(d) ? d : (d?.orders || [])); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  useEffect(() => {
    setHistoryLoading(true);
    api.get('/orders/driver/history', { params: { page: historyPage, limit: HISTORY_PAGE_SIZE } })
      .then(r => {
        const d = r.data;
        setHistory(Array.isArray(d) ? d : (d?.orders || []));
        setHistoryTotal(d?.total ?? 0);
        setTotalDelivered(d?.totalDelivered ?? 0);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [historyPage]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '' });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const historyPages = Math.ceil(historyTotal / HISTORY_PAGE_SIZE);

  const toggleShare = () => {
    if (sharing) {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      setSharing(false); toast('Location sharing stopped'); return;
    }
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setSharing(true); toast.success('Sharing live location');
    watchRef.current = navigator.geolocation.watchPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMyLocation(loc);
      emitLocation({ ...loc, driverId: user._id || user.id });
    }, () => { setSharing(false); toast.error('Location access denied'); }, { enableHighAccuracy: true });
  };

  const updateStatus = async (orderId, status) => {
    setUpdating(u => ({ ...u, [orderId]: true }));
    try {
      await api.patch(`/orders/${orderId}/driver-update`, { status });
      setOrders(p => p.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success(`Marked as ${status.replace(/_/g, ' ')}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setUpdating(u => ({ ...u, [orderId]: false })); }
  };

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

  const ACTION_BTN = {
    assigned:         { label: 'Mark Collected',   next: 'picked_up',        cls: 'btn-gold'    },
    picked_up:        { label: 'Mark In Transit',  next: 'in_transit',       cls: 'btn-outline' },
    in_transit:       { label: 'Out for Delivery', next: 'out_for_delivery', cls: 'btn-outline' },
    out_for_delivery: { label: 'Mark Delivered',   next: 'delivered',        cls: 'btn-success' },
  };

  const STATUS_DOT = { delivered: 'var(--green)', cancelled: 'var(--red, #ef4444)' };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800 }}>Driver Dashboard</h1>
          <p style={{ color: 'var(--text-2)', fontWeight: 300, marginTop: 4 }}>Manage your deliveries and share live location</p>
        </div>
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

      {/* ── DASHBOARD TAB ── */}
      {tab === 'Dashboard' && (
        <>
          <div className="resp-grid-3plus" style={{ marginBottom: 24 }}>
            {[
              { label: 'Active Jobs',  value: active.length,                                      icon: Package,     color: 'var(--gold)'  },
              { label: 'To Collect',   value: orders.filter(o => o.status === 'assigned').length,  icon: Clock,       color: 'var(--amber)' },
              { label: 'Total Done',   value: totalDelivered,                                      icon: CheckCircle, color: 'var(--green)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} color={s.color} />
                  </div>
                </div>
              </div>
            ))}
            <div className="card" style={{ padding: 20, background: sharing ? 'rgba(34,197,94,.06)' : 'var(--navy-2)', border: `1px solid ${sharing ? 'rgba(34,197,94,.3)' : 'var(--border)'}` }}>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>Location Sharing</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: sharing ? 'var(--green)' : 'var(--text-3)' }}>
                {sharing ? '🟢 Live — Visible to admin & customers' : '⚫ Offline'}
              </div>
              <button onClick={toggleShare} className={`btn btn-sm ${sharing ? 'btn-danger' : 'btn-success'}`} style={{ width: '100%', justifyContent: 'center' }}>
                <Navigation size={13} /> {sharing ? 'Stop Sharing' : 'Share Location'}
              </button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Active Deliveries</h3>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
            ) : active.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 36, color: 'var(--text-3)' }}>
                <Truck size={40} style={{ opacity: .15, margin: '0 auto 12px', display: 'block' }} />
                <div>No active deliveries — check back soon.</div>
              </div>
            ) : active.map(o => (
              <div key={o._id} style={{ background: 'var(--navy-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{o.orderNumber}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{o.pickup?.city} → {o.delivery?.city}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{o.package?.description} · {o.package?.weightKg}kg</div>
                    {o.user && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Customer: {o.user.name}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <OrderBadge status={o.status} />
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{fmtPrice(o.pricing?.total || 0)}</div>
                  </div>
                </div>
                {ACTION_BTN[o.status] && (
                  <button className={`btn btn-sm ${ACTION_BTN[o.status].cls}`} disabled={updating[o._id]} onClick={() => updateStatus(o._id, ACTION_BTN[o.status].next)}>
                    {updating[o._id] ? <span className="spinner" style={{ width: 13, height: 13 }} /> : ACTION_BTN[o.status].label}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={15} color="var(--text-2)" /> Delivery History
              </h3>
              {historyTotal > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{historyTotal} total</span>}
            </div>
            {historyLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 36, color: 'var(--text-3)' }}>
                <History size={36} style={{ opacity: .12, margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: 14 }}>No completed deliveries yet.</div>
              </div>
            ) : (
              <>
                {history.map((o, i) => {
                  const isLast = i === history.length - 1;
                  const dotColor = STATUS_DOT[o.status] || 'var(--text-3)';
                  const deliveredAt = o.trackingHistory?.find(h => h.status === 'delivered')?.timestamp || o.actualDelivery || o.updatedAt;
                  return (
                    <div key={o._id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '14px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{o.orderNumber}</span>
                          <OrderBadge status={o.status} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 15, marginBottom: 2 }}>{o.pickup?.city} → {o.delivery?.city}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 15, display: 'flex', gap: 12 }}>
                          <span>{o.package?.description || '—'}</span>
                          {o.package?.weightKg && <span>· {o.package.weightKg}kg</span>}
                          {o.user?.name && <span>· {o.user.name}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtPrice(o.pricing?.total || 0)}</div>
                        {deliveredAt && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{format(new Date(deliveredAt), 'd MMM yyyy')}</div>}
                        {o.createdAt && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}</div>}
                      </div>
                    </div>
                  );
                })}
                {historyPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    <button className="btn btn-ghost btn-sm" disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}><ChevronLeft size={14} /> Prev</button>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Page {historyPage} of {historyPages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={historyPage === historyPages} onClick={() => setHistoryPage(p => p + 1)}>Next <ChevronRight size={14} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'Profile' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: 28 }}>
            {/* Avatar + stats */}
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
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--white)' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{user?.email}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{totalDelivered}</span> deliveries
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={11} color="var(--gold)" fill="var(--gold)" />
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{user?.rating?.toFixed(1) || '5.0'}</span> rating
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle info (read-only) */}
            <div style={{ background: 'var(--navy-3)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Vehicle</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Type</div><div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{user?.vehicleType || '—'}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Plate</div><div style={{ fontSize: 13, fontWeight: 600 }}>{user?.vehiclePlate || '—'}</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>Model</div><div style={{ fontSize: 13, fontWeight: 600 }}>{user?.vehicleModel || '—'}</div></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
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