'use client';

import React, { useState, useEffect } from 'react';
import { Download, Eye, Calendar, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

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
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
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
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const downloadPDF = (notification: Notification) => {
        if (notification.pdf_data) {
            try {
                // Criar link de download
                const link = document.createElement('a');
                link.href = notification.pdf_data;
                link.download = `cartao-${notification.subdomain}-${new Date(notification.created_at).toISOString().split('T')[0]}.pdf`;
                link.target = '_blank';
                
                // Adicionar ao DOM temporariamente
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('PDF baixado com sucesso:', notification.subdomain);
            } catch (error) {
                console.error('Erro ao baixar PDF:', error);
                alert('Erro ao baixar PDF. Tente novamente.');
            }
        } else {
            alert('PDF não disponível para esta notificação.');
        }
    };

    const filteredNotifications = notifications.filter(notif => 
        filter === 'all' || notif.status === filter
    );

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Image 
                                src="/logo-zag.png" 
                                alt="Zag NFC" 
                                width={40} 
                                height={40} 
                                className="h-10 w-auto"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                                <p className="text-sm text-gray-500">Gerencie notificações e layouts de cartões</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                {notifications.length} notificação(ões)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === 'all' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todas ({notifications.length})
                        </button>
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

                {/* Lista de Notificações */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhuma notificação encontrada
                            </h3>
                            <p className="text-gray-500">
                                {filter === 'all' 
                                    ? 'Não há notificações no sistema.'
                                    : `Não há notificações com status "${filter}".`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div key={notification.id} className="bg-white rounded-lg shadow-sm border p-6">
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
                                            {notification.pdf_data && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <FileText className="w-4 h-4" />
                                                    <span>PDF disponível ({(notification.pdf_data.length / 1024).toFixed(1)} KB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 ml-4">
                                        {notification.pdf_data && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        try {
                                                            // Criar uma nova janela com o PDF
                                                            const newWindow = window.open('', '_blank');
                                                            if (newWindow && notification.pdf_data) {
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
                                                                            <iframe src="${notification.pdf_data}" type="application/pdf"></iframe>
                                                                        </body>
                                                                    </html>
                                                                `);
                                                                newWindow.document.close();
                                                            }
                                                        } catch (error) {
                                                            console.error('Erro ao abrir PDF:', error);
                                                            alert('Erro ao visualizar PDF. Tente baixar o arquivo.');
                                                        }
                                                    }}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                                    title="Visualizar PDF"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span>Visualizar</span>
                                                </button>
                                                <button
                                                    onClick={() => downloadPDF(notification)}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    title="Baixar PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Baixar</span>
                                                </button>
                                            </>
                                        )}
                                        
                                        {notification.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => updateNotificationStatus(notification.id, 'approved')}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Aprovar</span>
                                                </button>
                                                <button
                                                    onClick={() => updateNotificationStatus(notification.id, 'rejected')}
                                                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>Rejeitar</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
