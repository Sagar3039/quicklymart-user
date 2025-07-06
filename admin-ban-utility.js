// Admin utility script to manage user bans
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBhiSxNUrQ4b_iwpYr4F_J1UW3XOwzsMmE",
  authDomain: "dsa-squad.firebaseapp.com",
  databaseURL: "https://dsa-squad-default-rtdb.firebaseio.com",
  projectId: "dsa-squad",
  storageBucket: "dsa-squad.firebasestorage.app",
  messagingSenderId: "762339454857",
  appId: "1:762339454857:web:bfc50ed181e2daefe2fb58",
  measurementId: "G-WCPR6FCESS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility functions for managing user bans
const banUser = async (userId, reason = 'Violation of terms of service', duration = null) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User not found');
      return false;
    }
    
    const banExpiry = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null; // duration in hours
    
    await updateDoc(userRef, {
      isBanned: true,
      banReason: reason,
      banDate: new Date(),
      banExpiry: banExpiry,
      updatedAt: new Date()
    });
    
    console.log(`User ${userId} has been banned. Reason: ${reason}`);
    if (banExpiry) {
      console.log(`Ban expires: ${banExpiry.toLocaleString()}`);
    } else {
      console.log('This is a permanent ban');
    }
    
    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    return false;
  }
};

const unbanUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User not found');
      return false;
    }
    
    await updateDoc(userRef, {
      isBanned: false,
      banReason: '',
      banDate: null,
      banExpiry: null,
      updatedAt: new Date()
    });
    
    console.log(`User ${userId} has been unbanned`);
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
};

const checkUserBanStatus = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User not found');
      return null;
    }
    
    const userData = userDoc.data();
    const isBanned = userData.isBanned || false;
    const banReason = userData.banReason || '';
    const banDate = userData.banDate?.toDate();
    const banExpiry = userData.banExpiry?.toDate();
    
    console.log(`User: ${userId}`);
    console.log(`Banned: ${isBanned}`);
    console.log(`Reason: ${banReason}`);
    console.log(`Ban Date: ${banDate?.toLocaleString() || 'N/A'}`);
    console.log(`Ban Expiry: ${banExpiry?.toLocaleString() || 'N/A'}`);
    
    if (banExpiry && new Date() > banExpiry) {
      console.log('⚠️  Ban has expired but not yet cleared');
    }
    
    return {
      isBanned,
      banReason,
      banDate,
      banExpiry
    };
  } catch (error) {
    console.error('Error checking user ban status:', error);
    return null;
  }
};

const listBannedUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const bannedUsers = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.isBanned) {
        bannedUsers.push({
          id: doc.id,
          displayName: userData.displayName || 'Unknown',
          email: userData.email || 'No email',
          banReason: userData.banReason || 'No reason provided',
          banDate: userData.banDate?.toDate(),
          banExpiry: userData.banExpiry?.toDate(),
          isExpired: userData.banExpiry && new Date() > userData.banExpiry.toDate()
        });
      }
    });
    
    console.log(`Found ${bannedUsers.length} banned users:`);
    bannedUsers.forEach(user => {
      console.log(`\n- ${user.displayName} (${user.id})`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Reason: ${user.banReason}`);
      console.log(`  Banned: ${user.banDate?.toLocaleString()}`);
      console.log(`  Expires: ${user.banExpiry?.toLocaleString() || 'Permanent'}`);
      if (user.isExpired) {
        console.log(`  ⚠️  EXPIRED`);
      }
    });
    
    return bannedUsers;
  } catch (error) {
    console.error('Error listing banned users:', error);
    return [];
  }
};

// Example usage functions
const testBanSystem = async () => {
  console.log('=== Testing Ban System ===');
  
  // Example user ID (replace with actual user ID)
  const testUserId = 'example-user-id';
  
  // Check current status
  console.log('\n1. Checking current ban status...');
  await checkUserBanStatus(testUserId);
  
  // Ban user for 1 hour
  console.log('\n2. Banning user for 1 hour...');
  await banUser(testUserId, 'Test ban - 1 hour duration', 1);
  
  // Check status again
  console.log('\n3. Checking ban status after ban...');
  await checkUserBanStatus(testUserId);
  
  // List all banned users
  console.log('\n4. Listing all banned users...');
  await listBannedUsers();
  
  // Unban user
  console.log('\n5. Unbanning user...');
  await unbanUser(testUserId);
  
  // Check final status
  console.log('\n6. Checking final status...');
  await checkUserBanStatus(testUserId);
};

// Export functions for use in other scripts
export {
  banUser,
  unbanUser,
  checkUserBanStatus,
  listBannedUsers,
  testBanSystem
};

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBanSystem().then(() => {
    console.log('\n=== Test completed ===');
    process.exit(0);
  }).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
} 