import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, ShoppingBag, CreditCard, ShoppingCart, X, Moon, Sun } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Cart = ({ isOpen, onClose, cart, updateQuantity, totalPrice, onProceedToCheckout }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [couponCode, setCouponCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  // Group cart items by id and sum quantities
  const groupedCart = Object.values(
    cart.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item };
      } else {
        acc[item.id].quantity += item.quantity;
      }
      return acc;
    }, {})
  ) as any[];

  const deliveryFee = totalPrice > 299 ? 0 : 29;
  const finalTotal = Math.max(0, totalPrice - discountAmount + (totalPrice > 299 ? 0 : 29));

  const handleApplyPromo = async () => {
    setPromoError('');
    setIsCheckingPromo(true);
    setDiscountAmount(0);
    setAppliedPromo(null);
    try {
      const q = query(
        collection(db, 'promocodes'),
        where('code', '==', couponCode.trim()),
        where('status', '==', 'active')
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        setPromoError('Invalid or expired promo code.');
        setIsCheckingPromo(false);
        return;
      }
      const promo = snap.docs[0].data();
      let discount = 0;
      if (promo.discountType === 'percentage') {
        discount = Math.round((totalPrice * promo.discountValue) / 100);
      } else if (promo.discountType === 'fixed') {
        discount = promo.discountValue;
      }
      setDiscountAmount(discount);
      setAppliedPromo(promo);
      setPromoError('');
    } catch (err) {
      setPromoError('Error checking promo code.');
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setCouponCode('');
    setPromoError('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={`w-full sm:max-w-lg flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l`}>
        <SheetHeader>
          <SheetTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>Shopping Cart</SheetTitle>
          <SheetDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {groupedCart.length === 0 ? 'Your cart is empty' : `${groupedCart.length} item${groupedCart.length === 1 ? '' : 's'} in your cart`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {groupedCart.length === 0 ? (
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
              {groupedCart.map((item) => (
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
        
        {groupedCart.length > 0 && (
          <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-4">
              {/* Promo code input */}
              {appliedPromo ? (
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-green-100 text-green-700 px-3 py-1 text-sm">
                    {appliedPromo.code} - {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% off` : `₹${appliedPromo.discountValue} off`}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={handleRemovePromo} className="text-red-500 border-red-300 hover:bg-red-50">Remove</Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter promo code"
                    className="mb-2"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    disabled={isCheckingPromo}
                  />
                  <Button
                    variant="outline"
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    onClick={handleApplyPromo}
                    disabled={isCheckingPromo || !couponCode.trim()}
                  >
                    {isCheckingPromo ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
              )}
              {promoError && <div className="text-red-500 text-xs mb-2">{promoError}</div>}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-800">{totalPrice > 299 ? 'FREE' : `₹29`}</span>
                </div>
                {totalPrice < 299 && (
                  <p className="text-xs text-green-600">
                    Add ₹{299 - totalPrice} more for free delivery!
                  </p>
                )}
                <Separator />
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-700">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-orange-500">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                onClick={() => onProceedToCheckout({ discountAmount, appliedPromo })}
              >
                Place Order
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
