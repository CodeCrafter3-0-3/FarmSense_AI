// Dashboard — Admin Overview Page
import React from 'react';
import {
  Users, Cpu, Droplets, Brain, Activity, AlertTriangle,
  TrendingUp, TrendingDown, Thermometer, CloudRain, Leaf, Zap
} from 'lucide-react';
import {
  useAllUsers, useAllSensorData, useAllIrrigation,
  useAllAIQueries, useAllAlerts, useAllHealthScans,
  useDeviceHeartbeats, useWeatherData, formatTime
} from '../hooks/useFirebase';

export default function Dashboard() {
  const { users, loading: usersLoading } = useAllUsers();
  const { sensorData } = useAllSensorData();
  const { irrigationData } = useAllIrrigation();
  const { queries: aiQueries } = useAllAIQueries();
  const { alerts } = useAllAlerts();
  const { scans: healthScans } = useAllHealthScans();
  const { heartbeats } = useDeviceHeartbeats();
  const { weather } = useWeatherData();

  // Derived metrics
  const totalUsers = users.length;
  const onlineDevices = Object.values(heartbeats).filter(
    (d) => d?.lastSeen && Date.now() - d.lastSeen < 300000 // 5 min
  ).length;
  const totalDevices = Object.keys(sensorData).length || Object.keys(irrigationData).length || totalUsers;
  const activePumps = Object.values(irrigationData).filter((d) => d?.pumpStatus === 'ON').length;
  const totalAIQueries = aiQueries.length;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  // Recent activity (combine alerts + AI queries, sort by time)
  const recentActivity = [
    ...alerts.slice(0, 5).map((a) => {
      const user = users.find(u => u.userId === a.userId);
      return {
        type: a.type || 'system',
        text: a.message,
        time: a.timestamp,
        userId: a.userId,
        userName: user?.name || a.userId,
        color: a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'orange' : 'blue',
      };
    }),
    ...aiQueries.slice(0, 5).map((q) => {
      const user = users.find(u => u.userId === q.userId);
      return {
        type: 'ai',
        text: `AI ${q.type} query: "${(q.input || '').substring(0, 60)}…"`,
        time: q.timestamp,
        userId: q.userId,
        userName: user?.name || q.userId,
        color: 'green',
      };
    }),
  ]
    .sort((a, b) => (b.time || 0) - (a.time || 0))
    .slice(0, 8);

  // Per-user sensor summaries
  const sensorSummaries = Object.entries(sensorData).map(([userId, data]) => {
    const latest = data?.latest || {};
    const user = users.find(u => u.userId === userId);
    return {
      userId,
      userName: user?.name || userId, // Use real name if found
      moisture: latest.soilMoisture ?? '—',
      temp: latest.temperature ?? '—',
      humidity: latest.humidity ?? '—',
      timestamp: latest.timestamp,
    };
  });

  const iconForActivity = (color) => {
    const iconMap = { red: <AlertTriangle size={16} />, orange: <Zap size={16} />, blue: <CloudRain size={16} />, green: <Brain size={16} /> };
    return iconMap[color] || <Activity size={16} />;
  };

  return (
    <div className="page animate-in">
      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon green"><Users size={20} /></div>
            <div className="stat-trend up"><TrendingUp size={12} /> +{totalUsers > 0 ? totalUsers : 0}</div>
          </div>
          <div className="stat-value">{totalUsers}</div>
          <div className="stat-label">TOTAL USERS</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon blue"><Cpu size={20} /></div>
            <div className="stat-trend up"><TrendingUp size={12} /> {onlineDevices} online</div>
          </div>
          <div className="stat-value">{totalDevices}</div>
          <div className="stat-label">ESP32 MODULES</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange"><Droplets size={20} /></div>
            <span className={`badge ${activePumps > 0 ? 'green' : 'gray'}`}>
              {activePumps > 0 ? `${activePumps} ACTIVE` : 'ALL OFF'}
            </span>
          </div>
          <div className="stat-value">{activePumps}</div>
          <div className="stat-label">PUMPS RUNNING</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon red"><Brain size={20} /></div>
            <div className="stat-trend up"><TrendingUp size={12} /> queries</div>
          </div>
          <div className="stat-value">{totalAIQueries}</div>
          <div className="stat-label">AI QUERIES</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Activity</div>
              <div className="card-subtitle">Latest events across all users</div>
            </div>
            <span className="badge red">{unreadAlerts} unread</span>
          </div>
          <div className="activity-feed">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-icon ${item.color}`}>
                    {iconForActivity(item.color)}
                  </div>
                  <div className="activity-text">
                    <p>{item.text || 'System event'}</p>
                    <span>{item.userName} • {formatTime(item.time)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Activity size={32} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Sensor Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Sensor Readings</div>
              <div className="card-subtitle">Real-time data from all devices</div>
            </div>
            <span className="badge green">LIVE</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Device / User</th>
                  <th>Moisture</th>
                  <th>Temp</th>
                  <th>Humidity</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {sensorSummaries.length > 0 ? (
                  sensorSummaries.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{s.userName}</td>
                      <td>
                        <span className={`badge ${s.moisture < 30 ? 'red' : s.moisture < 50 ? 'orange' : 'green'}`}>
                          {s.moisture}%
                        </span>
                      </td>
                      <td>{s.temp}°C</td>
                      <td>{s.humidity}%</td>
                      <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatTime(s.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state" style={{ padding: '30px 0' }}>
                        <Thermometer size={24} />
                        <p>No sensor data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="content-grid three-col">
        {/* Weather */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Weather</div>
              <div className="card-subtitle">{weather?.current?.city || 'Current location'}</div>
            </div>
            <CloudRain size={18} style={{ color: 'var(--blue-600)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 300, color: 'var(--green-900)' }}>
              {weather?.current?.temp ?? '—'}°
            </span>
            <span style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 8 }}>C</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, padding: '10px 8px', background: 'var(--gray-50)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{weather?.current?.humidity ?? '—'}%</div>
              <div className="device-metric-label">Humidity</div>
            </div>
            <div style={{ flex: 1, padding: '10px 8px', background: 'var(--gray-50)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{weather?.current?.windSpeed ?? '—'}</div>
              <div className="device-metric-label">Wind m/s</div>
            </div>
          </div>
        </div>

        {/* Health Scans */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Crop Health</div>
              <div className="card-subtitle">{healthScans.length} scans total</div>
            </div>
            <Leaf size={18} style={{ color: 'var(--green-600)' }} />
          </div>
          {healthScans.slice(0, 3).map((scan, i) => {
            const user = users.find(u => u.userId === scan.userId);
            return (
              <div className="activity-item" key={i}>
                <div className={`activity-icon ${scan.confidence > 80 ? 'red' : 'orange'}`}>
                  <Leaf size={14} />
                </div>
                <div className="activity-text">
                  <p>{scan.diseaseName || 'Scan result'}</p>
                  <span>{user?.name || scan.userId} • {scan.confidence}% confidence</span>
                </div>
              </div>
            );
          })}
          {healthScans.length === 0 && (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Leaf size={24} />
              <p>No health scans yet</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">System Health</div>
              <div className="card-subtitle">Platform status</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="stat-label">Database</span>
                <span className="badge green">CONNECTED</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '100%' }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="stat-label">Devices Online</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{onlineDevices}/{totalDevices}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: totalDevices > 0 ? `${(onlineDevices / totalDevices) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="stat-label">Alerts Resolved</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {alerts.filter(a => a.read).length}/{alerts.length}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: alerts.length > 0 ? `${(alerts.filter(a => a.read).length / alerts.length) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
