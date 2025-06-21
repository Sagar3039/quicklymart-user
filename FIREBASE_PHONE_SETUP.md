# Firebase Phone Authentication Setup Guide

## ⚠️ IMPORTANT: Billing Required

**Phone authentication requires a billing account to be enabled in Firebase.** This is mandatory for sending SMS verification codes.

## Step 1: Enable Billing in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the **"Usage and billing"** tab in the left sidebar
4. Click **"Modify plan"** or **"Upgrade"**
5. Choose **"Blaze (Pay as you go)"** plan
6. Add a payment method (credit card required)
7. Set up billing account

**Note:** The Blaze plan has a generous free tier:
- 10,000 phone auth verifications per month (free)
- Only pay for usage beyond the free tier
- You can set budget alerts to avoid unexpected charges

## Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Find **"Phone"** in the list
3. Click on it and toggle **"Enable"**
4. Click **"Save"**

## Step 3: Configure reCAPTCHA (Required)

1. In the Phone authentication settings, enable **"reCAPTCHA Enterprise"** or **"reCAPTCHA v3"**
2. Add your domain to the allowed domains list
3. For development, add `localhost` and your local IP addresses

## Step 4: Test Phone Authentication

1. Start your development server: `npm run dev`
2. Open the app and try phone authentication
3. Enter a real phone number (with country code, e.g., +91XXXXXXXXXX)
4. Complete the reCAPTCHA verification
5. You should receive a real SMS with a 6-digit OTP

## Troubleshooting

### "Billing not enabled" error
- Ensure you've completed Step 1 above
- Wait a few minutes after enabling billing for changes to propagate
- Check that your payment method is valid

### "reCAPTCHA not ready" error
- Make sure you've configured reCAPTCHA in Firebase Console
- Check that your domain is in the allowed list
- Try refreshing the page

### "Invalid phone number" error
- Ensure the phone number includes country code (e.g., +91 for India)
- Check that the number format is correct
- Some countries may have restrictions

### SMS not received
- Check your phone's signal
- Verify the phone number is correct
- Wait a few minutes (SMS delivery can be delayed)
- Check spam folder

## Cost Considerations

- **Free tier:** 10,000 phone auth verifications per month
- **Beyond free tier:** ~$0.01 per verification
- **Budget alerts:** Set up in Firebase Console to monitor usage

## Security Best Practices

1. **Rate limiting:** Firebase automatically handles this
2. **Phone number validation:** Always validate format before sending
3. **reCAPTCHA:** Required to prevent abuse
4. **Error handling:** Implement proper error messages for users

## Development vs Production

- **Development:** Use real phone numbers for testing
- **Production:** Ensure proper domain configuration
- **Testing:** Use your own phone number for development testing

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Verify billing status
3. Test with a different phone number
4. Contact Firebase support if needed

## 🔧 **Enable Phone Authentication in Firebase**

### **Step 1: Enable Billing (REQUIRED)**
⚠️ **Phone Authentication requires billing to be enabled!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`dsa-squad`)
3. Navigate to **Billing** in the left sidebar
4. Click **Add billing account** or **Link billing account**
5. Set up billing with a credit card
6. **Note**: Phone Auth has a free tier (10,000 verifications/month)

### **Step 2: Enable Phone Authentication**
1. Navigate to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. **Enable** Phone Authentication
4. Click **Save**

### **Step 3: Configure reCAPTCHA**
1. In the Phone provider settings
2. Set **reCAPTCHA Enterprise** to **Enabled**
3. Or use **reCAPTCHA v3** for invisible verification

### **Step 4: Add Test Phone Numbers (Optional)**
For development/testing, you can add test phone numbers:
1. In the Phone provider settings
2. Add your phone number to **Phone numbers for testing**
3. This allows you to receive OTP without SMS charges

## 💰 **Billing Information**

### **Free Tier:**
- **10,000 phone number verifications per month**
- **No charge for first 10K verifications**
- **$0.01 per additional verification**

### **Cost Breakdown:**
- **Development/Testing**: Usually free (under 10K/month)
- **Production**: Very low cost for most apps
- **SMS charges**: Handled by Firebase, no additional fees

## 🚨 **Alternative Solutions (If Billing is Not Possible)**

### **Option 1: Mock Phone Authentication (Development Only)**
```javascript
// Add this to AuthModal.tsx for development
const mockPhoneAuth = async () => {
  // Simulate OTP sending
  toast.success('Mock OTP sent: 123456');
  setShowOtpInput(true);
  setVerificationId('mock-verification-id');
};

// Use this instead of real Firebase phone auth
const sendOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  if (process.env.NODE_ENV === 'development') {
    await mockPhoneAuth();
    return;
  }
  // ... real Firebase code
};
```

### **Option 2: Email-Only Authentication**
- Remove phone authentication tab
- Keep email/password and Google sign-in
- Add email verification instead

### **Option 3: Use a Different Auth Provider**
- **Auth0** (free tier available)
- **Supabase** (free tier available)
- **Appwrite** (self-hosted option)

## 📱 **How Phone Authentication Works**

### **Flow:**
1. User enters phone number
2. Firebase sends SMS with 6-digit OTP
3. User enters OTP
4. Firebase verifies and signs in user
5. User is authenticated and can place orders

### **Features Added:**
✅ **Phone number input** with validation  
✅ **OTP verification** with 6-digit code  
✅ **Resend OTP** functionality  
✅ **Change phone number** option  
✅ **Error handling** for invalid numbers  
✅ **Loading states** and user feedback  
✅ **reCAPTCHA integration** for security  

### **UI Features:**
- **Tabbed interface** (Email/Phone)
- **Real-time validation**
- **Loading indicators**
- **Error messages**
- **Success notifications**

## 🚀 **Testing**

### **Test Phone Numbers:**
- Use your actual phone number
- Or add test numbers in Firebase console
- Format: `+91XXXXXXXXXX` (India) or `+1XXXXXXXXXX` (US)

### **Common Issues:**
1. **"Billing not enabled"** - Enable billing in Firebase console
2. **"Invalid phone number"** - Check format (+91XXXXXXXXXX)
3. **"Too many requests"** - Wait before retrying
4. **"reCAPTCHA not ready"** - Refresh page and try again
5. **"OTP expired"** - Request new OTP

## 🔒 **Security Features**

- **reCAPTCHA verification** prevents abuse
- **Rate limiting** on OTP requests
- **Secure OTP generation** by Firebase
- **Session management** with Firebase Auth

## 📞 **Phone Number Format**

The app automatically formats phone numbers:
- **India**: `+91XXXXXXXXXX`
- **US**: `+1XXXXXXXXXX`
- **Other**: `+[country code][number]`

## 🎯 **Quick Fix for Development**

If you want to test phone auth without billing:

1. **Enable billing** (recommended for production)
2. **Or use mock authentication** for development
3. **Or stick with email/Google auth** for now

## 🚀 **Next Steps**

1. **Enable billing** in Firebase Console
2. **Enable Phone Auth** in Firebase Console
3. **Test with your phone number**
4. **Add test numbers** for development
5. **Configure reCAPTCHA** settings
6. **Test the complete flow**

The phone authentication is now fully integrated into your QuicklyMart app! 🎉 