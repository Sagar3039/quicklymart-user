import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ShoppingCart } from 'lucide-react';

const ProductQuickView = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            {product.originalPrice && (
              <Badge className="absolute top-2 left-2 bg-red-500">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <Clock className="w-3 h-3 mr-1" />
                {product.deliveryTime}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              
              {product.inStock ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Product Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• High quality ingredients</li>
                <li>• Fast delivery guaranteed</li>
                <li>• Freshness assured</li>
                <li>• Easy returns if not satisfied</li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
