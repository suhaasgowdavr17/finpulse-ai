import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  {
    type: 'BIDDER',
    icon: '🏦',
    title: 'Bank Customer',
    desc: 'Register to apply for loans, track status, and verify your identity',
    badge: 'Self-Service & Instant',
    badgeColor: '#059669',
  },
  {
    type: 'PROCUREMENT_OFFICER',
    icon: '🏛️',
    title: 'Procurement Officer',
    desc: 'Publish tenders, manage submissions, and make authorized compliance decisions',
    badge: 'Instant Access & Verified',
    badgeColor: '#2563eb',
  },
  {
    type: 'ADMIN',
    icon: '🔒',
    title: 'System Administrator',
    desc: 'Platform management, security monitoring, and RBAC governance',
    badge: 'Invitation Only',
    badgeColor: '#dc2626',
    disabled: true,
  },
];

// ── Password specifications validator (at least 6 chars, 1 uppercase, 1 number, 1 special char) ──
export const validatePasswordCriteria = (pwd = '') => {
  const hasMinLength = pwd.length >= 6;
  const hasCaps = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);
  const isValid = hasMinLength && hasCaps && hasNumber && hasSpecial;
  return { hasMinLength, hasCaps, hasNumber, hasSpecial, isValid };
};

// ── Live Password Specifications Checklist Component ──
const PasswordRequirements = ({ pwd = '', confirmPwd = '' }) => {
  const { hasMinLength, hasCaps, hasNumber, hasSpecial } = validatePasswordCriteria(pwd);
  const passwordsMatch = Boolean(confirmPwd && pwd === confirmPwd);

  return (
    <div style={{ marginTop: 10, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Password Security Specifications
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '0.74rem' }}>
        <span style={{ color: hasMinLength ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: hasMinLength ? 800 : 500 }}>
          <span style={{ fontSize: '0.8rem' }}>{hasMinLength ? '✓' : '○'}</span> At least 6 characters
        </span>
        <span style={{ color: hasCaps ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: hasCaps ? 800 : 500 }}>
          <span style={{ fontSize: '0.8rem' }}>{hasCaps ? '✓' : '○'}</span> One uppercase letter (A-Z)
        </span>
        <span style={{ color: hasNumber ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: hasNumber ? 800 : 500 }}>
          <span style={{ fontSize: '0.8rem' }}>{hasNumber ? '✓' : '○'}</span> One number (0-9)
        </span>
        <span style={{ color: hasSpecial ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontWeight: hasSpecial ? 800 : 500 }}>
          <span style={{ fontSize: '0.8rem' }}>{hasSpecial ? '✓' : '○'}</span> One special character (!@#$...)
        </span>
      </div>
      {confirmPwd && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e2e8f0', fontSize: '0.74rem', fontWeight: 800, color: passwordsMatch ? '#059669' : '#dc2626' }}>
          {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
        </div>
      )}
    </div>
  );
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawRoleParam = (searchParams.get('role') || searchParams.get('portal') || '').toUpperCase();
  const normalizedRole = rawRoleParam === 'OFFICER'
    ? 'PROCUREMENT_OFFICER'
    : rawRoleParam;

  const initialRole = ACCOUNT_TYPES.find(t => t.type === normalizedRole && !t.disabled)?.type || null;

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  // ── Password Visibility Toggles ──
  const [showBidderPass, setShowBidderPass] = useState(false);
  const [showBidderConfirmPass, setShowBidderConfirmPass] = useState(false);
  const [showOfficerPass, setShowOfficerPass] = useState(false);
  const [showOfficerConfirmPass, setShowOfficerConfirmPass] = useState(false);

  // ── CUSTOMER FORM STATE ───────────────────────────────────────────────────
  const [customerForm, setCustomerForm] = useState({
    name: '',
    accountNumber: '',
    email: '',
    mobileNumber: '',
  });
  const [customerRecord, setCustomerRecord] = useState(null);
  
  const [customerEmailOtp, setCustomerEmailOtp] = useState({
    sent: false, verified: false, code: '', cooldown: 0, sessionToken: ''
  });
  const [customerPhoneOtp, setCustomerPhoneOtp] = useState({
    sent: false, verified: false, code: '', cooldown: 0
  });

  const [accountForm, setAccountForm] = useState({
    password: '',
    confirmPassword: '',
  });

  // ── OFFICER FORM STATE (Single unified page) ───────────────────
  const [officerForm, setOfficerForm] = useState({
    name: '',
    designation: '',
    employeeId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [officerEmailOtp, setOfficerEmailOtp] = useState({
    sent: false, verified: false, code: '', cooldown: 0, sessionToken: ''
  });
  const [officerPhoneOtp, setOfficerPhoneOtp] = useState({
    sent: false, verified: false, code: '', cooldown: 0
  });

  // Success submitted state
  const [submittedStatus, setSubmittedStatus] = useState(null); // 'BIDDER_DONE' | 'OFFICER_DONE' | null

  // Sync if URL query param changes dynamically
  useEffect(() => {
    if (normalizedRole && initialRole) {
      setSelectedRole(initialRole);
    }
  }, [normalizedRole, initialRole]);

  // Cooldown timers
  useEffect(() => {
    let t;
    if (customerEmailOtp.cooldown > 0) {
      t = setInterval(() => setCustomerEmailOtp(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) })), 1000);
    }
    return () => clearInterval(t);
  }, [customerEmailOtp.cooldown]);

  useEffect(() => {
    let t;
    if (customerPhoneOtp.cooldown > 0) {
      t = setInterval(() => setCustomerPhoneOtp(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) })), 1000);
    }
    return () => clearInterval(t);
  }, [customerPhoneOtp.cooldown]);

  useEffect(() => {
    let t;
    if (officerEmailOtp.cooldown > 0) {
      t = setInterval(() => setOfficerEmailOtp(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) })), 1000);
    }
    return () => clearInterval(t);
  }, [officerEmailOtp.cooldown]);

  useEffect(() => {
    let t;
    if (officerPhoneOtp.cooldown > 0) {
      t = setInterval(() => setOfficerPhoneOtp(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) })), 1000);
    }
    return () => clearInterval(t);
  }, [officerPhoneOtp.cooldown]);

  // ── CUSTOMER HANDLERS ─────────────────────────────────────────────────
  const handleCheckCustomer = async () => {
    if (!customerForm.name || !customerForm.accountNumber || !customerForm.email || !customerForm.mobileNumber) {
      return toast.error('Please fill in all the required fields.');
    }
    setLoading(true);
    try {
      // Mocking verification success for MVP
      setTimeout(() => {
        setCustomerRecord({ ...customerForm, customerId: 'CUST-123' });
        toast.success('✓ BANK CUSTOMER RECORD FOUND');
        setLoading(false);
      }, 800);
    } catch (err) {
      toast.error('✕ Customer details could not be verified. Please check your information.');
      setCustomerRecord(null);
      setLoading(false);
    }
  };

  const handleSendCustomerEmailOtp = async () => {
    setLoading(true);
    try {
      setCustomerEmailOtp(p => ({ ...p, sent: true, code: '', cooldown: 60 }));
      toast.success('OTP sent to your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCustomerEmailOtp = async () => {
    if (customerEmailOtp.code.length !== 6) return toast.error('Enter a valid 6-digit OTP.');
    setLoading(true);
    setTimeout(() => {
      setCustomerEmailOtp(p => ({ ...p, verified: true }));
      toast.success('Email verification successful!');
      setLoading(false);
    }, 500);
  };

  const handleSendCustomerPhoneOtp = async () => {
    setLoading(true);
    try {
      setCustomerPhoneOtp(p => ({ ...p, sent: true, code: '', cooldown: 60 }));
      toast.success('OTP sent to your mobile number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCustomerPhoneOtp = async () => {
    if (customerPhoneOtp.code.length !== 6) return toast.error('Enter a valid 6-digit OTP.');
    setLoading(true);
    setTimeout(() => {
      setCustomerPhoneOtp(p => ({ ...p, verified: true }));
      toast.success('Mobile verification successful!');
      setLoading(false);
    }, 500);
  };

  const handleCustomerRegister = async () => {
    const pwdSpecs = validatePasswordCriteria(accountForm.password);
    if (!pwdSpecs.isValid) return toast.error('Password does not meet requirements.');
    if (accountForm.password !== accountForm.confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: customerForm.email.trim().toLowerCase(),
        password: accountForm.password,
        name: customerForm.name.trim(),
        role: 'BIDDER',
        phone: customerForm.mobileNumber.trim(),
      });
      setSubmittedStatus('BIDDER_DONE');
      toast.success('✓ REGISTRATION SUCCESSFUL: Your FinPulse-AI account has been created successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── OFFICER OTP HANDLERS ──────────────────────────────────────
  const handleOfficerSendEmailOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!officerForm.email || !emailRegex.test(officerForm.email.trim())) {
      return toast.error('Enter a valid official email address first.');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', {
        type: 'EMAIL', target: officerForm.email.trim()
      });
      setOfficerEmailOtp(p => ({ ...p, sent: true, code: '', cooldown: 60, sessionToken: res.data?.sessionToken || '' }));
      toast.success(`Verification OTP sent to ${officerForm.email}. (Demo OTP: 123456)`);
    } catch (err) {
      setOfficerEmailOtp(p => ({ ...p, sent: true, code: '', cooldown: 60 }));
      toast.success(`Verification OTP sent to ${officerForm.email}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerVerifyEmailOtp = async () => {
    if (!officerEmailOtp.code || !/^\d{6}$/.test(officerEmailOtp.code.trim())) {
      return toast.error('Enter the 6-digit OTP code from your email.');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        type: 'EMAIL', target: officerForm.email.trim(), otp: officerEmailOtp.code.trim()
      });
      if (res.data?.verified) {
        setOfficerEmailOtp(p => ({ ...p, verified: true }));
        toast.success('✓ Official email address verified successfully!');
      } else {
        toast.error('Invalid OTP code. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP code. Check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerSendPhoneOtp = async () => {
    const cleanPhone = officerForm.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return toast.error('Enter a valid 10-digit mobile phone number first.');
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', {
        type: 'PHONE', target: cleanPhone
      });
      setOfficerPhoneOtp(p => ({ ...p, sent: true, code: '', cooldown: 60 }));
      toast.success(`Verification SMS sent to +91 ${cleanPhone}. (Demo OTP: 123456)`);
    } catch (err) {
      setOfficerPhoneOtp(p => ({ ...p, sent: true, code: '', cooldown: 60 }));
      toast.success(`Verification SMS sent to +91 ${cleanPhone}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerVerifyPhoneOtp = async () => {
    if (!officerPhoneOtp.code || !/^\d{6}$/.test(officerPhoneOtp.code.trim())) {
      return toast.error('Enter the 6-digit SMS OTP code.');
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        type: 'PHONE', target: officerForm.phone.replace(/\D/g, ''), otp: officerPhoneOtp.code.trim()
      });
      if (res.data?.verified) {
        setOfficerPhoneOtp(p => ({ ...p, verified: true }));
        toast.success('✓ Official mobile number verified successfully!');
      } else {
        toast.error('Invalid OTP code. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP code. Check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerSubmit = async () => {
    if (!officerForm.name.trim()) return toast.error('Full Name is required.');
    if (!officerForm.employeeId.trim()) return toast.error('Official Employee / Officer ID is required.');
    if (!officerForm.email.trim()) return toast.error('Official Email Address is required.');
    if (!officerEmailOtp.verified) return toast.error('Please verify your official Email address OTP.');
    if (!officerForm.phone.trim()) return toast.error('Mobile phone number is required.');
    if (!officerPhoneOtp.verified) return toast.error('Please verify your Mobile phone number OTP.');
    const officerPwdSpecs = validatePasswordCriteria(officerForm.password);
    if (!officerPwdSpecs.isValid) {
      const missing = [];
      if (!officerPwdSpecs.hasMinLength) missing.push('at least 6 characters');
      if (!officerPwdSpecs.hasCaps) missing.push('one uppercase letter (A-Z)');
      if (!officerPwdSpecs.hasNumber) missing.push('one number (0-9)');
      if (!officerPwdSpecs.hasSpecial) missing.push('one special character (!@#$%^&*...)');
      return toast.error(`Password requires: ${missing.join(', ')}`);
    }
    if (officerForm.password !== officerForm.confirmPassword) return toast.error('Passwords do not match.');

    setLoading(true);
    try {
      if (selectedRole === 'PROCUREMENT_OFFICER') {
        await api.post('/auth/register-officer', {
          name: officerForm.name.trim(),
          email: officerForm.email.trim(),
          phone: officerForm.phone.trim(),
          employeeId: officerForm.employeeId.trim(),
          organization: 'Government Procurement Authority',
          department: 'Public Procurement Division',
          designation: officerForm.designation.trim() || 'Procurement Officer',
          password: officerForm.password,
        });
      }
      setSubmittedStatus('OFFICER_DONE');
      toast.success('Registration submitted for Administrative approval!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', position: 'relative',
    }}>
      {/* Floating Top-Left Back Button */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
        <button
          type="button"
          onClick={() => {
            if (submittedStatus) {
              setSubmittedStatus(null);
            } else if (selectedRole) {
              setSelectedRole(null);
              setSearchParams({});
            } else {
              navigate('/login');
            }
          }}
          className="btn-secondary"
          style={{
            borderRadius: '20px',
            padding: '7px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          <span>←</span> {selectedRole && !submittedStatus ? 'Change Role' : 'Back to Sign In'}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 1 }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img
              src="/finpulse-logo.png"
              alt="FinPulse Logo"
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                margin: '0 auto 10px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.65rem', color: '#0f172a', marginBottom: 2 }}>
            Customer Registration
          </h1>
          <p style={{ color: '#475569', fontSize: '0.88rem' }}>Create your FinPulse-AI customer account<br/><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>AI-Powered Loan Verification & Decision Support</span></p>
        </div>

        {/* ── STEP 1: ROLE SELECTION (When no role selected) ──────────────── */}
        {!selectedRole && !submittedStatus && (
          <div className="card" style={{ padding: 32, boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.04em' }}>
              Select Registration Role
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ACCOUNT_TYPES.map(type => (
                <div
                  key={type.type}
                  onClick={() => {
                    if (type.disabled) return;
                    setSelectedRole(type.type);
                  }}
                  style={{
                    padding: '16px 18px', borderRadius: 12, cursor: type.disabled ? 'not-allowed' : 'pointer',
                    border: `1px solid ${type.disabled ? '#e2e8f0' : '#e2e8f0'}`,
                    background: type.disabled ? '#f1f5f9' : '#ffffff',
                    opacity: type.disabled ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: type.disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{type.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: type.disabled ? '#94a3b8' : '#0f172a' }}>
                        {type.title}
                      </span>
                      {type.badge && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                          color: type.badgeColor, background: `${type.badgeColor}15`,
                          border: `1px solid ${type.badgeColor}35`,
                        }}>
                          {type.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{type.desc}</span>
                  </div>
                  {!type.disabled && <span style={{ color: '#2563eb', fontSize: '1.3rem', fontWeight: 800 }}>›</span>}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.84rem', color: '#64748b' }}>
              Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: 800 }}>Sign In</Link>
            </div>
          </div>
        )}

        {/* ── CUSTOMER REGISTRATION ─────────────── */}
        {selectedRole === 'BIDDER' && !submittedStatus && (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10 }}>
              <span style={{ fontSize: '1.3rem' }}>🏦</span>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Bank Customer Account</div>
                <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>Verify your existing bank customer relationship</div>
              </div>
              <button type="button" onClick={() => { setSelectedRole(null); setSearchParams({}); }}
                style={{ marginLeft: 'auto', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 16, padding: '4px 12px', color: '#475569', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}>Change</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!customerRecord ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>FULL NAME *</label>
                      <input className="input" type="text" placeholder="e.g. John Doe" value={customerForm.name} onChange={e => setCustomerForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>BANK ACCOUNT NUMBER *</label>
                      <input className="input" type="password" placeholder="Enter account number" value={customerForm.accountNumber} onChange={e => setCustomerForm(p => ({ ...p, accountNumber: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>EMAIL ADDRESS *</label>
                      <input className="input" type="email" placeholder="name@example.com" value={customerForm.email} onChange={e => setCustomerForm(p => ({ ...p, email: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>MOBILE NUMBER *</label>
                      <input className="input" type="tel" maxLength={10} placeholder="Enter mobile number" value={customerForm.mobileNumber} onChange={e => setCustomerForm(p => ({ ...p, mobileNumber: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <button type="button" className="btn-primary" style={{ width: '100%', padding: 14 }} onClick={handleCheckCustomer} disabled={loading}>
                    {loading ? 'Verifying...' : 'VERIFY CUSTOMER DETAILS'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                    <h3 style={{ color: '#065f46', marginTop: 0, marginBottom: '12px' }}>✓ BANK CUSTOMER RECORD FOUND</h3>
                    <div style={{ fontSize: '0.9rem', color: '#064e3b' }}>
                      <p style={{ margin: '4px 0' }}><strong>Name:</strong> {customerRecord.name}</p>
                      <p style={{ margin: '4px 0' }}><strong>Account Number:</strong> {customerRecord.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                    </div>
                  </div>

                  {(!customerEmailOtp.verified || !customerPhoneOtp.verified) ? (
                    <div style={{ marginTop: 10, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 12px 0' }}>OTP Verification</h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>Please verify your email and mobile number.</p>

                      {/* Email OTP Section */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>EMAIL OTP *</span>
                          {customerEmailOtp.verified && <span style={{ color: '#059669' }}>✓ Verified</span>}
                        </label>
                        {!customerEmailOtp.verified && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {!customerEmailOtp.sent ? (
                              <button type="button" className="btn-secondary" onClick={handleSendCustomerEmailOtp} disabled={loading} style={{ width: '100%' }}>
                                SEND EMAIL OTP
                              </button>
                            ) : (
                              <>
                                <input className="input" type="text" maxLength={6} placeholder="OTP" value={customerEmailOtp.code} onChange={e => setCustomerEmailOtp(p => ({ ...p, code: e.target.value }))} style={{ flex: 1, letterSpacing: '0.1em' }} />
                                <button type="button" className="btn-primary" onClick={handleVerifyCustomerEmailOtp} disabled={loading || customerEmailOtp.code.length !== 6}>VERIFY</button>
                                <button type="button" className="btn-secondary" onClick={handleSendCustomerEmailOtp} disabled={loading || customerEmailOtp.cooldown > 0}>RESEND {customerEmailOtp.cooldown > 0 ? `(${customerEmailOtp.cooldown}s)` : ''}</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mobile OTP Section */}
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>MOBILE OTP *</span>
                          {customerPhoneOtp.verified && <span style={{ color: '#059669' }}>✓ Verified</span>}
                        </label>
                        {!customerPhoneOtp.verified && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {!customerPhoneOtp.sent ? (
                              <button type="button" className="btn-secondary" onClick={handleSendCustomerPhoneOtp} disabled={loading} style={{ width: '100%' }}>
                                SEND MOBILE OTP
                              </button>
                            ) : (
                              <>
                                <input className="input" type="text" maxLength={6} placeholder="OTP" value={customerPhoneOtp.code} onChange={e => setCustomerPhoneOtp(p => ({ ...p, code: e.target.value }))} style={{ flex: 1, letterSpacing: '0.1em' }} />
                                <button type="button" className="btn-primary" onClick={handleVerifyCustomerPhoneOtp} disabled={loading || customerPhoneOtp.code.length !== 6}>VERIFY</button>
                                <button type="button" className="btn-secondary" onClick={handleSendCustomerPhoneOtp} disabled={loading || customerPhoneOtp.cooldown > 0}>RESEND {customerPhoneOtp.cooldown > 0 ? `(${customerPhoneOtp.cooldown}s)` : ''}</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>CREATE FINPULSE PASSWORD</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>CREATE PASSWORD *</label>
                            <div style={{ position: 'relative' }}>
                              <input className="input" type={showBidderPass ? 'text' : 'password'} value={accountForm.password} onChange={e => setAccountForm(p => ({ ...p, password: e.target.value }))} style={{ width: '100%', paddingRight: 40 }} />
                              <button type="button" onClick={() => setShowBidderPass(!showBidderPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem' }}>{showBidderPass ? '🙈' : '👁️'}</button>
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>CONFIRM PASSWORD *</label>
                            <div style={{ position: 'relative' }}>
                              <input className="input" type={showBidderConfirmPass ? 'text' : 'password'} value={accountForm.confirmPassword} onChange={e => setAccountForm(p => ({ ...p, confirmPassword: e.target.value }))} style={{ width: '100%', paddingRight: 40 }} />
                              <button type="button" onClick={() => setShowBidderConfirmPass(!showBidderConfirmPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem' }}>{showBidderConfirmPass ? '🙈' : '👁️'}</button>
                            </div>
                          </div>
                        </div>
                        
                        <PasswordRequirements pwd={accountForm.password} confirmPwd={accountForm.confirmPassword} />
                        
                        <button type="button" className="btn-primary" style={{ width: '100%', padding: 14, marginTop: 12 }} onClick={handleCustomerRegister} disabled={loading}>
                          {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.84rem', color: '#64748b' }}>
              Already registered? <Link to="/login?portal=BIDDER" style={{ color: '#2563eb', fontWeight: 800 }}>Sign In</Link>
            </div>
          </div>
        )}

        {/* ── OFFICER REGISTRATION (SINGLE PAGE WITH DUAL OTP) ─── */}
        {selectedRole === 'PROCUREMENT_OFFICER' && !submittedStatus && (
          <div className="card" style={{ padding: 32 }}>
            {/* Header role context */}
            <div style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{ACCOUNT_TYPES.find(t => t.type === selectedRole)?.icon || '🏛️'}</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>
                    Registering as: {ACCOUNT_TYPES.find(t => t.type === selectedRole)?.title || selectedRole.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>
                    {ACCOUNT_TYPES.find(t => t.type === selectedRole)?.badge || 'Requires Admin Approval'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setSearchParams({});
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  color: '#475569',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Change Role
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Row 1: Full Name & Official Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>FULL NAME *</label>
                  <input
                    className="input"
                    placeholder="e.g. Rajesh Kumar"
                    value={officerForm.name}
                    onChange={e => setOfficerForm({ ...officerForm, name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>OFFICIAL DESIGNATION</label>
                  <input
                    className="input"
                    placeholder={selectedRole === 'PROCUREMENT_OFFICER' ? 'e.g. Senior Procurement Officer' : 'e.g. Lead Compliance Auditor'}
                    value={officerForm.designation}
                    onChange={e => setOfficerForm({ ...officerForm, designation: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Row 2: Official Employee / Officer ID */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>
                  OFFICIAL EMPLOYEE / OFFICER ID *
                </label>
                <input
                  className="input"
                  placeholder={selectedRole === 'PROCUREMENT_OFFICER' ? 'e.g. EMP-PWD-101' : 'e.g. AUD-CAG-001'}
                  value={officerForm.employeeId}
                  onChange={e => setOfficerForm({ ...officerForm, employeeId: e.target.value })}
                  style={{ width: '100%', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              {/* 1. Official Email with Email OTP verification */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span>1. OFFICIAL EMAIL ADDRESS *</span>
                  {officerEmailOtp.verified && (
                    <span style={{ color: '#059669', fontSize: '0.72rem', fontWeight: 800 }}>
                      ✓ Email Verified
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input"
                    type="email"
                    placeholder="name@gov.in"
                    value={officerForm.email}
                    onChange={e => {
                      setOfficerForm({ ...officerForm, email: e.target.value });
                      setOfficerEmailOtp(p => ({ ...p, verified: false, sent: false, code: '' }));
                    }}
                    disabled={officerEmailOtp.verified}
                    style={{ flex: 1, borderColor: officerEmailOtp.verified ? '#10b981' : undefined }}
                  />
                  {!officerEmailOtp.verified && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap', opacity: officerEmailOtp.cooldown > 0 ? 0.6 : 1 }}
                      onClick={handleOfficerSendEmailOtp}
                      disabled={loading || !officerForm.email || officerEmailOtp.cooldown > 0}
                    >
                      {officerEmailOtp.cooldown > 0 ? `Resend (${officerEmailOtp.cooldown}s)` : officerEmailOtp.sent ? 'Resend OTP' : 'Send Email OTP'}
                    </button>
                  )}
                </div>

                {/* Email OTP Input Box */}
                {officerEmailOtp.sent && !officerEmailOtp.verified && (
                  <div style={{ marginTop: 10, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 800 }}>ENTER 6-DIGIT EMAIL OTP *</label>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Demo bypass: 123456</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="input"
                        type="text"
                        maxLength={6}
                        placeholder="● ● ● ● ● ●"
                        value={officerEmailOtp.code}
                        onChange={e => setOfficerEmailOtp(p => ({ ...p, code: e.target.value.replace(/\D/g, '') }))}
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.25em', textAlign: 'center' }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ fontSize: '0.78rem', padding: '6px 16px' }}
                        onClick={handleOfficerVerifyEmailOtp}
                        disabled={loading || officerEmailOtp.code.length !== 6}
                      >
                        Verify Email
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Official Mobile Phone Number with Phone OTP verification */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span>2. OFFICIAL MOBILE PHONE NUMBER *</span>
                  {officerPhoneOtp.verified && (
                    <span style={{ color: '#059669', fontSize: '0.72rem', fontWeight: 800 }}>
                      ✓ Mobile Verified
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', flex: 1 }}>
                    <span style={{
                      padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1',
                      borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#475569', fontSize: '0.85rem', fontWeight: 700
                    }}>
                      +91
                    </span>
                    <input
                      className="input"
                      type="tel"
                      placeholder="9880112345"
                      maxLength={10}
                      value={officerForm.phone}
                      onChange={e => {
                        const num = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setOfficerForm({ ...officerForm, phone: num });
                        setOfficerPhoneOtp(p => ({ ...p, verified: false, sent: false, code: '' }));
                      }}
                      disabled={officerPhoneOtp.verified}
                      style={{
                        flex: 1, borderRadius: '0 8px 8px 0', fontFamily: 'monospace',
                        borderColor: officerPhoneOtp.verified ? '#10b981' : undefined
                      }}
                    />
                  </div>
                  {!officerPhoneOtp.verified && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap', opacity: officerPhoneOtp.cooldown > 0 ? 0.6 : 1 }}
                      onClick={handleOfficerSendPhoneOtp}
                      disabled={loading || officerForm.phone.replace(/\D/g, '').length !== 10 || officerPhoneOtp.cooldown > 0}
                    >
                      {officerPhoneOtp.cooldown > 0 ? `Resend (${officerPhoneOtp.cooldown}s)` : officerPhoneOtp.sent ? 'Resend SMS' : 'Send Phone OTP'}
                    </button>
                  )}
                </div>

                {/* Phone OTP Input Box */}
                {officerPhoneOtp.sent && !officerPhoneOtp.verified && (
                  <div style={{ marginTop: 10, padding: 14, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 800 }}>ENTER 6-DIGIT SMS OTP *</label>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Demo bypass: 123456</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="input"
                        type="text"
                        maxLength={6}
                        placeholder="● ● ● ● ● ●"
                        value={officerPhoneOtp.code}
                        onChange={e => setOfficerPhoneOtp(p => ({ ...p, code: e.target.value.replace(/\D/g, '') }))}
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.25em', textAlign: 'center' }}
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ fontSize: '0.78rem', padding: '6px 16px' }}
                        onClick={handleOfficerVerifyPhoneOtp}
                        disabled={loading || officerPhoneOtp.code.length !== 6}
                      >
                        Verify Mobile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>PASSWORD *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input"
                        type={showOfficerPass ? 'text' : 'password'}
                        placeholder="Min 6 chars (caps, num & special)"
                        value={officerForm.password}
                        onChange={e => setOfficerForm({ ...officerForm, password: e.target.value })}
                        style={{ width: '100%', paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOfficerPass(s => !s)}
                        title={showOfficerPass ? 'Hide password' : 'View password'}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          fontSize: '1.05rem',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1
                        }}
                      >
                        {showOfficerPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800, display: 'block', marginBottom: 4 }}>CONFIRM PASSWORD *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input"
                        type={showOfficerConfirmPass ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={officerForm.confirmPassword}
                        onChange={e => setOfficerForm({ ...officerForm, confirmPassword: e.target.value })}
                        style={{ width: '100%', paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOfficerConfirmPass(s => !s)}
                        title={showOfficerConfirmPass ? 'Hide password' : 'View password'}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          fontSize: '1.05rem',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1
                        }}
                      >
                        {showOfficerConfirmPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Specifications Checklist */}
                <PasswordRequirements pwd={officerForm.password} confirmPwd={officerForm.confirmPassword} />
              </div>

              {/* Verification Checklist */}
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Verification Status:</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: officerEmailOtp.verified ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {officerEmailOtp.verified ? '✓ Email Verified' : '✗ Email Pending OTP'}
                  </span>
                  <span style={{ color: officerPhoneOtp.verified ? '#059669' : '#dc2626', fontWeight: 700 }}>
                    {officerPhoneOtp.verified ? '✓ Mobile Verified' : '✗ Mobile Pending OTP'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: '0.95rem', marginTop: 6 }}
                onClick={handleOfficerSubmit}
                disabled={loading || !officerEmailOtp.verified || !officerPhoneOtp.verified}
              >
                {loading ? '⟳ Creating Account...' : (!officerEmailOtp.verified || !officerPhoneOtp.verified) ? '🔒 Verify Email & Mobile to Continue' : selectedRole === 'PROCUREMENT_OFFICER' ? '🚀 Create Officer Account →' : '🚀 Create Auditor Account →'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.84rem', color: '#64748b' }}>
              Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: 800 }}>Sign In</Link>
            </div>
          </div>
        )}

        {/* ── SUCCESS NOTIFICATION STATE ──────────────────────────────────── */}
        {submittedStatus && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            {submittedStatus === 'BIDDER_DONE' ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Customer Account Created!</h2>
                <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#ecfdf5', color: '#059669', fontWeight: 800, fontSize: '0.8rem', marginBottom: 16, border: '1px solid #a7f3d0' }}>
                  ACCOUNT ACTIVE
                </div>
                <p style={{ color: '#475569', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
                  Sign in and complete your verification profile — Personal Identity, Company Details, Document Upload, and our AI will auto-verify your records.
                </p>
                <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '12px 28px' }} onClick={() => navigate('/login?portal=BIDDER')}>
                  Sign In & Complete Verification →
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                  {selectedRole === 'PROCUREMENT_OFFICER' ? 'Procurement Officer Account Created!' : 'Compliance Auditor Account Created!'}
                </h2>
                <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#ecfdf5', color: '#059669', fontWeight: 800, fontSize: '0.8rem', marginBottom: 16, border: '1px solid #a7f3d0' }}>
                  ACCOUNT ACTIVE & VERIFIED
                </div>
                <p style={{ color: '#475569', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.5 }}>
                  Your account has been verified and activated immediately. You can now sign in to access the Procurement Officer portal.
                </p>
                <button
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '12px 28px' }}
                  onClick={() => navigate('/login?portal=OFFICER')}
                >
                  Sign In to Procurement Portal →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
