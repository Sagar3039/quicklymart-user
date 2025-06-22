import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, Heart, Mic, ArrowLeft, Moon, Sun, ShoppingCart, Filter, Plus, Minus, MoreVertical, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast, Toaster } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductQuickView from '@/components/ProductQuickView';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import { getProductsByCategory, getCategoriesByProductCategory, PRODUCT_CATEGORIES, type Product, type Category } from '@/lib/products';
import { useTheme } from '@/App';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import CheckoutModal from '@/components/CheckoutModal';
import { addDoc, collection } from 'firebase/firestore';
import { db, retryOperation } from '@/lib/firebase';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CartItem extends Product {
  quantity: number;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const Drinks = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let results = [...products];

    // Category filter
    if (activeCategory !== 'All') {
      results = results.filter(product => product.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting logic
    switch (sortOption) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return results;
  }, [products, activeCategory, searchQuery, sortOption]);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    if (!isAgeVerified) {
      setShowAgeModal(true);
      return;
    }
    
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

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Item removed from cart!');
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared!');
  };

  const handleProductClick = (product: Product) => {
    if (!isAgeVerified) {
      setShowAgeModal(true);
      return;
    }
    setSelectedProduct(product);
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const drinksCategories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.DRINKS);
      setCategories(drinksCategories);
    } catch (error) {
      console.error('Error loading drinks categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const drinksProducts = await getProductsByCategory(PRODUCT_CATEGORIES.DRINKS);
      setProducts(drinksProducts);
    } catch (error) {
      console.error('Error loading drinks products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('quicklymart-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check age verification status
    const ageVerified = localStorage.getItem('quicklymart-age-verified');
    if (ageVerified) {
      setIsAgeVerified(true);
    } else {
      setShowAgeModal(true); // Show age modal if not verified
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('quicklymart-cart', JSON.stringify(cart));
  }, [cart]);

  const placeOrder = async (orderDetails) => {
    const { address, paymentMethod, tip, finalTotal } = orderDetails;

    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }

    // Show loading toast for location access
    toast.loading("Getting your location for accurate delivery tracking...");

    // Get user's actual GPS location
    let userLocation = null;
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        toast.dismiss();
        toast.success("Location accessed successfully!");
      } else {
        throw new Error("Geolocation not supported");
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast.dismiss();
      
      if (error.code === 1) {
        toast.error("Location access denied. Please enable location permissions for accurate tracking.");
      } else if (error.code === 2) {
        toast.error("Location unavailable. Please check your GPS settings.");
      } else if (error.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Could not get your location. Using approximate location.");
      }
      
      // Fallback to mock coordinates if location access fails
      userLocation = {
        lat: 22.5726 + (Math.random() - 0.5) * 0.01,
        lng: 88.3639 + (Math.random() - 0.5) * 0.01
      };
    }

    // Calculate estimated delivery time (25-35 minutes base + distance factor)
    const baseTime = 25;
    const distanceFactor = Math.random() * 10 + 5; // 5-15 minutes based on distance
    const estimatedMinutes = Math.round(baseTime + distanceFactor);
    const estimatedDeliveryTime = new Date(Date.now() + estimatedMinutes * 60 * 1000);

    const orderData = {
      userId: user.uid,
      items: cart,
      totalPrice: finalTotal,
      tip,
      deliveryAddress: { ...address },
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      estimatedDeliveryTime: estimatedDeliveryTime,
      estimatedMinutes: estimatedMinutes,
      // Store user's actual location coordinates for map
      userLocation: userLocation
    };

    try {
      await retryOperation(async () => {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        toast.success('Order placed successfully!');
        setCart([]);
        setShowCheckoutModal(false);
        // Redirect to current order page
        navigate(`/current-order/${docRef.id}`);
      });
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.code === 'permission-denied') {
        toast.error('Access denied. Please check your permissions.');
      } else if (error.code === 'unavailable') {
        toast.error('Firebase service is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to place order. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                onClick={() => navigate(-1)}
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Drinks</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                  onClick={toggleDarkMode}
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
            </div>
            </div>
        </div>
      </header>

      {isSearchVisible && (
        <div className="container mx-auto px-4 pt-2 pb-4">
            <Input
              placeholder="Search for drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isDarkMode ? 'bg-gray-700' : ''}`}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className={`sticky top-16 z-40 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button variant="outline" className={`rounded-full ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}>
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`rounded-full ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}>Sort by</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOption('relevance')}>Relevance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('price-asc')}>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('price-desc')}>Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('rating')}>Rating</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className={`rounded-full ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'}`}>Offers</Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} py-3`}>
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.name
                    ? 'bg-orange-500 text-white'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {filteredAndSortedProducts.map((product) => (
          <div key={product.id} className="flex space-x-4 group">
            <div className="w-1/3 relative">
              <img src={product.image} alt={product.name} className="rounded-2xl w-full h-40 object-cover" />
              <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1">
                 <Heart className="w-5 h-5 text-gray-700" />
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md">
                ITEMS AT ₹{product.price}
              </div>
            </div>
            <div className="w-2/3">
              <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                  <Button variant="ghost" size="icon" className="w-8 h-8 -mr-2">
                      <MoreVertical className="w-4 h-4" />
                  </Button>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Star className="w-4 h-4 text-green-500 fill-green-500" />
                <span>{product.rating} (50+) • 10-15 mins</span>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.description}</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Local Bar • 3.5 km</p>
              <div className="mt-2">
                <Button onClick={() => addToCart(product)} size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600">
                  Add to cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Cart View */}
      {cart.length > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-t`}>
          <div className="container mx-auto flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <button onClick={() => setShowCart(true)} className="text-sm font-semibold text-orange-500">
                View Cart
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6"
                onClick={() => setShowCheckoutModal(true)}
              >
                {cartItemCount} items | ₹{cartTotal.toFixed(2)} Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

       {/* Cart Sidebar */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent className={`w-96 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <SheetHeader>
            <SheetTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Your Cart</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your cart is empty</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Add some drinks to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item: any) => (
                  <div key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>₹{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className={`w-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                        <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                      >
                        <Plus className="w-3 h-3" />
                        </Button>
                    </div>
                        </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                <span className="text-orange-500 font-bold text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    if (!user) {
                      toast.error('You must be logged in to place an order.');
                      return;
                    }
                    setShowCheckoutModal(true);
                  }}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
      </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modals */}
      {selectedProduct && (
      <ProductQuickView 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
      )}
      {showCheckoutModal && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onPlaceOrder={placeOrder}
          totalPrice={cartTotal}
          user={user}
        />
      )}
      <AgeVerificationModal 
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onVerify={() => {
          setIsAgeVerified(true);
          setShowAgeModal(false);
          localStorage.setItem('quicklymart-age-verified', 'true');
        }}
      />
    </div>
  );
};

export default Drinks; 