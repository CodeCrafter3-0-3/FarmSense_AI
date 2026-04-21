// Irrigation Page — Pump controls & water usage across all users
import React from 'react';
import { Droplets, Zap, Clock, Gauge } from 'lucide-react';
import { useAllUsers, useAllIrrigation, formatTime } from '../hooks/useFirebase';

export default function IrrigationPage() {
  const { users } = useAllUsers();
  const { irrigationData, loading } = useAllIrrigation();

  // Build irrigation entries per user
  const entries = users.map((user) => {
    const deviceId = user.deviceCode || user.userId;
    const irrig = irrigationData[deviceId] || irrigationData[user.userId] || {};
    const waterHistory = irrig.waterUsageHistory ? Object.values(irrig.waterUsageHistory) : [];
    const totalWater = waterHistory.reduce((sum, v) => sum + (v || 0), 0);

    return {
      userId: user.userId,
      name: user.name || 'Unknown',
      farmName: user.farmName || '—',
      pumpStatus: irrig.pumpStatus || 'OFF',
      mode: irrig.mode || 'MANUAL',
      threshold: irrig.threshold ?? 30,
      timer: irrig.timer,
      lastWatered: irrig.lastWatered,
      totalWater: totalWater.toFixed(1),
      waterHistory,
    };
  });

  const activePumps = entries.filter((e) => e.pumpStatus === 'ON').length;
  const autoModeCount = entries.filter((e) => e.mode === 'AUTO').length;

  return (
    <div className="page animate-in">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Irrigation Control</h1>
          <p className="page-subtitle">Monitor pump status and water usage across all farms</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon blue"><Droplets size={20} /></div>
            <span className={`badge ${activePumps > 0 ? 'green' : 'gray'}`}>
              {activePumps > 0 ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
          <div className="stat-value">{activePumps}</div>
          <div className="stat-label">PUMPS RUNNING</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon green"><Zap size={20} /></div>
          </div>
          <div className="stat-value">{autoModeCount}</div>
          <div className="stat-label">AUTO MODE</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange"><Gauge size={20} /></div>
          </div>
          <div className="stat-value">{entries.length - autoModeCount}</div>
          <div className="stat-label">MANUAL MODE</div>
        </div>
      </div>

      {/* Irrigation Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Irrigation Systems</div>
            <div className="card-subtitle">Real-time pump and water data</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User / Farm</th>
                <th>Pump</th>
                <th>Mode</th>
                <th>Threshold</th>
                <th>Timer</th>
                <th>Total Water (hrs)</th>
                <th>Weekly Usage</th>
                <th>Last Watered</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td>
                    <div className="user-cell-info">
                      <p>{entry.name}</p>
                      <span>{entry.farmName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${entry.pumpStatus === 'ON' ? 'blue' : 'gray'}`}>
                      {entry.pumpStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${entry.mode === 'AUTO' ? 'green' : 'orange'}`}>
                      {entry.mode}
                    </span>
                  </td>
                  <td>{entry.threshold}%</td>
                  <td>{entry.timer ? `${entry.timer} min` : '—'}</td>
                  <td style={{ fontWeight: 600 }}>{entry.totalWater}h</td>
                  <td>
                    <div className="mini-chart">
                      {(entry.waterHistory.length > 0 ? entry.waterHistory : [0, 0, 0, 0, 0, 0, 0]).map((val, j) => {
                        const max = Math.max(...entry.waterHistory, 1);
                        const height = Math.max(4, (val / max) * 36);
                        return (
                          <div
                            key={j}
                            className={`mini-bar ${j === entry.waterHistory.length - 1 ? 'active' : ''}`}
                            style={{ height }}
                          />
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {formatTime(entry.lastWatered)}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                    No irrigation data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
