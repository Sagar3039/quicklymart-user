
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
  onClose: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, onVerified, onClose }) => {
  const [birthDate, setBirthDate] = useState('');

  const handleVerification = () => {
    if (!birthDate) {
      toast.error('Please enter your date of birth');
      return;
    }

    const today = new Date();
    const birth = new Date(birthDate);
    const age = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age >= 21) {
      toast.success('Age verification successful');
      onVerified();
    } else {
      toast.error('You must be 21 or older to access this section');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>🍷</span>
            <span>Age Verification Required</span>
          </DialogTitle>
          <DialogDescription>
            You must be 21 or older to access alcoholic beverages. Please verify your age to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="birthdate">Date of Birth</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleVerification}>
              Verify Age
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>By continuing, you confirm that you are of legal drinking age in your jurisdiction.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationModal;
