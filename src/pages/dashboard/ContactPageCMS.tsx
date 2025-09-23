import React, { useState, useRef } from 'react';
import {
    Save,
    Plus,
    Trash2,
    Edit3,
    Upload,
    Phone,
    Mail,
    MapPin,
    Clock,
    MessageCircle,
    Eye,
    Settings,
    Camera,
    FileText,
    Building,
    Globe,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    HelpCircle,
    Shield,
    Star,
    Users,
    TrendingUp,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const ContactPageCMS = () => {
    // Hero Section Data
    const [heroData, setHeroData] = useState({
        title: 'Get in Touch',
        description: 'Ready to find your dream property or sell your current one? Our expert team is here to help you every step of the way.',
        stats: [
            { label: 'Response Time', value: '2-4 Hours' },
            { label: 'Support Available', value: '24/7' },
            { label: 'Satisfaction Rate', value: '98%' }
        ]
    });

    // Contact Information Data
    const [contactInfo, setContactInfo] = useState([
        {
            icon: 'Phone',
            title: 'Call Us',
            details: ['+91 99999 99999', '+91 88888 88888'],
            description: '24/7 Customer Support',
            color: 'green'
        },
        {
            icon: 'Mail',
            title: 'Email Us',
            details: ['info@resaleexpert.in', 'support@resaleexpert.in'],
            description: 'Quick Response Guaranteed',
            color: 'blue'
        },
        {
            icon: 'MapPin',
            title: 'Visit Us',
            details: ['Office 501, Business Tower', 'Andheri West, Mumbai - 400058'],
            description: 'Maharashtra, India',
            color: 'purple'
        },
        {
            icon: 'Clock',
            title: 'Office Hours',
            details: ['Mon - Sat: 9:00 AM - 8:00 PM', 'Sunday: 10:00 AM - 6:00 PM'],
            description: 'Extended Hours Available',
            color: 'orange'
        }
    ]);

    // Office Locations Data
    const [officeLocations, setOfficeLocations] = useState([
        {
            city: 'Mumbai',
            address: 'Office 501, Business Tower, Andheri West, Mumbai - 400058',
            phone: '+91 99999 99999',
            email: 'mumbai@resaleexpert.in'
        },
        {
            city: 'Pune',
            address: 'Floor 3, Tech Park, Hinjewadi, Pune - 411057',
            phone: '+91 99999 99998',
            email: 'pune@resaleexpert.in'
        },
        {
            city: 'Delhi',
            address: 'Tower A, Business Complex, Connaught Place, Delhi - 110001',
            phone: '+91 99999 99997',
            email: 'delhi@resaleexpert.in'
        }
    ]);

    // FAQ Data
    const [faqData, setFaqData] = useState([
        {
            question: 'How quickly do you respond to inquiries?',
            answer: 'We respond to all inquiries within 2-4 hours during business hours and within 24 hours on weekends.'
        },
        {
            question: 'Do you charge for consultation?',
            answer: 'Our initial consultation is completely free. We only charge when you decide to proceed with our services.'
        },
        {
            question: 'What areas do you cover?',
            answer: 'We currently operate in Mumbai, Pune, Delhi, Bangalore, and Hyderabad, with plans to expand to more cities.'
        },
        {
            question: 'Can I schedule a property visit?',
            answer: 'Yes! You can schedule property visits through our website, mobile app, or by calling our customer service team.'
        }
    ]);

    // Social Media Data
    const [socialMedia, setSocialMedia] = useState([
        { platform: 'Facebook', icon: 'Facebook', url: 'https://facebook.com/resaleexpert', isActive: true },
        { platform: 'Twitter', icon: 'Twitter', url: 'https://twitter.com/resaleexpert', isActive: true },
        { platform: 'Instagram', icon: 'Instagram', url: 'https://instagram.com/resaleexpert', isActive: true },
        { platform: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com/company/resaleexpert', isActive: true }
    ]);

    // Emergency Contact Data
    const [emergencyContact, setEmergencyContact] = useState({
        title: 'Emergency Contact',
        description: 'Need urgent assistance outside business hours?',
        phone: '+91 77777 77777',
        email: 'urgent@resaleexpert.in'
    });

    // Form Settings Data
    const [formSettings, setFormSettings] = useState({
        title: 'Send us a Message',
        description: 'Fill out the form below and we\'ll get back to you within 24 hours with personalized assistance.',
        fields: {
            name: { label: 'Full Name', required: true, placeholder: 'Enter your full name' },
            email: { label: 'Email Address', required: true, placeholder: 'Enter your email address' },
            phone: { label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
            subject: { label: 'Subject', required: true, placeholder: 'What can we help you with?' },
            message: { label: 'Message', required: true, placeholder: 'Tell us more about your requirements...' },
            propertyType: { label: 'Property Type', required: false, placeholder: 'Select property type' },
            budget: { label: 'Budget Range', required: false, placeholder: 'Select budget range' }
        },
        submitButtonText: 'Send Message',
        successMessage: 'Thank you! We will get back to you within 24 hours.',
        errorMessage: 'Please fill all required fields.'
    });

    const [activeSection, setActiveSection] = useState('hero');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const fileInputRef = useRef(null);

    const sections = [
        { id: 'hero', name: 'Hero Section', icon: Globe },
        { id: 'form', name: 'Contact Form Settings', icon: MessageCircle },
        { id: 'contactinfo', name: 'Contact Information', icon: Phone },
        { id: 'offices', name: 'Office Locations', icon: Building },
        { id: 'faq', name: 'FAQ Management', icon: HelpCircle },
        { id: 'social', name: 'Social Media Links', icon: Users },
        { id: 'emergency', name: 'Emergency Contact', icon: AlertCircle }
    ];

    const iconMap = {
        Phone, Mail, MapPin, Clock, MessageCircle, Building, Facebook, Twitter, Instagram, Linkedin, Globe, Users, Settings
    };

    const colorOptions = ['green', 'blue', 'purple', 'orange', 'red', 'indigo', 'pink', 'yellow'];

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
            contactInfo: contactInfo,
            offices: officeLocations,
            faq: faqData,
            social: socialMedia,
            emergency: emergencyContact,
            form: formSettings
        };

        // Simulate API call
        console.log('Saving contact page data:', allData);

        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successAlert.textContent = 'Contact page data saved successfully!';
        document.body.appendChild(successAlert);
        setTimeout(() => document.body.removeChild(successAlert), 3000);
    };

    const handleExportData = () => {
        const allData = {
            hero: heroData,
            contactInfo: contactInfo,
            offices: officeLocations,
            faq: faqData,
            social: socialMedia,
            emergency: emergencyContact,
            form: formSettings
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'contact-page-data.json';
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
                    if (importedData.contactInfo) setContactInfo(importedData.contactInfo);
                    if (importedData.offices) setOfficeLocations(importedData.offices);
                    if (importedData.faq) setFaqData(importedData.faq);
                    if (importedData.social) setSocialMedia(importedData.social);
                    if (importedData.emergency) setEmergencyContact(importedData.emergency);
                    if (importedData.form) setFormSettings(importedData.form);

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
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Hero Statistics</label>
                <div className="space-y-4">
                    {heroData.stats.map((stat, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Label</label>
                                <input
                                    type="text"
                                    value={stat.label}
                                    onChange={(e) => {
                                        const newStats = [...heroData.stats];
                                        newStats[index].label = e.target.value;
                                        setHeroData({ ...heroData, stats: newStats });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Value</label>
                                <input
                                    type="text"
                                    value={stat.value}
                                    onChange={(e) => {
                                        const newStats = [...heroData.stats];
                                        newStats[index].value = e.target.value;
                                        setHeroData({ ...heroData, stats: newStats });
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFormSettings = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                    <input
                        type="text"
                        value={formSettings.title}
                        onChange={(e) => setFormSettings({ ...formSettings, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Submit Button Text</label>
                    <input
                        type="text"
                        value={formSettings.submitButtonText}
                        onChange={(e) => setFormSettings({ ...formSettings, submitButtonText: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Description</label>
                <textarea
                    value={formSettings.description}
                    onChange={(e) => setFormSettings({ ...formSettings, description: e.target.value })}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Success Message</label>
                    <textarea
                        value={formSettings.successMessage}
                        onChange={(e) => setFormSettings({ ...formSettings, successMessage: e.target.value })}
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Error Message</label>
                    <textarea
                        value={formSettings.errorMessage}
                        onChange={(e) => setFormSettings({ ...formSettings, errorMessage: e.target.value })}
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Form Fields Configuration</h3>
                <div className="space-y-4">
                    {Object.entries(formSettings.fields).map(([fieldKey, field]) => (
                        <div key={fieldKey} className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-3 capitalize">{fieldKey.replace(/([A-Z])/g, ' $1')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => {
                                            const newFields = { ...formSettings.fields };
                                            newFields[fieldKey].label = e.target.value;
                                            setFormSettings({ ...formSettings, fields: newFields });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Placeholder</label>
                                    <input
                                        type="text"
                                        value={field.placeholder}
                                        onChange={(e) => {
                                            const newFields = { ...formSettings.fields };
                                            newFields[fieldKey].placeholder = e.target.value;
                                            setFormSettings({ ...formSettings, fields: newFields });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => {
                                                const newFields = { ...formSettings.fields };
                                                newFields[fieldKey].required = e.target.checked;
                                                setFormSettings({ ...formSettings, fields: newFields });
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-600">Required Field</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderContactInfoSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Contact Information Management</h3>
                <button
                    onClick={() => setContactInfo([...contactInfo, {
                        icon: 'Phone',
                        title: 'New Contact',
                        details: ['Detail 1', 'Detail 2'],
                        description: 'Description',
                        color: 'blue'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Contact Info</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Contact Info {index + 1}</span>
                            <button
                                onClick={() => setContactInfo(contactInfo.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={info.title}
                                    onChange={(e) => {
                                        const newInfo = [...contactInfo];
                                        newInfo[index].title = e.target.value;
                                        setContactInfo(newInfo);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                                <select
                                    value={info.icon}
                                    onChange={(e) => {
                                        const newInfo = [...contactInfo];
                                        newInfo[index].icon = e.target.value;
                                        setContactInfo(newInfo);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.keys(iconMap).map(iconName => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <input
                                type="text"
                                value={info.description}
                                onChange={(e) => {
                                    const newInfo = [...contactInfo];
                                    newInfo[index].description = e.target.value;
                                    setContactInfo(newInfo);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Color Theme</label>
                            <select
                                value={info.color}
                                onChange={(e) => {
                                    const newInfo = [...contactInfo];
                                    newInfo[index].color = e.target.value;
                                    setContactInfo(newInfo);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {colorOptions.map(color => (
                                    <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Contact Details</label>
                            <div className="space-y-2">
                                {info.details.map((detail, detailIndex) => (
                                    <div key={detailIndex} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={detail}
                                            onChange={(e) => {
                                                const newInfo = [...contactInfo];
                                                newInfo[index].details[detailIndex] = e.target.value;
                                                setContactInfo(newInfo);
                                            }}
                                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                const newInfo = [...contactInfo];
                                                newInfo[index].details.splice(detailIndex, 1);
                                                setContactInfo(newInfo);
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newInfo = [...contactInfo];
                                        newInfo[index].details.push('New Detail');
                                        setContactInfo(newInfo);
                                    }}
                                    className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                >
                                    <Plus size={16} />
                                    <span>Add Detail</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOfficesSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Office Locations Management</h3>
                <button
                    onClick={() => setOfficeLocations([...officeLocations, {
                        city: 'New City',
                        address: 'New Address',
                        phone: '+91 00000 00000',
                        email: 'newcity@resaleexpert.in'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Office</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officeLocations.map((office, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Office {index + 1}</span>
                            <button
                                onClick={() => setOfficeLocations(officeLocations.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <input
                                type="text"
                                value={office.city}
                                onChange={(e) => {
                                    const newOffices = [...officeLocations];
                                    newOffices[index].city = e.target.value;
                                    setOfficeLocations(newOffices);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Address</label>
                            <textarea
                                value={office.address}
                                onChange={(e) => {
                                    const newOffices = [...officeLocations];
                                    newOffices[index].address = e.target.value;
                                    setOfficeLocations(newOffices);
                                }}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone</label>
                            <input
                                type="text"
                                value={office.phone}
                                onChange={(e) => {
                                    const newOffices = [...officeLocations];
                                    newOffices[index].phone = e.target.value;
                                    setOfficeLocations(newOffices);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input
                                type="email"
                                value={office.email}
                                onChange={(e) => {
                                    const newOffices = [...officeLocations];
                                    newOffices[index].email = e.target.value;
                                    setOfficeLocations(newOffices);
                                }}
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
                    <div key={index} className="p-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">FAQ {index + 1}</span>
                            <button
                                onClick={() => setFaqData(faqData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Question</label>
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => {
                                        const newFaqs = [...faqData];
                                        newFaqs[index].question = e.target.value;
                                        setFaqData(newFaqs);
                                    }}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Answer</label>
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => {
                                        const newFaqs = [...faqData];
                                        newFaqs[index].answer = e.target.value;
                                        setFaqData(newFaqs);
                                    }}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSocialSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Social Media Links Management</h3>
                <button
                    onClick={() => setSocialMedia([...socialMedia, {
                        platform: 'New Platform',
                        icon: 'Globe',
                        url: 'https://',
                        isActive: true
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Social Link</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialMedia.map((social, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{social.platform}</span>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={social.isActive}
                                        onChange={(e) => {
                                            const newSocial = [...socialMedia];
                                            newSocial[index].isActive = e.target.checked;
                                            setSocialMedia(newSocial);
                                        }}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-gray-600">Active</span>
                                </label>
                                <button
                                    onClick={() => setSocialMedia(socialMedia.filter((_, i) => i !== index))}
                                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Platform Name</label>
                            <input
                                type="text"
                                value={social.platform}
                                onChange={(e) => {
                                    const newSocial = [...socialMedia];
                                    newSocial[index].platform = e.target.value;
                                    setSocialMedia(newSocial);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Icon</label>
                            <select
                                value={social.icon}
                                onChange={(e) => {
                                    const newSocial = [...socialMedia];
                                    newSocial[index].icon = e.target.value;
                                    setSocialMedia(newSocial);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Object.keys(iconMap).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">URL</label>
                            <input
                                type="url"
                                value={social.url}
                                onChange={(e) => {
                                    const newSocial = [...socialMedia];
                                    newSocial[index].url = e.target.value;
                                    setSocialMedia(newSocial);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderEmergencySection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                    type="text"
                    value={emergencyContact.title}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={emergencyContact.description}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, description: e.target.value })}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                    <input
                        type="text"
                        value={emergencyContact.phone}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Email</label>
                    <input
                        type="email"
                        value={emergencyContact.email}
                        onChange={(e) => setEmergencyContact({ ...emergencyContact, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'hero':
                return renderHeroSection();
            case 'form':
                return renderFormSettings();
            case 'contactinfo':
                return renderContactInfoSection();
            case 'offices':
                return renderOfficesSection();
            case 'faq':
                return renderFaqSection();
            case 'social':
                return renderSocialSection();
            case 'emergency':
                return renderEmergencySection();
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
                            <h1 className="text-xl font-semibold text-gray-900">Contact Page Preview</h1>
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
                            <h2 className="text-4xl font-bold mb-4">{heroData.title}</h2>
                            <p className="text-xl text-blue-100 mb-8">{heroData.description}</p>
                            <div className="flex justify-center space-x-8">
                                {heroData.stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-blue-200">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact Form Preview */}
                    <section className="py-12">
                        <div className="max-w-4xl mx-auto px-6">
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">{formSettings.title}</h2>
                                <p className="text-gray-600 mb-6">{formSettings.description}</p>
                                <div className="space-y-4">
                                    {Object.entries(formSettings.fields).map(([fieldKey, field]) => (
                                        <div key={fieldKey}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {field.label} {field.required && '*'}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={field.placeholder}
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                disabled
                                            />
                                        </div>
                                    ))}
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold">
                                        {formSettings.submitButtonText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Info Preview */}
                    <section className="py-12 bg-gray-50">
                        <div className="max-w-4xl mx-auto px-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {contactInfo.slice(0, 4).map((info, index) => {
                                    const IconComponent = iconMap[info.icon] || Phone;
                                    return (
                                        <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                                            <div className="flex items-start space-x-4">
                                                <div className={`p-3 rounded-xl ${info.color === 'green' ? 'bg-green-500' :
                                                        info.color === 'blue' ? 'bg-blue-500' :
                                                            info.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                                                    }`}>
                                                    <IconComponent className="text-white" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                                                    {info.details.map((detail, i) => (
                                                        <p key={i} className="text-gray-700">{detail}</p>
                                                    ))}
                                                    <p className="text-gray-500 text-sm mt-2">{info.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
                id="import-file"
            />

            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Phone className="text-blue-600" size={24} />
                            <h1 className="text-xl font-semibold text-gray-900">Contact Page Management</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => document.getElementById('import-file').click()}
                                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                            >
                                <Upload size={16} />
                                <span>Import</span>
                            </button>
                            <button
                                onClick={handleExportData}
                                className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                <FileText size={16} />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => setIsPreviewMode(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                <Eye size={16} />
                                <span>Preview</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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

export default ContactPageCMS;