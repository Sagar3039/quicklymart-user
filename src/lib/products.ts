import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, DocumentData, limit } from 'firebase/firestore';

// Product interface
export interface Product {
  id?: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  subcategory: string;
  description: string;
  deliveryTime: string;
  inStock: boolean;
  isVeg?: boolean;
  discount?: string;
  offer?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Category interface
export interface Category {
  id?: string;
  name: string;
  icon: string;
  category: string; // food, drinks, daily_essential
  subcategory: string;
  displayName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product categories
export const PRODUCT_CATEGORIES = {
  FOOD: 'food',
  DRINKS: 'drinks',
  DAILY_ESSENTIAL: 'daily_essential'
};

// Product subcategories
export const PRODUCT_SUBCATEGORIES = {
  // Food subcategories
  PIZZAS: 'pizzas',
  BURGERS: 'burgers',
  BIRYANI: 'biryani',
  CHINESE: 'chinese',
  INDIAN: 'indian',
  DESSERTS: 'desserts',
  
  // Drinks subcategories
  BEER: 'beer',
  WINE: 'wine',
  SPIRITS: 'spirits',
  COCKTAILS: 'cocktails',
  
  // Daily Essential subcategories
  STAPLES: 'staples',
  SNACKS: 'snacks',
  BEVERAGES: 'beverages',
  PERSONAL_CARE: 'personal_care',
  HOUSEHOLD: 'household'
};

// Sample categories data
export const SAMPLE_CATEGORIES: Category[] = [
  // Food categories
  { name: 'All', icon: '🌐', category: PRODUCT_CATEGORIES.FOOD, subcategory: 'all', displayName: 'All' },
  { name: 'Pizzas', icon: '🍕', category: PRODUCT_CATEGORIES.FOOD, subcategory: PRODUCT_SUBCATEGORIES.PIZZAS, displayName: 'Pizzas' },
  { name: 'Biryani', icon: '🍛', category: PRODUCT_CATEGORIES.FOOD, subcategory: PRODUCT_SUBCATEGORIES.BIRYANI, displayName: 'Biryani' },
  { name: 'Chinese', icon: '🥡', category: PRODUCT_CATEGORIES.FOOD, subcategory: PRODUCT_SUBCATEGORIES.CHINESE, displayName: 'Chinese' },
  { name: 'Burgers', icon: '🍔', category: PRODUCT_CATEGORIES.FOOD, subcategory: PRODUCT_SUBCATEGORIES.BURGERS, displayName: 'Burgers' },
  { name: 'Indian', icon: '🍛', category: PRODUCT_CATEGORIES.FOOD, subcategory: PRODUCT_SUBCATEGORIES.INDIAN, displayName: 'Indian' },
  { name: 'Desserts', icon: '🍰', category: PRODUCT_CATEGORIES.FOOD, subcategory: PRODUCT_SUBCATEGORIES.DESSERTS, displayName: 'Desserts' },
  
  // Drinks categories
  { name: 'All', icon: '🌐', category: PRODUCT_CATEGORIES.DRINKS, subcategory: 'all', displayName: 'All' },
  { name: 'Beer', icon: '🍺', category: PRODUCT_CATEGORIES.DRINKS, subcategory: PRODUCT_SUBCATEGORIES.BEER, displayName: 'Beer' },
  { name: 'Wine', icon: '🍷', category: PRODUCT_CATEGORIES.DRINKS, subcategory: PRODUCT_SUBCATEGORIES.WINE, displayName: 'Wine' },
  { name: 'Spirits', icon: '🥃', category: PRODUCT_CATEGORIES.DRINKS, subcategory: PRODUCT_SUBCATEGORIES.SPIRITS, displayName: 'Spirits' },
  { name: 'Cocktails', icon: '🍹', category: PRODUCT_CATEGORIES.DRINKS, subcategory: PRODUCT_SUBCATEGORIES.COCKTAILS, displayName: 'Cocktails' },
  
  // Daily Essential categories
  { name: 'All', icon: '🌐', category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL, subcategory: 'all', displayName: 'All' },
  { name: 'Staples', icon: '🛒', category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL, subcategory: PRODUCT_SUBCATEGORIES.STAPLES, displayName: 'Staples' },
  { name: 'Snacks', icon: '🍿', category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL, subcategory: PRODUCT_SUBCATEGORIES.SNACKS, displayName: 'Snacks' },
  { name: 'Beverages', icon: '🥤', category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL, subcategory: PRODUCT_SUBCATEGORIES.BEVERAGES, displayName: 'Beverages' },
  { name: 'Personal Care', icon: '🧴', category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL, subcategory: PRODUCT_SUBCATEGORIES.PERSONAL_CARE, displayName: 'Personal Care' },
  { name: 'Household', icon: '🏠', category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL, subcategory: PRODUCT_SUBCATEGORIES.HOUSEHOLD, displayName: 'Household' }
];

// Sample product data for all categories
export const SAMPLE_PRODUCTS: Product[] = [
  // Food Products
  {
    name: "Domino's Pizza",
    price: 250,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    category: PRODUCT_CATEGORIES.FOOD,
    subcategory: PRODUCT_SUBCATEGORIES.PIZZAS,
    description: 'Delicious pizza with fresh toppings',
    deliveryTime: '20-25 mins',
    inStock: true,
    isVeg: false,
    discount: '20% OFF',
    tags: ['pizza', 'italian', 'cheese', 'tomato']
  },
  {
    name: 'Spice N Ice Biryani',
    price: 220,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    category: PRODUCT_CATEGORIES.FOOD,
    subcategory: PRODUCT_SUBCATEGORIES.BIRYANI,
    description: 'Aromatic biryani with tender meat',
    deliveryTime: '25-30 mins',
    inStock: true,
    isVeg: false,
    offer: 'BUY1 GET1',
    tags: ['biryani', 'rice', 'spicy', 'indian']
  },
  {
    name: 'China Nation Noodles',
    price: 180,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
    category: PRODUCT_CATEGORIES.FOOD,
    subcategory: PRODUCT_SUBCATEGORIES.CHINESE,
    description: 'Stir-fried noodles with vegetables',
    deliveryTime: '15-20 mins',
    inStock: true,
    isVeg: true,
    tags: ['noodles', 'chinese', 'vegetarian', 'stir-fry']
  },
  {
    name: 'Classic Burger',
    price: 150,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: PRODUCT_CATEGORIES.FOOD,
    subcategory: PRODUCT_SUBCATEGORIES.BURGERS,
    description: 'Juicy beef burger with fresh vegetables',
    deliveryTime: '18-22 mins',
    inStock: true,
    isVeg: false,
    discount: '15% OFF',
    tags: ['burger', 'beef', 'fast-food', 'american']
  },
  {
    name: 'Butter Chicken',
    price: 280,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    category: PRODUCT_CATEGORIES.FOOD,
    subcategory: PRODUCT_SUBCATEGORIES.INDIAN,
    description: 'Creamy butter chicken with naan',
    deliveryTime: '30-35 mins',
    inStock: true,
    isVeg: false,
    tags: ['chicken', 'indian', 'curry', 'butter']
  },
  {
    name: 'Chocolate Cake',
    price: 120,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    category: PRODUCT_CATEGORIES.FOOD,
    subcategory: PRODUCT_SUBCATEGORIES.DESSERTS,
    description: 'Rich chocolate cake with cream',
    deliveryTime: '20-25 mins',
    inStock: true,
    isVeg: true,
    tags: ['cake', 'chocolate', 'dessert', 'sweet']
  },

  // Drinks Products
  {
    name: 'Heineken Beer',
    price: 120,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    category: PRODUCT_CATEGORIES.DRINKS,
    subcategory: PRODUCT_SUBCATEGORIES.BEER,
    description: 'Premium lager beer',
    deliveryTime: '30-45 mins',
    inStock: true,
    tags: ['beer', 'lager', 'alcohol', 'premium']
  },
  {
    name: 'Red Wine',
    price: 450,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    category: PRODUCT_CATEGORIES.DRINKS,
    subcategory: PRODUCT_SUBCATEGORIES.WINE,
    description: 'Smooth red wine',
    deliveryTime: '30-45 mins',
    inStock: true,
    discount: '10% OFF',
    tags: ['wine', 'red', 'alcohol', 'premium']
  },
  {
    name: 'Whiskey',
    price: 800,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    category: PRODUCT_CATEGORIES.DRINKS,
    subcategory: PRODUCT_SUBCATEGORIES.SPIRITS,
    description: 'Premium whiskey',
    deliveryTime: '30-45 mins',
    inStock: true,
    tags: ['whiskey', 'spirits', 'alcohol', 'premium']
  },
  {
    name: 'Mojito Cocktail',
    price: 180,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    category: PRODUCT_CATEGORIES.DRINKS,
    subcategory: PRODUCT_SUBCATEGORIES.COCKTAILS,
    description: 'Refreshing mojito cocktail',
    deliveryTime: '25-35 mins',
    inStock: true,
    tags: ['cocktail', 'mojito', 'alcohol', 'refreshing']
  },

  // Daily Essential Products
  {
    name: 'Basmati Rice',
    price: 80,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL,
    subcategory: PRODUCT_SUBCATEGORIES.STAPLES,
    description: 'Premium basmati rice',
    deliveryTime: '60-90 mins',
    inStock: true,
    discount: '5% OFF',
    tags: ['rice', 'basmati', 'staples', 'grocery']
  },
  {
    name: 'Potato Chips',
    price: 30,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL,
    subcategory: PRODUCT_SUBCATEGORIES.SNACKS,
    description: 'Crispy potato chips',
    deliveryTime: '60-90 mins',
    inStock: true,
    tags: ['chips', 'snacks', 'potato', 'crispy']
  },
  {
    name: 'Coca Cola',
    price: 40,
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1554866585-aa94861d3f78?w=400',
    category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL,
    subcategory: PRODUCT_SUBCATEGORIES.BEVERAGES,
    description: 'Refreshing cola drink',
    deliveryTime: '60-90 mins',
    inStock: true,
    tags: ['cola', 'beverage', 'soft-drink', 'refreshing']
  },
  {
    name: 'Toothpaste',
    price: 60,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1559591935-c6c92c6c2b6e?w=400',
    category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL,
    subcategory: PRODUCT_SUBCATEGORIES.PERSONAL_CARE,
    description: 'Fresh mint toothpaste',
    deliveryTime: '60-90 mins',
    inStock: true,
    tags: ['toothpaste', 'personal-care', 'hygiene', 'mint']
  },
  {
    name: 'Dish Soap',
    price: 45,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1559591935-c6c92c6c2b6e?w=400',
    category: PRODUCT_CATEGORIES.DAILY_ESSENTIAL,
    subcategory: PRODUCT_SUBCATEGORIES.HOUSEHOLD,
    description: 'Effective dish cleaning soap',
    deliveryTime: '60-90 mins',
    inStock: true,
    tags: ['soap', 'household', 'cleaning', 'dishes']
  }
];

// Initialize categories in Firestore
export const initializeCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesRef);
    
