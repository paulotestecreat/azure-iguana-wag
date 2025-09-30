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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ptBR } from 'date-fns/locale';

interface Category {
  id: string;
  name: string;
}

const RegisterTransaction = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
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
        .eq('user_id', user.id)
        .order('name', { ascending: true });

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

      if (!transactionDate) {
        showError("Por favor, selecione a data da transação.");
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parsedAmount,
          description,
          category_id: categoryId,
          type: transactionType,
          transaction_date: transactionDate.toISOString().split('T')[0], // Formatar para YYYY-MM-DD
        });

      if (error) {
        throw error;
      }

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
          <CardTitle className="text-3xl font-bold text-gray-900">Registrar Nova Transação</CardTitle>
          <p className="text-gray-600">Adicione suas receitas ou despesas rapidamente.</p>
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
              placeholder="Ex: Café na padaria, Salário mensal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Transação</Label>
            <Select onValueChange={(value: "income" | "expense") => setTransactionType(value)} value={transactionType}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="space-y-2">
            <Label htmlFor="transactionDate">Data da Transação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !transactionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {transactionDate ? format(transactionDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  onSelect={setTransactionDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleRegisterTransaction} disabled={loading || !amount || !transactionDate} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? "Registrando..." : "Registrar Transação"}
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