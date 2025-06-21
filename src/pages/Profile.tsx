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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-indigo-900/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-white font-bold text-lg">Profile</h1>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-gray-800/50 rounded-full w-10 h-10"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
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
                  className="text-white bg-gray-800/50 rounded-full w-10 h-10"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
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
        <Card className="bg-white/5 backdrop-blur-md border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">
                  {isEditing ? (
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="text-center bg-transparent border-none text-xl font-bold"
                      placeholder="Enter your name"
                    />
                  ) : (
                    user.displayName || 'User'
                  )}
                </h2>
                <p className="text-gray-300 text-sm">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="bg-white/5 backdrop-blur-md border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="bg-white/10 border-gray-600 text-white"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{user.displayName || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Phone Number</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/10 border-gray-600 text-white"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{formData.phone || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Address</Label>
              {isEditing ? (
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-white/10 border-gray-600 text-white"
                  placeholder="Enter your address"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{formData.address || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">City</Label>
                {isEditing ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-white/10 border-gray-600 text-white"
                    placeholder="Enter your city"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{formData.city || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">State</Label>
                {isEditing ? (
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="bg-white/10 border-gray-600 text-white"
                    placeholder="Enter your state"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{formData.state || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Pincode</Label>
              {isEditing ? (
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="bg-white/10 border-gray-600 text-white"
                  placeholder="Enter your pincode"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{formData.pincode || 'Not set'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 