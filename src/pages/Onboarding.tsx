import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/integrations/supabase/supabaseAuth"; // Import useSupabaseAuth

const Onboarding = () => {
  const { user, loading } = useSupabaseAuth(); // Use the auth hook
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, navigate]);

  const handleConnectWhatsapp = async () => {
    setConnectLoading(true);
    try {
      if (!user) {
        showError("Você precisa estar logado para conectar o WhatsApp.");
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ whatsapp_number: whatsappNumber })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      showSuccess("Número do WhatsApp conectado com sucesso! Você receberá uma mensagem de boas-vindas.");
      navigate('/dashboard'); // Redirect to dashboard after connecting WhatsApp
    } catch (error: any) {
      showError(`Erro ao conectar WhatsApp: ${error.message}`);
    } finally {
      setConnectLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Bem-vindo ao Creative Go Financeiro!</CardTitle>
          <CardDescription className="text-gray-600">
            Vamos configurar seu assistente financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Passo 1: Conecte seu WhatsApp</h3>
            <p className="text-gray-600">
              Para começar a registrar seus gastos e receber notificações, precisamos do seu número de WhatsApp.
            </p>
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(XX) XXXXX-XXXX"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="mt-1"
            />
            <Button onClick={handleConnectWhatsapp} disabled={connectLoading || !whatsappNumber} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {connectLoading ? "Conectando..." : "Conectar WhatsApp"}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Passo 2: Explore seu Painel</h3>
            <p className="text-gray-600">
              Após conectar, você será direcionado ao seu painel para gerenciar suas finanças.
            </p>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-50">
                Ir para o Painel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;