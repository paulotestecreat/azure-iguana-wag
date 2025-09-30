import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSupabaseAuth } from "@/integrations/supabase/supabaseAuth";
import { LogOut } from "lucide-react";

interface UserProfile {
  first_name: string;
  last_name: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
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
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
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

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess("Perfil atualizado com sucesso!");
      setIsEditing(false);
      // Re-fetch to update local state
      const { data, error: refetchError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
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
        <h1 className="text-4xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-lg text-gray-700 mt-2">Gerencie suas informações básicas</p>
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
      </main>

      <div className="w-full max-w-md mx-auto mt-4 space-y-2">
        <Link to="/dashboard">
          <Button variant="outline" className="w-full mt-2 border-gray-400 text-gray-700 hover:bg-gray-50 py-3 text-lg shadow-md">
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

export default Profile;