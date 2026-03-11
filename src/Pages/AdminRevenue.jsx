import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { fmtPrice } from '../utils/Pricing';
import OrderBadge from '../components/OrderBadge';
import {
  ArrowLeft, TrendingUp, Package, Users, Truck,
  Search, Filter, ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function RevenueSkeleton() {
  const pulse = {
    background: 'linear-gradient(90deg, var(--navy-3) 25%, rgba(255,255,255,.04) 50%, var(--navy-3) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 10,
  };
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ ...pulse, width: 36, height: 36, borderRadius: 10 }} />
        <div>
          <div style={{ ...pulse, height: 32, width: 200, marginBottom: 8 }} />
          <div style={{ ...pulse, height: 14, width: 260 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ ...pulse, height: 12, width: 90, marginBottom: 12 }} />
            <div style={{ ...pulse, height: 36, width: 120, marginBottom: 8 }} />
            <div style={{ ...pulse, height: 12, width: 70 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ ...pulse, height: 18, width: 160, marginBottom: 20 }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {[60,80,45,90,70,100].map((h,i) => (
              <div key={i} style={{ ...pulse, flex: 1, height: `${h}%`, borderRadius: '6px 6px 0 0' }} />
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ ...pulse, height: 18, width: 140, marginBottom: 20 }} />
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ ...pulse, width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...pulse, height: 13, width: '70%', marginBottom: 6 }} />
                <div style={{ ...pulse, height: 11, width: '40%' }} />
              </div>
              <div style={{ ...pulse, height: 14, width: 50 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.03)', alignItems: 'center' }}>
            {[100,110,130,80,60,80,70].map((w,j) => (
              <div key={j} style={{ ...pulse, height: 14, width: w, flexShrink: 0, borderRadius: j === 5 ? 20 : 8 }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function BarChart({ data }) {
  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)', fontSize: 13 }}>No monthly data yet</div>
  );
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, paddingTop: 8 }}>
      {data.map((d, i) => {
        const pct = (d.total / max) * 100;
        const label = `${MONTHS[(d._id.month - 1)]} ${String(d._id.year).slice(2)}`;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
              £{d.total >= 1000 ? `${(d.total/1000).toFixed(1)}k` : d.total.toFixed(0)}
            </div>
            <div style={{ width: '100%', position: 'relative', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                height: `${Math.max(pct, 4)}%`,
                background: 'linear-gradient(to top, var(--gold), rgba(201,168,76,.5))',
                transition: 'height .3s ease',
              }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [drivers, setDrivers] = useState([]);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)       params.search   = search;
      if (from)         params.from     = from;
      if (to)           params.to       = to;
      if (driverFilter) params.driverId = driverFilter;
      const r = await api.get('/admin/revenue', { params });
      setData(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, search, from, to, driverFilter]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  // Load drivers for filter dropdown once
  useEffect(() => {
    api.get('/admin/drivers').then(r => setDrivers(Array.isArray(r.data) ? r.data : (r.data?.drivers || []))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch(''); setSearchInput('');
    setFrom(''); setTo(''); setDriverFilter('');
    setPage(1);
  };

  const hasFilters = search || from || to || driverFilter;

  // CSV export
  const exportCSV = () => {
    if (!data?.orders?.length) return;
    const headers = ['Order No','Date','Customer','Driver','Route','Amount','VAT','Subtotal'];
    const rows = data.orders.map(o => [
      o.orderNumber,
      o.actualDelivery ? format(new Date(o.actualDelivery), 'dd/MM/yyyy') : '—',
      o.user?.name || '—',
      o.driver?.name || '—',
      `${o.pickup?.city} → ${o.delivery?.city}`,
      (o.pricing?.total || 0).toFixed(2),
      (o.pricing?.vat || 0).toFixed(2),
      (o.pricing?.subtotal || 0).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'swiftroute-revenue.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) return <RevenueSkeleton />;

  const summary = data?.summary || {};
  const orders  = data?.orders  || [];
  const byDriver = data?.byDriver || [];
  const byMonth  = data?.byMonth  || [];

  return (
    <div className="fade-up">
      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/admin" className="btn btn-ghost btn-sm" style={{ padding: '8px 10px' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800 }}>Revenue</h1>
            <p style={{ color: 'var(--text-2)', fontWeight: 300, marginTop: 3, fontSize: 14 }}>
              Full financial history of all delivered orders
            </p>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV} disabled={!orders.length}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Revenue',    value: fmtPrice(summary.total    || 0), icon: TrendingUp, color: 'var(--gold)'  },
          { label: 'Net (ex. VAT)',     value: fmtPrice(summary.subtotal || 0), icon: TrendingUp, color: 'var(--green)' },
          { label: 'VAT Collected',    value: fmtPrice(summary.vat      || 0), icon: TrendingUp, color: 'var(--amber)' },
          { label: 'Paid Orders',      value: data?.total ?? 0,                icon: Package,    color: 'var(--blue)'  },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={17} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }} className="resp-2col-revenue">
        <style>{`.resp-2col-revenue { @media(max-width:900px){ grid-template-columns: 1fr !important; } }`}</style>

        {/* Monthly bar chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-2)' }}>
            Monthly Revenue (last 6 months)
          </h3>
          <BarChart data={byMonth} />
        </div>

        {/* Top drivers */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-2)' }}>
            Top Drivers by Revenue
          </h3>
          {byDriver.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-3)', fontSize: 13 }}>No data yet</div>
          ) : byDriver.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--text-2)' : 'var(--text-3)', flexShrink: 0 }} />
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                {d.driver?.avatar
                  ? <img src={d.driver.avatar} alt={d.driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--navy-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={14} color="var(--text-3)" />
                    </div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.driver?.name || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.count} {d.count === 1 ? 'delivery' : 'deliveries'}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>{fmtPrice(d.total)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search order number…"
                style={{ width: '100%', paddingLeft: 32, background: 'var(--navy)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '8px 10px 8px 32px', fontSize: 13 }}
              />
            </div>
            <button type="submit" className="btn btn-gold btn-sm">Search</button>
          </form>

          {/* Date range */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}
              style={{ background: 'var(--navy)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }} />
            <span style={{ color: 'var(--text-3)', fontSize: 13 }}>to</span>
            <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}
              style={{ background: 'var(--navy)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '8px 10px', fontSize: 13 }} />
          </div>

          {/* Driver filter */}
          <select value={driverFilter} onChange={e => { setDriverFilter(e.target.value); setPage(1); }}
            style={{ background: 'var(--navy)', border: '1px solid var(--border)', color: driverFilter ? 'var(--text)' : 'var(--text-3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, minWidth: 160 }}>
            <option value="">All Drivers</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      </div>

      {/* ── Transactions table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    {['Order', 'Date', 'Customer', 'Driver', 'Route', 'Subtotal', 'VAT', 'Total'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--gold)' }}>
                        {o.orderNumber}
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-2)', fontSize: 12 }}>
                        {o.actualDelivery ? format(new Date(o.actualDelivery), 'd MMM yyyy') : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                            {o.user?.avatar
                              ? <img src={o.user.avatar} alt={o.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ width: '100%', height: '100%', background: 'var(--navy-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Users size={11} color="var(--text-3)" />
                                </div>
                            }
                          </div>
                          <span style={{ fontSize: 13 }}>{o.user?.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {o.driver ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-gold)', flexShrink: 0 }}>
                              {o.driver.avatar
                                ? <img src={o.driver.avatar} alt={o.driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', background: 'var(--navy-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Truck size={11} color="var(--text-3)" />
                                  </div>
                              }
                            </div>
                            <span style={{ fontSize: 13 }}>{o.driver.name}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-3)', fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap', fontSize: 13 }}>
                        {o.pickup?.city} → {o.delivery?.city}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                        {fmtPrice(o.pricing?.subtotal || 0)}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--amber)' }}>
                        {fmtPrice(o.pricing?.vat || 0)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                        {fmtPrice(o.pricing?.total || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>
                <TrendingUp size={40} style={{ opacity: .12, margin: '0 auto 12px', display: 'block' }} />
                <div>{hasFilters ? 'No orders match your filters' : 'No delivered orders yet'}</div>
                {hasFilters && <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={clearFilters}>Clear filters</button>}
              </div>
            )}

            {/* Pagination */}
            {(data?.pages || 0) > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {orders.length} of {data?.total} orders
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Page {page} of {data?.pages}
                  </span>
                  <button className="btn btn-ghost btn-sm" disabled={page === data?.pages} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}