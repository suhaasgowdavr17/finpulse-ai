import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Sidebar';
import toast from 'react-hot-toast';

const DEMO_NOTIFICATIONS = [
  { id: 'n1', title: 'New Loan Application Received', desc: 'A customer submitted 6 documents for loan review', time: '10 mins ago', type: 'BID', unread: true, link: '/bids' },
  { id: 'n2', title: 'High-Risk Application Detected', desc: 'A customer application was flagged for missing required documents (Score: 48%)', time: '1 hour ago', type: 'ALERT', unread: true, link: '/risk-alerts' },
  { id: 'n3', title: 'Manual Verification Requested', desc: 'Dr. Anita Desai flagged OEM Authorization validity scope for review on ABC Industries', time: '2 hours ago', type: 'REVIEW', unread: true, link: '/compliance/4c57ba4b-7854-4dbf-b0fc-ac987e46f9bf' },
  { id: 'n4', title: 'Application Review Deadline Approaching', desc: 'Loan application reviews are due in 7 days. 5 applications received.', time: '1 day ago', type: 'DEADLINE', unread: false, link: '/tenders' },
  { id: 'n5', title: 'Compliance Report Generated', desc: 'Official evaluation PDF signed and recorded in immutable audit log', time: '2 days ago', type: 'REPORT', unread: false, link: '/reports' },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
            SYSTEM NOTIFICATIONS
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.45rem', color: '#0f172a', marginBottom: 4 }}>
            Notifications & Operational Alerts
          </h1>
          <p style={{ color: '#475569', fontSize: '0.88rem' }}>
            Real-time loan application alerts, verification updates, and review notifications
          </p>
        </div>
        <button className="btn-secondary" onClick={markAllAsRead}>
          ✓ Mark All as Read
        </button>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 840 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate(n.link)}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '16px 20px',
                borderLeft: n.unread ? '4px solid #2563eb' : '1px solid #e2e8f0',
                background: n.unread ? '#eff6ff' : '#ffffff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                    {n.title}
                  </span>
                  {n.unread && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  {n.desc}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 16 }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
