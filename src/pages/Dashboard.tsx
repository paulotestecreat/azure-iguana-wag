import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ArrowRight, Wallet, TrendingUp, Target, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";

interface DashboardData {
  totalSpent: number;
  remainingBudget: number;
  transactionsCount: number;
  goalsCount: number;
  debtsCount: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showError("Usuário não autenticado.");
          return;
        }

        // Fetch total spent this month
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .lte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString());

        if (transactionsError) throw transactionsError;

        const totalSpent = transactionsData.reduce((sum, t) => sum + t.amount, 0);
        const transactionsCount = transactionsData.length;

        // Fetch goals count
        const { count: goalsCount, error: goalsError } = await supabase
          .from('goals')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (goalsError) throw goalsError;

        // Fetch debts count
        const { count: debtsCount, error: debtsError } = await supabase
          .from('debts')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (debtsError) throw debtsError;

        // Placeholder for remaining budget (needs a budget feature)
        const remainingBudget = 0; // TODO: Implement budget logic

        setData({
          totalSpent,
          remainingBudget,
          transactionsCount,
          goalsCount: goalsCount || 0,
          debtsCount: debtsCount || 0,
        });

      } catch (error: any) {
        showError(`Erro ao carregar dados do painel: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Seu Painel Financeiro</h1>
        <p className="text-lg text-gray-700 mt-2">Visão geral das suas finanças</p>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {data?.totalSpent.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {data?.transactionsCount} transações registradas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Restante</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {data?.remainingBudget.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Baseado no seu orçamento mensal
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.goalsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Acompanhe seu progresso
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Ativas</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.debtsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Mantenha o controle das suas dívidas
            </p>
          </CardContent>
        </Card>
      </main>

      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/register-transaction">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg shadow-md flex items-center justify-center">
            Registrar Novo Gasto <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/transactions">
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Ver Todas as Transações <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/debts-goals">
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Gerenciar Dívidas e Metas <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/profile-limits">
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Meu Perfil e Limites <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </nav>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;