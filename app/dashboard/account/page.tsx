'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAdminEmail } from '@/lib/auth-config';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  provider?: string;
  last_sign_in?: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
    
    // Verificar se vem do link de recuperação de senha
    const reset = searchParams.get('reset');
    if (reset === 'true') {
      setIsPasswordReset(true);
      setSuccessMessage('Defina sua nova senha abaixo.');
    }
  }, [searchParams]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Erro ao carregar sessão:', sessionError);
        router.push('/login');
        return;
      }

      const user = session.user;
      
      // Verificar se é admin
      const userIsAdmin = isAdminEmail(user.email);
      setIsAdmin(userIsAdmin);

      // Extrair informações do usuário
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        created_at: user.created_at,
        provider: user.app_metadata?.provider || 'email',
        last_sign_in: user.last_sign_in_at || '',
      };

      setProfile(userProfile);
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email,
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
    } catch {
console.error('Erro ao carregar perfil:', error);
      alert('Erro ao carregar perfil. Por favor, tente novamente.');
    


} finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação de senha apenas se estiver alterando
    if (formData.new_password || formData.current_password || formData.confirm_password) {
      // Senha atual só é obrigatória se NÃO for reset de senha
      if (!isPasswordReset && !formData.current_password) {
        newErrors.current_password = 'Senha atual é obrigatória';
      }

      if (!formData.new_password) {
        newErrors.new_password = 'Nova senha é obrigatória';
      } else if (formData.new_password.length < 6) {
        newErrors.new_password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSuccessMessage('');
    
    try {
      // Atualizar metadados do perfil
      if (formData.full_name !== profile?.full_name) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: formData.full_name }
        });

        if (updateError) {
          throw updateError;
        }
      }

      // Se houver alteração de senha
      if (formData.new_password) {
        // Se NÃO for reset de senha, verificar senha atual
        if (!isPasswordReset && formData.current_password) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.current_password,
          });

          if (signInError) {
            setErrors({ current_password: 'Senha atual incorreta' });
            setSaving(false);
            return;
          }
        }

        // Atualizar para a nova senha
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.new_password
        });

        if (passwordError) {
          throw passwordError;
        }

        setSuccessMessage('Senha atualizada com sucesso!');
        setIsPasswordReset(false);
        
        // Remover parâmetro reset da URL
        router.push('/dashboard/account');
      } else {
        setSuccessMessage('Perfil atualizado com sucesso!');
      }

      // Recarregar perfil
      await loadProfile();
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));

      // Limpar mensagem após 5 segundos
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch {
console.error('Erro ao salvar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(errorMessage);
    


} finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Configurações da Conta
            </h2>
            {isAdmin && (
              <span className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3 mr-1" />
                Administrador
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>
      </div>

      {/* Mensagem de Sucesso */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Perfil</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.full_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Seu nome completo"
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm"
                    placeholder="seu@email.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  O email não pode ser alterado. Este é o email usado para login.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Membro desde
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Método de Login
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {profile?.provider === 'google' ? '🔍 Google' : '📧 Email/Senha'}
                  </p>
                </div>
              </div>

              {profile?.last_sign_in && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Último Login
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(profile.last_sign_in).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isPasswordReset ? 'Redefinir Senha' : 'Alterar Senha'}
            </h3>
            
            {isPasswordReset && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔐 Você está redefinindo sua senha. Digite sua nova senha abaixo e clique em salvar.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              {!isPasswordReset && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Senha Atual
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.current_password}
                      onChange={(e) => handleInputChange('current_password', e.target.value)}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.current_password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.current_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={(e) => handleInputChange('new_password', e.target.value)}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.new_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving || (!isPasswordReset && !formData.current_password && !formData.new_password) || (isPasswordReset && !formData.new_password)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isPasswordReset ? 'Salvar Nova Senha' : 'Alterar Senha'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações da Conta</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Exportar Dados</h4>
                <p className="text-sm text-gray-500">
                  Baixe uma cópia dos seus dados em formato JSON
                </p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Exportar
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="text-sm font-medium text-red-900">Deletar Conta</h4>
                <p className="text-sm text-red-600">
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                </p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Deletar Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
