import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseAuth } from "@/integrations/supabase/supabaseAuth";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  transaction_date: string;
  categories: { name: string } | null;
}

const Transactions = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id,
            amount,
            description,
            transaction_date,
            category_id,
            categories ( name )
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false });

        if (error) {
          throw error;
        }
        setTransactions(data || []);
      } catch (error: any) {
        showError(`Erro ao carregar transações: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Minhas Transações</h1>
        <p className="text-lg text-gray-700 mt-2">Visualize e gerencie seus gastos</p>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Histórico de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-600">Nenhuma transação registrada ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{transaction.description || 'Sem descrição'}</TableCell>
                        <TableCell>{transaction.categories?.name || 'Sem categoria'}</TableCell>
                        <TableCell className="text-right">R$ {transaction.amount.toFixed(2)}</TableCell>
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
        <Link to="/register-transaction">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg shadow-md">
            Registrar Novo Gasto
          </Button>
        </Link>
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