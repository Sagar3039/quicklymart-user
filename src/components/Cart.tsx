import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, ShoppingBag, CreditCard, ShoppingCart, X, Moon, Sun } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';

const Cart = ({ isOpen, onClose, cart, updateQuantity, totalPrice, onProceedToCheckout }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [couponCode, setCouponCode] = useState('');

  const deliveryFee = totalPrice > 299 ? 0 : 29;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={`w-full sm:max-w-lg flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l`}>
        <SheetHeader>
          <SheetTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>Shopping Cart</SheetTitle>
          <SheetDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {cart.length === 0 ? 'Your cart is empty' : `${cart.length} item${cart.length === 1 ? '' : 's'} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Your cart is empty</p>
              <Button 
                onClick={() => onClose(false)} 
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className={`flex items-center space-x-3 p-3 border rounded-lg ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>₹{item.price}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                        className="w-8 h-8 p-0 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        -
                      </Button>
                      <span className={`text-sm font-medium w-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                        className="w-8 h-8 p-0 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(item.id!, 0)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input placeholder="Enter promo code" className="mb-2" />
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                  Apply
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-800">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                {totalPrice < 299 && (
                  <p className="text-xs text-green-600">
                    Add ₹{299 - totalPrice} more for free delivery!
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-orange-500">₹{(totalPrice > 299 ? totalPrice : totalPrice + deliveryFee).toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={onProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                onClick={() => {}}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
