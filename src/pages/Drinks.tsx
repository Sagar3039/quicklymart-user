import React, { useState, useEffect } from 'react';
import { Search, Star, Heart, Mic, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import ProductQuickView from '@/components/ProductQuickView';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import { getProductsByCategory, PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, type Product } from '@/lib/products';
import { useTheme } from '@/App';

const drinkCategories = [
    { name: 'All', icon: '🌐' },
    { name: 'Beer', icon: '🍺' },
    { name: 'Wine', icon: '🍷' },
    { name: 'Spirits', icon: '🥃' },
    { name: 'Cocktails', icon: '🍹' }
];

const categoryToSubcategory = {
    'Beer': PRODUCT_SUBCATEGORIES.BEER,
    'Wine': PRODUCT_SUBCATEGORIES.WINE,
    'Spirits': PRODUCT_SUBCATEGORIES.SPIRITS,
    'Cocktails': PRODUCT_SUBCATEGORIES.COCKTAILS
};

const Drinks = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeCategory === 'All' || product.subcategory === categoryToSubcategory[activeCategory])
  );

  const addToCart = (product: Product) => {
    if (!isAgeVerified) {
      setShowAgeModal(true);
      return;
    }
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleProductClick = (product: Product) => {
    if (!isAgeVerified) {
      setShowAgeModal(true);
      return;
    }
    setSelectedProduct(product);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const drinksProducts = await getProductsByCategory(PRODUCT_CATEGORIES.DRINKS);
      setProducts(drinksProducts);
    } catch (error) {
      console.error('Error loading drinks products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('quicklymart-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Check age verification status
    const ageVerified = localStorage.getItem('quicklymart-age-verified');
    if (ageVerified) {
      setIsAgeVerified(true);
    } else {
      setShowAgeModal(true); // Show age modal if not verified
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('quicklymart-cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className='flex items-center gap-2'>
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Drinks</h1>
            </div>
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
                <Mic className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-28 bg-gray-50 dark:bg-gray-800 h-full fixed top-16 left-0 overflow-y-auto pb-16">
          <nav>
            <ul>
              {drinkCategories.map((category, index) => (
                <li key={index}>
                  <button
                    onClick={() => setActiveCategory(category.name)}
                    className={`w-full text-center p-3 text-sm font-medium border-l-4 ${activeCategory === category.name ? 'border-blue-500 bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <div className="text-2xl mb-1 mx-auto">{category.icon}</div>
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="ml-28 p-4 flex-1 mb-16">
            <Input
              placeholder="Search for drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl text-md w-full mb-4 dark:text-white dark:placeholder-gray-400"
            />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{activeCategory}</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                    <Card 
                    key={product.id} 
                    className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow border dark:border-gray-700"
                    onClick={() => handleProductClick(product)}
                    >
                    <div className="relative">
                        <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        />
                        <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Added to wishlist!');
                        }}
                        >
                        <Heart className="w-4 h-4" />
                        </Button>
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            18+
                        </div>
                        {product.discount && (
                        <div className="absolute bottom-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {product.discount}
                        </div>
                        )}
                        {product.offer && (
                        <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {product.offer}
                        </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 rounded text-sm">
                        ₹{product.price}
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white">{product.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-green-500 text-green-500" />
                            <span className="font-medium text-sm text-gray-600 dark:text-gray-300">{product.rating}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">• {product.deliveryTime}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
                        <Button 
                        className="w-full mt-3 bg-orange-500 hover:bg-orange-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        >
                        Add to Cart
                        </Button>
                    </CardContent>
                    </Card>
                ))}
              </div>
            )}
        </main>
      </div>

      <ProductQuickView 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      <AgeVerificationModal 
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onVerified={() => {
          setIsAgeVerified(true);
          setShowAgeModal(false);
          localStorage.setItem('quicklymart-age-verified', 'true');
        }}
      />
    </div>
  );
};

export default Drinks; 