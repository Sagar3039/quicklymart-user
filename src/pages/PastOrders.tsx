import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, MapPin, Star, Truck, CheckCircle, XCircle, Wifi, WifiOff, Phone, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { auth, db, getConnectionStatus, retryOperation } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';

const PastOrders = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(getConnectionStatus());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadOrders(currentUser.uid);
      } else {
        navigate('/');
      }
    });

    // Listen for connection status changes
    const handleOnlineStatus = () => {
      const online = getConnectionStatus();
      setIsOnline(online);
      if (online && user) {
        loadOrders(user.uid);
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [navigate, user]);

  const loadOrders = async (userId) => {
    setIsLoading(true);
    try {
      if (!isOnline) {
        toast.error('You are offline. Please check your internet connection.');
        setIsLoading(false);
        return;
      }

      await retryOperation(async () => {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const ordersData = [];
        
        querySnapshot.forEach((doc) => {
          ordersData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort orders by date on the client side
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
          return dateB - dateA; // Sort by most recent
        });

        setOrders(ordersData);
      });
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.code === 'permission-denied') {
        toast.error('Access denied. Please check your permissions.');
      } else if (error.code === 'unavailable') {
        toast.error('Firebase service is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to load orders. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleOrder = async () => {
    if (!user) return;

    try {
      if (!isOnline) {
        toast.error('You are offline. Please check your internet connection.');
        return;
      }

      await retryOperation(async () => {
        const sampleOrder = {
          userId: user.uid,
          date: new Date().toISOString().split('T')[0],
          status: 'delivered',
          total: 450,
          items: [
            { name: "Domino's Pizza", quantity: 1, price: 250 },
            { name: 'Coca Cola', quantity: 2, price: 100 }
          ],
          deliveryAddress: 'White Building, Midnapore, West Bengal',
          deliveryTime: '20-25 mins',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'orders'), sampleOrder);
        toast.success('Sample order created!');
        await loadOrders(user.uid);
      });
    } catch (error) {
      console.error('Error creating sample order:', error);
      if (error.code === 'permission-denied') {
        toast.error('Access denied. Please check your permissions.');
      } else if (error.code === 'unavailable') {
        toast.error('Firebase service is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to create sample order. Please check your connection and try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'processing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

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
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-gray-800 dark:text-white font-bold text-lg">Past Orders</h1>
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
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {orders.length === 0 && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={createSampleOrder}
                >
                  Create Sample Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Orders Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <Card className="bg-white/5 backdrop-blur-md border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-300">Loading orders...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border-gray-700">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
              <p className="text-gray-300 mb-4">Start shopping to see your order history here</p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/')} className="w-full">
                  Start Shopping
                </Button>
                <Button variant="outline" onClick={createSampleOrder} className="w-full">
                  Create Sample Order
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Current Orders Section */}
            {orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-green-400 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Current Orders
                </h2>
                <div className="space-y-4">
                  {orders
                    .filter(order => order.status !== 'delivered' && order.status !== 'cancelled')
                    .map((order) => (
                      <Card key={`current-${order.id}`} className="bg-green-500/10 backdrop-blur-md border-green-500/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-white">Order #{order.id.slice(-6)}</CardTitle>
                              <p className="text-gray-300 text-sm">
                                {order.createdAt?.toDate ? 
                                  order.createdAt.toDate().toLocaleDateString() : 
                                  order.date
                                }
                              </p>
                            </div>
                            <Badge className="bg-green-500 text-white">
                              <div className="flex items-center space-x-1">
                                <Truck className="w-4 h-4" />
                                <span className="capitalize">{order.status}</span>
                              </div>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
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

                          {/* Delivery Info */}
                          <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {typeof order.deliveryAddress === 'string' 
                                ? order.deliveryAddress 
                                : order.deliveryAddress?.address 
                                  ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`
                                  : 'Address not available'
                              }
                            </span>
                          </div>

                          {/* Order Summary */}
                          <div className="space-y-3 p-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg">
                            {/* Delivery Time */}
                            <div className="flex items-center space-x-2">
                              <Truck className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-300">
                                Delivery Time: {order.deliveryTime || '20-25 mins'}
                              </span>
                            </div>
                            
                            {/* Payment Method */}
                            {order.paymentMethod && (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 text-green-400">💳</div>
                                <span className="text-sm text-gray-300 capitalize">
                                  Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 border-t border-white/20">
                              <span className="text-lg font-semibold">Total:</span>
                              <span className="text-2xl font-bold text-green-400">
                                ₹{order.totalPrice || order.total || 0}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => navigate(`/current-order/${order.id}`)}
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Track Order
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Phone className="w-4 h-4 mr-2" />
                              Call Support
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Past Orders Section */}
            {orders.filter(order => order.status === 'delivered' || order.status === 'cancelled').length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-300 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Past Orders
                </h2>
                <div className="space-y-4">
                  {orders
                    .filter(order => order.status === 'delivered' || order.status === 'cancelled')
                    .map((order) => (
                      <Card key={order.id} className="bg-white/5 backdrop-blur-md border-gray-700">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-white">Order #{order.id.slice(-6)}</CardTitle>
                              <p className="text-gray-300 text-sm">
                                {order.createdAt?.toDate ? 
                                  order.createdAt.toDate().toLocaleDateString() : 
                                  order.date
                                }
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status}</span>
                              </div>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
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

                          {/* Delivery Info */}
                          <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {typeof order.deliveryAddress === 'string' 
                                ? order.deliveryAddress 
                                : order.deliveryAddress?.address 
                                  ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}`
                                  : 'Address not available'
                              }
                            </span>
                          </div>

                          {/* Order Summary */}
                          <div className="space-y-3 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg">
                            {/* Delivery Time */}
                            <div className="flex items-center space-x-2">
                              <Truck className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-gray-300">
                                Delivery Time: {order.deliveryTime || '20-25 mins'}
                              </span>
                            </div>
                            
                            {/* Payment Method */}
                            {order.paymentMethod && (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 text-green-400">💳</div>
                                <span className="text-sm text-gray-300 capitalize">
                                  Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {/* Price Breakdown */}
                            <div className="space-y-1 pt-2 border-t border-white/10">
                              {/* Subtotal */}
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Subtotal:</span>
                                <span>₹{order.totalPrice || order.total || 0}</span>
                              </div>
                              
                              {/* Tip */}
                              {order.tip && order.tip > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Tip:</span>
                                  <span>₹{order.tip}</span>
                                </div>
                              )}
                              
                              {/* Delivery Fee */}
                              {order.totalPrice && order.totalPrice > 299 ? (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Delivery Fee:</span>
                                  <span className="text-green-400">FREE</span>
                                </div>
                              ) : order.totalPrice && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Delivery Fee:</span>
                                  <span>₹29</span>
                                </div>
                              )}
                              
                              {/* Total */}
                              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-2xl font-bold text-green-400">
                                  ₹{order.totalPrice || order.total || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => navigate(`/current-order/${order.id}`)}
                              >
                                <Truck className="w-4 h-4 mr-2" />
                                Track Order
                              </Button>
                            )}
                            <Button variant="outline" className="flex-1">
                              <Star className="w-4 h-4 mr-2" />
                              Rate Order
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Package className="w-4 h-4 mr-2" />
                              Reorder
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastOrders; 