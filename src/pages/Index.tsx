
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, MapPin, Clock, Star, Grid, List, Filter, Plus, Minus } from 'lucide-react';
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
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
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
      { id: 5, name: 'Homemade Dal Chawal Tiffin', price: 120, rating: 4.7, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400', category: 'Tiffin', inStock: true, deliveryTime: '25 mins' },
      { id: 6, name: 'Bengali Fish Curry Combo', price: 180, rating: 4.9, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', category: 'Regional', inStock: true, deliveryTime: '30 mins' },
      { id: 7, name: 'Gujarati Thali Special', price: 250, originalPrice: 300, rating: 4.8, image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400', category: 'Thali', inStock: true, deliveryTime: '35 mins' },
      { id: 8, name: 'Homemade Sweets Box', price: 300, rating: 4.6, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', category: 'Sweets', inStock: true, deliveryTime: '20 mins' }
    ],
    alcohol: [
      { id: 9, name: 'Premium Whiskey 750ml', price: 2500, rating: 4.4, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', category: 'Spirits', inStock: true, deliveryTime: '45 mins', ageRestricted: true },
      { id: 10, name: 'Craft Beer Pack (6 bottles)', price: 800, originalPrice: 900, rating: 4.2, image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400', category: 'Beer', inStock: true, deliveryTime: '40 mins', ageRestricted: true }
    ]
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                QuicklyMart
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Clock className="w-3 h-3 mr-1" />
                Express Delivery
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => setSelectedLocation('Detecting...')}
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline truncate max-w-32">{selectedLocation}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="essentials" className="flex items-center space-x-2">
                <span>{categoryIcons.essentials}</span>
                <span className="hidden sm:inline">Essentials</span>
              </TabsTrigger>
              <TabsTrigger value="localfoods" className="flex items-center space-x-2">
                <span>{categoryIcons.localfoods}</span>
                <span className="hidden sm:inline">Local Foods</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alcohol" 
                className="flex items-center space-x-2"
                onClick={(e) => {
                  if (!isAgeVerified) {
                    e.preventDefault();
                  }
                }}
              >
                <span>{categoryIcons.alcohol}</span>
                <span className="hidden sm:inline">Alcohol</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={`Search in ${activeCategory}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Products</DialogTitle>
                    <DialogDescription>Refine your search results</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price Range</label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={5000}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 p-1 h-8 w-8"
                        onClick={() => setSelectedProduct(product)}
                      >
                        👁️
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>

                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {product.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Clock className="w-3 h-3 mr-1" />
                    {product.deliveryTime}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                {cart.find(item => item.id === product.id) ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(product.id, cart.find(item => item.id === product.id)?.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-medium">
                        {cart.find(item => item.id === product.id)?.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(product.id, cart.find(item => item.id === product.id)?.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

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
