import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Check, Loader2, Send, Home, Briefcase, Trash2, Pencil } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, DocumentData, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useTheme, useSelectedAddress } from '@/App';
import LocationPicker from './LocationPicker';
import { Label } from '@/components/ui/label';

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

interface AddressSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

const AddressSelectDialog: React.FC<AddressSelectDialogProps> = ({ isOpen, onClose, userId }) => {
  const { isDarkMode } = useTheme();
  const { selectedAddress, setSelectedAddress } = useSelectedAddress();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Address>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadAddresses(userId);
    }
  }, [isOpen, userId]);

  // Sync selectedId with selectedAddress when dialog opens or selectedAddress changes
  useEffect(() => {
    if (isOpen) {
      setSelectedId(selectedAddress?.id || null);
    }
  }, [isOpen, selectedAddress]);

  const loadAddresses = async (uid: string) => {
    setIsLoading(true);
    try {
      const addressesRef = collection(db, 'addresses');
      const q = query(addressesRef, where('userId', '==', uid));
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
      // Restore selected address from localStorage/context if present
      let selected = null;
      try {
        const stored = localStorage.getItem('pickngo-selected-address');
        if (stored) {
          const parsed = JSON.parse(stored);
          selected = addressesData.find(a => a.id === parsed.id);
        }
      } catch {}
      if (!selected && selectedAddress) {
        selected = addressesData.find(a => a.id === selectedAddress.id);
      }
      if (selected) {
        setSelectedId(selected.id);
        setSelectedAddress(selected);
      } else if (addressesData.length > 0) {
        const fallback = addressesData.find(a => a.isDefault) || addressesData[0];
        setSelectedId(fallback.id);
        setSelectedAddress(fallback);
        localStorage.setItem('pickngo-selected-address', JSON.stringify(fallback));
      }
    } catch (error) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-5 h-5 text-gray-500" />;
      case 'work': return <Briefcase className="w-5 h-5 text-gray-500" />;
      default: return <Send className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      setSelectedAddress(addr);
      localStorage.setItem('pickngo-selected-address', JSON.stringify(addr));
    }
    // Do not call onClose() here, so the dialog stays open and the radio updates
  };

  const handleLocationSelect = async (location: { lat: number; lng: number; address: string }) => {
    if (!userId) return;
    // Fetch city, state, pincode from reverse geocoding
    let city = '', state = '', pincode = '';
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`);
      const data = await response.json();
      city = data.address.city || data.address.town || data.address.village || '';
      state = data.address.state || '';
      pincode = data.address.postcode || '';
    } catch (err) {
      // fallback to blank
    }
    // Save as a new address in Firestore
    const newAddress = {
      type: 'other',
      name: '',
      address: location.address,
      city,
      state,
      pincode,
      isDefault: true,
      userId,
      createdAt: new Date(),
    };
    try {
      // Set all other addresses to isDefault: false
      const addressesRef = collection(db, 'addresses');
      const q = query(addressesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(docSnap => updateDoc(doc(db, 'addresses', docSnap.id), { isDefault: false }));
      await Promise.all(updatePromises);
      // Add new address as default
      const docRef = await addDoc(addressesRef, newAddress);
      const addressWithId = { ...newAddress, id: docRef.id };
      setSelectedAddress(addressWithId);
      setSelectedId(addressWithId.id); // Ensure radio selection updates
      localStorage.setItem('pickngo-selected-address', JSON.stringify(addressWithId));
      setShowLocationPicker(false);
      onClose();
    } catch (error) {
      // handle error
      setShowLocationPicker(false);
      onClose();
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, 'addresses', id));
      // If the deleted address was selected, clear or select next
      if (selectedAddress?.id === id) {
        const remaining = addresses.filter(a => a.id !== id);
        if (remaining.length > 0) {
          setSelectedAddress(remaining[0]);
          setSelectedId(remaining[0].id);
          localStorage.setItem('pickngo-selected-address', JSON.stringify(remaining[0]));
        } else {
          setSelectedAddress(null);
          setSelectedId(null);
          localStorage.removeItem('pickngo-selected-address');
        }
      }
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      // handle error
    }
  };

  const handleEditClick = (addr: Address) => {
    setEditingId(addr.id);
    setEditForm({ ...addr });
  };

  const handleEditChange = (field: keyof Address, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!userId || !editingId) return;
    // Validate required fields (remove 'name')
    const requiredFields: (keyof Address)[] = ['address', 'city', 'state', 'pincode', 'type'];
    for (const field of requiredFields) {
      if (!editForm[field] || (typeof editForm[field] === 'string' && editForm[field]?.trim() === '')) {
        setEditError(`Please fill in the ${field} field.`);
        return;
      }
    }
    setEditLoading(true);
    setEditError(null);
    try {
      const addressRef = doc(db, 'addresses', editingId);
      // Remove undefined fields from editForm
      const cleanEditForm = Object.fromEntries(
        Object.entries(editForm).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(addressRef, cleanEditForm);
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...cleanEditForm } as Address : a));
      if (selectedAddress?.id === editingId) {
        const updated = { ...selectedAddress, ...cleanEditForm };
        setSelectedAddress(updated);
        localStorage.setItem('pickngo-selected-address', JSON.stringify(updated));
      }
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setEditError('Failed to save. Please try again.');
      console.error('Firestore update error:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Return the dialog JSX as before
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-lg w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-0`}>
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Delivery Address</DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Choose where you'd like your order delivered
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <Button
            onClick={() => setShowLocationPicker(true)}
            variant="outline"
            className={`w-full mb-4 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Set Delivery Location
          </Button>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No saved addresses found.</div>
          ) : (
            <RadioGroup value={selectedId || ''} onValueChange={handleSelect}>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {addresses.map(addr => (
                  <Label
                    key={addr.id}
                    htmlFor={addr.id}
                    className={`relative flex items-start space-x-3 p-4 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}
                    style={{ alignItems: 'center' }}
                  >
                    <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      {editingId === addr.id ? (
                        <form className="flex flex-col gap-2 w-full max-w-full" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <input className="flex-1 border rounded px-2 py-1 text-sm min-w-0" value={editForm.phone || ''} onChange={e => handleEditChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone" required maxLength={10} />
                          </div>
                          <input className="w-full border rounded px-2 py-1 text-sm" value={editForm.address || ''} onChange={e => handleEditChange('address', e.target.value)} placeholder="Address" required />
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <input className="flex-1 border rounded px-2 py-1 text-sm min-w-0" value={editForm.city || ''} onChange={e => handleEditChange('city', e.target.value)} placeholder="City" required />
                            <input className="flex-1 border rounded px-2 py-1 text-sm min-w-0" value={editForm.state || ''} onChange={e => handleEditChange('state', e.target.value)} placeholder="State" required />
                            <input className="flex-1 border rounded px-2 py-1 text-sm min-w-0" value={editForm.pincode || ''} onChange={e => handleEditChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Pincode" required maxLength={10} />
                          </div>
                          <div className="flex gap-2">
                            <select className="flex-1 border rounded px-2 py-1 text-sm min-w-0" value={editForm.type || 'other'} onChange={e => handleEditChange('type', e.target.value as Address['type'])}>
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          {editError && <div className="text-xs text-red-500">{editError}</div>}
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={handleEditCancel} className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs">Cancel</button>
                            <button type="submit" className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 text-xs" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2 mb-2">
                            {getAddressIcon(addr.type)}
                            <h3 className={`font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{addr.type}</h3>
                            {addr.isDefault && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Default</span>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{`${addr.name}, ${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`}</p>
                          {addr.phone && (
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📞 {addr.phone}</p>
                          )}
                          {!addr.phone && (
                            <p className={`text-xs mt-1 text-orange-500`}>⚠️ Phone number required</p>
                          )}
                        </>
                      )}
                    </div>
                    {editingId !== addr.id && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleEditClick(addr); }}
                        className="absolute top-4 right-12 p-2 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit address"
                        style={{ zIndex: 2 }}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleDelete(addr.id); }}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete address"
                      style={{ zIndex: 2 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {selectedId === addr.id && <Check className="w-5 h-5 text-orange-500 ml-2 mt-1" />}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}
          <LocationPicker
            isOpen={showLocationPicker}
            onClose={() => setShowLocationPicker(false)}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelectDialog; 