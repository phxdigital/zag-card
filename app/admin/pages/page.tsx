'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, ExternalLink, User, Globe, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientPage {
    id: string;
    subdomain: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    // Dados do usuário
    user_email?: string;
    user_name?: string;
}

export default function AdminPagesPage() {
    const [pages, setPages] = useState<ClientPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        setLoading(true);
        try {
            // Buscar TODAS as páginas via API (admin)
            const response = await fetch('/api/admin/pages');
            
            if (!response.ok) {
                throw new Error('Erro ao carregar páginas');
            }

            const data = await response.json();
            setPages(data.pages || []);
        } catch (error) {
            console.error('Erro ao carregar páginas:', error);
            alert('Erro ao carregar páginas. Verifique suas permissões.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subdomain: string, id: string) => {
        if (!confirm(`Tem certeza que deseja remover a página &ldquo;${subdomain}.zagnfc.com.br&rdquo;?\n\nEsta ação não pode ser desfeita!`)) {
            return;
        }

        try {
            const response = await fetch('/api/admin/pages', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: id }),
            });

            if (!response.ok) {
                throw new Error('Erro ao remover página');
            }

            alert('Página removida com sucesso!');
            setPages(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Erro ao remover página:', error);
            alert('Erro ao remover página. Tente novamente.');
        }
    };

    const filteredPages = pages.filter(page =>
        searchTerm === '' ||
        page.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando páginas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header com Busca */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Páginas Web dos Clientes</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Total: {pages.length} página(s) | Mostrando: {filteredPages.length}
                        </p>
                    </div>
                </div>

                {/* Barra de Busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type=&ldquo;text&rdquo;
                        placeholder="🔍 Buscar por subdomínio ou usuário...&ldquo;
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Lista de Páginas */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {filteredPages.length === 0 ? (
                    <div className="p-12 text-center">
                        <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhuma página encontrada
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? `Nenhum resultado para &ldquo;${searchTerm}&rdquo;` : 'Ainda não há páginas criadas'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        URL / Subdomínio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Criada em
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                        {/* URL */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <Globe className="w-5 h-5 text-purple-600 mr-3" />
                                                <div>
                                                    <a
                                                        href={`https://${page.subdomain}.zagnfc.com.br`}
                                                        target=&ldquo;_blank&rdquo;
                                                        rel=&rdquo;noopener noreferrer"
                                                        className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                                    >
                                                        {page.subdomain}.zagnfc.com.br
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <p className="text-xs text-gray-500">/{page.subdomain}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Usuário */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{page.user_name}</p>
                                                    <p className="text-xs text-gray-500">{page.user_email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                page.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {page.is_active ? '● Ativa' : '○ Inativa'}
                                            </span>
                                        </td>

                                        {/* Data */}
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {new Date(page.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>

                                        {/* Ações */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Botão Editar */}
                                                <button
                                                    onClick={() => router.push(`/${page.subdomain}/edit-page`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar página&ldquo;
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                {/* Botão Remover */}
                                                <button
                                                    onClick={() => handleDelete(page.subdomain, page.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title=&rdquo;Remover página"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

