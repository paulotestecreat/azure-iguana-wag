import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  due_date: string;
  status: string;
}

interface Debt {
  id: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  creditor: string;
  status: string;
}

const DebtsGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new goal
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDueDate, setNewGoalDueDate] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);

  // Form states for new debt
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtTotal, setNewDebtTotal] = useState("");
  const [newDebtDueDate, setNewDebtDueDate] = useState("");
  const [newDebtCreditor, setNewDebtCreditor] = useState("");
  const [addingDebt, setAddingDebt] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Usuário não autenticado.");
        return;
      }

      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (debtsError) throw debtsError;
      setDebts(debtsData || []);

    } catch (error: any) {
      showError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    setAddingGoal(true);
    try {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      if (!user) {
        showError("Você precisa estar logado para adicionar uma meta.");
        return;
      }

      const parsedTarget = parseFloat(newGoalTarget);
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        showError("Por favor, insira um valor válido para a meta.");
        return;
      }

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: newGoalName,
          target_amount: parsedTarget,
          due_date: newGoalDueDate,
        });

      if (error) throw error;
      showSuccess("Meta adicionada com sucesso!");
      setNewGoalName("");
      setNewGoalTarget("");
      setNewGoalDueDate("");
      fetchData();
    } catch (error: any) {
      showError(`Erro ao adicionar meta: ${error.message}`);
    } finally {
      setAddingGoal(false);
    }
  };

  const handleAddDebt = async () => {
    setAddingDebt(true);
    try {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      if (!user) {
        showError("Você precisa estar logado para adicionar uma dívida.");
        return;
      }

      const parsedTotal = parseFloat(newDebtTotal);
      if (isNaN(parsedTotal) || parsedTotal <= 0) {
        showError("Por favor, insira um valor válido para a dívida.");
        return;
      }

      const { error } = await supabase
        .from('debts')
        .insert({
          user_id: user.id,
          name: newDebtName,
          total_amount: parsedTotal,
          due_date: newDebtDueDate,
          creditor: newDebtCreditor,
        });

      if (error) throw error;
      showSuccess("Dívida adicionada com sucesso!");
      setNewDebtName("");
      setNewDebtTotal("");
      setNewDebtDueDate("");
      setNewDebtCreditor("");
      fetchData();
    } catch (error: any) {
      showError(`Erro ao adicionar dívida: ${error.message}`);
    } finally {
      setAddingDebt(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando dívidas e metas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dívidas e Metas</h1>
        <p className="text-lg text-gray-700 mt-2">Gerencie seus objetivos financeiros e compromissos</p>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto mb-8 space-y-8">
        {/* Metas Financeiras */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Minhas Metas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-center text-gray-600">Nenhuma meta definida ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="border p-4 rounded-lg shadow-sm bg-white">
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <p className="text-gray-700">Meta: R$ {goal.target_amount.toFixed(2)}</p>
                    <p className="text-gray-700">Atual: R$ {goal.current_amount.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">Prazo: {goal.due_date ? format(new Date(goal.due_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</p>
                    <p className={`text-sm font-medium ${goal.status === 'active' ? 'text-blue-600' : 'text-green-600'}`}>Status: {goal.status}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 pt-4 border-t mt-4">
              <h3 className="text-xl font-semibold">Adicionar Nova Meta</h3>
              <Label htmlFor="newGoalName">Nome da Meta</Label>
              <Input id="newGoalName" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Ex: Comprar carro, Viagem" />
              <Label htmlFor="newGoalTarget">Valor Alvo (R$)</Label>
              <Input id="newGoalTarget" type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="5000.00" />
              <Label htmlFor="newGoalDueDate">Data Limite</Label>
              <Input id="newGoalDueDate" type="date" value={newGoalDueDate} onChange={(e) => setNewGoalDueDate(e.target.value)} />
              <Button onClick={handleAddGoal} disabled={addingGoal || !newGoalName || !newGoalTarget} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {addingGoal ? "Adicionando..." : "Adicionar Meta"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Dívidas */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Minhas Dívidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {debts.length === 0 ? (
              <p className="text-center text-gray-600">Nenhuma dívida registrada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debts.map((debt) => (
                  <div key={debt.id} className="border p-4 rounded-lg shadow-sm bg-white">
                    <h3 className="font-semibold text-lg">{debt.name}</h3>
                    <p className="text-gray-700">Total: R$ {debt.total_amount.toFixed(2)}</p>
                    <p className="text-gray-700">Pago: R$ {debt.paid_amount.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">Vencimento: {debt.due_date ? format(new Date(debt.due_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</p>
                    <p className="text-gray-500 text-sm">Credor: {debt.creditor || 'N/A'}</p>
                    <p className={`text-sm font-medium ${debt.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>Status: {debt.status}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 pt-4 border-t mt-4">
              <h3 className="text-xl font-semibold">Adicionar Nova Dívida</h3>
              <Label htmlFor="newDebtName">Nome da Dívida</Label>
              <Input id="newDebtName" value={newDebtName} onChange={(e) => setNewDebtName(e.target.value)} placeholder="Ex: Empréstimo pessoal, Cartão de crédito" />
              <Label htmlFor="newDebtTotal">Valor Total (R$)</Label>
              <Input id="newDebtTotal" type="number" value={newDebtTotal} onChange={(e) => setNewDebtTotal(e.target.value)} placeholder="1000.00" />
              <Label htmlFor="newDebtCreditor">Credor</Label>
              <Input id="newDebtCreditor" value={newDebtCreditor} onChange={(e) => setNewDebtCreditor(e.target.value)} placeholder="Ex: Banco X, Amigo Y" />
              <Label htmlFor="newDebtDueDate">Data de Vencimento</Label>
              <Input id="newDebtDueDate" type="date" value={newDebtDueDate} onChange={(e) => setNewDebtDueDate(e.target.value)} />
              <Button onClick={handleAddDebt} disabled={addingDebt || !newDebtName || !newDebtTotal} className="w-full bg-red-600 hover:bg-red-700 text-white">
                {addingDebt ? "Adicionando..." : "Adicionar Dívida"}
              </Button>
            </div>
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

export default DebtsGoals;