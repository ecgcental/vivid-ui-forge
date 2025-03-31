
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  BarChart2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  LightbulbOff,
  ChevronRight,
  Shield,
  Zap,
  AreaChart,
  ServerCrash,
  LifeBuoy
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <AlertTriangle className="h-12 w-12 text-ecg-gold" />,
      title: "Real-time Fault Reporting",
      description: "Quickly log faults with detailed information including type, location, and affected customers."
    },
    {
      icon: <BarChart2 className="h-12 w-12 text-ecg-gold" />,
      title: "Interactive Dashboard",
      description: "Monitor active and resolved faults in real-time with filtering capabilities by region and type."
    },
    {
      icon: <MapPin className="h-12 w-12 text-ecg-gold" />,
      title: "GPS Location Tracking",
      description: "Precisely locate faults on an interactive map for faster response by the nearest team."
    },
    {
      icon: <AreaChart className="h-12 w-12 text-ecg-gold" />,
      title: "Analytics & Reporting",
      description: "Generate detailed reports on system reliability, MTTR, and outage statistics for better planning."
    },
    {
      icon: <AlertCircle className="h-12 w-12 text-ecg-gold" />,
      title: "Real-time Alerts",
      description: "Receive instant notifications about new faults and status updates to stay informed."
    },
    {
      icon: <Clock className="h-12 w-12 text-ecg-gold" />,
      title: "Automated Calculations",
      description: "Automatically calculate key metrics like unserved energy and outage duration for improved accuracy."
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-12 w-12 text-ecg-gold" />,
      title: "Faster Response Time",
      description: "Reduce the time between fault detection and resolution with streamlined workflows."
    },
    {
      icon: <Shield className="h-12 w-12 text-ecg-gold" />,
      title: "Enhanced Reliability",
      description: "Improve grid reliability through proactive monitoring and maintenance."
    },
    {
      icon: <ServerCrash className="h-12 w-12 text-ecg-gold" />,
      title: "Minimized Downtime",
      description: "Reduce service interruptions through efficient fault management and prioritization."
    },
    {
      icon: <LifeBuoy className="h-12 w-12 text-ecg-gold" />,
      title: "Customer Satisfaction",
      description: "Keep customers informed with transparent, timely updates on service status."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-ecg-darkBlue to-ecg-blue py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:25px_25px]"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Revolutionizing Power Distribution Management
            </h1>
            <p className="text-xl opacity-90 md:pr-12">
              The comprehensive solution for the Electricity Company of Ghana to monitor, manage, and resolve power distribution faults efficiently across the country.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-ecg-gold text-black hover:bg-ecg-gold/90 rounded-full px-8">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-ecg-gold/30 rounded-2xl blur-xl"></div>
              <img 
                src="/lovable-uploads/8a9a1582-1dac-407d-adcc-a9d1c6f772bc.png" 
                alt="ECG Fault Master" 
                className="relative rounded-2xl shadow-2xl w-80 md:w-96 bg-ecg-darkBlue/70 p-8 backdrop-blur-sm border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-ecg-blue">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides the essential tools needed to efficiently manage and resolve power distribution faults.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card group hover:border-ecg-blue/50 hover:translate-y-[-4px] transition-all duration-300">
                <div className="bg-ecg-blue/5 rounded-full p-4 inline-block mb-6 group-hover:bg-ecg-blue/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-ecg-blue">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-ecg-blue">Why Choose ECG Fault Master</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the benefits of our comprehensive fault management system designed for the unique needs of power distribution networks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-8 rounded-xl bg-white shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="bg-ecg-blue/5 rounded-full p-4 inline-block mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-ecg-blue">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-gray-200 rounded-xl hover:border-ecg-blue/20 transition-all duration-300 bg-gradient-to-b from-white to-gray-50">
              <LightbulbOff className="h-16 w-16 text-ecg-gold mx-auto mb-6" />
              <div className="text-5xl font-bold text-ecg-blue mb-3">98.5%</div>
              <p className="text-gray-600 text-lg">Power Uptime</p>
            </div>
            <div className="text-center p-8 border border-gray-200 rounded-xl hover:border-ecg-blue/20 transition-all duration-300 bg-gradient-to-b from-white to-gray-50">
              <Clock className="h-16 w-16 text-ecg-gold mx-auto mb-6" />
              <div className="text-5xl font-bold text-ecg-blue mb-3">30 min</div>
              <p className="text-gray-600 text-lg">Average Response Time</p>
            </div>
            <div className="text-center p-8 border border-gray-200 rounded-xl hover:border-ecg-blue/20 transition-all duration-300 bg-gradient-to-b from-white to-gray-50">
              <AlertTriangle className="h-16 w-16 text-ecg-gold mx-auto mb-6" />
              <div className="text-5xl font-bold text-ecg-blue mb-3">15,000+</div>
              <p className="text-gray-600 text-lg">Faults Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-ecg-blue text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">What Our Users Say</h2>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <p className="text-xl italic mb-6">
                "The ECG Fault Master system has transformed how we manage power distribution issues. Our response times have improved by 45%, and we're able to provide better service to our customers."
              </p>
              <div>
                <p className="font-bold text-ecg-gold">James Kwame</p>
                <p className="text-sm text-white/70">Regional Manager, Greater Accra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ecg-darkBlue to-ecg-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Improve Power Distribution Management?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join the Electricity Company of Ghana in revolutionizing how we manage and respond to power distribution faults.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button asChild size="lg" className="bg-ecg-gold text-black hover:bg-ecg-gold/90 rounded-full px-8">
              <Link to="/signup" className="flex items-center">
                Get Started Today
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-full px-8">
              <Link to="/login" className="flex items-center">
                Login to Your Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
