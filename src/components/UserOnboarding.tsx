import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { toast } from '@/components/ui/sonner';

interface UserOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const UserOnboarding = ({ isOpen, onComplete }: UserOnboardingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    age: ''
  });
  const [errors, setErrors] = useState({
    displayName: '',
    phone: '',
    age: ''
  });

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      // Pre-fill with existing data if available
      setFormData(prev => ({
        ...prev,
        displayName: auth.currentUser.displayName || '',
        phone: auth.currentUser.phoneNumber || ''
      }));
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {
      displayName: '',
      phone: '',
      age: ''
    };

    // Validate name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters long';
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate age
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 13 || age > 120) {
        newErrors.age = 'Age must be between 13 and 120';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!auth.currentUser) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName.trim()
      });

      // Create/Update user document in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        displayName: formData.displayName.trim(),
        email: auth.currentUser.email,
        phone: formData.phone.trim(),
        age: parseInt(formData.age),
        isOnboarded: true,
        createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date(),
        updatedAt: new Date(),
        settings: userDoc.exists() ? userDoc.data().settings : {
          notifications: true,
          language: 'en',
          sound: true,
          emailNotifications: true,
          pushNotifications: true,
          darkMode: false
        }
      };

      await setDoc(userRef, userData, { merge: true });

      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error saving user data:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Please provide your details to complete your account setup
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`pl-10 ${errors.displayName ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.displayName && (
                <p className="text-red-500 text-xs">{errors.displayName}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-gray-700">
                Age
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className={`pl-10 ${errors.age ? 'border-red-500' : ''}`}
                  min="13"
                  max="120"
                  disabled={isLoading}
                />
              </div>
              {errors.age && (
                <p className="text-red-500 text-xs">{errors.age}</p>
              )}
              <p className="text-gray-500 text-xs">
                You must be at least 13 years old to use this service
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-pickngo-orange-500 hover:bg-pickngo-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOnboarding; 
