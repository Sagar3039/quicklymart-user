// Script to clean up duplicate categories
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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

// Category icon mapping
const categoryIcons = {
  'All': '🌐',
  'Biryani': '🍛',
  'Burgers': '🍔',
  'Chinese': '🥡',
  'Desserts': '🍰',
  'Indian': '🍛',
  'Pizzas': '🍕',
  'Beer': '🍺',
  'Wine': '🍷',
  'Spirits': '🥃',
  'Cocktails': '🍹',
  'Staples': '🛒',
  'Snacks': '🍿',
  'Beverages': '🥤',
  'Personal Care': '🧴',
  'Household': '🏠',
  'Duck': '🦆', // Fix the malformed "Duck" category
};

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

async function fixCategoryDisplay() {
  console.log('Fixing category display issues...');
  
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
    
    // Find categories with image URLs in icon field
    const categoriesWithImageUrls = categories.filter(cat => 
      cat.icon && typeof cat.icon === 'string' && cat.icon.startsWith('http')
    );
    
    console.log(`Found ${categoriesWithImageUrls.length} categories with image URLs in icon field`);
    
    // Fix categories with image URLs in icon field
    for (const cat of categoriesWithImageUrls) {
      const properIcon = categoryIcons[cat.name];
      if (properIcon) {
        console.log(`Fixing category "${cat.name}": replacing image URL with emoji icon`);
        await updateDoc(doc(db, 'categories', cat.id), {
          icon: properIcon
        });
      } else {
        console.log(`Deleting category "${cat.name}" with image URL in icon field (no proper icon mapping)`);
        await deleteDoc(doc(db, 'categories', cat.id));
      }
    }
    
    // Remove categories with empty or malformed names
    const malformedCategories = categories.filter(cat => 
      !cat.name || cat.name.trim() === '' || cat.name === '🥐' || cat.name === '📦'
    );
    
    console.log(`Found ${malformedCategories.length} categories with malformed names`);
    
    for (const cat of malformedCategories) {
      console.log(`Deleting malformed category: "${cat.name}" (ID: ${cat.id})`);
      await deleteDoc(doc(db, 'categories', cat.id));
    }
    
    // Fix categories with missing icons
    const categoriesWithoutIcons = categories.filter(cat => 
      !cat.icon && categoryIcons[cat.name]
    );
    
    console.log(`Found ${categoriesWithoutIcons.length} categories without icons`);
    
    for (const cat of categoriesWithoutIcons) {
      console.log(`Adding icon to category "${cat.name}"`);
      await updateDoc(doc(db, 'categories', cat.id), {
        icon: categoryIcons[cat.name]
      });
    }
    
    console.log('Category display fixes completed successfully');
    
  } catch (error) {
    console.error('Error during category display fix:', error);
  }
}

// Run both cleanup functions
async function runCleanup() {
  await cleanupDuplicates();
  await fixCategoryDisplay();
}

runCleanup(); 