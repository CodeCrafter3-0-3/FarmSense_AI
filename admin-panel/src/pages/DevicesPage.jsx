// Devices Page — ESP32 Module Monitoring
import React from 'react';
import { Cpu, Wifi, WifiOff, Thermometer, Droplets, CloudRain, Zap } from 'lucide-react';
import {
  useAllUsers, useAllSensorData, useAllIrrigation,
  useDeviceHeartbeats, formatTime
} from '../hooks/useFirebase';

export default function DevicesPage() {
  const { users } = useAllUsers();
  const { sensorData } = useAllSensorData();
  const { irrigationData } = useAllIrrigation();
  const { heartbeats } = useDeviceHeartbeats();

  // Build device list from users who have a deviceCode or sensor data
  const devices = users.map((user) => {
    const deviceId = user.deviceCode || user.userId;
    const sensor = sensorData[deviceId]?.latest || sensorData[user.userId]?.latest || {};
    const irrig = irrigationData[deviceId] || irrigationData[user.userId] || {};
    const hb = heartbeats[deviceId] || heartbeats[user.userId] || {};
    const isOnline = hb.lastSeen ? Date.now() - hb.lastSeen < 300000 : (sensor.timestamp ? Date.now() - sensor.timestamp < 300000 : false);

    return {
      userId: user.userId,
      userName: user.name || 'Unknown',
      deviceCode: user.deviceCode || 'Not paired',
      farmName: user.farmName || '—',
      location: user.location || '—',
      isOnline,
      moisture: sensor.soilMoisture,
      temp: sensor.temperature,
      humidity: sensor.humidity,
      pumpStatus: irrig.pumpStatus || 'OFF',
      mode: irrig.mode || 'MANUAL',
      threshold: irrig.threshold,
      lastSeen: hb.lastSeen || sensor.timestamp,
      purpose: determinePurpose(irrig, sensor),
    };
  });

  const onlineCount = devices.filter((d) => d.isOnline).length;

  return (
    <div className="page animate-in">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">ESP32 Devices</h1>
          <p className="page-subtitle">
            {devices.length} module{devices.length !== 1 ? 's' : ''} registered • {onlineCount} online
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge green" style={{ fontSize: 12, padding: '6px 14px' }}>
            <Wifi size={14} /> {onlineCount} Online
          </span>
          <span className="badge gray" style={{ fontSize: 12, padding: '6px 14px' }}>
            <WifiOff size={14} /> {devices.length - onlineCount} Offline
          </span>
        </div>
      </div>

      <div className="device-grid">
        {devices.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Cpu size={48} />
              <p>No ESP32 modules found</p>
            </div>
          </div>
        ) : (
          devices.map((device, i) => (
            <div className="device-card" key={i}>
              <div className="device-card-header">
                <div>
                  <div className="device-card-id">{device.deviceCode}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>{device.userName}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{device.farmName} • {device.location}</div>
                </div>
                <div className={`status-dot ${device.isOnline ? 'online' : 'offline'}`}>
                  {device.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Purpose badge */}
              <div style={{ marginBottom: 14 }}>
                <span className="badge blue">{device.purpose}</span>
              </div>

              {/* Sensor metrics */}
              <div className="device-card-metrics">
                <div className="device-metric">
                  <div className="device-metric-value" style={{ color: getMoistureColor(device.moisture) }}>
                    {device.moisture ?? '—'}%
                  </div>
                  <div className="device-metric-label">Moisture</div>
                </div>
                <div className="device-metric">
                  <div className="device-metric-value">{device.temp ?? '—'}°C</div>
                  <div className="device-metric-label">Temp</div>
                </div>
                <div className="device-metric">
                  <div className="device-metric-value">{device.humidity ?? '—'}%</div>
                  <div className="device-metric-label">Humidity</div>
                </div>
              </div>

              {/* Footer: pump status + last seen */}
              <div className="device-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Droplets size={14} style={{ color: device.pumpStatus === 'ON' ? 'var(--blue-600)' : 'var(--gray-400)' }} />
                  <span className={`badge ${device.pumpStatus === 'ON' ? 'blue' : 'gray'}`}>
                    Pump {device.pumpStatus}
                  </span>
                  <span className={`badge ${device.mode === 'AUTO' ? 'green' : 'orange'}`}>
                    {device.mode}
                  </span>
                </div>
                <span>{formatTime(device.lastSeen)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function determinePurpose(irrig, sensor) {
  const purposes = [];
  if (sensor.soilMoisture !== undefined) purposes.push('Soil Monitoring');
  if (irrig.pumpStatus) purposes.push('Irrigation Control');
  if (sensor.temperature !== undefined) purposes.push('Climate Sensing');
  return purposes.length > 0 ? purposes.join(' + ') : 'General Monitoring';
}

function getMoistureColor(val) {
  if (val === undefined || val === null) return 'var(--gray-400)';
  if (val < 30) return 'var(--red-600)';
  if (val < 50) return 'var(--orange-600)';
  return 'var(--green-600)';
}
