import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Package, MapPin, Truck, Shield, Clock, Star,
  ChevronDown, CheckCircle, Phone, Mail, Menu, X,
  Globe, Zap, Users, BarChart3
} from 'lucide-react';

// ── Fixed Navbar ──────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Services', 'Tracking', 'About', 'Contact'];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all .3s ease',
        background: scrolled ? 'rgba(11,17,32,.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,.15)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--gold), #a07830)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(201,168,76,.3)',
            }}>
              <Truck size={19} color="#0b1120" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: -.5, lineHeight: 1, color: 'var(--white)' }}>
                Swift<span style={{ color: 'var(--gold)' }}>Route</span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 1 }}>UK Logistics</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, ['@media(max-width:768px)']: { display: 'none' } }}
            className="desktop-nav">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                fontSize: 14, fontWeight: 500, color: 'var(--text-2)',
                transition: 'color .2s', letterSpacing: '.01em',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-2)'}
              >{l}</a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="btn btn-outline btn-sm nav-cta-links" style={{ display: 'flex' }}>Sign In</Link>
            <Link to="/register" className="btn btn-gold btn-sm nav-cta-links" style={{ display: 'flex' }}>
              Get Started <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px', borderRadius: 8, display: 'none' }}
              className="mobile-menu-btn"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="offcanvas-overlay" onClick={() => setMobileOpen(false)}>
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: 'var(--navy-2)', borderRight: '1px solid var(--border)', zIndex: 201, animation: 'slideRight .3s cubic-bezier(.16,1,.3,1)', padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Swift<span style={{ color: 'var(--gold)' }}>Route</span></span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', display: 'flex' }}><X size={20} /></button>
            </div>
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: 16, fontWeight: 500 }}>{l}</a>
            ))}
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/login" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Sign In</Link>
              <Link to="/register" className="btn btn-gold" style={{ justifyContent: 'center' }}>Get Started</Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px) {
          .desktop-nav { display: none !important; }
          .nav-cta-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)',
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(201,168,76,.08) 0%, transparent 70%)',
      }} />
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: .3,
        backgroundImage: 'linear-gradient(rgba(201,168,76,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.06) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Diagonal accent line */}
      <div style={{
        position: 'absolute', top: 0, right: '20%', bottom: 0, width: 1,
        background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,.2), transparent)',
      }} />

      {/* Floating package icons */}
      {[
        { top: '18%', left: '8%', delay: 0, size: 40 },
        { top: '65%', left: '5%', delay: .8, size: 28 },
        { top: '30%', right: '6%', delay: .4, size: 34 },
        { top: '72%', right: '10%', delay: 1.2, size: 24 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', ...p,
          animation: `fadeUp 1s ${p.delay}s both`,
          opacity: .2,
        }}>
          <Package size={p.size} color="var(--gold)" />
        </div>
      ))}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(90px,12vw,120px) clamp(16px,4vw,32px) clamp(60px,8vw,80px)', textAlign: 'center', position: 'relative' }}>
        {/* Eyebrow */}
        <div style={{ animation: 'fadeUp .6s ease both', animationDelay: '.1s' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.25)',
            borderRadius: 30, padding: '6px 18px', marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Now operating nationwide</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ animation: 'fadeUp .6s ease both', animationDelay: '.2s' }}>
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 900, lineHeight: 1.05, marginBottom: 24,
            color: 'var(--white)',
          }}>
            Logistics that{' '}
            <span style={{
              fontStyle: 'italic', color: 'var(--gold)',
              textShadow: '0 0 60px rgba(201,168,76,.3)',
            }}>moves</span>
            <br />with Britain.
          </h1>
        </div>

        <div style={{ animation: 'fadeUp .6s ease both', animationDelay: '.3s' }}>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-2)',
            maxWidth: 540, margin: '0 auto 44px', lineHeight: 1.7, fontWeight: 300,
          }}>
            Real-time tracked deliveries across the UK. From London to Edinburgh, we deliver on time, every time.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp .6s ease both', animationDelay: '.4s' }}>
          <Link to="/register" className="btn btn-gold btn-xl">
            Start Sending <ArrowRight size={18} />
          </Link>
          <a href="#tracking" className="btn btn-outline btn-xl">
            Track a Parcel <MapPin size={16} />
          </a>
        </div>

        {/* Stats row */}
        <div className="hero-stats">
          {[
            ['50,000+', 'Parcels Delivered'],
            ['99.2%', 'On-Time Rate'],
            ['20+', 'UK Cities Covered'],
            ['24/7', 'Live Support'],
          ].map(([v, l]) => (
            <div key={l} className="hero-stat">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: 'var(--gold)' }}>{v}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'pulse 2s infinite', color: 'var(--text-3)' }}>
        <ChevronDown size={22} />
      </div>
    </section>
  );
}

