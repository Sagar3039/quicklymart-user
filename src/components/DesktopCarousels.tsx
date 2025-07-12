import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from 'react-router-dom';
import { getCategoriesByProductCategory, PRODUCT_CATEGORIES, type Category } from '@/lib/products';

export const DesktopCarousels = () => {
    const navigate = useNavigate();
    const [foodCategories, setFoodCategories] = useState<Category[]>([]);
    const [essentialCategories, setEssentialCategories] = useState<Category[]>([]);
    const [isLoadingFood, setIsLoadingFood] = useState(true);
    const [isLoadingEssential, setIsLoadingEssential] = useState(true);

    // Fetch food categories
    useEffect(() => {
        const fetchFoodCategories = async () => {
            try {
                const categories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.FOOD);
                // Filter out the "All" category and limit to 12 for carousel
                const filteredCategories = categories
                    .filter(cat => cat.subcategory !== 'all')
                    .slice(0, 12);
                setFoodCategories(filteredCategories);
            } catch (error) {
                console.error('Error fetching food categories:', error);
            } finally {
                setIsLoadingFood(false);
            }
        };
        fetchFoodCategories();
    }, []);

    // Fetch essential categories
    useEffect(() => {
        const fetchEssentialCategories = async () => {
            try {
                const categories = await getCategoriesByProductCategory(PRODUCT_CATEGORIES.DAILY_ESSENTIAL);
                // Filter out the "All" category and limit to 8 for carousel
                const filteredCategories = categories
                    .filter(cat => cat.subcategory !== 'all')
                    .slice(0, 8);
                setEssentialCategories(filteredCategories);
            } catch (error) {
                console.error('Error fetching essential categories:', error);
            } finally {
                setIsLoadingEssential(false);
            }
        };
        fetchEssentialCategories();
    }, []);

    const handleFoodClick = (category: Category) => {
        navigate('/food', { state: { category: category.subcategory } });
    };

    const handleDailyEssentialClick = (category: Category) => {
        navigate('/daily-essential', { state: { subcategory: category.subcategory } });
    }

    // Function to render category icon or image
    const renderCategoryVisual = (category: Category, size: string = 'text-6xl') => {
        if (category.icon) {
            // Check if icon is an image URL
            if (category.icon.startsWith('http') || category.icon.startsWith('data:')) {
                return (
                    <img 
                        src={category.icon} 
                        alt={category.displayName || category.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                );
            } else {
                // It's an emoji
                return <span className={`${size} flex items-center justify-center w-full h-full`}>{category.icon}</span>;
            }
        }
        // Fallback emoji
        return <span className={`${size} flex items-center justify-center w-full h-full`}>📦</span>;
    };

    return (
        <>
            {/* --- Desktop Food Categories Carousel --- */}
            <div className="hidden md:block container mx-auto py-12">
                <h2 className="text-3xl font-bold mb-6">What's on your mind?</h2>
                {isLoadingFood ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <Carousel opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {foodCategories.map((category, index) => (
                                <CarouselItem key={category.id || index} className="basis-auto">
                                    <div className="text-center cursor-pointer" onClick={() => handleFoodClick(category)}>
                                        <div className="w-36 h-36 rounded-full mx-auto bg-gray-100 hover:bg-gray-200 transition-colors overflow-hidden">
                                            {renderCategoryVisual(category, 'text-6xl')}
                                        </div>
                                        <p className="mt-2 font-semibold">{category.displayName || category.name}</p>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                )}
            </div>

            {/* --- Desktop Grocery Categories Carousel --- */}
            <div className="hidden md:block container mx-auto py-12">
                <h2 className="text-3xl font-bold mb-6">Shop groceries on Instamart</h2>
                {isLoadingEssential ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <Carousel opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {essentialCategories.map((category, index) => (
                                <CarouselItem key={category.id || index} className="basis-1/5">
                                    <Card className="overflow-hidden cursor-pointer group" onClick={() => handleDailyEssentialClick(category)}>
                                        <CardContent className="p-0">
                                            <div className="w-full h-48 bg-gray-100 transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                                                {renderCategoryVisual(category, 'text-8xl')}
                                            </div>
                                            <div className="p-4">
                                                <p className="font-semibold text-center">{category.displayName || category.name}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                )}
            </div>
        </>
    )
} 
