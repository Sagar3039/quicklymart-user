import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';

const NotFound = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Page not found</p>
        <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
