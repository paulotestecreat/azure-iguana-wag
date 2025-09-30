import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } = "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseAuth } from "@/integrations/supabase/supabaseAuth";
import { LogOut, MessageSquareText } from "lucide-react"; // Adicionado MessageSquareText

interface UserProfile {
  first_name: string;
  last_name: string;
  whatsapp_number: string;
  monthly_transaction_limit: number;
  transactions_this_month: number;
  monthly_budget: number;
}

const ProfileLimits = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false); // Novo estado para o botão de WhatsApp
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, whatsapp_number, monthly_transaction_limit, transactions_this_month, monthly_budget')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setWhatsappNumber(data.whatsapp_number || "");
        setMonthlyBudget(data.monthly_budget?.toString() || "0");
      } catch (error: any) {
        showError(`Erro ao carregar perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (!user) {
        showError("Usuário não autenticado.");
        navigate('/login');
        return;
      }

      const parsedMonthlyBudget = parseFloat(monthlyBudget);
      if (isNaN(parsedMonthlyBudget) || parsedMonthlyBudget < 0) {
        showError("Por favor, insira um valor válido para o orçamento mensal.");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsappNumber,
          monthly_budget: parsedMonthlyBudget,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess("Perfil atualizado com sucesso!");
      setIsEditing(false);
      // Re-fetch to update local state
      const { data, error: refetchError } = await supabase
        .from('profiles')
        .select('first_name, last_name, whatsapp_number, monthly_transaction_limit, transactions_this_month, monthly_budget')
        .eq('id', user.id)
        .single();
      if (refetchError) throw refetchError;
      setProfile(data);

    } catch (error: any) {
      showError(`Erro ao salvar perfil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestWhatsapp = async () => {
    setSendingWhatsapp(true);
    try {
      if (!user) {
        showError("Usuário não autenticado.");
        navigate('/login');
        return;
      }
      if (!whatsappNumber) {
        showError("Por favor, cadastre seu número de WhatsApp primeiro.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          userId: user.id,
          message: `Olá ${firstName}! Esta é uma mensagem de teste do seu assistente Creative Go Financeiro.`,
        },
      });

      if (error) {
        throw error;
      }

      showSuccess("Mensagem de teste enviada com sucesso para o WhatsApp!");
      console.log("WhatsApp test message response:", data);
    } catch (error: any) {
      showError(`Erro ao enviar mensagem de teste: ${error.message}`);
    } finally {
      setSendingWhatsapp(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      showSuccess("Você foi desconectado com sucesso!");
      navigate('/login');
    } catch (error: any) {
      showError(`Erro ao fazer logout: ${error.message}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Meu Perfil e Limites</h1>
        <p className="text-lg text-gray-700 mt-2">Gerencie suas informações e acompanhe seu uso</p>
      </header>

      <main className="flex-grow w-full max-w-md mx-auto mb-8 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="firstName">Primeiro Nome</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
              <Input id="whatsappNumber" type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="monthlyBudget">Orçamento Mensal (R$)</Label>
              <Input id="monthlyBudget" type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} disabled={!isEditing} />
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button onClick={handleSaveProfile} disabled={saving} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-grow border-gray-400 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Editar Perfil
              </Button>
            )}
            <Button
              onClick={handleSendTestWhatsapp}
              disabled={sendingWhatsapp || !whatsappNumber || !user}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center mt-4"
            >
              {sendingWhatsapp ? "Enviando Teste..." : "Testar Envio de WhatsApp"} <MessageSquareText className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Limites de Uso (Plano Gratuito)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-lg font-medium">Transações Mensais:</p>
              <p className="text-gray-700">
                {profile?.transactions_this_month || 0} de {profile?.monthly_transaction_limit || 0} usadas
              </p>
              {profile && profile.transactions_this_month >= profile.monthly_transaction_limit && (
                <p className="text-red-600 text-sm mt-2">Você atingiu seu limite de transações este mês. Considere um plano premium para mais funcionalidades!</p>
              )}
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Conheça Nossos Planos (Em Breve)
            </Button>
          </CardContent>
        </Card>
      </main>

      <div className="w-full max-w-md mx-auto mt-4 space-y-2">
        <Link to="/dashboard">
          <Button variant="outline" className="w-full border-gray-400 text-gray-700 hover:bg-gray-50 py-3 text-lg shadow-md">
            Voltar ao Painel
          </Button>
        </Link>
        <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg shadow-md flex items-center justify-center">
          Sair <LogOut className="ml-2 h-5 w-5" />
        </Button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ProfileLimits;