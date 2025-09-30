"use client";

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabaseAuth } from '@/integrations/supabase/supabaseAuth';

const AuthGuard = () => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;