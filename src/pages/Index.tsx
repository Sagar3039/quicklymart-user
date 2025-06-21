import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, MapPin, Clock, Star, Grid, List, Filter, Plus, Minus, Mic, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';
import AuthModal from '@/components/AuthModal';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import ProductQuickView from '@/components/ProductQuickView';
import Cart from '@/components/Cart';

const QuicklyMart = () => {
  const [activeCategory, setActiveCategory] = useState('essentials');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedLocation, setSelectedLocation] = useState('White Building, Midnapore, We...');
  const [cart, setCart] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sample product data
  const products = {
    essentials: [
      { id: 1, name: 'Premium Basmati Rice 5kg', price: 450, originalPrice: 500, rating: 4.5, image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400', category: 'Groceries', inStock: true, deliveryTime: '15 mins' },
      { id: 2, name: 'Anime Figure Collection', price: 2500, rating: 4.8, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', category: 'Collectibles', inStock: true, deliveryTime: '20 mins' },
      { id: 3, name: 'Car Dashboard Organizer', price: 899, originalPrice: 1200, rating: 4.3, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', category: 'Auto', inStock: false, deliveryTime: '25 mins' },
      { id: 4, name: 'Home Decor LED Strips', price: 799, rating: 4.6, image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400', category: 'Home', inStock: true, deliveryTime: '18 mins' }
    ],
    localfoods: [
      { id: 5, name: "Domino's Pizza", price: 91, rating: 4.5, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', category: 'Pizzas', inStock: true, deliveryTime: '20-25 mins', description: 'Hot & crispy delights', discount: '60% OFF' },
      { id: 6, name: 'Spice N Ice', price: 130, originalPrice: 300, rating: 4.3, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Indian', inStock: true, deliveryTime: '20-25 mins', discount: '60% OFF' },
      { id: 7, name: 'China Nation', price: 180, rating: 4.1, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', category: 'Chinese', inStock: true, deliveryTime: '15-20 mins', offer: 'BUY1 GET1' },
      { id: 8, name: 'Homemade Sweets Box', price: 300, rating: 4.6, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', category: 'Sweets', inStock: true, deliveryTime: '20 mins' }
    ],
    alcohol: [
      { id: 9, name: 'Premium Whiskey 750ml', price: 2500, rating: 4.4, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', category: 'Spirits', inStock: true, deliveryTime: '45 mins', ageRestricted: true },
      { id: 10, name: 'Craft Beer Pack (6 bottles)', price: 800, originalPrice: 900, rating: 4.2, image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400', category: 'Beer', inStock: true, deliveryTime: '40 mins', ageRestricted: true }
    ]
  };

  const serviceCategories = [
    { name: 'FEAST MODE', subtitle: '65% OFF Every 30 Mins', icon: '🍽️', color: 'bg-purple-600' },
    { name: 'FLASH DEALS', subtitle: 'Dishes From ₹49', icon: '⚡', color: 'bg-blue-600' },
    { name: 'DISCOUNTS', subtitle: 'Up To 60% OFF', icon: '%', color: 'bg-green-600' },
    { name: 'Bolt', subtitle: 'Food In 10 Mins', icon: '⚡', color: 'bg-orange-600' },
  ];

  const categoryIcons = {
    essentials: '🛒',
    localfoods: '🍲',
    alcohol: '🍷'
  };

  const categoryColors = {
    essentials: 'from-green-400 to-green-600',
    localfoods: 'from-orange-400 to-orange-600',
    alcohol: 'from-purple-400 to-purple-600'
  };

  const filteredProducts = products[activeCategory]?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    product.price >= priceRange[0] && product.price <= priceRange[1]
  ) || [];

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCategoryChange = (category) => {
    if (category === 'alcohol' && !isAgeVerified) {
      return; // Age verification modal will handle this
    }
    setActiveCategory(category);
  };

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('quicklymart-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check age verification status
    const ageVerified = localStorage.getItem('quicklymart-age-verified');
    if (ageVerified) {
      setIsAgeVerified(true);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('quicklymart-cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-indigo-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-indigo-900 font-bold text-sm">📦</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Work</h1>
                  <p className="text-gray-300 text-xs">{selectedLocation}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                BUY one
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-gray-800 rounded-full w-10 h-10"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for 'Gift Hamp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white rounded-xl text-lg"
            />
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
          <Button className="bg-white text-green-600 h-14 px-6 rounded-xl font-bold">
            VEG
            <div className="w-3 h-3 border-2 border-green-600 rounded-sm ml-2"></div>
          </Button>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Foodie Weekend💰</h2>
              <p className="text-lg mb-4">Upto 60% OFF on delights!</p>
              <Button className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-300">
                ORDER NOW
              </Button>
            </div>
            <div className="flex space-x-4">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150" alt="Food" className="w-20 h-20 rounded-full object-cover" />
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150" alt="Dessert" className="w-20 h-20 rounded-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="container mx-auto px-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {serviceCategories.map((service, index) => (
            <div key={index} className={`${service.color} rounded-2xl p-4 text-white relative overflow-hidden`}>
              <div className="text-2xl mb-2">{service.icon}</div>
              <h3 className="font-bold text-sm mb-1">{service.name}</h3>
              <p className="text-xs opacity-90">{service.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bolt Banner */}
      <div className="container mx-auto px-4 mb-6">
        <div className="bg-gradient-to-r from-red-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-xl font-bold">Bolt | Dinner in 10 mins</h3>
              </div>
              <p className="mb-4">Fresh, hot & crisp delights for you.</p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-full">
                ORDER NOW
              </Button>
            </div>
            <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200" alt="Food Bowl" className="w-32 h-32 rounded-full object-cover" />
          </div>
        </div>
      </div>

      {/* Fast Delivery Section */}
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-white text-2xl font-bold mb-4">Fast delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.slice(0, 3).map((product) => (
            <Card key={product.id} className="relative overflow-hidden bg-white rounded-2xl">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                {product.discount && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}
                  </div>
                )}
                {product.offer && (
                  <div className="absolute bottom-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.offer}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 rounded text-sm">
                  ITEMS AT ₹{product.price}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                    <span className="font-medium text-sm">{product.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">• {product.deliveryTime}</span>
                </div>
                <p className="text-gray-600 text-sm">{product.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="grid grid-cols-3 h-16">
          <button className="flex flex-col items-center justify-center space-y-1 border-t-2 border-orange-500 text-orange-500">
            <span className="text-xl">🍽️</span>
            <span className="text-xs font-medium">Food</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center space-y-1 text-gray-400"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
            <span className="text-xs">Reorder</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1 text-gray-400">
            <span className="text-xl">🍷</span>
            <span className="text-xs">Wine Stores</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <AgeVerificationModal 
        isOpen={activeCategory === 'alcohol' && !isAgeVerified}
        onVerified={() => {
          setIsAgeVerified(true);
          localStorage.setItem('quicklymart-age-verified', 'true');
          setActiveCategory('alcohol');
        }}
        onClose={() => setActiveCategory('essentials')}
      />

      <ProductQuickView 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
};

export default QuicklyMart;
