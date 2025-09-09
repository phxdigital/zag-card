export const socialMediaConfig: { [key: string]: { icon: IconName; baseUrl: string } } = {
    whatsapp: { icon: 'message-circle', baseUrl: 'https://wa.me/' },
    instagram: { icon: 'instagram', baseUrl: 'https://instagram.com/' },
    facebook: { icon: 'facebook', baseUrl: 'https://facebook.com/' },
    tiktok: { icon: 'video', baseUrl: 'https://tiktok.com/@' },
};

export const availableIcons: string[] = [
    'shopping-cart', 'link', 'dollar-sign', 'wifi', 'globe', 'book-open',
    'map-pin', 'phone', 'mail', 'info', 'star', 'image', 'video'
];

export const commonEmojis: string[] = [
    '✨', '🚀', '⭐', '❤️', '✅', '👇', '📱', '📞', '💡', '🔥', '🎉', '👋'
];

export const DEFAULT_CONFIG: PageConfig = {
    cardText: '',
    isTextEnabled: false,
    cardBgColor: '#FFFFFF',
    cardTextColor: '#1e293b',
    cardBackBgColor: '#e2e8f0',
    logoSize: 60,
    qrCodeSize: 35,
    clientLogoBackSize: 35,
    qrCodePosition: 'justify-start',
    socialLinks: {},
    customLinks: [],
    landingPageBgColor: '#F8FAFC',
    landingPageBgImage: null,
    landingPageTitleText: '',
    landingPageSubtitleText: '',
    landingPageLogoShape: 'circle',
    landingPageLogoSize: 96,
};