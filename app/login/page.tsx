'use client';import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';import { Auth } from '@supabase/auth-ui-react';import { ThemeSupa } from '@supabase/auth-ui-shared';import { useRouter } from 'next/navigation';import Image from 'next/image';export default function LoginPage() {const supabase = createClientComponentClient();const router = useRouter();supabase.auth.onAuthStateChange((event) => {if (event === 'SIGNED_IN') {router.push('/dashboard');}});return (<div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4"><div className="w-full max-w-md space-y-6"><Image src="/logo.png" alt="Zag Card Logo" width={128} height={128} className="mx-auto h-20 w-auto" /><h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Acesse sua conta</h2></div>  <div className="mt-8 w-full max-w-sm">
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="light"
      providers={['google', 'github']}
      redirectTo={`${location.origin}/auth/callback`}
    />
  </div>
</div>
);}