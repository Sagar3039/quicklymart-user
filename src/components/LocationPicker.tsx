import React, { useState, useEffect, useRef } from 'react';

import { MapPin, Navigation, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyC0aUsBjWppu-5sSvme3Zz66Ts9aFKOYRs';
  const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];
  const mapContainerStyle = { width: '100%', height: '300px' };
  const defaultCenter = { lat: 22.5726, lng: 88.3639 };
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: GOOGLE_MAPS_LIBRARIES });

  useEffect(() => {
    if (isOpen) {
      if (currentLocation) {
        setLocation(currentLocation);
      } else {
        getCurrentLocation();
      }
    } else {
      // Cleanup map when dialog closes
    }
  }, [isOpen, currentLocation]);

  // Initialize AutocompleteService and PlacesService when map is loaded
  useEffect(() => {
    if (window.google && window.google.maps && isLoaded) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // Fetch Google Places predictions as user types
  useEffect(() => {
    if (!autocompleteServiceRef.current || searchInput.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSuggestionLoading(true);
    autocompleteServiceRef.current.getPlacePredictions({
      input: searchInput,
      componentRestrictions: { country: 'in' },
      types: ['geocode', 'establishment'],
    }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSuggestionLoading(false);
    });
  }, [searchInput, isLoaded]);

  // When user clicks outside, close suggestions
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !(inputRef.current as HTMLElement).contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="Search for an address..."
                className={`w-full ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                autoComplete="off"
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  setAddress(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  {suggestionLoading && <div className="p-2 text-sm">Loading...</div>}
                  {suggestions.map((s, idx) => (
                    <div
                      key={s.place_id || idx}
                      className="p-2 cursor-pointer hover:bg-orange-100 dark:hover:bg-gray-700 text-sm"
                      onClick={() => {
                        setSearchInput(s.description);
                        setAddress(s.description);
                        setShowSuggestions(false);
                        // Get place details for lat/lng
                        if (placesServiceRef.current && s.place_id) {
                          placesServiceRef.current.getDetails({ placeId: s.place_id }, (place, status) => {
                            if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                              const lat = place.geometry.location.lat();
                              const lng = place.geometry.location.lng();
                              setLocation({ lat, lng });
                              if (mapRef.current) {
                                mapRef.current.panTo({ lat, lng });
                              }
                            }
                          });
                        }
                      }}
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                if (location) reverseGeocode(location.lat, location.lng);
              }}
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
          <div
            className="relative border rounded-lg overflow-hidden"
          >
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location || defaultCenter}
                zoom={15}
                onLoad={map => {
                  mapRef.current = map;
                  if (!placesServiceRef.current) {
                    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
                  }
                }}
                onClick={e => {
                  const lat = e.latLng?.lat();
                  const lng = e.latLng?.lng();
                  if (lat && lng) {
                    setLocation({ lat, lng });
                    reverseGeocode(lat, lng);
                  }
                }}
                options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
              >
                {location && (
                  <Marker
                    position={location}
                    draggable
                    onDragEnd={e => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (lat && lng) {
                        setLocation({ lat, lng });
                        reverseGeocode(lat, lng);
                      }
                    }}
                  />
                )}
              </GoogleMap>
            )}
            
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