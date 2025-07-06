import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, Lock, Users, Globe, Calendar, Moon, Sun, User, Smartphone, MapPin, Truck, MessageSquare, BarChart3, Gift, Settings, Edit, Trash2, Ban, Mail, Phone, CheckCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'collection', title: 'Data Collection', icon: <Eye className="w-4 h-4" /> },
    { id: 'usage', title: 'Data Usage', icon: <Users className="w-4 h-4" /> },
    { id: 'sharing', title: 'Data Sharing', icon: <Globe className="w-4 h-4" /> },
    { id: 'security', title: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'rights', title: 'Your Rights', icon: <Shield className="w-4 h-4" /> }
  ];

  const policyContent = {
    overview: {
      title: 'Privacy Policy Overview',
      content: `
        <p>At PickNGo, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our food delivery service.</p>
        
        <h3>Last Updated: December 2024</h3>
        
        <p>This policy applies to all users of our mobile application, website, and services. By using our services, you agree to the collection and use of information in accordance with this policy.</p>
        
        <h3>Key Points:</h3>
        <ul>
          <li>We collect only necessary information to provide our services</li>
          <li>Your data is protected with industry-standard security measures</li>
          <li>We never sell your personal information to third parties</li>
          <li>You have control over your data and can request deletion</li>
          <li>We are transparent about our data practices</li>
        </ul>
      `
    },
    collection: {
      title: 'Information We Collect',
      content: `
        <h3>Personal Information</h3>
        <p>We collect the following personal information when you use our services:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
          <li><strong>Profile Information:</strong> Profile picture, preferences, and dietary restrictions</li>
          <li><strong>Address Information:</strong> Delivery addresses and location data</li>
          <li><strong>Payment Information:</strong> Payment method details (securely processed)</li>
        </ul>

        <h3>Usage Information</h3>
        <p>We automatically collect certain information about your use of our services:</p>
        <ul>
          <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers</li>
          <li><strong>Location Data:</strong> GPS coordinates for delivery tracking (with your consent)</li>
          <li><strong>Usage Patterns:</strong> App usage, order history, and preferences</li>
          <li><strong>Technical Data:</strong> IP address, browser type, and app performance data</li>
        </ul>

        <h3>Third-Party Information</h3>
        <p>We may receive information from:</p>
        <ul>
          <li>Restaurant partners about order status</li>
          <li>Payment processors about transaction status</li>
          <li>Social media platforms (if you sign up through them)</li>
        </ul>
      `
    },
    usage: {
      title: 'How We Use Your Information',
      content: `
        <h3>Service Provision</h3>
        <p>We use your information to:</p>
        <ul>
          <li>Process and fulfill your food orders</li>
          <li>Provide real-time delivery tracking</li>
          <li>Send order confirmations and updates</li>
          <li>Process payments and handle refunds</li>
          <li>Provide customer support</li>
        </ul>

        <h3>Service Improvement</h3>
        <p>We use aggregated data to:</p>
        <ul>
          <li>Improve our app and services</li>
          <li>Analyze usage patterns and trends</li>
          <li>Develop new features and offerings</li>
          <li>Optimize delivery routes and times</li>
          <li>Enhance user experience</li>
        </ul>

        <h3>Communication</h3>
        <p>We may contact you for:</p>
        <ul>
          <li>Order-related communications</li>
          <li>Customer support and feedback</li>
          <li>Service updates and announcements</li>
          <li>Promotional offers (with your consent)</li>
          <li>Legal and security notifications</li>
        </ul>

        <h3>Legal Compliance</h3>
        <p>We use your information to:</p>
        <ul>
          <li>Comply with applicable laws and regulations</li>
          <li>Protect against fraud and abuse</li>
          <li>Enforce our terms of service</li>
          <li>Respond to legal requests</li>
        </ul>
      `
    },
    sharing: {
      title: 'Information Sharing and Disclosure',
      content: `
        <h3>We Do Not Sell Your Data</h3>
        <p>PickNGo does not sell, rent, or trade your personal information to third parties for marketing purposes.</p>

        <h3>Service Providers</h3>
        <p>We share information with trusted service providers who help us operate our services:</p>
        <ul>
          <li><strong>Restaurant Partners:</strong> Order details for fulfillment</li>
          <li><strong>Delivery Partners:</strong> Delivery address and contact information</li>
          <li><strong>Payment Processors:</strong> Payment information for transactions</li>
          <li><strong>Cloud Services:</strong> Data storage and processing</li>
          <li><strong>Analytics Services:</strong> Usage data for service improvement</li>
        </ul>

        <h3>Legal Requirements</h3>
        <p>We may disclose your information when required by law:</p>
        <ul>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and property</li>
          <li>To prevent fraud and abuse</li>
          <li>In emergency situations</li>
          <li>With your explicit consent</li>
        </ul>

        <h3>Business Transfers</h3>
        <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction, subject to the same privacy protections.</p>
      `
    },
    security: {
      title: 'Data Security and Protection',
      content: `
        <h3>Security Measures</h3>
        <p>We implement comprehensive security measures to protect your information:</p>
        <ul>
          <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
          <li><strong>Access Controls:</strong> Strict access controls and authentication</li>
          <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
          <li><strong>Employee Training:</strong> Regular security training for our team</li>
          <li><strong>Incident Response:</strong> Procedures for handling security incidents</li>
        </ul>

        <h3>Data Retention</h3>
        <p>We retain your information only as long as necessary:</p>
        <ul>
          <li><strong>Account Data:</strong> Until you delete your account</li>
          <li><strong>Order History:</strong> 7 years for tax and legal purposes</li>
          <li><strong>Payment Data:</strong> As required by payment processors</li>
          <li><strong>Analytics Data:</strong> Aggregated and anonymized after 2 years</li>
        </ul>

        <h3>Data Breach Response</h3>
        <p>In the unlikely event of a data breach:</p>
        <ul>
          <li>We will notify affected users within 72 hours</li>
          <li>We will work with authorities to investigate</li>
          <li>We will take immediate steps to contain the breach</li>
          <li>We will provide guidance on protective measures</li>
        </ul>
      `
    },
    rights: {
      title: 'Your Privacy Rights',
      content: `
        <h3>Access and Control</h3>
        <p>You have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your personal data</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
          <li><strong>Restriction:</strong> Limit how we process your data</li>
        </ul>

        <h3>Communication Preferences</h3>
        <p>You can control your communication preferences:</p>
        <ul>
          <li>Opt out of promotional emails</li>
          <li>Manage push notification settings</li>
          <li>Control SMS notifications</li>
          <li>Update your marketing preferences</li>
        </ul>

        <h3>Location Services</h3>
        <p>You can control location data collection:</p>
        <ul>
          <li>Enable/disable GPS tracking in app settings</li>
          <li>Choose when to share location for delivery</li>
          <li>Delete stored location data</li>
        </ul>

        <h3>How to Exercise Your Rights</h3>
        <p>To exercise your privacy rights:</p>
        <ul>
          <li>Contact us at privacy@pickngo.com</li>
          <li>Use the privacy settings in our app</li>
          <li>Submit a request through our support team</li>
          <li>We will respond within 30 days</li>
        </ul>
      `
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-pickngo-orange-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Privacy Policy</h1>
                <p className="text-sm text-gray-600">How we protect your data</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-pickngo-orange-500"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Last Updated */}
        <div className="mb-6 p-4 bg-pickngo-orange-50 border border-pickngo-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-pickngo-orange-600" />
            <span className="text-sm font-medium text-pickngo-orange-800">
              Last updated: December 15, 2024
            </span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Introduction</h2>
            <p className="text-gray-600 mb-4">
              At PickNGo Instant Grub, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our food delivery service.
            </p>
            <p className="text-gray-600">
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-pickngo-orange-500" />
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Delivery address and location data</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Account credentials and profile information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-pickngo-orange-500" />
                  Device and Usage Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                  <li>Device type, operating system, and browser information</li>
                  <li>IP address and general location data</li>
                  <li>App usage patterns and preferences</li>
                  <li>Order history and delivery preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-pickngo-orange-500" />
                  Location Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                  <li>GPS location for delivery services</li>
                  <li>Address book contacts (with permission)</li>
                  <li>Real-time location tracking during delivery</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">How We Use Your Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pickngo-orange-100 rounded-full">
                    <Truck className="w-4 h-4 text-pickngo-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Service Delivery</h4>
                    <p className="text-sm text-gray-600">Process orders and coordinate deliveries</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pickngo-orange-100 rounded-full">
                    <Shield className="w-4 h-4 text-pickngo-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Security</h4>
                    <p className="text-sm text-gray-600">Prevent fraud and ensure account security</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pickngo-orange-100 rounded-full">
                    <MessageSquare className="w-4 h-4 text-pickngo-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Communication</h4>
                    <p className="text-sm text-gray-600">Send order updates and support messages</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pickngo-orange-100 rounded-full">
                    <BarChart3 className="w-4 h-4 text-pickngo-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Analytics</h4>
                    <p className="text-sm text-gray-600">Improve our service and user experience</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pickngo-orange-100 rounded-full">
                    <Gift className="w-4 h-4 text-pickngo-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Personalization</h4>
                    <p className="text-sm text-gray-600">Provide relevant recommendations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pickngo-orange-100 rounded-full">
                    <Settings className="w-4 h-4 text-pickngo-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Account Management</h4>
                    <p className="text-sm text-gray-600">Manage your account and preferences</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full mt-1">
                  <Building className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Restaurant Partners</h4>
                  <p className="text-sm text-gray-600">Share order details with restaurants to fulfill your orders</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full mt-1">
                  <Truck className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Delivery Partners</h4>
                  <p className="text-sm text-gray-600">Provide necessary information to delivery drivers</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full mt-1">
                  <Shield className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Legal Requirements</h4>
                  <p className="text-sm text-gray-600">Comply with applicable laws and regulations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">SSL encryption for data transmission</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">Secure payment processing</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">Regular security audits</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">Access controls and authentication</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8 bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the following rights regarding your personal information:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full">
                  <Eye className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Access</h4>
                  <p className="text-sm text-gray-600">Request access to your personal data</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full">
                  <Edit className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Correction</h4>
                  <p className="text-sm text-gray-600">Request correction of inaccurate data</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full">
                  <Trash2 className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Deletion</h4>
                  <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-pickngo-orange-100 rounded-full">
                  <Ban className="w-4 h-4 text-pickngo-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Objection</h4>
                  <p className="text-sm text-gray-600">Object to processing of your data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">privacy@pickngo.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-pickngo-orange-500" />
                <span className="text-gray-700">123 Food Street, Delivery City, DC 12345</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 
