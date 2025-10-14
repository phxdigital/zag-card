'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Simple wrapper to gate access before rendering the existing builder (dashboard)
export default function CreatePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [credits, setCredits] = useState(0);
  const [usedPages, setUsedPages] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Verificar perfil do usuário para obter créditos disponíveis
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan, max_pages')
          .eq('id', user.id)
          .single();

        // Se o usuário tem assinatura ativa, usar max_pages do perfil
        // Caso contrário, calcular baseado nos pagamentos confirmados
        let totalCredits = 0;
        
        if (profile?.subscription_status === 'active' && profile?.max_pages) {
          totalCredits = profile.max_pages;
        } else {
          // Fallback: calcular baseado nos pagamentos confirmados
          const { data: payments } = await supabase
            .from('payments')
            .select('status, plan_type')
            .eq('user_id', user.id);

          const confirmed = (payments || []).filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED');
          const planCredits = { para_mim: 1, para_equipe: 2, para_negocio: 8 } as Record<string, number>;
          totalCredits = confirmed.reduce((sum, p) => sum + (planCredits[p.plan_type] || 0), 0);
        }

        // Count pages already created by this user
        const { data: pagesData } = await supabase
          .from('pages')
          .select('id')
          .eq('user_id', user.id);

        const used = (pagesData || []).length;

        setCredits(totalCredits);
        setUsedPages(used);
        setAllowed(totalCredits > used);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, supabase]);

  // If allowed, reuse the existing builder route
  useEffect(() => {
    if (!loading && allowed) {
      router.replace('/dashboard');
    }
  }, [allowed, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow border p-8 text-center relative">
        <div className="flex justify-center mb-4">
          <img src="/zag-site.png" alt="Zag" className="h-8 object-contain" />
        </div>
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Lock className="text-gray-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Aguardando confirmação do pagamento</h1>
        <p className="text-gray-600 mb-6">Assim que o pagamento for confirmado pelo Asaas, você poderá criar sua página NFC.</p>

        <div className="bg-gray-50 border rounded-lg p-4 text-left mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Créditos disponíveis</span>
            <span className="font-semibold text-gray-900">{credits - usedPages}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Total de créditos</span>
            <span className="text-gray-900">{credits}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Páginas criadas</span>
            <span className="text-gray-900">{usedPages}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/payments')}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Ver pagamentos
        </button>

        <button
          onClick={() => router.push('/#pricing')}
          className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          Comprar
        </button>

        <p className="text-xs text-gray-500 mt-4">Esta tela atualiza automaticamente assim que o pagamento for confirmado.</p>
      </div>
    </div>
  );
}


