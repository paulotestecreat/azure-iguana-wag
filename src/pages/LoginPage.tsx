"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MadeWithDyad } from '@/components/made-with-dyad';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Bem-vindo de volta!</CardTitle>
          <p className="text-gray-600">Faça login ou crie sua conta para continuar.</p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]} // You can add 'google', 'facebook', etc. here if configured in Supabase
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(222.2 47.4% 11.2%)', // primary color
                    brandAccent: 'hsl(217.2 91.2% 59.8%)', // accent color
                  },
                },
              },
            }}
            theme="light"
            redirectTo={window.location.origin + '/dashboard'} // Redirect to dashboard after successful auth
          />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default LoginPage;