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
    Home,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Building,
    Users,
    Briefcase,
    MessageCircle,
    Star,
    Shield,
    Award,
    Clock,
    CheckCircle,
    Globe,
    Link,
    PanelBottom,
    Image,
    ExternalLink,
    Copy,
    Download
} from 'lucide-react';

const FooterPagesCMS = () => {
    // Company Information Data
    const [companyData, setCompanyData] = useState({
        name: 'ResaleExpert',
        logo: '',
        tagline: 'Your Trusted Real Estate Partner',
        description: 'India\'s most trusted real estate platform connecting millions with verified properties.',
        trustIndicators: [
            { icon: 'Shield', text: '100% Verified Properties' },
            { icon: 'Award', text: 'Award Winning Service' },
            { icon: 'CheckCircle', text: '10,000+ Happy Customers' }
        ]
    });

    // Quick Links Data
    const [quickLinks, setQuickLinks] = useState([
        { id: 'home', label: 'Home', href: '/' },
        { id: 'properties', label: 'Properties', href: '/properties' },
        { id: 'about', label: 'About Us', href: '/about' },
        { id: 'contact', label: 'Contact Us', href: '/contact' },
        { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
        { id: 'terms', label: 'Terms & Conditions', href: '/terms' }
    ]);

    // Services Data
    const [services, setServices] = useState([
        { label: 'Property Selling', href: '/services/selling' },
        { label: 'Property Buying', href: '/services/buying' },
        { label: 'Property Rental', href: '/services/rental' },
        { label: 'Legal Services', href: '/services/legal' },
        { label: 'Loan Assistance', href: '/services/loans' },
        { label: 'Property Management', href: '/services/management' }
    ]);

    // Contact Information Data
    const [contactInfo, setContactInfo] = useState({
        address: {
            line1: 'Office 501, Business Tower',
            line2: 'Andheri West, Mumbai - 400058',
            line3: 'Maharashtra, India'
        },
        phone: {
            number: '+91 99999 99999',
            description: '24/7 Support Available'
        },
        email: {
            address: 'info@resaleexpert.in',
            description: 'Quick Response Guaranteed'
        },
        hours: {
            weekdays: 'Mon - Sat: 9:00 AM - 8:00 PM',
            sunday: 'Sunday: 10:00 AM - 6:00 PM'
        }
    });

    // Popular Locations Data
    const [locations, setLocations] = useState([
        'Andheri West', 'Bandra West', 'Juhu', 'Powai', 'Versova', 'Malad West'
    ]);

    // Social Media Data
    const [socialMedia, setSocialMedia] = useState([
        { platform: 'Facebook', icon: 'Facebook', url: 'https://facebook.com/resaleexpert', color: 'text-blue-600', isActive: true },
        { platform: 'Twitter', icon: 'Twitter', url: 'https://twitter.com/resaleexpert', color: 'text-blue-400', isActive: true },
        { platform: 'Instagram', icon: 'Instagram', url: 'https://instagram.com/resaleexpert', color: 'text-pink-600', isActive: true },
        { platform: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com/company/resaleexpert', color: 'text-blue-700', isActive: true },
        { platform: 'YouTube', icon: 'Youtube', url: 'https://youtube.com/@resaleexpert', color: 'text-red-600', isActive: true }
    ]);

    // Footer Bottom Data
    const [footerBottom, setFooterBottom] = useState({
        copyrightText: 'All rights reserved. | Designed with ❤️ for better real estate experience.',
        followText: 'Follow us:'
    });

    // WhatsApp Configuration
    const [whatsappConfig, setWhatsappConfig] = useState({
        isEnabled: true,
        phoneNumber: '919999999999',
        defaultMessage: 'Hi, I\'m interested in your real estate services',
        buttonText: 'Chat with us'
    });

    const [activeSection, setActiveSection] = useState('company');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const fileInputRef = useRef(null);
    const importInputRef = useRef(null);

    const sections = [
        { id: 'company', name: 'Company Information', icon: Building },
        { id: 'quicklinks', name: 'Quick Links', icon: Link },
        { id: 'services', name: 'Services', icon: Briefcase },
        { id: 'contact', name: 'Contact Information', icon: Phone },
        { id: 'locations', name: 'Popular Locations', icon: MapPin },
        { id: 'social', name: 'Social Media', icon: Users },
        { id: 'bottom', name: 'Footer Bottom', icon: Globe },
        { id: 'whatsapp', name: 'WhatsApp Chat', icon: MessageCircle }
    ];

    const iconMap = {
        Home, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube,
        Building, Users, Briefcase, MessageCircle, Star, Shield, Award, Clock, CheckCircle
    };

    const colorOptions = [
        'text-blue-600', 'text-blue-400', 'text-pink-600', 'text-blue-700', 'text-red-600',
        'text-green-600', 'text-purple-600', 'text-yellow-600', 'text-indigo-600', 'text-gray-600'
    ];

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
            company: companyData,
            quickLinks: quickLinks,
            services: services,
            contact: contactInfo,
            locations: locations,
            social: socialMedia,
            footerBottom: footerBottom,
            whatsapp: whatsappConfig
        };

        console.log('Saving footer data:', allData);

        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successAlert.textContent = 'Footer data saved successfully!';
        document.body.appendChild(successAlert);
        setTimeout(() => document.body.removeChild(successAlert), 3000);
    };

    const handleExportData = () => {
        const allData = {
            company: companyData,
            quickLinks: quickLinks,
            services: services,
            contact: contactInfo,
            locations: locations,
            social: socialMedia,
            footerBottom: footerBottom,
            whatsapp: whatsappConfig
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'footer-data.json';
        link.click();
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(typeof e.target.result === 'string' ? e.target.result : '');

                    if (importedData.company) setCompanyData(importedData.company);
                    if (importedData.quickLinks) setQuickLinks(importedData.quickLinks);
                    if (importedData.services) setServices(importedData.services);
                    if (importedData.contact) setContactInfo(importedData.contact);
                    if (importedData.locations) setLocations(importedData.locations);
                    if (importedData.social) setSocialMedia(importedData.social);
                    if (importedData.footerBottom) setFooterBottom(importedData.footerBottom);
                    if (importedData.whatsapp) setWhatsappConfig(importedData.whatsapp);

                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    const renderCompanySection = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                        type="text"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                    <input
                        type="text"
                        value={companyData.tagline}
                        onChange={(e) => setCompanyData({ ...companyData, tagline: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={companyData.logo}
                        onChange={(e) => setCompanyData({ ...companyData, logo: e.target.value })}
                        className="flex-1 p-3 border border-gray-300 rounded-lg"
                        placeholder="Logo URL or upload image"
                    />
                    <button
                        onClick={() => handleImageUpload((imageUrl) => setCompanyData({ ...companyData, logo: imageUrl }))}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Camera size={20} />
                    </button>
                </div>
                {companyData.logo && (
                    <div className="mt-2">
                        <img src={companyData.logo} alt="Company Logo" className="h-12 object-contain" />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={companyData.description}
                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Trust Indicators</label>
                <div className="space-y-4">
                    {companyData.trustIndicators.map((indicator, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon</label>
                                <select
                                    value={indicator.icon}
                                    onChange={(e) => {
                                        const newIndicators = [...companyData.trustIndicators];
                                        newIndicators[index].icon = e.target.value;
                                        setCompanyData({ ...companyData, trustIndicators: newIndicators });
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
                                    value={indicator.text}
                                    onChange={(e) => {
                                        const newIndicators = [...companyData.trustIndicators];
                                        newIndicators[index].text = e.target.value;
                                        setCompanyData({ ...companyData, trustIndicators: newIndicators });
                                    }}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                                    placeholder="Trust indicator text"
                                />
                                <button
                                    onClick={() => {
                                        const newIndicators = companyData.trustIndicators.filter((_, i) => i !== index);
                                        setCompanyData({ ...companyData, trustIndicators: newIndicators });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setCompanyData({
                            ...companyData,
                            trustIndicators: [...companyData.trustIndicators, { icon: 'Star', text: 'New Feature' }]
                        })}
                        className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                        <Plus size={16} />
                        <span>Add Trust Indicator</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderQuickLinksSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quick Links Management</h3>
                <button
                    onClick={() => setQuickLinks([...quickLinks, { id: 'new', label: 'New Link', href: '#' }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Link</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Link {index + 1}</span>
                            <button
                                onClick={() => setQuickLinks(quickLinks.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Label</label>
                            <input
                                type="text"
                                value={link.label}
                                onChange={(e) => {
                                    const newLinks = [...quickLinks];
                                    newLinks[index].label = e.target.value;
                                    setQuickLinks(newLinks);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">URL/Path</label>
                            <input
                                type="text"
                                value={link.href}
                                onChange={(e) => {
                                    const newLinks = [...quickLinks];
                                    newLinks[index].href = e.target.value;
                                    setQuickLinks(newLinks);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">ID (for routing)</label>
                            <input
                                type="text"
                                value={link.id}
                                onChange={(e) => {
                                    const newLinks = [...quickLinks];
                                    newLinks[index].id = e.target.value;
                                    setQuickLinks(newLinks);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderServicesSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Services Management</h3>
                <button
                    onClick={() => setServices([...services, { label: 'New Service', href: '#' }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Service</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Service {index + 1}</span>
                            <button
                                onClick={() => setServices(services.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Service Name</label>
                            <input
                                type="text"
                                value={service.label}
                                onChange={(e) => {
                                    const newServices = [...services];
                                    newServices[index].label = e.target.value;
                                    setServices(newServices);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Service URL</label>
                            <input
                                type="text"
                                value={service.href}
                                onChange={(e) => {
                                    const newServices = [...services];
                                    newServices[index].href = e.target.value;
                                    setServices(newServices);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContactSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Address Line 1</label>
                        <input
                            type="text"
                            value={contactInfo.address.line1}
                            onChange={(e) => setContactInfo({
                                ...contactInfo,
                                address: { ...contactInfo.address, line1: e.target.value }
                            })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Address Line 2</label>
                        <input
                            type="text"
                            value={contactInfo.address.line2}
                            onChange={(e) => setContactInfo({
                                ...contactInfo,
                                address: { ...contactInfo.address, line2: e.target.value }
                            })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Address Line 3</label>
                        <input
                            type="text"
                            value={contactInfo.address.line3}
                            onChange={(e) => setContactInfo({
                                ...contactInfo,
                                address: { ...contactInfo.address, line3: e.target.value }
                            })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium mb-3">Phone Information</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={contactInfo.phone.number}
                                onChange={(e) => setContactInfo({
                                    ...contactInfo,
                                    phone: { ...contactInfo.phone, number: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone Description</label>
                            <input
                                type="text"
                                value={contactInfo.phone.description}
                                onChange={(e) => setContactInfo({
                                    ...contactInfo,
                                    phone: { ...contactInfo.phone, description: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-3">Email Information</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={contactInfo.email.address}
                                onChange={(e) => setContactInfo({
                                    ...contactInfo,
                                    email: { ...contactInfo.email, address: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email Description</label>
                            <input
                                type="text"
                                value={contactInfo.email.description}
                                onChange={(e) => setContactInfo({
                                    ...contactInfo,
                                    email: { ...contactInfo.email, description: e.target.value }
                                })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-3">Business Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Weekdays Schedule</label>
                        <input
                            type="text"
                            value={contactInfo.hours.weekdays}
                            onChange={(e) => setContactInfo({
                                ...contactInfo,
                                hours: { ...contactInfo.hours, weekdays: e.target.value }
                            })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Sunday Schedule</label>
                        <input
                            type="text"
                            value={contactInfo.hours.sunday}
                            onChange={(e) => setContactInfo({
                                ...contactInfo,
                                hours: { ...contactInfo.hours, sunday: e.target.value }
                            })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLocationsSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Popular Locations Management</h3>
                <button
                    onClick={() => setLocations([...locations, 'New Location'])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Location</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {locations.map((location, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => {
                                    const newLocations = [...locations];
                                    newLocations[index] = e.target.value;
                                    setLocations(newLocations);
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={() => setLocations(locations.filter((_, i) => i !== index))}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
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
                        icon: 'Users',
                        url: 'https://',
                        color: 'text-blue-600',
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Color Class</label>
                            <select
                                value={social.color}
                                onChange={(e) => {
                                    const newSocial = [...socialMedia];
                                    newSocial[index].color = e.target.value;
                                    setSocialMedia(newSocial);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {colorOptions.map(color => (
                                    <option key={color} value={color}>{color.replace('text-', '').replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBottomSection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text</label>
                <textarea
                    value={footerBottom.copyrightText}
                    onChange={(e) => setFooterBottom({ ...footerBottom, copyrightText: e.target.value })}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="All rights reserved. | Designed with ❤️ for better real estate experience."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Social Follow Text</label>
                <input
                    type="text"
                    value={footerBottom.followText}
                    onChange={(e) => setFooterBottom({ ...footerBottom, followText: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Follow us:"
                />
            </div>
        </div>
    );

    const renderWhatsAppSection = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
                <input
                    type="checkbox"
                    checked={whatsappConfig.isEnabled}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, isEnabled: e.target.checked })}
                    className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">Enable WhatsApp Chat Button</label>
            </div>

            {whatsappConfig.isEnabled && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="text"
                                value={whatsappConfig.phoneNumber}
                                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="919999999999"
                            />
                            <p className="text-xs text-gray-500 mt-1">Include country code without + sign</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                            <input
                                type="text"
                                value={whatsappConfig.buttonText}
                                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, buttonText: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="Chat with us"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Message</label>
                        <textarea
                            value={whatsappConfig.defaultMessage}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, defaultMessage: e.target.value })}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Hi, I'm interested in your real estate services"
                        />
                    </div>
                </>
            )}
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'company':
                return renderCompanySection();
            case 'quicklinks':
                return renderQuickLinksSection();
            case 'services':
                return renderServicesSection();
            case 'contact':
                return renderContactSection();
            case 'locations':
                return renderLocationsSection();
            case 'social':
                return renderSocialSection();
            case 'bottom':
                return renderBottomSection();
            case 'whatsapp':
                return renderWhatsAppSection();
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
                            <h1 className="text-xl font-semibold text-gray-900">Footer Preview</h1>
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

                {/* Footer Preview */}
                <div className="bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div>
                                <div className="flex items-center space-x-3 mb-6">
                                    {companyData.logo && (
                                        <img src={companyData.logo} alt={companyData.name} className="h-10 object-contain" />
                                    )}
                                    <span className="text-xl font-bold">{companyData.name}</span>
                                </div>
                                <p className="text-gray-300 mb-6">{companyData.tagline}</p>
                                <div className="space-y-2">
                                    {companyData.trustIndicators.map((indicator, index) => {
                                        const IconComponent = iconMap[indicator.icon] || Star;
                                        return (
                                            <div key={index} className="flex items-center space-x-2">
                                                <IconComponent className="text-green-400" size={16} />
                                                <span className="text-sm text-gray-300">{indicator.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
                                <ul className="space-y-2">
                                    {quickLinks.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.href} className="text-gray-300 hover:text-white text-sm">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Services */}
                            <div>
                                <h4 className="text-lg font-semibold mb-6">Our Services</h4>
                                <ul className="space-y-2">
                                    {services.slice(0, 6).map((service, index) => (
                                        <li key={index}>
                                            <a href={service.href} className="text-gray-300 hover:text-white text-sm">
                                                {service.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="text-blue-400 mt-1" size={16} />
                                        <div className="text-gray-300">
                                            <p>{contactInfo.address.line1}</p>
                                            <p>{contactInfo.address.line2}</p>
                                            <p>{contactInfo.address.line3}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Phone className="text-green-400" size={16} />
                                        <div className="text-gray-300">
                                            <p>{contactInfo.phone.number}</p>
                                            <p className="text-xs text-gray-400">{contactInfo.phone.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="text-purple-400" size={16} />
                                        <div className="text-gray-300">
                                            <p>{contactInfo.email.address}</p>
                                            <p className="text-xs text-gray-400">{contactInfo.email.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Popular Locations */}
                        <div className="mt-8 pt-8 border-t border-gray-800">
                            <h4 className="text-lg font-semibold mb-4">Popular Locations</h4>
                            <div className="flex flex-wrap gap-2">
                                {locations.map((location, index) => (
                                    <button key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700">
                                        {location}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
                            <div className="text-gray-400 text-sm mb-4 md:mb-0">
                                © {new Date().getFullYear()} {companyData.name}. {footerBottom.copyrightText}
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-400 text-sm">{footerBottom.followText}</span>
                                {socialMedia.filter(s => s.isActive).map((social, index) => {
                                    const IconComponent = iconMap[social.icon] || Users;
                                    return (
                                        <a key={index} href={social.url} className={`p-2 bg-gray-800 rounded-lg hover:bg-gray-700 ${social.color}`}>
                                            <IconComponent size={16} />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
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
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <PanelBottom className="text-blue-600" size={24} />
                            <h1 className="text-xl font-semibold text-gray-900">Footer Management</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => importInputRef.current.click()}
                                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                            >
                                <Upload size={16} />
                                <span>Import</span>
                            </button>
                            <button
                                onClick={handleExportData}
                                className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                <Download size={16} />
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
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Footer Sections</h2>
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

export default FooterPagesCMS;