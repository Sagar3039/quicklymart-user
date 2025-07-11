import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Home, Briefcase, Send, CreditCard, Landmark, Wallet, ArrowLeft, ArrowRight, Moon, Sun, X, Phone, MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData, updateDoc, doc, addDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';
import { useTheme, useSelectedAddress } from '@/App';
import PriceBreakdown from './PriceBreakdown';
import LocationPicker from './LocationPicker';
import { useBanCheck } from '@/hooks/useBanCheck';

interface Address {
    id: string;
    type: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
    email?: string;
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
    location?: { lat: number; lng: number; address: string };
    discountAmount?: number;
    appliedPromo?: any;
  }) => void;
  totalPrice: number;
  user: any;
  discountAmount?: number;
  appliedPromo?: any;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onPlaceOrder, totalPrice, user, discountAmount = 0, appliedPromo }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { banStatus } = useBanCheck();
  const { selectedAddress: globalSelectedAddress, setSelectedAddress: setGlobalSelectedAddress } = useSelectedAddress();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  // Add state for map-based address details
  const [mapAddressDetails, setMapAddressDetails] = useState({
    name: '',
    phone: '',
    landmark: '',
  });
  const [mapAddressErrors, setMapAddressErrors] = useState({
    name: '',
    phone: '',
    landmark: '',
  });

  const deliveryFee = totalPrice - discountAmount > 299 ? 0 : 40;
  const gstRate = 5; // 5% GST
  const gstAmount = Math.round(((totalPrice - discountAmount + deliveryFee) * (gstRate / 100)));
  const finalTotal = Math.max(0, totalPrice - discountAmount + deliveryFee + gstAmount + tip);

  // Check if user is banned and prevent checkout
  useEffect(() => {
    if (isOpen && banStatus.isBanned) {
      toast.error('Your account has been suspended. You cannot place orders.');
      onClose();
    }
  }, [isOpen, banStatus.isBanned, onClose]);

  useEffect(() => {
    if (isOpen && user) {
      loadAddresses(user.uid);
      // Sync with global selected address
      setSelectedAddress(globalSelectedAddress || null);
    } else {
      setStep(1);
      setSelectedAddress(null);
      setPaymentMethod('cod');
      setTip(0);
      setCustomTip('');
      setPhoneNumber('');
      setShowPhoneInput(false);
      setShowLocationPicker(false);
      setSelectedLocation(null);
    }
  }, [isOpen, user, globalSelectedAddress]);

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
              phone: data.phone,
              email: data.email,
              isDefault: data.isDefault,
          } as Address;
      });
      
      addressesData.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      
      setAddresses(addressesData);
      // Only set default if nothing is selected
      setSelectedAddress(prev => prev || addressesData.find(a => a.isDefault) || addressesData[0] || null);
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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(numericValue);
  };

  const savePhoneNumber = async () => {
    if (!selectedAddress || !phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      // Update the address in Firestore
      await updateDoc(doc(db, 'addresses', selectedAddress.id), {
        phone: phoneNumber
      });

      // Update the selected address locally
      const updatedAddress = { ...selectedAddress, phone: phoneNumber };
      setSelectedAddress(updatedAddress);
      setGlobalSelectedAddress(updatedAddress); // Update global context
      
      // Update the address in the addresses array
      setAddresses(prev => prev.map(addr => 
        addr.id === selectedAddress.id ? updatedAddress : addr
      ));

      setShowPhoneInput(false);
      setPhoneNumber('');
      toast.success('Phone number added successfully!');
      
      // Continue to next step
      setStep(2);
    } catch (error) {
      console.error('Error saving phone number:', error);
      toast.error('Failed to save phone number. Please try again.');
    }
  };

  const handleContinueToPayment = () => {
    // If user selected a map location, validate map address details
    if (selectedLocation && !selectedAddress) {
      let errors = { name: '', phone: '', landmark: '' };
      if (!mapAddressDetails.name.trim()) errors.name = 'Name is required';
      if (!mapAddressDetails.phone.match(/^\d{10}$/)) errors.phone = 'Valid 10-digit phone required';
      if (!mapAddressDetails.landmark.trim()) errors.landmark = 'Landmark is required';
      setMapAddressErrors(errors);
      if (errors.name || errors.phone || errors.landmark) return;
    }
    if (!selectedAddress && !selectedLocation) {
      toast.error('Please select a delivery address or location.');
      return;
    }
    if (selectedAddress && (!selectedAddress.phone || selectedAddress.phone.trim() === '')) {
      setShowPhoneInput(true);
      setPhoneNumber(selectedAddress.phone || '');
      return;
    }
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    // If user selected a map location, validate map address details
    if (selectedLocation && !selectedAddress) {
      let errors = { name: '', phone: '', landmark: '' };
      if (!mapAddressDetails.name.trim()) errors.name = 'Name is required';
      if (!mapAddressDetails.phone.match(/^\d{10}$/)) errors.phone = 'Valid 10-digit phone required';
      if (!mapAddressDetails.landmark.trim()) errors.landmark = 'Landmark is required';
      setMapAddressErrors(errors);
      if (errors.name || errors.phone || errors.landmark) return;
      // Compose address object for map location
      const address = {
        type: 'other',
        name: mapAddressDetails.name,
        address: selectedLocation.address,
        city: '',
        state: '',
        pincode: '',
        phone: mapAddressDetails.phone,
        email: user?.email || '',
        isDefault: true,
        landmark: mapAddressDetails.landmark,
        userId: user?.uid,
        createdAt: new Date(),
      };
      try {
        // Set all other addresses to isDefault: false
        const addressesRef = collection(db, 'addresses');
        const q = query(addressesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const updatePromises = querySnapshot.docs.map(docSnap => updateDoc(doc(db, 'addresses', docSnap.id), { isDefault: false }));
        await Promise.all(updatePromises);
        // Add new address as default
        const docRef = await addDoc(addressesRef, address);
        const addressWithId = { ...address, id: docRef.id };
        // Reload addresses and set new address as selected
        await loadAddresses(user.uid);
        setSelectedAddress(addressWithId);
        setGlobalSelectedAddress(addressWithId); // Update global context
        toast.success('Location saved as your default address!');
        onPlaceOrder({
          address: addressWithId,
          paymentMethod,
          tip,
          finalTotal,
          location: selectedLocation,
          discountAmount,
          appliedPromo
        });
      } catch (error) {
        toast.error('Failed to save address. Please try again.');
        return;
      }
      return;
    }
    if (!selectedAddress) {
      toast.error('Please select a delivery address.');
      setStep(1);
      return;
    }
    if (!selectedAddress.phone || selectedAddress.phone.trim() === '') {
      setShowPhoneInput(true);
      setPhoneNumber(selectedAddress.phone || '');
      return;
    }
    onPlaceOrder({
      address: selectedAddress,
      paymentMethod,
      tip,
      finalTotal,
      location: selectedLocation,
      discountAmount,
      appliedPromo
    });
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setSelectedAddress(null); // Clear previous address selection
    setShowLocationPicker(false);
    toast.success('Location selected successfully!');
  };
  
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5 text-gray-500" />;
      case 'work': return <Briefcase className="w-5 h-5 text-gray-500" />;
      default: return <Send className="w-5 h-5 text-gray-500" />;
    }
  };

  // Define handleAddressSelect before use
  const handleAddressSelect = (address: Address | null) => {
    setSelectedAddress(address);
    setGlobalSelectedAddress(address);
  };

  const renderStepContent = () => {
    // Show phone input step if needed
    if (showPhoneInput) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <DialogTitle className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Add Phone Number</DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Please add a phone number to your selected address to continue with the order
            </DialogDescription>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {getAddressIcon(selectedAddress?.type || '')}
                <h3 className={`font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedAddress?.type}
                </h3>
                {selectedAddress?.isDefault && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Default</span>
                )}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {`${selectedAddress?.name}, ${selectedAddress?.address}, ${selectedAddress?.city}, ${selectedAddress?.state} - ${selectedAddress?.pincode}`}
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="phone" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  className={`pl-10 h-12 text-base ${isDarkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300'}`}
                  maxLength={10}
                />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This number will be used for delivery updates
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch (step) {
      case 1: // Address Selection
        return (
          <div className="space-y-4">
            <div className="text-center">
              <DialogTitle className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Select Delivery Address</DialogTitle>
              <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Choose where you'd like your order delivered</DialogDescription>
            </div>

            {/* Location Picker Button */}
            <Button
              onClick={() => setShowLocationPicker(true)}
              variant="outline"
              className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {selectedLocation ? 'Change Location' : 'Set Delivery Location'}
            </Button>

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className={`p-3 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Selected Location</span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {selectedLocation.address}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} font-mono`}>
                  📍 Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
            
            {selectedLocation && !selectedAddress && (
              <div className="space-y-3 mt-4">
                <Label htmlFor="map-name" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Full Name *</Label>
                <Input
                  id="map-name"
                  value={mapAddressDetails.name}
                  onChange={e => setMapAddressDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
                />
                {mapAddressErrors.name && <p className="text-red-500 text-xs">{mapAddressErrors.name}</p>}
                <Label htmlFor="map-phone" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Phone Number *</Label>
                <Input
                  id="map-phone"
                  value={mapAddressDetails.phone}
                  onChange={e => setMapAddressDetails(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
                />
                {mapAddressErrors.phone && <p className="text-red-500 text-xs">{mapAddressErrors.phone}</p>}
                <Label htmlFor="map-landmark" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Landmark *</Label>
                <Input
                  id="map-landmark"
                  value={mapAddressDetails.landmark}
                  onChange={e => setMapAddressDetails(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="Enter a nearby landmark"
                  className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
                />
                {mapAddressErrors.landmark && <p className="text-red-500 text-xs">{mapAddressErrors.landmark}</p>}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <RadioGroup value={selectedAddress?.id} onValueChange={(id) => handleAddressSelect(addresses.find(a => a.id === id) || null)}>
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
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {`${address.name}, ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`}
                        </p>
                        {address.phone && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            📞 {address.phone}
                          </p>
                        )}
                        {!address.phone && (
                          <p className={`text-xs mt-1 text-orange-500`}>
                            ⚠️ Phone number required
                          </p>
                        )}
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
          <div className="space-y-2">
            <div className="text-center">
              <DialogTitle className={`text-xl font-bold mb-0 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Payment & Tip</DialogTitle>
              <DialogDescription className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose your payment method and add a tip</DialogDescription>
            </div>
            <div className="space-y-1">
              <div>
                <h4 className={`font-semibold mb-1 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-1">
                    <Label htmlFor="cod" className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}> 
                      <RadioGroupItem value="cod" id="cod" />
                      <Wallet className="w-5 h-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span className={`font-medium text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Cash on Delivery</span>
                        <span className={`text-xs leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay when you receive your order</span>
                      </div>
                    </Label>
                    <Label htmlFor="upi" className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}> 
                      <RadioGroupItem value="upi" id="upi" />
                      <Landmark className="w-5 h-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span className={`font-medium text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>UPI</span>
                        <span className={`text-xs leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay using UPI apps</span>
                      </div>
                    </Label>
                    <Label htmlFor="card" className={`flex items-center gap-2 p-2 border rounded cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}> 
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-5 h-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span className={`font-medium text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Credit/Debit Card</span>
                        <span className={`text-xs leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay with your card</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-1">
                <h4 className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add a Tip</h4>
                <span className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Show appreciation to your delivery partner</span>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {[10, 20, 50].map(amount => (
                    <Button 
                      key={amount} 
                      variant={tip === amount ? 'default' : 'outline'} 
                      onClick={() => handleTipSelect(amount)}
                      className={`h-8 text-sm px-2 ${tip === amount ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'}`}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    placeholder="Custom amount"
                    value={customTip}
                    onChange={handleCustomTipChange}
                    className={`flex-1 h-8 text-sm px-2 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300'}`}
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={`max-w-xl w-full sm:w-[90vw] h-screen max-h-screen p-0 overflow-hidden rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex flex-col h-full max-h-screen">
            <DialogHeader className="px-4 pt-4 pb-2 sm:px-8 sm:pt-6 sm:pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {showPhoneInput ? 'Add Phone Number' : 'Checkout'}
                  </DialogTitle>
                  <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {showPhoneInput ? 'Required for delivery' : `Step ${step} of 2`}
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
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-20 pt-2 sm:px-8 sm:pb-16" style={{ scrollbarWidth: 'none' }}>
              {renderStepContent()}
            </div>
            <div
              className={`sticky bottom-0 left-0 right-0 z-20 px-4 pt-3 pb-3 border-t shadow-lg rounded-b-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sm:px-8`}
            >
              {!showPhoneInput && (
                <div className="mb-2">
                  <PriceBreakdown
                    subtotal={totalPrice}
                    deliveryCharge={deliveryFee}
                    gstRate={gstRate}
                    isDarkMode={isDarkMode}
                    discountAmount={discountAmount}
                    appliedPromo={appliedPromo}
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                {!showPhoneInput && (
                  <div className="text-right">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total: <span className="text-orange-500 font-bold text-lg">₹{finalTotal.toFixed(2)}</span></p>
                  </div>
                )}
                <div className="flex space-x-3">
                  {showPhoneInput ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowPhoneInput(false)}
                        className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} min-h-[44px] min-w-[100px]`}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={savePhoneNumber}
                        disabled={phoneNumber.length !== 10}
                        className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] min-w-[120px] text-base disabled:opacity-50"
                      >
                        Save & Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {step > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setStep(step - 1)}
                          className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} min-h-[44px] min-w-[100px]`}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      )}
                      {step < 2 ? (
                        <Button
                          onClick={handleContinueToPayment}
                          disabled={!(selectedAddress || selectedLocation)}
                          className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] min-w-[120px] text-base"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleConfirmOrder}
                          className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] min-w-[120px] text-base"
                        >
                          Place Order
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : undefined}
      />
    </>
  );
};

export default CheckoutModal; 
