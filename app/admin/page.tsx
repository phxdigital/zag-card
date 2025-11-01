'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Eye, Calendar, User, FileText, AlertCircle, CheckCircle, Trash2, FileStack, Loader, Package, Truck, MapPin } from 'lucide-react';

interface Notification {
    id: string;
    subdomain: string;
    action: string;
    message: string;
    created_at: string;
    pdf_data?: string;
    status: 'pending' | 'approved' | 'rejected';
    production_status?: string | null;
    page_id?: string | null;
}

export default function AdminPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [merging, setMerging] = useState(false);
    const itemsPerPage = 10;
    
    // Estados para controle de envio
    interface ShippingAddress {
      name: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      postal_code: string;
      phone: string;
    }
    
    interface ShippingData {
      tracking_code?: string;
      shipment?: {
        melhor_envio_id?: number;
      };
      shipping?: {
        label_url?: string;
      };
      address?: ShippingAddress;
    }
    
    interface ShippingOptionData {
      id: number;
      name: string;
      company: { name: string };
      price: number;
      delivery_time?: number;
      delivery_range?: { min: number; max: number };
    }
    
    const [shippingData, setShippingData] = useState<Record<string, ShippingData>>({});
    const [shippingOptions, setShippingOptions] = useState<Record<string, ShippingOptionData[]>>({});
    const [loadingShipping, setLoadingShipping] = useState<Record<string, boolean>>({});
    const [showShippingModal, setShowShippingModal] = useState<string | null>(null);

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
                // Recarregar notificações para pegar o production_status atualizado
                await loadNotifications();
            }
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
        }
    };

    const markAsReady = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/notifications/${id}/ready`, {
                method: 'PATCH',
            });

            if (response.ok) {
                const data = await response.json();
                alert('Pedido marcado como pronto para envio!');
                // Recarregar notificações para pegar o production_status atualizado
                await loadNotifications();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                alert(errorData.error || 'Erro ao marcar pedido como pronto');
            }
        } catch (err) {
            console.error('Erro ao marcar como pronto:', err);
            alert('Erro ao marcar pedido como pronto');
        }
    };

    const loadShippingInfo = async (notificationId: string) => {
        setLoadingShipping(prev => ({ ...prev, [notificationId]: true }));
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/shipping`);
            if (response.ok) {
                const data = await response.json();
                setShippingData(prev => ({ ...prev, [notificationId]: data }));
                return data;
            }
        } catch (err) {
            console.error('Erro ao carregar informações de envio:', err);
        } finally {
            setLoadingShipping(prev => ({ ...prev, [notificationId]: false }));
        }
        return null;
    };

    const loadShippingOptions = async (notificationId: string) => {
        setLoadingShipping(prev => ({ ...prev, [notificationId]: true }));
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/shipping-options`);
            if (response.ok) {
                const data = await response.json();
                setShippingOptions(prev => ({ ...prev, [notificationId]: data.options || [] }));
                setShowShippingModal(notificationId);
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                alert(errorData.error || 'Erro ao buscar opções de frete');
            }
        } catch (err) {
            console.error('Erro ao buscar opções de frete:', err);
            alert('Erro ao buscar opções de frete');
        } finally {
            setLoadingShipping(prev => ({ ...prev, [notificationId]: false }));
        }
    };

    const createShipment = async (notificationId: string, serviceId: number) => {
        setLoadingShipping(prev => ({ ...prev, [notificationId]: true }));
        try {
            const response = await fetch(`/api/admin/notifications/${notificationId}/create-shipment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ serviceId }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Envio criado com sucesso! Código de rastreamento: ${data.shipment.tracking}`);
                setShowShippingModal(null);
                // Recarregar informações
                await loadShippingInfo(notificationId);
                await loadNotifications();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                alert(errorData.error || 'Erro ao criar envio');
            }
        } catch (err) {
            console.error('Erro ao criar envio:', err);
            alert('Erro ao criar envio');
        } finally {
            setLoadingShipping(prev => ({ ...prev, [notificationId]: false }));
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
        .filter(notif => {
            if (filter === 'all') return true;
            if (filter === 'pending' || filter === 'approved' || filter === 'rejected') {
                return notif.status === filter;
            }
            // Filtros por status de produção
            return notif.production_status === filter;
        })
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

    const getProductionStatusText = (productionStatus: string | null | undefined) => {
        if (!productionStatus) return null;
        switch (productionStatus) {
            case 'pending':
                return 'Aguardando aprovação';
            case 'approved':
                return 'Aprovado';
            case 'in_production':
                return 'Em produção';
            case 'ready_to_ship':
                return 'Aguardando envio';
            case 'shipped':
                return 'Enviado';
            case 'delivered':
                return 'Entregue';
            case 'cancelled':
                return 'Cancelado';
            default:
                return productionStatus;
        }
    };

    const getProductionStatusColor = (productionStatus: string | null | undefined) => {
        if (!productionStatus) return 'bg-gray-100 text-gray-800';
        switch (productionStatus) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'in_production':
                return 'bg-purple-100 text-purple-800';
            case 'ready_to_ship':
                return 'bg-cyan-100 text-cyan-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
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
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Filtros por Aprovação:</div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'all' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Todos ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'pending' 
                                        ? 'bg-yellow-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Pendentes ({notifications.filter(n => n.status === 'pending').length})
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'approved' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Aprovadas ({notifications.filter(n => n.status === 'approved').length})
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'rejected' 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Rejeitadas ({notifications.filter(n => n.status === 'rejected').length})
                            </button>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-700 mb-2 mt-4">Filtros por Produção/Entrega:</div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('in_production')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'in_production' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Em Produção ({notifications.filter(n => n.production_status === 'in_production').length})
                            </button>
                            <button
                                onClick={() => setFilter('ready_to_ship')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'ready_to_ship' 
                                        ? 'bg-cyan-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Pronto para Envio ({notifications.filter(n => n.production_status === 'ready_to_ship').length})
                            </button>
                            <button
                                onClick={() => setFilter('shipped')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'shipped' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Enviados ({notifications.filter(n => n.production_status === 'shipped').length})
                            </button>
                            <button
                                onClick={() => setFilter('delivered')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === 'delivered' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Entregues ({notifications.filter(n => n.production_status === 'delivered').length})
                            </button>
                        </div>
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
                                            {notification.production_status && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProductionStatusColor(notification.production_status)}`}>
                                                    {getProductionStatusText(notification.production_status)}
                                                </span>
                                            )}
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
                                        
                                            {/* Grupo Direito: Ações de status */}
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
                                        {notification.status === 'approved' && notification.production_status === 'in_production' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => markAsReady(notification.id)}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    <span>Marcar como Pronto</span>
                                                </button>
                                            </div>
                                        )}
                                        {notification.status === 'approved' && notification.production_status === 'ready_to_ship' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async () => {
                                                        // Verificar se já tem envio criado
                                                        const data = await loadShippingInfo(notification.id);
                                                        
                                                        if (data?.tracking_code) {
                                                            // Verificar se é um código mock temporário (começa com "ME" e não tem melhor_envio_id configurado)
                                                            const isMockCode = data.tracking_code.startsWith('ME') && 
                                                                               data.tracking_code.length > 10 && 
                                                                               !data.shipment?.melhor_envio_id;
                                                            
                                                            if (isMockCode) {
                                                                // Código mock - criar envio real diretamente
                                                                loadShippingOptions(notification.id);
                                                            } else if (data.shipment?.melhor_envio_id) {
                                                                // Já tem envio real criado - mostrar mensagem informativa
                                                                alert(`Pedido já possui envio criado no Melhor Envio!\n\nCódigo de rastreamento: ${data.tracking_code}\n\nClique em "Ver Endereço" para:\n- Ver detalhes do envio\n- Baixar etiqueta\n- Solicitar coleta`);
                                                            } else {
                                                                // Tem código mas sem envio no Melhor Envio - permitir criar
                                                                const choice = confirm(
                                                                    `Pedido possui código de rastreamento: ${data.tracking_code}\n\n` +
                                                                    `Este código não está vinculado a um envio no Melhor Envio.\n\n` +
                                                                    `Deseja criar um novo envio no Melhor Envio?`
                                                                );
                                                                
                                                                if (choice) {
                                                                    loadShippingOptions(notification.id);
                                                                }
                                                            }
                                                        } else {
                                                            // Não tem envio - criar novo
                                                            loadShippingOptions(notification.id);
                                                        }
                                                    }}
                                                    disabled={loadingShipping[notification.id]}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                                                >
                                                    {loadingShipping[notification.id] ? (
                                                        <>
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                            <span>Carregando...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Truck className="w-4 h-4" />
                                                            <span>Criar Envio</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        {notification.status === 'approved' && (notification.production_status === 'shipped' || notification.production_status === 'ready_to_ship') && (
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <button
                                                    onClick={() => loadShippingInfo(notification.id)}
                                                    className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                                >
                                                    <MapPin className="w-4 h-4" />
                                                    <span>Ver Endereço</span>
                                                </button>
                                                {notification.production_status === 'shipped' && shippingData[notification.id]?.shipment?.melhor_envio_id && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Solicitar coleta para este envio?')) return;
                                                            
                                                            try {
                                                                const response = await fetch('/api/admin/shipments/request-pickup', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        shipmentIds: [shippingData[notification.id]?.shipment?.melhor_envio_id].filter((id): id is number => id !== undefined)
                                                                    })
                                                                });
                                                                
                                                                const data = await response.json();
                                                                
                                                                if (data.success) {
                                                                    alert(data.message || 'Coleta solicitada com sucesso!');
                                                                } else {
                                                                    alert(data.error || 'Erro ao solicitar coleta');
                                                                }
                                                            } catch (err) {
                                                                console.error('Erro ao solicitar coleta:', err);
                                                                alert('Erro ao solicitar coleta. Tente novamente.');
                                                            }
                                                        }}
                                                        className="flex items-center space-x-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
                                                        title="Solicitar coleta do envio"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                        <span>Solicitar Coleta</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        </div>
                                        
                                        {/* Seção de Informações de Envio */}
                                        {(notification.production_status === 'ready_to_ship' || notification.production_status === 'shipped') && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                                {!shippingData[notification.id] && !loadingShipping[notification.id] && (
                                                    <button
                                                        onClick={() => loadShippingInfo(notification.id)}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        Carregar informações de envio
                                                    </button>
                                                )}
                                                {loadingShipping[notification.id] && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                        <span>Carregando informações de envio...</span>
                                                    </div>
                                                )}
                                                {shippingData[notification.id] && (
                                                    <div className="space-y-2">
                                                        {shippingData[notification.id]?.address && (
                                                            <div className="text-sm">
                                                                <p className="font-semibold text-gray-700 mb-1">Endereço de Entrega:</p>
                                                                <p className="text-gray-600">
                                                                    {shippingData[notification.id]?.address?.name}<br />
                                                                    {shippingData[notification.id]?.address?.street}, {shippingData[notification.id]?.address?.number}
                                                                    {shippingData[notification.id]?.address?.complement && ` - ${shippingData[notification.id].address.complement}`}
                                                                    <br />
                                                                    {shippingData[notification.id]?.address?.neighborhood}, {shippingData[notification.id]?.address?.city} - {shippingData[notification.id]?.address?.state}
                                                                    <br />
                                                                    CEP: {shippingData[notification.id]?.address?.postal_code}
                                                                    <br />
                                                                    Telefone: {shippingData[notification.id]?.address?.phone}
                                                                </p>
                                                            </div>
                                                        )}
                                                                {shippingData[notification.id].tracking_code && (
                                                            <div className="text-sm mb-3">
                                                                <p className="font-semibold text-gray-700 mb-1">Código de Rastreamento:</p>
                                                                <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">{shippingData[notification.id].tracking_code}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Botões de Ação para Envios */}
                                                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                            {shippingData[notification.id].shipping?.label_url && (
                                                                <a
                                                                    href={shippingData[notification.id].shipping.label_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    Baixar Etiqueta
                                                                </a>
                                                            )}
                                                            
                                                            {/* Gerar Etiqueta - se tiver shipment_id do Melhor Envio */}
                                                            {shippingData[notification.id].shipment?.melhor_envio_id && !shippingData[notification.id].shipping?.label_url && (
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const response = await fetch(`/api/admin/shipments/${shippingData[notification.id].shipment.melhor_envio_id}/label`, {
                                                                                method: 'GET'
                                                                            });
                                                                            
                                                                            if (response.ok) {
                                                                                const blob = await response.blob();
                                                                                const url = window.URL.createObjectURL(blob);
                                                                                const link = document.createElement('a');
                                                                                link.href = url;
                                                                                link.download = `etiqueta-${notification.subdomain}.pdf`;
                                                                                document.body.appendChild(link);
                                                                                link.click();
                                                                                document.body.removeChild(link);
                                                                                window.URL.revokeObjectURL(url);
                                                                                alert('Etiqueta gerada com sucesso!');
                                                                                // Recarregar informações para atualizar label_url
                                                                                await loadShippingInfo(notification.id);
                                                                            } else {
                                                                                const errorData = await response.json().catch(() => ({ error: 'Erro ao gerar etiqueta' }));
                                                                                alert(errorData.error || 'Erro ao gerar etiqueta');
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Erro ao gerar etiqueta:', err);
                                                                            alert('Erro ao gerar etiqueta. Tente novamente.');
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    Gerar Etiqueta
                                                                </button>
                                                            )}
                                                            
                                                            {/* Solicitar Coleta - se tiver shipment_id do Melhor Envio */}
                                                            {shippingData[notification.id].shipment?.melhor_envio_id && notification.production_status === 'shipped' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Solicitar coleta para este envio?')) return;
                                                                        
                                                                        try {
                                                                            const response = await fetch('/api/admin/shipments/request-pickup', {
                                                                                method: 'POST',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({
                                                                                    shipmentIds: [shippingData[notification.id].shipment.melhor_envio_id]
                                                                                })
                                                                            });
                                                                            
                                                                            const data = await response.json();
                                                                            
                                                                            if (data.success) {
                                                                                alert(data.message || 'Coleta solicitada com sucesso!');
                                                                            } else {
                                                                                alert(data.error || 'Erro ao solicitar coleta');
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Erro ao solicitar coleta:', err);
                                                                            alert('Erro ao solicitar coleta. Tente novamente.');
                                                                        }
                                                                    }}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
                                                                    title="Solicitar coleta do envio"
                                                                >
                                                                    <Truck className="w-4 h-4" />
                                                                    Solicitar Coleta
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

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

                {/* Modal de Seleção de Serviço de Frete */}
                {showShippingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Escolher Serviço de Frete</h3>
                                <button
                                    onClick={() => setShowShippingModal(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            {loadingShipping[showShippingModal] ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-600">Carregando opções de frete...</span>
                                </div>
                            ) : shippingOptions[showShippingModal] && shippingOptions[showShippingModal].length > 0 ? (
                                <div className="space-y-3">
                                    {shippingOptions[showShippingModal].map((option) => (
                                        <div
                                            key={option.id}
                                            className="border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => createShipment(showShippingModal, option.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{option.name}</p>
                                                    <p className="text-sm text-gray-600">{option.company}</p>
                                                    {option.delivery_range && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Entrega: {option.delivery_range.min} a {option.delivery_range.max} dias úteis
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="font-bold text-lg text-blue-600">
                                                        R$ {option.price.toFixed(2).replace('.', ',')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Nenhuma opção de frete disponível</p>
                                </div>
                            )}
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowShippingModal(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
