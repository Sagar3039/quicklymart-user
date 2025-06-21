import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Camera, ShoppingCart, Gift, Shirt, Tv, Smartphone, Cpu, Watch, Sofa, Droplets, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/App';

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

const groceryData = {
  title: 'Grocery',
  bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop',
  sections: [
    {
      title: 'Staples',
      items: [
        { name: 'Ghee & Oils', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-g_R9DkL_ij9a8V3n-QyW2-sH2W-qJq_LgQ&s', subcategory: 'Staples' },
        { name: 'Sugar, Jaggery & Salt', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkYxJ1A4Z-Y3l1Xw2O-p5B9g_Yn3X0z3q9wA&s', subcategory: 'Staples' },
        { name: 'Rice & Rice Products', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc1j8gq-u_tYwQ-Y9E9Z-2Xw3a-nJ4d0l3Xw&s', subcategory: 'Staples' },
        { name: 'Dry Fruits, Nuts & Seeds', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4x9J0N-n8v6Z-Z9C9Xw_Q8X_X2n-H_y3o3A&s', subcategory: 'Staples' },
        { name: 'Masalas & Spices', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYSoZ6TqO6Y-K2rL0z7gJpG8e-A9z2wF_sLw&s', subcategory: 'Staples' },
        { name: 'Dals & Pulses', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4p7gY-p-L2N-O_R-d0a_R1p2m-G5a9yJ_pQ&s', subcategory: 'Staples' },
        { name: 'Atta & Flours', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-p6-gT7mQ5H2xX-O_Kq_wG-g5K-Y4Kz_yXg&s', subcategory: 'Staples' },
      ],
    },
    {
      title: 'Snacks & Beverages',
      items: [
        { name: 'Juices', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-o-w7O3l7g-v-l2K-j-j_H-v8V-hJ_p-Jw&s', subcategory: 'Beverages' },
        { name: 'Water', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7b-C8xXcz-n-J-k-f-oD_v1n_Y-f9hY6w&s', subcategory: 'Beverages' },
        { name: 'Chips, Namkeen & Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-G7oF5x-2y-x_k-Z8c-Z-fJ_o-I_p_X_w&s', subcategory: 'Snacks' },
        { name: 'Chocolates', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_P3-mB_y-Y7R-n-H-O-hI_p_S8V-kL_A&s', subcategory: 'Snacks' },
        { name: 'Health Drinks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_P3-mB_y-Y7R-n-H-O-hI_p_S8V-kL_A&s', subcategory: 'Beverages' },
        { name: 'Instant Beverages', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhXgG_pD-K-v-k_k-O-c-Z-Y-k_k-S-j-I_A&s', subcategory: 'Beverages' },
      ],
    },
  ],
};

const GroceryContent = ({ onSubcategoryClick }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">{groceryData.title} <ChevronRight className="w-6 h-6" /></h2>
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" alt="Grocery Banner" className="rounded-lg h-12 object-cover" />
        </div>

        {groceryData.sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{section.title}</h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="text-center cursor-pointer" onClick={() => onSubcategoryClick(item.subcategory)}>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 mx-auto flex items-center justify-center overflow-hidden mb-2">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
);

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

    const handleSubcategoryClick = (subcategory: string) => {
        navigate('/daily-essential', { state: { subcategory } });
    };

    const renderContent = () => {
        switch (activeCategory) {
            case 'Grocery':
                return <GroceryContent onSubcategoryClick={handleSubcategoryClick} />;
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 dark:text-gray-300"
                          onClick={toggleDarkMode}
                          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
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