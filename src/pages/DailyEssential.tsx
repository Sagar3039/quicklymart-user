import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, Heart, Mic, ArrowLeft, Moon, Sun, ShoppingCart, Filter, Plus, Minus, MoreVertical, Trash2, X, MapPin, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductQuickView from '@/components/ProductQuickView';
import { getProductsByCategory, getCategoriesByProductCategory, PRODUCT_CATEGORIES, type Product, type Category } from '@/lib/products';
import { useTheme } from '@/App';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import CheckoutModal from '@/components/CheckoutModal';
import { addDoc, collection, getDoc, doc, updateDoc } from 'firebase/firestore';
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
import CartBar from '@/components/CartBar';
import LocationPicker from '@/components/LocationPicker';
import { useBanCheck } from '@/hooks/useBanCheck';

interface CartItem extends Product {
  quantity: number;
}

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
  };
}

// Allow admin-provided image/logo on Category
type CategoryWithImage = Category & { image?: string; logo?: string };

const categoryImages = {
  Staples: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1504674900247-ec6b0b1b798e?w=200&h=200&fit=crop',
  Beverages: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=200&h=200&fit=crop',
  'Personal Care': 'https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?w=200&h=200&fit=crop',
  Household: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop',
  // Add more as needed
};
const defaultImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';

