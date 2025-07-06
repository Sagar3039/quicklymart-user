import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Users, Heart, Zap, Globe, GraduationCap, MapPin, Clock, DollarSign, Moon, Sun, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/App';
import { toast } from '@/components/ui/sonner';

const Careers = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    coverLetter: '',
    resume: null
  });

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Engineering',
      location: 'Kolkata, WB',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₹8-15 LPA',
      description: 'We are looking for a passionate React developer to join our team and help build amazing user experiences.',
      requirements: [
        'Strong proficiency in React, TypeScript, and modern JavaScript',
        'Experience with state management (Redux, Zustand)',
        'Knowledge of responsive design and CSS frameworks',
        'Experience with testing frameworks (Jest, React Testing Library)',
        'Good understanding of REST APIs and GraphQL'
      ],
      responsibilities: [
        'Develop and maintain high-quality React applications',
        'Collaborate with design and product teams',
        'Write clean, maintainable, and well-documented code',
        'Participate in code reviews and technical discussions',
        'Mentor junior developers'
      ]
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹10-18 LPA',
      description: 'Join our product team to help shape the future of food delivery and create amazing user experiences.',
      requirements: [
        'Experience in product management or related field',
        'Strong analytical and problem-solving skills',
        'Excellent communication and collaboration abilities',
        'Experience with agile methodologies',
        'Knowledge of user research and data analysis'
      ],
      responsibilities: [
        'Define product strategy and roadmap',
        'Gather and analyze user feedback',
        'Work with engineering and design teams',
        'Monitor product metrics and KPIs',
        'Drive product launches and iterations'
      ]
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Mumbai, MH',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₹6-12 LPA',
      description: 'Create beautiful and intuitive user interfaces that delight our customers and drive business growth.',
      requirements: [
        'Strong portfolio showcasing UI/UX work',
        'Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)',
        'Understanding of user-centered design principles',
        'Experience with mobile app design',
        'Knowledge of design systems and component libraries'
      ],
      responsibilities: [
        'Design user interfaces and user experiences',
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Collaborate with product and engineering teams',
        'Maintain and evolve our design system'
      ]
    },
    {
      id: 4,
      title: 'Operations Manager',
      department: 'Operations',
      location: 'Delhi, NCR',
      type: 'Full-time',
      experience: '3-6 years',
      salary: '₹8-15 LPA',
      description: 'Lead our operations team to ensure smooth delivery operations and excellent customer service.',
      requirements: [
        'Experience in operations management or logistics',
        'Strong leadership and team management skills',
        'Excellent problem-solving and decision-making abilities',
        'Experience with process optimization',
        'Knowledge of supply chain management'
      ],
      responsibilities: [
        'Manage day-to-day operations',
        'Optimize delivery processes and efficiency',
        'Lead and mentor operations team',
        'Monitor and improve service quality',
        'Develop and implement operational strategies'
      ]
    },
    {
      id: 5,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Bangalore, KA',
      type: 'Full-time',
      experience: '1-3 years',
      salary: '₹5-10 LPA',
      description: 'Help us grow our brand and reach more customers through creative marketing campaigns.',
      requirements: [
        'Experience in digital marketing or related field',
        'Knowledge of social media marketing and content creation',
        'Experience with marketing analytics and tools',
        'Creative thinking and strong communication skills',
        'Understanding of customer acquisition and retention'
      ],
      responsibilities: [
        'Develop and execute marketing campaigns',
        'Create engaging content for social media',
        'Analyze marketing performance and optimize campaigns',
        'Collaborate with creative and product teams',
        'Manage brand presence across channels'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance and wellness programs',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-600'
    },
    {
      title: 'Learning & Growth',
      description: 'Continuous learning opportunities and career development',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-blue-600'
    },
    {
      title: 'Flexible Work',
      description: 'Remote work options and flexible working hours',
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-green-600'
    },
    {
      title: 'Team Events',
      description: 'Regular team building activities and social events',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-600'
    }
  ];

  const handleApply = (job) => {
    setSelectedJob(job);
    setApplicationData(prev => ({ ...prev, position: job.title }));
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Application submitted successfully! We will get back to you soon.');
    setShowApplicationForm(false);
    setApplicationData({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      coverLetter: '',
      resume: null
    });
  };

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
                className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-pickngo-orange-500'}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Careers</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Join our amazing team</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-pickngo-orange-500'}
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
            Join Our Team
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Be part of a team that's revolutionizing food delivery. We're looking for passionate 
            individuals who want to make a difference and grow with us.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} text-center`}>
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${benefit.color}`}>
                    {benefit.icon}
                  </div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{benefit.title}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Job Openings */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Open Positions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobOpenings.map((job) => (
              <Card key={job.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{job.title}</CardTitle>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{job.department}</p>
                    </div>
                    <Badge className="bg-pickngo-orange-500">{job.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{job.experience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{job.salary}</span>
                      </div>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{job.description}</p>
                  </div>
                  <Button 
                    onClick={() => handleApply(job)}
                    className="w-full bg-pickngo-orange-500 hover:bg-pickngo-orange-600"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-800">
                  <span>Apply for {selectedJob?.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-600 hover:text-pickngo-orange-500"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-800">Full Name *</Label>
                      <Input
                        id="name"
                        value={applicationData.name}
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
                        value={applicationData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-gray-800">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={applicationData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience" className="text-gray-800">Years of Experience *</Label>
                      <Select value={applicationData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-8">5-8 years</SelectItem>
                          <SelectItem value="8+">8+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="coverLetter" className="text-gray-800">Cover Letter *</Label>
                    <Textarea
                      id="coverLetter"
                      value={applicationData.coverLetter}
                      onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                      required
                      rows={5}
                      className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="resume" className="text-gray-800">Resume/CV *</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleInputChange('resume', e.target.files[0])}
                      required
                      className="bg-white border-gray-300 text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pickngo-orange-500 file:text-white hover:file:bg-pickngo-orange-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-pickngo-orange-500 hover:bg-pickngo-orange-600"
                    >
                      Submit Application
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact HR */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Don't see a perfect fit?</h3>
            <p className="text-gray-600 mb-6">
              We're always looking for talented individuals to join our team. 
              Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-pickngo-orange-500 hover:bg-pickngo-orange-600">
                <Mail className="w-4 h-4 mr-2" />
                Send Resume
              </Button>
              <Button variant="outline" className="border-pickngo-orange-500 text-pickngo-orange-500 hover:bg-pickngo-orange-500 hover:text-white">
                <Phone className="w-4 h-4 mr-2" />
                Contact HR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Careers; 
