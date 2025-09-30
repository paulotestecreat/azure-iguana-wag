import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { ArrowRight, Wallet, TrendingUp, ListChecks, Settings, ShoppingCart } from "lucide-react"; // Importar ShoppingCart
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  amount: number;
  type: "income" | "expense";
  category_id: string | null;
  transaction_date: string;
  categories: { name: string } | null;
}

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2', '#7FFF00'];

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryData[]>([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyData[]>([]);
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

        const today = new Date();
        const startOfCurrentMonth = startOfMonth(today);
        const endOfCurrentMonth = endOfMonth(today);

        // Buscar todas as transações dos últimos 6 meses para gráficos e do mês atual para o resumo
        const sixMonthsAgo = subMonths(startOfCurrentMonth, 5); // Início do mês 6 meses atrás
        const { data: allTransactions, error: allTransactionsError } = await supabase
          .from('transactions')
          .select(`
            amount,
            type,
            transaction_date,
            category_id,
            categories ( name )
          `)
          .eq('user_id', user.id)
          .gte('transaction_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
          .order('transaction_date', { ascending: true });

        if (allTransactionsError) throw allTransactionsError;

        // Calcular resumo do mês atual
        const currentMonthTransactions = allTransactions.filter(t => {
          const transactionDate = new Date(t.transaction_date);
          return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
        });

        const currentMonthIncome = currentMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const currentMonthExpenses = currentMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setTotalIncome(currentMonthIncome);
        setTotalExpenses(currentMonthExpenses);
        setBalance(currentMonthIncome - currentMonthExpenses);

        // Preparar dados para distribuição por categoria (despesas do mês atual)
        const expenseCategoriesMap = new Map<string, number>();
        currentMonthTransactions
          .filter(t => t.type === 'expense' && t.categories?.name)
          .forEach(t => {
            const categoryName = t.categories!.name;
            expenseCategoriesMap.set(categoryName, (expenseCategoriesMap.get(categoryName) || 0) + t.amount);
          });

        const categoryData = Array.from(expenseCategoriesMap.entries()).map(([name, value]) => ({ name, value }));
        setCategoryDistribution(categoryData);

        // Preparar dados para evolução mensal (últimos 6 meses)
        const monthlyDataMap = new Map<string, { income: number; expense: number }>();
        const months = eachMonthOfInterval({ start: sixMonthsAgo, end: today });

        months.forEach(month => {
          const monthKey = format(month, 'MMM/yy', { locale: ptBR });
          monthlyDataMap.set(monthKey, { income: 0, expense: 0 });
        });

        allTransactions.forEach(t => {
          const transactionMonthKey = format(new Date(t.transaction_date), 'MMM/yy', { locale: ptBR });
          const currentMonthData = monthlyDataMap.get(transactionMonthKey);
          if (currentMonthData) {
            if (t.type === 'income') {
              currentMonthData.income += t.amount;
            } else {
              currentMonthData.expense += t.amount;
            }
            monthlyDataMap.set(transactionMonthKey, currentMonthData);
          }
        });

        const monthlyEvolutionData = Array.from(monthlyDataMap.entries())
          .map(([month, data]) => ({
            month,
            income: data.income,
            expense: data.expense,
            balance: data.income - data.expense,
          }))
          .sort((a, b) => {
            const dateA = new Date(`01-${a.month.replace('/', '-')}`);
            const dateB = new Date(`01-${b.month.replace('/', '-')}`);
            return dateA.getTime() - dateB.getTime();
          });

        setMonthlyEvolution(monthlyEvolutionData);

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

      <main className="flex-grow w-full max-w-6xl mx-auto mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas (Mês)</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Receitas deste mês
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Saídas (Mês)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Despesas deste mês
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo (Mês)</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Saldo atual do mês
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Despesas por Categoria (Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-600">Nenhuma despesa registrada este mês para exibir por categoria.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyEvolution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyEvolution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="income" fill="#82ca9d" name="Receitas" />
                    <Bar dataKey="expense" fill="#fa8072" name="Despesas" />
                    <Bar dataKey="balance" fill="#8884d8" name="Saldo" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-600">Nenhum dado de transação para exibir a evolução mensal.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/register-transaction">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg shadow-md flex items-center justify-center">
            Registrar Nova Transação <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/transactions">
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Ver Todas as Transações <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/categories">
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Gerenciar Categorias <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/monthly-grocery"> {/* Novo link para a Feira do Mês */}
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Feira do Mês <ShoppingCart className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-6 text-lg shadow-md flex items-center justify-center">
            Meu Perfil <Settings className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </nav>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;