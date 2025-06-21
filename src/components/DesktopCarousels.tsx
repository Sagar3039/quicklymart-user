import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from 'react-router-dom';

const foodPageCategories = [
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03246963d4a9?w=400&h=400&fit=crop&crop=center' },
    { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&crop=center' },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Pizzas', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Indian', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center' },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&crop=center' },
];

const groceryCategories = [
    { name: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&crop=center' },
    { name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Dairy, Bread & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop&crop=center' },
    { name: 'Rice, Atta & Dals', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Masalas & Dry Fruits', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop&crop=center' },
    { name: 'Oils & Ghee', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center' },
    { name: 'Munchies', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Sweet Tooth', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop&crop=center' },
]

export const DesktopCarousels = () => {
    const navigate = useNavigate();

    const handleFoodClick = (category: string) => {
        navigate('/food', { state: { category } });
    };

    const handleDailyEssentialClick = () => {
        navigate('/daily-essential');
    }

    return (
        <>
            {/* --- Desktop Food Categories Carousel --- */}
            <div className="hidden md:block container mx-auto py-12">
                <h2 className="text-3xl font-bold mb-6">What's on your mind?</h2>
                <Carousel opts={{ align: "start", loop: true }}>
                    <CarouselContent>
                        {foodPageCategories.map((category, index) => (
                            <CarouselItem key={index} className="basis-auto">
                                <div className="text-center cursor-pointer" onClick={() => handleFoodClick(category.name)}>
                                    <img src={category.image} alt={category.name} className="w-36 h-36 object-cover rounded-full mx-auto" />
                                    <p className="mt-2 font-semibold">{category.name}</p>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>

            {/* --- Desktop Grocery Categories Carousel --- */}
            <div className="hidden md:block container mx-auto py-12">
                <h2 className="text-3xl font-bold mb-6">Shop groceries on Instamart</h2>
                <Carousel opts={{ align: "start", loop: true }}>
                    <CarouselContent>
                        {groceryCategories.map((category, index) => (
                            <CarouselItem key={index} className="basis-1/5">
                                <Card className="overflow-hidden cursor-pointer group" onClick={handleDailyEssentialClick}>
                                    <CardContent className="p-0">
                                        <img src={category.image} alt={category.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="p-4">
                                            <p className="font-semibold text-center">{category.name}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </>
    )
} 