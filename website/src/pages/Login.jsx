import React from 'react';
import LoginFormSimple from '../components/LoginFormSimple';
import { isSupabaseConfigured, signupUser, loginUser } from '../services/supabase';

export default function Login({ onLoginSuccess }) {
  
  const handleLogin = async (formData) => {
    try {
      console.log('≡ƒöÉ Login attempt for:', formData.usernameOrEmail);
      let authData;
      
      if (isSupabaseConfigured()) {
        authData = await loginUser({ usernameOrEmail: formData.usernameOrEmail, password: formData.password });
        console.log('Γ£à Login successful, authData:', authData);
      } else {
        // Fallback to localStorage
        const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
        const user = existingUsers.find(u => 
          (u.username === formData.usernameOrEmail || u.email === formData.usernameOrEmail) && 
          u.password === formData.password
        );
        if (!user) throw new Error('Invalid credentials');
        authData = { username: user.username, email: user.email, id: user.id };
      }
      
      // Call success callback
      if (onLoginSuccess && authData) {
        console.log('Γ£à Calling onLoginSuccess with:', authData);
        onLoginSuccess(authData);
      } else {
        console.error('Γ¥î onLoginSuccess callback not available or authData missing');
        throw new Error('Login succeeded but failed to initialize session');
      }
    } catch (error) {
      console.error('Γ¥î Login failed:', error);
      throw error;
    }
  };

  const handleSignup = async (formData) => {
    try {
      if (isSupabaseConfigured()) {
        await signupUser({ username: formData.username, email: formData.email, password: formData.password });
        return;
      }
      // Fallback to localStorage
      const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
      if (existingUsers.some(u => u.username === formData.username)) {
        throw new Error('Username already taken');
      }
      if (existingUsers.some(u => u.email === formData.email)) {
        throw new Error('Email already registered');
      }
      const newUser = { 
        username: formData.username, 
        email: formData.email, 
        password: formData.password, 
        createdAt: new Date().toISOString() 
      };
      existingUsers.push(newUser);
      localStorage.setItem('autopulse_users', JSON.stringify(existingUsers));
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
              ≡ƒÜù
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
