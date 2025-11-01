'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Upload,
  Package,
  AlertCircle
} from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  category: string;
  tags: string[];
  features: string[];
  stock_quantity: number;
  stock_status: string;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  thumbnail_url?: string;
  requires_shipping: boolean;
  weight?: number;
  dimensions?: Record<string, unknown>;
  shipping_time: string;
  meta_title?: string;
  meta_description?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_price: 0,
    category: '',
    tags: [] as string[],
    features: [] as string[],
    stock_quantity: 0,
    stock_status: 'in_stock',
    is_active: true,
    is_featured: false,
    images: [] as string[],
    thumbnail_url: '',
    requires_shipping: true,
    weight: 0,
    dimensions: {} as Record<string, unknown>,
    shipping_time: '',
    meta_title: '',
    meta_description: ''
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAdmin();
    loadProduct();
  }, [productId]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      router.push('/access-denied');
    }
  };

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      setProduct(data);
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        short_description: data.short_description || '',
        price: data.price || 0,
        compare_price: data.compare_price || 0,
        category: data.category || '',
        tags: data.tags || [],
        features: data.features || [],
        stock_quantity: data.stock_quantity || 0,
        stock_status: data.stock_status || 'in_stock',
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        images: data.images || [],
        thumbnail_url: data.thumbnail_url || '',
        requires_shipping: data.requires_shipping ?? true,
        weight: data.weight || 0,
        dimensions: data.dimensions || {},
        shipping_time: data.shipping_time || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || ''
      });
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      setError('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          short_description: formData.short_description,
          price: formData.price,
          compare_price: formData.compare_price || null,
          category: formData.category,
          tags: formData.tags,
          features: formData.features,
          stock_quantity: formData.stock_quantity,
          stock_status: formData.stock_status,
          is_active: formData.is_active,
          is_featured: formData.is_featured,
          images: formData.images,
          thumbnail_url: formData.thumbnail_url || null,
          requires_shipping: formData.requires_shipping,
          weight: formData.weight || null,
          dimensions: formData.dimensions && Object.keys(formData.dimensions).length > 0 ? formData.dimensions : null,
          shipping_time: formData.shipping_time,
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      alert('Produto atualizado com sucesso!');
      router.push('/admin/products');
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setError('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Produto não encontrado</h2>
          <p className="text-gray-600 mb-4">O produto que você está tentando editar não existe.</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Produto</h1>
            <p className="mt-1 text-sm text-gray-500">
              Atualize as informações do produto
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-5 w-5 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Curta
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preços */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preços</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço de Comparação
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.compare_price}
                  onChange={(e) => handleInputChange('compare_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Estoque */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estoque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Estoque
                </label>
                <select
                  value={formData.stock_status}
                  onChange={(e) => handleInputChange('stock_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="in_stock">Em Estoque</option>
                  <option value="out_of_stock">Fora de Estoque</option>
                  <option value="on_backorder">Sob Encomenda</option>
                </select>
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Produto</h3>
            <ImageUpload
              images={formData.images}
              onImagesChange={(images) => handleInputChange('images', images)}
              maxImages={10}
            />
          </div>

          {/* Tags e Features */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags e Recursos</h3>
            
            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recursos</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Adicionar recurso"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <button
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{feature}</span>
                    <button
                      onClick={() => removeFeature(feature)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Ativo</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Em Destaque</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoria</h3>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              <option value="Kits">Kits</option>
              <option value="Cartões NFC">Cartões NFC</option>
              <option value="Adesivos NFC">Adesivos NFC</option>
            </select>
          </div>

          {/* Frete */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frete e Dimensões</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Requer Frete</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_shipping}
                    onChange={(e) => handleInputChange('requires_shipping', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {formData.requires_shipping && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 0.05"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Peso em quilogramas (ex: 0.05 = 50g)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensões (cm) *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Comprimento</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={typeof formData.dimensions === 'object' && formData.dimensions !== null && 'length' in formData.dimensions ? (formData.dimensions as { length?: number }).length || '' : ''}
                          onChange={(e) => {
                            const dims = formData.dimensions || {};
                            handleInputChange('dimensions', {
                              ...dims,
                              length: parseFloat(e.target.value) || 0
                            });
                          }}
                          placeholder="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Largura</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={typeof formData.dimensions === 'object' && formData.dimensions !== null && 'width' in formData.dimensions ? (formData.dimensions as { width?: number }).width || '' : ''}
                          onChange={(e) => {
                            const dims = formData.dimensions || {};
                            handleInputChange('dimensions', {
                              ...dims,
                              width: parseFloat(e.target.value) || 0
                            });
                          }}
                          placeholder="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Altura</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={typeof formData.dimensions === 'object' && formData.dimensions !== null && 'height' in formData.dimensions ? (formData.dimensions as { height?: number }).height || '' : ''}
                          onChange={(e) => {
                            const dims = formData.dimensions || {};
                            handleInputChange('dimensions', {
                              ...dims,
                              height: parseFloat(e.target.value) || 0
                            });
                          }}
                          placeholder="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Dimensões em centímetros (ex: 20x15x1)</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo de Entrega
                </label>
                <input
                  type="text"
                  value={formData.shipping_time}
                  onChange={(e) => handleInputChange('shipping_time', e.target.value)}
                  placeholder="Ex: 5-7 dias úteis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
