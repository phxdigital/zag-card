'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Eye, Calendar, User, FileText, AlertCircle, CheckCircle, Trash2, FileStack, Loader } from 'lucide-react';

interface Notification {
    id: string;
    subdomain: string;
    action: string;
    message: string;
    created_at: string;
    pdf_data?: string;
    status: 'pending' | 'approved' | 'rejected';
}

export default function AdminPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [merging, setMerging] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await fetch('/api/admin/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateNotificationStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch(`/api/admin/notifications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === id ? { ...notif, status } : notif
                    )
                );
            }
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    };

    const deleteNotification = async (id: string, subdomain: string) => {
        if (!confirm(`Tem certeza que deseja excluir a notificação de "${subdomain}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/notifications/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(notif => notif.id !== id));
                setSelectedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                alert('Notificação excluída com sucesso!');
            } else {
                alert('Erro ao excluir notificação');
            }
        } catch (err) {
            console.error('Erro ao excluir notificação:', err);
            alert('Erro ao excluir notificação');
        }
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) {
            alert('Nenhuma notificação selecionada');
            return;
        }

        if (!confirm(`Tem certeza que deseja excluir ${selectedIds.size} notificação(ões) selecionada(s)?`)) {
            return;
        }

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const id of Array.from(selectedIds)) {
            try {
                const response = await fetch(`/api/admin/notifications/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.error('Erro ao excluir notificação:', err);
                errorCount++;
            }
        }

        // Atualizar lista
        setNotifications(prev => prev.filter(notif => !selectedIds.has(notif.id)));
        setSelectedIds(new Set());
        setLoading(false);

        if (errorCount > 0) {
            alert(`${successCount} excluída(s) com sucesso.\n${errorCount} erro(s).`);
        } else {
            alert(`${successCount} notificação(ões) excluída(s) com sucesso!`);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedNotifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedNotifications.map(n => n.id)));
        }
    };

    const mergePDFs = async () => {
        if (selectedIds.size === 0) {
            alert('Selecione os cartões para gerar o PDF A4');
            return;
        }

        if (selectedIds.size !== 5) {
            alert('Selecione exatamente 5 cartões (5 frentes + 5 versos = 1 página A4)');
            return;
        }

        setMerging(true);
        try {
            const response = await fetch('/api/admin/merge-pdfs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    notificationIds: Array.from(selectedIds) 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                console.error('Erro da API:', errorData);
                throw new Error(errorData.error || 'Erro ao mesclar PDFs');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `impressao-cartoes-A4-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert(`PDF A4 gerado com 5 frentes + 5 versos!\nPronto para enviar à gráfica.`);
            setSelectedIds(new Set());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao mesclar PDFs';
            console.error('Erro ao mesclar PDFs:', err);
            alert(`Erro: ${errorMessage}`);
        } finally {
            setMerging(false);
        }
    };

    const downloadPDF = async (notification: Notification) => {
        try {
            // Buscar PDF da API
            const response = await fetch(`/api/admin/notifications/${notification.id}/pdf`);
            if (!response.ok) {
                throw new Error('PDF não encontrado');
            }
            
            const data = await response.json();
            if (data.pdf_data) {
                // Criar link de download
                const link = document.createElement('a');
                link.href = data.pdf_data;
                link.download = `cartao-${notification.subdomain}-${new Date(notification.created_at).toISOString().split('T')[0]}.pdf`;
                link.target = '_blank';
                
                // Adicionar ao DOM temporariamente
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('PDF baixado com sucesso:', notification.subdomain);
            } else {
                alert('PDF não disponível para esta notificação.');
            }
            } catch (err) {
                console.error('Erro ao baixar PDF:', err);
                alert('Erro ao baixar PDF. Tente novamente.');
            }
    };

    // Filtrar por status e busca
    const filteredNotifications = notifications
        .filter(notif => notif.status === filter)
        .filter(notif => 
            searchTerm === '' || 
            notif.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notif.message.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Mais antigas primeiro

    // Paginação
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    // Resetar para página 1 quando filtro ou busca mudar
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">{/* Container principal sem min-h-screen pois está no layout */}

            {/* Barra de Pesquisa e Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    {/* Barra de Pesquisa */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="🔍 Buscar por nome ou mensagem..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtros de Status */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pendentes ({notifications.filter(n => n.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'approved' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Aprovadas ({notifications.filter(n => n.status === 'approved').length})
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'rejected' 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Rejeitadas ({notifications.filter(n => n.status === 'rejected').length})
                        </button>
                    </div>
                </div>

                {/* Botões de Ação Rápida do Admin */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
                            <p className="text-sm text-gray-600">Ferramentas administrativas disponíveis</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard/analytics/homepage"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Homepage Analytics
                            </Link>
                            <Link
                                href="/admin/pages"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Gerenciar Páginas
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Barra de Ferramentas: Seleção e Mesclar PDFs */}
                {filteredNotifications.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                        <div className="flex items-center justify-between">
                            {/* Esquerda: Info de paginação e seleção */}
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-gray-600">
                                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredNotifications.length)} de {filteredNotifications.length}
                                </span>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={paginatedNotifications.length > 0 && selectedIds.size === paginatedNotifications.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span>Selecionar todos ({selectedIds.size})</span>
                                </label>
                            </div>

                            {/* Direita: Botões de Ação */}
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-3">
                                    {/* Botão Gerar PDF A4 */}
                                    <button
                                        onClick={mergePDFs}
                                        disabled={merging || selectedIds.size !== 5}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={selectedIds.size !== 5 ? 'Selecione exatamente 5 cartões' : 'Gerar PDF A4 para impressão'}
                                    >
                                        {merging ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Mesclando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileStack className="w-4 h-4" />
                                                <span className={selectedIds.size === 5 ? 'text-white' : 'text-white opacity-80'}>
                                                    {selectedIds.size === 5 ? '✓ Gerar PDF A4 (5 cartões)' : `Selecione 5 (${selectedIds.size}/5)`}
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    {/* Botão Excluir Selecionadas */}
                                    <button
                                        onClick={deleteSelected}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={`Excluir ${selectedIds.size} selecionada(s)`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Excluindo...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Excluir {selectedIds.size}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Lista de Notificações */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhuma notificação encontrada
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm 
                                    ? `Nenhum resultado para "${searchTerm}".`
                                    : `Não há notificações com status "${filter}".`
                                }
                            </p>
                        </div>
                    ) : (
                        paginatedNotifications.map((notification) => (
                            <div key={notification.id} className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox de Seleção */}
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(notification.id)}
                                            onChange={() => toggleSelection(notification.id)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            title="Selecionar para mesclar"
                                        />
                                    </div>

                                    <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            {getStatusIcon(notification.status)}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {notification.subdomain}.zagnfc.com.br
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(notification.created_at).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                                {notification.status === 'pending' ? 'Pendente' : 
                                                 notification.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-700 mb-4">{notification.message}</p>
                                        
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <User className="w-4 h-4" />
                                                <span>{notification.subdomain}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(notification.created_at).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <FileText className="w-4 h-4" />
                                                <span>PDF disponível</span>
                                                </div>
                                        </div>
                                    </div>
                                    
                                    <div className="ml-4 space-y-3">
                                        {/* Linha 1: Visualizar e Baixar | Aprovar e Rejeitar */}
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Grupo Esquerdo: PDF */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch(`/api/admin/notifications/${notification.id}/pdf`);
                                                            const data = await response.json();
                                                            if (data.pdf_data) {
                                                            const newWindow = window.open('', '_blank');
                                                                if (newWindow) {
                                                                newWindow.document.write(`
                                                                    <html>
                                                                        <head>
                                                                            <title>PDF - ${notification.subdomain}</title>
                                                                            <style>
                                                                                body { margin: 0; padding: 20px; background: #f5f5f5; }
                                                                                iframe { width: 100%; height: 90vh; border: none; }
                                                                            </style>
                                                                        </head>
                                                                        <body>
                                                                                <iframe src="${data.pdf_data}" type="application/pdf"></iframe>
                                                                        </body>
                                                                    </html>
                                                                `);
                                                                newWindow.document.close();
                                                                }
                                                            } else {
                                                                alert('PDF não disponível');
                                                            }
                                                        } catch (err) {
                                                            console.error('Erro ao visualizar PDF:', err);
                                                            alert('Erro ao visualizar PDF');
                                                        }
                                                    }}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                                                    title="Visualizar PDF"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Visualizar</span>
                                                </button>
                                                <button
                                                    onClick={() => downloadPDF(notification)}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                    title="Baixar PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Baixar</span>
                                                </button>
                                            </div>
                                        
                                            {/* Grupo Direito: Aprovar/Rejeitar (apenas pendentes) */}
                                        {notification.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateNotificationStatus(notification.id, 'approved')}
                                                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Aprovar</span>
                                                </button>
                                                <button
                                                    onClick={() => updateNotificationStatus(notification.id, 'rejected')}
                                                        className="flex items-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Rejeitar</span>
                                                </button>
                                            </div>
                                        )}
                                        </div>

                                        {/* Linha 2: Excluir (canto direito) */}
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => deleteNotification(notification.id, notification.subdomain)}
                                                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                                                title="Excluir notificação"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Excluir</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Controles de Paginação */}
                {filteredNotifications.length > itemsPerPage && (
                    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                        <div className="flex items-center justify-between">
                            {/* Botão Anterior */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                ← Anterior
                            </button>

                            {/* Números de Página */}
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                    // Mostrar apenas algumas páginas (primeira, última, atual e adjacentes)
                                    const showPage = 
                                        page === 1 || 
                                        page === totalPages || 
                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                    
                                    const showEllipsis = 
                                        (page === currentPage - 2 && currentPage > 3) ||
                                        (page === currentPage + 2 && currentPage < totalPages - 2);

                                    if (showEllipsis) {
                                        return <span key={page} className="text-gray-400">...</span>;
                                    }

                                    if (!showPage) return null;

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Botão Próximo */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Próximo →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
