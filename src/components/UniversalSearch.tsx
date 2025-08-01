import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Star, MapPin, Clock, Moon, Sun, ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { searchProducts, PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES, type Product, checkAndInitializeProducts } from '@/lib/products';
import { useTheme } from '@/App';

interface UniversalSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProductSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  cart?: any[];
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
    name: "daily_essential",
    displayName: "Daily Essentials",
    icon: "🛒"
  }
];

const UniversalSearch: React.FC<UniversalSearchProps> = ({ isOpen = true, onClose = () => {}, onProductSelect, onAddToCart, cart = [] }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  // Load all products on component mount
  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShouldAutoFocus(window.innerWidth >= 768); // Only desktop
    }
  }, []);

  // Filter products when search query or filters change
  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, selectedSubcategory, products]);

  useEffect(() => {
    if (isPopoverOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isPopoverOpen]);

  const loadAllProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      console.log('Loading products for UniversalSearch...');
      
      // First check if products exist in database
      await checkAndInitializeProducts();
      
      // Load all products without category filter first
      const allProducts = await searchProducts('');
      console.log('Loaded products:', allProducts.length);
      
      if (allProducts.length === 0) {
        console.log('No products found with empty query, trying category-specific queries...');
        // If no products found, try loading by categories
        const [foodProducts, dailyEssentialProducts, drinksProducts] = await Promise.all([
          searchProducts('', PRODUCT_CATEGORIES.FOOD),
          searchProducts('', PRODUCT_CATEGORIES.DAILY_ESSENTIAL),
          searchProducts('', PRODUCT_CATEGORIES.DRINKS)
        ]);
        
        console.log('Food products:', foodProducts.length);
        console.log('Daily essential products:', dailyEssentialProducts.length);
        console.log('Drinks products:', drinksProducts.length);
        
        const combinedProducts = [...foodProducts, ...dailyEssentialProducts, ...drinksProducts];
        console.log('Combined products:', combinedProducts.length);
        
        if (combinedProducts.length === 0) {
          console.log('Still no products found, using sample products as fallback...');
          // Use sample products as fallback
          const sampleProducts = [
            {
              id: '1',
              name: "Domino's Pizza",
              price: 250,
              rating: 4.5,
              image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
              category: 'food',
              subcategory: 'pizzas',
              description: 'Delicious pizza with fresh toppings',
              deliveryTime: '20-25 mins',
              inStock: true,
              isVeg: false,
              discount: '20% OFF',
              tags: ['pizza', 'italian', 'cheese', 'tomato']
            },
            {
              id: '2',
              name: 'Spice N Ice Biryani',
              price: 220,
              rating: 4.3,
              image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
              category: 'food',
              subcategory: 'biryani',
              description: 'Aromatic biryani with tender meat',
              deliveryTime: '25-30 mins',
              inStock: true,
              isVeg: false,
              offer: 'BUY1 GET1',
              tags: ['biryani', 'rice', 'spicy', 'indian']
            },
            {
              id: '3',
              name: 'China Nation Noodles',
              price: 180,
              rating: 4.1,
              image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
              category: 'food',
              subcategory: 'chinese',
              description: 'Stir-fried noodles with vegetables',
              deliveryTime: '15-20 mins',
              inStock: true,
              isVeg: true,
              tags: ['noodles', 'chinese', 'vegetarian', 'stir-fry']
            },
            {
              id: '4',
              name: 'Classic Burger',
              price: 150,
              rating: 4.2,
              image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
              category: 'food',
              subcategory: 'burgers',
              description: 'Juicy beef burger with fresh vegetables',
              deliveryTime: '18-22 mins',
              inStock: true,
              isVeg: false,
              discount: '15% OFF',
              tags: ['burger', 'beef', 'fast-food', 'american']
            },
            {
              id: '5',
              name: 'Butter Chicken',
              price: 280,
              rating: 4.6,
              image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
              category: 'food',
              subcategory: 'indian',
              description: 'Creamy butter chicken with naan',
              deliveryTime: '30-35 mins',
              inStock: true,
              isVeg: false,
              tags: ['chicken', 'indian', 'curry', 'butter']
            },
            {
              id: '6',
              name: 'Chocolate Cake',
              price: 120,
              rating: 4.4,
              image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
              category: 'food',
              subcategory: 'desserts',
              description: 'Rich chocolate cake with cream',
              deliveryTime: '20-25 mins',
              inStock: true,
              isVeg: true,
              tags: ['cake', 'chocolate', 'dessert', 'sweet']
            }
          ];
          setProducts(sampleProducts);
          setError('Using sample products. Database connection may be unavailable.');
        } else {
          setProducts(combinedProducts);
        }
      } else {
        console.log('Setting all products:', allProducts.length);
        setProducts(allProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please try again.');
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    // On desktop, if search is blank, show nothing
    if (typeof window !== 'undefined' && window.innerWidth >= 640 && !searchQuery.trim()) {
      setFilteredProducts([]);
      return;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        return product.name.toLowerCase().includes(query);
      });
    }
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    // Filter by subcategory
    if (selectedSubcategory && selectedSubcategory !== 'all') {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }
    setFilteredProducts(filtered);
  };

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    setIsPopoverOpen(false);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchQuery('');
  };

  const handlePopularSearchClick = (search: string) => {
    setSearchQuery(search);
    // Clear category filters when using popular search
    setSelectedCategory('all');
    setSelectedSubcategory('all');
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory('all'); // Reset subcategory when changing category
    setSearchQuery(''); // Clear search when selecting category
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case PRODUCT_CATEGORIES.FOOD:
        return 'Food';
      case PRODUCT_CATEGORIES.DAILY_ESSENTIAL:
        return 'Daily Essential';
      case PRODUCT_CATEGORIES.DRINKS:
        return 'Drinks';
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
  const safeSelectedSubcategory = selectedSubcategory === 'all' || validSubcategories.includes(selectedSubcategory)
    ? selectedSubcategory
    : 'all';

  // Show content only when there's a search query or when popover is first opened
  const shouldShowContent = searchQuery.trim() || isPopoverOpen;

  // Add a blur handler to close the popover only if focus is not moving to the popover
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (
        document.activeElement &&
        popoverRef.current &&
        popoverRef.current.contains(document.activeElement)
      ) {
        // Focus moved to popover, do not close
        return;
      }
      setIsPopoverOpen(false);
    }, 100);
  };

  return (
    <div className="relative flex-1 max-w-2xl" ref={inputWrapperRef}>
      {/* Search Input */}
      <div className="relative w-full">
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search for products, restaurants, etc..."
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          autoFocus={shouldAutoFocus}
        />
        {/* Results Dropdown */}
        {searchQuery && (
          <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-xl z-20 max-h-72 overflow-y-auto border border-gray-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 cursor-pointer"
                  onClick={() => onProductSelect && onProductSelect(product)}
                >
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">₹{product.price} • {product.category}</div>
                  </div>
                  <Button size="sm" onClick={e => { e.stopPropagation(); onAddToCart && onAddToCart(product); }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-sm">No results found.</div>
            )}
          </div>
        )}
      </div>
      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="z-50 max-h-[70vh] h-[60vh] overflow-y-auto overscroll-contain touch-action-none p-0 shadow-2xl border-0 w-screen max-w-sm left-1/2 -translate-x-1/2 mx-auto rounded-xl fixed top-[145px] sm:absolute sm:w-[400px] sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 sm:overflow-visible sm:touch-auto sm:h-auto"
          style={window.innerWidth >= 640 ? { top: '110%' } : {}}
        >
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden`}>
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{searchQuery.trim() ? `Search Results (${filteredProducts.length})` : 'Search Products'}</h3>
                {searchQuery.trim() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className={`text-xs ${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}`}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {/* Content */}
            <div className="p-4">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {/* Show content only when there's a search query */}
              {(searchQuery.trim() || (typeof window !== 'undefined' && window.innerWidth >= 640)) ? (
                <>
                  {/* Popular Searches (only on desktop) */}
                  <div className="mb-4 hidden sm:block">
                    <h4 className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Popular Searches</h4>
                    <div className="flex flex-nowrap gap-1">
                      {popularSearches.slice(0, 6).map((search) => (
                        <Button
                          key={search}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePopularSearchClick(search)}
                          className={`px-2 py-0.5 text-[11px] rounded-full min-w-0 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {/* Search Results */}
                  <div>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No products found</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try adjusting your search terms</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {filteredProducts.slice(0, 10).map((product) => (
                          <div
                            key={product.id}
                            className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                            onClick={() => handleProductClick(product)}
                          >
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0yNCAzMkMyNi4yMDkxIDMyIDI4IDMwLjIwOTEgMjggMjhDMjggMjUuNzkwOSAyNi4yMDkxIDI0IDI0IDI0QzIxLjc5MDkgMjQgMjAgMjUuNzkwOSAyMCAyOEMyMCAzMC4yMDkxIDIxLjc5MDkgMzIgMjQgMzJaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
                                }}
                              />
                              {product.discount && (
                                <div className="absolute -top-1 -right-1 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                                  {product.discount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {product.name}
                              </h4>
                              <p className={`text-sm truncate mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-orange-500 font-bold text-lg">₹{product.price}</span>
                                  <Badge variant="secondary" className={`text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                    {getCategoryLabel(product.category)}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{product.rating}</span>
                                </div>
                              </div>
                            </div>
                            {/* Add to Cart Button */}
                            <Button
                              size="sm"
                              onClick={(e) => handleAddToCart(product, e)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-xs">Add</span>
                            </Button>
                          </div>
                        ))}
                        {filteredProducts.length > 10 && (
                          <div className="text-center py-3">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{filteredProducts.length - 10} more results
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Only show the empty state on desktop
                <div className="hidden sm:block text-center py-8">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start typing to search</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Search for products by name</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSearch; 
