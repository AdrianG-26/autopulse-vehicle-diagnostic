import React, { useState } from 'react';
import LoginBranding from '../components/LoginBranding';
import LoginForm from '../components/LoginForm';
import { isSupabaseConfigured, signupUser, loginUser } from '../services/supabase';

export default function Login({ onLoginSuccess }) {
  const [showContactAdmin, setShowContactAdmin] = useState(false);

  const handleLogin = async (formData) => {
    try {
      if (isSupabaseConfigured()) {
        const authData = await loginUser({ usernameOrEmail: formData.username, password: formData.password });
        if (onLoginSuccess) onLoginSuccess(authData);
        return;
      }
      // Fallback to localStorage mock
      const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
      const user = existingUsers.find(u => (u.username === formData.username || u.email === formData.username) && u.password === formData.password);
      if (!user) throw new Error('Invalid username/email or password');
      const authData = { username: user.username, email: user.email };
      if (onLoginSuccess) onLoginSuccess(authData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to let LoginForm handle the error
    }
  };

  const handleSignup = async (formData) => {
    try {
      if (isSupabaseConfigured()) {
        // Check if user already exists before attempting signup
        const { supabase } = await import('../services/supabase');
        
        // Check for existing username
        const { data: existingUsername } = await supabase
          .from('users')
          .select('username')
          .eq('username', formData.username)
          .limit(1);
        
        if (existingUsername && existingUsername.length > 0) {
          throw new Error('This username is already taken. Please choose another one.');
        }
        
        // Check for existing email
        const { data: existingEmail } = await supabase
          .from('users')
          .select('email')
          .eq('email', formData.email)
          .limit(1);
        
        if (existingEmail && existingEmail.length > 0) {
          throw new Error('This email is already registered. Please use another email or sign in.');
        }
        
        // Proceed with signup if no duplicates found
        await signupUser({ username: formData.username, email: formData.email, password: formData.password });
        return;
      }
      // Fallback to localStorage mock
      const existingUsers = JSON.parse(localStorage.getItem('autopulse_users') || '[]');
      const existingUsername = existingUsers.find(u => u.username === formData.username);
      const existingEmail = existingUsers.find(u => u.email === formData.email);
      
      if (existingUsername) throw new Error('This username is already taken. Please choose another one.');
      if (existingEmail) throw new Error('This email is already registered. Please use another email or sign in.');
      
      const newUser = { username: formData.username, email: formData.email, password: formData.password, createdAt: new Date().toISOString() };
      existingUsers.push(newUser);
      localStorage.setItem('autopulse_users', JSON.stringify(existingUsers));
    } catch (error) {
      console.error('Signup failed:', error);
      
      // Handle specific Supabase constraint errors
      if (error.message && error.message.includes('duplicate key')) {
        if (error.message.includes('users_email_key')) {
          throw new Error('This email is already registered. Please use another email or sign in.');
        } else if (error.message.includes('users_username_key')) {
          throw new Error('This username is already taken. Please choose another one.');
        }
      }
      
      throw error; // Re-throw to let LoginForm handle the error
    }
  };

  const handleContactAdmin = () => {
    setShowContactAdmin(true);
    // You can implement contact admin logic here
    alert('Contact administrator functionality would be implemented here.\n\nFor now, you can:\n1. Email: admin@autopulse.com\n2. Call: +1-555-AUTO-PULSE\n3. Submit a ticket through the system');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <LoginBranding />
        <LoginForm 
          onLogin={handleLogin}
          onSignup={handleSignup}
          onContactAdmin={handleContactAdmin}
        />
      </div>
      
      {/* Modal for contact admin */}
      {showContactAdmin && (
        <div className="modal-overlay" onClick={() => setShowContactAdmin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Contact Administrator</h3>
            <p>Get in touch with the system administrator for account access.</p>
            <div className="contact-info">
              <p><strong>Email:</strong> admin@autopulse.com</p>
              <p><strong>Phone:</strong> +1-555-AUTO-PULSE</p>
              <p><strong>Support Hours:</strong> Mon-Fri 9AM-6PM</p>
            </div>
            <div className="modal-actions">
              <button className="primary" onClick={() => setShowContactAdmin(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 