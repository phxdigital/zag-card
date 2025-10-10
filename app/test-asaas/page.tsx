'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';

interface TestResult {
    success: boolean;
    error?: string;
    data?: unknown;
    message?: string;
    environment?: string;
    checks?: Record<string, unknown>;
    account?: {
        name: string;
        email: string;
        apiVersion: string;
    };
    info?: {
        totalCustomers: number;
        apiUrl: string;
        webhookConfigured: boolean;
        directLinksConfigured: boolean;
    };
}

export default function TestAsaasPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');

    const runTest = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/test-asaas?env=${environment}`);
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔧 Teste de Integração Asaas
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Verifique se a integração com o Asaas está configurada corretamente
                    </p>

                    {/* Seletor de Ambiente */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Ambiente de Teste:
                        </label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setEnvironment('sandbox')}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                                    environment === 'sandbox'
                                        ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-900'
                                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                🧪 Sandbox (Teste)
                            </button>
                            <button
                                onClick={() => setEnvironment('production')}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                                    environment === 'production'
                                        ? 'bg-green-100 border-2 border-green-500 text-green-900'
                                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                🚀 Produção
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {environment === 'sandbox' 
                                ? '⚠️ Modo teste - Troque ASAAS_API_KEY pela chave do sandbox'
                                : '⚠️ Modo produção - Use ASAAS_API_KEY de produção (Pagamentos reais!)'
                            }
                        </p>
                    </div>

                    <button
                        onClick={runTest}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                Testando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Executar Teste
                            </>
                        )}
                    </button>

                    {result && (
                        <div className="space-y-6">
                            {/* Ambiente */}
                            {result.environment && (
                                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <div className="flex items-center justify-center">
                                        <span className="text-lg font-bold text-blue-900">
                                            {result.environment}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Status Geral */}
                            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                <div className="flex items-center">
                                    {result.success ? (
                                        <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600 mr-3" />
                                    )}
                                    <div>
                                        <h3 className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                            {result.success ? '✅ Integração Funcionando!' : '❌ Erro na Integração'}
                                        </h3>
                                        {result.message && (
                                            <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                                {result.message}
                                            </p>
                                        )}
                                        {result.error && (
                                            <p className="text-sm text-red-700 mt-1">
                                                {result.error}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Variáveis de Ambiente */}
                            {result.checks && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">📋 Variáveis de Ambiente</h3>
                                    <div className="space-y-2">
                                        {Object.entries(result.checks).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 font-mono">{key}</span>
                                                {value ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Informações da Conta */}
                            {result.account && (
                                <div className="bg-blue-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">👤 Conta Asaas</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">Nome:</span>
                                            <span className="text-sm font-medium text-gray-900">{result.account.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">Email:</span>
                                            <span className="text-sm font-medium text-gray-900">{result.account.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">API Version:</span>
                                            <span className="text-sm font-medium text-gray-900">{result.account.apiVersion}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Informações Adicionais */}
                            {result.info && (
                                <div className="bg-purple-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">ℹ️ Informações</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">Total de Clientes:</span>
                                            <span className="text-sm font-medium text-gray-900">{result.info.totalCustomers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">API URL:</span>
                                            <span className="text-sm font-medium text-gray-900">{result.info.apiUrl}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">Webhook Configurado:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {result.info.webhookConfigured ? '✅ Sim' : '❌ Não'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-700">Links Diretos:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {result.info.directLinksConfigured ? '✅ Configurados' : '❌ Faltando'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* JSON Completo (Debug) */}
                            <details className="bg-gray-100 rounded-lg p-4">
                                <summary className="font-semibold text-gray-900 cursor-pointer">
                                    🔍 Resposta Completa (Debug)
                                </summary>
                                <pre className="mt-4 text-xs overflow-auto p-4 bg-gray-900 text-green-400 rounded">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

