import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Trash2, Edit, PlusCircle, ShoppingCart, Store, Tag, CheckCircle, XCircle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface GroceryCategory {
  id: string;
  name: string;
}

interface Supermarket {
  id: string;
  name: string;
}

interface GroceryItem {
  id: string;
  product_name: string;
  quantity: number;
  unit: string | null;
  estimated_price_per_unit: number | null;
  grocery_category_id: string | null;
  supermarket_id: string | null;
  is_purchased: boolean;
  grocery_categories: { name: string } | null;
  supermarkets: { name: string } | null;
}

const MonthlyGrocery = () => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [groceryCategories, setGroceryCategories] = useState<GroceryCategory[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProductName, setNewProductName] = useState("");
  const [newProductQuantity, setNewProductQuantity] = useState("1");
  const [newProductUnit, setNewProductUnit] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategoryId, setNewProductCategoryId] = useState<string | undefined>(undefined);
  const [newProductSupermarketId, setNewProductSupermarketId] = useState<string | undefined>(undefined);
  const [addingItem, setAddingItem] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [newSupermarketName, setNewSupermarketName] = useState("");
  const [addingSupermarket, setAddingSupermarket] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<Partial<GroceryItem>>({});

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

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('grocery_categories')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (categoriesError) throw categoriesError;
      setGroceryCategories(categoriesData || []);

      // Fetch supermarkets
      const { data: supermarketsData, error: supermarketsError } = await supabase
        .from('supermarkets')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (supermarketsError) throw supermarketsError;
      setSupermarkets(supermarketsData || []);

      // Fetch grocery items
      const { data: itemsData, error: itemsError } = await supabase
        .from('grocery_items')
        .select(`
          id,
          product_name,
          quantity,
          unit,
          estimated_price_per_unit,
          grocery_category_id,
          supermarket_id,
          is_purchased,
          grocery_categories ( name ),
          supermarkets ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (itemsError) throw itemsError;
      setGroceryItems(itemsData || []);

    } catch (error: any) {
      showError(`Erro ao carregar dados da feira: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroceryItem = async () => {
    setAddingItem(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Você precisa estar logado para adicionar um item.");
        return;
      }

      if (!newProductName.trim()) {
        showError("O nome do produto não pode ser vazio.");
        return;
      }

      const parsedQuantity = parseFloat(newProductQuantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        showError("Por favor, insira uma quantidade válida.");
        return;
      }

      const parsedPrice = newProductPrice ? parseFloat(newProductPrice) : null;
      if (newProductPrice && (isNaN(parsedPrice!) || parsedPrice! < 0)) {
        showError("Por favor, insira um preço válido.");
        return;
      }

      const { error } = await supabase
        .from('grocery_items')
        .insert({
          user_id: user.id,
          product_name: newProductName.trim(),
          quantity: parsedQuantity,
          unit: newProductUnit.trim() || null,
          estimated_price_per_unit: parsedPrice,
          grocery_category_id: newProductCategoryId || null,
          supermarket_id: newProductSupermarketId || null,
        });

      if (error) throw error;
      showSuccess("Item da feira adicionado com sucesso!");
      setNewProductName("");
      setNewProductQuantity("1");
      setNewProductUnit("");
      setNewProductPrice("");
      setNewProductCategoryId(undefined);
      setNewProductSupermarketId(undefined);
      fetchData();
    } catch (error: any) {
      showError(`Erro ao adicionar item: ${error.message}`);
    } finally {
      setAddingItem(false);
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
        .from('grocery_categories')
        .insert({
          user_id: user.id,
          name: newCategoryName.trim(),
        });

      if (error) throw error;
      showSuccess("Categoria de feira adicionada com sucesso!");
      setNewCategoryName("");
      fetchData(); // Re-fetch all data to update categories in selects
    } catch (error: any) {
      showError(`Erro ao adicionar categoria: ${error.message}`);
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddSupermarket = async () => {
    setAddingSupermarket(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Você precisa estar logado para adicionar um supermercado.");
        return;
      }

      if (!newSupermarketName.trim()) {
        showError("O nome do supermercado não pode ser vazio.");
        return;
      }

      const { error } = await supabase
        .from('supermarkets')
        .insert({
          user_id: user.id,
          name: newSupermarketName.trim(),
        });

      if (error) throw error;
      showSuccess("Supermercado adicionado com sucesso!");
      setNewSupermarketName("");
      fetchData(); // Re-fetch all data to update supermarkets in selects
    } catch (error: any) {
      showError(`Erro ao adicionar supermercado: ${error.message}`);
    } finally {
      setAddingSupermarket(false);
    }
  };

  const handleEditItem = (item: GroceryItem) => {
    setEditingItemId(item.id);
    setEditingItemData({
      product_name: item.product_name,
      quantity: item.quantity,
      unit: item.unit,
      estimated_price_per_unit: item.estimated_price_per_unit,
      grocery_category_id: item.grocery_category_id,
      supermarket_id: item.supermarket_id,
      is_purchased: item.is_purchased,
    });
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!editingItemData.product_name?.trim()) {
      showError("O nome do produto não pode ser vazio.");
      return;
    }
    if (isNaN(editingItemData.quantity!) || editingItemData.quantity! <= 0) {
      showError("Por favor, insira uma quantidade válida.");
      return;
    }
    if (editingItemData.estimated_price_per_unit && (isNaN(editingItemData.estimated_price_per_unit!) || editingItemData.estimated_price_per_unit! < 0)) {
      showError("Por favor, insira um preço válido.");
      return;
    }

    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({
          product_name: editingItemData.product_name,
          quantity: editingItemData.quantity,
          unit: editingItemData.unit || null,
          estimated_price_per_unit: editingItemData.estimated_price_per_unit || null,
          grocery_category_id: editingItemData.grocery_category_id || null,
          supermarket_id: editingItemData.supermarket_id || null,
          is_purchased: editingItemData.is_purchased,
        })
        .eq('id', itemId);

      if (error) throw error;
      showSuccess("Item da feira atualizado com sucesso!");
      setEditingItemId(null);
      setEditingItemData({});
      fetchData();
    } catch (error: any) {
      showError(`Erro ao atualizar item: ${error.message}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess("Item da feira excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      showError(`Erro ao excluir item: ${error.message}`);
    }
  };

  const handleTogglePurchased = async (item: GroceryItem) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ is_purchased: !item.is_purchased })
        .eq('id', item.id);

      if (error) throw error;
      showSuccess(`Item marcado como ${item.is_purchased ? 'não comprado' : 'comprado'}!`);
      fetchData();
    } catch (error: any) {
      showError(`Erro ao atualizar status do item: ${error.message}`);
    }
  };

  const totalEstimatedValue = groceryItems.reduce((sum, item) => {
    if (item.estimated_price_per_unit && item.quantity && !item.is_purchased) {
      return sum + (item.estimated_price_per_unit * item.quantity);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-700">Carregando lista de feira...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Feira do Mês</h1>
        <p className="text-lg text-gray-700 mt-2">Organize sua lista de compras e estime os gastos</p>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto mb-8 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ShoppingCart className="mr-2 h-6 w-6" /> Adicionar Novo Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newProductName">Produto</Label>
                <Input
                  id="newProductName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ex: Arroz, Leite, Frango"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newProductQuantity">Quantidade</Label>
                <Input
                  id="newProductQuantity"
                  type="number"
                  value={newProductQuantity}
                  onChange={(e) => setNewProductQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newProductUnit">Unidade (opcional)</Label>
                <Input
                  id="newProductUnit"
                  value={newProductUnit}
                  onChange={(e) => setNewProductUnit(e.target.value)}
                  placeholder="Ex: kg, litro, un"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newProductPrice">Preço Estimado por Unidade (R$)</Label>
                <Input
                  id="newProductPrice"
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newProductCategory">Categoria</Label>
                <Select onValueChange={setNewProductCategoryId} value={newProductCategoryId}>
                  <SelectTrigger id="newProductCategory">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {groceryCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {groceryCategories.length === 0 && (
                      <SelectItem value="no-categories" disabled>
                        Nenhuma categoria disponível.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newProductSupermarket">Supermercado</Label>
                <Select onValueChange={setNewProductSupermarketId} value={newProductSupermarketId}>
                  <SelectTrigger id="newProductSupermarket">
                    <SelectValue placeholder="Selecione um supermercado" />
                  </SelectTrigger>
                  <SelectContent>
                    {supermarkets.map((sm) => (
                      <SelectItem key={sm.id} value={sm.id}>
                        {sm.name}
                      </SelectItem>
                    ))}
                    {supermarkets.length === 0 && (
                      <SelectItem value="no-supermarkets" disabled>
                        Nenhum supermercado disponível.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddGroceryItem} disabled={addingItem || !newProductName.trim() || !newProductQuantity.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {addingItem ? "Adicionando..." : "Adicionar Item à Lista"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Tag className="mr-2 h-6 w-6" /> Gerenciar Categorias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria (Ex: Hortifruti)"
                />
                <Button onClick={handleAddCategory} disabled={addingCategory || !newCategoryName.trim()} size="icon" className="bg-green-600 hover:bg-green-700">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {groceryCategories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                    <span className="text-gray-800">{category.name}</span>
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria &quot;{category.name}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(category.id)} className="bg-red-600 hover:bg-red-700">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Store className="mr-2 h-6 w-6" /> Gerenciar Supermercados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newSupermarketName}
                  onChange={(e) => setNewSupermarketName(e.target.value)}
                  placeholder="Novo supermercado (Ex: Carrefour)"
                />
                <Button onClick={handleAddSupermarket} disabled={addingSupermarket || !newSupermarketName.trim()} size="icon" className="bg-green-600 hover:bg-green-700">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {supermarkets.map((sm) => (
                  <li key={sm.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                    <span className="text-gray-800">{sm.name}</span>
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o supermercado &quot;{sm.name}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(sm.id)} className="bg-red-600 hover:bg-red-700">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Lista de Compras ({groceryItems.filter(item => !item.is_purchased).length} itens pendentes)
            </CardTitle>
            <p className="text-lg font-semibold text-gray-800">
              Valor Total Estimado: <span className="text-blue-600">R$ {totalEstimatedValue.toFixed(2)}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {groceryItems.length === 0 ? (
              <p className="text-center text-gray-600">Sua lista de feira está vazia. Adicione alguns itens!</p>
            ) : (
              <ul className="space-y-3">
                {groceryItems.map((item) => (
                  <li key={item.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-sm transition-all duration-200 ${item.is_purchased ? 'bg-green-50 border-l-4 border-green-500 opacity-70' : 'bg-white border-l-4 border-blue-500'}`}>
                    {editingItemId === item.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <Input
                          value={editingItemData.product_name || ''}
                          onChange={(e) => setEditingItemData({ ...editingItemData, product_name: e.target.value })}
                          placeholder="Nome do produto"
                        />
                        <Input
                          type="number"
                          value={editingItemData.quantity || ''}
                          onChange={(e) => setEditingItemData({ ...editingItemData, quantity: parseFloat(e.target.value) })}
                          placeholder="Quantidade"
                        />
                        <Input
                          value={editingItemData.unit || ''}
                          onChange={(e) => setEditingItemData({ ...editingItemData, unit: e.target.value })}
                          placeholder="Unidade"
                        />
                        <Input
                          type="number"
                          value={editingItemData.estimated_price_per_unit || ''}
                          onChange={(e) => setEditingItemData({ ...editingItemData, estimated_price_per_unit: parseFloat(e.target.value) })}
                          placeholder="Preço por unidade"
                        />
                        <Select onValueChange={(value) => setEditingItemData({ ...editingItemData, grocery_category_id: value })} value={editingItemData.grocery_category_id || undefined}>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {groceryCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => setEditingItemData({ ...editingItemData, supermarket_id: value })} value={editingItemData.supermarket_id || undefined}>
                          <SelectTrigger>
                            <SelectValue placeholder="Supermercado" />
                          </SelectTrigger>
                          <SelectContent>
                            {supermarkets.map((sm) => (
                              <SelectItem key={sm.id} value={sm.id}>
                                {sm.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2 col-span-full">
                          <Checkbox
                            id={`purchased-${item.id}`}
                            checked={editingItemData.is_purchased}
                            onCheckedChange={(checked) => setEditingItemData({ ...editingItemData, is_purchased: checked as boolean })}
                          />
                          <Label htmlFor={`purchased-${item.id}`}>Comprado</Label>
                        </div>
                        <div className="flex space-x-2 col-span-full">
                          <Button onClick={() => handleSaveEdit(item.id)} className="flex-grow bg-green-600 hover:bg-green-700">Salvar</Button>
                          <Button variant="outline" onClick={() => setEditingItemId(null)} className="flex-grow">Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-grow space-y-1">
                          <h3 className={`text-lg font-semibold ${item.is_purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.product_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit || ''}
                            {item.estimated_price_per_unit && ` - R$ ${(item.estimated_price_per_unit * item.quantity).toFixed(2)} (R$ ${item.estimated_price_per_unit.toFixed(2)}/${item.unit || 'un'})`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.grocery_categories?.name && `Categoria: ${item.grocery_categories.name}`}
                            {item.supermarkets?.name && ` | Supermercado: ${item.supermarkets.name}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          <Button variant="ghost" size="icon" onClick={() => handleTogglePurchased(item)}>
                            {item.is_purchased ? <XCircle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                            <Edit className="h-5 w-5 text-blue-600" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o item &quot;{item.product_name}&quot; da sua lista.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-red-600 hover:bg-red-700">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
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

export default MonthlyGrocery;