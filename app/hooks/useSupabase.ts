import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';

export const useSupabase = () => {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setUser(session.user);
                router.push('/dashboard');
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    return { supabase, user, loading };
};