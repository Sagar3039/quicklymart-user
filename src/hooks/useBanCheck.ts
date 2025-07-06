import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from '@/components/ui/sonner';

interface BanStatus {
  isBanned: boolean;
  banReason?: string;
  banDate?: Date;
  banExpiry?: Date;
  isLoading: boolean;
}

export const useBanCheck = () => {
  const [banStatus, setBanStatus] = useState<BanStatus>({
    isBanned: false,
    isLoading: true
  });
  const [user, setUser] = useState<any>(null);

  // Check ban status for a user
  const checkBanStatus = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isBanned = userData.isBanned || false;
        const banReason = userData.banReason || '';
        const banDate = userData.banDate?.toDate();
        const banExpiry = userData.banExpiry?.toDate();
        
        // Check if ban has expired
        let isCurrentlyBanned = isBanned;
        if (banExpiry && new Date() > banExpiry) {
          isCurrentlyBanned = false;
          // Update the user document to remove ban
          await updateBanStatus(userId, false);
        }
        
        setBanStatus({
          isBanned: isCurrentlyBanned,
          banReason,
          banDate,
          banExpiry,
          isLoading: false
        });
        
        // Show ban message if user is banned
        if (isCurrentlyBanned) {
          toast.error(`Your account has been suspended. Reason: ${banReason || 'Violation of terms of service'}`);
        }
      } else {
        setBanStatus({
          isBanned: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error checking ban status:', error);
      setBanStatus({
        isBanned: false,
        isLoading: false
      });
    }
  };

  // Update ban status in Firestore
  const updateBanStatus = async (userId: string, isBanned: boolean, reason?: string, expiry?: Date) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned,
        banReason: reason || '',
        banDate: isBanned ? new Date() : null,
        banExpiry: expiry || null,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating ban status:', error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Initial ban check
        checkBanStatus(currentUser.uid);
        
        // Set up real-time listener for ban status changes
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const isBanned = userData.isBanned || false;
            const banReason = userData.banReason || '';
            const banDate = userData.banDate?.toDate();
            const banExpiry = userData.banExpiry?.toDate();
            
            // Check if ban has expired
            let isCurrentlyBanned = isBanned;
            if (banExpiry && new Date() > banExpiry) {
              isCurrentlyBanned = false;
              // Update the user document to remove ban
              updateBanStatus(currentUser.uid, false);
            }
            
            setBanStatus({
              isBanned: isCurrentlyBanned,
              banReason,
              banDate,
              banExpiry,
              isLoading: false
            });
            
            // Show ban message if user is banned
            if (isCurrentlyBanned) {
              toast.error(`Your account has been suspended. Reason: ${banReason || 'Violation of terms of service'}`);
            }
          } else {
            setBanStatus({
              isBanned: false,
              isLoading: false
            });
          }
        });
        
        return () => unsubscribeSnapshot();
      } else {
        setBanStatus({
          isBanned: false,
          isLoading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Set up periodic ban check every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkBanStatus(user.uid);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  return {
    banStatus,
    user,
    checkBanStatus: () => user && checkBanStatus(user.uid),
    updateBanStatus: (isBanned: boolean, reason?: string, expiry?: Date) => 
      user && updateBanStatus(user.uid, isBanned, reason, expiry)
  };
}; 