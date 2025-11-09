import { supabase } from '@/lib/supabase';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id: string;
  email: string | null;
  username: string | null;
};

type Vehicle = {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  vehicles: Vehicle[];
  currentVehicle: Vehicle | null;
  signIn: (usernameOrEmail: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  setCurrentVehicle: (vehicle: Vehicle | null) => void;
  refreshVehicles: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  // ================================================================
  // SIMPLE LOGIN - Username OR Email + Password
  // ================================================================
  const signIn = async (usernameOrEmail: string, password: string) => {
    console.log('🔐 Mobile login:', { usernameOrEmail });

    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      throw new Error('Username or email is required');
    }

    if (!password || password.trim().length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    try {
      // Check if it's an email or username
      const isEmail = usernameOrEmail.includes('@');
      
      // Query the users table
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(isEmail ? `email.eq.${usernameOrEmail}` : `username.eq.${usernameOrEmail}`)
        .limit(1);

      if (error) {
        console.error('❌ Query error:', error);
        throw new Error('Login failed');
      }

      if (!users || users.length === 0) {
        console.log('❌ User not found');
        throw new Error('User not found');
      }

      const foundUser = users[0];

      // Check password (plain text comparison)
      if (foundUser.password !== password) {
        console.log('❌ Wrong password');
        throw new Error('Invalid password');
      }

      console.log('✅ Login successful:', foundUser);
      setUser({
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  // ================================================================
  // SIMPLE SIGNUP - Username, Email, Password
  // ================================================================
  const signUp = async (username: string, email: string, password: string) => {
    console.log('🔐 Mobile signup:', { username, email });

    if (!username || !username.trim()) {
      throw new Error('Username is required');
    }

    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    try {
      // Just insert directly into users table
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: username.trim(),
            email: email.trim(),
            password  // Stored as plain text
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Signup error:', error);
        if (error.message.includes('duplicate') || error.code === '23505') {
          throw new Error('Username or email already exists');
        }
        throw new Error('Signup failed');
      }

      console.log('✅ User created:', data);
      // Don't auto-login, let user go to login screen
      return { requiresEmailConfirmation: false };
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setIsAuthenticated(false);
    setUser(null);
    setVehicles([]);
    setCurrentVehicle(null);
  };

  const refreshVehicles = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('vehicle_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVehicles(data || []);
      
      // Set first vehicle as current if none selected
      if (data && data.length > 0 && !currentVehicle) {
        setCurrentVehicle(data[0]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // Load vehicles when user changes
  useEffect(() => {
    if (user?.id) {
      refreshVehicles();
    }
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(() => ({ 
    isAuthenticated, 
    user, 
    vehicles, 
    currentVehicle, 
    signIn, 
    signUp, 
    signOut, 
    setCurrentVehicle, 
    refreshVehicles 
  }), [isAuthenticated, user, vehicles, currentVehicle]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
