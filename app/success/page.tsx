'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SuccessPage from '../components/SuccessPage';

function SuccessContent() {
    const searchParams = useSearchParams();
    const subdomain = searchParams.get('subdomain') || '';
    const pageId = searchParams.get('pageId') || '';
    const isEdit = searchParams.get('edit') === 'true';

    return (
        <SuccessPage 
            subdomain={subdomain} 
            pageId={pageId} 
            isEdit={isEdit} 
        />
    );
}

export default function Success() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
