import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import OrderBadge from '../components/OrderBadge';
import { fmtPrice } from '../utils/Pricing';
// import MapView from '../components/MapView';
import { useSocket } from '../context/SocketContext';

import { Package, ArrowLeft, CheckCircle, Circle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const TIMELINE_STEPS = [
  { status: 'pending',          label: 'Order Placed' },
  { status: 'assigned',         label: 'Driver Assigned' },
  { status: 'picked_up',        label: 'Collected' },
  { status: 'in_transit',       label: 'In Transit' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered',        label: 'Delivered' },
];

const STATUS_ORDER = TIMELINE_STEPS.map(s => s.status);

function OrderTimeline({ status, trackingHistory = [] }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const entry = trackingHistory.find(h => h.status === step.status);
        return (
          <div key={step.status} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: done ? (active ? 'var(--gold)' : 'var(--green)') : 'var(--navy-3)',
                border: `2px solid ${done ? (active ? 'var(--gold)' : 'var(--green)') : 'var(--border)'}`,
                transition: 'all .3s',
              }}>
                {done
                  ? <CheckCircle size={14} color={active ? 'var(--navy)' : '#fff'} />
                  : <Circle size={14} color="var(--text-3)" />}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div style={{ width: 2, height: 28, background: i < currentIdx ? 'var(--green)' : 'var(--border)', transition: 'background .3s' }} />
              )}
            </div>
            <div style={{ paddingBottom: i < TIMELINE_STEPS.length - 1 ? 8 : 0, paddingTop: 3 }}>
              <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? 'var(--text)' : 'var(--text-3)' }}>
                {step.label}
              </div>
              {entry?.timestamp && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                  {format(new Date(entry.timestamp), 'd MMM, HH:mm')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Image lightbox/gallery component ────────────────────────────────────────
function PackageImages({ images = [] }) {
  const [lightbox, setLightbox] = useState(null); // index of open image

  if (!images.length) return null;

  const prev = (e) => { e.stopPropagation(); setLightbox(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setLightbox(i => (i + 1) % images.length); };

  return (
    <>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
          Package Photos <span style={{ color: 'var(--text-3)' }}>({images.length})</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {images.map((img, i) => (
            <div
              key={img.publicId || i}
              onClick={() => setLightbox(i)}
              style={{
                width: 72, height: 72, borderRadius: 8, overflow: 'hidden',
                border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
                transition: 'border-color .15s, transform .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <img
                src={img.url}
                alt={`Package photo ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
              borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          ><X size={16} /></button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button onClick={prev} style={{
                position: 'absolute', left: 20,
                background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '50%', width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}><ChevronLeft size={20} /></button>
              <button onClick={next} style={{
                position: 'absolute', right: 20,
                background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: '50%', width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}><ChevronRight size={20} /></button>
            </>
          )}

          {/* Image */}
          <img
            src={images[lightbox].url}
            alt={`Package photo ${lightbox + 1}`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 'min(90vw, 800px)', maxHeight: '80vh',
              borderRadius: 12, objectFit: 'contain',
              boxShadow: '0 24px 80px rgba(0,0,0,.6)',
            }}
          />

          {/* Counter */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 24,
              background: 'rgba(0,0,0,.5)', borderRadius: 20,
              padding: '4px 14px', fontSize: 13, color: 'rgba(255,255,255,.7)',
            }}>{lightbox + 1} / {images.length}</div>
          )}
        </div>
      )}
    </>
  );
}

export function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders/my-orders')
      .then((r) => { const d = r.data; setOrders(Array.isArray(d) ? d : (d?.orders || [])); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statuses = ['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="fade-up" style={{ maxWidth: 820 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800 }}>My Orders</h1>
        <p style={{ color: 'var(--text-2)', fontWeight: 300, marginTop: 4 }}>
          Track and manage all your shipments
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-gold' : 'btn-ghost'}`}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : shown.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
          <Package size={48} style={{ opacity: 0.15, margin: '0 auto 16px', display: 'block' }} />
          <div style={{ fontSize: 15, marginBottom: 8 }}>No {filter !== 'all' ? filter.replace(/_/g,' ') : ''} orders</div>
          <Link to="/place-order" className="btn btn-gold" style={{ display: 'inline-flex', marginTop: 8 }}>Place a Shipment</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map((o) => (
            <Link to={`/orders/${o._id}`} key={o._id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px 20px', cursor: 'pointer', transition: 'border-color .15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--navy-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={19} color="var(--gold)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{o.orderNumber || `SR-${o._id?.slice(-6).toUpperCase()}`}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{o.pickup?.city || o.pickupCity} → {o.delivery?.city || o.deliveryCity}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{o.package?.description || o.packageName} · {o.package?.weightKg || o.weight}kg</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <OrderBadge status={o.status} />
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>{fmtPrice(o.pricing?.total || o.price || 0)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {o.createdAt ? formatDistanceToNow(new Date(o.createdAt), { addSuffix: true }) : ''}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { driverLocations } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const confirmDelivery = async () => {
    if (!window.confirm('Confirm you have received this delivery?')) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${id}/confirm-delivery`);
      setOrder((o) => ({ ...o, status: 'delivered' }));
      toast.success('Delivery confirmed! Thank you.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setCancelling(false);
    }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel this shipment?')) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${id}/cancel`);
      setOrder((o) => ({ ...o, status: 'cancelled' }));
      toast.success('Shipment cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel at this stage');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  if (!order) return null;

  const liveLocation = order.driver?._id ? driverLocations?.[order.driver._id] : null;
  const pickup = order.pickup || {};
  const delivery = order.delivery || {};
  const pkg = order.package || {};

  return (
    <div className="fade-up" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <Link to="/orders" className="btn btn-ghost btn-sm"><ArrowLeft size={15} /></Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 800 }}>
            {order.orderNumber || `SR-${id?.slice(-6).toUpperCase()}`}
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 300, marginTop: 2 }}>
            {order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy, HH:mm') : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <OrderBadge status={order.status} />
          {['pending', 'assigned'].includes(order.status) && (
            <button className="btn btn-danger btn-sm" onClick={cancel} disabled={cancelling}>
              {cancelling ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <><X size={13} /> Cancel</>}
            </button>
          )}
          {order.status === 'out_for_delivery' && (
            <button className="btn btn-success btn-sm" onClick={confirmDelivery} disabled={cancelling}>
              {cancelling ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <><CheckCircle size={13} /> Confirm Delivery</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Delivery Status</h3>
          <OrderTimeline status={order.status} trackingHistory={order.trackingHistory || []} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Shipment Details</h3>
            {[
              ['Collection', `${pickup.city || ''}${pickup.postcode ? ` (${pickup.postcode})` : ''}\n${pickup.address || ''}`],
              ['Delivery',   `${delivery.city || ''}${delivery.postcode ? ` (${delivery.postcode})` : ''}\n${delivery.address || ''}`],
              ['Contents',   pkg.description || '—'],
              ['Weight',     `${pkg.weightKg || '—'} kg`],
              ['Shipping',   fmtPrice(order.pricing?.total || order.price || 0)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', whiteSpace: 'pre-line', color: 'var(--text)' }}>{v}</span>
              </div>
            ))}

            {/* Package images — rendered from Cloudinary URLs stored in order.package.images */}
            <PackageImages images={pkg.images || []} />
          </div>
        </div>
      </div>

      {(liveLocation || pickup.city) && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            {liveLocation ? '🔴 Live Driver Location' : 'Delivery Route'}
          </h3>
          {/* <MapView driverLocation={liveLocation} pickupCity={pickup.city} deliveryCity={delivery.city} height={320} /> */}
        </div>
      )}
    </div>
  );
}