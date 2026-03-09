import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import OrderBadge from '../components/OrderBadge';
import { fmtPrice } from '../utils/Pricing';
// import MapView from '../components/MapView';
import { Package, CheckCircle, Clock, Navigation, Truck, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const HISTORY_PAGE_SIZE = 5;

export default function DriverDashboard() {
  const { user } = useAuth();
  const { emitLocation } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [updating, setUpdating] = useState({});
  const watchRef = React.useRef(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    api.get('/orders/driver/assigned')
      .then(r => { const d = r.data; setOrders(Array.isArray(d) ? d : (d?.orders || [])); })
      .catch(() => { })
      .finally(() => setLoading(false));
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  // Fetch history whenever page changes
  useEffect(() => {
    setHistoryLoading(true);
    api.get('/orders/driver/history', { params: { page: historyPage, limit: HISTORY_PAGE_SIZE } })
      .then(r => {
        const d = r.data;
        setHistory(Array.isArray(d) ? d : (d?.orders || []));
        setHistoryTotal(d?.total ?? 0);
        setTotalDelivered(d?.totalDelivered ?? 0);
      })
      .catch(() => { })
      .finally(() => setHistoryLoading(false));
  }, [historyPage]);

  const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const historyPages = Math.ceil(historyTotal / HISTORY_PAGE_SIZE);

  const toggleShare = () => {
    if (sharing) {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      setSharing(false); toast('Location sharing stopped');
      return;
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

  const ACTION_BTN = {
    assigned:         { label: 'Mark Collected',    next: 'picked_up',        cls: 'btn-gold' },
    picked_up:        { label: 'Mark In Transit',   next: 'in_transit',       cls: 'btn-outline' },
    in_transit:       { label: 'Out for Delivery',  next: 'out_for_delivery', cls: 'btn-outline' },
    out_for_delivery: { label: 'Mark Delivered',    next: 'delivered',        cls: 'btn-success' },
  };

  // Status colour dot for history rows
  const STATUS_DOT = {
    delivered: 'var(--green)',
    cancelled: 'var(--red, #ef4444)',
  };

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800 }}>Driver Dashboard</h1>
        <p style={{ color: 'var(--text-2)', fontWeight: 300, marginTop: 4 }}>Manage your deliveries and share live location</p>
      </div>

      {/* Stats + Location sharing */}
      <div className="resp-grid-3plus" style={{ marginBottom: 24 }}>
        {[
          { label: 'Active Jobs',  value: active.length,                                              icon: Package,     color: 'var(--gold)'  },
          { label: 'To Collect',   value: orders.filter(o => o.status === 'assigned').length,         icon: Clock,       color: 'var(--amber)' },
          { label: 'Total Done',   value: totalDelivered,                                             icon: CheckCircle, color: 'var(--green)' },
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

      {/* Live map */}
      {sharing && myLocation && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Navigation size={15} color="var(--green)" /> Your Live Location
          </h3>
          {/* <MapView driverLocation={myLocation} height={260} /> */}
        </div>
      )}

      {/* Active deliveries */}
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
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o.orderNumber || `SR-${o._id?.slice(-6).toUpperCase()}`}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.pickup?.city || o.pickupCity} → {o.delivery?.city || o.deliveryCity}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{o.package?.description || o.packageName} · {o.package?.weightKg || o.weight}kg</div>
                {o.user && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Customer: {o.user.name || o.user.email}</div>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <OrderBadge status={o.status} />
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{fmtPrice(o.pricing?.total || o.price || 0)}</div>
              </div>
            </div>
            {ACTION_BTN[o.status] && (
              <button className={`btn btn-sm ${ACTION_BTN[o.status].cls}`} disabled={updating[o._id]}
                onClick={() => updateStatus(o._id, ACTION_BTN[o.status].next)}>
                {updating[o._id] ? <span className="spinner" style={{ width: 13, height: 13 }} /> : ACTION_BTN[o.status].label}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Delivery History ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={15} color="var(--text-2)" /> Delivery History
          </h3>
          {historyTotal > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{historyTotal} total</span>
          )}
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
              const deliveredAt = o.trackingHistory?.find(h => h.status === 'delivered')?.timestamp
                || o.actualDelivery
                || o.updatedAt;

              return (
                <div key={o._id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.04)',
                  alignItems: 'center',
                }}>
                  {/* Left: order info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>
                        {o.orderNumber || `SR-${o._id?.slice(-6).toUpperCase()}`}
                      </span>
                      <OrderBadge status={o.status} />
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 15, marginBottom: 2 }}>
                      {o.pickup?.city || o.pickupCity} → {o.delivery?.city || o.deliveryCity}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 15, display: 'flex', gap: 12 }}>
                      <span>{o.package?.description || o.packageName || '—'}</span>
                      {o.package?.weightKg && <span>· {o.package.weightKg}kg</span>}
                      {o.user?.name && <span>· {o.user.name}</span>}
                    </div>
                  </div>

                  {/* Right: price + date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {fmtPrice(o.pricing?.total || o.price || 0)}
                    </div>
                    {deliveredAt && (
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                        {format(new Date(deliveredAt), 'd MMM yyyy')}
                      </div>
                    )}
                    {o.createdAt && (
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
                        {formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {historyPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(p => p - 1)}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  Page {historyPage} of {historyPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={historyPage === historyPages}
                  onClick={() => setHistoryPage(p => p + 1)}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}