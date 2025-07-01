import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Users, Calendar, Settings, Compass, Shield, Zap, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                SafiriSmart
              </h1>
              <p className="text-xs text-gray-600">Complete Safari Solutions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/config">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Gateway to
            <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent">
              Unforgettable Kenya Safaris
            </span>
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-Powered Planning for Travelers. Streamlined Operations for Tour Operators.
            <br />
            <span className="font-medium text-orange-700">Experience Africa like never before.</span>
          </p>
          
          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link to="/safari-guide">
              <Button size="lg" className="w-full sm:w-auto h-16 px-8 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Compass className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div>SafariGuide AI</div>
                  <div className="text-sm font-normal opacity-90">Plan Your Adventure</div>
                </div>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-8 text-lg font-bold border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Shield className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div>TourMaster AI</div>
                  <div className="text-sm font-normal opacity-75">Operator Dashboard</div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Kenya Specialists</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Instant Planning</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">How SafiriSmart Works</h3>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Whether you're a traveler seeking adventure or an operator managing tours, we've got you covered.
          </p>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Travelers */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Compass className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">For Travelers</h4>
                <p className="text-gray-600">Plan your perfect safari adventure</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-800 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Share Your Preferences</h5>
                    <p className="text-gray-600 text-sm">Tell us about your interests, budget, and travel style</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-800 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Get AI-Generated Itinerary</h5>
                    <p className="text-gray-600 text-sm">Receive a personalized safari plan tailored just for you</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-800 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Connect with Operators</h5>
                    <p className="text-gray-600 text-sm">Get matched with verified local tour operators</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Operators */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">For Tour Operators</h4>
                <p className="text-gray-600">Streamline your operations</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-800 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Manage Your Packages</h5>
                    <p className="text-gray-600 text-sm">Create and organize your tour offerings</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-800 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Track Leads</h5>
                    <p className="text-gray-600 text-sm">Monitor and manage customer inquiries efficiently</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-800 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Grow Your Business</h5>
                    <p className="text-gray-600 text-sm">Connect with more travelers and expand your reach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">Why Choose SafiriSmart?</h3>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Cutting-edge technology meets authentic African safari experiences
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Compass className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Personalized Planning</CardTitle>
              <CardDescription className="text-base">
                AI creates custom safari itineraries based on your unique preferences and interests
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Verified Operators</CardTitle>
              <CardDescription className="text-base">
                Connect with trusted, locally-verified tour operators across Kenya
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Seamless Coordination</CardTitle>
              <CardDescription className="text-base">
                Streamlined booking and communication between travelers and operators
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-4">Ready to Start Your Safari Journey?</h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers and operators who trust SafiriSmart for unforgettable safari experiences
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/safari-guide">
              <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-50 font-bold">
                <Compass className="h-5 w-5 mr-2" />
                Plan My Safari
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold">
                <Shield className="h-5 w-5 mr-2" />
                Operator Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MapPin className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold">SafiriSmart</span>
            </div>
            <p className="text-gray-400 mb-6">Connecting Dreams to Adventures Across Kenya</p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <span>© 2024 SafiriSmart</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
