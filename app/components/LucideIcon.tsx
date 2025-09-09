import React from 'react';
import {
    MessageCircle, Instagram, Facebook, Link as LinkIcon,
    ShoppingCart, Globe, Wifi, DollarSign, BookOpen, MapPin,
    Phone, Mail, Info, Star, Image as ImageIcon, Video,
    PlusCircle, Edit, Trash2, User, Circle, Square
} from 'lucide-react';
import type { IconName } from '@/types';

interface LucideIconProps {
    name: IconName;
    size?: number;
    className?: string;
}

const iconMap: { [key in IconName]: React.ElementType } = {
    'message-circle': MessageCircle,
    'instagram': Instagram,
    'facebook': Facebook,
    'shopping-cart': ShoppingCart,
    'link': LinkIcon,
    'dollar-sign': DollarSign,
    'wifi': Wifi,
    'globe': Globe,
    'book-open': BookOpen,
    'map-pin': MapPin,
    'phone': Phone,
    'mail': Mail,
    'info': Info,
    'star': Star,
    'image': ImageIcon,
    'video': Video,
    'plus-circle': PlusCircle,
    'edit': Edit,
    'trash-2': Trash2,
    'user': User,
    'circle': Circle,
    'square': Square
};

export const LucideIcon: React.FC<LucideIconProps> = ({ name, size = 24, className, ...props }) => {
    const IconComponent = iconMap[name];
    
    if (!IconComponent) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }
    
    return <IconComponent size={size} className={className} {...props} />;
};