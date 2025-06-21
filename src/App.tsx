import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, createContext, useContext, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { getRedirectResult } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "@/components/ui/sonner";
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
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast.success('Google sign-in successful!');
        }
      } catch (error) {
        console.error('Google sign-in redirect error:', error);
        toast.error('Google sign-in failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/food" element={<Food />} />
              <Route path="/daily-essential" element={<DailyEssential />} />
              <Route path="/drinks" element={<Drinks />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/past-orders" element={<PastOrders />} />
              <Route path="/current-order/:orderId" element={<CurrentOrder />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/address" element={<Address />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
