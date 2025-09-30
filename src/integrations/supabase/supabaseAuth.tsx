"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';

interface SupabaseContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        navigate('/login');
      } else if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Check if user has a profile, if not, redirect to onboarding
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentSession.user.id)
            .single();

          if (error && error.code === 'PGRST116') { // No rows found
            navigate('/onboarding');
          } else if (error) {
            showError(`Erro ao carregar perfil: ${error.message}`);
          } else {
            // If user is on login/onboarding and has a profile, redirect to dashboard
            if (['/login', '/onboarding'].includes(window.location.pathname)) {
              navigate('/dashboard');
            }
          }
        }
      }
      setLoading(false);
    });

    // Initial session check
    const getInitialSession = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        showError(`Erro ao obter sessão inicial: ${error.message}`);
      }
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
      if (!initialSession) {
        navigate('/login');
      }
    };
    getInitialSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SupabaseContext.Provider value={{ session, user, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};