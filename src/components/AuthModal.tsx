import React, { useState } from 'react';
import { X, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';
import UserOnboarding from './UserOnboarding';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Phone authentication states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setOtp('');
    setVerificationId('');
    setShowOtpInput(false);
    setIsSignUp(false);
    setIsLoading(false);
    setShowOnboarding(false);
    setIsNewUser(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    resetForm();
    onClose();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const checkIfNewUser = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return !userDoc.exists() || !userDoc.data()?.isOnboarded;
    } catch (error) {
      console.error('Error checking user status:', error);
      return true; // Assume new user if there's an error
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
        setIsNewUser(true);
        setShowOnboarding(true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const isNew = await checkIfNewUser(userCredential.user.uid);
        
        if (isNew) {
          toast.success('Account created successfully!');
          setIsNewUser(true);
          setShowOnboarding(true);
        } else {
          toast.success('Logged in successfully!');
          resetForm();
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please sign in instead.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('User not found. Please check your email or sign up.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger password.');
      } else {
        toast.error('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user by checking Firestore
      const isNew = await checkIfNewUser(result.user.uid);
      
      if (isNew) {
        toast.success('Account created successfully!');
        setIsNewUser(true);
        setShowOnboarding(true);
      } else {
        toast.success('Successfully signed in with Google!');
        resetForm();
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Pop-up blocked. Please allow pop-ups for this site.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log('reCAPTCHA solved');
        }
      });
      setRecaptchaVerifier(verifier);
    }
  };

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setupRecaptcha();
      
      if (!recaptchaVerifier) {
        toast.error('reCAPTCHA not ready. Please refresh and try again.');
        return;
      }

      // Format phone number to international format
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setShowOtpInput(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Phone auth error:', error);
      if (error.code === 'auth/billing-not-enabled') {
        toast.error('Phone authentication requires billing to be enabled. Please enable billing in Firebase Console.');
      } else if (error.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number. Please check and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/quota-exceeded') {
        toast.error('SMS quota exceeded. Please try again later or contact support.');
    } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier!);
      
      // Check if this is a new user
      const isNew = await checkIfNewUser(userCredential.user.uid);
      
      if (isNew) {
        toast.success('Account created successfully!');
        setIsNewUser(true);
        setShowOnboarding(true);
      } else {
        toast.success('Phone number verified successfully!');
        resetForm();
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      if (error.code === 'auth/invalid-verification-code') {
        toast.error('Invalid OTP. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        toast.error('OTP has expired. Please request a new one.');
        setShowOtpInput(false);
      } else {
        toast.error('OTP verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      await sendOTP(new Event('submit') as any);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-center text-2xl font-bold">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </TabsTrigger>
            </TabsList>

            {/* Email Authentication */}
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                      placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                />
              </div>
            </div>

          <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
              </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
          </div>

              {/* Google Sign In */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

            <Button 
              variant="outline" 
                onClick={handleGoogleSignIn} 
              className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in with Google...
                  </>
                ) : (
                  <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Phone Authentication */}
            <TabsContent value="phone" className="space-y-4">
              {!showOtpInput ? (
                <form onSubmit={sendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      We'll send you a verification code via SMS
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Enter the 6-digit code sent to {phoneNumber}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
            </Button>
            <Button 
                      type="button"
              variant="outline" 
                      onClick={resendOTP}
                      disabled={isLoading}
                    >
                      Resend
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp('');
                      setVerificationId('');
                    }}
              className="w-full"
            >
                    Change Phone Number
            </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {/* reCAPTCHA Container */}
          <div id="recaptcha-container" className="mt-4"></div>
        </CardContent>
      </Card>
      
      {/* User Onboarding Modal */}
      <UserOnboarding 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default AuthModal;
