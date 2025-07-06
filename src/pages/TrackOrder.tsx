import React, { useState } from 'react';
import { ArrowLeft, Search, Package, Clock, MapPin, Truck, CheckCircle, XCircle, Moon, Sun, Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';
import { toast } from '@/components/ui/sonner';

const TrackOrder = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [trackingMethod, setTrackingMethod] = useState('orderId');
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Mock order data for demonstration
  const mockOrder = {
    id: 'ORD123456789',
    status: 'out_for_delivery',
    items: [
      { name: "Domino's Pizza Margherita", quantity: 1, price: 299 },
      { name: 'Coca Cola', quantity: 2, price: 60 },
      { name: 'Garlic Bread', quantity: 1, price: 120 }
    ],
    totalPrice: 539,
    deliveryAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    },
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    currentStep: 4,
    deliveryPerson: {
      name: 'Rahul Kumar',
      phone: '+91 98765 43210',
      vehicle: 'Bike - KA-01-AB-1234'
    },
    timeline: [
      {
        step: 1,
        title: 'Order Placed',
        description: 'Your order has been received',
        time: new Date(Date.now() - 45 * 60 * 1000),
        completed: true,
        icon: '📋'
      },
      {
        step: 2,
        title: 'Order Confirmed',
        description: 'Restaurant has confirmed your order',
        time: new Date(Date.now() - 40 * 60 * 1000),
        completed: true,
        icon: '✅'
      },
      {
        step: 3,
        title: 'Preparing',
        description: 'Your food is being prepared',
        time: new Date(Date.now() - 30 * 60 * 1000),
        completed: true,
        icon: '👨‍🍳'
      },
      {
        step: 4,
        title: 'Out for Delivery',
        description: 'Your order is on the way',
        time: new Date(Date.now() - 5 * 60 * 1000),
        completed: true,
        icon: '🚚'
      },
      {
        step: 5,
        title: 'Delivered',
        description: 'Enjoy your meal!',
        time: null,
        completed: false,
        icon: '🎉'
      }
    ]
  };

  const handleTrackOrder = async () => {
    if (!trackingInput.trim()) {
      toast.error('Please enter your tracking information');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, show mock order if input matches
    if (trackingInput.toLowerCase().includes('123') || trackingInput.toLowerCase().includes('98765')) {
      setOrderDetails(mockOrder);
      toast.success('Order found!');
    } else {
      setOrderDetails(null);
      toast.error('Order not found. Please check your tracking information.');
    }

    setIsSearching(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'confirmed': return 'bg-blue-600';
      case 'preparing': return 'bg-orange-600';
      case 'out_for_delivery': return 'bg-purple-600';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-orange-500"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-gray-800 font-bold text-lg">Track Order</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-white border border-gray-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-gray-800">Track Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderId" className="text-gray-700">Order ID</Label>
                  <Input
                    id="orderId"
                    type="text"
                    placeholder="Enter order ID"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderDetails && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-800">
                  <span>Order #{orderDetails.id}</span>
                  <Badge className={getStatusColor(orderDetails.status)}>
                    {getStatusText(orderDetails.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <p className="font-semibold text-gray-800">Order Items</p>
                    <p className="text-sm text-gray-600">{orderDetails.items.length} items</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">💰</div>
                    <p className="font-semibold text-gray-800">Total Amount</p>
                    <p className="text-sm text-gray-600">₹{orderDetails.totalPrice}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">⏰</div>
                    <p className="font-semibold text-gray-800">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">
                      {orderDetails.estimatedDeliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Timeline */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                        item.completed ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {item.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${item.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                          {item.title}
                        </h4>
                        <p className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          {item.description}
                        </p>
                        {item.time && (
                          <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-800">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="text-gray-800">{orderDetails.deliveryAddress.name}</p>
                    <p className="text-gray-600">
                      {orderDetails.deliveryAddress.address}, {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={() => navigate(`/current-order/${orderDetails.id}`)} 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                <Truck className="w-4 h-4 mr-2" />
                View Full Details
              </Button>
              <Button variant="outline" className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        )}

        {/* No Order Found */}
        {!orderDetails && !isSearching && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Track Your Order</h3>
              <p className="text-gray-600 mb-4">
                Enter your order ID or phone number to track your order status
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/past-orders')} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  View Order History
                </Button>
                <Button variant="outline" onClick={() => navigate('/contact-us')} className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                  Need Help?
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackOrder; 
