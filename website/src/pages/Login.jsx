import React from 'react';
import LoginBranding from '../components/LoginBranding';
import LoginFormSimple from '../components/LoginFormSimple';
import { isSupabaseConfigured, signupUser, loginUser } from '../services/supabase';

export default function Login({ onLoginSuccess }) {
  
  const handleLogin = async (formData) => {
    try {
      if (isSupabaseConfigured()) {
        const authData = await loginUser({ usernameOrEmail: formData.usernameOrEmail, password: formData.password });
        if (onLoginSuccess) onLoginSuccess(authData);
        return;
      }
      // Fallback to localStorage
      const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
      const user = existingUsers.find(u => 
        (u.username === formData.usernameOrEmail || u.email === formData.usernameOrEmail) && 
        u.password === formData.password
      );
      if (!user) throw new Error('Invalid credentials');
      if (onLoginSuccess) onLoginSuccess({ username: user.username, email: user.email });
    } catch (error) {
      console.error('Login failed:', error);
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
        <LoginBranding />
        <LoginFormSimple 
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </div>
    </div>
  );
}
