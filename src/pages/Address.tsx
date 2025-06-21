import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MapPin, Edit, Trash2, Home, Briefcase, Star, Search, Send, MoreVertical, Moon, Sun } from 'lucide-react';
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

const Address = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Addresses</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                  <DialogDescription>
                    Add a new delivery address to your account.
                  </DialogDescription>
                </DialogHeader>
                <AddAddressForm onAddressAdded={handleAddressAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Try JP Nagar, Siri Gardenia, etc."
              className="pl-10 h-12"
            />
        </div>

        <Button variant="ghost" className="w-full justify-start text-orange-500 font-semibold text-base p-0 h-auto mb-4" onClick={handleUseCurrentLocation}>
            <Send className="w-5 h-5 mr-2" />
            Use my current location
        </Button>
        <Button variant="ghost" className="w-full justify-start text-orange-500 font-semibold text-base p-0 h-auto" onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Add new address
        </Button>

        <div className="mt-6">
            <h2 className="text-xs font-semibold text-gray-400 mb-2">SAVED ADDRESSES</h2>
            {isLoading ? (
              <p>Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p>No saved addresses.</p>
            ) : (
                <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start justify-between" onClick={() => handleSetDefault(address.id)}>
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">{getAddressIcon(address.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold capitalize">{address.type}</h3>
                          {selectedAddressId === address.id && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              CURRENTLY SELECTED
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.name}, {address.address}, {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-500">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
                {editingAddress ? 'Update your delivery address' : 'Add a new delivery address'}
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
            <div className="space-y-2">
                <Label>Address Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                />
            </div>
            <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                />
            </div>
            <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>City *</Label>
                <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                />
                </div>
                <div className="space-y-2">
                <Label>State *</Label>
                <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
                />
            </div>
            <div className="flex items-center space-x-2">
                <input
                type="checkbox"
                id="default"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded"
                />
                <Label htmlFor="default">Set as default address</Label>
            </div>
            <div className="flex space-x-2">
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }} className="flex-1">
                Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                {editingAddress ? 'Update' : 'Add'} Address
                </Button>
            </div>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Address; 