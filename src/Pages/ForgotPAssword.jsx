import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Truck, ArrowLeft, Mail, KeyRound, Lock, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Email', 'Verify OTP', 'New Password'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Persisted across all steps — backend needs email + otp + newPassword together
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // ── Step 1: Send OTP via forgot-password endpoint ────────────────
  const handleRequestOTP = async () => {
    if (!email) return toast.error('Enter your email address');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  // ── OTP input handling ───────────────────────────────────────────
  const handleOtpChange = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 3) otpRefs[i + 1].current?.focus();
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(''));
      otpRefs[3].current?.focus();
    }
  };

  // ── Step 2: Just validate format — don't call verify-otp ──────────
  // verify-otp deletes the OTP from DB, so reset-password would find nothing.
  // reset-password verifies the OTP itself, so we skip the separate check.
  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    if (otpString.length < 4) return toast.error('Enter the 4-digit OTP');
    setStep(3);
  };

  // ── Step 3: Reset password — sends email + otp + newPassword ─────
  // Backend re-verifies the OTP internally before resetting
  const handleResetPassword = async () => {
    if (!newPassword) return toast.error('Enter a new password');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword,
      });
      toast.success('Password reset successfully!');
      setStep(4);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally { setLoading(false); }
  };

  // ── Resend OTP ───────────────────────────────────────────────────
  const [resendCooldown, setResendCooldown] = useState(0);
  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New OTP sent');
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,.07) 0%, transparent 60%)',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--gold), #a07830)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(201,168,76,.3)' }}>
              <Truck size={21} color="#0b1120" strokeWidth={2.5} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: -.5, color: 'var(--white)' }}>
                Swift<span style={{ color: 'var(--gold)' }}>Route</span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '.14em', textTransform: 'uppercase' }}>UK Logistics</div>
            </div>
          </Link>
        </div>

        <div className="card" style={{ padding: 'clamp(24px,5vw,36px)' }}>

          {/* Step progress */}
          {step < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
              {STEPS.map((l, i) => (
                <React.Fragment key={l}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--navy-3)',
                      border: `2px solid ${step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--gold)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: step >= i + 1 ? 'var(--navy)' : 'var(--text-3)',
                      transition: 'all .3s',
                    }}>{step > i + 1 ? '✓' : i + 1}</div>
                    <span style={{ fontSize: 10, color: step === i + 1 ? 'var(--text-2)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{l}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'var(--green)' : 'var(--border)', margin: '0 6px', marginBottom: 14, transition: 'background .3s' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={15} color="var(--gold)" />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: 0 }}>Forgot password?</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginLeft: 42, fontWeight: 300 }}>
                  Enter the email linked to your account and we'll send you a 4-digit reset code.
                </p>
              </div>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRequestOTP()}
                  placeholder="your@email.com" autoFocus
                />
              </div>
              <button className="btn btn-gold" onClick={handleRequestOTP} disabled={loading} style={{ justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <>Send Reset Code <ArrowRight size={15} /></>}
              </button>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', justifyContent: 'center' }}>
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={15} color="var(--gold)" />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: 0 }}>Enter OTP</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginLeft: 42, fontWeight: 300 }}>
                  We sent a 4-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>. It expires in 10 minutes.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i} ref={otpRefs[i]}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    style={{
                      width: 62, height: 72, textAlign: 'center',
                      fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
                      background: 'var(--navy)', color: digit ? 'var(--gold)' : 'var(--text)',
                      border: `2px solid ${digit ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 12, outline: 'none',
                      transition: 'border-color .15s, color .15s',
                      caretColor: 'var(--gold)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = otp[i] ? 'var(--gold)' : 'var(--border)'}
                  />
                ))}
              </div>

              <button className="btn btn-gold" onClick={handleVerifyOTP} disabled={otp.join('').length < 4} style={{ justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <>Verify Code <ArrowRight size={15} /></>}
              </button>

              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
                Didn't receive it?{' '}
                <button onClick={handleResend} disabled={resendCooldown > 0 || loading}
                  style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer', color: resendCooldown > 0 ? 'var(--text-3)' : 'var(--gold)', fontWeight: 600, fontSize: 13, padding: 0 }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <ArrowLeft size={13} /> Change email
              </button>
            </div>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lock size={15} color="var(--gold)" />
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: 0 }}>New password</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginLeft: 42, fontWeight: 300 }}>
                  Choose a strong password for your account.
                </p>
              </div>

              <div className="field">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={{ paddingRight: 44 }} autoFocus
                  />
                  <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {[1, 2, 3].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 3, borderRadius: 2, transition: 'background .2s',
                        background: newPassword.length >= n * 3
                          ? n === 1 ? '#ef4444' : n === 2 ? '#f59e0b' : 'var(--green)'
                          : 'var(--border)',
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                    placeholder="Repeat new password"
                    style={{ paddingRight: 44, borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : undefined }}
                  />
                  <button onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>
                )}
              </div>

              <button className="btn btn-gold" onClick={handleResetPassword} disabled={loading || !newPassword || newPassword !== confirmPassword} style={{ justifyContent: 'center' }}>
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <>Reset Password <ArrowRight size={15} /></>}
              </button>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,.1)', border: '2px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={34} color="var(--green)" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', marginBottom: 8 }}>Password Reset!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, fontWeight: 300 }}>
                Your password has been updated. Redirecting you to sign in…
              </p>
              <Link to="/login" className="btn btn-gold" style={{ justifyContent: 'center' }}>
                Go to Sign In <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}