    // Only add categories if the collection is empty
    if (querySnapshot.empty) {
      const addPromises = SAMPLE_CATEGORIES.map(category => 
        addDoc(categoriesRef, {
          ...category,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );
      
      await Promise.all(addPromises);
      console.log('Categories initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
};

// Get categories by product category (food, drinks, daily_essential)
export const getCategoriesByProductCategory = async (productCategory: string): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('category', '==', productCategory));
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const category = { id: doc.id, ...data } as Category;
      categories.push(category);
    });
    
    // Sort categories by name in JavaScript instead of Firestore
    categories.sort((a, b) => a.name.localeCompare(b.name));
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to sample categories if Firebase fails
    return SAMPLE_CATEGORIES.filter(cat => cat.category === productCategory);
  }
};

// Initialize products in Firestore
// export const initializeProducts = async () => {
//   try {
//     const productsRef = collection(db, 'products');
//     const querySnapshot = await getDocs(productsRef);
    
//     // Only add products if the collection is empty
//     if (querySnapshot.empty) {
//       const addPromises = SAMPLE_PRODUCTS.map(product => 
//         addDoc(productsRef, {
//           ...product,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         })
//       );
      
//       await Promise.all(addPromises);
//       console.log('Products initialized successfully');
//     }
//   } catch (error) {
//     console.error('Error initializing products:', error);
//   }
// };

