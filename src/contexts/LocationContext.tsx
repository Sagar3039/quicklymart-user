import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (loc: LocationData | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selected-location');
    if (stored) {
      try {
        setLocationState(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (location) {
      localStorage.setItem('selected-location', JSON.stringify(location));
    }
  }, [location]);

  const setLocation = (loc: LocationData | null) => {
    setLocationState(loc);
    if (loc) {
      localStorage.setItem('selected-location', JSON.stringify(loc));
    } else {
      localStorage.removeItem('selected-location');
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}; 