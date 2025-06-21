import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Star, MapPin, Clock, Moon, Sun } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-full max-h-full m-0 rounded-none bg-white dark:bg-gray-800">
        <DialogHeader className="pb-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
              <Search className="w-5 h-5" />
              <span>Search All Products</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Search through all food and daily essential products. Drinks are not included in this search.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for products, categories, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-14 text-lg"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            {(selectedCategory || selectedSubcategory) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value={PRODUCT_CATEGORIES.FOOD}>Food</SelectItem>
                    <SelectItem value={PRODUCT_CATEGORIES.DAILY_ESSENTIAL}>Daily Essential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subcategory</label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subcategories</SelectItem>
                    {selectedCategory === PRODUCT_CATEGORIES.FOOD && (
                      <>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.PIZZAS}>Pizzas</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.BURGERS}>Burgers</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.BIRYANI}>Biryani</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.CHINESE}>Chinese</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.INDIAN}>Indian</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.DESSERTS}>Desserts</SelectItem>
                      </>
                    )}
                    {selectedCategory === PRODUCT_CATEGORIES.DAILY_ESSENTIAL && (
                      <>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.STAPLES}>Staples</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.SNACKS}>Snacks</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.BEVERAGES}>Beverages</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.PERSONAL_CARE}>Personal Care</SelectItem>
                        <SelectItem value={PRODUCT_SUBCATEGORIES.HOUSEHOLD}>Household</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? 'No products found matching your search.' : 'Start typing to search products.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProductClick(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-gray-600 text-sm">{product.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{product.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">{product.deliveryTime}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-sm">{getCategoryLabel(product.category)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">₹{product.price}</p>
                              {product.discount && (
                                <Badge className="bg-green-500 text-white text-xs">
                                  {product.discount}
                                </Badge>
                              )}
                              {product.offer && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  {product.offer}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredProducts.length > 0 && (
            <div className="text-sm text-gray-500 text-center pt-4 border-t mt-4">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalSearch; 