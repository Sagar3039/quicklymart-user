import React, { useState } from 'react';
import { ArrowLeft, Search, HelpCircle, Phone, Mail, MessageCircle, Clock, MapPin, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';

const HelpCenter = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Ordering',
      questions: [
        {
          question: 'How do I place an order?',
          answer: 'To place an order, simply browse our menu, add items to your cart, and proceed to checkout. You can choose your delivery address, payment method, and add a tip before confirming your order.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept Cash on Delivery (COD), UPI, and Credit/Debit Cards. All online payments are secure and encrypted.'
        },
        {
          question: 'Can I modify or cancel my order?',
          answer: 'You can modify or cancel your order within 5 minutes of placing it. After that, please contact our customer support team.'
        },
        {
          question: 'What is the minimum order amount?',
          answer: 'There is no minimum order amount, but orders above ₹299 qualify for free delivery. Orders below ₹299 have a delivery fee of ₹29.'
        }
      ]
    },
    {
      category: 'Delivery',
      questions: [
        {
          question: 'How long does delivery take?',
          answer: 'Delivery typically takes 25-35 minutes depending on your location and current order volume. You can track your order in real-time through our app.'
        },
        {
          question: 'Do you deliver to my area?',
          answer: 'We deliver to most areas within our service radius. Enter your address during checkout to check if we deliver to your location.'
        },
        {
          question: 'Can I schedule delivery for later?',
          answer: 'Currently, we offer immediate delivery only. We are working on scheduled delivery options for future updates.'
        },
        {
          question: 'What if my order is delayed?',
          answer: 'If your order is delayed, you will receive real-time updates. For significant delays, we may offer compensation or a refund.'
        }
      ]
    },
    {
      category: 'Account & App',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'You can create an account using your email address or sign up with Google. This allows you to save addresses, track orders, and view order history.'
        },
        {
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click on "Forgot Password" on the login screen and enter your email address. You will receive a password reset link.'
        },
        {
          question: 'How do I update my delivery address?',
          answer: 'Go to your Profile > Address section to add, edit, or remove delivery addresses. You can also set a default address.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard encryption to protect your personal information. We never share your data with third parties without your consent.'
        }
      ]
    },
    {
      category: 'Refunds & Issues',
      questions: [
        {
          question: 'What is your refund policy?',
          answer: 'We offer full refunds for incorrect orders, missing items, or quality issues. Contact our support team within 24 hours of delivery.'
        },
        {
          question: 'What if my food arrives cold or damaged?',
          answer: 'If your food arrives in poor condition, please contact us immediately. We will arrange a replacement or provide a full refund.'
        },
        {
          question: 'How do I report a missing item?',
          answer: 'Contact our customer support team with your order number and details of the missing item. We will arrange a refund or replacement.'
        },
        {
          question: 'Can I get a refund for late delivery?',
          answer: 'For deliveries significantly delayed beyond our estimated time, we may offer partial refunds or credits as compensation.'
        }
      ]
    }
  ];

  const popularTopics = [
    { title: 'Track Your Order', icon: '🚚', description: 'Real-time order tracking' },
    { title: 'Payment Issues', icon: '💳', description: 'Payment problems and solutions' },
    { title: 'Delivery Problems', icon: '📦', description: 'Delivery delays and issues' },
    { title: 'Account Access', icon: '🔐', description: 'Login and account issues' },
    { title: 'Menu & Pricing', icon: '🍽️', description: 'Menu items and pricing' },
    { title: 'App Problems', icon: '📱', description: 'Technical app issues' }
  ];

  const contactMethods = [
    {
      title: 'Customer Support',
      description: '24/7 customer service',
      icon: <Phone className="w-6 h-6" />,
      action: 'Call Now',
      value: '+91 98765 43210'
    },
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: <Mail className="w-6 h-6" />,
      action: 'Send Email',
      value: 'support@quicklymart.com'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our team',
      icon: <MessageCircle className="w-6 h-6" />,
      action: 'Start Chat',
      value: 'Available 24/7'
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
                <h1 className="text-xl font-bold text-gray-800">Help Center</h1>
                <p className="text-sm text-gray-600">Get help and support</p>
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
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Popular Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {popularTopics.map((topic, index) => (
              <Card key={index} className="bg-white border border-gray-200 hover:border-quicklymart-orange-500 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{topic.icon}</div>
                  <h3 className="font-semibold mb-1 text-gray-800">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactMethods.map((method, index) => (
              <Card key={index} className="bg-white border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-quicklymart-orange-100 rounded-full">
                      {method.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-800">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <p className="text-sm font-medium mb-3 text-gray-800">{method.value}</p>
                  <Button variant="outline" className="w-full border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-800">
                      <HelpCircle className="w-5 h-5" />
                      <span>{category.category}</span>
                      <Badge variant="secondary" className="bg-quicklymart-orange-100 text-quicklymart-orange-800">{category.questions.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="border-gray-200">
                          <AccordionTrigger className="text-left hover:no-underline text-gray-800">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 pt-2">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </Accordion>
          ) : (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-800">No results found</h3>
                <p className="text-gray-600">Try searching with different keywords</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate('/current-order')} 
              className="h-16 text-lg bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600"
            >
              <Clock className="w-5 h-5 mr-2" />
              Track My Order
            </Button>
            <Button 
              onClick={() => navigate('/past-orders')} 
              variant="outline" 
              className="h-16 text-lg border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white"
            >
              <MapPin className="w-5 h-5 mr-2" />
              View Order History
            </Button>
          </div>
        </div>

        {/* Additional Support */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Still need help?</h3>
            <p className="text-gray-600 mb-4">
              Our customer support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" className="border-quicklymart-orange-500 text-quicklymart-orange-500 hover:bg-quicklymart-orange-500 hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter; 