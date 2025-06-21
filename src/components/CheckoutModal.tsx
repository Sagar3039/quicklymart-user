import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, Briefcase, Send, CreditCard, Landmark, Wallet, ArrowLeft, ArrowRight, Moon, Sun } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';

interface Address {
    id: string;
    type: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (orderDetails: {
    address: Address;
    paymentMethod: string;
    tip: number;
    finalTotal: number;
  }) => void;
  totalPrice: number;
  user: any;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onPlaceOrder, totalPrice, user }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const deliveryFee = totalPrice > 299 ? 0 : 29;
  const finalTotal = totalPrice + deliveryFee + tip;

  useEffect(() => {
    if (isOpen && user) {
      loadAddresses(user.uid);
    } else {
      setStep(1);
      setSelectedAddress(null);
      setPaymentMethod('cod');
      setTip(0);
      setCustomTip('');
    }
  }, [isOpen, user]);

  const loadAddresses = async (userId: string) => {
    setIsLoading(true);
    try {
      const addressesRef = collection(db, 'addresses');
      const q = query(addressesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const addressesData = querySnapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
              id: doc.id,
              type: data.type,
              name: data.name,
              address: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              isDefault: data.isDefault,
          } as Address;
      });
      
      addressesData.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      
      setAddresses(addressesData);
      if (addressesData.length > 0) {
        setSelectedAddress(addressesData.find(a => a.isDefault) || addressesData[0]);
      }
    } catch (error) {
      console.error("Error loading addresses: ", error);
      toast.error("Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipSelect = (amount: number) => {
    setTip(amount);
    setCustomTip('');
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomTip(value);
    setTip(Number(value) || 0);
  };

  const handleConfirmOrder = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address.');
      setStep(1);
      return;
    }
    onPlaceOrder({
      address: selectedAddress,
      paymentMethod,
      tip,
      finalTotal,
    });
  };
  
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5 text-gray-500" />;
      case 'work': return <Briefcase className="w-5 h-5 text-gray-500" />;
      default: return <Send className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Address Selection
        return (
          <div className="space-y-4">
            <div className="text-center">
              <DialogTitle className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Select Delivery Address</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Choose where you'd like your order delivered</DialogDescription>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <RadioGroup value={selectedAddress?.id} onValueChange={(id) => setSelectedAddress(addresses.find(a => a.id === id) || null)}>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {addresses.map(address => (
                    <Label key={address.id} htmlFor={address.id} className="flex items-start space-x-3 p-4 border dark:border-gray-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-white dark:bg-gray-700">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getAddressIcon(address.type)}
                          <h3 className="font-semibold capitalize text-gray-900 dark:text-white">{address.type}</h3>
                          {address.isDefault && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{`${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`}</p>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            {addresses.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No addresses found</p>
                <Button variant="outline" onClick={() => window.location.href = '/address'}>
                  Add New Address
                </Button>
              </div>
            )}
          </div>
        );
      case 2: // Payment & Tip
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DialogTitle className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Payment & Tip</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">Choose your payment method and add a tip</DialogDescription>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Payment Method</h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <Label htmlFor="cod" className="flex items-center space-x-4 p-4 border dark:border-gray-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-white dark:bg-gray-700">
                      <RadioGroupItem value="cod" id="cod" />
                      <Wallet className="w-6 h-6 text-green-600" />
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white">Cash on Delivery</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive your order</p>
                      </div>
                    </Label>
                    <Label htmlFor="upi" className="flex items-center space-x-4 p-4 border dark:border-gray-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-white dark:bg-gray-700">
                      <RadioGroupItem value="upi" id="upi" />
                      <Landmark className="w-6 h-6 text-blue-600" />
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white">UPI</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay using UPI apps</p>
                      </div>
                    </Label>
                    <Label htmlFor="card" className="flex items-center space-x-4 p-4 border dark:border-gray-700 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-white dark:bg-gray-700">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-6 h-6 text-purple-600" />
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white">Credit/Debit Card</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay with your card</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Add a Tip</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Show appreciation to your delivery partner</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[10, 20, 50].map(amount => (
                    <Button 
                      key={amount} 
                      variant={tip === amount ? 'default' : 'outline'} 
                      onClick={() => handleTipSelect(amount)}
                      className="h-12 text-base"
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center space-x-3">
                  <Input 
                    type="number"
                    placeholder="Custom amount"
                    value={customTip}
                    onChange={handleCustomTipChange}
                    className="flex-1 h-12 text-base dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">₹</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] p-0 sm:p-6 bg-white dark:bg-gray-800">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-4 pt-4 pb-2 sm:px-0 sm:pt-0 sm:pb-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 sm:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <DialogDescription className="text-center flex-1 sm:text-left text-gray-600 dark:text-gray-400">Complete your order</DialogDescription>
              <div className="w-10 sm:hidden"></div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-0">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 sm:px-0 sm:py-0 sm:border-t-0 sm:mt-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{finalTotal.toFixed(2)}</p>
                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Includes ₹{deliveryFee} delivery fee</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                {step === 1 && (
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedAddress}
                    className="flex-1 sm:flex-none"
                    size="lg"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                {step === 2 && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="flex-1 sm:flex-none"
                      size="lg"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirmOrder}
                      className="flex-1 sm:flex-none"
                      size="lg"
                    >
                      Confirm Order
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal; 