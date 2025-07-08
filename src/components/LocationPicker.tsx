import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Check, Loader2, Home, Clock, Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '@/contexts/LocationContext';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock saved addresses (replace with real data if available)
const MOCK_SAVED_ADDRESSES = [
  { label: 'Home', icon: 'home', address: '2, Baghmundi – Purulia Rd, Purulia, West Bengal 723101, India' },
  { label: 'Work', icon: 'briefcase', address: 'Satyasai Mess, Midnapore, West Bengal 721101, India' },
];

// Icon mapping function
const getIconComponent = (icon) => {
  switch (icon) {
    case 'home': return <Home className="w-5 h-5 mr-2" />;
    case 'work': return <Briefcase className="w-5 h-5 mr-2" />;
    case 'briefcase': return <Briefcase className="w-5 h-5 mr-2" />;
    case 'clock': return <Clock className="w-5 h-5 mr-2" />;
    default: return <Home className="w-5 h-5 mr-2" />;
  }
};

const LocationPicker = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const { isDarkMode } = useTheme();
  const { location: globalLocation, setLocation: setGlobalLocation } = useLocation();
  const [step, setStep] = useState(1); // 1: search/select, 2: map confirm, 3: add details
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(MOCK_SAVED_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ label: '', details: '', landmark: '' });
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // Load recent and saved addresses from localStorage
  useEffect(() => {
    const rec = localStorage.getItem('recent-locations');
    // setRecent(rec ? JSON.parse(rec) : []); // Removed recent search logic
    const savedAddrs = localStorage.getItem('saved-addresses');
    if (savedAddrs) setSaved(JSON.parse(savedAddrs));
  }, [isOpen]);

  // On mount, use context location if available
  useEffect(() => {
    if (globalLocation && !location) {
      setLocation(globalLocation);
      setAddress(globalLocation.address);
    }
  }, [globalLocation, isOpen]);

  // Fetch suggestions as user types
  useEffect(() => {
    if (search.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setSuggestions(data))
      .catch(() => setSuggestions([]))
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [search]);

  // Helper to set location and step together
  const setLocationAndStep2 = (loc) => {
    setLocation(loc);
    setStep(2);
  };

  // Cleanup map/marker when leaving step 2 or closing modal
  useEffect(() => {
    if (step !== 2 && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    }
    if (!isOpen && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    }
  }, [step, isOpen]);

  // 3. Add a useEffect that always updates map/marker/address when step===2 and location is set
  useEffect(() => {
    if (step !== 2 || !location) return;
    if (!mapRef.current) return;
    // Clean up any existing map instance before creating a new one
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    }
    mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([location.lat, location.lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);
    markerInstance.current = L.marker([location.lat, location.lng], { draggable: true }).addTo(mapInstance.current);
    markerInstance.current.on('dragend', (event) => {
      const marker = event.target;
      const pos = marker.getLatLng();
      setLocation({ lat: pos.lat, lng: pos.lng });
      reverseGeocode(pos.lat, pos.lng);
    });
    mapInstance.current.on('click', (event) => {
      const { lat, lng } = event.latlng;
      setLocation({ lat, lng });
      if (markerInstance.current) markerInstance.current.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });
    reverseGeocode(location.lat, location.lng);
    // eslint-disable-next-line
  }, [step, location]);

  // Geocode to address
  const reverseGeocode = async (lat, lng) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      setAddress(data.display_name || `${lat}, ${lng}`);
    } catch {
      setAddress(`${lat}, ${lng}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add address form submit
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!addForm.label || !address || !location) {
      toast.error('Please enter a label and select a location.');
      return;
    }
    // Use 'home' as default, or infer from label
    let iconKey = 'home';
    if (addForm.label.toLowerCase().includes('work')) iconKey = 'briefcase';
    else if (addForm.label.toLowerCase().includes('office')) iconKey = 'briefcase';
    else if (addForm.label.toLowerCase().includes('clock')) iconKey = 'clock';
    else if (addForm.label.toLowerCase().includes('home')) iconKey = 'home';
    const newAddr = {
      label: addForm.label,
      icon: iconKey,
      address: `${address}${addForm.details ? ', ' + addForm.details : ''}${addForm.landmark ? ', ' + addForm.landmark : ''}`,
      location: { ...location },
    };
    const updated = [newAddr, ...saved.filter(a => a.address !== newAddr.address)].slice(0, 5);
    setSaved(updated);
    localStorage.setItem('saved-addresses', JSON.stringify(updated));
    setShowAddForm(false);
    setAddForm({ label: '', details: '', landmark: '' });
    toast.success('Address saved!');
  };

  // Update getCurrentLocation to use helper
  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    setIsLoading(true);
    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            reject,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        });
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocationAndStep2(loc);
        reverseGeocode(loc.lat, loc.lng);
        toast.success('Location detected!');
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (err) {
      if (err && (err as GeolocationPositionError).code === 1) {
        toast.error('Location permission denied. Please allow location access.');
      } else {
        toast.error('Could not get your location. Please search or pick on map.');
      }
      setLocation(null);
    } finally {
      setIsLoading(false);
      setFetchingLocation(false);
    }
  };

  // Update handleSuggestion to use helper
  const handleSuggestion = (s) => {
    const loc = { lat: parseFloat(s.lat), lng: parseFloat(s.lon) };
    setLocationAndStep2(loc);
    setAddress(s.display_name);
    reverseGeocode(loc.lat, loc.lng);
  };

  // Update handleAddressClick to use helper
  const handleAddressClick = (addr) => {
    if (addr.location) {
      setLocationAndStep2(addr.location);
      setAddress(addr.address);
      setGlobalLocation({ ...addr.location, address: addr.address });
      onLocationSelect({ ...addr.location, address: addr.address });
      onClose();
      setStep(1);
      toast.success('Address loaded!');
    }
  };

  // Confirm location
  const handleConfirm = () => {
    if (location && address) {
      // Check if address already exists in saved
      const alreadySaved = saved.some(a => a.address === address);
      if (!alreadySaved) {
        // Add as 'Recent' with 'clock' icon
        const newAddr = {
          label: 'Recent',
          icon: 'clock',
          address,
          location: { ...location },
        };
        const updated = [newAddr, ...saved].slice(0, 5);
        setSaved(updated);
        localStorage.setItem('saved-addresses', JSON.stringify(updated));
      }
      setGlobalLocation({ ...location, address });
      onLocationSelect({ ...location, address });
      onClose();
      setStep(1);
    } else {
      toast.error('Please select a valid location');
    }
  };

  // UI rendering
  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); setStep(1); }}>
      <DialogContent className="max-w-lg w-full p-0 overflow-y-auto overflow-x-hidden max-h-screen" style={{ minHeight: 600, borderRadius: 16 }}>
        {step === 1 && (
          <div className="p-6">
            <DialogTitle className="text-lg font-semibold mb-6">Set delivery location</DialogTitle>
            <div className="flex items-center mb-6 relative">
              {/* Removed the X (close) icon here */}
              <Input
                className="flex-1 text-lg border-0 border-b border-gray-300 focus:ring-0 focus:border-orange-500 placeholder-gray-400"
                placeholder="Search for area, street name.."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
              {/* Suggestions dropdown */}
              {search.trim().length >= 3 && (
                <div className="absolute left-0 right-0 top-12 z-20 bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-y-auto">
                  {isLoading && <div className="p-3 text-sm text-gray-500">Loading...</div>}
                  {!isLoading && suggestions.length === 0 && <div className="p-3 text-sm text-gray-500">No results found</div>}
                  {!isLoading && suggestions.map(s => (
                    <div key={s.place_id} className="p-3 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => handleSuggestion(s)}>
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <Button variant="outline" className="w-full flex items-center justify-start py-4" onClick={getCurrentLocation} disabled={isLoading || fetchingLocation}>
                <MapPin className="mr-3 text-orange-500" />
                <span className="font-medium">Get current location</span>
                <span className="ml-auto text-xs text-gray-500">Using GPS</span>
                {fetchingLocation && <Loader2 className="ml-2 animate-spin w-4 h-4 text-orange-500" />}
              </Button>
            </div>
            <div className="mb-4" style={{height: 320}}>
              <div className="text-xs text-gray-500 mb-2 font-semibold tracking-wide">SAVED ADDRESSES</div>
              <ul className="bg-white rounded-lg border border-gray-200 divide-y" style={{overflow: 'visible', maxHeight: 'none'}}>
                {saved.map(addr => (
                  <li key={addr.label} className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => handleAddressClick(addr)}>
                    {getIconComponent(addr.icon)}
                    <div>
                      <div className="font-semibold text-sm">{addr.label}</div>
                      <div className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{addr.address}</div>
                    </div>
                  </li>
                ))}
                <li className="px-4 py-2 text-xs text-blue-600 cursor-pointer hover:underline flex items-center" onClick={() => setShowAddForm(!showAddForm)}><Plus className="w-4 h-4 mr-1" />ADD NEW ADDRESS</li>
                {showAddForm && (
                  <li className="px-4 py-2 bg-gray-50 rounded">
                    <form onSubmit={handleAddAddress}>
                      <div className="mb-2"><Input placeholder="Label (e.g. Home, Work)" value={addForm.label} onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))} /></div>
                      <div className="mb-2"><Input placeholder="Flat, Building, etc." value={addForm.details} onChange={e => setAddForm(f => ({ ...f, details: e.target.value }))} /></div>
                      <div className="mb-2"><Input placeholder="Landmark (optional)" value={addForm.landmark} onChange={e => setAddForm(f => ({ ...f, landmark: e.target.value }))} /></div>
                      <Button type="submit" className="w-full" size="sm">Save Address</Button>
                    </form>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="p-6 flex flex-col" style={{ minHeight: 400, overflowX: 'hidden' }}>
            <Button variant="ghost" size="icon" onClick={() => setStep(1)}><X /></Button>
            <DialogTitle className="text-lg font-semibold mb-2">Set delivery location</DialogTitle>
            <div className="mb-4" style={{ height: 250, borderRadius: 12, overflow: 'hidden', position: 'relative', width: '100%' }}>
              {/* Always render the map container, even if location is not set yet */}
              <div ref={mapRef} style={{ height: 250, borderRadius: 12, width: '100%' }} />
              {/* Show spinner overlay if location is not set */}
              {(!location || isLoading) && <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><Loader2 className="animate-spin w-8 h-8 text-orange-500" /></div>}
            </div>
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Address</div>
              <div className="font-semibold text-base break-words max-w-full overflow-hidden text-ellipsis" style={{wordBreak: 'break-word'}}>{address}</div>
            </div>
            <Button className="w-full mb-2" variant="outline" onClick={() => setShowAddForm(true)}>ADD MORE DETAILS <span className="text-xs text-gray-400 ml-2">for faster checkout</span></Button>
            {showAddForm && (
              <div className="mb-2">
                <form onSubmit={handleAddAddress} className="space-y-2">
                  <Input placeholder="Label (e.g. Home, Work)" value={addForm.label} onChange={e => setAddForm(f => ({ ...f, label: e.target.value }))} />
                  <Input placeholder="Flat, Building, etc." value={addForm.details} onChange={e => setAddForm(f => ({ ...f, details: e.target.value }))} />
                  <Input placeholder="Landmark (optional)" value={addForm.landmark} onChange={e => setAddForm(f => ({ ...f, landmark: e.target.value }))} />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" size="sm">Save Address</Button>
                    <Button type="button" className="flex-1" size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold" onClick={handleConfirm}>SKIP & ADD LATER <span className="text-xs font-normal">to quickly see restaurants</span></Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker; 