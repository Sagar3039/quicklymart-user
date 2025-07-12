import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Briefcase, Clock, Star, Grid, List, Filter, Plus, Minus, Mic, Heart, History, Home, Play, LayoutGrid, LogOut, Package, Settings, User as UserIcon, MapPin, ChevronDown, Moon, Sun, X, Bolt, Leaf, Flame, Droplet, Percent, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/AuthModal';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import ProductQuickView from '@/components/ProductQuickView';
import Cart from '@/components/Cart';
import UniversalSearch from '@/components/UniversalSearch';
import { useCart } from '@/contexts/CartContext';
import { auth, db, retryOperation } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProductsByCategory, PRODUCT_CATEGORIES, getCategoriesByProductCategory, getTopBoughtProducts, checkAndInitializeProducts } from '@/lib/products';
import { addDoc, collection, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import LocationPicker from '@/components/LocationPicker';
import { useBanCheck } from '@/hooks/useBanCheck';

import CheckoutModal from '@/components/CheckoutModal';
import { useTheme } from '@/App';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSelectedAddress } from '@/App';
import CartBar from '@/components/CartBar';
import AddressSelectDialog from '@/components/AddressSelectDialog';
import { DesktopCarousels } from '@/components/DesktopCarousels';

const PickNGo = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { selectedAddress } = useSelectedAddress();
  const { cart, addToCart, updateCartQuantity, removeFromCart, clearCart, getTotalItems, getTotalPrice, isCartPopupOpen, setIsCartPopupOpen } = useCart();
  const { banStatus } = useBanCheck();
  const [activeBottomNav, setActiveBottomNav] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedLocation, setSelectedLocation] = useState('Fetching location...');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [showAgeModal, setShowAgeModal] = useState(false);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [showCartBar, setShowCartBar] = useState(true);

  const [foodItems, setFoodItems] = useState([]);
  const [drinkItems, setDrinkItems] = useState([]);
  const [essentialItems, setEssentialItems] = useState([]);

  const [foodCategories, setFoodCategories] = useState([]);
  const [essentialCategories, setEssentialCategories] = useState([]);

  const [topBuys, setTopBuys] = useState([]);

  const [showAddressDialog, setShowAddressDialog] = useState(false);

  // Add state for detected location
  const [detectedLocation, setDetectedLocation] = useState({ city: '', pincode: '', display: 'Fetching location...' });

  // Add state
  const [showUniversalSearch, setShowUniversalSearch] = useState(false);

  // Add state for checkout discount and promo
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromo, setCheckoutPromo] = useState(null);

  // Add state for Fast Delivery 'see all' toggle
  const [showAllFastDelivery, setShowAllFastDelivery] = useState(false);

  const popularCuisinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.FOOD);
      setFoodCategories(categories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEssentialCategories = async () => {
      const categories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.DAILY_ESSENTIAL);
      setEssentialCategories(categories);
    };
    fetchEssentialCategories();
  }, []);

  useEffect(() => {
    const fetchTopBuys = async () => {
      setTopBuys(await getTopBoughtProducts(4));
    };
    fetchTopBuys();
  }, []);

  // Function to truncate location
  const truncateLocation = (fullAddress) => {
    if (!fullAddress || fullAddress === 'Fetching location...' || fullAddress === 'Location not found' || fullAddress === 'Could not fetch location' || fullAddress === 'Location access denied' || fullAddress === 'Geolocation not supported') {
      return fullAddress;
    }
    
    // Split the address by commas
    const parts = fullAddress.split(',');
    
    // Take only the first 2-3 parts for a shorter display
    if (parts.length >= 3) {
      return parts.slice(0, 2).join(', ') + '...';
    } else if (parts.length === 2) {
      return parts[0] + '...';
    } else {
      // If it's already short, just truncate to 30 characters
      return fullAddress.length > 30 ? fullAddress.substring(0, 30) + '...' : fullAddress;
    }
  };

  // Function to get display location
  const getDisplayLocation = () => {
    if (selectedAddress) {
      return `${selectedAddress.city}, ${selectedAddress.state}`;
    }
    return truncateLocation(selectedLocation);
  };

  // Use only real DB data for Fast Delivery section
  const filteredProducts = foodItems.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrderNow = () => {
    toast.success('Redirecting to orders...');
  };

  const handleBuyOne = () => {
    toast.success('BUY one feature activated!');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleWineStoreClick = () => {
    setActiveBottomNav('wine');
    if (!isAgeVerified) {
      setShowAgeModal(true);
    } else {
      navigate('/drinks');
    }
  };
  
  const handleFoodClick = (category) => {
    console.log('handleFoodClick called with category:', category);
    setActiveBottomNav('food');
    navigate('/food', { state: { category } });
  };

  const handleDailyEssentialClick = () => {
    setActiveBottomNav('essentials');
    navigate('/daily-essential');
  };
  
  const handleReorderClick = () => {
    setActiveBottomNav('reorder');
    setIsCartOpen(true);
  };

  const placeOrder = async (orderDetails) => {
    const { address, paymentMethod, tip, location } = orderDetails; // Remove finalTotal from destructuring

    // Check if user is banned
    if (banStatus.isBanned) {
      toast.error('Your account has been suspended. You cannot place orders.');
      setIsCheckoutModalOpen(false);
      return;
    }

    if (!user) {
      toast.error("Please log in to place an order.");
      setIsAuthModalOpen(true);
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

    // Calculate delivery fee and GST breakdown
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal - (orderDetails.discountAmount || 0) > 299 ? 0 : 40;
    const gstRate = 5; // 5% GST
    const gstAmount = Math.round(((subtotal - (orderDetails.discountAmount || 0) + deliveryFee) * (gstRate / 100)));
    const finalTotal = Math.max(0, subtotal - (orderDetails.discountAmount || 0) + deliveryFee + gstAmount + (orderDetails.tip || 0));

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
      subtotal,
      deliveryFee,
      gstRate,
      gstAmount,
      discountAmount: orderDetails.discountAmount || 0,
      appliedPromo: orderDetails.appliedPromo || null,
      totalPrice: finalTotal,
      tip: orderDetails.tip || 0,
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
        setIsCheckoutModalOpen(false);
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

  const handleProductSelect = (product) => {
    // Navigate to appropriate page based on product category
    switch (product.category) {
      case 'food':
        navigate('/food');
        break;
      case 'drinks':
        navigate('/drinks');
        break;
      case 'daily_essential':
        navigate('/daily-essential');
        break;
      default:
        // Stay on current page
        break;
    }
    toast.success(`Selected ${product.name}`);
  };

  useEffect(() => {
    // Always prompt for user's location on every page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Log coordinates for debugging
          console.log('Detected coordinates:', { latitude, longitude });
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.display_name) {
              setSelectedLocation(data.display_name);
            } else {
              setSelectedLocation('Location not found');
            }
          } catch (error) {
            console.error('Error fetching location:', error);
            setSelectedLocation('Could not fetch location');
          }
        },
        (error) => {
          setSelectedLocation('Location access denied');
          // Log geolocation error for debugging
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true, // Request high accuracy every time
          timeout: 10000,
          maximumAge: 0 // Always get a fresh location
        }
      );
    } else {
      setSelectedLocation('Geolocation not supported');
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('pickngo-cart');
    if (savedCart) {
              // Cart is now managed by context, no need to load from localStorage here
    }

    // Check age verification status
    const ageVerified = localStorage.getItem('pickngo-age-verified');
    if (ageVerified) {
      setIsAgeVerified(true);
    }

    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('pickngo-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Check and initialize products if needed
      await checkAndInitializeProducts();
      
      setFoodItems(await getProductsByCategory('food'));
      setDrinkItems(await getProductsByCategory('Drinks'));
      setEssentialItems(await getProductsByCategory('Daily Essential'));
    };
    fetchProducts();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleProceedToCheckout = (discountAmount = 0, appliedPromo = null) => {
    if (!user) {
      toast.error('You must be logged in to place an order.');
      setIsAuthModalOpen(true);
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setCheckoutDiscount(discountAmount);
    setCheckoutPromo(appliedPromo);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location.address);
    setShowLocationPicker(false);
    toast.success('Location selected successfully!');
  };

  // Fetch current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || '';
            const pincode = data.address.postcode || '';
            setDetectedLocation({
              city,
              pincode,
              display: city && pincode ? `${city}, ${pincode}` : city || pincode || 'Location not found',
            });
          } catch (error) {
            setDetectedLocation({ city: '', pincode: '', display: 'Location not found' });
          }
        },
        (error) => {
          setDetectedLocation({ city: '', pincode: '', display: 'Location not found' });
        }
      );
    } else {
      setDetectedLocation({ city: '', pincode: '', display: 'Location not found' });
    }
  }, []);

  const cuisineItems = foodCategories.filter(cat => cat.subcategory !== 'all');

  // Helper to get min time from preparationTime or deliveryTime
  const getMinTime = (product) => {
    const timeStr = product.preparationTime || product.deliveryTime || '';
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  // Debug: log foodItems to check if products are being loaded from the DB
  console.log('foodItems:', foodItems);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>

      {/* --- Desktop Header --- */}
      <header className={`hidden md:block sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Location */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <img src="/logo.jpg" alt="PickNGo Logo" className="h-12 w-auto object-contain" />
              </div>
              
              {/* Location Bar */}
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div className="min-w-0">
                  <h3 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{detectedLocation.display}</h3>
                </div>
              </div>
            </div>
            
            {/* Center Section - Navigation */}
            <div className="flex items-center space-x-4 ml-auto pr-6">
              <Button variant="ghost" className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'} onClick={() => toast.info('Download our mobile app!')}>Download App</Button>
              <Button variant="ghost" className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'} onClick={() => navigate('/help-center')}>Help Center</Button>
              <Button variant="ghost" className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'} onClick={() => navigate('/about-us')}>About Us</Button>
            </div>
            
            {/* Right Section - Cart, Profile & Theme */}
            <div className="flex items-center space-x-3">
              {/* Cart Section */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex items-center space-x-2 relative ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`w-80 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shopping Cart</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTotalItems()} items</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                  
                  {cart.length === 0 ? (
                    <div className="p-4 text-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border-b border-gray-100 dark:border-gray-700">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yNCAzMkMyNi4yMDkxIDMyIDI4IDMwLjIwOTEgMjggMjhDMjggMjUuNzkwOSAyNi4yMDkxIDI0IDI0IDI0QzIxLjc5MDkgMjQgMjAgMjUuNzkwOSAyMCAyOEMyMCAzMC4yMDkxIDIxLjc5MDkgMzIgMjQgMzJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </h4>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="w-6 h-6 p-0"
                            >
                              -
                            </Button>
                            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {cart.length > 0 && (
                    <>
                      <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                          <span className={`text-lg font-bold text-orange-500`}>₹{getTotalPrice()}</span>
                        </div>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                          onClick={() => handleProceedToCheckout()}
                        >
                          Place Order
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Profile Section */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center space-x-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>{user?.displayName || user?.email?.split('@')[0] || 'My Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={`w-56 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className={`text-sm font-medium leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user?.displayName || user?.email || 'User'}
                        </p>
                        <p className={`text-xs leading-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/past-orders')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Past Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAddressDialog(true)} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Saved Address</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                    <DropdownMenuItem onClick={() => toast.info('Download our mobile app!')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <span>Download App</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/help-center')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <span>Help Center</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/about-us')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <span>About Us</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-full" onClick={() => setIsAuthModalOpen(true)}>Sign In</Button>
              )}
              
              {/* Theme Toggle */}
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
      
      {/* --- Mobile Header --- */}
      <header className={`md:hidden sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo & Location */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {/* New food tray with arrow logo for mobile navbar */}
                <img src="/food-tray-arrow.jpg" alt="PickNGo Delivery Logo" className="h-10 w-10 object-contain" style={{ minWidth: 36 }} />
                {/* Optionally keep the old logo for reference or remove the next line if not needed */}
                {/* <img src="/logo.jpg" alt="PickNGo Logo" className="h-10 w-auto object-contain" /> */}
              </div>
              {/* Location Bar */}
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <div className="min-w-0 flex-1">
                  <h3 className={`font-medium text-xs truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{detectedLocation.display}</h3>
                </div>
              </div>
            </div>
            
            {/* Right Section - Cart & Profile */}
            <div className="flex items-center space-x-2">
              {/* Cart Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`relative ${isDarkMode ? 'text-gray-300 hover:text-orange-400 bg-gray-700' : 'text-gray-600 hover:text-orange-500 bg-gray-100'} rounded-full w-10 h-10`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`w-72 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cart</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{getTotalItems()} items</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                  
                  {cart.length === 0 ? (
                    <div className="p-4 text-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border-b border-gray-100 dark:border-gray-700">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yNCAzMkMyNi4yMDkxIDMyIDI4IDMwLjIwOTEgMjggMjhDMjggMjUuNzkwOSAyNi4yMDkxIDI0IDI0IDI0QzIxLjc5MDkgMjQgMjAgMjUuNzkwOSAyMCAyOEMyMCAzMC4yMDkxIDIxLjc5MDkgMzIgMjQgMzJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </h4>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="w-5 h-5 p-0"
                            >
                              -
                            </Button>
                            <span className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {cart.length > 0 && (
                    <>
                      <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                          <span className={`text-lg font-bold text-orange-500`}>₹{getTotalPrice()}</span>
                        </div>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                          onClick={() => handleProceedToCheckout()}
                        >
                          Place Order
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Profile Button */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${isDarkMode ? 'text-gray-300 hover:text-orange-400 bg-gray-700' : 'text-gray-600 hover:text-orange-500 bg-gray-100'} rounded-full w-10 h-10`}
                    >
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className={`w-56 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className={`text-sm font-medium leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.displayName || user?.email || 'User'}</p>
                        <p className={`text-xs leading-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/past-orders')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Past Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAddressDialog(true)} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>Saved Address</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
                    <DropdownMenuItem onClick={() => toast.info('Download our mobile app!')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <span>Download App</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/help-center')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <span>Help Center</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/about-us')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <span>About Us</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isDarkMode ? 'text-gray-300 hover:text-orange-400 bg-gray-700' : 'text-gray-600 hover:text-orange-500 bg-gray-100'} rounded-full w-10 h-10`}
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <UserIcon className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        {/* --- Mobile View (Restored) --- */}
        <div className="md:hidden">
          {/* Hero Gradient Section */}
          <div className="relative w-full min-h-[340px] bg-gradient-to-br from-pickngo-orange-500 via-pickngo-red-400 to-pickngo-red-500 rounded-b-3xl pb-6">
            {/* Free Delivery Pill */}
            <div className="flex justify-center pt-4">
              <span className="bg-pickngo-orange-100 text-pickngo-orange-700 text-xs font-semibold px-4 py-1 rounded-full shadow">🚚 Free delivery on orders over $25</span>
            </div>
            {/* Main Heading */}
            <div className="flex flex-col items-center text-center mt-4 px-4">
              <h1 className="text-2xl font-bold text-white leading-tight mb-1">Everything You Need<br /> <span className="text-pickngo-orange-200">Delivered Fast</span></h1>
              <p className="text-white/90 text-sm mb-4">From fresh groceries to hot meals - get it all in minutes</p>
            </div>
            {/* Category Pills */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap px-4">
              <span className="bg-pickngo-orange-400 text-white text-xs font-semibold px-3 py-1 rounded-full">Groceries</span>
              <span className="bg-pickngo-red-400 text-white text-xs font-semibold px-3 py-1 rounded-full">Restaurants</span>
              <span className="bg-pickngo-red-200 text-white text-xs font-semibold px-3 py-1 rounded-full">Alcohol</span>
            </div>
            {/* Delivering To Card */}
            <div className="mx-4 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">Delivering to</span>
                  <span className="text-xs font-bold text-gray-900">
                    {selectedAddress
                      ? `${(selectedAddress.label || selectedAddress.type || 'ADDRESS').toUpperCase()}${selectedAddress.pincode ? ', ' + selectedAddress.pincode : ''}`
                      : detectedLocation.display}
                  </span>
                </div>
                <button className="text-xs text-purple-600 font-semibold" onClick={() => setShowAddressDialog(true)}>Change</button>
              </div>
              <div className="w-full">
                <UniversalSearch 
                  onProductSelect={handleProductSelect}
                  onAddToCart={addToCart}
                  cart={cart}
                />
              </div>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 bg-orange-50 rounded-xl flex flex-col items-center py-2">
                  <Bolt className="w-5 h-5 text-orange-400 mb-1" />
                  <span className="text-xs font-bold text-orange-700">10min Delivery</span>
                  <span className="text-[10px] text-orange-400">Express</span>
                </div>
                <div className="flex-1 bg-green-50 rounded-xl flex flex-col items-center py-2">
                  <Leaf className="w-5 h-5 text-green-500 mb-1" />
                  <span className="text-xs font-bold text-green-700">Fresh Grocery</span>
                  <span className="text-[10px] text-green-500">Farm to door</span>
                </div>
                <div className="flex-1 bg-yellow-50 rounded-xl flex flex-col items-center py-2">
                  <Flame className="w-5 h-5 text-yellow-500 mb-1" />
                  <span className="text-xs font-bold text-yellow-700">Hot Food</span>
                  <span className="text-[10px] text-yellow-500">Ready now</span>
                </div>
              </div>
            </div>
          </div>
          {/* Popular Cuisines (Mobile Only, now immediately after Hero) */}
          <div className="mx-4 mt-8 md:hidden">
            <h2 className="text-lg font-bold text-pickngo-orange-700 mb-4">Popular Cuisines</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar" ref={popularCuisinesRef}>
              {cuisineItems.map((category, index) => (
                <button
                  key={category.id + '-' + index}
                  className="flex flex-col items-center min-w-[90px] w-24 bg-pickngo-orange-50 rounded-full py-3 px-2 focus:outline-none"
                  onClick={() => handleFoodClick(category.subcategory)}
                >
                  <div className="w-16 h-16 rounded-full bg-pickngo-orange-100 flex items-center justify-center mb-1 overflow-hidden">
                    {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('data:')) ? (
                      <img src={category.icon} alt={category.displayName || category.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{category.icon}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-900 mt-1 truncate w-full text-center dark:text-white">{category.displayName || category.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Trending Now */}
          <div className="mx-2 mt-6 rounded-2xl p-4 bg-gradient-to-br from-pickngo-orange-400 via-pickngo-red-400 to-pickngo-red-500 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-white flex items-center gap-1"><Bolt className="w-4 h-4 text-yellow-300" />Trending Now</span>
              <span className="text-xs text-yellow-200 font-bold">Hot <span className="ml-1">🔥</span></span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const uniqueTrending = Array.from(
                  new Map(
                    topBuys
                      .filter(product => (product.category || '').toLowerCase() !== 'drinks')
                      .map(product => [`${(product.name || '').toLowerCase()}|${(product.category || '').toLowerCase()}`, product])
                  ).values()
                );
                const fallbackTrending = [
                  { name: 'Pizza', image: 'https://img.icons8.com/color/48/000000/pizza.png', hike: '+12%' },
                  { name: 'Fresh Fruits', image: 'https://img.icons8.com/color/48/000000/apple.png', hike: '+18%' },
                  { name: 'Dairy Products', image: 'https://img.icons8.com/color/48/000000/milk-bottle.png', hike: '+25%' },
                  { name: 'Coffee', image: 'https://img.icons8.com/color/48/000000/coffee.png', hike: '+22%' },
                ];
                const cards = uniqueTrending.slice(0, 4);
                while (cards.length < 4) {
                  const fallback = fallbackTrending[cards.length];
                  cards.push({
                    id: `fallback-${cards.length}`,
                    name: fallback.name,
                    image: fallback.image,
                    hike: fallback.hike,
                  });
                }
                return cards.map((product, idx) => (
                  <div key={product.id || product.name || idx} className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold text-white">
                    <img src={product.image} alt={product.name} className="w-6 h-6 rounded object-cover" />
                    <span className="truncate">{product.name}</span>
                    <span className="ml-auto text-green-200 font-bold">{product.hike || `+${18 + (idx * 3)}%`}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
          {/* Stats Row */}
          <div className="mx-4 mt-4 flex justify-between gap-2">
            <div className="flex-1 bg-white rounded-xl shadow flex flex-col items-center py-3">
              <span className="text-lg font-bold text-pickngo-orange-500">500+</span>
              <span className="text-[11px] text-pickngo-orange-700 font-semibold">Stores</span>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow flex flex-col items-center py-3">
              <span className="text-lg font-bold text-pickngo-orange-500">15 min</span>
              <span className="text-[11px] text-pickngo-orange-700 font-semibold">Avg Delivery</span>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow flex flex-col items-center py-3">
              <span className="text-lg font-bold text-pickngo-orange-500">4.8</span>
              <span className="text-[11px] text-pickngo-orange-700 font-semibold">Rating</span>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow flex flex-col items-center py-3">
              <span className="text-lg font-bold text-pickngo-orange-500">24/7</span>
              <span className="text-[11px] text-pickngo-orange-700 font-semibold">Available</span>
            </div>
          </div>
          {/* Feature Cards Row */}
          <div className="mx-4 mt-8">
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-pickngo-orange-100 text-pickngo-orange-800 rounded-2xl p-6 flex flex-col items-start shadow min-h-[90px]">
                <span className="text-2xl mb-2">🍽️</span>
                <span className="font-bold text-base">FEAST MODE</span>
                <span className="text-xs opacity-80 mt-1">65% OFF Every 30 Mins</span>
              </button>
              <button className="bg-pickngo-red-100 text-pickngo-red-700 rounded-2xl p-6 flex flex-col items-start shadow min-h-[90px]">
                <span className="text-2xl mb-2">⚡</span>
                <span className="font-bold text-base">FLASH DEALS</span>
                <span className="text-xs opacity-80 mt-1">Dishes From ₹49</span>
              </button>
              <button className="bg-pickngo-orange-50 text-pickngo-orange-700 rounded-2xl p-6 flex flex-col items-start shadow min-h-[90px]">
                <span className="text-2xl mb-2">%</span>
                <span className="font-bold text-base">DISCOUNTS</span>
                <span className="text-xs opacity-80 mt-1">Up To 60% OFF</span>
              </button>
              <button className="bg-pickngo-red-50 text-pickngo-red-700 rounded-2xl p-6 flex flex-col items-start shadow min-h-[90px]">
                <span className="text-2xl mb-2">⚡</span>
                <span className="font-bold text-base">Bolt</span>
                <span className="text-xs opacity-80 mt-1">Food In 10 Mins</span>
              </button>
            </div>
          </div>
          {/* Fast Delivery Section (Mobile Only) */}
          <div className="mx-4 mt-10 md:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Fast delivery</h2>
              {filteredProducts.length > 4 && (
                <button
                  className="text-xs text-blue-600 font-semibold"
                  onClick={() => setShowAllFastDelivery((v) => !v)}
                >
                  {showAllFastDelivery ? 'Show less' : 'See all'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts
                .slice() // copy
                .sort((a, b) => getMinTime(a) - getMinTime(b))
                .slice(0, showAllFastDelivery ? filteredProducts.length : 4)
                .map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 min-h-[110px]">
                    <img src={product.image} alt={product.name} className="w-full h-24 rounded-xl object-cover mb-2" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 font-semibold">₹{product.price} for two</span>
                          <button className="p-1 rounded-full hover:bg-gray-100"><Heart className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        <div className="font-bold text-base text-gray-900 mt-2 truncate">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate mt-1">{product.category}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center text-xs text-green-600 font-bold"><Star className="w-3 h-3 mr-0.5" />{product.rating}</span>
                        <span className="text-xs text-gray-400">• {product.deliveryTime}</span>
                      </div>
                    </div>
                    <button
                      className="mt-2 w-full bg-pickngo-orange-500 hover:bg-pickngo-orange-600 text-white font-bold py-1.5 rounded-full text-sm transition"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {/* --- Desktop Hero Section --- */}
        <div className={`hidden md:block py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}> 
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Your daily essentials, delivered in minutes.</h2>
            {selectedAddress ? (
              <div className="mb-4">
                <Badge className="bg-orange-100 text-orange-700 px-4 py-2 text-sm">
                  🎯 Delivering to: {selectedAddress.city || ''}{selectedAddress.city && selectedAddress.state ? ', ' : ''}{selectedAddress.state || ''}{(selectedAddress.city || selectedAddress.state) && selectedAddress.pincode ? ', ' : ''}{selectedAddress.pincode || ''}
                </Badge>
              </div>
            ) : (
              detectedLocation.city || detectedLocation.pincode ? (
                <div className="mb-4">
                  <Badge className="bg-orange-100 text-orange-700 px-4 py-2 text-sm">
                    🎯 Delivering to: {detectedLocation.city}{detectedLocation.city && detectedLocation.pincode ? ', ' : ''}{detectedLocation.pincode}
                  </Badge>
                </div>
              ) : (
                <div className="mb-4">
                  <Badge className="bg-orange-100 text-orange-700 px-4 py-2 text-sm">
                    🎯 Delivering to: Not selected
                  </Badge>
                </div>
              )
            )}
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order food, groceries, and more from the best places near you.</p>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <UniversalSearch 
                  isOpen={true}
                  onClose={() => {}}
                  onProductSelect={handleProductSelect}
                  onAddToCart={addToCart}
                  cart={cart}
                />
              </div>
            </div>
            {/* --- Desktop Category Cards Section (3 cards) --- */}
            <div className="flex justify-center gap-8 mt-12">
              {/* 10min Delivery Card */}
              <div className="flex-1 max-w-xs bg-orange-50 rounded-2xl shadow p-8 flex flex-col items-center">
                <Bolt className="w-10 h-10 text-orange-400 mb-2" />
                <span className="text-xl font-bold text-orange-700 mb-1">10min Delivery</span>
                <span className="text-sm text-orange-400">Express</span>
              </div>
              {/* Fresh Grocery Card */}
              <div className="flex-1 max-w-xs bg-green-50 rounded-2xl shadow p-8 flex flex-col items-center">
                <Leaf className="w-10 h-10 text-green-500 mb-2" />
                <span className="text-xl font-bold text-green-700 mb-1">Fresh Grocery</span>
                <span className="text-sm text-green-500">Farm to door</span>
              </div>
              {/* Hot Food Card */}
              <div className="flex-1 max-w-xs bg-yellow-50 rounded-2xl shadow p-8 flex flex-col items-center">
                <Flame className="w-10 h-10 text-yellow-500 mb-2" />
                <span className="text-xl font-bold text-yellow-700 mb-1">Hot Food</span>
                <span className="text-sm text-yellow-500">Ready now</span>
              </div>
            </div>
            {/* --- Desktop Popular Cuisines Section --- */}
            <div className="hidden md:flex flex-col items-center mt-12 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Cuisines</h2>
              <div className="flex gap-6 overflow-x-auto hide-scrollbar w-full max-w-4xl justify-center pb-2">
                {cuisineItems.map((category, index) => (
                  <button
                    key={category.id + '-' + index}
                    className="flex flex-col items-center min-w-[110px] w-28 bg-gray-50 rounded-full py-4 px-3 focus:outline-none"
                    onClick={() => handleFoodClick(category.subcategory)}
                  >
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2 overflow-hidden">
                      {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('data:')) ? (
                        <img src={category.icon} alt={category.displayName || category.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">{category.icon}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 mt-1 truncate w-full text-center">{category.displayName || category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* --- Desktop Large Cards Section (Food Delivery, Instamart, Dineout & Drinks) --- */}
            <div className="flex justify-center gap-8 mt-12">
              {/* Food Delivery Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1 max-w-sm flex flex-col">
                <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" alt="Food Delivery" className="w-full h-56 object-cover" />
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Food Delivery</h3>
                  <p className="text-gray-600 mb-6 flex-1">From the best local restaurants</p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full self-start" onClick={() => navigate('/food')}>Order Now</button>
                </div>
              </div>
              {/* Instamart Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1 max-w-sm flex flex-col">
                <img src="https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800" alt="Instamart" className="w-full h-56 object-cover" />
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Instamart</h3>
                  <p className="text-gray-600 mb-6 flex-1">Instant Grocery Delivery</p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full self-start" onClick={() => navigate('/daily-essential')}>Shop Now</button>
                </div>
              </div>
              {/* Dineout & Drinks Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex-1 max-w-sm flex flex-col">
                <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" alt="Dineout & Drinks" className="w-full h-56 object-cover" />
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Dineout & Drinks</h3>
                  <p className="text-gray-600 mb-6 flex-1">Eat out or get drinks delivered</p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full self-start" onClick={handleWineStoreClick}>Explore Now</button>
                </div>
              </div>
            </div>
            {/* --- Trending Now Section (Desktop) --- */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2"><Bolt className="w-6 h-6 text-yellow-400" />Trending Now</span>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {(() => {
                  const uniqueTrending = Array.from(
                    new Map(
                      topBuys
                        .filter(product => (product.category || '').toLowerCase() !== 'drinks')
                        .map(product => [`${(product.name || '').toLowerCase()}|${(product.category || '').toLowerCase()}`, product])
                    ).values()
                  );
                  const fallbackTrending = [
                    { name: 'Pizza', image: 'https://img.icons8.com/color/48/000000/pizza.png', hike: '+12%' },
                    { name: 'Fresh Fruits', image: 'https://img.icons8.com/color/48/000000/apple.png', hike: '+18%' },
                    { name: 'Dairy Products', image: 'https://img.icons8.com/color/48/000000/milk-bottle.png', hike: '+25%' },
                    { name: 'Coffee', image: 'https://img.icons8.com/color/48/000000/coffee.png', hike: '+22%' },
                  ];
                  const cards = uniqueTrending.slice(0, 4);
                  while (cards.length < 4) {
                    const fallback = fallbackTrending[cards.length];
                    cards.push({
                      id: `fallback-${cards.length}`,
                      name: fallback.name,
                      image: fallback.image,
                      hike: fallback.hike,
                    });
                  }
                  return cards.map((product, idx) => (
                    <div key={product.id || product.name || idx} className="bg-white rounded-2xl px-6 py-6 flex flex-col items-center gap-2 shadow">
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                      <span className="font-semibold text-base text-gray-900 dark:text-white">{product.name}</span>
                      <span className="text-green-600 font-bold">{product.hike || `+${18 + (idx * 3)}%`}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
        {/* --- Desktop Food Categories Carousel --- */}
        {/* (Remove the old 'What's on your mind?' section) */}
       
        {/* --- Desktop Food & Grocery Categories Carousels --- */}
        <DesktopCarousels />
      </main>

      {/* Bottom Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t z-50 ${isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className={`grid ${isLoggedIn ? 'grid-cols-4' : 'grid-cols-3'} h-16`}>
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'food' ? 'text-pickngo-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => handleFoodClick('all')}
          >
            <span className="text-2xl">🥪</span>
            <span className="text-xs font-medium">Food</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'essentials' ? 'text-pickngo-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={handleDailyEssentialClick}
          >
            <span className="text-2xl">🛒</span>
            <span className="text-xs font-medium">Daily Essential</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'wine' ? 'text-pickngo-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={handleWineStoreClick}
          >
            <span className="text-2xl">🍷</span>
            <span className="text-xs font-medium">Wine Stores</span>
          </button>
          {isLoggedIn && (
            <button 
              className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'reorder' ? 'text-pickngo-orange-500' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => navigate('/past-orders')}
            >
              <History className="w-6 h-6" />
              <span className="text-xs font-medium">Reorder</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Cart Bar (Mobile Only, Shared, Floating Above Nav) */}
      <CartBar
        cart={cart}
        totalPrice={getTotalPrice()}
        onCheckout={() => setIsCartOpen(true)}
        onDelete={() => clearCart()}
        onViewMenu={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        buttonLabel="Checkout"
        className="bottom-16"
      />

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={() => setIsLoggedIn(true)} />
      
      <AgeVerificationModal 
        isOpen={showAgeModal}
        onVerified={() => {
          setIsAgeVerified(true);
          localStorage.setItem('pickngo-age-verified', 'true');
          setShowAgeModal(false);
          navigate('/drinks');
          toast.success('Age verified! Welcome to wine stores.');
        }}
        onClose={() => setShowAgeModal(false)}
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
        onProceedToCheckout={({ discountAmount, appliedPromo }) => {
          setCheckoutDiscount(discountAmount || 0);
          setCheckoutPromo(appliedPromo || null);
          setIsCartOpen(false);
          setIsCheckoutModalOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onPlaceOrder={placeOrder}
        totalPrice={getTotalPrice()}
        user={user}
        discountAmount={checkoutDiscount}
        appliedPromo={checkoutPromo}
      />

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} mt-20`}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">PickNGo</h3>
              </div>
              <p className={`text-sm text-gray-600 dark:text-gray-300`}>
                Your trusted partner for quick food delivery, grocery shopping, and daily essentials.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-pickngo-orange-500">Quick Links</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => handleFoodClick('all')}>Food Delivery</Button></li>
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={handleDailyEssentialClick}>Grocery Delivery</Button></li>
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={handleWineStoreClick}>Wine & Drinks</Button></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-pickngo-orange-500">Support</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => navigate('/help-center')}>Help Center</Button></li>
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => navigate('/contact-us')}>Contact Us</Button></li>
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => navigate('/track-order')}>Track Order</Button></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-pickngo-orange-500">Company</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => navigate('/about-us')}>About Us</Button></li>
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => navigate('/careers')}>Careers</Button></li>
                <li><Button variant="ghost" className={`${isDarkMode ? 'text-gray-300 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'} p-0 h-auto justify-start`} onClick={() => navigate('/privacy-policy')}>Privacy Policy</Button></li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Footer */}
        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-300'}`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>© 2024 PickNGo. All rights reserved.</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>•</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Made with ❤️ in India</span>
              </div>
              <div className="flex items-center space-x-6">
                <Button variant="ghost" size="sm" className={`${isDarkMode ? 'text-gray-400 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'}`} onClick={() => toast.info('Download our mobile app!')}>
                  Download App
                </Button>
                <Button variant="ghost" size="sm" className={`${isDarkMode ? 'text-gray-400 hover:text-pickngo-orange-500' : 'text-gray-600 hover:text-pickngo-orange-500'}`} onClick={() => toast.info('Newsletter subscription coming soon!')}>
                  Newsletter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* Location Picker */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
      />
      <AddressSelectDialog
        isOpen={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        userId={user?.uid || null}
      />
    </div>
  );
};

export default PickNGo;