import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MapPin, Edit, Trash2, Home, Briefcase, Star, Search, Send, MoreVertical, Moon, Sun, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useTheme } from '@/App';
import { useSelectedAddress } from '@/App';

const Address = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { selectedAddress, setSelectedAddress } = useSelectedAddress();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadAddresses(currentUser.uid);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const defaultAddress = addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses]);

  const loadAddresses = async (userId) => {
    setIsLoading(true);
    try {
      const addressesRef = collection(db, 'addresses');
      const q = query(addressesRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      const addressesData = [];
      
      querySnapshot.forEach((doc) => {
        addressesData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      addressesData.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
        return dateB - dateA;
      });

      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.address) {
                const ad = data.address;
                const newAddress = {
                    type: 'other',
                    name: ad.road || 'Current Location',
                    phone: '',
                    address: `${ad.road || ''}, ${ad.suburb || ''}`,
                    city: ad.city || ad.town || ad.village,
                    state: ad.state,
                    pincode: ad.postcode,
                    isDefault: false,
                    userId: user.uid,
                    createdAt: new Date(),
                };
                await addDoc(collection(db, 'addresses'), newAddress);
                toast.success('Current location added as a new address!');
                await loadAddresses(user.uid);
            } else {
              toast.error('Could not determine address from location.');
            }
          } catch (error) {
            console.error('Error fetching address:', error);
            toast.error('Could not fetch address from location.');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not access your location.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingAddress) {
        const addressRef = doc(db, 'addresses', editingAddress.id);
        await updateDoc(addressRef, {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Address updated successfully!');
      } else {
        const newAddress = {
          ...formData,
          userId: user.uid,
          createdAt: new Date()
        };
        await addDoc(collection(db, 'addresses'), newAddress);
        toast.success('Address added successfully!');
      }

      setIsAddDialogOpen(false);
      resetForm();
      await loadAddresses(user.uid);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (!user) return;

    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteDoc(doc(db, 'addresses', addressId));
        toast.success('Address deleted successfully!');
        await loadAddresses(user.uid);
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    if (!user) return;

    try {
      const addressesRef = collection(db, 'addresses');
      const q = query(addressesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isDefault: false })
      );
      await Promise.all(updatePromises);

      await updateDoc(doc(db, 'addresses', addressId), { isDefault: true });
      
      // Find the selected address object
      const selectedAddressObj = addresses.find(addr => addr.id === addressId);
      if (selectedAddressObj) {
        setSelectedAddress(selectedAddressObj);
      }
      
      toast.success('Default address updated!');
      await loadAddresses(user.uid);
      setSelectedAddressId(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5 text-gray-500" />;
      case 'work':
        return <Briefcase className="w-5 h-5 text-gray-500" />;
      default:
        return <Send className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!user) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-pickngo-orange-500'}
              >
              <ArrowLeft className="w-5 h-5" />
            </Button>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Addresses</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your delivery addresses</p>
              </div>
          </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-pickngo-orange-500'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <DialogHeader>
                <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
                <DialogDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {editingAddress ? 'Update your address details' : 'Add a new delivery address'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type" className={isDarkMode ? 'text-white' : 'text-gray-900'}>Address Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className={isDarkMode ? 'text-white' : 'text-gray-900'}>Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className={isDarkMode ? 'text-white' : 'text-gray-900'}>Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className={isDarkMode ? 'text-white' : 'text-gray-900'}>Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter your address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className={isDarkMode ? 'text-white' : 'text-gray-900'}>City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className={isDarkMode ? 'text-white' : 'text-gray-900'}>State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode" className={isDarkMode ? 'text-white' : 'text-gray-900'}>Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isDefault" className={isDarkMode ? 'text-white' : 'text-gray-900'}>Set as default address</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600">
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleUseCurrentLocation} className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}>
            <MapPin className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>
        </div>

        <div className="relative mb-4">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <Input
              placeholder="Try JP Nagar, Siri Gardenia, etc."
              className={`pl-10 h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
        </div>

        <div className="mt-6">
            <h2 className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>SAVED ADDRESSES</h2>
            {isLoading ? (
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No saved addresses.</p>
            ) : (
                <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className={`border rounded-lg p-4 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">{getAddressIcon(address.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-bold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{address.type}</h3>
                            {selectedAddress?.id === address.id && (
                              <Badge className="bg-pickngo-orange-100 text-pickngo-orange-700 text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                CURRENTLY SELECTED
                              </Badge>
                            )}
                            {address.isDefault && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{address.name}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{address.phone}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {address.address}, {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(address)}
                          className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                          className={isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-500'}
                        >
                          <Trash2 className="w-4 h-4" />
                      </Button>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSetDefault(address.id)}
                          className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
                      >
                        Set as Default
                      </Button>
                      )}
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedAddress(address);
                          toast.success('Address selected successfully!');
                          }}
                        className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600"
                        >
                        Use This Address
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
            </div>
    </div>
  );
};

export default Address; 
