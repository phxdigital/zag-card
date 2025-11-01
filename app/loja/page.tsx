'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ImageGallery } from '@/components/ImageGallery';
import { PaymentModal } from '@/components/PaymentModal';
import '../homepage.css';
import { 
  ShoppingCart, 
  Star, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Truck,
  Shield,
  Heart,
  Share2,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  category: string;
  features: string[];
  stock_quantity: number;
  stock_status: string;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  thumbnail_url?: string;
  requires_shipping: boolean;
  shipping_time: string;
  created_at: string;
}

interface ProductCardProps {
  product: Product;
  onImageClick: (product: Product, imageIndex: number) => void;
  onBuyClick?: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onImageClick, onBuyClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : 
    (product.thumbnail_url ? [product.thumbnail_url] : []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const discountPercentage = product.compare_price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const handleBuyNow = () => {
    // Armazenar dados do produto no sessionStorage
    const checkoutData = {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity
      }
    };
    
    sessionStorage.setItem('checkout_data', JSON.stringify(checkoutData));
    
    // Chamar callback para abrir modal de pagamento
    if (onBuyClick) {
      onBuyClick(product, quantity);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem do Produto */}
      <div className="relative aspect-square overflow-hidden">
        {images.length > 0 ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Indicadores de desconto */}
            {discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                -{discountPercentage}%
              </div>
            )}
            
            {/* Badge em destaque */}
            {product.is_featured && (
              <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Destaque
              </div>
            )}
            
            {/* Controles de navegação das imagens */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Indicadores de imagem */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Botão de visualizar */}
            <button
              onClick={() => onImageClick(product, currentImageIndex)}
              className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <Eye className="h-8 w-8 text-white" />
            </button>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.short_description}
        </p>

        {/* Preços */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-3">
            <ul className="text-xs text-gray-600 space-y-1">
              {(showAllFeatures ? product.features : product.features.slice(0, 3)).map((feature, index) => (
                <li key={index} className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                  {feature}
                </li>
              ))}
              {product.features.length > 3 && !showAllFeatures && (
                <li 
                  className="text-blue-600 font-medium cursor-pointer hover:text-blue-800"
                  onClick={() => setShowAllFeatures(true)}
                >
                  +{product.features.length - 3} mais recursos
                </li>
              )}
              {showAllFeatures && product.features.length > 3 && (
                <li 
                  className="text-blue-600 font-medium cursor-pointer hover:text-blue-800"
                  onClick={() => setShowAllFeatures(false)}
                >
                  Mostrar menos
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Informações de entrega */}
        {product.requires_shipping && (
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Truck className="h-3 w-3" />
              {product.shipping_time}
            </div>
          </div>
        )}

        {/* Seletor de Quantidade */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Preço Total */}
        {quantity > 1 && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
          </div>
        )}

        {/* Botão de compra */}
        <button 
          onClick={handleBuyNow}
          className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
        >
          Comprar
        </button>
      </div>
    </div>
  );
};

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedProductForPayment, setSelectedProductForPayment] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleImageClick = (product: Product, imageIndex: number) => {
    setSelectedProduct(product);
    setSelectedImageIndex(imageIndex);
    setGalleryOpen(true);
  };

  const handleBuyClick = (product: Product, quantity: number) => {
    setSelectedProductForPayment(product);
    setSelectedQuantity(quantity);
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async (customerData: { name: string; cpf: string; phone: string; email: string; method: 'PIX' | 'CARD'; cardMode?: 'CREDIT' | 'DEBIT' }) => {
    if (!selectedProductForPayment) return;

    setPaymentLoading(true);

    try {
      const total = selectedProductForPayment.price * selectedQuantity;

      if (customerData.method === 'CARD') {
        // Ir para checkout de cartão com dados do cliente e do produto
        const payload = {
          planType: `product_${selectedProductForPayment.id}`,
          value: total,
          description: `${selectedProductForPayment.name}${selectedQuantity > 1 ? ` (Qtd: ${selectedQuantity})` : ''} - Zag NFC`,
          customer: {
            name: customerData.name,
            cpf: customerData.cpf,
            phone: customerData.phone,
            email: customerData.email,
          },
          cardMode: customerData.cardMode || 'CREDIT',
        };
        
        // Salvar dados do produto no sessionStorage
        const checkoutData = {
          product: {
            id: selectedProductForPayment.id,
            name: selectedProductForPayment.name,
            price: selectedProductForPayment.price,
            quantity: selectedQuantity,
            total: total
          }
        };
        sessionStorage.setItem('checkout_data', JSON.stringify(checkoutData));
        sessionStorage.setItem('card_checkout_data', JSON.stringify(payload));
        
        setPaymentModalOpen(false);
        setSelectedProductForPayment(null);
        // Redirecionar para página de loading antes do checkout
        window.location.href = '/loading-checkout?type=card';
        return;
      }

      // Criar pagamento PIX
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: `product_${selectedProductForPayment.id}`,
          value: total,
          description: `${selectedProductForPayment.name}${selectedQuantity > 1 ? ` (Qtd: ${selectedQuantity})` : ''} - Zag NFC`,
          customerData: {
            name: customerData.name,
            cpf: customerData.cpf,
            phone: customerData.phone,
            email: customerData.email,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar pagamento');
      }

      const data = await response.json();
      
      // Fechar modal
      setPaymentModalOpen(false);
      setSelectedProductForPayment(null);
      
      // Salvar dados do produto no sessionStorage
      const checkoutData = {
        product: {
          id: selectedProductForPayment.id,
          name: selectedProductForPayment.name,
          price: selectedProductForPayment.price,
          quantity: selectedQuantity,
          total: total
        }
      };
      sessionStorage.setItem('checkout_data', JSON.stringify(checkoutData));
      
      // Redirecionar para página de checkout com QR code PIX
      if (data.payment && data.payment.pix) {
        // Armazenar dados do pagamento no sessionStorage
        sessionStorage.setItem('payment_data', JSON.stringify(data.payment));
        // Redirecionar para página de loading antes do checkout
        window.location.href = '/loading-checkout?type=pix';
      } else if (data.payment && data.payment.invoiceUrl) {
        // Redirecionar para fatura
        window.location.href = data.payment.invoiceUrl;
      }

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="homepage min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8" style={{ marginTop: '4rem' }}>
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nossa Loja
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubra nossos produtos NFC premium e transforme seu networking digital
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="featured">Em Destaque</option>
            <option value="price-low">Menor Preço</option>
            <option value="price-high">Maior Preço</option>
            <option value="name">Nome A-Z</option>
          </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {sortedProducts.length} de {products.length} produtos
          </p>
        </div>

        {/* Grid de Produtos */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={handleImageClick}
                onBuyClick={handleBuyClick}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Image Gallery Modal */}
      {selectedProduct && (
        <ImageGallery
          images={selectedProduct.images || []}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}

      {/* Payment Modal */}
      {selectedProductForPayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedProductForPayment(null);
          }}
          onConfirm={handlePaymentConfirm}
          planName={`${selectedProductForPayment.name}${selectedQuantity > 1 ? ` (Qtd: ${selectedQuantity})` : ''}`}
          planValue={selectedProductForPayment.price * selectedQuantity}
          loading={paymentLoading}
        />
      )}
    </div>
  );
}
