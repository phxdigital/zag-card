export type CustomLink = {
    id: number;
    text: string;
    url: string;
    icon: string | null;
    styleType: 'solid' | 'gradient';
    bgColor1: string;
    bgColor2: string;
    textColor: string;
};

export type SocialLinks = { 
    [key: string]: string 
};

export type PageConfig = {
    // Card config
    cardText?: string;
    isTextEnabled?: boolean;
    cardBgColor?: string;
    cardTextColor?: string;
    cardBackBgColor?: string;
    logoSize?: number;
    qrCodeSize?: number;
    clientLogoBackSize?: number;
    qrCodePosition?: string;
    
    // Landing page config
    landingPageBgColor?: string;
    landingPageBgImage?: string | null;
    landingPageTitleText?: string;
    landingPageSubtitleText?: string;
    landingPageLogoShape?: 'circle' | 'square';
    landingPageLogoSize?: number;
    
    // Links
    socialLinks?: SocialLinks;
    customLinks?: CustomLink[];
};

export type IconName = 
    | 'message-circle' | 'instagram' | 'facebook' | 'shopping-cart' 
    | 'link' | 'dollar-sign' | 'wifi' | 'globe' | 'book-open' 
    | 'map-pin' | 'phone' | 'mail' | 'info' | 'star' | 'image' | 'video'
    | 'plus-circle' | 'edit' | 'trash-2' | 'user' | 'circle' | 'square';