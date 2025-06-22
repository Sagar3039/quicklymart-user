import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, Clock, Send, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';

const ContactUs = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      title: 'Customer Support',
      description: '24/7 customer service',
      icon: <Phone className="w-6 h-6" />,
      value: '+91 98765 43210',
      action: 'Call Now',
      color: 'bg-green-600'
    },
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: <Mail className="w-6 h-6" />,
      value: 'support@quicklymart.com',
      action: 'Send Email',
      color: 'bg-blue-600'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our team',
      icon: <MessageCircle className="w-6 h-6" />,
      value: 'Available 24/7',
      action: 'Start Chat',
      color: 'bg-purple-600'
    },
    {
      title: 'Office Address',
      description: 'Visit our office',
      icon: <MapPin className="w-6 h-6" />,
      value: '123 Food Street, Kolkata, WB 700001',
      action: 'Get Directions',
      color: 'bg-orange-600'
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 10:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 11:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 9:00 PM' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
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
                className="text-gray-600 hover:text-quicklymart-orange-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Contact Us</h1>
                <p className="text-sm text-gray-600">Get in touch with our team</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-quicklymart-orange-500"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <Card key={index} className="bg-white border border-gray-200 hover:border-quicklymart-orange-500 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${info.color}`}>
                    {info.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-800">{info.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                  <p className="text-sm font-medium mb-4 text-gray-800">{info.value}</p>
                  <Button variant="outline" className="w-full border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
                    {info.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Send className="w-5 h-5" />
                <span>Send us a Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-800">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-800">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-800">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-gray-800">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order">Order Issue</SelectItem>
                        <SelectItem value="delivery">Delivery Problem</SelectItem>
                        <SelectItem value="payment">Payment Issue</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-800">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                    rows={5}
                    className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Business Hours & Additional Info */}
          <div className="space-y-6">
            {/* Business Hours */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <Clock className="w-5 h-5" />
                  <span>Business Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-800">{schedule.day}</span>
                      <span className="text-sm text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-quicklymart-orange-100 rounded-lg">
                  <p className="text-sm text-quicklymart-orange-800">
                    <strong>Note:</strong> Customer support is available 24/7 for urgent issues.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Office Location */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <MapPin className="w-5 h-5" />
                  <span>Office Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <strong className="text-gray-800">QuicklyMart Headquarters</strong><br />
                      123 Food Street<br />
                      Park Street Area<br />
                      Kolkata, West Bengal 700001<br />
                      India
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Phone Support</span>
                    <Badge className="bg-green-600">Immediate</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Live Chat</span>
                    <Badge className="bg-green-600">Within 2 min</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Email Support</span>
                    <Badge className="bg-yellow-600">Within 24 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Contact Form</span>
                    <Badge className="bg-yellow-600">Within 24 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8">
          <Card className="bg-red-50 border border-red-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-800">Emergency Support</h3>
              <p className="text-red-700 mb-4">
                For urgent issues like food safety concerns or delivery emergencies
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Hotline: +91 98765 43211
                </Button>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-600 hover:text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Emergency Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 