import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RolePortalSelector from '../components/RolePortalSelector';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', position: 'relative' }}>
      
      {/* ─── 1. NAVBAR ─────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src="/finpulse-logo.png"
              alt="FinPulse-AI Logo"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                objectFit: 'contain',
              }}
            />
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                FINPULSE
              </span>
              <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '1.2rem', marginLeft: 4 }}>-AI</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
            <a href="#home" className="btn-ghost" style={{ fontSize: '0.85rem' }}>Home</a>
            <a href="#how-it-works" className="btn-ghost" style={{ fontSize: '0.85rem' }}>How It Works</a>
            <a href="#features" className="btn-ghost" style={{ fontSize: '0.85rem' }}>Features</a>
          </nav>

          {/* Sign In CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ───────────────────────────────────────────── */}
      <section id="home" style={{
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
        padding: '70px 24px 80px',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img
          src="/finpulse-logo.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-30px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 520,
            height: 520,
            objectFit: 'contain',
            opacity: 0.08,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 20px 40px rgba(37,99,235,0.18))',
          }}
        />
        <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 30,
            background: '#dbeafe',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 800,
            letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
            AI-POWERED LENDING INTELLIGENCE
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.4rem, 4.2vw, 3.4rem)',
            lineHeight: 1.18,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            Smarter Loan Verification.<br/>Faster Lending Decisions.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.7,
            color: '#475569',
            maxWidth: 680,
            margin: '0 auto 36px',
          }}>
            FinPulse-AI automates document verification, detects inconsistencies, and assists bank officers with evidence-based recommendations while keeping humans in control of the final lending decision.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
            <Link to="/login?portal=BIDDER" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '0.98rem' }}>
              Bank Customer →
            </Link>
            <Link to="/login?portal=PROCUREMENT_OFFICER" className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.98rem' }}>
              Bank Officer →
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, paddingTop: 28, borderTop: '1px solid #e2e8f0' }}>
            {[
              { val: 'AI-ASSISTED', label: 'VERIFICATION' },
              { val: 'MULTI-SOURCE',   label: 'VALIDATION' },
              { val: 'HUMAN',    label: 'DECISION' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: '#2563eb' }}>
                  {m.val}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3, fontWeight: 700 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. ACCESS YOUR PORTAL ───────── */}
      <section id="portals" style={{ maxWidth: 1240, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2.3rem', color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Access Your FinPulse Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 540, margin: '0 auto' }}>
            Select your role to continue.
          </p>
        </div>

        <RolePortalSelector />
      </section>

      {/* ─── 4. HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            From application to verified decision
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#0f172a' }}>
            How FinPulse-AI Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { step: '01', title: 'Loan Application', desc: 'Customer selects the loan type and submits the required information and documents.', icon: '📝' },
            { step: '02', title: 'Document Verification', desc: 'AI extracts information from uploaded documents and compares it with available customer and verification data.', icon: '🔎' },
            { step: '03', title: 'AI Verification & Flagging', desc: 'FinPulse identifies name mismatches, invalid information, expired documents, and missing data. AI explains the issue.', icon: '🚩' },
            { step: '04', title: 'Human Review & Decision', desc: 'Flagged applications are sent to the bank officer. The officer reviews the evidence and makes the final decision.', icon: '👩‍⚖️' },
          ].map((item) => (
            <div key={item.step} className="card" style={{ padding: 26, position: 'relative' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', marginBottom: 4 }}>STEP {item.step}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. FEATURES SECTION ───────────────────────────────────────── */}
      <section id="features" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '70px 24px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#0f172a' }}>
              Built for Faster, Safer Lending
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { icon: '🤖', title: 'AI Document Verification', desc: 'Automatically extracts and checks information from uploaded documents.' },
              { icon: '🔎', title: 'Intelligent Mismatch Detection', desc: 'Identifies inconsistencies across applications, documents and verification sources.' },
              { icon: '📁', title: 'Digital Document Wallet', desc: 'Customers can securely maintain their verified documents and upload updated versions when required.' },
              { icon: '🚩', title: 'AI-Powered Recommendations', desc: 'Flags are explained to officers with supporting evidence and recommended actions.' },
              { icon: '👨‍💼', title: 'Human-in-the-Loop', desc: 'AI assists the officer; the final lending decision remains with the authorized bank officer.' },
              { icon: '⚛️', title: 'Quantum-Assisted Optimization', desc: 'Uses QUBO/QAOA alongside classical optimization to explore efficient loan portfolio selection.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '48px 24px 32px',
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
          marginBottom: 28,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <img
                src="/finpulse-logo.png"
                alt="FinPulse-AI Logo"
                style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }}
              />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>
                FINPULSE-AI
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              AI-Powered Loan Verification & Decision Support
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: '0.84rem' }}>
            <a href="#home" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Home</a>
            <a href="#how-it-works" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>How It Works</a>
            <a href="#features" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Features</a>
            <a href="#contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Contact</a>
          </div>
        </div>

        <div style={{
          maxWidth: 1240, margin: '0 auto', paddingTop: 20,
          borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'center', fontSize: '0.78rem', color: '#94a3b8',
        }}>
          <span>© 2026 FinPulse-AI. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
