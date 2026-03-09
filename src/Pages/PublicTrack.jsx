import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { format } from 'date-fns';
import {
  Truck, MapPin, Package, CheckCircle, Circle,
  ArrowLeft, Clock, AlertCircle, ArrowRight
} from 'lucide-react';

const TIMELINE_STEPS = [
  { status: 'pending',          label: 'Order Placed',      icon: Package },
  { status: 'assigned',         label: 'Driver Assigned',   icon: Truck },
  { status: 'picked_up',        label: 'Collected',         icon: MapPin },
  { status: 'in_transit',       label: 'In Transit',        icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery',  icon: MapPin },
  { status: 'delivered',        label: 'Delivered',         icon: CheckCircle },
];
const STATUS_ORDER = TIMELINE_STEPS.map(s => s.status);

const STATUS_COLOURS = {
  pending:          { bg: 'rgba(201,168,76,.12)',  border: 'rgba(201,168,76,.3)',  text: 'var(--gold)'  },
  assigned:         { bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.3)',  text: '#60a5fa'      },
  picked_up:        { bg: 'rgba(251,191,36,.12)',  border: 'rgba(251,191,36,.3)',  text: '#fbbf24'      },
  in_transit:       { bg: 'rgba(251,191,36,.12)',  border: 'rgba(251,191,36,.3)',  text: '#fbbf24'      },
  out_for_delivery: { bg: 'rgba(251,146,60,.12)',  border: 'rgba(251,146,60,.3)',  text: '#fb923c'      },
  delivered:        { bg: 'rgba(34,197,94,.12)',   border: 'rgba(34,197,94,.3)',   text: 'var(--green)' },
  cancelled:        { bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.3)',   text: '#ef4444'      },
};

export default function PublicTrackPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderNumber) { navigate('/'); return; }
    api.get(`/orders/track/${orderNumber}`)
      .then(r => setOrder(r.data))
      .catch(err => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [orderNumber, navigate]);

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status) : -1;
  const colours = order ? (STATUS_COLOURS[order.status] || STATUS_COLOURS.pending) : null;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,.06) 0%, transparent 60%)',
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid rgba(201,168,76,.15)',
        background: 'rgba(11,17,32,.95)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--gold), #a07830)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={17} color="#0b1120" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--white)' }}>
              Swift<span style={{ color: 'var(--gold)' }}>Route</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-gold btn-sm">Get Started <ArrowRight size={13} /></Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px,5vw,56px) 24px' }}>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', marginBottom: 28, padding: 0 }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0' }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Looking up your order…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertCircle size={32} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>Order not found</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 8 }}>
              We couldn't find an order with tracking number <strong style={{ color: 'var(--gold)' }}>{orderNumber}</strong>.
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 32 }}>Double-check the reference number on your booking confirmation.</p>
            <Link to="/" className="btn btn-gold">Back to Home</Link>
          </div>
        )}

        {/* Result */}
        {!loading && order && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>Tracking Number</p>
                  <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'var(--white)', letterSpacing: -.5 }}>{order.orderNumber}</h1>
                  {order.createdAt && (
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                      Booked {format(new Date(order.createdAt), 'd MMM yyyy, HH:mm')}
                    </p>
                  )}
                </div>
                {/* Status badge */}
                <div style={{
                  padding: '8px 18px', borderRadius: 30,
                  background: colours.bg, border: `1px solid ${colours.border}`,
                  fontSize: 13, fontWeight: 700, color: colours.text,
                  letterSpacing: '.04em', textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}>
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}
              className="resp-track-grid">

              {/* Timeline */}
              <div style={{ background: 'var(--navy-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '.08em' }}>Delivery Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    const entry = order.trackingHistory?.find(h => h.status === step.status);
                    return (
                      <div key={step.status} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: done ? (active ? 'var(--gold)' : 'var(--green)') : 'var(--navy-3)',
                            border: `2px solid ${done ? (active ? 'var(--gold)' : 'var(--green)') : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .3s',
                          }}>
                            {done
                              ? <CheckCircle size={14} color={active ? 'var(--navy)' : '#fff'} />
                              : <Circle size={14} color="var(--border)" />}
                          </div>
                          {i < TIMELINE_STEPS.length - 1 && (
                            <div style={{ width: 2, height: 24, background: i < currentIdx ? 'var(--green)' : 'var(--border)', transition: 'background .3s' }} />
                          )}
                        </div>
                        <div style={{ paddingBottom: i < TIMELINE_STEPS.length - 1 ? 4 : 0, paddingTop: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? 'var(--text)' : 'var(--text-3)' }}>
                            {step.label}
                            {active && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>● Now</span>}
                          </div>
                          {entry?.timestamp && (
                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                              {format(new Date(entry.timestamp), 'd MMM, HH:mm')}
                            </div>
                          )}
                          {entry?.message && active && (
                            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{entry.message}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipment info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Route card */}
                <div style={{ background: 'var(--navy-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.08em' }}>Route</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* From */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <MapPin size={14} color="var(--gold)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>COLLECTION</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{order.pickup?.city}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{order.pickup?.postcode}</div>
                      </div>
                    </div>
                    <div style={{ marginLeft: 15, width: 2, height: 16, background: 'var(--border)' }} />
                    {/* To */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <MapPin size={14} color="var(--green)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>DELIVERY</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{order.delivery?.city}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{order.delivery?.postcode}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package card */}
                <div style={{ background: 'var(--navy-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.08em' }}>Package</h3>
                  {[
                    ['Contents', order.package?.description || '—'],
                    ['Weight',   `${order.package?.weightKg || '—'} kg`],
                    ['Fragile',  order.package?.fragile ? 'Yes' : 'No'],
                    ...(order.package?.category ? [['Category', order.package.category]] : []),
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', textAlign: 'right', textTransform: 'capitalize' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Driver card — only show name + phone, nothing sensitive */}
                {order.driver && (
                  <div style={{ background: 'var(--navy-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.08em' }}>Your Driver</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--navy-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
                        {order.driver.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{order.driver.name}</div>
                        {order.driver.vehicleType && (
                          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, textTransform: 'capitalize' }}>
                            {order.driver.vehicleType}
                            {order.driver.vehiclePlate && ` · ${order.driver.vehiclePlate}`}
                          </div>
                        )}
                        {order.driver.rating && (
                          <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>★ {order.driver.rating.toFixed(1)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sign-in nudge */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,.08), rgba(201,168,76,.03))',
              border: '1px solid rgba(201,168,76,.2)',
              borderRadius: 'var(--radius-lg)', padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 3 }}>Want the full picture?</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Sign in to view delivery history, manage orders, and get live notifications.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-gold btn-sm">Create Account <ArrowRight size={13} /></Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:640px) {
          .resp-track-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}