// ── Ticker ────────────────────────────────────────────────────────
function Ticker() {
  const items = ['Same-Day London', 'Next-Day UK Wide', 'Fragile Handling', 'Express Courier', 'Temperature Controlled', 'Document Delivery', 'Furniture Removals', 'International Forwarding'];
  const doubled = [...items, ...items];

  return (
    <div style={{ background: 'var(--gold)', padding: '12px 0', overflow: 'hidden', borderTop: 'none' }}>
      <div style={{ display: 'flex', animation: 'marquee 24s linear infinite', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--navy)', padding: '0 32px', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
            {item} <span style={{ opacity: .4, marginLeft: 16 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Services ──────────────────────────────────────────────────────
function Services() {
  const services = [
    { icon: Zap, title: 'Same-Day Express', desc: 'Urgent deliveries within London and major cities. Guaranteed arrival within hours.', highlight: true },
    { icon: Truck, title: 'Next-Day Nationwide', desc: 'Reliable next-day delivery to any UK address. Tracked from pickup to doorstep.', highlight: false },
    { icon: Globe, title: 'International', desc: 'Seamless forwarding to Europe and worldwide. Full customs documentation handled.', highlight: false },
    { icon: Shield, title: 'Secure Freight', desc: 'High-value and sensitive cargo handled with specialist care, insurance included.', highlight: false },
    { icon: Package, title: 'Pallet & Bulk', desc: 'Palletised freight and bulk consignments at competitive rates with nationwide network.', highlight: false },
    { icon: Clock, title: 'Scheduled Delivery', desc: 'Set your delivery window. Customers receive SMS alerts and live tracking links.', highlight: false },
  ];

  return (
    <section id="services" style={{ padding: '100px 32px', background: 'var(--navy-2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>What We Offer</div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: 'var(--white)', marginBottom: 16 }}>
            Built for <em>British</em> business
          </h2>
          <p style={{ color: 'var(--text-2)', maxWidth: 480, margin: '0 auto', fontSize: 16, fontWeight: 300 }}>
            From sole traders to enterprise — our logistics solutions scale with you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {services.map((s, i) => (
            <div key={i} style={{
              background: s.highlight ? 'linear-gradient(135deg, rgba(201,168,76,.12), rgba(201,168,76,.04))' : 'var(--navy)',
              border: `1px solid ${s.highlight ? 'rgba(201,168,76,.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', padding: 28, transition: 'transform .2s, box-shadow .2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, marginBottom: 20,
                background: s.highlight ? 'var(--gold)' : 'rgba(201,168,76,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: s.highlight ? 'none' : '1px solid var(--border-gold)',
              }}>
                <s.icon size={22} color={s.highlight ? 'var(--navy)' : 'var(--gold)'} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--white)' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
              {s.highlight && (
                <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
                  Learn more <ArrowRight size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Book Online', desc: 'Create your shipment in minutes. Enter collection and delivery addresses, package details, and choose your service level.' },
    { n: '02', title: 'We Collect', desc: 'Our driver arrives at your specified time. Package is scanned and enters our tracked network immediately.' },
    { n: '03', title: 'Live Tracking', desc: 'You and your recipient receive real-time updates at every stage — from pickup to your doorstep.' },
    { n: '04', title: 'Delivered', desc: 'Your parcel arrives safely. Proof of delivery captured digitally and available in your dashboard instantly.' },
  ];

  return (
    <section style={{ padding: '100px 32px', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Process</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--white)' }}>How <em>Swift Route</em> works</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0, position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: '0 24px 0', position: 'relative', textAlign: 'center' }}>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', top: 28, left: 'calc(50% + 28px)', right: 0,
                  height: 1, background: 'linear-gradient(to right, var(--gold), transparent)',
                  opacity: .3,
                }} />
              )}
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                background: 'var(--navy-2)', border: '1px solid var(--border-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--gold)',
              }}>{s.n}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tracking CTA ──────────────────────────────────────────────────
function TrackingCTA() {
  const [trackId, setTrackId] = useState('');

  return (
    <section id="tracking" style={{
      padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)',
      background: 'linear-gradient(135deg, var(--navy-3) 0%, var(--navy-4) 100%)',
      borderTop: '1px solid var(--border-gold)', borderBottom: '1px solid var(--border-gold)',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <MapPin size={32} color="var(--gold)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', color: 'var(--white)', marginBottom: 12 }}>Track your parcel</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 15, fontWeight: 300 }}>
          Enter your Swift Route tracking number for live updates
        </p>
        <div className="resp-track-row">
          <input
            value={trackId}
            onChange={e => setTrackId(e.target.value)}
            placeholder="e.g. SR-2024-XXXXXX"
            style={{
              flex: 1, minWidth: 0, background: 'var(--navy)', border: '1px solid var(--border-gold)',
              color: 'var(--text)', borderRadius: 'var(--radius)', padding: '13px 18px',
              fontSize: 15, fontFamily: 'var(--font-body)',
            }}
          />
          <Link to={trackId ? `/track?id=${trackId}` : '/login'} className="btn btn-gold">
            Track <ArrowRight size={16} />
          </Link>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in for full tracking history →</Link>
        </p>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { name: 'Sarah Mitchell', role: 'E-commerce Director, Bloom & Co.', text: 'Swift Route transformed our fulfilment. Orders ship faster, customers are happier, and the tracking dashboard is genuinely impressive.', stars: 5 },
    { name: 'James Harrington', role: 'Operations Manager, BuildRight Ltd.', text: "We shifted our entire freight operation to Swift Route six months ago. Not a single missed delivery. The driver assignment is seamless.", stars: 5 },
    { name: 'Priya Sharma', role: 'Founder, The Spice Collective', text: 'As a small business, the pricing transparency matters hugely. Swift Route gives us enterprise-level tracking at a fair price.', stars: 5 },
  ];

  return (
    <section style={{ padding: '100px 32px', background: 'var(--navy-2)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>Client Voices</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--white)' }}>Trusted across <em>the UK</em></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{
              background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28,
              transition: 'border-color .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                {Array(r.stars).fill(0).map((_, j) => <Star key={j} size={14} fill="var(--gold)" color="var(--gold)" />)}
              </div>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 20, fontWeight: 300 }}>
                "{r.text}"
              </p>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{r.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,32px)', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }} className="resp-2col">
        <div>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>Our Story</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', color: 'var(--white)', marginBottom: 20 }}>
            Born in Britain.<br /><em>Built to deliver.</em>
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.8, fontWeight: 300, fontSize: 15 }}>
            Founded in 2019 by a team of logistics professionals frustrated with outdated courier systems, Swift Route set out to build the platform they always wanted.
          </p>
          <p style={{ color: 'var(--text-2)', marginBottom: 36, lineHeight: 1.8, fontWeight: 300, fontSize: 15 }}>
            Today we operate a network of vetted drivers across every major UK city, connecting businesses and individuals with reliable, transparent delivery — all from one beautifully simple dashboard.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { icon: Users, label: 'Active Drivers', val: '1,200+' },
              { icon: BarChart3, label: 'Monthly Deliveries', val: '85,000' },
              { icon: Globe, label: 'Cities Covered', val: '20+' },
              { icon: CheckCircle, label: 'On-Time Success', val: '99.2%' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gold-light)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={17} color="var(--gold)" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--white)' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual panel */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--navy-3), var(--navy-4))',
            border: '1px solid var(--border-gold)',
            padding: 40, textAlign: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,.4)',
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', margin: '0 auto 28px',
              background: 'var(--gold-light)', border: '2px solid var(--border-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'goldPulse 3s infinite',
            }}>
              <Truck size={54} color="var(--gold)" strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
              Always on the move
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 300, maxWidth: 260, margin: '0 auto' }}>
              Our drivers are GPS-tracked in real-time so you always know exactly where your delivery is.
            </p>

            <div style={{ marginTop: 32, padding: 16, background: 'rgba(0,0,0,.3)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Live Tracking Active</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'monospace' }}>SR-2024-847291 • En route</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>ETA: 14 mins • Birmingham → Coventry</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" style={{ padding: 'clamp(48px,8vw,80px) clamp(16px,4vw,32px)', background: 'var(--navy-2)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }} className="resp-2col">
        <div>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14 }}>Get In Touch</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', color: 'var(--white)', marginBottom: 20 }}>
            Ready to ship?<br /><em>Let's talk.</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: Phone, label: '0800 SWIFT ROUTE', sub: 'Mon–Fri, 8am–8pm' },
              { icon: Mail, label: 'hello@swiftroute.co.uk', sub: '24h response guaranteed' },
              { icon: MapPin, label: '45 King Street, London EC2V 8BU', sub: 'Head Office' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gold-light)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <c.icon size={16} color="var(--gold)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--navy)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 32,
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--white)' }}>Send us a message</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Name', 'Your full name'], ['Email', 'your@email.com'], ['Message', 'How can we help?']].map(([l, p]) => (
              <div key={l} className="field">
                <label>{l}</label>
                {l === 'Message' ? <textarea placeholder={p} rows={4} style={{ resize: 'vertical' }} /> : <input placeholder={p} />}
              </div>
            ))}
            <button className="btn btn-gold" style={{ justifyContent: 'center', marginTop: 4 }}>
              Send Message <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', borderTop: '1px solid var(--border)', padding: 'clamp(32px,5vw,48px) clamp(16px,4vw,32px) 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="resp-footer">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold), #a07830)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={16} color="var(--navy)" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Swift<span style={{ color: 'var(--gold)' }}>Route</span></span>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7, fontWeight: 300, maxWidth: 240 }}>
              UK's premium logistics platform — connecting businesses with reliable, trackable delivery nationwide.
            </p>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 12 }}>
              Registered in England & Wales · No. 11847392
            </div>
          </div>

          {[
            ['Services', ['Same-Day Express', 'Next-Day UK', 'International', 'Pallet Freight', 'Schedule Delivery']],
            ['Company', ['About Us', 'Careers', 'Press', 'Blog', 'Contact']],
            ['Legal', ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Accessibility']],
          ].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>{title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(l => (
                  <a key={l} href="#" style={{ fontSize: 13, color: 'var(--text-3)', transition: 'color .15s', fontWeight: 300 }}
                    onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-3)'}
                  >{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>© {new Date().getFullYear()} Swift Route Ltd. All rights reserved.</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Made with care in <span style={{ color: 'var(--gold)' }}>🇬🇧</span> Britain</div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Export ───────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Ticker />
      <Services />
      <HowItWorks />
      <TrackingCTA />
      <Testimonials />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}