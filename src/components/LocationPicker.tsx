import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  currentLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation
}) => {
  const { isDarkMode } = useTheme();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (currentLocation) {
        setLocation(currentLocation);
        initializeMap(currentLocation);
      } else {
        getCurrentLocation();
      }
    } else {
      // Cleanup map when dialog closes
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    }
  }, [isOpen, currentLocation]);

  const initializeMap = (centerLocation: { lat: number; lng: number }) => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView([centerLocation.lat, centerLocation.lng], 15);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Add draggable marker
    markerInstance.current = L.marker([centerLocation.lat, centerLocation.lng], {
      draggable: true
    }).addTo(mapInstance.current);

    // Handle marker drag events
    markerInstance.current.on('dragend', (event) => {
      const marker = event.target;
      const position = marker.getLatLng();
      const newLocation = { lat: position.lat, lng: position.lng };
      setLocation(newLocation);
      reverseGeocode(position.lat, position.lng);
    });

    // Handle map click events
    mapInstance.current.on('click', (event) => {
      const { lat, lng } = event.latlng;
      const newLocation = { lat, lng };
      setLocation(newLocation);
      
      // Move marker to clicked position
      if (markerInstance.current) {
        markerInstance.current.setLatLng([lat, lng]);
      }
      
      reverseGeocode(lat, lng);
    });

    // Get initial address
    reverseGeocode(centerLocation.lat, centerLocation.lng);
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setLocation(newLocation);
        initializeMap(newLocation);
        toast.success('Current location detected!');
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (error instanceof GeolocationPositionError) {
        if (error.code === 1) {
          toast.error('Location access denied. Please enable location permissions.');
        } else if (error.code === 2) {
          toast.error('Location unavailable. Please check your GPS settings.');
        } else if (error.code === 3) {
          toast.error('Location request timed out. Please try again.');
        }
      } else {
        toast.error('Could not get your location. Please click on the map to select your location.');
      }
      
      // Set default location (Kolkata)
      const defaultLocation = { lat: 22.5726, lng: 88.3639 };
      setLocation(defaultLocation);
      initializeMap(defaultLocation);
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
    }
  };

  const handleConfirmLocation = () => {
    if (location && address) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        address: address
      });
      onClose();
    } else {
      toast.error('Please select a valid location');
    }
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const newLocation = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        setLocation(newLocation);
        
        // Update map and marker
        if (mapInstance.current && markerInstance.current) {
          mapInstance.current.setView([newLocation.lat, newLocation.lng], 15);
          markerInstance.current.setLatLng([newLocation.lat, newLocation.lng]);
        }
        
        toast.success('Location found!');
      } else {
        toast.error('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('Error searching address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Delivery Location
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Click on the map or drag the marker to your exact delivery location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Address Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search for an address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`flex-1 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
            />
            <Button
              onClick={handleAddressSearch}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            </Button>
          </div>

          {/* Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            disabled={isLoading}
            variant="outline"
            className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLoading ? 'Getting location...' : 'Use Current Location'}
          </Button>

          {/* Leaflet Map Container */}
          <div className="relative border rounded-lg overflow-hidden">
            <div
              ref={mapRef}
              className="w-full h-64"
              style={{ zIndex: 1 }}
            />
            
            {/* Map Instructions Overlay */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
              <p className="font-medium">Map Instructions:</p>
              <p>• Click anywhere to place marker</p>
              <p>• Drag the marker to move it</p>
            </div>

            {/* Location Info */}
            {location && (
              <div className={`absolute bottom-2 left-2 right-2 p-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}>
                <p className="text-xs font-medium">Selected Location:</p>
                <p className="text-xs opacity-75 mb-1">
                  {address || `Address not available`}
                </p>
                <p className="text-xs opacity-75 font-mono">
                  📍 Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLocation}
              disabled={!location}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker; 