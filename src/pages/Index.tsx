
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MapPin, Users, Calendar, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">TourMaster AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/config">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure
              </Button>
            </Link>
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Safari Tour Management
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Streamline your tour operations with intelligent lead management, 
          automated itinerary generation, and seamless operator coordination.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <Button size="lg" className="flex items-center gap-2">
              Start Managing Tours
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/config">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup Configuration
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Everything You Need</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Track and manage customer inquiries with intelligent assignment to tour operators
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>AI Itinerary Generation</CardTitle>
              <CardDescription>
                Create personalized safari itineraries using advanced AI and local expertise
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <MapPin className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Operator Network</CardTitle>
              <CardDescription>
                Connect with verified tour operators and manage partnerships efficiently
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Tours?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join tour operators already using TourMaster AI to grow their business
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 TourMaster AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
