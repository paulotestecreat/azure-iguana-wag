import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  transaction_date: string;
  type: "income" | "expense";
  categories: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Usuário não autenticado.");
        return;
      }

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Buscar transações
      let query = supabase
        .from('transactions')
        .select(`
            id,
            amount,
            description,
            transaction_date,
            type,
            category_id,
            categories ( name )
          `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (startDate) {
        query = query.gte('transaction_date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('transaction_date', format(endDate, 'yyyy-MM-dd'));
      }
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setTransactions(data || []);
    } catch (error: any) {
      showError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Minhas Transações</h1>
        <p className="text-lg text-gray-700 mt-2">Visualize e gerencie seus gastos e receitas</p>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto mb-8">
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Relatório Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-700">Total de Entradas</p>
              <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-lg font-semibold text-red-700">Total de Saídas</p>
              <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold text-blue-700">Saldo</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {balance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Categoria</label>
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-600">Carregando transações...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-600">Nenhuma transação registrada ainda com os filtros selecionados.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description || 'Sem descrição'}</TableCell>
                        <TableCell>{transaction.categories?.name || 'Sem categoria'}</TableCell>
                        <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <div className="w-full max-w-md mx-auto mt-4">
        <Link to="/dashboard">
          <Button variant="outline" className="w-full mt-2 border-gray-400 text-gray-700 hover:bg-gray-50 py-3 text-lg shadow-md">
            Voltar ao Painel
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Transactions;