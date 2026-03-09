import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { calcPrice, fmtPrice, UK_CITIES } from '../utils/Pricing';
import { MapPin, Package, ArrowRight, ArrowLeft, CheckCircle, Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const STEP_LABELS = ['Addresses', 'Package', 'Photos', 'Review'];
const MAX_IMAGES = 2;
const MAX_SIZE_MB = 10;

export default function PlaceOrder() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  // Image state
  const [images, setImages] = useState([]);   // [{file, preview}]
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    pickupContactName: '', pickupContactPhone: '',
    pickupAddress: '', pickupCity: '', pickupPostcode: '', pickupNotes: '',
    deliveryContactName: '', deliveryContactPhone: '',
    deliveryAddress: '', deliveryCity: '', deliveryPostcode: '', deliveryNotes: '',
    description: '', category: '', weightKg: '', quantity: 1,
    fragile: false, notes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const price = form.weightKg && form.pickupCity && form.deliveryCity
    ? calcPrice(parseFloat(form.weightKg), form.pickupCity, form.deliveryCity)
    : null;

  const cityOpts = UK_CITIES.map(c => <option key={c.name}>{c.name}</option>);

  // ── Image handlers ──────────────────────────────────────────────
  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => {
      if (!f.type.match(/image\/(jpeg|jpg|png|webp|gif)/i)) {
        toast.error(`${f.name}: Only JPG, PNG, WEBP, GIF allowed`);
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name}: Max file size is ${MAX_SIZE_MB}MB`);
        return false;
      }
      return true;
    });

    setImages(prev => {
      const slots = MAX_IMAGES - prev.length;
      if (slots <= 0) { toast.error(`Max ${MAX_IMAGES} images allowed`); return prev; }
      const toAdd = valid.slice(0, slots).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random()}`
      }));
      if (valid.length > slots) toast.error(`Only ${slots} more image(s) can be added`);
      return [...prev, ...toAdd];
    });
  }, []);

  const removeImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Submit ───────────────────────────────────────────────────────
  // Must use FormData — backend uses multer for file parsing
  const submit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();

      // Nested objects must be sent as flat keys or JSON string.
      // Backend reads req.body fields, so we send each as a top-level key.
      fd.append('pickup[contactName]', form.pickupContactName);
      fd.append('pickup[contactPhone]', form.pickupContactPhone);
      fd.append('pickup[address]', form.pickupAddress);
      fd.append('pickup[city]', form.pickupCity);
      fd.append('pickup[postcode]', form.pickupPostcode);
      fd.append('pickup[notes]', form.pickupNotes);

      fd.append('delivery[contactName]', form.deliveryContactName);
      fd.append('delivery[contactPhone]', form.deliveryContactPhone);
      fd.append('delivery[address]', form.deliveryAddress);
      fd.append('delivery[city]', form.deliveryCity);
      fd.append('delivery[postcode]', form.deliveryPostcode);
      fd.append('delivery[notes]', form.deliveryNotes);

      fd.append('package[description]', form.description);
      fd.append('package[category]', form.category || 'other');
      fd.append('package[weightKg]', parseFloat(form.weightKg));
      fd.append('package[quantity]', parseInt(form.quantity) || 1);
      fd.append('package[fragile]', form.fragile);

      if (form.notes) fd.append('notes', form.notes);

      // Append image files under the key 'images' (matches upload.array('images', 2))
      images.forEach(({ file }) => fd.append('images', file));

      const r = await api.post('/orders/placeorder', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setOrderId(r.data._id);
      setOrderNumber(r.data.orderNumber);
      setStep(5);
      toast.success('Shipment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    images.forEach(i => URL.revokeObjectURL(i.preview));
    setImages([]);
    setForm({
      pickupContactName: '', pickupContactPhone: '',
      pickupAddress: '', pickupCity: '', pickupPostcode: '', pickupNotes: '',
      deliveryContactName: '', deliveryContactPhone: '',
      deliveryAddress: '', deliveryCity: '', deliveryPostcode: '', deliveryNotes: '',
      description: '', category: '', weightKg: '', quantity: 1,
      fragile: false, notes: '',
    });
    setStep(1);
  };

  // ── Success screen ───────────────────────────────────────────────
  if (step === 5) return (
    <div className="fade-up" style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid rgba(34,197,94,.3)' }}>
        <CheckCircle size={38} color="var(--green)" />
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Shipment Booked!</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 6, fontWeight: 300 }}>Your parcel has been registered and is awaiting driver assignment.</p>
      {orderNumber && <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Reference: <strong style={{ color: 'var(--gold)' }}>{orderNumber}</strong></p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/orders" className="btn btn-ghost">View Orders</Link>
        <button className="btn btn-gold" onClick={resetForm}>Book Another</button>
      </div>
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800 }}>New Shipment</h1>
        <p style={{ color: 'var(--text-2)', marginTop: 4, fontWeight: 300 }}>Book a collection and delivery across the UK</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {STEP_LABELS.map((l, i) => (
          <React.Fragment key={l}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--navy-3)',
                border: `2px solid ${step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: step >= i + 1 ? 'var(--navy)' : 'var(--text-3)',
                transition: 'all .3s',
              }}>{step > i + 1 ? '✓' : i + 1}</div>
              <span style={{ fontSize: 13, color: step === i + 1 ? 'var(--text)' : 'var(--text-3)', fontWeight: step === i + 1 ? 600 : 400 }}>{l}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 12px' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="card card-gold">

        {/* ── STEP 1: Addresses ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Pickup */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={14} color="var(--gold)" /></div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Collection Address</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field"><label>Contact Name</label><input value={form.pickupContactName} onChange={e => set('pickupContactName', e.target.value)} placeholder="John Smith" required /></div>
                <div className="field"><label>Contact Phone</label><input value={form.pickupContactPhone} onChange={e => set('pickupContactPhone', e.target.value)} placeholder="+44 7700 000000" /></div>
                <div className="field" style={{ gridColumn: '1/-1' }}><label>Street Address</label><input value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)} placeholder="123 High Street" required /></div>
                <div className="field"><label>City / Town</label><select value={form.pickupCity} onChange={e => set('pickupCity', e.target.value)}><option value="">Select city</option>{cityOpts}</select></div>
                <div className="field"><label>Postcode</label><input value={form.pickupPostcode} onChange={e => set('pickupPostcode', e.target.value.toUpperCase())} placeholder="EC2V 8BU" /></div>
                <div className="field" style={{ gridColumn: '1/-1' }}><label>Collection Notes (optional)</label><input value={form.pickupNotes} onChange={e => set('pickupNotes', e.target.value)} placeholder="Leave at reception, ring doorbell, etc." /></div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />

            {/* Delivery */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={14} color="var(--green)" /></div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Delivery Address</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field"><label>Contact Name</label><input value={form.deliveryContactName} onChange={e => set('deliveryContactName', e.target.value)} placeholder="Jane Doe" required /></div>
                <div className="field"><label>Contact Phone</label><input value={form.deliveryContactPhone} onChange={e => set('deliveryContactPhone', e.target.value)} placeholder="+44 7700 000001" /></div>
                <div className="field" style={{ gridColumn: '1/-1' }}><label>Street Address</label><input value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)} placeholder="456 Oxford Road" required /></div>
                <div className="field"><label>City / Town</label><select value={form.deliveryCity} onChange={e => set('deliveryCity', e.target.value)}><option value="">Select city</option>{cityOpts}</select></div>
                <div className="field"><label>Postcode</label><input value={form.deliveryPostcode} onChange={e => set('deliveryPostcode', e.target.value.toUpperCase())} placeholder="M1 1AB" /></div>
                <div className="field" style={{ gridColumn: '1/-1' }}><label>Delivery Notes (optional)</label><input value={form.deliveryNotes} onChange={e => set('deliveryNotes', e.target.value)} placeholder="Leave with neighbour if out, safe place, etc." /></div>
              </div>
            </div>

            <button className="btn btn-gold" style={{ alignSelf: 'flex-end' }}
              disabled={!form.pickupCity || !form.pickupAddress || !form.pickupContactName || !form.deliveryCity || !form.deliveryAddress || !form.deliveryContactName}
              onClick={() => setStep(2)}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Package ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={14} color="var(--gold)" /></div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Package Information</span>
            </div>

            <div className="field"><label>Contents / Description</label><input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Laptop, Documents, Clothing" required /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="documents">Documents</option>
                  <option value="food">Food</option>
                  <option value="furniture">Furniture</option>
                  <option value="machinery">Machinery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field"><label>Weight (kg)</label><input type="number" min="0.1" step="0.1" max="1000" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} placeholder="2.5" required /></div>
              <div className="field"><label>Quantity</label><input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="1" /></div>
            </div>

            <div className="field"><label>Special Instructions (optional)</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Handle with care, keep upright, etc." rows={3} style={{ resize: 'vertical' }} /></div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.fragile} onChange={e => set('fragile', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
              <span style={{ fontSize: 14, color: 'var(--text-2)' }}>Mark as fragile — extra care packaging</span>
            </label>

            {price !== null && (
              <div style={{ padding: 18, borderRadius: 12, background: 'rgba(201,168,76,.07)', border: '1px solid rgba(201,168,76,.2)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Estimated Shipping Cost</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--gold)' }}>{fmtPrice(price)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{form.weightKg}kg · {form.pickupCity} to {form.deliveryCity} · VAT included</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
              <button className="btn btn-gold" disabled={!form.description || !form.weightKg} onClick={() => setStep(3)}>Add Photos <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Photos ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={14} color="var(--gold)" /></div>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Package Photos</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>Optional — up to {MAX_IMAGES} images</span>
              </div>
            </div>

            {/* Drop zone */}
            {images.length < MAX_IMAGES && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '32px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? 'rgba(201,168,76,.05)' : 'transparent',
                  transition: 'all .2s',
                }}
              >
                <Upload size={28} color={dragOver ? 'var(--gold)' : 'var(--text-3)'} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
                  Drag & drop photos here, or <span style={{ color: 'var(--gold)', fontWeight: 600 }}>browse</span>
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>JPG, PNG, WEBP, GIF · Max {MAX_SIZE_MB}MB each · {MAX_IMAGES - images.length} slot{MAX_IMAGES - images.length !== 1 ? 's' : ''} remaining</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                />
              </div>
            )}

            {/* Previews */}
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {images.map(img => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4/3' }}>
                    <img
                      src={img.preview}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(0,0,0,.65)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff',
                      }}
                    >
                      <X size={13} />
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '4px 8px', background: 'rgba(0,0,0,.45)',
                      fontSize: 11, color: 'rgba(255,255,255,.85)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>{img.file.name}</div>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>No photos added — you can skip this step.</p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button>
              <button className="btn btn-gold" onClick={() => setStep(4)}>Review Order <ArrowRight size={16} /></button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Review ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Order Summary</h3>
            {[
              ['Collection', `${form.pickupContactName} · ${form.pickupContactPhone}\n${form.pickupCity}, ${form.pickupPostcode}\n${form.pickupAddress}`],
              ['Delivery', `${form.deliveryContactName} · ${form.deliveryContactPhone}\n${form.deliveryCity}, ${form.deliveryPostcode}\n${form.deliveryAddress}`],
              ['Contents', `${form.description}${form.category ? ` (${form.category})` : ''}`],
              ['Weight', `${form.weightKg} kg`],
              ['Fragile', form.fragile ? 'Yes — extra care requested' : 'No'],
              ...(form.notes ? [['Instructions', form.notes]] : []),
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', whiteSpace: 'pre-line', color: 'var(--text)' }}>{v}</span>
              </div>
            ))}

            {/* Image thumbnails in review */}
            {images.length > 0 && (
              <div style={{ padding: '13px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>Photos</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {images.map(img => (
                    <img key={img.id} src={img.preview} alt="pkg" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Total (inc. VAT)</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--gold)' }}>{price ? fmtPrice(price) : 'Calculated on booking'}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}><ArrowLeft size={15} /> Back</button>
              <button className="btn btn-gold" onClick={submit} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Confirm & Book'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}