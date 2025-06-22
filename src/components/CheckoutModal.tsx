import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, Briefcase, Send, CreditCard, Landmark, Wallet, ArrowLeft, ArrowRight, Moon, Sun, X } from 'lucide-react';
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
              <DialogTitle className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Select Delivery Address</DialogTitle>
              <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Choose where you'd like your order delivered</DialogDescription>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <RadioGroup value={selectedAddress?.id} onValueChange={(id) => setSelectedAddress(addresses.find(a => a.id === id) || null)}>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {addresses.map(address => (
                    <Label key={address.id} htmlFor={address.id} className={`flex items-start space-x-3 p-4 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {getAddressIcon(address.type)}
                          <h3 className={`font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{address.type}</h3>
                          {address.isDefault && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Default</span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{`${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`}</p>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            {addresses.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No addresses found</p>
                <Button variant="outline" onClick={() => window.location.href = '/address'} className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
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
              <DialogTitle className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payment & Tip</DialogTitle>
              <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Choose your payment method and add a tip</DialogDescription>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className={`font-semibold mb-3 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <Label htmlFor="cod" className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <Wallet className="w-6 h-6 text-orange-500" />
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Cash on Delivery</span>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay when you receive your order</p>
                      </div>
                    </Label>
                    <Label htmlFor="upi" className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                      <RadioGroupItem value="upi" id="upi" />
                      <Landmark className="w-6 h-6 text-orange-500" />
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>UPI</span>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay using UPI apps</p>
                      </div>
                    </Label>
                    <Label htmlFor="card" className={`flex items-center space-x-4 p-4 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-6 h-6 text-orange-500" />
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Credit/Debit Card</span>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay with your card</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <h4 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add a Tip</h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Show appreciation to your delivery partner</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[10, 20, 50].map(amount => (
                    <Button 
                      key={amount} 
                      variant={tip === amount ? 'default' : 'outline'} 
                      onClick={() => handleTipSelect(amount)}
                      className={`h-12 text-base ${tip === amount ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'}`}
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
                    className={`flex-1 h-12 text-base ${isDarkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300'}`}
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
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
      <DialogContent className={`max-w-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Checkout
              </DialogTitle>
              <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Step {step} of 2
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderStepContent()}
        </div>

        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
          <div className="flex justify-between items-center">
            <div className="text-right">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total: <span className="text-orange-500 font-bold text-lg">₹{finalTotal.toFixed(2)}</span></p>
            </div>
            <div className="flex space-x-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!selectedAddress}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmOrder}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Place Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal; 