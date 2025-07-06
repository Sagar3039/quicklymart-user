import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, createContext, useContext, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { getRedirectResult } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "@/components/ui/sonner";
import { initializeCategories, syncMissingSubcategories } from "@/lib/products";
import Index from "./pages/Index";
import Food from "./pages/Food";
import DailyEssential from "./pages/DailyEssential";
import Drinks from "./pages/Drinks";
import Profile from "./pages/Profile";
import PastOrders from "./pages/PastOrders";
import CurrentOrder from "./pages/CurrentOrder";
import Settings from "./pages/Settings";
import Address from "./pages/Address";
import NotFound from "./pages/NotFound";
import AllCategories from "./pages/AllCategories";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import TrackOrder from "./pages/TrackOrder";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UserOnboarding from "./components/UserOnboarding";
import BanCheck from "./components/BanCheck";
import { CartProvider } from "./contexts/CartContext";

const queryClient = new QueryClient();

// Theme Context
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Selected address context
interface SelectedAddressContextType {
  selectedAddress: any;
  setSelectedAddress: (address: any) => void;
}

const SelectedAddressContext = createContext<SelectedAddressContextType | undefined>(undefined);

export const useSelectedAddress = () => {
  const context = useContext(SelectedAddressContext);
  if (!context) {
    throw new Error('useSelectedAddress must be used within a SelectedAddressProvider');
  }
  return context;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage and apply it
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const isDark = savedTheme === 'true';
    setIsDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // Apply theme to document
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    applyTheme(newDarkMode);
    
    // Update in Firestore if user is logged in
    if (auth.currentUser) {
      updateUserTheme(auth.currentUser.uid, newDarkMode);
    }
  };

  // Set dark mode explicitly
  const setDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem('darkMode', dark.toString());
    applyTheme(dark);
    
    // Update in Firestore if user is logged in
    if (auth.currentUser) {
      updateUserTheme(auth.currentUser.uid, dark);
    }
  };

  // Update theme in Firestore
  const updateUserTheme = async (userId: string, darkMode: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'settings.darkMode': darkMode,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating theme in Firestore:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

const App = () => {
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const saved = localStorage.getItem('pickngo-selected-address');
    return saved ? JSON.parse(saved) : null;
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize Firebase data
  useEffect(() => {
    const initializeFirebaseData = async () => {
      try {
        await initializeCategories();
        await syncMissingSubcategories();
        console.log('Firebase data initialized successfully');
      } catch (error) {
        console.error('Error initializing Firebase data:', error);
      }
    };

    initializeFirebaseData();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem('pickngo-selected-address', JSON.stringify(selectedAddress));
    } else {
      localStorage.removeItem('pickngo-selected-address');
    }
  }, [selectedAddress]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast.success('Google sign-in successful!');
          // Check onboarding status for new users
          await checkUserOnboarding(result.user);
        }
      } catch (error) {
        console.error('Google sign-in redirect error:', error);
        toast.error('Google sign-in failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkUserOnboarding(user);
      } else {
        setShowOnboarding(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserOnboarding = async (user: any) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || !userDoc.data()?.isOnboarded) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking user onboarding status:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
  <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SelectedAddressContext.Provider value={{ selectedAddress, setSelectedAddress }}>
          <CartProvider>
            <TooltipProvider>
              <Sonner position="top-right" />
              <BrowserRouter>
                <BanCheck>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/food" element={<Food />} />
                    <Route path="/daily-essential" element={<DailyEssential />} />
                    <Route path="/drinks" element={<Drinks />} />
                    <Route path="/all-categories" element={<AllCategories />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/past-orders" element={<PastOrders />} />
                    <Route path="/current-order/:orderId" element={<CurrentOrder />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/address" element={<Address />} />
                    <Route path="/help-center" element={<HelpCenter />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BanCheck>
              </BrowserRouter>
            </TooltipProvider>
            
            {/* User Onboarding Modal */}
            <UserOnboarding 
              isOpen={showOnboarding} 
              onComplete={handleOnboardingComplete}
            />
          </CartProvider>
        </SelectedAddressContext.Provider>
      </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
