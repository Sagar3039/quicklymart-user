// Script to clean up duplicate categories
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBvOkJgJgJgJgJgJgJgJgJgJgJgJgJgJgJg",
  authDomain: "quicklymart-user.firebaseapp.com",
  projectId: "quicklymart-user",
  storageBucket: "quicklymart-user.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicates() {
  console.log('Cleaning up duplicate categories...');
  
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Group by category and subcategory
    const grouped = {};
    const duplicates = [];
    const toDelete = [];
    
    categories.forEach(cat => {
      const key = `${cat.category}-${cat.subcategory}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(cat);
    });
    
    // Find duplicates
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length > 1) {
        console.log(`Duplicate found: ${key} (ID: ${grouped[key][1].id})`);
        duplicates.push(key);
        toDelete.push(grouped[key][1].id); // Keep the first one, delete the rest
      }
    });
    
    // Also remove strange test categories
    const strangeCategories = categories.filter(cat => 
      cat.name === 'vindi' || cat.name === 'randi'
    );
    
    strangeCategories.forEach(cat => {
      console.log(`Removing strange category: ${cat.name} (ID: ${cat.id})`);
      toDelete.push(cat.id);
    });
    
    // Remove duplicate Personal Care categories (keep the one with underscore)
    const personalCareCategories = categories.filter(cat => 
      cat.name === 'Personal Care'
    );
    
    if (personalCareCategories.length > 1) {
      const toKeep = personalCareCategories.find(cat => cat.subcategory === 'personal_care');
      const toRemove = personalCareCategories.find(cat => cat.subcategory === 'personal care');
      
      if (toKeep && toRemove) {
        console.log(`Removing duplicate Personal Care: ${toRemove.subcategory} (ID: ${toRemove.id})`);
        toDelete.push(toRemove.id);
      }
    }
    
    console.log(`Found ${toDelete.length} items to delete`);
    
    // Delete duplicates
    for (const id of toDelete) {
      await deleteDoc(doc(db, 'categories', id));
      console.log(`Deleted: ${id}`);
    }
    
    console.log('Cleanup completed successfully');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupDuplicates(); 