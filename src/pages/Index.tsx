
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50" />
          
          {/* Content */}
          <div className="container mx-auto px-4 py-32 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Welcome to Your New App
              </h1>
              <p className="text-xl text-gray-600">
                Start building something amazing with Vite, React, TypeScript, and Tailwind CSS
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-6"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-100 opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-100 opacity-50 blur-3xl" />
        </section>
      </main>
    </div>
  );
};

export default Index;
