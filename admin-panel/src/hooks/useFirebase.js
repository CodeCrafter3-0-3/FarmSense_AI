// Shared Firebase hooks for Admin Panel
// Reads all user data across the entire database
import { useState, useEffect } from 'react';
import { db, ref, onValue, get, query, orderByChild, limitToLast } from '../firebase';

// ── All Users ───────────────────────────────────────────
export function useAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.entries(val).map(([id, data]) => ({ userId: id, ...data }));
        setUsers(arr);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { users, loading };
}

// ── All Auth Records (for user count & signup dates) ────
export function useAllAuth() {
  const [authRecords, setAuthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authRef = ref(db, 'auth');
    const unsub = onValue(authRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.entries(val).map(([key, data]) => ({ key, ...data }));
        setAuthRecords(arr);
      } else {
        setAuthRecords([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { authRecords, loading };
}

// ── All Sensor Data ─────────────────────────────────────
export function useAllSensorData() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sensorRef = ref(db, 'sensorData');
    const unsub = onValue(sensorRef, (snapshot) => {
      const val = snapshot.val();
      setSensorData(val || {});
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { sensorData, loading };
}

// ── All Irrigation Data ─────────────────────────────────
export function useAllIrrigation() {
  const [irrigationData, setIrrigationData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const irrigRef = ref(db, 'irrigation');
    const unsub = onValue(irrigRef, (snapshot) => {
      const val = snapshot.val();
      setIrrigationData(val || {});
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { irrigationData, loading };
}

// ── All AI Queries ──────────────────────────────────────
export function useAllAIQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const aiRef = ref(db, 'ai_queries');
    const unsub = onValue(aiRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const allQueries = [];
        Object.entries(val).forEach(([userId, userQueries]) => {
          if (typeof userQueries === 'object') {
            Object.entries(userQueries).forEach(([qId, qData]) => {
              allQueries.push({ id: qId, userId, ...qData });
            });
          }
        });
        allQueries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setQueries(allQueries);
      } else {
        setQueries([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { queries, loading };
}

// ── All Alerts ──────────────────────────────────────────
export function useAllAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = ref(db, 'alerts');
    const unsub = onValue(alertsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const allAlerts = [];
        Object.entries(val).forEach(([userId, userAlerts]) => {
          if (typeof userAlerts === 'object') {
            Object.entries(userAlerts).forEach(([aId, aData]) => {
              allAlerts.push({ id: aId, userId, ...aData });
            });
          }
        });
        allAlerts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAlerts(allAlerts);
      } else {
        setAlerts([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { alerts, loading };
}

// ── All Health Scans ────────────────────────────────────
export function useAllHealthScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scansRef = ref(db, 'health_scans');
    const unsub = onValue(scansRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const allScans = [];
        Object.entries(val).forEach(([userId, userScans]) => {
          if (typeof userScans === 'object') {
            Object.entries(userScans).forEach(([sId, sData]) => {
              allScans.push({ id: sId, userId, ...sData });
            });
          }
        });
        allScans.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setScans(allScans);
      } else {
        setScans([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { scans, loading };
}

// ── Weather ─────────────────────────────────────────────
export function useWeatherData() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const weatherRef = ref(db, 'weather/current');
    const unsub = onValue(weatherRef, (snapshot) => {
      const val = snapshot.val();
      setWeather(val || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { weather, loading };
}

// ── Device heartbeats ───────────────────────────────────
export function useDeviceHeartbeats() {
  const [heartbeats, setHeartbeats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hbRef = ref(db, 'devices');
    const unsub = onValue(hbRef, (snapshot) => {
      const val = snapshot.val();
      setHeartbeats(val || {});
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { heartbeats, loading };
}

// ── Login Attempts ──────────────────────────────────────
export function useLoginAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const attemptsRef = ref(db, 'login_attempts');
    const unsub = onValue(attemptsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.entries(val).map(([id, data]) => ({ id, ...data }));
        arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAttempts(arr);
      } else {
        setAttempts([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { attempts, loading };
}

// ── Utility: format timestamp ───────────────────────────
export function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
