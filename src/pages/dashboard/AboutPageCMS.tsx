import React, { useState, useRef } from 'react';
import {
    Save,
    Plus,
    Trash2,
    Edit3,
    Upload,
    Image,
    Globe,
    Users,
    Award,
    Target,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Eye,
    Settings,
    Camera,
    FileText,
    TrendingUp,
    Shield,
    Star,
    Heart,
    CheckCircle,
    Crown,
    Gem,
    Zap,
    Rocket,
    Building,
    Home,
    Handshake
} from 'lucide-react';

const AboutPageCMS = () => {
    // Hero Section Data
    const [heroData, setHeroData] = useState({
        title: 'About ResaleExpert',
        description: "India's most trusted real estate platform, connecting millions of buyers, sellers, and renters with verified properties and expert guidance since 2010.",
        stats: [
            { label: 'Years Experience', value: '15+' },
            { label: 'Properties Sold', value: '10K+' },
            { label: 'Happy Customers', value: '25K+' }
        ]
    });

    // Mission Section Data
    const [missionData, setMissionData] = useState({
        title: 'Our Mission',
        description: 'To make real estate transactions transparent, efficient, and accessible for everyone. We leverage technology and expertise to simplify the complex process of buying, selling, and renting properties.',
        features: [
            '100% Verified Properties',
            'Expert Legal Guidance',
            'End-to-End Support',
            'AI-Powered Matching'
        ],
        image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
        satisfactionRate: '98%'
    });

    // Statistics Data
    const [statsData, setStatsData] = useState([
        { label: 'Properties Sold', value: '10,000+', icon: 'Home' },
        { label: 'Happy Customers', value: '25,000+', icon: 'Users' },
        { label: 'Years of Experience', value: '15+', icon: 'Award' },
        { label: 'Cities Covered', value: '50+', icon: 'Building' }
    ]);

    // Values Data
    const [valuesData, setValuesData] = useState([
        {
            icon: 'Shield',
            title: 'Trust & Transparency',
            description: 'We believe in complete transparency in all our dealings. Every property is verified, and all information is accurate and up-to-date.'
        },
        {
            icon: 'Target',
            title: 'Customer First',
            description: 'Our customers are at the heart of everything we do. We go above and beyond to ensure their real estate journey is smooth and successful.'
        },
        {
            icon: 'Star',
            title: 'Excellence',
            description: 'We strive for excellence in every aspect of our service, from property listings to customer support and after-sales service.'
        },
        {
            icon: 'Heart',
            title: 'Integrity',
            description: 'We conduct our business with the highest level of integrity, ensuring fair deals and honest communication with all parties.'
        }
    ]);

    // Team Data
    const [teamData, setTeamData] = useState([
        {
            name: 'Rajesh Patel',
            role: 'Founder & CEO',
            experience: '15+ years',
            specialization: 'Luxury Properties',
            image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
            name: 'Priya Sharma',
            role: 'Head of Sales',
            experience: '12+ years',
            specialization: 'Residential Sales',
            image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
            name: 'Amit Kumar',
            role: 'Legal Advisor',
            experience: '10+ years',
            specialization: 'Property Law',
            image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
            name: 'Neha Gupta',
            role: 'Customer Relations',
            experience: '8+ years',
            specialization: 'Client Support',
            image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300'
        }
    ]);

    // Timeline Data
    const [timelineData, setTimelineData] = useState([
        {
            year: '2010',
            title: 'Company Founded',
            description: 'Started with a vision to revolutionize real estate in Mumbai'
        },
        {
            year: '2015',
            title: 'Digital Transformation',
            description: 'Launched online platform and mobile app for seamless property search'
        },
        {
            year: '2018',
            title: 'Pan-India Expansion',
            description: 'Expanded operations to 25+ cities across India'
        },
        {
            year: '2020',
            title: 'AI Integration',
            description: 'Introduced AI-powered property matching and market analysis'
        },
        {
            year: '2023',
            title: 'Industry Recognition',
            description: 'Awarded "Best Real Estate Platform" by Property Awards India'
        }
    ]);

    // Awards Data
    const [awardsData, setAwardsData] = useState([
        {
            title: 'Best Real Estate Platform 2023',
            organization: 'Property Awards India',
            icon: 'Crown'
        },
        {
            title: 'Customer Choice Award 2022',
            organization: 'Real Estate Excellence Awards',
            icon: 'Award'
        },
        {
            title: 'Innovation in PropTech 2021',
            organization: 'Technology Innovation Awards',
            icon: 'Rocket'
        }
    ]);

    // Why Choose Us Data
    const [whyChooseData, setWhyChooseData] = useState([
        {
            icon: 'Shield',
            title: '100% Verified Properties',
            description: 'Every property on our platform is thoroughly verified for legal compliance, ownership, and authenticity before listing.'
        },
        {
            icon: 'Zap',
            title: 'AI-Powered Matching',
            description: 'Our advanced AI algorithms match buyers with perfect properties based on preferences, budget, and lifestyle requirements.'
        },
        {
            icon: 'Handshake',
            title: 'End-to-End Support',
            description: 'From property search to final registration, we provide complete support throughout your real estate journey.'
        }
    ]);

    // Contact Data
    const [contactData, setContactData] = useState({
        title: 'Ready to Start Your Real Estate Journey?',
        description: 'Join thousands of satisfied customers who have found their dream properties with ResaleExpert',
        phone: '+91 99999 99999',
        email: 'info@resaleexpert.in',
        address: 'Mumbai, India'
    });

    const [activeSection, setActiveSection] = useState('hero');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const fileInputRef = useRef(null);

    const sections = [
        { id: 'hero', name: 'Hero Section', icon: Globe },
        { id: 'mission', name: 'Mission & Vision', icon: Target },
        { id: 'statistics', name: 'Statistics', icon: TrendingUp },
        { id: 'values', name: 'Core Values', icon: Star },
        { id: 'team', name: 'Team Members', icon: Users },
        { id: 'timeline', name: 'Company Journey', icon: Calendar },
        { id: 'whychoose', name: 'Why Choose Us', icon: CheckCircle },
        { id: 'awards', name: 'Awards & Recognition', icon: Award },
        { id: 'contact', name: 'Contact Information', icon: Phone }
    ];

    const iconMap = {
        Home, Users, Award, Building, Shield, Target, Star, Heart, Crown, Rocket, Zap, Handshake
    };

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
            mission: missionData,
            statistics: statsData,
            values: valuesData,
            team: teamData,
            timeline: timelineData,
            whyChoose: whyChooseData,
            awards: awardsData,
            contact: contactData
        };

        // Simulate API call
        localStorage.setItem('aboutPageData', JSON.stringify(allData));
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successAlert.textContent = 'About page data saved successfully!';
        document.body.appendChild(successAlert);
        setTimeout(() => document.body.removeChild(successAlert), 3000);
    };

    const handleExportData = () => {
        const allData = {
            hero: heroData,
            mission: missionData,
            statistics: statsData,
            values: valuesData,
            team: teamData,
            timeline: timelineData,
            whyChoose: whyChooseData,
            awards: awardsData,
            contact: contactData
        };

        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'about-page-data.json';
        link.click();
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(typeof e.target.result === 'string' ? e.target.result : '');

                    // Update all state with imported data
                    if (importedData.hero) setHeroData(importedData.hero);
                    if (importedData.mission) setMissionData(importedData.mission);
                    if (importedData.statistics) setStatsData(importedData.statistics);
                    if (importedData.values) setValuesData(importedData.values);
                    if (importedData.team) setTeamData(importedData.team);
                    if (importedData.timeline) setTimelineData(importedData.timeline);
                    if (importedData.whyChoose) setWhyChooseData(importedData.whyChoose);
                    if (importedData.awards) setAwardsData(importedData.awards);
                    if (importedData.contact) setContactData(importedData.contact);

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

    const renderMissionSection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                    type="text"
                    value={missionData.title}
                    onChange={(e) => setMissionData({ ...missionData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={missionData.description}
                    onChange={(e) => setMissionData({ ...missionData, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features List</label>
                <div className="space-y-2">
                    {missionData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                    const newFeatures = [...missionData.features];
                                    newFeatures[index] = e.target.value;
                                    setMissionData({ ...missionData, features: newFeatures });
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={() => {
                                    const newFeatures = missionData.features.filter((_, i) => i !== index);
                                    setMissionData({ ...missionData, features: newFeatures });
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => setMissionData({ ...missionData, features: [...missionData.features, 'New Feature'] })}
                        className="flex items-center space-x-2 p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                        <Plus size={16} />
                        <span>Add Feature</span>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={missionData.image}
                            onChange={(e) => setMissionData({ ...missionData, image: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                        />
                        <button
                            onClick={() => handleImageUpload((imageUrl) => setMissionData({ ...missionData, image: imageUrl }))}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Upload size={16} />
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Satisfaction Rate</label>
                    <input
                        type="text"
                        value={missionData.satisfactionRate}
                        onChange={(e) => setMissionData({ ...missionData, satisfactionRate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderStatisticsSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Statistics Management</h3>
                <button
                    onClick={() => setStatsData([...statsData, { label: 'New Stat', value: '0+', icon: 'Star' }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Statistic</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statsData.map((stat, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Statistic {index + 1}</span>
                            <button
                                onClick={() => setStatsData(statsData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Label</label>
                            <input
                                type="text"
                                value={stat.label}
                                onChange={(e) => {
                                    const newStats = [...statsData];
                                    newStats[index].label = e.target.value;
                                    setStatsData(newStats);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Value</label>
                            <input
                                type="text"
                                value={stat.value}
                                onChange={(e) => {
                                    const newStats = [...statsData];
                                    newStats[index].value = e.target.value;
                                    setStatsData(newStats);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Icon</label>
                            <select
                                value={stat.icon}
                                onChange={(e) => {
                                    const newStats = [...statsData];
                                    newStats[index].icon = e.target.value;
                                    setStatsData(newStats);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Object.keys(iconMap).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTeamSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Management</h3>
                <button
                    onClick={() => setTeamData([...teamData, {
                        name: 'New Member',
                        role: 'Position',
                        experience: '0+ years',
                        specialization: 'Specialization',
                        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Team Member</span>
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {teamData.map((member, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Team Member {index + 1}</span>
                            <button
                                onClick={() => setTeamData(teamData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={member.name}
                                    onChange={(e) => {
                                        const newTeam = [...teamData];
                                        newTeam[index].name = e.target.value;
                                        setTeamData(newTeam);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={member.role}
                                    onChange={(e) => {
                                        const newTeam = [...teamData];
                                        newTeam[index].role = e.target.value;
                                        setTeamData(newTeam);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Experience</label>
                                <input
                                    type="text"
                                    value={member.experience}
                                    onChange={(e) => {
                                        const newTeam = [...teamData];
                                        newTeam[index].experience = e.target.value;
                                        setTeamData(newTeam);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    value={member.specialization}
                                    onChange={(e) => {
                                        const newTeam = [...teamData];
                                        newTeam[index].specialization = e.target.value;
                                        setTeamData(newTeam);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Profile Image</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={member.image}
                                    onChange={(e) => {
                                        const newTeam = [...teamData];
                                        newTeam[index].image = e.target.value;
                                        setTeamData(newTeam);
                                    }}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                                />
                                <button
                                    onClick={() => handleImageUpload((imageUrl) => {
                                        const newTeam = [...teamData];
                                        newTeam[index].image = imageUrl;
                                        setTeamData(newTeam);
                                    })}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderValuesSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Core Values Management</h3>
                <button
                    onClick={() => setValuesData([...valuesData, {
                        icon: 'Star',
                        title: 'New Value',
                        description: 'Description of the value'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Value</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {valuesData.map((value, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Value {index + 1}</span>
                            <button
                                onClick={() => setValuesData(valuesData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Title</label>
                            <input
                                type="text"
                                value={value.title}
                                onChange={(e) => {
                                    const newValues = [...valuesData];
                                    newValues[index].title = e.target.value;
                                    setValuesData(newValues);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={value.description}
                                onChange={(e) => {
                                    const newValues = [...valuesData];
                                    newValues[index].description = e.target.value;
                                    setValuesData(newValues);
                                }}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Icon</label>
                            <select
                                value={value.icon}
                                onChange={(e) => {
                                    const newValues = [...valuesData];
                                    newValues[index].icon = e.target.value;
                                    setValuesData(newValues);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Object.keys(iconMap).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTimelineSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Company Timeline Management</h3>
                <button
                    onClick={() => setTimelineData([...timelineData, {
                        year: '2024',
                        title: 'New Milestone',
                        description: 'Description of the milestone'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Milestone</span>
                </button>
            </div>
            <div className="space-y-4">
                {timelineData.map((milestone, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">Milestone {index + 1}</span>
                            <button
                                onClick={() => setTimelineData(timelineData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Year</label>
                                <input
                                    type="text"
                                    value={milestone.year}
                                    onChange={(e) => {
                                        const newTimeline = [...timelineData];
                                        newTimeline[index].year = e.target.value;
                                        setTimelineData(newTimeline);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={milestone.title}
                                    onChange={(e) => {
                                        const newTimeline = [...timelineData];
                                        newTimeline[index].title = e.target.value;
                                        setTimelineData(newTimeline);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={milestone.description}
                                onChange={(e) => {
                                    const newTimeline = [...timelineData];
                                    newTimeline[index].description = e.target.value;
                                    setTimelineData(newTimeline);
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

    const renderWhyChooseSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Why Choose Us Management</h3>
                <button
                    onClick={() => setWhyChooseData([...whyChooseData, {
                        icon: 'Star',
                        title: 'New Feature',
                        description: 'Description of the feature'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Feature</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whyChooseData.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Feature {index + 1}</span>
                            <button
                                onClick={() => setWhyChooseData(whyChooseData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Title</label>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                    const newData = [...whyChooseData];
                                    newData[index].title = e.target.value;
                                    setWhyChooseData(newData);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <textarea
                                value={item.description}
                                onChange={(e) => {
                                    const newData = [...whyChooseData];
                                    newData[index].description = e.target.value;
                                    setWhyChooseData(newData);
                                }}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Icon</label>
                            <select
                                value={item.icon}
                                onChange={(e) => {
                                    const newData = [...whyChooseData];
                                    newData[index].icon = e.target.value;
                                    setWhyChooseData(newData);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Object.keys(iconMap).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAwardsSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Awards & Recognition Management</h3>
                <button
                    onClick={() => setAwardsData([...awardsData, {
                        title: 'New Award',
                        organization: 'Organization Name',
                        icon: 'Award'
                    }])}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={16} />
                    <span>Add Award</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awardsData.map((award, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Award {index + 1}</span>
                            <button
                                onClick={() => setAwardsData(awardsData.filter((_, i) => i !== index))}
                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Award Title</label>
                            <input
                                type="text"
                                value={award.title}
                                onChange={(e) => {
                                    const newAwards = [...awardsData];
                                    newAwards[index].title = e.target.value;
                                    setAwardsData(newAwards);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Organization</label>
                            <input
                                type="text"
                                value={award.organization}
                                onChange={(e) => {
                                    const newAwards = [...awardsData];
                                    newAwards[index].organization = e.target.value;
                                    setAwardsData(newAwards);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Icon</label>
                            <select
                                value={award.icon}
                                onChange={(e) => {
                                    const newAwards = [...awardsData];
                                    newAwards[index].icon = e.target.value;
                                    setAwardsData(newAwards);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                                {Object.keys(iconMap).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContactSection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                    type="text"
                    value={contactData.title}
                    onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                    value={contactData.description}
                    onChange={(e) => setContactData({ ...contactData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="text"
                        value={contactData.phone}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                        type="text"
                        value={contactData.address}
                        onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'hero':
                return renderHeroSection();
            case 'mission':
                return renderMissionSection();
            case 'statistics':
                return renderStatisticsSection();
            case 'values':
                return renderValuesSection();
            case 'team':
                return renderTeamSection();
            case 'timeline':
                return renderTimelineSection();
            case 'whychoose':
                return renderWhyChooseSection();
            case 'awards':
                return renderAwardsSection();
            case 'contact':
                return renderContactSection();
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
                            <h1 className="text-xl font-semibold text-gray-900">About Page Preview</h1>
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

                    {/* Mission Preview */}
                    <section className="bg-gray-50 py-12">
                        <div className="max-w-4xl mx-auto px-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{missionData.title}</h2>
                            <p className="text-lg text-gray-700 mb-6">{missionData.description}</p>
                            <div className="grid grid-cols-2 gap-4">
                                {missionData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <CheckCircle className="text-green-600" size={20} />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Statistics Preview */}
                    <section className="py-12">
                        <div className="max-w-4xl mx-auto px-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Impact in Numbers</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {statsData.map((stat, index) => {
                                    const IconComponent = iconMap[stat.icon] || Star;
                                    return (
                                        <div key={index} className="text-center">
                                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <IconComponent className="text-white" size={24} />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                            <div className="text-gray-600">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Team Preview */}
                    <section className="bg-gray-50 py-12">
                        <div className="max-w-4xl mx-auto px-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Meet Our Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {teamData.slice(0, 4).map((member, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                                        />
                                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                        <p className="text-blue-600 font-medium">{member.role}</p>
                                        <p className="text-sm text-gray-600">{member.experience}</p>
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
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
                id="import-file"
            />

            {/* Header */}
           <div className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3">
      {/* Left: Title */}
      <div className="flex items-center space-x-3">
        <Globe className="text-blue-600 shrink-0" size={24} />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          About Page Management
        </h1>
      </div>

      {/* Right: Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={() => document.getElementById('import-file')?.click()}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 w-full sm:w-auto"
        >
          <Upload size={16} />
          <span>Import</span>
        </button>

        <button
          onClick={handleExportData}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full sm:w-auto"
        >
          <FileText size={16} />
          <span>Export</span>
        </button>

        <button
          onClick={() => setIsPreviewMode(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 w-full sm:w-auto"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto"
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

export default AboutPageCMS;