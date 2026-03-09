import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import OrderBadge from '../components/OrderBadge';
import { fmtPrice } from '../utils/Pricing';
// import MapView from '../components/MapView';
import { useSocket } from '../context/SocketContext';
import { Package, Truck, Users, TrendingUp, CheckCircle, Clock, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { driverLocations } = useSocket();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [busy, setBusy] = useState({});

  const fetchAll = async () => {
    try {
      const [o, d, u] = await Promise.all([api.get('/admin/orders'), api.get('/admin/drivers'), api.get('/admin/users')]);
      const ordersData = o.data;
      const driversData = d.data;
      const usersData = u.data;
      setOrders(Array.isArray(ordersData) ? ordersData : (ordersData?.orders || []));
      setDrivers(Array.isArray(driversData) ? driversData : (driversData?.drivers || []));
      setUsers(Array.isArray(usersData) ? usersData : (usersData?.users || []));
    } catch { toast.error('Failed to load data'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const stats = {
    orders: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((a, o) => a + (o.pricing?.total || o.price || 0), 0),
    drivers: drivers.length,
    live: Object.keys(driverLocations || {}).length,
  };

  const assign = async () => {
    if (!selectedDriver) return;
    setBusy(b => ({ ...b, [assignModal]: true }));
    try {
      await api.patch(`/admin/orders/${assignModal}/assign-driver`, { driverId: selectedDriver });
      setOrders(p => p.map(o => o._id === assignModal ? { ...o, status: 'assigned', driver: drivers.find(d => d._id === selectedDriver) } : o));
      toast.success('Driver assigned!'); setAssignModal(null); setSelectedDriver('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign'); }
    finally { setBusy(b => ({ ...b, [assignModal]: false })); }
  };

  const markDelivered = async (orderId) => {
    setBusy(b => ({ ...b, [orderId]: true }));
    try {
      await api.patch(`/admin/orders/${orderId}/mark-delivered`, {});
      setOrders(p => p.map(o => o._id === orderId ? { ...o, status: 'delivered' } : o));
      toast.success('Marked as delivered');
    } catch { toast.error('Failed to update'); }
    finally { setBusy(b => ({ ...b, [orderId]: false })); }
  };

  const TABS = ['orders', 'drivers', 'users', 'map'];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800 }}>Admin Overview</h1>
        <p style={{ color: 'var(--text-2)', fontWeight: 300, marginTop: 4 }}>Platform management and live monitoring</p>
      </div>

      {/* Stats */}
      <div className="resp-grid-6" style={{ marginBottom: 28 }}>
        {[
          { l: 'Total Orders', v: stats.orders, c: 'var(--gold)', icon: Package },
          { l: 'Pending', v: stats.pending, c: 'var(--amber)', icon: Clock },
          { l: 'Delivered', v: stats.delivered, c: 'var(--green)', icon: CheckCircle },
          { l: 'Revenue', v: fmtPrice(stats.revenue), c: 'var(--green)', icon: TrendingUp, big: true },
          { l: 'Drivers', v: stats.drivers, c: 'var(--blue)', icon: Truck },
          { l: 'Live Now', v: stats.live, c: 'var(--green)', icon: MapPin },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: s.big ? 17 : 26, fontWeight: 800, color: s.c }}>{s.v}</div>
            <s.icon size={14} color={s.c} style={{ opacity: .4, marginTop: 4 }} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="resp-tabs">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--gold)' : 'transparent',
            color: tab === t ? 'var(--navy)' : 'var(--text-2)',
            fontWeight: tab === t ? 700 : 500, fontSize: 13, transition: 'all .15s',
            fontFamily: 'var(--font-body)',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <>
          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 720 }}>
                  <thead><tr>
                    {['Reference', 'Customer', 'Route', 'Contents', 'Cost', 'Driver', 'Status', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{o.orderNumber || `SR-${o._id?.slice(-6).toUpperCase()}`}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{o.user?.name || o.user?.email || '—'}</td>
                        <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{o.pickup?.city || o.pickupCity} → {o.delivery?.city || o.deliveryCity}</td>
                        <td>{o.package?.description || o.packageName} ({o.package?.weightKg || o.weight}kg)</td>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtPrice(o.pricing?.total || o.price || 0)}</td>
                        <td style={{ color: o.driver ? 'var(--green)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{o.driver?.name || o.driver?.fullName || 'Unassigned'}</td>
                        <td><OrderBadge status={o.status} /></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {o.status === 'pending' && <button className="btn btn-gold btn-sm" onClick={() => setAssignModal(o._id)}>Assign</button>}
                          {o.status === 'transit' && <button className="btn btn-success btn-sm" disabled={busy[o._id]} onClick={() => markDelivered(o._id)}>
                            {busy[o._id] ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✓ Delivered'}
                          </button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No orders yet</div>}
            </div>
          )}

          {/* DRIVERS TAB */}
          {tab === 'drivers' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {drivers.map(d => {
                const live = driverLocations?.[d._id];
                return (
                  <div key={d._id} className="card" style={{ border: `1px solid ${live ? 'rgba(34,197,94,.3)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--navy-3)', border: `2px solid ${live ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Truck size={19} color={live ? 'var(--green)' : 'var(--text-3)'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{d.name || d.fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.phone}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: live ? 'rgba(34,197,94,.12)' : 'var(--navy-3)', color: live ? 'var(--green)' : 'var(--text-3)' }}>
                        {live ? '● Live' : '○ Offline'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                      {d.vehicleType || '—'} · {d.vehiclePlate || d.plateNumber || 'No plate'}
                    </div>
                    {live && <div style={{ marginTop: 12, height: 130 }}><MapView driverLocation={live} height={130} /></div>}
                  </div>
                );
              })}
              {drivers.length === 0 && <div style={{ color: 'var(--text-3)', padding: 20 }}>No drivers registered</div>}
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 480 }}>
                  <thead><tr>{['Name', 'Email', 'Phone', 'Joined'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{u.name || u.fullName || '—'}</td>
                        <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                        <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                        <td style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{u.createdAt ? formatDistanceToNow(new Date(u.createdAt), { addSuffix: true }) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MAP TAB */}
          {tab === 'map' && (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Live Fleet Tracking</h3>
              {Object.keys(driverLocations || {}).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
                  <MapPin size={44} style={{ opacity: .15, margin: '0 auto 14px', display: 'block' }} />
                  <div>No drivers are sharing their location right now</div>
                </div>
              ) : (
                Object.entries(driverLocations).map(([dId, loc]) => {
                  const drv = drivers.find(d => d._id === dId);
                  return (
                    <div key={dId} style={{ marginBottom: 24 }}>
                      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                        🚛 {drv?.name || drv?.fullName || 'Driver'} · {drv?.vehicleType || ''}
                        <span style={{ fontSize: 11, color: 'var(--green)', marginLeft: 8 }}>● Live</span>
                      </div>
                      <MapView driverLocation={loc} height={280} />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, animation: 'fadeIn .2s', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,.6)' }}>
            <button onClick={() => setAssignModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-2)', display: 'flex', cursor: 'pointer' }}><X size={18} /></button>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Assign Driver</h3>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 22 }}>Order SR-{assignModal?.slice(-6).toUpperCase()}</p>
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Select Driver</label>
              <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
                <option value="">Choose a driver…</option>
                {drivers.map(d => <option key={d._id} value={d._id}>{d.name || d.fullName} — {d.vehicleType || 'Driver'}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn-gold" disabled={!selectedDriver || busy[assignModal]} onClick={assign}>
                {busy[assignModal] ? <span className="spinner" /> : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}