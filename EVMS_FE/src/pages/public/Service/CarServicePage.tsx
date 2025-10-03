import React from 'react';
import { Car, Wrench, Zap, Shield, Clock, Settings, Cog } from 'lucide-react';
import Clean from '../../../assets/images/clean.png';
import { DollarSign, AlertTriangle, Heart } from 'lucide-react';
import { carService } from '../../../constants/data/CarService';


export const CarServicePage: React.FC = () => {
    const services = [
        {
            icon: <Wrench className="h-12 w-12 text-blue-500" />,
            title: "Basic Maintenance",
            description: "Essential car care services",
            price: "$99",
            features: [
                "Oil change & filter replacement",
                "Tire pressure check",
                "Fluid level inspection",
                "Basic diagnostic scan",
                "Visual safety inspection"
            ]
        },
        {
            icon: <Car className="h-12 w-12 text-orange-500" />,
            title: "Premium Service",
            description: "Comprehensive vehicle care",
            price: "$199",
            features: [
                "Complete maintenance package",
                "Brake system inspection",
                "Engine performance tuning",
                "Electrical system check",
                "Air conditioning service",
                "6-month warranty"
            ],
            popular: true
        },
        {
            icon: <Zap className="h-12 w-12 text-yellow-500" />,
            title: "Performance Upgrade",
            description: "High-performance modifications",
            price: "$399",
            features: [
                "ECU tuning & optimization",
                "Performance exhaust system",
                "Cold air intake installation",
                "Suspension upgrades",
                "Custom modifications",
                "1-year performance warranty"
            ]
        }
    ];
    
    const reasons = [
        {
            icon: Shield,
            title: 'Safety First',
            description: 'Regular maintenance ensures all safety systems function properly, protecting you and your passengers.',
            color: 'bg-red-500'
        },
        {
            icon: DollarSign,
            title: 'Cost Savings',
            description: 'Preventive maintenance costs far less than major repairs and extends your vehicle\'s lifespan.',
            color: 'bg-green-500'
        },
        {
            icon: Clock,
            title: 'Reliability',
            description: 'Well-maintained vehicles are less likely to break down, ensuring you reach your destination on time.',
            color: 'bg-blue-500'
        },
        {
            icon: Zap,
            title: 'Performance',
            description: 'Regular service keeps your vehicle running at peak efficiency with optimal fuel economy.',
            color: 'bg-yellow-500'
        },
        {
            icon: AlertTriangle,
            title: 'Early Detection',
            description: 'Routine inspections catch small problems before they become expensive major issues.',
            color: 'bg-orange-500'
        },
        {
            icon: Heart,
            title: 'Longevity',
            description: 'Proper maintenance significantly extends the life of your vehicle and maintains its value.',
            color: 'bg-purple-500'
        }
    ];
    return (
        <div className="relative min-h-screen bg-gray-900">
            <div className="relative z-10">


                {/* Hero Section */}
                <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${Clean})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <Car className="h-16 w-16 text-blue-500" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Professional
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-azure-500 block">
                                Car Service
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            State-of-the-art automotive care with advanced diagnostics, expert technicians,
                            and cutting-edge technology to keep your vehicle running at peak performance.
                        </p>
                    </div>
                </section>


                 {/* Car Services Section */}
                <section id="car-services" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Car Services</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Professional automotive services designed to keep your car in perfect condition. Explore our comprehensive service categories.
                            </p>
                        </div>

                        {/* All Services Display */}
                        <div className="space-y-20">
                            {carService.map((service, index) => (
                                <div key={index} className="bg-gray-50 rounded-2xl p-8 lg:p-12">
                                    <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                                        <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className="bg-blue-600 p-3 rounded-lg">
                                                    <service.icon className="h-8 w-8 text-white" />
                                                </div>
                                                <h3 className="text-3xl font-bold text-gray-900">{service.title}</h3>
                                            </div>

                                            <p className="text-lg text-gray-600 mb-8">{service.description}</p>

                                            <div className="grid grid-cols-2 gap-4">
                                                {service.features.map((feature, featureIndex) => (
                                                    <div key={featureIndex} className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                        <span className="text-gray-700">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="rounded-xl shadow-lg w-full h-96 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
               
                {/* Service Packages Section */}
                <section className="py-20 bg-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Service Packages</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Choose from our comprehensive service packages designed to meet your needs and budget.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div key={index} className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${service.popular ? 'border-2 border-orange-500 relative' : ''}`}>
                                    {service.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        {service.icon}
                                        <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{service.title}</h3>
                                        <p className="text-gray-600 mb-4">{service.description}</p>
                                        <div className="text-4xl font-bold text-blue-600">{service.price}</div>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {service.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center space-x-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${service.popular
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                        }`}>
                                        Choose Plan
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-4">Advanced Technology</h2>
                            <p className="text-gray-300 text-lg">Experience the future of automotive service</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <Zap className="h-8 w-8 text-blue-500" />,
                                    title: "Digital Diagnostics",
                                    description: "AI-powered vehicle analysis"
                                },
                                {
                                    icon: <Shield className="h-8 w-8 text-green-500" />,
                                    title: "Quality Guarantee",
                                    description: "100% satisfaction assured"
                                },
                                {
                                    icon: <Clock className="h-8 w-8 text-orange-500" />,
                                    title: "Fast Service",
                                    description: "Same-day completion available"
                                },
                                {
                                    icon: <Car className="h-8 w-8 text-purple-500" />,
                                    title: "All Makes & Models",
                                    description: "Expertise across all brands"
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700">
                                    <div className="flex justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to Service Your Car?</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Book your appointment today and experience the difference of professional automotive care.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                                Book Appointment
                            </button>
                            <button className="border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                                Get Quote
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};