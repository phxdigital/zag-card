'use client';

import { useSearchParams } from 'next/navigation';
import SuccessPage from '../components/SuccessPage';

export default function Success() {
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
