'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        // Verificar se já está logado
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            }
        };
        checkSession();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (isSignUp) {
                // Cadastro - Tentar criar nova conta
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    }
                });

                if (error) {
                    // Verificar se é erro de email já cadastrado
                    if (error.message.includes('already registered') || 
                        error.message.includes('already exists') ||
                        error.message.includes('User already registered') ||
                        error.message.toLowerCase().includes('duplicate')) {
                        setError('Este email já está cadastrado. Use a opção &ldquo;Fazer login&rdquo; abaixo.');
                    } else {
                        setError(error.message);
                    }
                } else if (data?.user) {
                    // Verificar se o usuário foi criado ou se já existia
                    // Se identities estiver vazio, o email já estava cadastrado
                    if (data.user.identities && data.user.identities.length === 0) {
                        setError('Este email já está cadastrado. Use a opção &ldquo;Fazer login&rdquo; abaixo.');
                    } else {
                        // Sucesso no cadastro
                        setSuccessMessage('Conta criada com sucesso! Verifique seu email para confirmar e ativar sua conta.');
                        setEmail('');
                        setPassword('');
                        // Voltar para modo de login após 5 segundos
                        setTimeout(() => {
                            setIsSignUp(false);
                            setSuccessMessage('');
                        }, 5000);
                    }
                }
            } else {
                // Login
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    // Mensagens de erro mais amigáveis
                    if (error.message.includes('Invalid login credentials')) {
                        setError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
                    } else if (error.message.includes('Email not confirmed')) {
                        setError('Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.');
                    } else {
                        setError(error.message);
                    }
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (error) {
                setError(error.message);
            }
        } catch (error) {
            setError('Erro ao fazer login com Google');
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/dashboard/account?reset=true`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
                setEmail('');
                // Voltar para tela de login após 5 segundos
                setTimeout(() => {
                    setIsForgotPassword(false);
                    setSuccessMessage('');
                }, 5000);
            }
        } catch (error) {
            setError('Erro ao enviar email de recuperação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-4">
                    <Image 
                        src=&ldquo;/zag-site.png&rdquo; 
                        alt="Zag&ldquo; 
                        width={200} 
                        height={60} 
                        className=&rdquo;mx-auto"
                    />
                </div>

                {/* Formulário */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        {isForgotPassword ? 'Recuperar Senha' : isSignUp ? 'Criar Conta' : 'Fazer Login'}
                    </h2>

                    {/* Mensagem de Sucesso */}
                    {successMessage && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-800 text-sm font-medium mb-1">Sucesso! ✅</p>
                                    <p className="text-yellow-700 text-sm">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {isForgotPassword ? (
                        /* Formulário de Recuperação de Senha */
                        <>
                            <p className="text-sm text-gray-600 mb-4 text-center">
                                Digite seu email para receber as instruções de recuperação de senha.
                            </p>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type=&ldquo;email&rdquo;
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="seu@email.com&ldquo;
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type=&ldquo;submit&rdquo;
                                    disabled={loading}
                                    className=&rdquo;w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Enviando...
                                        </div>
                                    ) : (
                                        'Enviar Email de Recuperação'
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setError('');
                                        setSuccessMessage('');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Voltar para o login
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Formulário de Login/Cadastro */
                        <>
                            {/* Login com Google - PRIMEIRO */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors mb-4"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24&ldquo;>
                                    <path fill=&ldquo;#4285F4&rdquo; d=&rdquo;M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill=&ldquo;#34A853&rdquo; d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z&ldquo;/>
                                    <path fill=&ldquo;#FBBC05&rdquo; d=&rdquo;M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill=&ldquo;#EA4335&rdquo; d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z&ldquo;/>
                                </svg>
                                Continuar com Google
                            </button>

                            {/* Divisor */}
                            <div className="mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">ou</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type=&ldquo;email&rdquo;
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder=&rdquo;seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Senha */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Senha
                                        </label>
                                        {!isSignUp && (
                                            <button
                                                type=&ldquo;button&rdquo;
                                                onClick={() => {
                                                    setIsForgotPassword(true);
                                                    setError('');
                                                    setSuccessMessage('');
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Esqueceu a senha?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Sua senha&ldquo;
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type=&ldquo;button&rdquo;
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Botão de Login/Cadastro */}
                                <button
                                    type=&ldquo;submit&rdquo;
                                    disabled={loading}
                                    className=&rdquo;w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {isSignUp ? 'Criando conta...' : 'Entrando...'}
                                        </div>
                                    ) : (
                                        isSignUp ? 'Criar Conta' : 'Entrar'
                                    )}
                                </button>
                            </form>

                            {/* Toggle Login/Cadastro */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setError('');
                                        setSuccessMessage('');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    {isSignUp 
                                        ? 'Já tem uma conta? Faça login' 
                                        : 'Não tem uma conta? Criar conta'
                                    }
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
