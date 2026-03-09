import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Offcanvas from './OffCanvas';
import {
  Menu, Truck, Bell, ChevronRight
} from 'lucide-react';

const CRUMB = {
  '/dashboard':    ['Dashboard'],
  '/place-order':  ['Dashboard','Place Order'],
  '/orders':       ['Dashboard','My Orders'],
  '/track':        ['Dashboard','Track Parcel'],
  '/driver':       ['Driver','Dashboard'],
  '/driver/orders':['Driver','My Deliveries'],
  '/driver/map':   ['Driver','Live Map'],
  '/admin':        ['Admin','Overview'],
  '/admin/orders': ['Admin','All Orders'],
  '/admin/drivers':['Admin','Drivers'],
  '/admin/users':  ['Admin','Users'],
  '/admin/map':    ['Admin','Live Tracking'],
};

export default function DashLayout({ children }) {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const location = useLocation();
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);

  const crumbs = CRUMB[location.pathname] || ['Dashboard'];

  const roleColour = user?.role === 'admin' ? 'var(--purple)'
                   : user?.role === 'driver' ? 'var(--green)'
                   : 'var(--gold)';

  return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', flexDirection:'column' }}>
      {/* Top Navbar */}
      <header style={{
        position:'sticky', top:0, zIndex:80,
        background:'rgba(11,17,32,.92)',
        backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
        height:60,
        display:'flex', alignItems:'center',
        padding:'0 16px',
        gap:12,
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setOffcanvasOpen(true)}
          style={{
            background:'var(--navy-3)', border:'1px solid var(--border)',
            color:'var(--text-2)', padding:'7px 8px', borderRadius:9,
            display:'flex', alignItems:'center', gap:8, cursor:'pointer',
            fontSize:13, fontWeight:500, transition:'all .15s', flexShrink:0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-gold)'; e.currentTarget.style.color='var(--gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; }}
        >
          <Menu size={16} />
        </button>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,var(--gold),#a07830)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Truck size={15} color="var(--navy)" strokeWidth={2.5} />
          </div>
          <span className="hide-xs" style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, letterSpacing:-.3 }}>
            Swift<span style={{ color:'var(--gold)' }}>Route</span>
          </span>
        </Link>

        {/* Breadcrumb — hide on mobile */}
        <div className="hide-xs" style={{ display:'flex', alignItems:'center', gap:6, marginLeft:4 }}>
          <div style={{ width:1, height:18, background:'var(--border)' }} />
          {crumbs.map((c, i) => (
            <React.Fragment key={c}>
              {i > 0 && <ChevronRight size={12} color="var(--text-3)" />}
              <span style={{
                fontSize:13,
                color: i === crumbs.length - 1 ? 'var(--text)' : 'var(--text-3)',
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
              }}>{c}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Right side */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          {/* Notification bell */}
          <button
            onClick={() => setOffcanvasOpen(true)}
            style={{
              position:'relative',
              background:'var(--navy-3)', border:'1px solid var(--border)',
              color:'var(--text-2)', padding:'7px', borderRadius:9,
              display:'flex', cursor:'pointer', transition:'all .15s', flexShrink:0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-gold)'; e.currentTarget.style.color='var(--gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)'; }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position:'absolute', top:-4, right:-4,
                background:'var(--gold)', color:'var(--navy)',
                fontSize:9, fontWeight:900, minWidth:17, height:17,
                borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
                border:'2px solid var(--navy)',
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* User chip */}
          <button
            onClick={() => setOffcanvasOpen(true)}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'var(--navy-3)', border:'1px solid var(--border)',
              color:'var(--text)', padding:'6px 10px 6px 8px', borderRadius:30,
              cursor:'pointer', fontSize:13, fontWeight:500, transition:'all .15s',
              fontFamily:'var(--font-body)', flexShrink:0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
          >
            <div style={{
              width:24, height:24, borderRadius:'50%',
              background:`${roleColour}20`, border:`1.5px solid ${roleColour}50`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:700, color:roleColour, flexShrink:0,
            }}>
              {(user?.name || user?.fullName || 'U')[0].toUpperCase()}
            </div>
            <span className="hide-xs" style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name || user?.fullName || 'Account'}
            </span>
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="dash-main">
        {children}
      </main>

      <Offcanvas open={offcanvasOpen} onClose={() => setOffcanvasOpen(false)} />
    </div>
  );
}