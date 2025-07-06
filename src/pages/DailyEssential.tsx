import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, Heart, Mic, ArrowLeft, Moon, Sun, ShoppingCart, Filter, Plus, Minus, MoreVertical, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast, Toaster } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductQuickView from '@/components/ProductQuickView';
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
import CartBar from '@/components/CartBar';

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
  const [cart, setCart] = useState<any[]>([]);
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

  const filteredAndSortedProducts = useMemo(() => {
    let results = [...products];

    // Category filter
    if (activeCategory !== 'all' && activeCategory !== 'All') {
      results = results.filter(product => product.subcategory === activeCategory);
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

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex !== -1) {
        // Increment quantity
        return prevCart.map((item, idx) =>
          idx === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
        );
    } else {
        // Add new item
        return [...prevCart, { ...product, quantity: 1 }];
    }
    });
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
    setSelectedProduct(product);
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
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('pickngo-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('pickngo-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
    } catch (error: any) {
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
      userId: (user as any).uid,
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
    } catch (error: any) {
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
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Daily Essentials</h1>
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

      {/* Categories - new image style, now dynamic and flexible */}
      <div className="py-4">
        <div className="flex space-x-4 overflow-x-auto px-2 md:justify-center md:space-x-8">
          {(() => {
            const seen = new Set();
            const uniqueCategories = categories.filter(cat => {
              const key = cat.subcategory || cat.id || cat.name;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return (uniqueCategories as CategoryWithImage[]).map((cat) => {
              let visual = null;
              if (cat.image) {
                visual = <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />;
              } else if (cat.logo) {
                visual = <img src={cat.logo} alt={cat.name} className="w-full h-full object-cover" />;
              } else if (cat.icon) {
                visual = <span className="text-4xl flex items-center justify-center w-full h-full">{cat.icon}</span>;
              } else if (categoryImages[cat.name]) {
                visual = <img src={categoryImages[cat.name]} alt={cat.name} className="w-full h-full object-cover" />;
              } else {
                visual = <img src={defaultImage} alt={cat.name} className="w-full h-full object-cover" />;
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
                    onClick={() => addToCart(product)}
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
                  onClick={() => addToCart(product)}
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

      {/* Bottom Cart Bar (Mobile Only, Shared, Fixed Bottom) */}
      <CartBar
        cart={cart}
        totalPrice={cartTotal}
        onCheckout={() => setIsCartOpen(true)}
        onDelete={() => { setCart([]); toast.success('Cart cleared!'); }}
        onViewMenu={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        buttonLabel="Checkout"
        className="!bottom-0"
      />

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
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Add some daily essentials to get started!</p>
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
    </div>
  );
};

export default DailyEssential; 
