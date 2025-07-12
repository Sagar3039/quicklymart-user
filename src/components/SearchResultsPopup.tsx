import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Plus } from 'lucide-react';
import { type Product } from '@/lib/products';

interface SearchResultsPopupProps {
  isVisible: boolean;
  searchQuery: string;
  results: Product[];
  onAddToCart: (product: Product) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const SearchResultsPopup: React.FC<SearchResultsPopupProps> = ({
  isVisible,
  searchQuery,
  results,
  onAddToCart,
  onClose,
  isDarkMode
}) => {
  if (!isVisible || !searchQuery.trim()) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32" onClick={onClose}>
      {/* Popup */}
      <div className={`relative w-full max-w-md mx-4 max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl z-10 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Search Results
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No products found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((product) => (
                <Card 
                  key={product.id} 
                  className={`mb-2 border-0 shadow-sm ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded-full p-0.5">
                          <Heart className="w-3 h-3 text-gray-700" />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {product.name}
                        </h4>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-green-500 fill-green-500" />
                          <span className="text-xs text-gray-500">{product.rating} (500+)</span>
                        </div>
                        <p className={`text-xs mt-1 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {product.description}
                        </p>
                        <div className={`font-bold text-sm mt-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          ₹{product.price}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => onAddToCart(product)}
                          size="sm"
                          className={`h-8 w-8 p-0 rounded-full ${
                            isDarkMode
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPopup; 