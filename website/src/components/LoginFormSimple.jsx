import React, { useState } from 'react';

export default function LoginFormSimple({ onLogin, onSignup }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // Simple validation for signup
        if (!formData.username || !formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        await onSignup(formData);
        alert('Account created! Please log in.');
        setIsSignup(false);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      } else {
        // Simple validation for login
        if (!formData.username || !formData.password) {
          throw new Error('Please enter username/email and password');
        }
        
        await onLogin({ usernameOrEmail: formData.username, password: formData.password });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-header">
        <div className="app-title">
          <span className="gear-icon">⚙</span>
          AutoPulse
        </div>
        <p className="login-subtitle">
          {isSignup ? 'Create your account' : 'Sign in to your account'}
        </p>
      </div>

      {error && (
        <div className="error-message general-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">
            {isSignup ? 'Username' : 'Username or Email'}
          </label>
          <div className="input-wrapper">
            <span className="input-icon">👤</span>
            <input
              id="username"
              type="text"
              placeholder={isSignup ? "Choose a username" : "Enter username or email"}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
              autoComplete="username"
            />
          </div>
        </div>

        {isSignup && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </div>
        </div>

        {isSignup && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner">⏳</span>
              {isSignup ? 'Creating account...' : 'Signing in...'}
            </>
          ) : (
            <>
              <span className="arrow-icon">→</span>
              {isSignup ? 'Create Account' : 'Sign in to Dashboard'}
            </>
          )}
        </button>
      </form>

      <div className="mode-toggle">
        <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
        <button 
          type="button" 
          className="toggle-button"
          onClick={() => {
            setIsSignup(!isSignup);
            setError('');
            setFormData({ username: '', email: '', password: '', confirmPassword: '' });
          }}
          disabled={loading}
        >
          {isSignup ? 'Sign In' : 'Sign Up'}
        </button>
      </div>

      <div className="footer">
        AutoPulse: Vehicle Diagnostic System
      </div>
    </div>
  );
}
