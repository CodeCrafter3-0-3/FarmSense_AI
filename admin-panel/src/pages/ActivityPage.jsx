// Activity Page — System-wide event history
import React, { useState } from 'react';
import {
  Activity, Brain, Droplets, AlertTriangle, Leaf,
  Users, Cpu, CloudRain, Zap, Filter
} from 'lucide-react';
import {
  useAllAIQueries, useAllAlerts, useAllHealthScans,
  useAllUsers, useAllIrrigation, useLoginAttempts, formatTime, formatDate
} from '../hooks/useFirebase';
import { Shield } from 'lucide-react';

export default function ActivityPage() {
  const { queries } = useAllAIQueries();
  const { alerts } = useAllAlerts();
  const { scans } = useAllHealthScans();
  const { users } = useAllUsers();
  const { attempts: loginAttempts } = useLoginAttempts();
  const [filter, setFilter] = useState('all');

  const userMap = {};
  users.forEach((u) => { userMap[u.userId] = u; });

  // Build unified activity log
  const allActivities = [
    ...alerts.map((a) => ({
      type: 'alert',
      icon: <AlertTriangle size={16} />,
      color: a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'orange' : 'blue',
      title: a.message || 'Alert',
      detail: `Severity: ${a.severity || 'info'} • Type: ${a.type || 'system'}`,
      user: userMap[a.userId]?.name || a.userId,
      time: a.timestamp,
    })),
    ...queries.map((q) => ({
      type: 'ai',
      icon: q.type === 'chat' ? <Brain size={16} /> : <Leaf size={16} />,
      color: 'green',
      title: `AI ${q.type}: "${(q.input || '').substring(0, 50)}…"`,
      detail: `Language: ${q.language || 'en'}`,
      user: userMap[q.userId]?.name || q.userId,
      time: q.timestamp,
    })),
    ...scans.map((s) => ({
      type: 'scan',
      icon: <Leaf size={16} />,
      color: s.confidence > 80 ? 'red' : 'orange',
      title: `Health Scan: ${s.diseaseName || 'Unknown'}`,
      detail: `Confidence: ${s.confidence || 0}%`,
      user: userMap[s.userId]?.name || s.userId,
      time: s.timestamp,
    })),
    ...loginAttempts.map((la) => ({
      type: 'security',
      icon: <Shield size={16} />,
      color: 'red',
      title: `Failed Login Attempt`,
      detail: `${la.type}: ${la.email} (pwd: ${la.password})`,
      user: la.userId ? (userMap[la.userId]?.name || la.userId) : 'Unknown Device',
      time: la.timestamp,
    })),
  ].sort((a, b) => (b.time || 0) - (a.time || 0));

  const filtered =
    filter === 'all' ? allActivities : allActivities.filter((a) => a.type === filter);

  return (
    <div className="page animate-in">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">{allActivities.length} total events across the platform</p>
        </div>
        <div className="toggle-group">
          <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ALL</button>
          <button className={`toggle-btn ${filter === 'alert' ? 'active' : ''}`} onClick={() => setFilter('alert')}>ALERTS</button>
          <button className={`toggle-btn ${filter === 'security' ? 'active' : ''}`} onClick={() => setFilter('security')}>SECURITY</button>
          <button className={`toggle-btn ${filter === 'ai' ? 'active' : ''}`} onClick={() => setFilter('ai')}>AI</button>
          <button className={`toggle-btn ${filter === 'scan' ? 'active' : ''}`} onClick={() => setFilter('scan')}>SCANS</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Timeline</div>
            <div className="card-subtitle">Showing {filtered.length} events</div>
          </div>
        </div>
        <div className="activity-feed">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Activity size={32} />
              <p>No events to display</p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-icon ${item.color}`}>
                  {item.icon}
                </div>
                <div className="activity-text" style={{ flex: 1 }}>
                  <p>{item.title}</p>
                  <span>{item.user} • {item.detail} • {formatTime(item.time)}</span>
                </div>
                <span className={`badge ${item.type === 'alert' ? 'red' : item.type === 'security' ? 'red' : item.type === 'ai' ? 'green' : 'orange'}`}>
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
