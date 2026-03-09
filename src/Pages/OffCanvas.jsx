import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  X, Truck, LayoutDashboard, Package, History, MapPin,
  Bell, LogOut, ClipboardList, Users, Navigation, Settings,
  User, ChevronRight, Shield, HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const userNav = [
  { path:'/dashboard',   icon:LayoutDashboard, label:'Dashboard' },
  { path:'/place-order', icon:Package,          label:'Place Order' },
  { path:'/orders',      icon:History,          label:'My Orders' },
  { path:'/track',       icon:MapPin,           label:'Track Parcel' },
];

const driverNav = [
  { path:'/driver',        icon:LayoutDashboard, label:'Dashboard' },
  { path:'/driver/orders', icon:ClipboardList,   label:'My Deliveries' },
  { path:'/driver/map',    icon:Navigation,      label:'Live Map' },
];

const adminNav = [
  { path:'/admin',         icon:LayoutDashboard, label:'Overview' },
  { path:'/admin/orders',  icon:Package,         label:'All Orders' },
  { path:'/admin/drivers', icon:Truck,           label:'Drivers' },
  { path:'/admin/users',   icon:Users,           label:'Users' },
  { path:'/admin/map',     icon:MapPin,          label:'Live Tracking' },
];

export default function Offcanvas({ open, onClose }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead } = useSocket();
  const location = useLocation();
  const [tab, setTab] = React.useState('nav'); // 'nav' | 'notifs'

  const nav = user?.role === 'admin' ? adminNav
            : user?.role === 'driver' ? driverNav
            : userNav;

  const roleColour = user?.role === 'admin' ? 'var(--purple)'
                   : user?.role === 'driver' ? 'var(--green)'
                   : 'var(--gold)';

  const roleLabel = user?.role === 'admin' ? 'Administrator'
                  : user?.role === 'driver' ? 'Delivery Driver'
                  : 'Customer';

  const handleLogout = () => { logout(); onClose(); };

  if (!open) return null;

  return (
    <>
      <div className="offcanvas-overlay" onClick={onClose} />
      <div className="offcanvas-panel">

        {/* Header */}
        <div style={{
          padding:'20px 20px 0',
          borderBottom:'1px solid var(--border)',
          paddingBottom:16,
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,var(--gold),#a07830)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Truck size={15} color="var(--navy)" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>
                Swift<span style={{ color:'var(--gold)' }}>Route</span>
              </span>
            </div>
            <button onClick={onClose} style={{ background:'var(--navy-3)', border:'1px solid var(--border)', color:'var(--text-2)', padding:6, borderRadius:8, display:'flex', cursor:'pointer' }}>
              <X size={15} />
            </button>
          </div>

          {/* User profile strip */}
          <div style={{
            display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
            background:'var(--navy-3)', borderRadius:12, border:'1px solid var(--border)',
            marginBottom:16,
          }}>
            <div style={{
              width:42, height:42, borderRadius:'50%', flexShrink:0,
              background:`${roleColour}18`, border:`2px solid ${roleColour}40`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <User size={19} color={roleColour} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--white)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user?.name || user?.fullName || 'User'}
              </div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{user?.email}</div>
            </div>
            <span style={{
              fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:8,
              background:`${roleColour}18`, color:roleColour, border:`1px solid ${roleColour}30`,
              letterSpacing:'.04em', textTransform:'uppercase', flexShrink:0,
            }}>{roleLabel}</span>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', gap:4, background:'var(--navy)', borderRadius:8, padding:3 }}>
            {['nav','notifs'].map(t => (
              <button key={t} onClick={() => { setTab(t); if(t==='notifs') markAllRead(); }} style={{
                flex:1, padding:'7px', borderRadius:6, border:'none', cursor:'pointer',
                background: tab===t ? 'var(--navy-3)' : 'transparent',
                color: tab===t ? 'var(--text)' : 'var(--text-3)',
                fontSize:13, fontWeight:600, fontFamily:'var(--font-body)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                transition:'all .15s',
              }}>
                {t === 'notifs' ? (
                  <>
                    <Bell size={13} />
                    Alerts
                    {unreadCount > 0 && (
                      <span style={{ background:'var(--gold)', color:'var(--navy)', fontSize:10, fontWeight:800, padding:'1px 5px', borderRadius:6 }}>
                        {unreadCount}
                      </span>
                    )}
                  </>
                ) : (
                  <><LayoutDashboard size={13} /> Menu</>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 0' }}>
          {tab === 'nav' && (
            <>
              <div style={{ padding:'6px 8px 8px', fontSize:10, color:'var(--text-3)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>Navigation</div>
              {nav.map(({ path, icon:Icon, label }) => {
                const active = location.pathname === path;
                return (
                  <Link key={path} to={path} onClick={onClose} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'11px 12px',
                    borderRadius:10, margin:'1px 0', transition:'all .15s',
                    background: active ? `${roleColour}12` : 'transparent',
                    color: active ? roleColour : 'var(--text-2)',
                    fontWeight: active ? 600 : 400, fontSize:14,
                    textDecoration:'none',
                    borderLeft: active ? `2px solid ${roleColour}` : '2px solid transparent',
                  }}>
                    <Icon size={17} style={{ flexShrink:0 }} />
                    <span style={{ flex:1 }}>{label}</span>
                    {active && <ChevronRight size={14} style={{ opacity:.5 }} />}
                  </Link>
                );
              })}

              <div style={{ height:1, background:'var(--border)', margin:'12px 4px' }} />
              <div style={{ padding:'2px 8px 8px', fontSize:10, color:'var(--text-3)', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>Account</div>

              {[
                { icon:Settings, label:'Settings', path:'#' },
                { icon:Shield,   label:'Privacy & Security', path:'#' },
                { icon:HelpCircle, label:'Help & Support', path:'#' },
              ].map(({ icon:Icon, label, path }) => (
                <Link key={label} to={path} onClick={onClose} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'11px 12px',
                  borderRadius:10, margin:'1px 0', color:'var(--text-3)', fontSize:14,
                  textDecoration:'none', transition:'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}
                >
                  <Icon size={17} style={{ flexShrink:0 }} />
                  {label}
                </Link>
              ))}
            </>
          )}

          {tab === 'notifs' && (
            <>
              {notifications.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-3)' }}>
                  <Bell size={36} style={{ opacity:.2, margin:'0 auto 12px', display:'block' }} />
                  <div style={{ fontSize:14 }}>No notifications yet</div>
                  <div style={{ fontSize:12, marginTop:4 }}>You'll see updates here</div>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} style={{
                  display:'flex', gap:10, padding:'12px', borderRadius:10, margin:'2px 0',
                  background: n.read ? 'transparent' : 'rgba(201,168,76,.05)',
                  border: n.read ? '1px solid transparent' : '1px solid rgba(201,168,76,.1)',
                }}>
                  <div style={{
                    width:8, height:8, borderRadius:'50%', marginTop:5, flexShrink:0,
                    background: n.read ? 'var(--navy-4)' : 'var(--gold)',
                  }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.45 }}>{n.message}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>
                      {formatDistanceToNow(n.time, { addSuffix:true })}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer — Sign Out */}
        <div style={{ padding:'12px', borderTop:'1px solid var(--border)', background:'var(--navy-2)' }}>
          <button onClick={handleLogout} style={{
            width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            padding:'12px', borderRadius:10, border:'1px solid rgba(239,68,68,.2)',
            background:'rgba(239,68,68,.07)', color:'var(--red)',
            fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)',
            transition:'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,.15)'; e.currentTarget.style.borderColor='rgba(239,68,68,.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,.07)'; e.currentTarget.style.borderColor='rgba(239,68,68,.2)'; }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}