const DailyEssential = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice, isCartPopupOpen, setIsCartPopupOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [sortOption, setSortOption] = useState('relevance');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { banStatus } = useBanCheck();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let results = [...products];

    // Category filter
    if (activeCategory !== 'all' && activeCategory !== 'All') {
      results = results.filter(product =>
        product.subcategory &&
        product.subcategory.trim().toLowerCase() === activeCategory.trim().toLowerCase()
      );
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

  // Add uniqueProducts logic (deduplicate by name and price)
  const uniqueProducts = useMemo(() => {
    const seen = new Map();
    for (const product of filteredAndSortedProducts) {
      const key = `${product.name}-${product.price}`;
      if (!seen.has(key)) {
        seen.set(key, product);
      }
    }
    return Array.from(seen.values());
  }, [filteredAndSortedProducts]);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const dailyEssentialCategories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.DAILY_ESSENTIAL);
      setCategories(dailyEssentialCategories);
    } catch (error) {
      console.error('Error loading daily essential categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const dailyEssentialProducts = await getProductsByCategory(PRODUCT_CATEGORIES.DAILY_ESSENTIAL);
      setProducts(dailyEssentialProducts);
    } catch (error) {
      console.error('Error loading daily essential products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
    
    // Cart is now managed by context
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('pickngo-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      const categoryExists = categories.some(
        cat => cat.name === location.state.category || cat.subcategory === location.state.category
      );
      if (categoryExists) {
        setActiveCategory(location.state.category);
      }
    }
  }, [location.state?.category, categories]);

  // Debug: Log categories to check for image/logo property
  useEffect(() => {
    console.log('Categories:', categories);
  }, [categories]);

  const placeOrder = async (orderDetails: any) => {
    const { address, paymentMethod, tip, finalTotal, location } = orderDetails;

    // Check if user is banned
    if (banStatus.isBanned) {
      toast.error('Your account has been suspended. You cannot place orders.');
      setShowCheckoutModal(false);
      return;
    }

    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }

    // Check for phone number in address
    if (!address.phone || address.phone.trim() === "") {
      toast.error("Please add a phone number to your address before placing the order.");
      return;
    }

    // Use the selected location from the map or fallback to GPS
    let userLocation = null;
    
    if (location) {
      // Use the location selected from the map
      userLocation = {
        lat: location.lat,
        lng: location.lng
      };
      toast.success("Using selected delivery location!");
    } else {
      // Fallback to GPS location if no map location was selected
      toast.loading("Getting your location for accurate delivery tracking...");
      
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
    }

    // Calculate estimated delivery time (25-35 minutes base + distance factor)
    const baseTime = 25;
    const distanceFactor = Math.random() * 10 + 5;
    const estimatedMinutes = Math.round(baseTime + distanceFactor);
    const estimatedDeliveryTime = new Date(Date.now() + estimatedMinutes * 60 * 1000);

    // Use name, email, phone from address
    const userData = {
      name: address.name || user.displayName || 'User',
      email: address.email || user.email || '',
      phone: address.phone
    };

    const orderData = {
      userId: user.uid,
      userInfo: userData, // Use address info
      items: cart,
      totalPrice: finalTotal,
      tip,
      deliveryAddress: Object.fromEntries(
        Object.entries(address).filter(([_, value]) => value !== undefined && value !== null)
      ),
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      estimatedDeliveryTime: estimatedDeliveryTime,
      estimatedMinutes: estimatedMinutes,
      userLocation: userLocation,
      selectedLocationAddress: location?.address || null
    };

    try {
      await retryOperation(async () => {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        // Add the generated orderId to the order document
        await updateDoc(doc(db, 'orders', docRef.id), { orderId: docRef.id });
        toast.success('Order placed successfully!');
        clearCart();
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

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('You must be logged in to place an order.');
      return;
    }
    setShowCheckoutModal(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>

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
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Daily Essentials</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Search */}
              <Button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                variant="ghost"
                size="icon"
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                onClick={() => setIsCartOpen(true)}
                variant="ghost"
                size="icon"
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
            </div>
        </div>
      </header>

      {isSearchVisible && (
        <div className="container mx-auto px-4 pt-2 pb-4">
            <Input
            placeholder="Search for essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isDarkMode ? 'bg-gray-700' : ''}`}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className={`sticky top-16 z-40 py-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
          </div>
        </div>
      </div>

      {/* Categories - new image style, now dynamic and flexible */}
      <div className="py-4">
        <div className="flex space-x-4 overflow-x-auto px-2 md:justify-center md:space-x-8 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {(() => {
            const seen = new Set();
            const uniqueCategories = categories.filter(cat => {
              // Filter out categories with malformed data
              if (!cat.name || cat.name.trim() === '' || 
                  cat.name === '🥐' || cat.name === '📦' ||
                  cat.name.includes('http') || cat.name.includes('unsplash')) {
                return false;
              }
              
              const key = cat.subcategory || cat.id || cat.name;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return (uniqueCategories as CategoryWithImage[]).map((cat) => {
              let visual = null;
              
              // Handle icon display - only use database categories
              if (cat.image) {
                visual = <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />;
              } else if (cat.logo) {
                visual = <img src={cat.logo} alt={cat.name} className="w-full h-full object-cover" />;
              } else if (cat.icon && typeof cat.icon === 'string' && !cat.icon.startsWith('http')) {
                // Only show valid emoji icons from database
                visual = <span className="text-4xl flex items-center justify-center w-full h-full">{cat.icon}</span>;
              } else {
                // Skip categories without proper icons
                return null;
              }
              
              return (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setActiveCategory(cat.subcategory)}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 transition-all duration-200 ${activeCategory === cat.subcategory ? 'border-orange-500 shadow-lg' : 'border-transparent'}`}
                    style={{ boxShadow: activeCategory === cat.subcategory ? '0 0 0 4px rgba(255, 115, 0, 0.2)' : undefined }}
                  >
                    {visual}
                  </div>
                  <span className="mt-2 text-sm md:text-base font-medium text-center whitespace-nowrap">{cat.name}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Mobile: original flex row card list */}
        <div className="block md:hidden space-y-4">
          {uniqueProducts.map((product) => (
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
                  <span>{product.rating} (500+) • 20-25 mins</span>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.description}</p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Khaprail Bazar • 2.2 km</p>
              <div className="mt-2">
                  <div className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>₹{product.price}</div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    size="sm"
                    className={
                      isDarkMode
                        ? 'bg-orange-500 hover:bg-orange-600 text-white w-full'
                        : 'border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 w-full'
                    }
                    variant={isDarkMode ? 'default' : 'outline'}
                  >
                  Add to cart
                </Button>
              </div>
            </div>
          </div>
        ))}
        </div>
        {/* Desktop: new grid card layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {uniqueProducts.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 flex flex-col h-full transition-transform hover:scale-[1.02] ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}
            >
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1">
                  <Heart className="w-5 h-5 text-gray-700" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md">
                  ITEMS AT ₹{product.price}
                </div>
              </div>
              <div className="flex-1 flex flex-col p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-lg truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                  <Button variant="ghost" size="icon" className="w-8 h-8 -mr-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                  <Star className="w-4 h-4 text-green-500 fill-green-500" />
                  <span>{product.rating} (500+) • 20-25 mins</span>
            </div>
                <p className={`text-sm mb-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.description}</p>
                <p className={`text-sm mb-2 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Khaprail Bazar • 2.2 km</p>
                <div className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>₹{product.price}</div>
              <Button 
                  onClick={() => handleAddToCart(product)}
                  size="sm"
                  className={
                    isDarkMode
                      ? 'bg-orange-500 hover:bg-orange-600 text-white w-full'
                      : 'border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 w-full'
                  }
                  variant={isDarkMode ? 'default' : 'outline'}
                >
                  Add to cart
              </Button>
            </div>
          </div>
          ))}
        </div>
      </main>

      <CartBar
        cart={cart}
        totalPrice={getTotalPrice()}
        onCheckout={() => setIsCartOpen(true)}
        onDelete={clearCart}
        onViewMenu={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        buttonLabel="Checkout"
        className="block md:hidden !bottom-0"
      />

      {/* Modals */}
      {selectedProduct && (
      <ProductQuickView 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
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

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateCartQuantity}
        totalPrice={getTotalPrice()}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
};

export default DailyEssential; 
