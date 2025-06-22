import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Shield, Moon, Sun, Globe, Volume2, VolumeX, Smartphone, Mail, Lock, Trash2, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useTheme } from '@/App';

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, setDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    language: 'en',
    sound: true,
    emailNotifications: true,
    pushNotifications: true
  });

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account states
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadSettings(currentUser.uid);
        // Check if user has 2FA enabled
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTwoFactorEnabled(userData.twoFactorEnabled || false);
        }
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadSettings = async (userId) => {
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.settings) {
          setSettings(userData.settings);
          // Sync dark mode with global theme
          if (userData.settings.darkMode !== undefined) {
            setDarkMode(userData.settings.darkMode);
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    if (!user) return;

    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        settings: newSettings,
        updatedAt: new Date()
      });

      // Handle specific settings
      if (key === 'pushNotifications') {
        if (value) {
          await requestNotificationPermission();
        }
      }

      if (key === 'sound') {
        if (value) {
          // Test sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {
            // Sound file might not exist, that's okay
          });
        }
      }

      toast.success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      // Revert the change if update failed
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleDarkModeChange = async (checked) => {
    setDarkMode(checked);
    
    if (!user) return;

    try {
      const newSettings = { ...settings, darkMode: checked };
      setSettings(newSettings);

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        settings: newSettings,
        updatedAt: new Date()
      });

      toast.success(`Dark mode ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating dark mode:', error);
      toast.error('Failed to update dark mode');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setSettings(prev => ({ ...prev, pushNotifications: false }));
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        toast.error('New password is too weak');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSetup2FA = async () => {
    setIsSettingUp2FA(true);
    try {
      // For now, we'll just mark 2FA as enabled
      // In a real app, you'd integrate with a 2FA service like Google Authenticator
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        twoFactorEnabled: true,
        updatedAt: new Date()
      });
      
      setTwoFactorEnabled(true);
      toast.success('Two-factor authentication enabled');
      setShow2FAModal(false);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to setup two-factor authentication');
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Delete user data from Firestore
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);
      
      // Delete user account from Firebase Auth
      await deleteUser(user);
      
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
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
              <h1 className="text-gray-800 font-bold text-lg">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading settings...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Notifications */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="text-gray-800">Push Notifications</Label>
                      <p className="text-gray-600 text-sm">Receive notifications on your device</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="text-gray-800">Email Notifications</Label>
                      <p className="text-gray-600 text-sm">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  <Moon className="w-5 h-5 text-orange-500" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isDarkMode ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-gray-500" />}
                    <div>
                      <Label className="text-gray-800">Dark Mode</Label>
                      <p className="text-gray-600 text-sm">Use dark theme</p>
                    </div>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleDarkModeChange}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="text-gray-800">Language</Label>
                      <p className="text-gray-600 text-sm">Choose your preferred language</p>
                    </div>
                  </div>
                  <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                    <SelectTrigger className="w-32 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sound & Vibration */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  {settings.sound ? <Volume2 className="w-5 h-5 text-orange-500" /> : <VolumeX className="w-5 h-5 text-orange-500" />}
                  <span>Sound & Vibration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="text-gray-800">Sound Effects</Label>
                      <p className="text-gray-600 text-sm">Play sounds for notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.sound}
                    onCheckedChange={(checked) => handleSettingChange('sound', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span>Privacy & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  onClick={() => setShow2FAModal(true)}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                  {twoFactorEnabled && <span className="ml-2 text-orange-500">✓ Enabled</span>}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  onClick={() => setShowPrivacyModal(true)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-800">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Change Password</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-900">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-900">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="flex-1"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-gray-700">
            <h3 className="font-semibold text-gray-900">QuicklyMart Privacy Policy</h3>
            <p className="text-sm">
              This Privacy Policy describes how QuicklyMart collects, uses, and protects your personal information.
            </p>
            
            <h4 className="font-semibold text-gray-900">Information We Collect</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Account information (name, email, phone number)</li>
              <li>Order history and preferences</li>
              <li>Location data for delivery services</li>
              <li>Device information and usage analytics</li>
            </ul>

            <h4 className="font-semibold text-gray-900">How We Use Your Information</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Process and deliver your orders</li>
              <li>Send order updates and notifications</li>
              <li>Improve our services and user experience</li>
              <li>Provide customer support</li>
            </ul>

            <h4 className="font-semibold text-gray-900">Data Security</h4>
            <p className="text-sm">
              We implement industry-standard security measures to protect your personal information.
              Your data is encrypted and stored securely.
            </p>

            <h4 className="font-semibold text-gray-900">Your Rights</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
            </ul>

            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <Button onClick={() => setShowPrivacyModal(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-gray-600">
              {twoFactorEnabled 
                ? 'Two-factor authentication is currently enabled for your account.'
                : 'Add an extra layer of security to your account with two-factor authentication.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {twoFactorEnabled ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700">Your account is protected with 2FA</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-700">Enable two-factor authentication for enhanced security</p>
                </div>
                <Button
                  onClick={handleSetup2FA}
                  disabled={isSettingUp2FA}
                  className="w-full"
                >
                  {isSettingUp2FA ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up 2FA...
                    </>
                  ) : (
                    'Enable 2FA'
                  )}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShow2FAModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription className="text-gray-600">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> Deleting your account will:
              </p>
              <ul className="text-red-700 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Permanently delete all your personal data</li>
                <li>Cancel any active orders</li>
                <li>Remove your order history</li>
                <li>Delete your saved addresses and preferences</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation" className="text-gray-900">
                Type "DELETE" to confirm
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="text-center font-mono"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeletingAccount}
                className="flex-1"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings; 