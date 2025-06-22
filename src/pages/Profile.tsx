import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Edit, Save, X, Camera, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/App';

const Profile = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get user profile data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              displayName: userData.displayName || currentUser.displayName || '',
              email: currentUser.email || '',
              phone: userData.phone || currentUser.phoneNumber || '',
              address: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              pincode: userData.pincode || ''
            });
          } else {
            // Create new user document if it doesn't exist
            setFormData({
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: currentUser.phoneNumber || '',
              address: '',
              city: '',
              state: '',
              pincode: ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load profile data');
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        updatedAt: new Date()
      }, { merge: true });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    setFormData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-orange-500"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-gray-800 font-bold text-lg">Profile</h1>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-orange-500 bg-gray-100 rounded-full w-10 h-10"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-orange-500"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-orange-500 bg-gray-100 rounded-full w-10 h-10"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-orange-500"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Profile Picture Section */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{formData.displayName || 'User'}</h2>
                <p className="text-gray-600">{formData.email}</p>
                {isEditing && (
                  <Button variant="ghost" size="sm" className="mt-2 text-orange-500 hover:text-orange-600">
                    <Camera className="w-4 h-4 mr-1" />
                    Change Photo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName" className="text-gray-700">Full Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-gray-700">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-gray-700">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-gray-700">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-gray-700">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 