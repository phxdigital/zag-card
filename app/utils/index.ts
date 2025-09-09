export const handleLinkClick = (url: string): void => {
    if (url.startsWith('copy:')) {
        const textToCopy = url.substring(5);
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            alert('Não foi possível copiar.');
        });
    } else if (url.startsWith('pix:')) {
        const textToCopy = url.substring(4);
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Código PIX copiado! Cole no seu app de banco.');
        }).catch(err => {
            console.error('Erro ao copiar PIX:', err);
            alert('Não foi possível copiar o código PIX.');
        });
    } else if (url.startsWith('WIFI:')) {
        alert('Aponte a câmera do seu celular para o QR Code no cartão para conectar ao Wi-Fi.');
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

export const validateSubdomain = (subdomain: string): string => {
    return subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
};

export const validateFileSize = (file: File, maxSizeInMB: number = 5): boolean => {
    return file.size <= maxSizeInMB * 1024 * 1024;
};