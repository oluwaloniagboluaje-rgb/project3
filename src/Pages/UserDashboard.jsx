import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Package, Clock, Truck, CheckCircle, ArrowRight, Plus } from 'lucide-react';
import OrderBadge from '../components/OrderBadge';
import { fmtPrice } from '../utils/Pricing';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(r => { const d = r.data; setOrders(Array.isArray(d) ? d : (d?.orders || [])); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    transit: orders.filter(o => ['picked_up', 'in_transit', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: 'var(--white)' }}>
          {greeting}, <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{user?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p style={{ color: 'var(--text-2)', marginTop: 4, fontWeight: 300 }}>Here's your delivery overview</p>
      </div>

      {/* Stats */}
      <div className="resp-grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Shipments', value: stats.total, icon: Package, color: 'var(--gold)' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'var(--amber)' },
          { label: 'In Transit', value: stats.transit, icon: Truck, color: 'var(--blue)' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'var(--green)' },
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
          <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 300 }}>
            Fast, insured delivery anywhere across the UK. Instant quotes.
          </p>
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
            <Package size={44} style={{ opacity: .15, margin: '0 auto 14px', display: 'block' }} />
            <div style={{ fontSize: 15, marginBottom: 8 }}>No orders yet</div>
            <Link to="/place-order" style={{ color: 'var(--gold)', fontSize: 14 }}>Place your first order →</Link>
          </div>
        ) : (
          <div>
            {orders.slice(0, 6).map(o => (
              <Link to={`/orders/${o._id}`} key={o._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 16px', borderRadius: 10, textDecoration: 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--navy-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                    <Package size={16} color="var(--gold)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{o.orderNumber || `#${o._id?.slice(-6).toUpperCase()}`}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.pickup?.city || o.pickupCity} → {o.delivery?.city || o.deliveryCity}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtPrice(o.pricing?.total || o.price || 0)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{o.createdAt ? formatDistanceToNow(new Date(o.createdAt), { addSuffix: true }) : ''}</div>
                  </div>
                  <OrderBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}