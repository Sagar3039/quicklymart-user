import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Star, MapPin, Clock, Moon, Sun, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { searchProducts, PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, type Product } from '@/lib/products';
import { useTheme } from '@/App';

interface UniversalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
}

const popularSearches = [
  "Pizza",
  "Milk",
  "Bread",
  "Eggs",
  "Coke",
  "Biscuits",
  "Rice",
  "Snacks",
  "Juice",
  "Soap"
];

const categories = [
  {
    name: "food",
    displayName: "Food",
    icon: "🍕"
  },
  {
    name: "drinks",
    displayName: "Drinks",
    icon: "🥤"
  },
  {
    name: "daily-essential",
    displayName: "Daily Essentials",
    icon: "🛒"
  }
];

const UniversalSearch: React.FC<UniversalSearchProps> = ({ isOpen, onClose, onProductSelect }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Load all products on component mount (excluding drinks)
  useEffect(() => {
    if (isOpen) {
      loadAllProducts();
    }
  }, [isOpen]);

  // Filter products when search query or filters change
  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, selectedSubcategory, products]);

  const loadAllProducts = async () => {
    setIsLoading(true);
    try {
      // Load food and daily essential products only (exclude drinks)
      const [foodProducts, dailyEssentialProducts] = await Promise.all([
        searchProducts('', PRODUCT_CATEGORIES.FOOD),
        searchProducts('', PRODUCT_CATEGORIES.DAILY_ESSENTIAL)
      ]);
      
      const allProducts = [...foodProducts, ...dailyEssentialProducts];
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    onClose();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchQuery('');
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case PRODUCT_CATEGORIES.FOOD:
        return 'Food';
      case PRODUCT_CATEGORIES.DAILY_ESSENTIAL:
        return 'Daily Essential';
      default:
        return category;
    }
  };

  const getSubcategoryLabel = (subcategory: string) => {
    switch (subcategory) {
      case PRODUCT_SUBCATEGORIES.PIZZAS:
        return 'Pizzas';
      case PRODUCT_SUBCATEGORIES.BURGERS:
        return 'Burgers';
      case PRODUCT_SUBCATEGORIES.BIRYANI:
        return 'Biryani';
      case PRODUCT_SUBCATEGORIES.CHINESE:
        return 'Chinese';
      case PRODUCT_SUBCATEGORIES.INDIAN:
        return 'Indian';
      case PRODUCT_SUBCATEGORIES.DESSERTS:
        return 'Desserts';
      case PRODUCT_SUBCATEGORIES.STAPLES:
        return 'Staples';
      case PRODUCT_SUBCATEGORIES.SNACKS:
        return 'Snacks';
      case PRODUCT_SUBCATEGORIES.BEVERAGES:
        return 'Beverages';
      case PRODUCT_SUBCATEGORIES.PERSONAL_CARE:
        return 'Personal Care';
      case PRODUCT_SUBCATEGORIES.HOUSEHOLD:
        return 'Household';
      default:
        return subcategory;
    }
  };

  // Compute valid subcategories for the dropdown
  const validSubcategories = Object.values(PRODUCT_SUBCATEGORIES)
    .filter(subcategory => typeof subcategory === 'string' && subcategory.trim() !== '')
    .filter((subcategory, index, array) => array.indexOf(subcategory) === index);

  // Ensure selectedSubcategory is always valid
  const safeSelectedSubcategory = selectedSubcategory === '' || validSubcategories.includes(selectedSubcategory)
    ? selectedSubcategory
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-full w-full h-full max-h-full m-0 rounded-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader className={`border-b pb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onClose()}
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for food, drinks, groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-10 h-12 text-lg focus:border-orange-500 ${isDarkMode ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400' : 'bg-gray-50 text-gray-900 border-gray-200'}`}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Popular Searches */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Button
                  key={search}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(search)}
                  className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Categories</h3>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="outline"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`h-20 flex flex-col items-center justify-center space-y-1 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs">{category.displayName}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className={isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value={PRODUCT_CATEGORIES.FOOD}>Food</SelectItem>
                  <SelectItem value={PRODUCT_CATEGORIES.DAILY_ESSENTIAL}>Daily Essential</SelectItem>
                </SelectContent>
              </Select>
              <Select value={safeSelectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className={isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}>
                  <SelectValue placeholder="Subcategory" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <SelectItem value="">All Subcategories</SelectItem>
                  {validSubcategories.map((subcategory) => {
                    if (typeof subcategory !== 'string' || subcategory.trim() === '') {
                      // eslint-disable-next-line no-console
                      console.error('Skipping invalid subcategory value for SelectItem:', subcategory);
                      return null;
                    }
                    // eslint-disable-next-line no-console
                    console.log('Rendering SelectItem for subcategory:', subcategory);
                    return (
                      <SelectItem key={subcategory} value={subcategory}>
                        {getSubcategoryLabel(subcategory)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLoading ? 'Loading...' : `Search Results (${filteredProducts.length})`}
              </h3>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No products found</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      {product.discount && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {product.discount}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </h4>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-500 font-bold text-lg">₹{product.price}</span>
                        </div>
                        <Badge variant="secondary" className={isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}>
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalSearch; 
