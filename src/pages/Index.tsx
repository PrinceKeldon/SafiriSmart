
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Users, Calendar, Settings, Compass, Shield, Zap, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { PageSEO } from '@/components/seo/PageSEO';
import { createOrganizationSchema, createWebSiteSchema, createServiceSchema } from '@/utils/structuredData';
import { trackPageView } from '@/utils/analytics';
import { trackSafariGuideVisit } from '@/utils/trackingUtils';
import { HomePageCounters } from '@/components/homepage/HomePageCounters';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    trackPageView('Homepage');
  }, []);

  const handleSafariGuideClick = () => {
    trackSafariGuideVisit();
  };

  const organizationSchema = createOrganizationSchema();
  const websiteSchema = createWebSiteSchema();
  const serviceSchema = createServiceSchema();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema, serviceSchema]
  };

  return (
    <>
      <PageSEO
        title="SafiriSmart - AI-Powered Kenya Safari Planning & Tour Operations"
        description="Plan your perfect Kenya safari with AI assistance. Connect with verified global tour operators promoting Kenya as a safari destination, create personalized itineraries, and experience wildlife adventures in Maasai Mara, Amboseli, and beyond."
        keywords="Kenya safari, AI safari planner, global tour operators Kenya, Maasai Mara tours, Amboseli safari, wildlife tours Kenya, safari booking platform, Kenya travel planning"
        canonicalUrl="/"
        structuredData={structuredData}
        ogType="website"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent truncate">
                    SafiriSmart
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Complete Safari Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 sm:py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Your Gateway to
              <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent">
                Unforgettable Kenya Safaris
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-700 mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
              AI-Powered Planning for Travelers. Streamlined Operations for Global Tour Operators.
              <br className="hidden sm:block" />
              <span className="font-medium text-orange-700">Experience Africa like never before.</span>
            </p>
            
            {/* Main CTA Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12 md:mb-16">
              <Link to="/safari-guide" className="w-full" onClick={handleSafariGuideClick}>
                <Button size="lg" className="w-full h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target">
                  <Compass className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="truncate">SafariGuide AI</div>
                    <div className="text-xs sm:text-sm font-normal opacity-90 truncate">Plan Your Adventure</div>
                  </div>
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full">
                <Button size="lg" variant="outline" className="w-full h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg font-bold border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="truncate">TourMaster AI</div>
                    <div className="text-xs sm:text-sm font-normal opacity-75 truncate">Operator Dashboard</div>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Counters */}
            <HomePageCounters />

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                <span>Kenya Specialists</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                <span>Instant Planning</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white/60 backdrop-blur-sm py-8 sm:py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">How SafiriSmart Works</h3>
            <p className="text-center text-gray-600 mb-6 sm:mb-8 md:mb-16 max-w-2xl mx-auto text-sm sm:text-base">
              Whether you're a traveler seeking adventure or a global tour operator promoting Kenya, we've got you covered.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
              {/* For Travelers */}
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                    <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">For Travelers</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Plan your perfect safari adventure</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-800 font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Share Your Preferences</h5>
                      <p className="text-gray-600 text-xs sm:text-sm">Tell us about your interests, budget, and travel style</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-800 font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Get AI-Generated Itinerary</h5>
                      <p className="text-gray-600 text-xs sm:text-sm">Receive a personalized safari plan tailored just for you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-800 font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Connect with Global Operators</h5>
                      <p className="text-gray-600 text-xs sm:text-sm">Get matched with verified global tour operators promoting Kenya</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Operators */}
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full mb-3 sm:mb-4">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">For Global Tour Operators</h4>
                  <p className="text-gray-600 text-sm sm:text-base">Streamline your Kenya safari operations</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-orange-800 font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Manage Your Kenya Packages</h5>
                      <p className="text-gray-600 text-xs sm:text-sm">Create and organize your Kenya safari tour offerings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-orange-800 font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Track Leads</h5>
                      <p className="text-gray-600 text-xs sm:text-sm">Monitor and manage customer inquiries efficiently</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-orange-800 font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Grow Your Business</h5>
                      <p className="text-gray-600 text-xs sm:text-sm">Connect with more travelers and expand your reach</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-8 sm:py-12 md:py-20">
          <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">Why Choose SafiriSmart?</h3>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 md:mb-16 max-w-2xl mx-auto text-sm sm:text-base">
            Cutting-edge technology meets authentic African safari experiences
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-green-100 hover:border-green-200 transition-colors bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl">Personalized Planning</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  AI creates custom safari itineraries based on your unique preferences and interests
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl">Verified Global Operators</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  Connect with trusted, verified global tour operators promoting Kenya as a safari destination
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors bg-white/80 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl">Seamless Coordination</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  Streamlined booking and communication between travelers and global operators
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 text-white py-8 sm:py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-xl sm:text-2xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Start Your Safari Journey?</h3>
            <p className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of travelers and global tour operators who trust SafiriSmart for unforgettable safari experiences
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/safari-guide" className="w-full sm:w-auto" onClick={handleSafariGuideClick}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-50 font-bold border-2 border-white hover:border-gray-100 touch-target">
                  <Compass className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Plan My Safari
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-orange-600 hover:bg-gray-50 font-bold border-2 border-white hover:border-gray-100 touch-target">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Operator Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-6 sm:py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <span className="text-base sm:text-lg md:text-xl font-bold">SafiriSmart</span>
              </div>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Connecting Dreams to Adventures Across Kenya</p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-400">
                <span>© 2025 SafiriSmart</span>
                <span className="hidden sm:inline">•</span>
                <Link to="/admin/login" className="hover:text-gray-300 transition-colors">
                  Admin Access
                </Link>
                <span className="hidden sm:inline">•</span>
                <span>All rights reserved</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