// Search products
export const searchProducts = async (searchQuery: string, category: string | null = null, subcategory: string | null = null): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    let q;
    
    // Build query based on filters
    if (category) {
      q = query(productsRef, where('category', '==', category));
    } else {
      // Only use orderBy when not filtering by category to avoid composite index requirement
      q = query(productsRef, orderBy('name'));
    }
    
    // Add subcategory filter if specified
    if (subcategory) {
      if (category) {
        q = query(q, where('subcategory', '==', subcategory));
      } else {
        q = query(productsRef, where('subcategory', '==', subcategory));
      }
    }
    
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const product = { id: doc.id, ...data } as Product;
      
      // Filter by search query if provided
      if (!searchQuery || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        products.push(product);
      }
    });
    
    // Sort products by name if not already sorted by Firestore
    if (category || subcategory) {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  return await searchProducts('', category);
};

// Get products by subcategory
export const getProductsBySubcategory = async (category, subcategory) => {
  return await searchProducts('', category, subcategory);
};

// Get all products
export const getAllProducts = async () => {
  return await searchProducts('');
};

// Sync missing subcategories from products to categories collection
export const syncMissingSubcategories = async () => {
  try {
    // Get all products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    // Get all categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    // Create a map of existing categories using a more robust key
    const existingCategories = new Map();
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      // Use a case-insensitive key to prevent duplicates
      const key = `${data.category?.toLowerCase()}-${data.subcategory?.toLowerCase()}`;
      existingCategories.set(key, data);
    });
    
    // Find missing subcategories
    const missingSubcategories: any[] = [];
    const subcategoryIcons: { [key: string]: string } = {
      // Food subcategories
      'pizzas': '🍕',
      'burgers': '🍔',
      'biryani': '🍛',
      'chinese': '🥡',
      'indian': '🍛',
      'desserts': '🍰',
      'momo': '🥟',
      'vindi': '🥦',
      'sandwiches': '🥪',
      'noodles': '🍜',
      'rice': '🍚',
      'curry': '🍛',
      'breads': '🥖',
      'soups': '🍲',
      'salads': '🥗',
      'wraps': '🌯',
      'tacos': '🌮',
      'sushi': '🍣',
      'pasta': '🍝',
      
      // Drinks subcategories
      'beer': '🍺',
      'wine': '🍷',
      'spirits': '🥃',
      'cocktails': '🍹',
      'juice': '🧃',
      'soda': '🥤',
      'coffee': '☕',
      'tea': '🫖',
      'smoothies': '🥤',
      'milkshakes': '🥤',
      'energy_drinks': '⚡',
      
      // Daily Essential subcategories
      'staples': '🛒',
      'snacks': '🍿',
      'beverages': '🥤',
      'personal_care': '🧴',
      'personal care': '🧴',
      'household': '🏠',
      'fruits': '🍎',
      'vegetables': '🥬',
      'dairy': '🥛',
      'meat': '🥩',
      'frozen': '🧊',
      'canned': '🥫',
      'bakery': '🥖',
      'condiments': '🧂',
      'spices': '🌶️',
      'oils': '🫗',
      'grains': '🌾',
      'pulses': '🫘',
      'nuts': '🥜',
      'chocolates': '🍫',
      'candies': '🍬'
    };
    
    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      if (!product.subcategory || product.subcategory === 'all') return;
      
      // Use case-insensitive key
      const key = `${product.category?.toLowerCase()}-${product.subcategory?.toLowerCase()}`;
      
      if (!existingCategories.has(key)) {
        const icon = subcategoryIcons[product.subcategory.toLowerCase()] || '📦';
        const displayName = product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1);
        
        missingSubcategories.push({
          name: displayName,
          icon: icon,
          category: product.category,
          subcategory: product.subcategory.toLowerCase(),
          displayName: displayName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
    // Add missing subcategories to Firestore
    if (missingSubcategories.length > 0) {
      console.log('Adding missing subcategories:', missingSubcategories);
      const addPromises = missingSubcategories.map(subcategory => 
        addDoc(categoriesRef, subcategory)
      );
      
      await Promise.all(addPromises);
      console.log(`Added ${missingSubcategories.length} missing subcategories to Firestore`);
    } else {
      console.log('No missing subcategories found');
    }
    
    return missingSubcategories;
  } catch (error) {
    console.error('Error syncing missing subcategories:', error);
    return [];
  }
};

// Get top bought products of all time by all users
export const getTopBoughtProducts = async (topN = 4) => {
  try {
    // Fetch all orders
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    const productCount: Record<string, { count: number, product: any }> = {};

    // Aggregate product quantities
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (!item.id) return;
          if (!productCount[item.id]) {
            productCount[item.id] = { count: 0, product: item };
          }
          productCount[item.id].count += item.quantity || 1;
        });
      }
    });

    // Sort by count and get top N
    const topProducts = Object.values(productCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, topN)
      .map(entry => ({ ...entry.product, totalBought: entry.count }));

    return topProducts;
  } catch (error) {
    console.error('Error fetching top bought products:', error);
    return [];
  }
}; 
