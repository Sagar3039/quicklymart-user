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
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-white dark:bg-gray-800 border-l dark:border-gray-700">
        <SheetHeader className="border-b dark:border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
              <ShoppingBag className="w-5 h-5" />
              <span>Your Cart ({cart.length})</span>
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <SheetDescription className="text-gray-600 dark:text-gray-400">
            Review your items before placing an order.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6">
          {cart.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 dark:text-gray-400">Add some items to get started!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 text-gray-800 dark:text-white">{item.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-bold text-gray-800 dark:text-white">₹{item.price}</span>
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="font-medium w-8 text-center text-gray-800 dark:text-white">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, 0)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t dark:border-gray-700 pt-4 mt-auto space-y-4">
            <div>
              <Input placeholder="Enter promo code" className="mb-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
              <Button variant="outline" size="sm" className="w-full">
                Apply Code
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-800 dark:text-white">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-800 dark:text-white">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {totalPrice < 299 && (
                <p className="text-xs text-green-600">
                  Add ₹{299 - totalPrice} more for free delivery!
                </p>
              )}
              <Separator className="dark:bg-gray-700" />
              <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-white">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex justify-between items-center font-bold text-lg mb-4 text-gray-800 dark:text-white">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <Button onClick={onProceedToCheckout} className="w-full" size="lg" disabled={cart.length === 0}>
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
