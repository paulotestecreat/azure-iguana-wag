import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";

interface UserMetric {
  id: string;
  first_name: string;
  last_name: string;
  whatsapp_number: string;
  transactions_this_month: number;
  monthly_transaction_limit: number;
}

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showError("Usuário não autenticado.");
          return;
        }

        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (adminError && adminError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw adminError;
        }

        if (adminData) {
          setIsAdmin(true);
          // Fetch all user metrics if admin
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, whatsapp_number, transactions_this_month, monthly_transaction_limit');

          if (profilesError) throw profilesError;
          setUserMetrics(profilesData || []);
        } else {
          setIsAdmin(false);
        }
      } catch (error: any) {
        showError(`Erro ao verificar status de admin: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando painel administrativo...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-4">Você não tem permissão para acessar esta página.</p>
            <Link to="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Voltar ao Painel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-lg text-gray-700 mt-2">Métricas de uso e monitoramento</p>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto mb-8 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Métricas de Uso dos Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {userMetrics.length === 0 ? (
              <p className="text-center text-gray-600">Nenhum usuário registrado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transações Mês</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limite Mensal</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Limite</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userMetrics.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.whatsapp_number || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.transactions_this_month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.monthly_transaction_limit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.transactions_this_month >= user.monthly_transaction_limit ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Atingido</span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <div className="w-full max-w-md mx-auto mt-4">
        <Link to="/dashboard">
          <Button variant="outline" className="w-full mt-2 border-gray-400 text-gray-700 hover:bg-gray-50 py-3 text-lg shadow-md">
            Voltar ao Painel do Usuário
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AdminDashboard;