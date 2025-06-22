import React from 'react';
import { ArrowLeft, Users, Target, Award, Heart, Shield, Truck, Clock, Star, MapPin, Phone, Mail, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';

const AboutUs = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: '😊' },
    { label: 'Cities Served', value: '25+', icon: '🏙️' },
    { label: 'Restaurant Partners', value: '500+', icon: '🍽️' },
    { label: 'Orders Delivered', value: '1M+', icon: '📦' }
  ];

  const values = [
    {
      title: 'Quality First',
      description: 'We never compromise on food quality and safety standards.',
      icon: <Award className="w-8 h-8" />,
      color: 'bg-yellow-600'
    },
    {
      title: 'Customer Satisfaction',
      description: 'Your satisfaction is our top priority. We go above and beyond to exceed expectations.',
      icon: <Heart className="w-8 h-8" />,
      color: 'bg-red-600'
    },
    {
      title: 'Fast Delivery',
      description: 'We promise to deliver your food fresh and hot within 30 minutes.',
      icon: <Truck className="w-8 h-8" />,
      color: 'bg-green-600'
    },
    {
      title: 'Trust & Safety',
      description: 'Your safety and trust are paramount. We maintain the highest hygiene standards.',
      icon: <Shield className="w-8 h-8" />,
      color: 'bg-blue-600'
    }
  ];

  const team = [
    {
      name: 'Rahul Sharma',
      position: 'CEO & Founder',
      image: '👨‍💼',
      description: 'Former food industry executive with 15+ years of experience'
    },
    {
      name: 'Priya Patel',
      position: 'CTO',
      image: '👩‍💻',
      description: 'Tech enthusiast leading our digital transformation'
    },
    {
      name: 'Amit Kumar',
      position: 'Head of Operations',
      image: '👨‍🔧',
      description: 'Operations expert ensuring smooth delivery logistics'
    },
    {
      name: 'Neha Singh',
      position: 'Head of Customer Experience',
      image: '👩‍💼',
      description: 'Customer advocate focused on exceptional service'
    }
  ];

  const achievements = [
    {
      year: '2023',
      title: 'Best Food Delivery App',
      description: 'Awarded by FoodTech India',
      icon: '🏆'
    },
    {
      year: '2023',
      title: 'Fastest Growing Startup',
      description: 'Recognized by Startup India',
      icon: '📈'
    },
    {
      year: '2022',
      title: 'Customer Choice Award',
      description: 'Highest rated delivery app',
      icon: '⭐'
    },
    {
      year: '2022',
      title: 'Innovation in Logistics',
      description: 'Awarded by Logistics India',
      icon: '🚀'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize food delivery'
    },
    {
      year: '2021',
      title: 'First 1000 Orders',
      description: 'Reached our first major milestone'
    },
    {
      year: '2022',
      title: 'Expanded to 10 Cities',
      description: 'Grew our presence across major cities'
    },
    {
      year: '2023',
      title: '1 Million Orders',
      description: 'Celebrated delivering 1 million orders'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-quicklymart-orange-500'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>About Us</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Learn more about QuicklyMart</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-quicklymart-orange-500'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Revolutionizing Food Delivery
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            At QuicklyMart, we believe that great food should be accessible to everyone, 
            delivered fresh and fast. We're on a mission to connect people with their 
            favorite restaurants through technology and exceptional service.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}>
              <CardContent className="p-6">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <Target className="w-5 h-5" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                To provide the fastest, most reliable food delivery service while maintaining 
                the highest standards of food quality, customer service, and safety. We strive 
                to make ordering food as simple as possible while ensuring every meal arrives 
                fresh and delicious.
              </p>
            </CardContent>
          </Card>

          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <Star className="w-5 h-5" />
                <span>Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                To become the most trusted and preferred food delivery platform in India, 
                known for our commitment to quality, speed, and customer satisfaction. 
                We envision a future where everyone can enjoy their favorite food 
                delivered to their doorstep within minutes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}>
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${value.color}`}>
                    {value.icon}
                  </div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{value.title}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}>
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{member.image}</div>
                  <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{member.name}</h3>
                  <p className="text-quicklymart-orange-500 mb-2">{member.position}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Awards & Recognition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="bg-quicklymart-orange-100 text-quicklymart-orange-800">{achievement.year}</Badge>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{achievement.title}</h3>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{achievement.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge className="bg-quicklymart-orange-500">{milestone.year}</Badge>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{milestone.title}</h3>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{milestone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <MapPin className="w-6 h-6 mx-auto mb-2 text-quicklymart-orange-500" />
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Address</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  123 Food Street<br />
                  Park Street Area<br />
                  Kolkata, WB 700001
                </p>
              </div>
              <div>
                <Phone className="w-6 h-6 mx-auto mb-2 text-quicklymart-orange-500" />
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Phone</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>+91 98765 43210</p>
              </div>
              <div>
                <Mail className="w-6 h-6 mx-auto mb-2 text-quicklymart-orange-500" />
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Email</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>hello@quicklymart.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/')} 
            className="bg-quicklymart-orange-500 hover:bg-quicklymart-orange-600 text-lg px-8 py-3"
          >
            Start Ordering Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 