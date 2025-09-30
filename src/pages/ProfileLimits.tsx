import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface UserProfile {
  first_name: string;
  last_name: string;
  whatsapp_number: string;
  monthly_transaction_limit: number;
  transactions_this_month: number;
}

const ProfileLimits = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showError("Usuário não autenticado.");
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, whatsapp_number, monthly_transaction_limit, transactions_this_month')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setWhatsappNumber(data.whatsapp_number || "");
      } catch (error: any) {
        showError(`Erro ao carregar perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Usuário não autenticado.");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsappNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess("Perfil atualizado com sucesso!");
      setIsEditing(false);
      fetchProfile(); // Re-fetch to update local state
    } catch (error: any) {
      showError(`Erro ao salvar perfil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

export default ProfileLimits;