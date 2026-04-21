// Alerts Page — System alerts & notifications
import React, { useState } from 'react';
import {
  Bell, AlertTriangle, CheckCircle, Info, Zap, X
} from 'lucide-react';
import { useAllAlerts, useAllUsers, formatTime, formatDate } from '../hooks/useFirebase';
import { db, ref, set } from '../firebase';

export default function AlertsPage() {
  const { alerts, loading } = useAllAlerts();
  const { users } = useAllUsers();
  const [filter, setFilter] = useState('all'); // all, critical, warning, info, unread

  const userMap = {};
  users.forEach((u) => { userMap[u.userId] = u; });

  const filtered = alerts.filter((a) => {
    if (filter === 'unread') return !a.read;
    if (filter === 'all') return true;
    return a.severity === filter;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkRead = async (alert) => {
    try {
      await set(ref(db, `alerts/${alert.userId}/${alert.id}/read`), true);
    } catch (e) {
      console.error('Failed to mark alert as read:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      for (const alert of alerts.filter((a) => !a.read)) {
        await set(ref(db, `alerts/${alert.userId}/${alert.id}/read`), true);
      }
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const severityIcon = (severity) => {
    if (severity === 'critical') return <AlertTriangle size={16} />;
    if (severity === 'warning') return <Zap size={16} />;
    return <Info size={16} />;
  };

  const severityColor = (severity) => {
    if (severity === 'critical') return 'red';
    if (severity === 'warning') return 'orange';
    return 'blue';
  };

  return (
    <div className="page animate-in">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">
            {alerts.length} total • {unreadCount} unread • {criticalCount} critical
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="toggle-group">
            <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ALL</button>
            <button className={`toggle-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>UNREAD</button>
            <button className={`toggle-btn ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>CRITICAL</button>
            <button className={`toggle-btn ${filter === 'warning' ? 'active' : ''}`} onClick={() => setFilter('warning')}>WARNING</button>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              <CheckCircle size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon red"><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-label">CRITICAL ALERTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange"><Zap size={20} /></div>
          </div>
          <div className="stat-value">{warningCount}</div>
          <div className="stat-label">WARNINGS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon blue"><Bell size={20} /></div>
          </div>
          <div className="stat-value">{unreadCount}</div>
          <div className="stat-label">UNREAD</div>
        </div>
      </div>

      {/* Alert List */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Alert Feed</div>
            <div className="card-subtitle">Showing {filtered.length} alerts</div>
          </div>
        </div>
        <div className="activity-feed">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Bell size={32} />
              <p>No alerts to show</p>
            </div>
          ) : (
            filtered.map((alert, i) => {
              const user = userMap[alert.userId];
              const color = severityColor(alert.severity);
              return (
                <div
                  className="activity-item"
                  key={alert.id || i}
                  style={{
                    background: !alert.read ? 'var(--gray-50)' : 'transparent',
                    borderRadius: !alert.read ? 12 : 0,
                    padding: !alert.read ? '14px 12px' : '14px 0',
                  }}
                >
                  <div className={`activity-icon ${color}`}>
                    {severityIcon(alert.severity)}
                  </div>
                  <div className="activity-text" style={{ flex: 1 }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${color}`}>{alert.severity || 'info'}</span>
                      <span className="badge gray">{alert.type || 'system'}</span>
                      {!alert.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue-600)' }}></span>}
                    </p>
                    <p style={{ marginTop: 4 }}>{alert.message || 'No message'}</p>
                    <span>{user?.name || alert.userId} • {formatTime(alert.timestamp)}</span>
                  </div>
                  {!alert.read && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleMarkRead(alert)}
                      title="Mark as read"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
