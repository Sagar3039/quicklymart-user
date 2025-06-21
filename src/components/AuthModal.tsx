
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

const AuthModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [authMethod, setAuthMethod] = useState('phone');

  const handleSendOtp = () => {
    if (authMethod === 'phone' && phoneNumber.length === 10) {
      setShowOtpInput(true);
      toast.success('OTP sent to your phone!');
    } else if (authMethod === 'email' && email.includes('@')) {
      setShowOtpInput(true);
      toast.success('OTP sent to your email!');
    } else {
      toast.error('Please enter valid details');
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '1234') { // Demo OTP
      toast.success('Login successful!');
      onClose();
    } else {
      toast.error('Invalid OTP');
    }
  };

  const handleSocialLogin = (provider) => {
    toast.success(`${provider} login initiated!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to QuicklyMart</DialogTitle>
          <DialogDescription>
            Login or signup to continue shopping
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={authMethod} onValueChange={setAuthMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 text-sm bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    +91
                  </span>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </TabsContent>
          </Tabs>

          {showOtpInput && (
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                maxLength={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Demo OTP: 1234
              </p>
            </div>
          )}

          <div className="space-y-2">
            {!showOtpInput ? (
              <Button onClick={handleSendOtp} className="w-full">
                Send OTP
              </Button>
            ) : (
              <Button onClick={handleVerifyOtp} className="w-full">
                Verify OTP
              </Button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin('Google')}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin('Apple')}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C8.396 0 8.025.044 7.333.06 4.706.272 3.033 1.496 2.197 3.374 1.439 5.106 1.928 7.482 3.251 9.126c.797 1.05 2.79 3.498 2.79 5.674 0 2.225-1.39 3.674-3.251 4.5-.372.165-.744.33-1.116.495 0 0 3.813-.362 7.478 0 .744-.165 1.116-.33 1.86-.495 1.86-.826 3.251-2.275 3.251-4.5 0-2.176 1.993-4.624 2.79-5.674 1.323-1.644 1.812-4.02 1.054-5.752C20.967 1.496 19.294.272 16.667.06 15.975.044 15.604 0 12.017 0z"/>
              </svg>
              Apple
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
