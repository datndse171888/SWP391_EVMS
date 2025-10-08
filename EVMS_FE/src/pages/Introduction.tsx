import React from 'react';
import { 
  Zap, 
  Shield, 
  Users, 
  Award, 
  Battery, 
  Settings, 
  CheckCircle, 
  ArrowRight
} from 'lucide-react';
const Introduction: React.FC = () => {
const services = [
    {
      icon: Battery,
      title: "Battery Diagnostics",
      description: "Advanced testing and health monitoring for all EV battery systems"
    },
    {
      icon: Settings,
      title: "Preventive Maintenance", 
      description: "Scheduled maintenance to keep your electric vehicle running efficiently"
    },
    {
      icon: Zap,
      title: "Charging System Repair",
      description: "Expert repair and maintenance of charging ports and onboard chargers"
    },
    {
      icon: Shield,
      title: "Software Updates",
      description: "Latest firmware updates and system optimization for peak performance"
    }
  ];

  const stats = [
    { number: "10,000+", label: "EVs Serviced" },
    { number: "98%", label: "Customer Satisfaction" },
    { number: "15+", label: "Years Experience" },
    { number: "24/7", label: "Support Available" }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Lead EV Technician", 
      experience: "12+ years in electric vehicle systems"
    },
    {
      name: "Michael Chen",
      role: "Battery Specialist",
      experience: "Expert in lithium-ion battery technology"
    },
    {
      name: "Emily Rodriguez",
      role: "Service Manager",
      experience: "Operations and customer service excellence"
    }
  ];
  return (
     <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-blue-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6 mt-5">
              Intoduction
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-blue-500"> EV Repair</span>
            </h1>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto mb-8">
              We're pioneering advanced maintenance solutions for electric vehicles, combining cutting-edge technology 
              with expert craftsmanship to keep your EV running at peak performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-300 text-xl text-blue-900 px-8 py-3 rounded-lg font-semibold  transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Schedule Service</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="border-2 border-orange-200 text-orange-500 px-8 py-3 rounded-lg font-semibold  hover: transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">
                Revolutionizing EV Care Since 2009
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded with a vision to support the electric vehicle revolution, EV Repair has grown from a 
                small garage operation to the region's most trusted EV maintenance facility. Our journey began 
                when electric vehicles were still a novelty, and we've evolved alongside the technology.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Today, we combine traditional automotive expertise with cutting-edge EV technology to deliver 
                unparalleled service quality. Our state-of-the-art facility and certified technicians ensure 
                your electric vehicle receives the specialized care it deserves.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">ASE Certified EV Technicians</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Advanced Diagnostic Equipment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Manufacturer Approved Parts</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-blue-400 rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-xl p-6">
                  <Award className="h-12 w-12 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Award Winning Service</h3>
                  <p className="text-gray-600">
                    Recognized as the "Best EV Service Center" three years running by the Regional Auto Association.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Mission & Values</h2>
            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
              Driving sustainable transportation forward through exceptional service and innovation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation First</h3>
              <p className="text-gray-600">
                We stay ahead of EV technology trends, continuously upgrading our tools and training to provide 
                the most advanced maintenance solutions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safety & Reliability</h3>
              <p className="text-gray-600">
                Every service is performed with meticulous attention to safety protocols, ensuring your EV 
                is reliable and road-ready.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Focus</h3>
              <p className="text-gray-600">
                Your satisfaction drives everything we do. We provide transparent communication and 
                personalized service for every customer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Comprehensive EV Services</h2>
            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
              From routine maintenance to complex repairs, we're your one-stop solution for all electric vehicle needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-white-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
              Our certified technicians and service professionals are passionate about electric vehicles
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-blue rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-br from-orange-400 to-blue-400 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-orange-500 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Introduction
