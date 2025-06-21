import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, Truck, CheckCircle, Phone, Navigation, Timer, Star, Package, XCircle, Wifi, WifiOff, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db, getConnectionStatus, retryOperation } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@/App';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Order {
  id: string;
  status?: string;
  items?: { name: string; quantity: number; price: number }[];
  deliveryAddress?: any;
  totalPrice?: number;
  total?: number;
  paymentMethod?: string;
  deliveryTime?: string;
  estimatedDeliveryTime?: any;
  estimatedMinutes?: number;
  userLocation?: { lat: number; lng: number };
  createdAt?: any;
}

const CurrentOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [distance, setDistance] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // Restaurant locations with coordinates
  const restaurantLocations = {
    'dominos': { 
      lat: 22.5726, 
      lng: 88.3639, 
      name: "Domino's Pizza", 
      address: "Park Street, Kolkata",
      icon: '🍕'
    },
    'spice_n_ice': { 
      lat: 22.5726 + 0.005, 
      lng: 88.3639 + 0.005, 
      name: "Spice N Ice", 
      address: "Esplanade, Kolkata",
      icon: '🍽️'
    },
    'china_nation': { 
      lat: 22.5726 - 0.003, 
      lng: 88.3639 - 0.003, 
      name: "China Nation", 
      address: "Chowringhee, Kolkata",
      icon: '🥢'
    },
    'default': { 
      lat: 22.5726, 
      lng: 88.3639, 
      name: "Restaurant", 
      address: "Kolkata",
      icon: '🏪'
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (orderId) {
          await loadOrder(orderId);
        }
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate, orderId]);

  const loadOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const orderRef = doc(db, 'orders', orderId);
      const unsubscribe = onSnapshot(orderRef, (doc) => {
        if (doc.exists()) {
          const orderData = { id: doc.id, ...doc.data() } as Order;
          setOrder(orderData);
          if (orderData.status) {
            updateCurrentStep(orderData.status);
          }
          // Initialize map after order loads
          setTimeout(async () => {
            await initializeMap(orderData);
          }, 100);
        } else {
          toast.error('Order not found');
          navigate('/past-orders');
        }
        setIsLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order');
      setIsLoading(false);
    }
  };

  const initializeMap = async (orderData: Order) => {
    if (!mapRef.current || mapInstance.current) return;

    const restaurantInfo = getRestaurantInfo(orderData);
    const userLocation = orderData.userLocation || { lat: 22.5726, lng: 88.3639 };

    // Get real addresses for both locations
    const [restaurantAddress, userAddress] = await Promise.all([
      getAddressFromCoordinates(restaurantInfo.lat, restaurantInfo.lng),
      getAddressFromCoordinates(userLocation.lat, userLocation.lng)
    ]);

    // Update restaurant info with real address
    restaurantInfo.address = restaurantAddress;

    // Calculate center point between restaurant and user
    const centerLat = (restaurantInfo.lat + userLocation.lat) / 2;
    const centerLng = (restaurantInfo.lng + userLocation.lng) / 2;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], 15);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Add restaurant marker
    const restaurantMarker = L.marker([restaurantInfo.lat, restaurantInfo.lng])
      .addTo(mapInstance.current)
      .bindPopup(`<b>${restaurantInfo.name}</b><br>${restaurantInfo.address}`);

    // Add user location marker
    const userMarker = L.marker([userLocation.lat, userLocation.lng])
      .addTo(mapInstance.current)
      .bindPopup(`<b>Your Location</b><br>${userAddress}`);

    // Draw route line
    const routeLine = L.polyline([
      [restaurantInfo.lat, restaurantInfo.lng],
      [userLocation.lat, userLocation.lng]
    ], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7
    }).addTo(mapInstance.current);

    // Calculate and display distance
    const calculatedDistance = calculateDistance(
      restaurantInfo.lat, restaurantInfo.lng,
      userLocation.lat, userLocation.lng
    );
    setDistance(calculatedDistance);

    // Fit map to show both markers
    const bounds = L.latLngBounds([
      [restaurantInfo.lat, restaurantInfo.lng],
      [userLocation.lat, userLocation.lng]
    ]);
    mapInstance.current.fitBounds(bounds, { padding: [20, 20] });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Live countdown timer
  useEffect(() => {
    if (!order?.estimatedDeliveryTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deliveryTime = order.estimatedDeliveryTime.toDate ? 
        order.estimatedDeliveryTime.toDate().getTime() : 
        new Date(order.estimatedDeliveryTime).getTime();
      
      const timeDifference = deliveryTime - now;

      if (timeDifference > 0) {
        const minutes = Math.floor(timeDifference / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        setTimeLeft({ minutes, seconds });
      } else {
        setTimeLeft({ minutes: 0, seconds: 0 });
        // Auto-update status to delivered when time is up
        if (order.status !== 'delivered') {
          updateOrderStatus('delivered');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return;
    
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getRestaurantKey = (items: any[]) => {
    if (!items || items.length === 0) return 'default';
    const firstItem = items[0].name.toLowerCase();
    if (firstItem.includes('domino') || firstItem.includes('pizza')) return 'dominos';
    if (firstItem.includes('spice') || firstItem.includes('ice')) return 'spice_n_ice';
    if (firstItem.includes('china') || firstItem.includes('nation')) return 'china_nation';
    return 'default';
  };

  const getRestaurantInfo = (orderData: Order) => {
    if (!orderData || !orderData.items) return restaurantLocations.default;
    
    const userLocation = orderData.userLocation || { lat: 22.5726, lng: 88.3639 };
    const restaurantKey = getRestaurantKey(orderData.items);
    
    // Generate realistic restaurant locations near the user
    const baseRestaurantLocations = {
      'dominos': { 
        name: "Domino's Pizza", 
        address: "Nearby Location",
        icon: '🍕',
        offset: { lat: 0.002, lng: 0.003 } // ~200-300m away
      },
      'spice_n_ice': { 
        name: "Spice N Ice", 
        address: "Local Restaurant",
        icon: '🍽️',
        offset: { lat: -0.001, lng: 0.002 } // ~100-200m away
      },
      'china_nation': { 
        name: "China Nation", 
        address: "Chinese Restaurant",
        icon: '🥢',
        offset: { lat: 0.003, lng: -0.001 } // ~300m away
      },
      'default': { 
        name: "Local Restaurant", 
        address: "Nearby Location",
        icon: '🏪',
        offset: { lat: 0.001, lng: 0.001 } // ~100m away
      }
    };

    const restaurantInfo = baseRestaurantLocations[restaurantKey] || baseRestaurantLocations.default;
    
    return {
      lat: userLocation.lat + restaurantInfo.offset.lat,
      lng: userLocation.lng + restaurantInfo.offset.lng,
      name: restaurantInfo.name,
      address: restaurantInfo.address,
      icon: restaurantInfo.icon
    };
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        // Extract street and city information
        const addressParts = data.display_name.split(', ');
        const street = addressParts[0] || 'Nearby Location';
        const city = addressParts[addressParts.length - 3] || 'Your Area';
        return `${street}, ${city}`;
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    return 'Nearby Location';
  };

  const updateCurrentStep = (status: string) => {
    switch (status) {
      case 'pending': setCurrentStep(1); break;
      case 'confirmed': setCurrentStep(2); break;
      case 'preparing': setCurrentStep(3); break;
      case 'out_for_delivery': setCurrentStep(4); break;
      case 'delivered': setCurrentStep(5); break;
      default: setCurrentStep(1);
    }
  };

  const getStepInfo = (step: number) => {
    const steps = [
      { title: 'Order Placed', description: 'Your order has been received', icon: '📋', color: 'text-blue-400' },
      { title: 'Order Confirmed', description: 'Restaurant has confirmed your order', icon: '✅', color: 'text-green-400' },
      { title: 'Preparing', description: 'Your food is being prepared', icon: '👨‍🍳', color: 'text-yellow-400' },
      { title: 'Out for Delivery', description: 'Your order is on the way', icon: '🚚', color: 'text-orange-400' },
      { title: 'Delivered', description: 'Enjoy your meal!', icon: '🎉', color: 'text-green-500' }
    ];
    return steps[step - 1] || steps[0];
  };

  const getDeliveryAddress = () => {
    if (!order) return '';
    if (typeof order.deliveryAddress === 'string') {
      return order.deliveryAddress;
    } else if (order.deliveryAddress?.address) {
      return `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`;
    }
    return 'Address not available';
  };

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  if (!user) return <div>Loading...</div>;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Order not found</p>
          <Button onClick={() => navigate('/past-orders')} className="mt-4">
            Go to Past Orders
          </Button>
        </div>
      </div>
    );
  }

  const restaurantInfo = getRestaurantInfo(order);
  const stepInfo = getStepInfo(currentStep);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300"
                onClick={() => navigate('/past-orders')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-gray-800 dark:text-white font-bold text-lg">Order #{order.id.slice(-6)}</h1>
                <div className="flex items-center space-x-2 text-sm">
                  <Timer className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    {timeLeft.minutes}m {timeLeft.seconds}s left
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300"
                onClick={toggleDarkMode}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Badge className="bg-green-500 text-white">
                <Clock className="w-4 h-4 mr-1" />
                {distance.toFixed(1)} km away
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Live Map */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-white/5 backdrop-blur-md border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Live Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="w-full h-64 rounded-lg border border-gray-600"
              style={{ zIndex: 1 }}
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-300">Distance</p>
                <p className="text-lg font-bold text-blue-400">{distance.toFixed(1)} km</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-300">Est. Time</p>
                <p className="text-lg font-bold text-green-400">{timeLeft.minutes}m {timeLeft.seconds}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Progress */}
        <Card className="bg-white/5 backdrop-blur-md border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <span className="text-2xl">{stepInfo.icon}</span>
              <span className={stepInfo.color}>{stepInfo.title}</span>
            </CardTitle>
            <p className="text-gray-300">{stepInfo.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Progress</span>
                  <span>{Math.round((currentStep / 5) * 100)}%</span>
                </div>
                <Progress value={(currentStep / 5) * 100} className="h-2" />
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                      step <= currentStep ? 'bg-green-500/20 scale-105' : 'bg-gray-700/50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                        step <= currentStep ? 'bg-green-500 shadow-lg' : 'bg-gray-600'
                      }`}
                    >
                      {step < currentStep ? '✓' : step}
                    </div>
                    <span className="text-xs mt-1 text-center">
                      {getStepInfo(step).title.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant & Delivery Info */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Restaurant Info */}
          <Card className="bg-white/5 backdrop-blur-md border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span className="text-2xl">{restaurantInfo.icon}</span>
                <span>Restaurant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{restaurantInfo.name}</h3>
                <p className="text-gray-300">{restaurantInfo.address}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Restaurant
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="bg-white/5 backdrop-blur-md border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-300">{getDeliveryAddress()}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Delivery
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="bg-white/5 backdrop-blur-md border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">🍽️</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-300 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">₹{item.price}</p>
                </div>
              ))}
            </div>
            
            {/* Order Total */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-400">
                  ₹{order.totalPrice || order.total || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/past-orders')}>
            View All Orders
          </Button>
          <Button className="flex-1" onClick={() => navigate('/')}>
            Order Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrentOrder; 