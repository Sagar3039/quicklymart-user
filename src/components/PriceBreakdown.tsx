import React from 'react';
import { Separator } from '@/components/ui/separator';

interface PriceBreakdownProps {
  subtotal: number;
  deliveryCharge: number;
  gstRate: number;
  isDarkMode: boolean;
  discountAmount?: number;
  appliedPromo?: any;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  deliveryCharge,
  gstRate,
  isDarkMode,
  discountAmount = 0,
  appliedPromo
}) => {
  const gstAmount = Math.round(((subtotal - discountAmount + deliveryCharge) * (gstRate / 100)));
  const total = Math.max(0, subtotal - discountAmount + deliveryCharge + gstAmount);

  return (
    <div className={`space-y-1 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}> 
      <h3 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Price Breakdown</h3>
      <div className="grid grid-cols-2 gap-y-1 text-xs">
        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subtotal</span>
        <span className={`text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{subtotal}</span>
        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Charge</span>
        <span className={`text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{deliveryCharge}</span>
        {discountAmount > 0 && (
          <>
            <span className="text-green-600">Discount{appliedPromo?.code ? ` (${appliedPromo.code})` : ''}</span>
            <span className="text-right text-green-700">-₹{discountAmount}</span>
          </>
        )}
        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>GST ({gstRate}%)</span>
        <span className={`text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{gstAmount}</span>
        <span className="col-span-2"><Separator className={isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} /></span>
        <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
        <span className="font-bold text-base text-orange-500 text-right">₹{total}</span>
      </div>
      <div className={`text-[10px] mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>* Delivery charge may vary based on distance and time</div>
    </div>
  );
};

export default PriceBreakdown; 