// Users Page — All registered users with details
import React, { useState } from 'react';
import { Search, MapPin, Phone, Wheat, Maximize2 } from 'lucide-react';
import { useAllUsers, useAllAuth, useAllSensorData, useAllIrrigation, formatDate } from '../hooks/useFirebase';

export default function UsersPage() {
  const { users, loading } = useAllUsers();
  const { authRecords } = useAllAuth();
  const { sensorData } = useAllSensorData();
  const { irrigationData } = useAllIrrigation();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.userId || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q)
    );
  });

  // Find auth record for a user
  const getAuthInfo = (email) => {
    if (!email) return null;
    const key = email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
    return authRecords.find((a) => a.key === key);
  };

  return (
    <div className="page animate-in">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered farmer{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-search" style={{ width: 280 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="user-search"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Location</th>
                <th>Farm</th>
                <th>Primary Crops</th>
                <th>Device Code</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><div className="skeleton" style={{ height: 40 }}></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 40 }}>No users found</td></tr>
              ) : (
                filtered.map((user) => {
                  const auth = getAuthInfo(user.email);
                  return (
                    <tr key={user.userId}>
                      <td>
                        <div className="user-cell">
                          <img
                            className="user-cell-avatar"
                            src={user.avatarUri || 'https://www.w3schools.com/howto/img_avatar.png'}
                            alt={user.name}
                          />
                          <div className="user-cell-info">
                            <p>{user.name || 'Unnamed'}</p>
                            <span>{user.email || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} style={{ color: 'var(--gray-400)' }} />
                          <span>{user.location || '—'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{user.farmName || '—'}</td>
                      <td>{user.primaryCrops || '—'}</td>
                      <td>
                        {user.deviceCode ? (
                          <span className="badge green">{user.deviceCode}</span>
                        ) : (
                          <span className="badge gray">Not paired</span>
                        )}
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        {auth ? formatDate(auth.createdAt) : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedUser(selectedUser?.userId === user.userId ? null : user)}
                        >
                          <Maximize2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded User Detail */}
      {selectedUser && (
        <div className="content-grid" style={{ marginTop: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{selectedUser.name}'s Profile</div>
                <div className="card-subtitle">User ID: {selectedUser.userId}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <DetailRow icon={<Phone size={14} />} label="Phone" value={selectedUser.phoneNumber} />
              <DetailRow icon={<MapPin size={14} />} label="Location" value={selectedUser.location} />
              <DetailRow icon={<Wheat size={14} />} label="Farm Name" value={selectedUser.farmName} />
              <DetailRow icon={<Maximize2 size={14} />} label="Land Area" value={selectedUser.landArea} />
              <DetailRow icon={<Wheat size={14} />} label="Crops" value={selectedUser.primaryCrops} />
              <DetailRow label="Device Code" value={selectedUser.deviceCode || 'Not paired'} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Device Data</div>
                <div className="card-subtitle">Latest sensor & irrigation state</div>
              </div>
            </div>
            {(() => {
              const sensor = sensorData[selectedUser.userId]?.latest;
              const irrig = irrigationData[selectedUser.userId];
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <MetricBox label="Soil Moisture" value={sensor?.soilMoisture ?? '—'} unit="%" color={sensor?.soilMoisture < 30 ? 'var(--red-600)' : 'var(--green-600)'} />
                  <MetricBox label="Temperature" value={sensor?.temperature ?? '—'} unit="°C" />
                  <MetricBox label="Humidity" value={sensor?.humidity ?? '—'} unit="%" />
                  <MetricBox label="Pump Status" value={irrig?.pumpStatus ?? '—'} color={irrig?.pumpStatus === 'ON' ? 'var(--green-600)' : 'var(--gray-400)'} />
                  <MetricBox label="Mode" value={irrig?.mode ?? '—'} />
                  <MetricBox label="Threshold" value={irrig?.threshold ?? '—'} unit="%" />
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      {icon && <span style={{ color: 'var(--gray-400)' }}>{icon}</span>}
      <div>
        <div className="stat-label">{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{value || '—'}</div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, unit, color }) {
  return (
    <div className="device-metric">
      <div className="device-metric-value" style={color ? { color } : {}}>
        {value}{unit || ''}
      </div>
      <div className="device-metric-label">{label}</div>
    </div>
  );
}
