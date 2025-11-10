import React, { useState } from 'react';

export default function LoginFormSimple({ onLogin, onSignup }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "username":
        if (!value) {
          newErrors.username = "Username is required";
        } else if (value.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        } else {
          delete newErrors.username;
        }
        break;
      case "email":
        if (!value) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else {
          delete newErrors.password;
        }
        // Re-validate confirm password if it's been touched
        if (touched.confirmPassword && formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    validateField(fieldName, formData[fieldName]);
  };

  const handleChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
    // If changing password, also validate confirm password if it's been touched
    if (fieldName === "password" && touched.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const validateForm = () => {
    const allTouched = {};
    if (isSignup) {
      allTouched.username = true;
      allTouched.email = true;
      allTouched.password = true;
      allTouched.confirmPassword = true;
    } else {
      allTouched.username = true;
      allTouched.password = true;
    }
    setTouched(allTouched);

    let isValid = true;
    if (isSignup) {
      isValid = validateField("username", formData.username) && isValid;
      isValid = validateField("email", formData.email) && isValid;
      isValid = validateField("password", formData.password) && isValid;
      isValid = validateField("confirmPassword", formData.confirmPassword) && isValid;
    } else {
      // For login, only check if fields are filled (not validation rules)
      isValid = formData.username && formData.username.trim().length > 0 && isValid;
      isValid = formData.password && formData.password.trim().length > 0 && isValid;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors immediately
    setErrors({});
    
    // Basic validation - just check if fields are filled
    if (!formData.username || !formData.password) {
      setErrors({ general: 'Please enter username/email and password' });
      return;
    }

    // For signup, do full validation
    if (isSignup && !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await onSignup(formData);
        alert('Account created! Please log in.');
        setIsSignup(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setErrors({});
        setTouched({});
        setLoading(false);
      } else {
        // Clear any previous errors before attempting login
        setErrors({});
        await onLogin({ usernameOrEmail: formData.username, password: formData.password });
        // Login successful - the onLoginSuccess callback will handle navigation
        // Clear form state
        setFormData({ username: '', password: '' });
        setErrors({});
        setTouched({});
        // Don't set loading to false here - let navigation happen
        // If navigation fails, the error handler will catch it
      }
    } catch (err) {
      console.error('Login/Signup error:', err);
      setErrors({ general: err.message || 'Something went wrong' });
    } finally {
      // Always reset loading state, even if login succeeds or fails
      // This ensures the button is always clickable again after an error
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

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
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
              onChange={(e) => handleChange("username", e.target.value)}
              onBlur={() => handleBlur("username")}
              disabled={loading}
              autoComplete="username"
              className={touched.username && errors.username ? "input-error" : ""}
            />
            {touched.username && errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
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
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                disabled={loading}
                autoComplete="email"
                className={touched.email && errors.email ? "input-error" : ""}
              />
            </div>
            {touched.email && errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
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
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              disabled={loading}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className={touched.password && errors.password ? "input-error" : ""}
            />
          </div>
          {touched.password && errors.password && (
            <div className="field-error">{errors.password}</div>
          )}
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
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                disabled={loading}
                autoComplete="new-password"
                className={touched.confirmPassword && errors.confirmPassword ? "input-error" : ""}
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>
        )}

        <button 
          type="submit" 
          className="login-button" 
          disabled={loading || (isSignup && Object.keys(errors).length > 0 && Object.keys(touched).length > 0)}
        >
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
            setErrors({});
            setTouched({});
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
