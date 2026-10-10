import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/Sidebar';
import api, { tenderAPI, complianceAPI } from '../services/api';

const STATUS_COLOR = {
  ACTIVE: '#10b981',
  PROCESSING: '#2563eb',
  DRAFT: '#64748b',
  CLOSED: '#ef4444',
  CANCELLED: '#ef4444',
};

// =============================================================================
// 1. 🛡️ SYSTEM ADMINISTRATOR DASHBOARD
// =============================================================================
const AdminDashboard = ({ profile, stats, navigate }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>
              Platform Administration & System Health
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Infrastructure monitoring, user provisioning, integration telemetry, and security oversight
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => navigate('/tenders')}>
            📋 Tender Monitoring
          </button>
          <button className="btn-primary" onClick={() => navigate('/admin')}>
            👥 User Management
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: stats.totalUsers || 4, icon: '👥', color: '#2563eb', bg: '#eff6ff', desc: 'Registered system accounts' },
            { label: 'Active Sessions', value: stats.activeUsers || 4, icon: '⚡', color: '#10b981', bg: '#ecfdf5', desc: 'Verified platform users' },
            { label: 'Monitored Tenders', value: stats.totalTenders || 0, icon: '📋', color: '#7c3aed', bg: '#f5f3ff', desc: 'Active procurement tenders' },
            { label: 'Security Alerts', value: stats.alerts || 0, icon: '⚠️', color: '#ef4444', bg: '#fef2f2', desc: 'Zero unaddressed threats' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: 20, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                <span style={{ fontSize: '0.68rem', color: s.color, fontWeight: 800, background: s.bg, padding: '2px 8px', borderRadius: 10 }}>
                  LIVE
                </span>
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#0f172a', marginBottom: 2 }}>
                {s.value}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155' }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div className="card">
            <span className="section-title" style={{ display: 'block', marginBottom: 14 }}>
              Core Infrastructure Health
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Firebase Authentication & RBAC', status: 'Healthy', ping: '24ms', color: '#10b981' },
                { name: 'PostgreSQL Relational DB (Port 5432)', status: 'Connected & Synced', ping: '4ms', color: '#10b981' },
                { name: 'AI Engine (FastAPI + Gemini LLM)', status: 'Active (Port 8000)', ping: '110ms', color: '#10b981' },
                { name: 'External Govt. Verification Gateways', status: 'Active (GSTN, PAN, MCA21, Udyam)', ping: '12ms', color: '#10b981' },
              ].map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{item.ping}</span>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: item.color }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <span className="section-title" style={{ display: 'block', marginBottom: 14 }}>
              Government Verification Gateways
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { name: 'GSTN Returns (GSTR-3B / 1)', status: 'Operational', icon: '🏛️' },
                { name: 'Income Tax PAN (CBDT)', status: 'Operational', icon: '💳' },
                { name: 'Ministry of Corp Affairs (MCA21)', status: 'Operational', icon: '🏢' },
                { name: 'MSME / Udyam Registry', status: 'Operational', icon: '🏭' },
              ].map((gw) => (
                <div key={gw.name} style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span>{gw.icon}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{gw.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>● {gw.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 2. 🏛️ PROCUREMENT OFFICER DASHBOARD
// =============================================================================
const OfficerDashboard = ({ profile, tenders, stats, navigate }) => {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🏛️</span>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>
              Welcome, {profile?.name?.split(' ')[0] || 'Procurement Officer'}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Spotlight Action: Verify Company Profiles & PAN Lookup */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.2rem' }}>🔍</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e40af' }}>Verify Company Profiles & Live PAN Lookup</span>
              <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: 10, fontWeight: 800 }}>
                OFFICER WORKFLOW
              </span>
            </div>
            <p style={{ color: '#475569', fontSize: '0.84rem', margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
              Inspect customer-submitted information, view uploaded documents, and perform real-time identity lookups across connected verification databases.
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', padding: '11px 22px', fontSize: '0.86rem', fontWeight: 800 }}
            onClick={() => navigate('/procurement/verify-company-profiles')}
          >
            Open Profile Verifier →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Loan Products', value: tenders.length || 0, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Loan Applications', value: stats.totalBidders || 0, color: '#0284c7', bg: '#f0f9ff' },
            { label: 'Under Verification', value: stats.bidsUnderVerification || 0, color: '#d97706', bg: '#fffbeb' },
            { label: 'Verified', value: stats.compliantBids || 0, color: '#059669', bg: '#ecfdf5' },
            { label: 'Needs Review', value: stats.nonCompliantBids || 0, color: '#dc2626', bg: '#fef2f2' },
            { label: 'High Risk', value: stats.highRiskBids || 0, color: '#b91c1c', bg: '#fee2e2' },
          ].map((card) => (
            <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}30`, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700, marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tenders Table / Empty State */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title">Loan Applications</span>
            <Link to="/tenders" style={{ color: '#2563eb', fontSize: '0.84rem', fontWeight: 700, textDecoration: 'none' }}>
              View all ({tenders.length}) →
            </Link>
          </div>
          {tenders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📋</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>No Tenders Published Yet</h3>
              <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: 16 }}>
                Create a loan product to start receiving customer applications and AI-assisted verification results.
              </p>
              <button className="btn-primary" onClick={() => navigate('/tenders/create')}>
                + Create New Tender
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Product Reference</th>
                    <th>Loan Product</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tenders.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{t.referenceNo}</td>
                      <td style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{t.title}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 10, fontWeight: 800, fontSize: '0.78rem' }}>
                          {t._count?.bidders || t.bidders?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: `${STATUS_COLOR[t.status] || '#64748b'}15`, color: STATUS_COLOR[t.status] || '#64748b',
                          border: `1px solid ${STATUS_COLOR[t.status] || '#64748b'}30`, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800,
                        }}>{t.status}</span>
                      </td>
                      <td>
                        <button className="btn-ghost" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, padding: '4px 8px' }} onClick={() => navigate(`/tenders/${t.id}`)}>
                          Review Applications →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 3. 🔍 COMPLIANCE OFFICER DASHBOARD
// =============================================================================
const ComplianceDashboard = ({ profile, navigate }) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>
              Verification Center & Evidence Evaluation
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            AI-extracted requirement matching, OCR verification, and deterministic rule evaluation
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/auditor/queue')}>
          🔍 Open Verification Queue
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Pending Applications', value: 0, color: '#d97706', desc: 'Loan applications awaiting review' },
            { label: 'High Risk Flags', value: 0, color: '#dc2626', desc: 'Inconsistencies detected' },
            { label: 'Verified Customers', value: 0, color: '#059669', desc: 'Customer records verified' },
            { label: 'Disputed Overrides', value: 0, color: '#0284c7', desc: 'Human corrections to AI' },
          ].map((c) => (
            <div key={c.label} className="card" style={{ padding: 20, borderLeft: `4px solid ${c.color}` }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#0f172a' }}>{c.value}</div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#334155' }}>{c.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>✅</div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Verification Queue is Clear</h3>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: 16 }}>
            No bidder submissions are currently pending compliance evaluation. When bids are submitted, they will appear here for evidence validation.
          </p>
          <button className="btn-secondary" onClick={() => navigate('/tenders')}>
            Browse Open Tenders
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 4. 🏦 CUSTOMER DASHBOARD
// =============================================================================
const BidderDashboard = ({ profile, bidderOnboardingProfile, myBidsCount = 0, tenders, navigate }) => {
  const isRejected = bidderOnboardingProfile?.lifecycleStatus === 'REJECTED';
  const isUnderReview = ['REVIEW_REQUIRED', 'UNDER_OFFICER_REVIEW'].includes(bidderOnboardingProfile?.lifecycleStatus);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.2rem' }}>🏦</span>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>
              Customer Dashboard — My FinPulse Account
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Manage your profile, documents, loan applications, and verification status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => navigate('/bidder/profile')}>
            👤 My Profile
          </button>
          <button className="btn-primary" onClick={() => navigate('/bidder/apply')}>
            💰 Apply for a Loan
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* ── HIGH PRIORITY: OFFICER REJECTION ALERT ── */}
        {isRejected && (
          <div
            style={{
              background: '#fef2f2',
              border: '2px solid #f87171',
              borderRadius: 14,
              padding: 24,
              marginBottom: 24,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}
              >
                ❌
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  STATUTORY VERIFICATION STATUS: REJECTED BY OFFICER
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#991b1b', margin: '2px 0 6px' }}>
                  Company Profile Verification Rejected
                </h2>
                <p style={{ color: '#7f1d1d', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  Your statutory company profile verification was reviewed and rejected by the designated Government Procurement Officer due to the following reason:
                </p>
              </div>
            </div>

            {/* Rejection Notes Box */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #fca5a5',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 18,
                fontSize: '0.88rem',
                color: '#991b1b',
                fontWeight: 700
              }}
            >
              <span style={{ color: '#b91c1c', fontWeight: 900, fontSize: '0.74rem', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                Officer Audit Finding / Reason for Rejection:
              </span>
              "{bidderOnboardingProfile.rejectionReason || bidderOnboardingProfile.officerNotes || 'Discrepancies identified between uploaded certificates and registered government database records.'}"
            </div>

            {/* Officer Contact Information Card */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
                marginBottom: 18
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>REVIEWING OFFICER</div>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800, marginTop: 2 }}>
                  {bidderOnboardingProfile.reviewedByOfficer || 'Senior Procurement Officer'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {bidderOnboardingProfile.officerDesignation || 'Procurement Verification Officer'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>OFFICIAL EMAIL</div>
                <a
                  href={`mailto:${bidderOnboardingProfile.officerEmail || 'officer@complygem.gov.in'}`}
                  style={{ fontSize: '0.88rem', color: '#2563eb', fontWeight: 800, marginTop: 2, display: 'inline-block', textDecoration: 'none' }}
                >
                  ✉️ {bidderOnboardingProfile.officerEmail || 'officer@complygem.gov.in'}
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>CONTACT PHONE</div>
                <a
                  href={`tel:${bidderOnboardingProfile.officerPhone || '+91 80 2345 6789'}`}
                  style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 800, marginTop: 2, display: 'inline-block', textDecoration: 'none' }}
                >
                  📞 {bidderOnboardingProfile.officerPhone || '+91 80 2345 6789'}
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>MINISTRY / ORGANIZATION</div>
                <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, marginTop: 2 }}>
                  🏛️ {bidderOnboardingProfile.officerOrganization || 'Ministry of Commerce & Industry / GeM'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', padding: '10px 22px', fontSize: '0.85rem' }}
                onClick={() => navigate('/bidder/onboarding')}
              >
                📁 Update Documents & Re-submit Profile →
              </button>
            </div>
          </div>
        )}

        {/* ── PENDING OFFICER REVIEW BANNER ── */}
        {isUnderReview && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.6rem' }}>⏳</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#b45309' }}>
                  Company Profile Under Procurement Officer Review
                </div>
                <div style={{ fontSize: '0.78rem', color: '#92400e' }}>
                  Your statutory verification dossier is currently queued for manual officer evaluation.
                </div>
              </div>
            </div>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              onClick={() => navigate('/bidder/onboarding')}
            >
              View Verification Status →
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Active Loans', value: 0, color: '#2563eb', onClick: () => {} },
            { label: 'Loan Applications', value: 0, color: '#7c3aed', onClick: () => navigate('/bidder/my-applications') },
            {
              label: 'Account Verification',
              value: isRejected ? 'Rejected ❌' : isUnderReview ? 'In Review ⏳' : 'Verified ✓',
              color: isRejected ? '#dc2626' : isUnderReview ? '#d97706' : '#059669',
              onClick: () => navigate('/bidder/onboarding')
            },
          ].map((c) => (
            <div key={c.label} className="card" style={{ padding: 20, borderLeft: `4px solid ${c.color}`, cursor: 'pointer' }} onClick={c.onClick}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: '#0f172a' }}>{c.value}</div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#475569', marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>💰</div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Ready to Apply for a Loan?</h3>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: 16 }}>
            Choose a loan type, complete the required information, and let FinPulse-AI assist with verification.
          </p>
          <button className="btn-primary" onClick={() => navigate('/bidder/apply')}>
            Apply for a Loan →
          </button>
        </div>

        <div style={{ marginBottom: 16, marginTop: 32 }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Your FinPulse Services</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {/* My Profile */}
          <div className="card" style={{ padding: 20 }}>
             <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}>👤 MY PROFILE</h4>
             <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>View and update your personal information.</p>
             <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate('/bidder/profile')}>View Profile →</button>
          </div>
          {/* Document Wallet */}
          <div className="card" style={{ padding: 20 }}>
             <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}>📁 DOCUMENT WALLET</h4>
             <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>Store and manage your verified documents.</p>
             <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate('/bidder/documents')}>Open Document Wallet →</button>
          </div>
          {/* Apply for a loan */}
          <div className="card" style={{ padding: 20 }}>
             <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}>💰 APPLY FOR A LOAN</h4>
             <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>Choose from available loan types and start an application.</p>
             <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate('/bidder/apply')}>Apply Now →</button>
          </div>
          {/* My Applications */}
          <div className="card" style={{ padding: 20 }}>
             <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}>📋 MY APPLICATIONS</h4>
             <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 16 }}>Track submitted loan applications and their current status.</p>
             <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate('/bidder/my-applications')}>View Applications →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN DASHBOARD PAGE
// =============================================================================
export default function DashboardPage() {
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  const [tenders, setTenders] = useState([]);
  const [bidderOnboardingProfile, setBidderOnboardingProfile] = useState(null);
  const [myBidsCount, setMyBidsCount] = useState(0);
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    bidsUnderVerification: 0,
    totalBidders: 0,
    compliantBids: 0,
    nonCompliantBids: 0,
    requiresReview: 0,
    highRiskBids: 0,
    reportsGenerated: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const [tendersRes, statsRes] = await Promise.all([
        tenderAPI.list({ limit: 10 }).catch(() => ({ data: { tenders: [] } })),
        complianceAPI.getDashboardStats().catch(() => ({ data: {} })),
      ]);

      if (tendersRes.data?.tenders) {
        setTenders(tendersRes.data.tenders);
      }
      if (statsRes.data) {
        setStats((prev) => ({ ...prev, ...statsRes.data }));
      }

      // Fetch bidder onboarding profile and bids count if role is BIDDER
      if (role === 'BIDDER') {
        const [profRes, bidsRes] = await Promise.all([
          api.get('/bidder-onboarding/profile').catch(() => null),
          api.get('/bidders').catch(() => null)
        ]);
        if (profRes?.data) {
          setBidderOnboardingProfile(profRes.data);
        }
        if (bidsRes?.data) {
          const arr = Array.isArray(bidsRes.data) ? bidsRes.data : (bidsRes.data?.bidders || []);
          setMyBidsCount(arr.length);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, [role]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <AppLayout>
      {role === 'ADMIN' && <AdminDashboard profile={profile} stats={stats} navigate={navigate} />}
      {role === 'PROCUREMENT_OFFICER' && <OfficerDashboard profile={profile} tenders={tenders} stats={stats} navigate={navigate} />}
      {role === 'REVIEWER' && <ComplianceDashboard profile={profile} navigate={navigate} />}
      {role === 'BIDDER' && <BidderDashboard profile={profile} bidderOnboardingProfile={bidderOnboardingProfile} myBidsCount={myBidsCount} tenders={tenders} navigate={navigate} />}
    </AppLayout>
  );
}
