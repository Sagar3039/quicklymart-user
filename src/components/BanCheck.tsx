import React from 'react';
import { Shield, AlertTriangle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBanCheck } from '@/hooks/useBanCheck';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';
import { useTheme } from '@/App';

interface BanCheckProps {
  children: React.ReactNode;
}

const BanCheck: React.FC<BanCheckProps> = ({ children }) => {
  const { banStatus, user } = useBanCheck();
  const { isDarkMode } = useTheme();

  // If user is banned, show ban screen
  if (user && banStatus.isBanned) {
    const handleSignOut = async () => {
      try {
        await signOut(auth);
        toast.success('Signed out successfully');
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to sign out');
      }
    };

    const formatDate = (date?: Date) => {
      if (!date) return 'Unknown';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const isPermanentBan = !banStatus.banExpiry;
    const isExpired = banStatus.banExpiry && new Date() > banStatus.banExpiry;

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Card className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Account Suspended
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Your account has been suspended due to a violation of our terms of service.
              </p>
              
              {banStatus.banReason && (
                <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reason:</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {banStatus.banReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {isPermanentBan ? 'Permanent Ban' : 'Temporary Ban'}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Banned on: {formatDate(banStatus.banDate)}
                    </p>
                    {banStatus.banExpiry && (
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Expires: {formatDate(banStatus.banExpiry)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isExpired && (
                <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'} border`}>
                  <p className={`text-sm font-medium text-green-600 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                    ✅ Your ban has expired! You can now use the app normally.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className={`w-full ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <X className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              
              {!isPermanentBan && !isExpired && (
                <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your account will be automatically restored when the ban expires.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If loading, show loading state
  if (banStatus.isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Checking account status...
          </p>
        </div>
      </div>
    );
  }

  // If not banned, render children normally
  return <>{children}</>;
};

export default BanCheck; 