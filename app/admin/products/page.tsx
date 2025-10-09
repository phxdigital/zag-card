'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Edit, Trash2, Eye, EyeOff,
  Star, TrendingUp, AlertCircle
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  stock_quantity: number;
  stock_status: string;
  is_active: boolean;
  is_featured: boolean;
  thumbnail_url?: string;
  category?: string;
  created_at: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    checkAdmin();
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdmin = async () => {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      router.push('/access-denied');
    }
  };

  const loadProducts = async () => {
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do produto');
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      
      loadProducts();
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
      alert('Erro ao atualizar destaque do produto');
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Tem certeza que deseja excluir &ldquo;${productName}&rdquo;?`)) return;

    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      alert('Produto excluído com sucesso!');
      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.is_active) ||
                         (filterStatus === 'inactive' && !product.is_active);
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    outOfStock: products.filter(p => p.stock_quantity === 0).length,
    featured: products.filter(p => p.is_featured).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie o catálogo de produtos da loja
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sem Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Em Destaque</p>
                <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type=&ldquo;text&rdquo;
              placeholder="Buscar produtos...&ldquo;
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=&ldquo;all&rdquo;>Todos os status</option>
            <option value=&ldquo;active&rdquo;>Ativos</option>
            <option value=&ldquo;inactive&rdquo;>Inativos</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=&ldquo;all&rdquo;>Todas as categorias</option>
            <option value=&ldquo;Kits&rdquo;>Kits</option>
            <option value=&ldquo;Cartões NFC&rdquo;>Cartões NFC</option>
            <option value=&ldquo;Adesivos NFC&rdquo;>Adesivos NFC</option>
          </select>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estoque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Nenhum produto encontrado</p>
                  <p className="text-sm mt-1">Crie seu primeiro produto para começar!</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          {product.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </div>
                    {product.compare_price && (
                      <div className="text-xs text-gray-500 line-through">
                        R$ {product.compare_price.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock_quantity > 10 
                        ? 'bg-green-100 text-green-800'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity} unidades
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(product.id, product.is_active)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.is_active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFeatured(product.id, product.is_featured)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title={product.is_featured ? &rdquo;Remover destaque" : "Destacar produto"}
                      >
                        <Star className={`h-5 w-5 ${product.is_featured ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar&ldquo;
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => deleteProduct(product.id, product.name)}
                        className="text-red-600 hover:text-red-900"
                        title=&rdquo;Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div className="text-sm text-gray-500 text-center">
        Mostrando {filteredProducts.length} de {products.length} produtos
      </div>
    </div>
  );
}

