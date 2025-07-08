import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Briefcase, Clock, Star, Grid, List, Filter, Plus, Minus, Mic, Heart, History, Home, Play, LayoutGrid, LogOut, Package, Settings, User as UserIcon, MapPin, ChevronDown, Moon, Sun, X } from 'lucide-react';
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
import { getProductsByCategory, PRODUCT_CATEGORIES, SAMPLE_CATEGORIES, getCategoriesByProductCategory, getTopBoughtProducts, checkAndInitializeProducts } from '@/lib/products';
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

const groceryCategories = [
    { name: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&crop=center' },
    { name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Dairy, Bread & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Rice, Atta & Dals', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Masalas & Dry Fruits', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop&crop=center' },
    { name: 'Oils & Ghee', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center' },
    { name: 'Munchies', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&crop=center' },
]

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
    const { address, paymentMethod, tip, finalTotal, location } = orderDetails;

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

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location.address);
    setShowLocationPicker(false);
    toast.success('Location selected successfully!');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>

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
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-left h-auto p-1"
                  onClick={() => setShowLocationPicker(true)}
                >
                  <div className="min-w-0">
                    <h3 className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getDisplayLocation() || 'Select Location'}
                    </h3>
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Center Section - Navigation */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}>For Business</Button>
              <Button variant="ghost" className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}>Help</Button>
              <Button variant="ghost" className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'} onClick={() => navigate('/contact-us')}>Contact Us</Button>
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
                          onClick={handleProceedToCheckout}
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
                    <DropdownMenuItem onClick={() => navigate('/settings')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
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
                <img src="/logo.jpg" alt="PickNGo Logo" className="h-10 w-auto object-contain" />
              </div>
              
              {/* Location Bar */}
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1 text-left h-auto p-1 rounded-md max-w-[100px] sm:max-w-[120px]"
                  onClick={() => setShowLocationPicker(true)}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-medium text-xs truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedAddress?.city || 'Location'}
                    </h3>
                  </div>
                </Button>
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
                          onClick={handleProceedToCheckout}
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
                    <DropdownMenuItem onClick={() => navigate('/settings')} className={isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} />
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
        {/* --- Desktop Hero Section --- */}
        <div className={`hidden md:block py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4 text-orange-500">Your daily essentials, delivered in minutes.</h2>
                {selectedAddress && (
                  <div className="mb-4">
                    <Badge className="bg-orange-100 text-orange-700 px-4 py-2 text-sm">
                      🎯 Delivering to: {selectedAddress.city}, {selectedAddress.state}
                    </Badge>
                  </div>
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
            </div>
        </div>

        {/* --- Mobile Search & Banners --- */}
        <div className="md:hidden">
      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3">
          <UniversalSearch 
              isOpen={true}
              onClose={() => {}}
              onProductSelect={handleProductSelect}
              onAddToCart={addToCart}
              cart={cart}
          />
          <Button 
            variant="ghost" 
            size="sm"
                className="text-pickngo-orange-500"
            onClick={() => toast.success('Voice search activated!')}
          >
            <Mic className="w-5 h-5" />
          </Button>
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
                    className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600 text-white font-bold px-6 py-2 rounded-full"
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
                <Card className={`overflow-hidden cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} onClick={() => handleFoodClick('all')}>
                    <CardHeader className="p-0">
                        <img src="https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?w=400" alt="Food Delivery" className="w-full h-56 object-cover" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Food Delivery</h3>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>From the best local restaurants</p>
                        <Button className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600 text-white font-bold px-6 py-2 rounded-full">
                            Order Now
                        </Button>
                    </CardContent>
                </Card>

                {/* Instamart / Daily Essentials Card */}
                 <Card className={`overflow-hidden cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} onClick={handleDailyEssentialClick}>
                    <CardHeader className="p-0">
                        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500" alt="Groceries" className="w-full h-56 object-cover" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instamart</h3>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Instant Grocery Delivery</p>
                         <Button className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600 text-white font-bold px-6 py-2 rounded-full">
                            Shop Now
                        </Button>
                    </CardContent>
                </Card>

                {/* Dineout / Drinks Card */}
                 <Card className={`overflow-hidden cursor-pointer group ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} onClick={handleWineStoreClick}>
                    <CardHeader className="p-0">
                        <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500" alt="Dineout" className="w-full h-56 object-cover" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dineout & Drinks</h3>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Eat out or get drinks delivered</p>
                        <Button className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600 text-white font-bold px-6 py-2 rounded-full">
                            Explore Now
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* --- Desktop Food Categories Carousel --- */}
        <div className="hidden md:block container mx-auto py-12">
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What's on your mind?</h2>
            {(() => {
              const seen = new Set();
              const uniqueFoodCategories = foodCategories.filter(cat => {
                const key = cat.subcategory || cat.id || cat.name;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
              return (
                <Carousel opts={{ align: "start", loop: true }}>
                  <CarouselContent>
                    {uniqueFoodCategories.map((category, index) => (
                      <CarouselItem key={index} className="basis-auto">
                        <div className="text-center cursor-pointer" onClick={() => handleFoodClick(category.subcategory)}>
                          <div className="w-36 h-36 flex items-center justify-center rounded-full mx-auto text-6xl bg-gray-100 dark:bg-gray-800">
                            {category.icon}
                          </div>
                          <p className={`mt-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.displayName}</p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className={isDarkMode ? 'text-white hover:text-orange-400' : 'text-gray-900 hover:text-orange-500'} />
                  <CarouselNext className={isDarkMode ? 'text-white hover:text-orange-400' : 'text-gray-900 hover:text-orange-500'} />
                </Carousel>
              );
            })()}
        </div>

        {/* --- Top Buys of All Time (Food Only) --- */}
        <div className="hidden md:block container mx-auto py-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Buys of All Time</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {topBuys.filter(product => product.category === 'food').map((product) => (
              <div
                key={product.id}
                className={`rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 flex flex-col h-full transition-transform hover:scale-[1.02] ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}
              >
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-sm text-gray-500 dark:text-gray-300">₹{product.price}</span>
                    <span className="text-gray-400 text-sm">• {product.rating}★</span>
                  </div>
                  <p className="text-gray-400 text-sm flex-1">{product.category}</p>
                  <span className="text-xs text-orange-500 font-bold mt-2">Total Bought: {product.totalBought}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Desktop Grocery Categories Carousel --- */}
        <div className="hidden md:block container mx-auto py-12">
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shop groceries on Instamart</h2>
            {(() => {
              const seen = new Set();
              const uniqueEssentialCategories = essentialCategories.filter(cat => {
                const key = cat.subcategory || cat.id || cat.name;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
              return (
                <Carousel opts={{ align: "start", loop: true }}>
                  <CarouselContent>
                    {uniqueEssentialCategories.map((category, index) => (
                      <CarouselItem key={index} className="basis-auto">
                        <div
                          className="text-center cursor-pointer"
                          onClick={() => navigate('/daily-essential', { state: { category: category.subcategory } })}
                        >
                          <div className={`w-36 h-36 flex items-center justify-center rounded-full mx-auto text-6xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
                          >
                            {category.icon ? (
                              <span>{category.icon}</span>
                            ) : (
                              <img src={category.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop'} alt={category.name} className="w-20 h-20 object-cover rounded-full" />
                            )}
                          </div>
                          <p className={`mt-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.displayName || category.name}</p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className={isDarkMode ? 'text-white hover:text-orange-400' : 'text-gray-900 hover:text-orange-500'} />
                  <CarouselNext className={isDarkMode ? 'text-white hover:text-orange-400' : 'text-gray-900 hover:text-orange-500'} />
                </Carousel>
              );
            })()}
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
                        className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600 text-white font-bold px-6 py-2 rounded-full"
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
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fast delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
                    className={`relative overflow-hidden rounded-2xl cursor-pointer hover:shadow-lg transition-shadow border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white/5 backdrop-blur-md text-white border-gray-700'}`}
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
                        <div className="absolute top-3 left-3 bg-pickngo-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
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
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onPlaceOrder={placeOrder}
        totalPrice={getTotalPrice()}
        user={user}
      />

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} mt-20`}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-pickngo-orange-500">PickNGo</h3>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
    </div>
  );
};

export default PickNGo;
