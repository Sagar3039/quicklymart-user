import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Briefcase, Clock, Star, Grid, List, Filter, Plus, Minus, Mic, Heart, History, Home, Play, LayoutGrid, LogOut, Package, Settings, User as UserIcon, MapPin, ChevronDown, Moon, Sun } from 'lucide-react';
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
import { initializeProducts, getProductsByCategory } from '@/lib/products';
import { addDoc, collection } from 'firebase/firestore';
import { Toaster } from '@/components/ui/sonner';
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

const foodPageCategories = [
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&h=400&fit=crop&crop=center' },
    { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&crop=center' },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Pizzas', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Indian', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center' },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&crop=center' },
];

const groceryCategories = [
    { name: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&crop=center' },
    { name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Dairy, Bread & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center' },
    { name: 'Rice, Atta & Dals', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Masalas & Dry Fruits', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop&crop=center' },
    { name: 'Oils & Ghee', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center' },
    { name: 'Munchies', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&crop=center' },
]

const QuicklyMart = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { selectedAddress } = useSelectedAddress();
  const [activeBottomNav, setActiveBottomNav] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedLocation, setSelectedLocation] = useState('Fetching location...');
  const [cart, setCart] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [isUniversalSearchOpen, setIsUniversalSearchOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const [foodItems, setFoodItems] = useState([]);
  const [drinkItems, setDrinkItems] = useState([]);
  const [essentialItems, setEssentialItems] = useState([]);

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

  // Sample product data to match the image
  const products = {
    fast_delivery: (() => {
      if (selectedAddress) {
        const city = selectedAddress.city?.toLowerCase();
        if (city?.includes('mumbai')) {
          return [
            { id: 5, name: "Pizza Hut", price: 120, rating: 4.6, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', category: 'Pizzas', inStock: true, deliveryTime: '25-30 mins', ad: true },
            { id: 6, name: 'Bombay Spice', price: 150, rating: 4.4, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Indian', inStock: true, deliveryTime: '20-25 mins', discount: '50% OFF' },
            { id: 7, name: 'Mumbai Chinese', price: 200, rating: 4.2, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', category: 'Chinese', inStock: true, deliveryTime: '18-22 mins', offer: 'BUY1 GET1' },
          ];
        } else if (city?.includes('delhi')) {
          return [
            { id: 5, name: "Domino's Delhi", price: 110, rating: 4.5, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', category: 'Pizzas', inStock: true, deliveryTime: '22-28 mins', ad: true },
            { id: 6, name: 'Delhi Darbar', price: 140, rating: 4.3, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Indian', inStock: true, deliveryTime: '18-23 mins', discount: '40% OFF' },
            { id: 7, name: 'Beijing Express', price: 180, rating: 4.1, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', category: 'Chinese', inStock: true, deliveryTime: '20-25 mins', offer: 'BUY1 GET1' },
          ];
        } else if (city?.includes('bangalore')) {
          return [
            { id: 5, name: "Pizza Corner", price: 130, rating: 4.7, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', category: 'Pizzas', inStock: true, deliveryTime: '20-25 mins', ad: true },
            { id: 6, name: 'Bangalore Spice', price: 160, rating: 4.4, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Indian', inStock: true, deliveryTime: '15-20 mins', discount: '60% OFF' },
            { id: 7, name: 'Tech Chinese', price: 190, rating: 4.2, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', category: 'Chinese', inStock: true, deliveryTime: '18-22 mins', offer: 'BUY1 GET1' },
          ];
        }
      }
      
      return [
        { id: 5, name: "Domino's Pizza", price: 91, rating: 4.5, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', category: 'Pizzas', inStock: true, deliveryTime: '20-25 mins', ad: true },
        { id: 6, name: 'Spice N Ice', price: 130, rating: 4.3, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Indian', inStock: true, deliveryTime: '20-25 mins', discount: '60% OFF' },
        { id: 7, name: 'China Nation', price: 180, rating: 4.1, image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400', category: 'Chinese', inStock: true, deliveryTime: '15-20 mins', offer: 'BUY1 GET1' },
      ];
    })(),
  };

  const serviceCategories = [
    { name: 'FEAST MODE', subtitle: '65% OFF Every 30 Mins', icon: '🍽️', color: 'bg-blue-900/50' },
    { name: 'FLASH DEALS', subtitle: 'Dishes From ₹49', icon: '⚡', color: 'bg-blue-900/50' },
    { name: 'DISCOUNTS', subtitle: 'Up To 60% OFF', icon: '%', color: 'bg-blue-900/50' },
    { name: 'Bolt', subtitle: 'Food In 10 Mins', icon: '⚡', color: 'bg-blue-900/50' },
  ];

  const filteredProducts = products.fast_delivery.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
    } else {
        return [...prevCart, { ...product, quantity: 1 }];
    }
    });
    toast.success(`${product.name} added to cart!`);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
    const { address, paymentMethod, tip, finalTotal } = orderDetails;

    if (!user) {
      toast.error("Please log in to place an order.");
      setIsAuthModalOpen(true);
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

  const handleUniversalSearchOpen = () => {
    setIsUniversalSearchOpen(true);
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
    // Fetch user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
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
        () => {
          setSelectedLocation('Location access denied');
        }
      );
    } else {
      setSelectedLocation('Geolocation not supported');
    }

    // Initialize products in Firestore
    initializeProducts();

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

    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('quicklymart-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchProducts = async () => {
      setFoodItems(await getProductsByCategory('Food'));
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

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('You must be logged in to place an order.');
      setIsAuthModalOpen(true);
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <Toaster position="top-right" />
      {/* --- Desktop Header --- */}
      <header className="hidden md:block sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2" onClick={() => navigate('/')} role="button">
              <img src="/favicon.ico" alt="QuicklyMart Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-quicklymart-orange-500">QuicklyMart</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost">For Business</Button>
              <Button variant="ghost">Help</Button>
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>{user?.displayName || user?.email?.split('@')[0] || 'My Account'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.displayName || user?.email || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/past-orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Past Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold px-6 py-2 rounded-full" onClick={() => setIsAuthModalOpen(true)}>Sign In</Button>
              )}
               <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* --- Mobile Header --- */}
      <header className="md:hidden sticky top-0 z-50 bg-indigo-900/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-left h-auto p-1 rounded-md max-w-[200px] sm:max-w-[250px]"
                onClick={() => navigate('/address')}
              >
                <MapPin className="w-6 h-6 flex-shrink-0 text-white" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-white font-bold text-lg truncate">Your Location</h1>
                  <p className="text-gray-300 text-xs truncate">{getDisplayLocation()}</p>
                </div>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-gray-800/50 rounded-full w-10 h-10"
                onClick={() => setIsCartOpen(true)}
              >
               <ShoppingCart className="w-5 h-5" />
               {getTotalItems() > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-1" variant="destructive">{getTotalItems()}</Badge>}
              </Button>
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white bg-gray-800/50 rounded-full w-10 h-10"
                    >
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.displayName || user?.email || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/past-orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Past Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-gray-800/50 rounded-full w-10 h-10"
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
        {/* --- Desktop Hero Section --- */}
        <div className="hidden md:block bg-gray-100 dark:bg-gray-800 py-16">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4 text-quicklymart-orange-500">Your daily essentials, delivered in minutes.</h2>
                {selectedAddress && (
                  <div className="mb-4">
                    <Badge className="bg-quicklymart-orange-100 text-quicklymart-orange-700 px-4 py-2 text-sm">
                      🎯 Delivering to: {selectedAddress.city}, {selectedAddress.state}
                    </Badge>
                  </div>
                )}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Order food, groceries, and more from the best places near you.</p>
                 <div className="flex gap-3 max-w-2xl mx-auto">
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                        placeholder="Enter your delivery location"
                        value={getDisplayLocation()}
                        readOnly
                        onClick={() => navigate('/address')}
                        className="pl-12 pr-4 h-14 text-lg bg-white dark:bg-gray-700"
                        />
                    </div>
                    <Button size="lg" className="h-14 bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold" onClick={handleUniversalSearchOpen}>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                    </Button>
                </div>
            </div>
        </div>

        {/* --- Mobile Search & Banners --- */}
        <div className="md:hidden">
      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
                  placeholder="Search for 'Gift Hamp...'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-white/10 backdrop-blur-md rounded-xl text-lg text-white placeholder-gray-400"
                  onFocus={handleUniversalSearchOpen}
            />
            <Button 
              variant="ghost" 
              size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-quicklymart-orange-500"
              onClick={() => toast.success('Voice search activated!')}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="container mx-auto px-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Foodie Weekend💰</h2>
              <p className="text-lg mb-4">Upto 60% OFF on delights!</p>
              <Button 
                    className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold px-6 py-2 rounded-full"
                onClick={handleOrderNow}
              >
                ORDER NOW
              </Button>
            </div>
            <div className="flex space-x-4">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150" alt="Food" className="w-20 h-20 rounded-full object-cover" />
                  <img src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=150" alt="Dessert" className="w-20 h-20 rounded-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Desktop Main Feature Cards --- */}
        <div className="hidden md:block container mx-auto py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Food Delivery Card */}
                <Card className="overflow-hidden cursor-pointer group" onClick={() => handleFoodClick('all')}>
                    <CardHeader className="p-0">
                        <img src="https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?w=400" alt="Food Delivery" className="w-full h-56 object-cover" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2">Food Delivery</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">From the best local restaurants</p>
                        <Button className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold px-6 py-2 rounded-full">
                            Order Now
                        </Button>
                    </CardContent>
                </Card>

                {/* Instamart / Daily Essentials Card */}
                 <Card className="overflow-hidden cursor-pointer group" onClick={handleDailyEssentialClick}>
                    <CardHeader className="p-0">
                        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500" alt="Groceries" className="w-full h-56 object-cover" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2">Instamart</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Instant Grocery Delivery</p>
                         <Button className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold px-6 py-2 rounded-full">
                            Shop Now
                        </Button>
                    </CardContent>
                </Card>

                {/* Dineout / Drinks Card */}
                 <Card className="overflow-hidden cursor-pointer group" onClick={handleWineStoreClick}>
                    <CardHeader className="p-0">
                        <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500" alt="Dineout" className="w-full h-56 object-cover" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2">Dineout & Drinks</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Eat out or get drinks delivered</p>
                        <Button className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold px-6 py-2 rounded-full">
                            Explore Now
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* --- Desktop Food Categories Carousel --- */}
        <div className="hidden md:block container mx-auto py-12">
            <h2 className="text-3xl font-bold mb-6">What's on your mind?</h2>
            <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                    {foodPageCategories.map((category, index) => (
                        <CarouselItem key={index} className="basis-auto">
                            <div className="text-center cursor-pointer" onClick={() => handleFoodClick(category.name)}>
                                <img src={category.image} alt={category.name} className="w-36 h-36 object-cover rounded-full mx-auto" />
                                <p className="mt-2 font-semibold">{category.name}</p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>

        {/* --- Desktop Grocery Categories Carousel --- */}
        <div className="hidden md:block container mx-auto py-12">
            <h2 className="text-3xl font-bold mb-6">Shop groceries on Instamart</h2>
             <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                    {groceryCategories.map((category, index) => (
                        <CarouselItem key={index} className="basis-auto">
                            <Card className="overflow-hidden cursor-pointer group" onClick={handleDailyEssentialClick}>
                                <CardContent className="p-0">
                                    <img src={category.image} alt={category.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="p-4">
                                        <p className="font-semibold text-center">{category.name}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
      </div>

        {/* --- Mobile Content --- */}
        <div className="md:hidden">
      <div className="container mx-auto px-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {serviceCategories.map((service, index) => (
            <button
              key={index}
                    className={`${service.color} backdrop-blur-md rounded-2xl p-4 text-white relative overflow-hidden hover:opacity-90 transition-opacity`}
              onClick={() => toast.success(`${service.name} activated!`)}
            >
              <div className="text-2xl mb-2">{service.icon}</div>
              <h3 className="font-bold text-sm mb-1">{service.name}</h3>
              <p className="text-xs opacity-90">{service.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 mb-6">
        <div className="bg-gradient-to-r from-red-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-xl font-bold">Bolt | Dinner in 10 mins</h3>
              </div>
              <p className="mb-4">Fresh, hot & crisp delights for you.</p>
              <Button 
                        className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-white font-bold px-6 py-2 rounded-full"
                onClick={handleOrderNow}
              >
                ORDER NOW
              </Button>
            </div>
            <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200" alt="Food Bowl" className="w-32 h-32 rounded-full object-cover" />
          </div>
        </div>
      </div>

            <div className="container mx-auto px-4 mb-20">
        <h2 className="text-white text-2xl font-bold mb-4">Fast delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
                    className="relative overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow text-white border-gray-700"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="ghost" 
                        size="icon"
                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Added to wishlist!');
                  }}
                >
                  <Heart className="w-4 h-4" />
                </Button>
                {product.discount && (
                        <div className="absolute top-3 left-3 bg-quicklymart-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}
                  </div>
                )}
                {product.offer && (
                  <div className="absolute bottom-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.offer}
                  </div>
                )}
                        {product.ad && (
                <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 rounded text-sm">
                  ITEMS AT ₹{product.price}
                </div>
                        )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-green-500 text-green-500" />
                            <span className="font-medium text-sm text-gray-300">{product.rating}</span>
                  </div>
                        <span className="text-gray-400 text-sm">• {product.deliveryTime}</span>
                </div>
                        <p className="text-gray-300 text-sm">{product.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-700 z-50">
        <div className={`grid ${isLoggedIn ? 'grid-cols-4' : 'grid-cols-3'} h-16`}>
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'food' ? 'text-quicklymart-orange-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => handleFoodClick('Biryani')}
          >
            <span className="text-2xl">🍜</span>
            <span className="text-xs font-medium">Food</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'essentials' ? 'text-quicklymart-orange-500' : 'text-gray-400 hover:text-white'}`}
            onClick={handleDailyEssentialClick}
          >
            <span className="text-2xl">🛒</span>
            <span className="text-xs font-medium">Daily Essential</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'wine' ? 'text-quicklymart-orange-500' : 'text-gray-400 hover:text-white'}`}
            onClick={handleWineStoreClick}
          >
            <span className="text-2xl">🍷</span>
            <span className="text-xs font-medium">Wine Stores</span>
          </button>
          {isLoggedIn && (
            <button 
              className={`flex flex-col items-center justify-center space-y-1 ${activeBottomNav === 'reorder' ? 'text-quicklymart-orange-500' : 'text-gray-400 hover:text-white'}`}
              onClick={handleReorderClick}
            >
              <History className="w-6 h-6" />
              <span className="text-xs font-medium">Reorder</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={() => setIsLoggedIn(true)} />
      
      <AgeVerificationModal 
        isOpen={showAgeModal}
        onVerified={() => {
          setIsAgeVerified(true);
          localStorage.setItem('quicklymart-age-verified', 'true');
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
        onProceedToCheckout={handleProceedToCheckout}
      />

      <UniversalSearch 
        isOpen={isUniversalSearchOpen}
        onClose={() => setIsUniversalSearchOpen(false)}
        onProductSelect={handleProductSelect}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onPlaceOrder={placeOrder}
        totalPrice={getTotalPrice()}
        user={user}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img src="/favicon.ico" alt="QuicklyMart Logo" className="w-8 h-8" />
                <h3 className="text-2xl font-bold text-quicklymart-orange-500">QuicklyMart</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Your trusted partner for quick food delivery, grocery shopping, and daily essentials.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-quicklymart-orange-500">Quick Links</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => handleFoodClick('all')}>Food Delivery</Button></li>
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={handleDailyEssentialClick}>Grocery Delivery</Button></li>
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={handleWineStoreClick}>Wine & Drinks</Button></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-quicklymart-orange-500">Support</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => toast.info('Help center coming soon!')}>Help Center</Button></li>
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => toast.info('Contact us at support@quicklymart.com')}>Contact Us</Button></li>
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => toast.info('Track your order in the app!')}>Track Order</Button></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-quicklymart-orange-500">Company</h4>
              <ul className="space-y-2">
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => toast.info('About QuicklyMart coming soon!')}>About Us</Button></li>
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => toast.info('Careers page coming soon!')}>Careers</Button></li>
                <li><Button variant="ghost" className="text-gray-300 hover:text-quicklymart-orange-500 p-0 h-auto justify-start" onClick={() => toast.info('Privacy policy coming soon!')}>Privacy Policy</Button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">© 2024 QuicklyMart. All rights reserved.</span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">Made with ❤️ in India</span>
              </div>
              <div className="flex items-center space-x-6">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-quicklymart-orange-500" onClick={() => toast.info('Download our mobile app!')}>
                  Download App
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-quicklymart-orange-500" onClick={() => toast.info('Newsletter subscription coming soon!')}>
                  Newsletter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuicklyMart;
