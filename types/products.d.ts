// Tipos para o sistema de produtos e e-commerce

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  
  category?: string;
  tags?: string[];
  features?: string[];
  
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'limited';
  is_active: boolean;
  is_featured: boolean;
  
  images?: string[];
  thumbnail_url?: string;
  
  requires_shipping: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shipping_time?: string;
  
  asaas_product_id?: string;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  meta_title?: string;
  meta_description?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  
  shipping_name?: string;
  shipping_email?: string;
  shipping_phone?: string;
  shipping_address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zip: string;
  };
  
  payment_method?: string;
  asaas_payment_id?: string;
  asaas_customer_id?: string;
  payment_link?: string;
  pix_qr_code?: string;
  pix_qr_code_image?: string;
  
  tracking_code?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  
  product_name: string;
  product_price: number;
  product_image?: string;
  
  quantity: number;
  subtotal: number;
  
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  
  min_purchase_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  
  valid_from: string;
  valid_until?: string;
  
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon?: Coupon;
}

