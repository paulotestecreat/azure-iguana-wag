import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
}

const RegisterTransaction = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Usuário não autenticado.");
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id);

      if (error) {
        showError(`Erro ao carregar categorias: ${error.message}`);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  const handleRegisterTransaction = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Você precisa estar logado para registrar uma transação.");
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showError("Por favor, insira um valor válido para a transação.");
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parsedAmount,
          description,
          category_id: categoryId,
        });

      if (error) {
        throw error;
      }

      // Update monthly transaction count for limits
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('transactions_this_month, monthly_transaction_limit')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const newTransactionCount = (profileData?.transactions_this_month || 0) + 1;
      await supabase
        .from('profiles')
        .update({ transactions_this_month: newTransactionCount })
        .eq('id', user.id);

      showSuccess("Transação registrada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      showError(`Erro ao registrar transação: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Registrar Novo Gasto</CardTitle>
          <p className="text-gray-600">Adicione suas despesas rapidamente.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Ex: Café na padaria, Almoço com amigos"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                {categories.length === 0 && (
                  <SelectItem value="no-categories" disabled>
                    Nenhuma categoria disponível. Crie uma!
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRegisterTransaction} disabled={loading || !amount} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Registrando..." : "Registrar Gasto"}
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full mt-2 border-gray-400 text-gray-700 hover:bg-gray-50">
              Cancelar
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterTransaction;