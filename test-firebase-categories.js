// Test script to check Firebase categories
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkCategories() {
  try {
    console.log('Checking categories in Firebase...');
    
    // Check categories collection
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    console.log(`\nFound ${categoriesSnapshot.size} categories:`);
    console.log('='.repeat(50));
    
    const categoriesByType = {
      food: [],
      drinks: [],
      daily_essential: []
    };
    
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`  Name: ${data.name}`);
      console.log(`  Display Name: ${data.displayName}`);
      console.log(`  Category: ${data.category}`);
      console.log(`  Subcategory: ${data.subcategory}`);
      console.log(`  Icon: ${data.icon}`);
      console.log('  ---');
      
      if (data.category && categoriesByType[data.category]) {
        categoriesByType[data.category].push(data);
      }
    });
    
    console.log('\nCategories by type:');
    console.log('='.repeat(50));
    
    Object.entries(categoriesByType).forEach(([type, cats]) => {
      console.log(`\n${type.toUpperCase()} (${cats.length} categories):`);
      cats.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.subcategory}) - ${cat.icon}`);
      });
    });
    
    // Check products collection
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    console.log(`\nFound ${productsSnapshot.size} products:`);
    console.log('='.repeat(50));
    const categories = new Set();
    const subcategories = new Set();
    
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      categories.add(data.category);
      subcategories.add(data.subcategory);
    });
    
    console.log('Product categories:', Array.from(categories));
    console.log('Product subcategories:', Array.from(subcategories));
    
  } catch (error) {
    console.error('Error checking Firebase data:', error);
  }
}

checkCategories(); 