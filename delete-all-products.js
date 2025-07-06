const { db } = require('./src/lib/firebase');
const { collection, getDocs, deleteDoc } = require('firebase/firestore');

async function deleteAllProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  const deletePromises = [];
  snapshot.forEach(doc => {
    deletePromises.push(deleteDoc(doc.ref));
  });
  await Promise.all(deletePromises);
  console.log('All products deleted from Firestore.');
}

deleteAllProducts().catch(console.error); 