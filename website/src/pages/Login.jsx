import React from 'react';
import LoginFormSimple from '../components/LoginFormSimple';
import { signupUser, loginUser } from '../services/supabase';

export default function Login({ onLoginSuccess }) {
  
  const handleLogin = async (formData) => {
    try {
      console.log('🔐 Login attempt for:', formData.usernameOrEmail);
      
      const authData = await loginUser({ usernameOrEmail: formData.usernameOrEmail, password: formData.password });
      console.log('✅ Login successful, authData:', authData);
      
      // Call success callback
      if (onLoginSuccess && authData) {
        console.log('✅ Calling onLoginSuccess with:', authData);
        onLoginSuccess(authData);
      } else {
        console.error('❌ onLoginSuccess callback not available or authData missing');
        throw new Error('Login succeeded but failed to initialize session');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const handleSignup = async (formData) => {
    try {
      await signupUser({ username: formData.username, email: formData.email, password: formData.password });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Top Header - Blue Background */}
        <div className="login-branding">
          <div className="branding-content">
            <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>
              🚗
            </div>
            <h1 className="branding-title">AutoPulse</h1>
            <p className="branding-tagline">
              Vehicle Diagnostic System
            </p>
          </div>
        </div>
        
        {/* Login Form */}
        <LoginFormSimple 
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </div>
    </div>
  );
}
