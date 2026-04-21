// AI Queries Page — All AI interactions across users
import React, { useState } from 'react';
import { Brain, MessageSquare, Image, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAllAIQueries, useAllUsers, formatDate, formatTime } from '../hooks/useFirebase';

export default function AIQueriesPage() {
  const { queries, loading } = useAllAIQueries();
  const { users } = useAllUsers();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, chat, image
  const [expandedId, setExpandedId] = useState(null);

  const userMap = {};
  users.forEach((u) => { userMap[u.userId] = u; });

  const filtered = queries.filter((q) => {
    if (filter !== 'all' && q.type !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (q.input || '').toLowerCase().includes(s) ||
        (q.response || '').toLowerCase().includes(s) ||
        (q.userId || '').toLowerCase().includes(s) ||
        (userMap[q.userId]?.name || '').toLowerCase().includes(s)
      );
    }
    return true;
  });

  const chatCount = queries.filter((q) => q.type === 'chat').length;
  const imageCount = queries.filter((q) => q.type === 'image').length;

  return (
    <div className="page animate-in">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">AI Queries</h1>
          <p className="page-subtitle">{queries.length} total interactions • {chatCount} chats • {imageCount} scans</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="toggle-group">
            <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>ALL</button>
            <button className={`toggle-btn ${filter === 'chat' ? 'active' : ''}`} onClick={() => setFilter('chat')}>CHAT</button>
            <button className={`toggle-btn ${filter === 'image' ? 'active' : ''}`} onClick={() => setFilter('image')}>IMAGE</button>
          </div>
          <div className="header-search" style={{ width: 240 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search queries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="ai-search"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon green"><Brain size={20} /></div>
          </div>
          <div className="stat-value">{queries.length}</div>
          <div className="stat-label">TOTAL QUERIES</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon blue"><MessageSquare size={20} /></div>
          </div>
          <div className="stat-value">{chatCount}</div>
          <div className="stat-label">CHAT QUERIES</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon orange"><Image size={20} /></div>
          </div>
          <div className="stat-value">{imageCount}</div>
          <div className="stat-label">IMAGE ANALYSES</div>
        </div>
      </div>

      {/* Query List */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Query History</div>
            <div className="card-subtitle">Showing {filtered.length} results</div>
          </div>
        </div>
        <div className="activity-feed">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Brain size={32} />
              <p>No AI queries found</p>
            </div>
          ) : (
            filtered.map((q, i) => {
              const user = userMap[q.userId];
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id || i}>
                  <div
                    className="activity-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  >
                    <div className={`activity-icon ${q.type === 'chat' ? 'blue' : 'orange'}`}>
                      {q.type === 'chat' ? <MessageSquare size={16} /> : <Image size={16} />}
                    </div>
                    <div className="activity-text" style={{ flex: 1 }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${q.type === 'chat' ? 'blue' : 'orange'}`}>{q.type}</span>
                        {(q.input || '').substring(0, 80)}{(q.input || '').length > 80 ? '…' : ''}
                      </p>
                      <span>
                        {user?.name || q.userId} • {q.language || 'en'} • {formatTime(q.timestamp)}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--gray-400)' }} /> : <ChevronDown size={16} style={{ color: 'var(--gray-400)' }} />}
                  </div>
                  {isExpanded && (
                    <div style={{
                      padding: '12px 16px 16px 62px',
                      background: 'var(--gray-50)',
                      borderRadius: 12,
                      margin: '-4px 0 8px',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}>
                      <div style={{ marginBottom: 12 }}>
                        <strong style={{ color: 'var(--green-800)' }}>User Input:</strong>
                        <p style={{ marginTop: 4, color: 'var(--gray-700)' }}>{q.input || '—'}</p>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--green-800)' }}>AI Response:</strong>
                        <p style={{ marginTop: 4, color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>
                          {(q.response || '—').substring(0, 500)}{(q.response || '').length > 500 ? '…' : ''}
                        </p>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--gray-400)' }}>
                        {formatDate(q.timestamp)}
                      </div>
                    </div>
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
