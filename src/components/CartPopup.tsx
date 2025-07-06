import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PriceBreakdown from './PriceBreakdown';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
}

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  isDarkMode: boolean;
}

const CartPopup: React.FC<CartPopupProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  isDarkMode
}) => {
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = getSubtotal() > 0 ? 40 : 0; // Free delivery for orders above ₹0
  const gstRate = 5; // 5% GST

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            <span>Shopping Cart</span>
            {getTotalItems() > 0 && (
              <Badge className="bg-orange-500 text-white">
                {getTotalItems()}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-64 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your cart is empty</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Add some items to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 pr-2">
              {cart.map((item) => (
                <div key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
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
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="w-6 h-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="w-6 h-6 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <PriceBreakdown
              subtotal={getSubtotal()}
              deliveryCharge={deliveryCharge}
              gstRate={gstRate}
              isDarkMode={isDarkMode}
            />
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 mt-4"
              onClick={onProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartPopup; 