import React from 'react';
import { Trash2 } from 'lucide-react';

interface CartBarProps {
  cart: any[];
  totalPrice: number;
  onCheckout: () => void;
  onDelete: () => void;
  onViewMenu?: () => void;
  isDarkMode: boolean;
  buttonLabel?: string;
  className?: string;
}

const CartBar: React.FC<CartBarProps> = ({
  cart,
  totalPrice,
  onCheckout,
  onDelete,
  onViewMenu,
  isDarkMode,
  buttonLabel = 'Checkout',
  className = '',
}) => {
  if (!cart || cart.length === 0) return null;
  const first = cart[0];
  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className={`md:hidden fixed left-0 right-0 bottom-0 z-50 flex justify-center items-end pointer-events-none mb-1.5 ${className}`}>
      <div
        className={`flex items-center w-[98vw] max-w-xl rounded-2xl shadow-xl px-2.5 py-2 border pointer-events-auto gap-2 sm:gap-3
          ${isDarkMode ? 'bg-gray-800/90 border-gray-700 backdrop-blur-md' : 'bg-white/90 border-gray-200 backdrop-blur-md'}`}
        style={{ minHeight: 64 }}
      >
        <img
          src={first.image}
          alt={first.name}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
        />
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm sm:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{first.name}</div>
          <button
            className={`text-xs sm:text-sm underline truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} hover:text-pickngo-orange-500`}
            onClick={onViewMenu}
            tabIndex={-1}
            type="button"
          >
            View Full Menu
          </button>
        </div>
        <button
          className={`flex flex-col items-center justify-center font-bold rounded-xl px-3 py-2 sm:px-5 focus:outline-none transition-colors text-xs sm:text-sm
            ${isDarkMode ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          onClick={onCheckout}
          style={{ minWidth: 90 }}
        >
          <span className="font-semibold whitespace-nowrap">{itemCount} item{itemCount > 1 ? 's' : ''} | ₹{totalPrice}</span>
          <span className="text-sm sm:text-base font-bold">{buttonLabel}</span>
        </button>
        <button
          className={`ml-1 sm:ml-2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full focus:outline-none transition-colors
            ${isDarkMode ? 'bg-rose-900/60 hover:bg-rose-900 text-white' : 'bg-rose-100 hover:bg-rose-200 text-rose-500'}`}
          onClick={onDelete}
          aria-label="Clear Cart"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartBar; 
