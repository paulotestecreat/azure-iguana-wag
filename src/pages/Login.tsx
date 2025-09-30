import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/integrations/supabase/supabaseAuth';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Login = () => {
  const navigate = useNavigate();
  const { session, loading } = useSupabaseAuth();

  useEffect(() => {
    if (session && !loading) {
      navigate('/dashboard');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Entrar ou Cadastrar</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Você pode adicionar 'google', 'facebook' aqui se quiser
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(217.2 91.2% 59.8%)', // Cor primária do seu tema
                  brandAccent: 'hsl(217.2 91.2% 59.8%)',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/dashboard'}
        />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Login;