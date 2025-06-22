// Script to update momo category icon
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

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

async function updateMomoIcon() {
  try {
    console.log('Updating momo category icon...');
    
    // Find the momo category
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('subcategory', '==', 'momo'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const momoDoc = querySnapshot.docs[0];
      console.log('Found momo category:', momoDoc.data());
      
      // Update the icon
      await updateDoc(doc(db, 'categories', momoDoc.id), {
        icon: '🥟',
        updatedAt: new Date()
      });
      
      console.log('Successfully updated momo icon to 🥟');
    } else {
      console.log('No momo category found');
    }
    
  } catch (error) {
    console.error('Error updating momo icon:', error);
  }
}

updateMomoIcon(); 