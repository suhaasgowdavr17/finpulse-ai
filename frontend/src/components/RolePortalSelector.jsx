import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PORTAL_ROLES = [
  {
    id: 'CUSTOMER',
    roleKey: 'BIDDER',
    title: 'Bank Customer',
    badge: '👤',
    description: 'Apply for loans, manage your documents, and track your application.',
    color: '#2563eb',
    circleBg: '#dbeafe',
    btnColor: '#2563eb',
    btnHover: '#1d4ed8',
    btnText: 'Customer Login',
    path: '/bidder/dashboard',
    defaultEmail: 'vendor@abcindustries.com',
    demoName: 'Vikram Mehta (Bank Customer)',
    officerInfo: 'Retail Banking Customer'
  },
  {
    id: 'OFFICER',
    roleKey: 'PROCUREMENT_OFFICER',
    title: 'Bank Officer',
    badge: '🏦',
    description: 'Review applications, investigate verification flags, and make lending decisions.',
    color: '#059669',
    circleBg: '#dcfce7',
    btnColor: '#059669',
    btnHover: '#047857',
    btnText: 'Officer Login',
    path: '/procurement/dashboard',
    defaultEmail: 'officer@complygem.gov.in',
    demoName: 'Rajesh Kumar (Bank Officer)',
    officerInfo: 'Credit Review Department'
  }
];

export default function RolePortalSelector({ onSelectPortal }) {
  const navigate = useNavigate();

  const handlePortalClick = (portal) => {
    if (onSelectPortal) {
      onSelectPortal(portal);
    } else {
      navigate(`/login?portal=${portal.roleKey}`);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        alignItems: 'stretch',
        justifyContent: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {PORTAL_ROLES.map((portal) => (
          <div
            key={portal.id}
            className="portal-card"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'center',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => handlePortalClick(portal)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = portal.color;
              e.currentTarget.style.boxShadow = '0 20px 35px -10px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)';
            }}
          >
            {/* Circular Icon Badge */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                margin: '0 auto',
                background: portal.circleBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.85rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              }}>
                {portal.badge}
              </div>
            </div>

            {/* Title & Description */}
            <div style={{ flex: 1, marginBottom: 24 }}>
              <h3 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.25rem',
                color: '#0f172a',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}>
                {portal.title}
              </h3>
              <p style={{
                fontSize: '0.84rem',
                color: '#64748b',
                lineHeight: 1.55,
                margin: 0,
              }}>
                {portal.description}
              </p>
            </div>

            {/* Action Button */}
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePortalClick(portal);
                }}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '30px',
                  background: portal.btnColor,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: `0 4px 14px ${portal.btnColor}35`,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = portal.btnHover;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = portal.btnColor;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>➜</span> {portal.btnText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
