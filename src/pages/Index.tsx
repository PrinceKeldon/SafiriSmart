
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
      
      <div className="min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="bg-card/95 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg md:text-2xl font-heading font-bold text-safari-gradient bg-gradient-to-r from-primary to-safari-sunset bg-clip-text text-transparent truncate">
                    SafiriSmart
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block font-body">Complete Safari Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Background Image */}
        <section className="relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/hero-safari-sunset.jpg')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
          </div>
          
          {/* Safari pattern overlay */}
          <div className="absolute inset-0 safari-pattern" />
          
          <div className="relative container mx-auto px-4 py-8 sm:py-12 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-heading font-bold text-foreground mb-4 sm:mb-6 leading-tight animate-fade-in-up">
                Your Gateway to
                <span className="block text-safari-gradient bg-gradient-to-r from-primary via-safari-sunset to-safari-gold bg-clip-text text-transparent">
                  Unforgettable Kenya Safaris
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-body animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                AI-Powered Planning for Travelers. Streamlined Operations for Global Tour Operators.
                <br className="hidden sm:block" />
                <span className="font-medium text-primary">Experience Africa like never before.</span>
              </p>
              
              {/* Main CTA Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12 md:mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/safari-guide" className="w-full" onClick={handleSafariGuideClick}>
                  <Button size="lg" variant="safari" className="w-full h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg font-bold touch-target">
                    <Compass className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="truncate">SafariGuide AI</div>
                      <div className="text-xs sm:text-sm font-normal opacity-90 truncate">Plan Your Adventure</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full">
                  <Button size="lg" variant="outline" className="w-full h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg font-bold border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target">
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
              <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-safari-gold flex-shrink-0" />
                  <span className="font-body">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                  <span className="font-body">Kenya Specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="font-body">Instant Planning</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-card/60 backdrop-blur-sm py-8 sm:py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-xl sm:text-2xl md:text-4xl font-heading font-bold text-center mb-3 sm:mb-4 text-foreground">How SafiriSmart Works</h3>
            <p className="text-center text-muted-foreground mb-6 sm:mb-8 md:mb-16 max-w-2xl mx-auto text-sm sm:text-base font-body">
              Whether you're a traveler seeking adventure or a tour operator promoting Kenya, we've got you covered.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
              {/* For Travelers */}
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-accent/20 rounded-full mb-3 sm:mb-4">
                    <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                  </div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground mb-2">For Travelers</h4>
                  <p className="text-muted-foreground text-sm sm:text-base font-body">Plan your perfect safari adventure</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-accent/10 rounded-lg safari-card-hover transition-all duration-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-foreground text-sm sm:text-base">Share Your Preferences</h5>
                      <p className="text-muted-foreground text-xs sm:text-sm font-body">Tell us about your interests, budget, and travel style</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-accent/10 rounded-lg safari-card-hover transition-all duration-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-foreground text-sm sm:text-base">Get AI-Generated Itinerary</h5>
                      <p className="text-muted-foreground text-xs sm:text-sm font-body">Receive a personalized safari plan tailored just for you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-accent/10 rounded-lg safari-card-hover transition-all duration-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-foreground text-sm sm:text-base">Connect with Global Operators</h5>
                      <p className="text-muted-foreground text-xs sm:text-sm font-body">Get matched with verified global tour operators promoting Kenya</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Operators */}
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full mb-3 sm:mb-4">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-foreground mb-2">For Tour Operators</h4>
                  <p className="text-muted-foreground text-sm sm:text-base font-body">Streamline your Kenya safari operations</p>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/10 rounded-lg safari-card-hover transition-all duration-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-foreground text-sm sm:text-base">Manage Your Kenya Packages</h5>
                      <p className="text-muted-foreground text-xs sm:text-sm font-body">Create and organize your Kenya safari tour offerings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/10 rounded-lg safari-card-hover transition-all duration-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-foreground text-sm sm:text-base">Track Leads</h5>
                      <p className="text-muted-foreground text-xs sm:text-sm font-body">Monitor and manage customer inquiries efficiently</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/10 rounded-lg safari-card-hover transition-all duration-200">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-foreground font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-foreground text-sm sm:text-base">Grow Your Business</h5>
                      <p className="text-muted-foreground text-xs sm:text-sm font-body">Connect with more travelers and expand your reach</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-8 sm:py-12 md:py-20 safari-pattern">
          <h3 className="text-xl sm:text-2xl md:text-4xl font-heading font-bold text-center mb-3 sm:mb-4 text-foreground">Why Choose SafiriSmart?</h3>
          <p className="text-center text-muted-foreground mb-6 sm:mb-8 md:mb-16 max-w-2xl mx-auto text-sm sm:text-base font-body">
            Cutting-edge technology meets authentic African safari experiences
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="safari-card safari-card-hover border-2 border-accent/20 hover:border-accent/40 transition-colors">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent to-safari-savanna rounded-full flex items-center justify-center">
                  <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl font-heading">Personalized Planning</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base font-body">
                  AI creates custom safari itineraries based on your unique preferences and interests
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="safari-card safari-card-hover border-2 border-safari-savanna/20 hover:border-safari-savanna/40 transition-colors">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-safari-savanna to-accent rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl font-heading">Verified Global Operators</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base font-body">
                  Connect with trusted, verified global tour operators promoting Kenya as a safari destination
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="safari-card safari-card-hover border-2 border-primary/20 hover:border-primary/40 transition-colors sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-safari-sunset rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl font-heading">Seamless Coordination</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base font-body">
                  Streamlined booking and communication between travelers and operators
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section with Background Image */}
        <section className="relative overflow-hidden text-primary-foreground py-8 sm:py-12 md:py-20">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-elephant-silhouette.jpg')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-safari-sunset/85 to-safari-gold/90" />
          </div>
          
          <div className="relative container mx-auto px-4 text-center">
            <h3 className="text-xl sm:text-2xl md:text-4xl font-heading font-bold mb-3 sm:mb-4">Ready to Start Your Safari Journey?</h3>
            <p className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto font-body">
              Join thousands of travelers and global tour operators who trust SafiriSmart for unforgettable safari experiences
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link to="/safari-guide" className="w-full sm:w-auto" onClick={handleSafariGuideClick}>
                <Button size="lg" className="w-full sm:w-auto bg-card text-primary hover:bg-card/90 font-bold shadow-xl hover:shadow-2xl touch-target">
                  <Compass className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Plan My Safari
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-card text-primary hover:bg-card/90 font-bold shadow-xl hover:shadow-2xl touch-target">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Operator Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-safari-earth text-card py-6 sm:py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-base sm:text-lg md:text-xl font-heading font-bold">SafiriSmart</span>
              </div>
              <p className="text-card/70 mb-4 sm:mb-6 text-sm sm:text-base font-body">Connecting Dreams to Adventures Across Kenya</p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-card/60">
                <span>© 2025 SafiriSmart</span>
                <span className="hidden sm:inline">•</span>
                <Link to="/admin/login" className="hover:text-card/90 transition-colors">
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
