import { supabase } from '@/lib/supabase';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id: string;
  email: string | null;
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
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (identifier: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
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

  const signIn = async (identifier: string, password: string) => {
    const idProvided = Boolean(identifier && identifier.trim().length > 0);
    const passwordProvided = Boolean(password && password.trim().length > 0);

    if (!idProvided) {
      throw new Error('Email is required');
    }

    if (!passwordProvided) {
      throw new Error('Password is required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const sUser = data.user;
    if (sUser) {
      setUser({ id: sUser.id, email: sUser.email });
      setIsAuthenticated(true);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setVehicles([]);
    setCurrentVehicle(null);
  };

  const refreshVehicles = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('vehicles')
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

  const signUp = async (identifier: string, password: string) => {
    const idProvided = Boolean(identifier && identifier.trim().length > 0);
    const passwordProvided = Boolean(password && password.trim().length > 0);

    if (!idProvided) {
      throw new Error('Email is required');
    }

    if (!passwordProvided) {
      throw new Error('Password is required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Step 1: Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: identifier.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const sUser = data.user;
    const session = data.session;

    // Step 2: Upsert (insert or update) a user profile entry in the public.users table
    if (sUser && sUser.id) {
      try {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: sUser.id,
            email: identifier.trim(),
            username: identifier.trim().split('@')[0],
            role: 'user',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Error upserting user profile:', profileError);
        }
      } catch (profileError) {
        console.error('Error upserting user profile:', profileError);
      }
    }

    if (session && sUser) {
      setUser({ id: sUser.id, email: sUser.email });
      setIsAuthenticated(true);
      return { requiresEmailConfirmation: false };
    }
    // If email confirmation is enabled, try immediate sign-in (works only if project allows unconfirmed email sign-in)
    const loginAttempt = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    });
    if (!loginAttempt.error && loginAttempt.data.user) {
      setUser({ id: loginAttempt.data.user.id, email: loginAttempt.data.user.email });
      setIsAuthenticated(true);
      return { requiresEmailConfirmation: false };
    }

    // Fallback: requires email confirmation in project settings
    return { requiresEmailConfirmation: true };
  };

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      if (!isMounted) return;
      if (currentSession?.user) {
        setUser({ id: currentSession.user.id, email: currentSession.user.email });
        setIsAuthenticated(true);
        // Load vehicles after authentication
        setTimeout(() => refreshVehicles(), 100);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setVehicles([]);
        setCurrentVehicle(null);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        setIsAuthenticated(true);
        // Load vehicles after authentication
        setTimeout(() => refreshVehicles(), 100);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setVehicles([]);
        setCurrentVehicle(null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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