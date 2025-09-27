import React, { useState, useRef } from 'react';
import {
    Save,
    Plus,
    Trash2,
    Edit3,
    Upload,
    Eye,
    Settings,
    Camera,
    FileText,
    Shield,
    Home,
    Building,
    CreditCard,
    Users,
    TrendingUp,
    Award,
    Star,
    Phone,
    CheckCircle,
    Calculator,
    Search,
    HandHeart,
    Briefcase,
    Clock,
    DollarSign,
    Crown,
    Gem,
    Zap,
    Bot,
    Rocket,
    Target,
    Globe,
    Download,
    HelpCircle
} from 'lucide-react';

const ServicesPageCMS = () => {
    // Hero Section Data
    const [heroData, setHeroData] = useState({
        title: 'Complete Real Estate Solutions',
        description: 'From property search to final registration, we provide end-to-end real estate services with expert guidance and transparent pricing',
        primaryButtonText: 'Get Free Consultation',
        secondaryButtonText: 'View All Services'
    });

    // Core Services Data
    const [coreServices, setCoreServices] = useState([
        {
            id: 'property-buying',
            title: 'Property Buying',
            subtitle: 'Find Your Dream Home',
            description: 'Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.',
            icon: 'Home',
            color: 'blue',
            features: [
                'AI-powered property matching',
                'Verified property listings',
                'Expert property evaluation',
                'Negotiation support',
                'Legal documentation assistance',
                'Post-purchase support'
            ],
            process: [
                'Requirement Analysis',
                'Property Shortlisting',
                'Site Visits & Evaluation',
                'Price Negotiation',
                'Legal Verification',
                'Registration & Handover'
            ],
            price: 'No Hidden Charges',
            duration: '15-30 days',
            successRate: '95%'
        },
        {
            id: 'property-selling',
            title: 'Property Selling',
            subtitle: 'Maximize Your Returns',
            description: 'End-to-end selling support with premium marketing, verified buyers, and transparent pricing to get the best value.',
            icon: 'Building',
            color: 'green',
            features: [
                'Professional property photography',
                'Multi-channel marketing',
                'Verified buyer database',
                'Price optimization strategies',
                'Legal documentation support',
                'Hassle-free transactions'
            ],
            process: [
                'Property Valuation',
                'Documentation Review',
                'Marketing & Promotion',
                'Buyer Screening',
                'Negotiation & Closure',
                'Registration Support'
            ],
            price: '2% Commission',
            duration: '30-60 days',
            successRate: '92%'
        }
    ]);

    // Additional Services Data
    const [additionalServices, setAdditionalServices] = useState([
        {
            title: 'Property Valuation',
            description: 'Professional property valuation for accurate market pricing',
            icon: 'Calculator',
            price: '₹5,000'
        },
        {
            title: 'Virtual Property Tours',
            description: '360° virtual tours for remote property viewing',
            icon: 'Eye',
            price: '₹8,000'
        }
    ]);

    // Why Choose Us Data
    const [whyChooseUs, setWhyChooseUs] = useState([
        {
            title: '15+ Years Experience',
            description: 'Decades of expertise in real estate',
            icon: 'Award',
            stat: '15+'
        },
        {
            title: 'Verified Properties',
            description: '100% legal and verified listings',
            icon: 'Shield',
            stat: '100%'
        }
    ]);

    // Service Process Data
    const [serviceProcess, setServiceProcess] = useState([
        {
            step: '1',
            title: 'Consultation',
            description: 'Free consultation to understand your requirements'
        },
        {
            step: '2',
            title: 'Planning',
            description: 'Detailed planning and strategy development'
        },
        {
            step: '3',
            title: 'Execution',
            description: 'Professional execution with regular updates'
        },
        {
            step: '4',
            title: 'Completion',
            description: 'Successful completion with post-service support'
        }
    ]);

    // Testimonials Data
    const [testimonials, setTestimonials] = useState([
        {
            name: 'Rajesh Kumar',
            service: 'Property Buying',
            text: 'ResaleExpert helped me find my dream home within my budget. Their AI matching is incredible!',
            rating: 5,
            location: 'Mumbai',
            image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'
        },
        {
            name: 'Priya Sharma',
            service: 'Property Selling',
            text: 'Sold my property 20% above market rate with their expert marketing strategies.',
            rating: 5,
            location: 'Pune',
            image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200'
        }
    ]);

    // Pricing Plans Data
    const [pricingPlans, setPricingPlans] = useState([
        {
            name: 'Basic',
            price: 'Free',
            description: 'Perfect for first-time users',
            features: [
                'Property search & listings',
                'Basic property details',
                'Contact property owners',
                'Basic market insights'
            ],
            buttonText: 'Get Started',
            buttonColor: 'gray',
            isPopular: false
        },
        {
            name: 'Premium',
            price: '₹2,999',
            description: 'Most popular choice',
            features: [
                'Everything in Basic',
                'Expert consultation',
                'Site visit assistance',
                'Legal verification',
                'Loan assistance'
            ],
            buttonText: 'Choose Premium',
            buttonColor: 'blue',
            isPopular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For large portfolios',
            features: [
                'Everything in Premium',
                'Dedicated relationship manager',
                'Priority support',
                'Custom solutions'
            ],
            buttonText: 'Contact Sales',
            buttonColor: 'purple',
            isPopular: false
        }
    ]);

    // FAQ Data
    const [faqData, setFaqData] = useState([
        {
            question: 'What makes ResaleExpert different from other platforms?',
            answer: 'We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.'
        },
        {
            question: 'How do you verify properties?',
            answer: 'Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.'
        }
    ]);

    // Call to Action Data
    const [ctaData, setCtaData] = useState({
        title: 'Ready to Get Started?',
        description: 'Let our experts help you with your real estate needs. Get a free consultation today!',
        primaryButtonText: 'Get Free Consultation',
        secondaryButtonText: 'Call Now: +91 99999 99999',
        features: [
            { icon: 'Phone', text: '24/7 Support' },
            { icon: 'Shield', text: '100% Verified' },
            { icon: 'Award', text: 'Award Winning' }
        ]
    });

    const [activeSection, setActiveSection] = useState('hero');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const fileInputRef = useRef(null);
    const importInputRef = useRef(null);

    const sections = [
        { id: 'hero', name: 'Hero Section', icon: Globe },
        { id: 'coreservices', name: 'Core Services', icon: Shield },
        { id: 'additionalservices', name: 'Additional Services', icon: Plus },
        { id: 'whychoose', name: 'Why Choose Us', icon: Award },
        { id: 'process', name: 'Service Process', icon: Target },
        { id: 'testimonials', name: 'Testimonials', icon: Users },
        { id: 'pricing', name: 'Pricing Plans', icon: DollarSign },
        { id: 'faq', name: 'FAQ Section', icon: HelpCircle },
        { id: 'cta', name: 'Call to Action', icon: Phone }
    ];

    const iconMap = {
        Home, Building, CreditCard, FileText, Shield, Users, TrendingUp, Award,
        Star, Phone, CheckCircle, Calculator, Search, HandHeart, Briefcase,
        Clock, DollarSign, Crown, Gem, Zap, Bot, Rocket, Target, Eye
    };

    const colorOptions = ['blue', 'green', 'purple', 'orange', 'indigo', 'pink', 'red', 'yellow'];

    const handleImageUpload = (callback) => {
        fileInputRef.current.click();
        fileInputRef.current.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    callback(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
    };

    const handleSave = () => {
        const allData = {
            hero: heroData,
            coreServices: coreServices,
            additionalServices: additionalServices,
            whyChooseUs: whyChooseUs,
            serviceProcess: serviceProcess,
            testimonials: testimonials,
            pricingPlans: pricingPlans,
            faq: faqData,
            cta: ctaData
        };

        console.log('Saving services data:', allData);

        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successAlert.textContent = 'Services page data saved successfully!';
        document.body.appendChild(successAlert);
        setTimeout(() => document.body.removeChild(successAlert), 3000);
    };

    const handleExportData = () => {
        const allData = {
            hero: heroData,
            coreServices: coreServices,
            additionalServices: additionalServices,
            whyChooseUs: whyChooseUs,
            serviceProcess: serviceProcess,
            testimonials: testimonials,
            pricingPlans: pricingPlans,
            faq: faqData,
            cta: ctaData
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'services-data.json';
        link.click();
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(typeof e.target.result === 'string' ? e.target.result : '');

                    if (importedData.hero) setHeroData(importedData.hero);
                    if (importedData.coreServices) setCoreServices(importedData.coreServices);
                    if (importedData.additionalServices) setAdditionalServices(importedData.additionalServices);
                    if (importedData.whyChooseUs) setWhyChooseUs(importedData.whyChooseUs);
                    if (importedData.serviceProcess) setServiceProcess(importedData.serviceProcess);
                    if (importedData.testimonials) setTestimonials(importedData.testimonials);
                    if (importedData.pricingPlans) setPricingPlans(importedData.pricingPlans);
                    if (importedData.faq) setFaqData(importedData.faq);
                    if (importedData.cta) setCtaData(importedData.cta);

                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    const renderHeroSection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                <input
                    type="text"
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={heroData.description}
                    onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                    <input
                        type="text"
                        value={heroData.primaryButtonText}
                        onChange={(e) => setHeroData({ ...heroData, primaryButtonText: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                    <input
                        type="text"
                        value={heroData.secondaryButtonText}
                        onChange={(e) => setHeroData({ ...heroData, secondaryButtonText: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderCoreServicesSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Core Services Management</h3>
                <button
                    onClick={() => setCoreServices([...coreServices, {
                        id: `service-${Date.now()}`,
                        title: 'New Service',
                        subtitle: 'Service Subtitle',
                        description: 'Service description',
                        icon: 'Shield',
                        color: 'blue',
                        features: ['Feature 1', 'Feature 2'],
                        process: ['Step 1', 'Step 2'],
                        price: 'Contact for pricing',
                        duration: 'Variable',
                        successRate: '90%'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Service</span>
                </button>
            </div>

            <div className="space-y-8">
                {coreServices.map((service, index) => (
                    <div key={service.id} className="p-6 bg-gray-50 rounded-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium">{service.title}</h4>
                            <button
                                onClick={() => setCoreServices(coreServices.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-2 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Service Title</label>
                                <input
                                    type="text"
                                    value={service.title}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].title = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={service.subtitle}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].subtitle = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={service.description}
                                onChange={(e) => {
                                    const updated = [...coreServices];
                                    updated[index].description = e.target.value;
                                    setCoreServices(updated);
                                }}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                                <select
                                    value={service.icon}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].icon = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.keys(iconMap).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Color</label>
                                <select
                                    value={service.color}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].color = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    {colorOptions.map(color => (
                                        <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Service ID</label>
                                <input
                                    type="text"
                                    value={service.id}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].id = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Features</label>
                                <div className="space-y-2">
                                    {service.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => {
                                                    const updated = [...coreServices];
                                                    updated[index].features[featureIndex] = e.target.value;
                                                    setCoreServices(updated);
                                                }}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = [...coreServices];
                                                    updated[index].features.splice(featureIndex, 1);
                                                    setCoreServices(updated);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const updated = [...coreServices];
                                            updated[index].features.push('New Feature');
                                            setCoreServices(updated);
                                        }}
                                        className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                        <Plus size={14} />
                                        <span>Add Feature</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Process Steps</label>
                                <div className="space-y-2">
                                    {service.process.map((step, stepIndex) => (
                                        <div key={stepIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={step}
                                                onChange={(e) => {
                                                    const updated = [...coreServices];
                                                    updated[index].process[stepIndex] = e.target.value;
                                                    setCoreServices(updated);
                                                }}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = [...coreServices];
                                                    updated[index].process.splice(stepIndex, 1);
                                                    setCoreServices(updated);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const updated = [...coreServices];
                                            updated[index].process.push('New Step');
                                            setCoreServices(updated);
                                        }}
                                        className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                        <Plus size={14} />
                                        <span>Add Step</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Price</label>
                                <input
                                    type="text"
                                    value={service.price}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].price = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Duration</label>
                                <input
                                    type="text"
                                    value={service.duration}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].duration = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Success Rate</label>
                                <input
                                    type="text"
                                    value={service.successRate}
                                    onChange={(e) => {
                                        const updated = [...coreServices];
                                        updated[index].successRate = e.target.value;
                                        setCoreServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTestimonialsSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Testimonials Management</h3>
                <button
                    onClick={() => setTestimonials([...testimonials, {
                        name: 'New Client',
                        service: 'Service Name',
                        text: 'Testimonial text goes here...',
                        rating: 5,
                        location: 'City',
                        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Testimonial</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{testimonial.name}</h4>
                            <button
                                onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    value={testimonial.name}
                                    onChange={(e) => {
                                        const updated = [...testimonials];
                                        updated[index].name = e.target.value;
                                        setTestimonials(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Service Used</label>
                                <input
                                    type="text"
                                    value={testimonial.service}
                                    onChange={(e) => {
                                        const updated = [...testimonials];
                                        updated[index].service = e.target.value;
                                        setTestimonials(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Testimonial Text</label>
                            <textarea
                                value={testimonial.text}
                                onChange={(e) => {
                                    const updated = [...testimonials];
                                    updated[index].text = e.target.value;
                                    setTestimonials(updated);
                                }}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Rating (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={testimonial.rating}
                                    onChange={(e) => {
                                        const updated = [...testimonials];
                                        updated[index].rating = parseInt(e.target.value);
                                        setTestimonials(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={testimonial.location}
                                    onChange={(e) => {
                                        const updated = [...testimonials];
                                        updated[index].location = e.target.value;
                                        setTestimonials(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Profile Image</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={testimonial.image}
                                        onChange={(e) => {
                                            const updated = [...testimonials];
                                            updated[index].image = e.target.value;
                                            setTestimonials(updated);
                                        }}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        onClick={() => handleImageUpload((imageUrl) => {
                                            const updated = [...testimonials];
                                            updated[index].image = imageUrl;
                                            setTestimonials(updated);
                                        })}
                                        className="p-2 bg-blue-600 text-white rounded-lg"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPricingSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pricing Plans Management</h3>
                <button
                    onClick={() => setPricingPlans([...pricingPlans, {
                        name: 'New Plan',
                        price: '₹0',
                        description: 'Plan description',
                        features: ['Feature 1', 'Feature 2'],
                        buttonText: 'Get Started',
                        buttonColor: 'blue',
                        isPopular: false
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Plan</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingPlans.map((plan, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{plan.name}</h4>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-1">
                                    <input
                                        type="checkbox"
                                        checked={plan.isPopular}
                                        onChange={(e) => {
                                            const updated = [...pricingPlans];
                                            updated[index].isPopular = e.target.checked;
                                            setPricingPlans(updated);
                                        }}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-gray-600">Popular</span>
                                </label>
                                <button
                                    onClick={() => setPricingPlans(pricingPlans.filter((_, i) => i !== index))}
                                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Plan Name</label>
                                <input
                                    type="text"
                                    value={plan.name}
                                    onChange={(e) => {
                                        const updated = [...pricingPlans];
                                        updated[index].name = e.target.value;
                                        setPricingPlans(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Price</label>
                                    <input
                                        type="text"
                                        value={plan.price}
                                        onChange={(e) => {
                                            const updated = [...pricingPlans];
                                            updated[index].price = e.target.value;
                                            setPricingPlans(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Button Color</label>
                                    <select
                                        value={plan.buttonColor}
                                        onChange={(e) => {
                                            const updated = [...pricingPlans];
                                            updated[index].buttonColor = e.target.value;
                                            setPricingPlans(updated);
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    >
                                        {colorOptions.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={plan.description}
                                    onChange={(e) => {
                                        const updated = [...pricingPlans];
                                        updated[index].description = e.target.value;
                                        setPricingPlans(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Button Text</label>
                                <input
                                    type="text"
                                    value={plan.buttonText}
                                    onChange={(e) => {
                                        const updated = [...pricingPlans];
                                        updated[index].buttonText = e.target.value;
                                        setPricingPlans(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Features</label>
                                <div className="space-y-2">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => {
                                                    const updated = [...pricingPlans];
                                                    updated[index].features[featureIndex] = e.target.value;
                                                    setPricingPlans(updated);
                                                }}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    const updated = [...pricingPlans];
                                                    updated[index].features.splice(featureIndex, 1);
                                                    setPricingPlans(updated);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const updated = [...pricingPlans];
                                            updated[index].features.push('New Feature');
                                            setPricingPlans(updated);
                                        }}
                                        className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                        <Plus size={14} />
                                        <span>Add Feature</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAdditionalServicesSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Additional Services Management</h3>
                <button
                    onClick={() => setAdditionalServices([...additionalServices, {
                        title: 'New Service',
                        description: 'Service description',
                        icon: 'Shield',
                        price: '₹0'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Service</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {additionalServices.map((service, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{service.title}</h4>
                            <button
                                onClick={() => setAdditionalServices(additionalServices.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Service Title</label>
                            <input
                                type="text"
                                value={service.title}
                                onChange={(e) => {
                                    const updated = [...additionalServices];
                                    updated[index].title = e.target.value;
                                    setAdditionalServices(updated);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={service.description}
                                onChange={(e) => {
                                    const updated = [...additionalServices];
                                    updated[index].description = e.target.value;
                                    setAdditionalServices(updated);
                                }}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                                <select
                                    value={service.icon}
                                    onChange={(e) => {
                                        const updated = [...additionalServices];
                                        updated[index].icon = e.target.value;
                                        setAdditionalServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.keys(iconMap).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Price</label>
                                <input
                                    type="text"
                                    value={service.price}
                                    onChange={(e) => {
                                        const updated = [...additionalServices];
                                        updated[index].price = e.target.value;
                                        setAdditionalServices(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderWhyChooseSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Why Choose Us Management</h3>
                <button
                    onClick={() => setWhyChooseUs([...whyChooseUs, {
                        title: 'New Reason',
                        description: 'Description of why to choose us',
                        icon: 'Award',
                        stat: '100%'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Reason</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {whyChooseUs.map((reason, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{reason.title}</h4>
                            <button
                                onClick={() => setWhyChooseUs(whyChooseUs.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Title</label>
                            <input
                                type="text"
                                value={reason.title}
                                onChange={(e) => {
                                    const updated = [...whyChooseUs];
                                    updated[index].title = e.target.value;
                                    setWhyChooseUs(updated);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={reason.description}
                                onChange={(e) => {
                                    const updated = [...whyChooseUs];
                                    updated[index].description = e.target.value;
                                    setWhyChooseUs(updated);
                                }}
                                rows={2}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                                <select
                                    value={reason.icon}
                                    onChange={(e) => {
                                        const updated = [...whyChooseUs];
                                        updated[index].icon = e.target.value;
                                        setWhyChooseUs(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.keys(iconMap).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Statistic</label>
                                <input
                                    type="text"
                                    value={reason.stat}
                                    onChange={(e) => {
                                        const updated = [...whyChooseUs];
                                        updated[index].stat = e.target.value;
                                        setWhyChooseUs(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="15+, 100%, etc."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderProcessSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Service Process Management</h3>
                <button
                    onClick={() => setServiceProcess([...serviceProcess, {
                        step: (serviceProcess.length + 1).toString(),
                        title: 'New Step',
                        description: 'Step description'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Step</span>
                </button>
            </div>

            <div className="space-y-4">
                {serviceProcess.map((step, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Step {step.step}: {step.title}</h4>
                            <button
                                onClick={() => {
                                    const updated = serviceProcess.filter((_, i) => i !== index);
                                    // Re-number steps
                                    const renumbered = updated.map((s, i) => ({ ...s, step: (i + 1).toString() }));
                                    setServiceProcess(renumbered);
                                }}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Step Number</label>
                                <input
                                    type="text"
                                    value={step.step}
                                    onChange={(e) => {
                                        const updated = [...serviceProcess];
                                        updated[index].step = e.target.value;
                                        setServiceProcess(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-600 mb-1">Step Title</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => {
                                        const updated = [...serviceProcess];
                                        updated[index].title = e.target.value;
                                        setServiceProcess(updated);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={step.description}
                                onChange={(e) => {
                                    const updated = [...serviceProcess];
                                    updated[index].description = e.target.value;
                                    setServiceProcess(updated);
                                }}
                                rows={2}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFaqSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">FAQ Management</h3>
                <button
                    onClick={() => setFaqData([...faqData, {
                        question: 'New Question?',
                        answer: 'Answer to the new question.'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add FAQ</span>
                </button>
            </div>

            <div className="space-y-4">
                {faqData.map((faq, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">FAQ {index + 1}</h4>
                            <button
                                onClick={() => setFaqData(faqData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Question</label>
                            <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => {
                                    const updated = [...faqData];
                                    updated[index].question = e.target.value;
                                    setFaqData(updated);
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Answer</label>
                            <textarea
                                value={faq.answer}
                                onChange={(e) => {
                                    const updated = [...faqData];
                                    updated[index].answer = e.target.value;
                                    setFaqData(updated);
                                }}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCtaSection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                    type="text"
                    value={ctaData.title}
                    onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={ctaData.description}
                    onChange={(e) => setCtaData({ ...ctaData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                    <input
                        type="text"
                        value={ctaData.primaryButtonText}
                        onChange={(e) => setCtaData({ ...ctaData, primaryButtonText: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                    <input
                        type="text"
                        value={ctaData.secondaryButtonText}
                        onChange={(e) => setCtaData({ ...ctaData, secondaryButtonText: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Features List</label>
                <div className="space-y-3">
                    {ctaData.features.map((feature, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                                <select
                                    value={feature.icon}
                                    onChange={(e) => {
                                        const updated = [...ctaData.features];
                                        updated[index].icon = e.target.value;
                                        setCtaData({ ...ctaData, features: updated });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.keys(iconMap).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2 flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={feature.text}
                                    onChange={(e) => {
                                        const updated = [...ctaData.features];
                                        updated[index].text = e.target.value;
                                        setCtaData({ ...ctaData, features: updated });
                                    }}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                                    placeholder="Feature text"
                                />
                                <button
                                    onClick={() => {
                                        const updated = ctaData.features.filter((_, i) => i !== index);
                                        setCtaData({ ...ctaData, features: updated });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setCtaData({
                            ...ctaData,
                            features: [...ctaData.features, { icon: 'Shield', text: 'New Feature' }]
                        })}
                        className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                        <Plus size={16} />
                        <span>Add Feature</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'hero':
                return renderHeroSection();
            case 'coreservices':
                return renderCoreServicesSection();
            case 'additionalservices':
                return renderAdditionalServicesSection();
            case 'whychoose':
                return renderWhyChooseSection();
            case 'process':
                return renderProcessSection();
            case 'testimonials':
                return renderTestimonialsSection();
            case 'pricing':
                return renderPricingSection();
            case 'faq':
                return renderFaqSection();
            case 'cta':
                return renderCtaSection();
            default:
                return <div className="text-center text-gray-500 py-8">Select a section to edit</div>;
        }
    };

    if (isPreviewMode) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <h1 className="text-xl font-semibold text-gray-900">Services Page Preview</h1>
                            <button
                                onClick={() => setIsPreviewMode(false)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Edit3 size={16} />
                                <span>Edit Mode</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview content */}
                <div className="space-y-8">
                    {/* Hero Preview */}
                    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
                        <div className="max-w-4xl mx-auto px-6 text-center">
                            <h2 className="text-4xl font-bold mb-6">{heroData.title}</h2>
                            <p className="text-xl text-blue-100 mb-8">{heroData.description}</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold">
                                    {heroData.primaryButtonText}
                                </button>
                                <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold">
                                    {heroData.secondaryButtonText}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Core Services Preview */}
                    <section className="py-12 bg-gray-50">
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Services</h2>
                                <p className="text-xl text-gray-600">Comprehensive real estate solutions</p>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {coreServices.slice(0, 4).map((service, index) => {
                                    const IconComponent = iconMap[service.icon] || Shield;
                                    return (
                                        <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                                            <div className="flex items-start space-x-4 mb-4">
                                                <div className={`p-4 bg-${service.color}-500 rounded-2xl`}>
                                                    <IconComponent className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                                                    <p className={`text-${service.color}-600 font-semibold`}>{service.subtitle}</p>
                                                    <p className="text-gray-700 mt-2">{service.description}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mt-6">
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-lg font-bold text-blue-600">{service.price}</div>
                                                    <div className="text-xs text-gray-600">Pricing</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-lg font-bold text-blue-600">{service.duration}</div>
                                                    <div className="text-xs text-gray-600">Duration</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-lg font-bold text-blue-600">{service.successRate}</div>
                                                    <div className="text-xs text-gray-600">Success Rate</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Preview */}
                    <section className="py-12 bg-white">
                        <div className="max-w-6xl mx-auto px-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Client Testimonials</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {testimonials.map((testimonial, index) => (
                                    <div key={index} className="bg-gray-50 rounded-2xl p-6">
                                        <div className="flex items-center space-x-1 mb-4">
                                            {Array.from({ length: testimonial.rating }, (_, i) => (
                                                <Star key={i} size={16} className="text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 mb-6">"{testimonial.text}"</p>
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                                <div className="text-sm text-gray-500">{testimonial.service} • {testimonial.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
            />

            <input
                type="file"
                ref={importInputRef}
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
            />

            {/* Header */}
    <div className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3">
      {/* Left: Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <Shield className="text-blue-600 shrink-0" size={24} />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
          Services Page Management
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={() => importInputRef?.current?.click()}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 w-full sm:w-auto whitespace-nowrap"
          aria-label="Import"
        >
          <Upload size={16} />
          <span>Import</span>
        </button>

        <button
          onClick={handleExportData}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full sm:w-auto whitespace-nowrap"
          aria-label="Export"
        >
          <Download size={16} />
          <span>Export</span>
        </button>

        <button
          onClick={() => setIsPreviewMode(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 w-full sm:w-auto whitespace-nowrap"
          aria-label="Preview"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto whitespace-nowrap"
          aria-label="Save Changes"
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</div>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Sections</h2>
                            <nav className="space-y-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                                                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="text-sm font-medium">{section.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {sections.find(s => s.id === activeSection)?.name || 'Content Management'}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <Settings className="text-gray-400" size={20} />
                                </div>
                            </div>

                            <div className="max-h-screen overflow-y-auto">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesPageCMS;