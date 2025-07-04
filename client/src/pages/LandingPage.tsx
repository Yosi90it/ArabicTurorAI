import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTrial } from '@/contexts/TrialContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BookOpen, 
  Play, 
  GraduationCap, 
  Star, 
  Check, 
  ArrowRight, 
  Globe, 
  Users, 
  Award,
  Zap,
  Heart,
  MessageCircle
} from 'lucide-react';

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { isTrialActive, startTrial } = useTrial();
  const { strings } = useLanguage();

  const handleStartFree = () => {
    if (!isAuthenticated) {
      setLocation('/signup');
    } else if (!isTrialActive) {
      startTrial();
      setLocation('/learn');
    } else {
      setLocation('/learn');
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Personalized Arabic lessons powered by advanced AI that adapts to your learning pace and style."
    },
    {
      icon: BookOpen,
      title: "Interactive Reading",
      description: "Read authentic Arabic texts with instant word translation and grammar explanations."
    },
    {
      icon: Play,
      title: "Video Training",
      description: "Learn pronunciation and conversation through engaging video lessons and exercises."
    },
    {
      icon: GraduationCap,
      title: "Smart Flashcards",
      description: "Build vocabulary with spaced repetition flashcards that remember what you've learned."
    },
    {
      icon: Globe,
      title: "Cultural Context",
      description: "Understand Arabic culture and context alongside language learning for deeper comprehension."
    },
    {
      icon: Award,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed progress analytics and achievement badges."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "Medical Student",
      content: "ArabicAI transformed my Arabic learning journey. The AI-powered lessons adapt perfectly to my busy schedule.",
      rating: 5,
      avatar: "👩‍⚕️"
    },
    {
      name: "Mohammed Al-Hassan",
      role: "Business Professional",
      content: "The interactive reading feature helped me understand business Arabic in just 3 months. Incredible progress!",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Lisa Chen",
      role: "Language Enthusiast",
      content: "Finally, an Arabic learning platform that makes sense. The cultural context lessons are invaluable.",
      rating: 5,
      avatar: "👩‍🎓"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      monthlyPrice: 19,
      yearlyPrice: 190,
      description: "Perfect for beginners starting their Arabic journey",
      features: [
        "AI Chat Assistant",
        "Basic Flashcards",
        "5 Book Chapters/month",
        "Community Support"
      ],
      popular: false
    },
    {
      name: "Premium",
      monthlyPrice: 39,
      yearlyPrice: 390,
      description: "Ideal for serious learners who want full access",
      features: [
        "Everything in Basic",
        "Unlimited Book Access",
        "Video Training Library",
        "Advanced AI Features",
        "Progress Analytics",
        "Priority Support"
      ],
      popular: true
    },
    {
      name: "Pro",
      monthlyPrice: 79,
      yearlyPrice: 790,
      description: "For advanced learners and professionals",
      features: [
        "Everything in Premium",
        "1-on-1 AI Tutoring",
        "Custom Learning Paths",
        "Business Arabic Module",
        "Certification Prep",
        "API Access"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              🚀 AI-Powered Arabic Learning Platform
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Master Arabic with
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto leading-relaxed">
              Transform your Arabic learning journey with personalized AI tutoring, interactive content, 
              and cultural immersion designed for modern learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleStartFree}
                className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl"
              >
                {isTrialActive ? strings.startLearning : strings.startFree}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-2xl">
                Watch Demo
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-purple-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>10,000+ Active Learners</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
              Why Choose ArabicAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of language learning with cutting-edge AI technology
              and proven pedagogical methods.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
              Loved by Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful Arabic learners who transformed their skills with ArabicAI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mr-4 text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Flexible pricing designed to match your learning goals and budget.
            </p>
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-lg ${!isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  isYearly ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                    isYearly ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-lg ${isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge className="bg-green-600 text-white border-0 ml-2">
                  Save 50%
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-0 rounded-2xl ${
                plan.popular 
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white transform scale-105' 
                  : 'bg-white text-gray-800'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-gray-900 px-4 py-1 text-sm font-semibold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`mb-6 ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className={`text-lg ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check className={`w-5 h-5 mr-3 ${
                          plan.popular ? 'text-green-300' : 'text-green-500'
                        }`} />
                        <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/subscription">
                    <Button className={`w-full py-3 rounded-xl font-semibold ${
                      plan.popular 
                        ? 'bg-white text-purple-600 hover:bg-gray-100' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Master Arabic?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of learners who are already transforming their Arabic skills with AI-powered education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleStartFree}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl"
            >
              {isTrialActive ? strings.startLearning : strings.startFree}
              <Zap className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-2xl">
              Contact Sales
              <MessageCircle className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">ArabicAI</h3>
              <p className="text-gray-400 mb-4">
                Revolutionary AI-powered Arabic learning platform for the modern world.
              </p>
              <div className="flex space-x-4">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-gray-400">Made with love for language learners</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ai-chat" className="hover:text-white transition-colors">AI Chat</Link></li>
                <li><Link href="/book-reader" className="hover:text-white transition-colors">Book Reader</Link></li>
                <li><Link href="/video-trainer" className="hover:text-white transition-colors">Video Training</Link></li>
                <li><Link href="/flashcards" className="hover:text-white transition-colors">Flashcards</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/weekly-plan" className="hover:text-white transition-colors">7-Day Plan</Link></li>
                <li><Link href="/alphabet-trainer" className="hover:text-white transition-colors">Alphabet Trainer</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 ArabicAI. All rights reserved. Built with ❤️ for Arabic learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}