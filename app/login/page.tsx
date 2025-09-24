import Image from 'next/image';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Image 
                        src="/logo-zag.png" 
                        alt="Zag Card Logo" 
                        width={256} 
                        height={256} 
                        className="mx-auto h-40 w-auto" 
                        style={{ width: 'auto', height: 'auto' }}
                        priority
                    />
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        Zag Card NFC
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Sistema de cartões digitais
                    </p>
                </div>
            </div>
            
            <div className="mt-8 w-full max-w-sm">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Sistema em Desenvolvimento
                        </h3>
                        <p className="text-slate-600 mb-6">
                            A autenticação será implementada em breve. Por enquanto, você pode acessar o dashboard diretamente.
                        </p>
                        <a 
                            href="/dashboard" 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            Acessar Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}