import React, { useState } from 'react';
import { ArrowLeft, Search, Package, Clock, MapPin, Truck, CheckCircle, XCircle, Moon, Sun, Phone, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-quicklymart-orange-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
                <p className="text-sm text-gray-600">Track your order status</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-quicklymart-orange-500"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tracking Form */}
        <Card className="bg-white border border-gray-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Search className="w-5 h-5" />
              <span>Track Your Order</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-800 mb-3 block">Tracking Method</Label>
              <RadioGroup value={trackingMethod} onValueChange={setTrackingMethod}>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="orderId" id="orderId" />
                    <Label htmlFor="orderId" className="text-gray-800">Order ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="text-gray-800">Phone Number</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="trackingInput" className="text-gray-800">
                {trackingMethod === 'orderId' ? 'Order ID' : 'Phone Number'}
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="trackingInput"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder={trackingMethod === 'orderId' ? 'Enter your order ID' : 'Enter your phone number'}
                  className="flex-1 bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                />
                <Button 
                  onClick={handleTrackOrder}
                  disabled={isSearching}
                  className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>💡 <strong>Demo:</strong> Enter "123" or "98765" to see sample tracking data</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderDetails && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-white border border-gray-200">
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
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Clock className="w-5 h-5" />
                  <span>Delivery Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.timeline.map((step, index) => (
                    <div key={step.step} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-quicklymart-orange-500' : 'bg-gray-300'
                      }`}>
                        <span className="text-lg">{step.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{step.title}</h4>
                          {step.time && (
                            <span className="text-sm text-gray-600">
                              {step.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Person Info */}
            {orderDetails.status === 'out_for_delivery' && (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <Truck className="w-5 h-5" />
                    <span>Delivery Partner</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Name:</span>
                      <span className="font-semibold text-gray-800">{orderDetails.deliveryPerson.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">Vehicle:</span>
                      <span className="font-semibold text-gray-800">{orderDetails.deliveryPerson.vehicle}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="flex-1 bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Delivery Partner
                      </Button>
                      <Button variant="outline" className="flex-1 border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track on Map
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-quicklymart-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-quicklymart-orange-600" />
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
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <MapPin className="w-5 h-5" />
                  <span>Delivery Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">{orderDetails.deliveryAddress.name}</p>
                  <p className="text-gray-600">
                    {orderDetails.deliveryAddress.address}, {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={() => navigate(`/current-order/${orderDetails.id}`)} 
                className="flex-1 bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600"
              >
                <Truck className="w-4 h-4 mr-2" />
                View Full Details
              </Button>
              <Button variant="outline" className="flex-1 border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        )}

        {/* No Order Found */}
        {!orderDetails && !isSearching && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Track Your Order</h3>
              <p className="text-gray-600 mb-4">
                Enter your order ID or phone number to track your order status
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/past-orders')} className="w-full bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600">
                  View Order History
                </Button>
                <Button variant="outline" onClick={() => navigate('/contact-us')} className="w-full border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
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