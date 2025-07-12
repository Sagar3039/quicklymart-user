import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Camera, ShoppingCart, Gift, Shirt, Tv, Smartphone, Cpu, Watch, Sofa, Droplets, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/App';
import { getCategoriesByProductCategory, PRODUCT_CATEGORIES, type Category } from '@/lib/products';

const mainCategories = [
  { name: 'For You', icon: <Gift className="w-6 h-6" /> },
  { name: 'Grocery', icon: <img src="https://img.icons8.com/color/48/grocery-bag.png" alt="grocery" className="w-8 h-8" /> },
  { name: 'Fashion', icon: <Shirt className="w-6 h-6" /> },
  { name: 'Appliances', icon: <Tv className="w-6 h-6" /> },
  { name: 'Mobiles', icon: <Smartphone className="w-6 h-6" /> },
  { name: 'Electronics', icon: <Cpu className="w-6 h-6" /> },
  { name: 'Smart Gadgets', icon: <Watch className="w-6 h-6" /> },
  { name: 'Home', icon: <Sofa className="w-6 h-6" /> },
  { name: 'Beauty & Personal Care', icon: <Droplets className="w-6 h-6" /> },
];

// Function to render category icon or image
const renderCategoryVisual = (category: Category) => {
  if (category.icon) {
    // Check if icon is an image URL
    if (category.icon.startsWith('http') || category.icon.startsWith('data:')) {
      return (
        <img 
          src={category.icon} 
          alt={category.displayName || category.name} 
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    } else {
      // It's an emoji
      return <span className="text-3xl flex items-center justify-center w-full h-full">{category.icon}</span>;
    }
  }
  // Fallback emoji
  return <span className="text-3xl flex items-center justify-center w-full h-full">📦</span>;
};

const GroceryContent = ({ categories, onSubcategoryClick }) => {
  // Group categories by subcategory type
  const staples = categories.filter(cat => cat.subcategory === 'staples');
  const snacks = categories.filter(cat => cat.subcategory === 'snacks');
  const beverages = categories.filter(cat => cat.subcategory === 'beverages');
  const personalCare = categories.filter(cat => cat.subcategory === 'personal_care');
  const household = categories.filter(cat => cat.subcategory === 'household');

  const sections = [
    { title: 'Staples', items: staples },
    { title: 'Snacks & Beverages', items: [...snacks, ...beverages] },
    { title: 'Personal Care', items: personalCare },
    { title: 'Household', items: household }
  ].filter(section => section.items.length > 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">Grocery <ChevronRight className="w-6 h-6" /></h2>
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" alt="Grocery Banner" className="rounded-lg h-12 object-cover" />
      </div>

      {sections.map((section, index) => (
        <div key={index} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{section.title}</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {section.items.map((item, itemIndex) => (
              <div key={item.id || itemIndex} className="text-center cursor-pointer" onClick={() => onSubcategoryClick(item.subcategory)}>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto flex items-center justify-center overflow-hidden mb-2">
                  {renderCategoryVisual(item)}
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.displayName || item.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const PlaceholderContent = ({ categoryName }) => (
  <div className="text-center p-8 flex flex-col items-center justify-center h-full">
    <h2 className="text-2xl font-bold mb-4 dark:text-white">{categoryName}</h2>
    <p className="text-gray-500 dark:text-gray-400">Products coming soon!</p>
  </div>
);

const AllCategories = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState('Grocery');
  const [groceryCategories, setGroceryCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroceryCategories = async () => {
      try {
        const categories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.DAILY_ESSENTIAL);
        // Filter out the "All" category
        const filteredCategories = categories.filter(cat => cat.subcategory !== 'all');
        setGroceryCategories(filteredCategories);
      } catch (error) {
        console.error('Error fetching grocery categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroceryCategories();
  }, []);

  const handleSubcategoryClick = (subcategory: string) => {
    navigate('/daily-essential', { state: { subcategory } });
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'Grocery':
        if (isLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }
        return <GroceryContent categories={groceryCategories} onSubcategoryClick={handleSubcategoryClick} />;
      default:
        return <PlaceholderContent categoryName={activeCategory} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">All Categories</h1>
          <div className="flex items-center space-x-4">
            <Search className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <Camera className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-28 bg-gray-50 dark:bg-gray-800 h-screen-minus-header fixed top-16 left-0 overflow-y-auto pb-16">
          <nav>
            <ul>
              {mainCategories.map((category, index) => (
                <li key={index}>
                  <button
                    onClick={() => setActiveCategory(category.name)}
                    className={`w-full text-center p-3 text-sm font-medium border-l-4 ${activeCategory === category.name ? 'border-blue-500 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <div className="text-2xl mb-1 mx-auto flex justify-center items-center h-8">{category.icon}</div>
                    <span className="text-xs">{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="ml-28 p-4 flex-1 mb-16">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AllCategories; 
