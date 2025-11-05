import React, { useState, useEffect } from 'react';

export default function LoginForm({ onLogin, onSignup, onContactAdmin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    keepSignedIn: false
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [validFields, setValidFields] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Disposable email domains to block
  const disposableEmailDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
    'throwaway.email', 'temp-mail.org', 'trashmail.com', 'fakeinbox.com'
  ];

  // Reserved system usernames (excluding admin since it's used in this app)
  const reservedUsernames = [
    'root', 'system', 'administrator', 'superuser', 
    'null', 'undefined', 'anonymous', 'guest'
  ];

  // Common weak passwords
  const commonPasswords = [
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
    'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'shadow'
  ];

  // Check for consecutive characters
  const hasConsecutiveChars = (str, max = 3) => {
    for (let i = 0; i < str.length - max + 1; i++) {
      const char = str[i];
      let consecutive = true;
      for (let j = 1; j < max; j++) {
        if (str[i + j] !== char) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) return true;
    }
    return false;
  };

  // Validate username with advanced checks
  const validateUsername = async (username) => {
    // Trim whitespace
    username = username.trim();
    
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, underscores, and hyphens';
    
    // Check for consecutive special characters
    if (/[_-]{2,}/.test(username)) return 'Username cannot have consecutive special characters';
    
    // Check reserved usernames
    if (reservedUsernames.includes(username.toLowerCase())) return 'This username is reserved by the system';
    
    // Check for too many consecutive identical characters
    if (hasConsecutiveChars(username, 4)) return 'Username cannot have more than 3 identical characters in a row';
    
    // Check if username already exists (only during signup)
    if (isSignup) {
      try {
        const { isSupabaseConfigured } = await import('../services/supabase');
        if (isSupabaseConfigured()) {
          const { supabase } = await import('../services/supabase');
          const { data } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .limit(1);
          
          if (data && data.length > 0) {
            return 'This username is already taken';
          }
        } else {
          // Check localStorage
          const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
          if (existingUsers.some(u => u.username === username)) {
            return 'This username is already taken';
          }
        }
      } catch (error) {
        // Silently fail if check doesn't work
        console.error('Error checking username:', error);
      }
    }
    
    return '';
  };

  // Validate email with domain checks
  const validateEmail = async (email) => {
    email = email.trim().toLowerCase();
    
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    
    // Check for disposable email domains
    const domain = email.split('@')[1];
    if (disposableEmailDomains.includes(domain)) {
      return 'Disposable email addresses are not allowed';
    }
    
    // Suggest common typos
    const commonDomains = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com'
    };
    
    if (commonDomains[domain]) {
      return `Did you mean ${email.split('@')[0]}@${commonDomains[domain]}?`;
    }
    
    // Check if email already exists (only during signup)
    if (isSignup) {
      try {
        const { isSupabaseConfigured } = await import('../services/supabase');
        if (isSupabaseConfigured()) {
          const { supabase } = await import('../services/supabase');
          const { data } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .limit(1);
          
          if (data && data.length > 0) {
            return 'This email is already registered';
          }
        } else {
          // Check localStorage
          const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
          if (existingUsers.some(u => u.email === email)) {
            return 'This email is already registered';
          }
        }
      } catch (error) {
        // Silently fail if check doesn't work
        console.error('Error checking email:', error);
      }
    }
    
    return '';
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&#]/.test(password)
    };

    setPasswordRequirements(requirements);

    // Score calculation
    if (requirements.length) score += 20;
    if (requirements.uppercase) score += 20;
    if (requirements.lowercase) score += 20;
    if (requirements.number) score += 20;
    if (requirements.special) score += 20;

    // Determine label and color
    let label = '';
    let color = '';
    
    if (score < 40) {
      label = 'Weak';
      color = '#ef4444';
    } else if (score < 60) {
      label = 'Fair';
      color = '#f59e0b';
    } else if (score < 80) {
      label = 'Good';
      color = '#10b981';
    } else {
      label = 'Strong';
      color = '#059669';
    }

    setPasswordStrength({ score, label, color });
  };

  // Validate password with advanced checks
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    
    // Check for whitespace only
    if (!password.trim()) return 'Password cannot be only whitespace';
    
    // Check if password is too common
    if (commonPasswords.includes(password.toLowerCase())) {
      return 'This password is too common. Please choose a stronger password';
    }
    
    // Check if password contains username
    if (formData.username && password.toLowerCase().includes(formData.username.toLowerCase())) {
      return 'Password cannot contain your username';
    }
    
    // Check for consecutive identical characters
    if (hasConsecutiveChars(password, 4)) {
      return 'Password cannot have more than 3 identical characters in a row';
    }
    
    // Strength requirements for signup
    if (isSignup) {
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
      if (!/[@$!%*?&#]/.test(password)) return 'Password must contain at least one special character (@$!%*?&#)';
    }
    
    return '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  // Real-time password strength calculation
  useEffect(() => {
    if (isSignup && formData.password) {
      calculatePasswordStrength(formData.password);
    }
  }, [formData.password, isSignup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const newErrors = {};
    
    if (isSignup) {
      // Signup validation
      const usernameError = await validateUsername(formData.username);
      const emailError = await validateEmail(formData.email);
      const passwordError = validatePassword(formData.password);
      const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
      
      if (usernameError) newErrors.username = usernameError;
      if (emailError) newErrors.email = emailError;
      if (passwordError) newErrors.password = passwordError;
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
      
      if (Object.keys(newErrors).length === 0) {
        try {
          await onSignup(formData);
          // Show success and switch to Sign In
          setSuccess('Account created successfully. You can sign in now.');
          setErrors({});
          setIsSignup(false);
          setFormData({
            username: formData.username,
            email: '',
            password: '',
            confirmPassword: '',
            keepSignedIn: false
          });
        } catch (error) {
          newErrors.general = error.message || 'Signup failed. Please try again.';
          setErrors(newErrors);
        }
      }
    } else {
      // Login validation
      const usernameError = await validateUsername(formData.username);
      const passwordError = validatePassword(formData.password);
      
      if (usernameError) newErrors.username = usernameError;
      if (passwordError) newErrors.password = passwordError;
      
      if (Object.keys(newErrors).length === 0) {
        try {
          await onLogin(formData);
        } catch (error) {
          newErrors.general = error.message || 'Login failed. Please try again.';
          setErrors(newErrors);
        }
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    // Trim whitespace for string fields only (not for checkbox)
    const trimmedValue = typeof value === 'string' 
      ? (field === 'password' || field === 'confirmPassword' ? value : value.trim())
      : value;
    
    setFormData(prev => ({ ...prev, [field]: trimmedValue }));
    
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
    
    // Real-time validation for visual feedback (debounced effect) - only for text fields
    if (typeof value === 'string') {
      setTimeout(async () => {
        let error = '';
        if (field === 'username') {
          error = await validateUsername(trimmedValue);
        } else if (field === 'email') {
          error = await validateEmail(trimmedValue);
        } else if (field === 'password') {
          error = validatePassword(trimmedValue);
        } else if (field === 'confirmPassword') {
          error = validateConfirmPassword(formData.password, trimmedValue);
        }
        
        // Update valid fields for green checkmark
        if (!error && trimmedValue) {
          setValidFields(prev => ({ ...prev, [field]: true }));
        } else {
          setValidFields(prev => ({ ...prev, [field]: false }));
        }
      }, 800); // Increased debounce time for database checks
    }
  };

  const handleBlur = async (field) => {
    let error = '';
    const value = formData[field];
    
    if (field === 'username') {
      error = await validateUsername(value);
    } else if (field === 'email') {
      error = await validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value);
    } else if (field === 'confirmPassword') {
      error = validateConfirmPassword(formData.password, value);
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      setValidFields(prev => ({ ...prev, [field]: false }));
    } else if (value) {
      setValidFields(prev => ({ ...prev, [field]: true }));
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      keepSignedIn: false
    });
    setErrors({});
    setSuccess('');
    setValidFields({});
    setPasswordStrength({ score: 0, label: '', color: '' });
    setPasswordRequirements({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    });
  };

  return (
    <div className="login-form">
      <div className="login-header">
        <div className="app-title">
          <span className="gear-icon">⚙</span>
          AutoPulse
        </div>
        <p className="login-subtitle">Sign in to access your vehicle diagnostic dashboard.</p>
      </div>

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}
      {success && (
        <div className="success-message" style={{ marginBottom: '12px', color: '#0a7d2f' }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">
            Username
            {isSignup && (
              <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                ({formData.username.length}/20)
              </span>
            )}
          </label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <span className="input-icon">👤</span>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              className={errors.username ? 'error' : ''}
              disabled={isLoading}
              style={{ paddingRight: validFields.username ? '40px' : '12px' }}
            />
            {validFields.username && !errors.username && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                ✓
              </span>
            )}
          </div>
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        {isSignup && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
                style={{ paddingRight: validFields.email ? '40px' : '12px' }}
              />
              {validFields.email && !errors.email && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </span>
              )}
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        )}

        <div className="form-group">
          <div className="password-header">
            <label htmlFor="password">Password</label>
          </div>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <span className="input-icon">🔒</span>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
              style={{ paddingRight: validFields.password ? '40px' : '12px' }}
            />
            {validFields.password && !errors.password && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                ✓
              </span>
            )}
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
          
          {/* Password Strength Meter (only for signup) */}
          {isSignup && formData.password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Password Strength:</span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: passwordStrength.color 
                }}>
                  {passwordStrength.label}
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${passwordStrength.score}%`, 
                  height: '100%', 
                  backgroundColor: passwordStrength.color,
                  transition: 'all 0.3s ease'
                }} />
              </div>
              
              {/* Password Requirements Checklist */}
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Password must contain:
                </div>
                <div style={{ display: 'grid', gap: '4px' }}>
                  {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'uppercase', label: 'One uppercase letter (A-Z)' },
                    { key: 'lowercase', label: 'One lowercase letter (a-z)' },
                    { key: 'number', label: 'One number (0-9)' },
                    { key: 'special', label: 'One special character (@$!%*?&#)' }
                  ].map(req => (
                    <div key={req.key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '11px',
                      color: passwordRequirements[req.key] ? '#10b981' : '#6b7280'
                    }}>
                      <span style={{ 
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {passwordRequirements[req.key] ? '✓' : '○'}
                      </span>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {isSignup && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <span className="input-icon">🔒</span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
                disabled={isLoading}
                style={{ paddingRight: validFields.confirmPassword ? '40px' : '12px' }}
              />
              {validFields.confirmPassword && !errors.confirmPassword && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </span>
              )}
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
        )}

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.keepSignedIn}
              onChange={(e) => handleInputChange('keepSignedIn', e.target.checked)}
            />
            <span className="checkmark"></span>
            Keep me signed in
          </label>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? (
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
          onClick={toggleMode}
          disabled={isLoading}
        >
          {isSignup ? 'Sign In' : 'Sign Up'}
        </button>
      </div>

      {!isSignup && (
        <div className="account-help">
          <span>Need help accessing your account? Email us at autopulse@gmail.com</span>
        </div>
      )}

                                                                                                                                                                                                                               

      <div className="footer">
        AutoPulse: Vehicle Diagnostic System
      </div>
    </div>
  );
} 