import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import  OrderBadge from '../components/OrderBadge'; 
import    OrderTimeline  from '../components/OrderTimeline';
import { useSocket } from '../context/SocketContext';
import { fmtPrice } from '../utils/Pricing';
import { Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackOrder() {
  const { driverLocations } = useSocket();
  const [searchParams] = useSearchParams();
  const [trackId, setTrackId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('id')) handleTrack(null, searchParams.get('id'));
  }, []);

  const handleTrack = async (e, preId) => {
    e?.preventDefault();
    const id = preId || trackId.trim();
    if (!id) return;
    setLoading(true);
    try {
      const r = await api.get(`/orders/track/${id}`); // ✅ FIXED HERE
      setOrder(r.data);
    } catch {
      toast.error('Order not found. Please check the reference number.');
      setOrder(null);
    } finally { setLoading(false); }
  };

  const liveLocation = order?.driver?._id ? driverLocations?.[order.driver._id] : null;

  return (
    <div className="fade-up" style={{ maxWidth:700 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:800 }}>Track Your Parcel</h1>
        <p style={{ color:'var(--text-2)', fontWeight:300, marginTop:4 }}>Enter your Swift Route reference number</p>
      </div>

      <form onSubmit={handleTrack} style={{ display:'flex',gap:10,marginBottom:32 }}>
        <input
          value={trackId} onChange={e=>setTrackId(e.target.value)}
          placeholder="SR-2024-XXXXXX or full order ID"
          style={{ flex:1,background:'var(--navy-2)',border:'1px solid var(--border-gold)',color:'var(--text)',borderRadius:'var(--radius)',padding:'12px 16px',fontSize:14,fontFamily:'var(--font-body)' }}
        />
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading?<span className="spinner"/>:<><Search size={16}/> Track</>}
        </button>
      </form>

      {order && (
        <div className="fade-in" style={{ display:'flex',flexDirection:'column',gap:20 }}>
          <div className="card card-gold">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:22 }}>SR-{order._id?.slice(-6).toUpperCase()}</div>
                <div style={{ color:'var(--text-2)',fontSize:14,marginTop:3 }}>{order.pickupCity} → {order.deliveryCity} · {order.weight}kg</div>
              </div>
              <OrderBadge status={order.status} />
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,padding:16,background:'rgba(0,0,0,.2)',borderRadius:10,marginBottom:24 }}>
              {[['Contents',order.packageName],['Weight',`${order.weight} kg`],['Cost',fmtPrice(order.price)]].map(([k,v])=>(
                <div key={k}>
                  <div style={{ fontSize:11,color:'var(--text-3)',marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:14,fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>

            <OrderTimeline status={order.status} />
          </div>

          {(liveLocation||order.pickupCity) && (
            <div className="card">
              <h3 style={{ fontWeight:700,fontSize:15,marginBottom:14 }}>
                {liveLocation?'🔴 Live Tracking':'Route Map'}
              </h3>
              <MapView driverLocation={liveLocation} pickupCity={order.pickupCity} deliveryCity={order.deliveryCity} height={280} />
              {liveLocation && <p style={{ marginTop:8,fontSize:12,color:'var(--text-3)',textAlign:'center' }}>Location updating in real-time</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}