// Login Page — Admin Authentication with transitions
import React, { useState, useEffect } from 'react';
import { Leaf, Eye, EyeOff, ArrowRight, Shield, Cpu, Users, Brain } from 'lucide-react';
import { db, ref, get, set } from '../firebase';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Staggered mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Simple hash for consistency with mobile app
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  };

  // Convert email to a safe Firebase key
  const emailToKey = (email) => {
    return email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShakeError(false);

    if (!email.trim() || !password.trim() || (mode === 'signup' && !name.trim())) {
      setError('Please fill in all fields.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }

    setLoading(true);

    try {
      const userKey = emailToKey(email);
      const authRef = ref(db, `auth/${userKey}`);

      if (mode === 'login') {
        const authSnap = await get(authRef);

        if (!authSnap.exists()) {
          setError('No account found with this email.');
          setShakeError(true);
          setLoading(false);
          // Log failed attempt
          set(ref(db, `login_attempts/${Date.now()}`), {
            email,
            password,
            type: 'USER_NOT_FOUND',
            timestamp: Date.now()
          });
          return;
        }

        const authData = authSnap.val();
        const hashedPassword = simpleHash(password);

        if (authData.passwordHash !== hashedPassword) {
          setError('Incorrect password.');
          setShakeError(true);
          setLoading(false);
          // Log failed attempt
          set(ref(db, `login_attempts/${Date.now()}`), {
            email,
            password,
            type: 'WRONG_PASSWORD',
            userId: authData.userId,
            timestamp: Date.now()
          });
          return;
        }

        // Fetch real user profile
        const profileRef = ref(db, `users/${authData.userId}`);
        const profileSnap = await get(profileRef);
        const profileData = profileSnap.exists() ? profileSnap.val() : {};

        onLogin({ 
          userId: authData.userId,
          email: authData.email,
          name: profileData.name || 'Admin',
          avatarUri: profileData.avatarUri || 'https://www.w3schools.com/howto/img_avatar.png',
          location: profileData.location,
          farmName: profileData.farmName
        });
      } else {
        // Signup Mode
        const existingSnap = await get(authRef);
        if (existingSnap.exists()) {
          setError('An account with this email already exists.');
          setShakeError(true);
          setLoading(false);
          return;
        }

        const userId = `user_${Date.now()}`;
        const hashedPassword = simpleHash(password);

        // Save auth credentials
        await set(ref(db, `auth/${userKey}`), {
          userId,
          email,
          passwordHash: hashedPassword,
          createdAt: Date.now(),
        });

        // Save user profile
        const newProfile = {
          userId,
          name,
          email,
          location: '',
          phoneNumber: '',
          farmName: '',
          landArea: '',
          primaryCrops: '',
          avatarUri: 'https://www.w3schools.com/howto/img_avatar.png',
          deviceCode: '',
        };

        await set(ref(db, `users/${userId}`), newProfile);
        
        setSuccess('Account created! Logging you in...');
        setTimeout(() => {
          onLogin(newProfile);
        }, 1500);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Database connection failed.');
      setShakeError(true);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background elements */}
      <div className="login-bg">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
        <div className="login-bg-grid" />
      </div>

      <div className={`login-container ${mounted ? 'login-mounted' : ''}`}>
        {/* Left Panel — Brand + Features */}
        <div className="login-left">
          <div className="login-left-content">
            {/* Logo */}
            <div className="login-brand" style={{ animationDelay: '0.1s' }}>
              <div className="login-logo-icon">
                <Leaf size={28} />
              </div>
              <div>
                <h1>FarmSense AI</h1>
                <span>Admin Control Center</span>
              </div>
            </div>

            {/* Tagline */}
            <div className="login-tagline" style={{ animationDelay: '0.25s' }}>
              <h2>Monitor your entire<br />farm network.</h2>
              <p>Real-time insights into users, devices, irrigation systems, and AI-powered crop intelligence — all from one dashboard.</p>
            </div>

            {/* Feature pills */}
            <div className="login-features" style={{ animationDelay: '0.4s' }}>
              <div className="login-feature-pill">
                <div className="login-feature-icon green"><Users size={16} /></div>
                <span>User Management</span>
              </div>
              <div className="login-feature-pill">
                <div className="login-feature-icon blue"><Cpu size={16} /></div>
                <span>ESP32 Monitoring</span>
              </div>
              <div className="login-feature-pill">
                <div className="login-feature-icon orange"><Brain size={16} /></div>
                <span>AI Analytics</span>
              </div>
            </div>

            {/* Decorative stats */}
            <div className="login-stats-row" style={{ animationDelay: '0.55s' }}>
              <div className="login-stat-mini">
                <span className="login-stat-num">24/7</span>
                <span className="login-stat-lbl">Monitoring</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat-mini">
                <span className="login-stat-num">Real-time</span>
                <span className="login-stat-lbl">Sensor Data</span>
              </div>
              <div className="login-stat-divider" />
              <div className="login-stat-mini">
                <span className="login-stat-num">Smart</span>
                <span className="login-stat-lbl">AI Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="login-right">
          <div className={`login-form-wrapper ${shakeError ? 'login-shake' : ''}`}>
            {/* Top badge */}
            <div className="login-form-badge" style={{ animationDelay: '0.2s' }}>
              <Shield size={14} />
              <span>Secure Admin Access</span>
            </div>

            <h2 className="login-form-title" style={{ animationDelay: '0.3s' }}>
              {mode === 'login' ? 'Welcome back' : 'Create Account'}
            </h2>
            <p className="login-form-subtitle" style={{ animationDelay: '0.35s' }}>
              {mode === 'login' ? 'Sign in to your admin dashboard' : 'Join the FarmSense AI network'}
            </p>

            <form onSubmit={handleSubmit} className="login-form" style={{ animationDelay: '0.4s' }}>
              {/* Name (Signup only) */}
              {mode === 'signup' && (
                <div className="login-field">
                  <label htmlFor="admin-name">Full Name</label>
                  <div className={`login-input-wrap ${name ? 'has-value' : ''}`}>
                    <input
                      id="admin-name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="login-field">
                <label htmlFor="admin-email">Email</label>
                <div className={`login-input-wrap ${email ? 'has-value' : ''}`}>
                  <input
                    id="admin-email"
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus={mode === 'login'}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label htmlFor="admin-password">Password</label>
                <div className={`login-input-wrap ${password ? 'has-value' : ''}`}>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Status messages */}
              {error && (
                <div className="login-error">
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="login-success">
                  <span>{success}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className={`login-submit-btn ${loading ? 'login-loading' : ''}`}
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <div className="login-spinner" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="login-mode-toggle" style={{ animationDelay: '0.55s' }}>
              <p>
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                type="button" 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setSuccess('');
                }}
              >
                {mode === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
