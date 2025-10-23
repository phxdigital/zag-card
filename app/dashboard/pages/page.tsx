'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Calendar,
  Globe,
  BarChart3
} from 'lucide-react';
import Image from 'next/image';

interface Page {
  id: string | number;
  subdomain: string;
  title: string;
  subtitle: string;
  logo_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at?: string; // Tornar opcional
  status: 'active' | 'draft';
}

export default function MyPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);

  useEffect(() => {
    loadPages();
  }, []);


  const loadPages = async () => {
    try {
      const response = await fetch('/api/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (err) {
console.error('Erro ao carregar páginas:', err);
    




} finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string | number) => {
    console.log('=== INÍCIO DO DELETE ===');
    console.log('PageId recebido:', pageId, 'Tipo:', typeof pageId);
    console.log('deleteConfirm atual:', deleteConfirm);
    
    try {
      console.log('Fazendo requisição DELETE para:', `/api/pages/${pageId}`);
      
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Resposta recebida:');
      console.log('- Status:', response.status);
      console.log('- StatusText:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        console.log('✅ Sucesso! Removendo página da lista...');
        setPages(pages.filter(page => page.id !== pageId));
        setDeleteConfirm(null);
        alert('Página excluída com sucesso!');
        console.log('=== DELETE CONCLUÍDO COM SUCESSO ===');
      } else {
        console.log('❌ Erro na resposta da API');
        let errorData;
        try {
          errorData = await response.json();
          console.log('Dados do erro:', errorData);
        } catch (parseError) {
          console.log('Erro ao fazer parse do JSON:', parseError);
          errorData = { error: 'Erro desconhecido' };
        }
        alert(`Erro ao deletar página: ${errorData.error || 'Erro desconhecido'}`);
        console.log('=== DELETE FALHOU ===');
      }
    } catch (err) {
console.error('❌ Erro na requisição:', err);
      console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace available');
      alert(`Erro ao deletar página: ${err instanceof Error ? err.message : 'Verifique sua conexão e tente novamente'




}`);
      console.log('=== DELETE FALHOU COM EXCEÇÃO ===');
    }
  };

  const getPageUrl = (subdomain: string) => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol || 'https:';
      const hostname = window.location.hostname === 'localhost' ? 'localhost:3000' : 'zagnfc.com.br';
      return `${protocol}//${subdomain}.${hostname}`;
    }
    return `https://${subdomain}.zagnfc.com.br`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Minhas Páginas
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas páginas NFC criadas
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            href="/create-page"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Páginas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pages.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Páginas Ativas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pages.filter(p => p.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Última Atualização
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pages.length > 0 && pages[0].updated_at ? new Date(pages[0].updated_at).toLocaleDateString('pt-BR') : '-'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      {pages.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma página criada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando sua primeira página NFC.
          </p>
          <div className="mt-6">
            <Link
              href="/create-page"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Página
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-white overflow-hidden shadow rounded-lg">
              {/* Page Preview */}
              <div className="p-4 bg-gray-50">
                <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg shadow-sm border">
                  {page.thumbnail_url ? (
                    <Image
                      src={page.thumbnail_url}
                      alt="Preview da Landing Page"
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 h-32">
                      {page.logo_url ? (
                        <Image
                          src={page.logo_url}
                          alt="Logo"
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover mb-2"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full mb-2" />
                      )}
                      <h3 className="text-sm font-medium text-gray-900 text-center truncate w-full">
                        {page.title || 'Sem título'}
                      </h3>
                      {page.subtitle && (
                        <p className="text-xs text-gray-500 text-center truncate w-full mt-1">
                          {page.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Page Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {page.subdomain}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.status === 'active' ? 'Ativa' : 'Rascunho'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Criada em {new Date(page.created_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500">
                  {page.updated_at ? `Atualizada em ${new Date(page.updated_at).toLocaleDateString('pt-BR')}` : 'Nunca atualizada'}
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                {/* Primeira linha - Botões principais */}
                <div className="flex flex-wrap gap-3 mb-3">
                  <a
                    href={getPageUrl(page.subdomain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </a>
                  <Link
                    href={`/dashboard/edit/${page.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                  <Link
                    href={`/dashboard/analytics/${page.id}`}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Estatísticas
                  </Link>
                </div>
                
                {/* Segunda linha - Botões de ação */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Ações rápidas
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getPageUrl(page.subdomain));
                        alert('URL copiada para a área de transferência!');
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      title="Copiar URL"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirm(page.id);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                backgroundColor: '#fef2f2', 
                borderRadius: '50%', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#111827', 
                  marginBottom: '12px' 
                }}>
                  Excluir Página Permanentemente
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '12px' 
                }}>
                  Tem certeza que deseja excluir esta página? 
                </p>
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fecaca', 
                  borderRadius: '6px', 
                  padding: '12px' 
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#991b1b', 
                    fontWeight: '500',
                    marginBottom: '8px' 
                  }}>
                    ⚠️ ATENÇÃO: Esta é uma exclusão permanente!
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#b91c1c',
                    lineHeight: '1.5'
                  }}>
                    • A página será removida completamente do sistema<br/>
                    • Todos os dados serão perdidos para sempre<br/>
                    • O subdomínio ficará disponível para uso futuro<br/>
                    • Esta ação NÃO pode ser desfeita
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              marginTop: '24px' 
            }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('Botão de confirmação clicado, deleteConfirm:', deleteConfirm);
                  handleDelete(deleteConfirm);
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Sim, Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
