import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
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
        throw error;
      }
      setCategories(data || []);
    } catch (error: any) {
      showError(`Erro ao carregar categorias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    setAddingCategory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Você precisa estar logado para adicionar uma categoria.");
        return;
      }

      if (!newCategoryName.trim()) {
        showError("O nome da categoria não pode ser vazio.");
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: newCategoryName.trim(),
        });

      if (error) {
        throw error;
      }
      showSuccess("Categoria adicionada com sucesso!");
      setNewCategoryName("");
      fetchCategories();
    } catch (error: any) {
      showError(`Erro ao adicionar categoria: ${error.message}`);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    setEditingCategoryId(id);
    const categoryToEdit = categories.find(cat => cat.id === id);
    if (categoryToEdit) {
      setEditingCategoryName(categoryToEdit.name);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) {
      showError("O nome da categoria não pode ser vazio.");
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editingCategoryName.trim() })
        .eq('id', editingCategoryId);

      if (error) throw error;
      showSuccess("Categoria atualizada com sucesso!");
      setEditingCategoryId(null);
      setEditingCategoryName("");
      fetchCategories();
    } catch (error: any) {
      showError(`Erro ao atualizar categoria: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess("Categoria excluída com sucesso!");
      fetchCategories();
    } catch (error: any) {
      showError(`Erro ao excluir categoria: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gerenciar Categorias</h1>
        <p className="text-lg text-gray-700 mt-2">Crie e edite suas categorias financeiras</p>
      </header>

      <main className="flex-grow w-full max-w-md mx-auto mb-8 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Adicionar Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newCategoryName">Nome da Categoria</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Alimentação, Salário, Aluguel"
              />
            </div>
            <Button onClick={handleAddCategory} disabled={addingCategory || !newCategoryName.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {addingCategory ? "Adicionando..." : "Adicionar Categoria"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Minhas Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-center text-gray-600">Nenhuma categoria criada ainda.</p>
            ) : (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
                    {editingCategoryId === category.id ? (
                      <Input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-lg text-gray-800">{category.name}</span>
                    )}
                    <div className="flex space-x-2">
                      {editingCategoryId !== category.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category.id)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria &quot;{category.name}&quot; e removerá sua associação de todas as transações.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-600 hover:bg-red-700">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
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

export default Categories;