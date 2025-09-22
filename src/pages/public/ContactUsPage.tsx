// src/pages/ContactUsPage.jsx  (or replace your existing file)
import React, { useEffect, useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  User,
  Building,
  Star,
  CheckCircle,
  Home,
  Shield,
  Award,
  Users,
  Calendar,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { contactsAPI } from '@/lib/contactsAPI'; 

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    propertyType: '',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [feedback, setFeedback] = useState({ type: '', message: '' }); // type: 'success' | 'error' | ''

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions([
          'common', 'lead', 'property'
        ]);
        setMasters(data);
        // console.log("Fetched master data:", data);
      } catch (err) {
        console.error('Error fetching master options:', err);
        setFeedback({ type: 'error', message: 'Failed to load dropdown options' });
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Basic client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setFeedback({ type: 'error', message: 'Please fill all required fields.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload - adapt fields if your backend expects different names
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        propertyType: formData.propertyType || null,
        budget: formData.budget || null,
        source: 'website' // optional meta, change if needed
      };

      const resp = await contactsAPI.submitContact(payload);

      // If your backend returns success flag or created object, you can check resp accordingly.
      setFeedback({ type: 'success', message: 'Thank you! We will get back to you within 24 hours.' });

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        propertyType: '',
        budget: ''
      });

      // Optional: you can also re-fetch master data or analytics here
      // console.log('submit response', resp);
    } catch (err) {
      console.error('Submit failed', err);
      // Try to surface backend error message if available
      const errMsg = err?.response?.data?.message || 'Failed to send message. Please try again later.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 99999 99999', '+91 88888 88888'],
      description: '24/7 Customer Support',
      color: 'green'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@resaleexpert.in', 'support@resaleexpert.in'],
      description: 'Quick Response Guaranteed',
      color: 'blue'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Office 501, Business Tower', 'Andheri West, Mumbai - 400058'],
      description: 'Maharashtra, India',
      color: 'purple'
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Mon - Sat: 9:00 AM - 8:00 PM', 'Sunday: 10:00 AM - 6:00 PM'],
      description: 'Extended Hours Available',
      color: 'orange'
    }
  ];

  const officeLocations = [
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
  ];

  const faqs = [
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
  ];

  // Get property types and price ranges from master data
  const propertyTypes = masters['property type'] || [];
  const priceRanges = masters['price range'] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">
              Get in Touch
            </h2>
            <p className="text-xl  mb-2 text-blue-100 max-w-3xl mx-auto">
              Ready to find your dream property or sell your current one? Our expert team is here to help you every step of the way.
            </p>
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">2-4 Hours</div>
                <div className="text-blue-200">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">24/7</div>
                <div className="text-blue-200">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">98%</div>
                <div className="text-blue-200">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Send us a Message</h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours with personalized assistance.
                  </p>
                </div>

                {/* feedback */}
                {feedback.message && (
                  <div className={`px-4 py-2 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {feedback.message}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      disabled={masterLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select property type</option>
                      {propertyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={masterLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select budget range</option>
                      {priceRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What can we help you with?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us more about your requirements..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Multiple ways to reach us. Choose what works best for you.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${info.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : info.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : info.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
                          <Icon className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                          <div className="space-y-1">
                            {info.details.map((detail, i) => (
                              <p key={i} className="text-gray-700 font-medium">{detail}</p>
                            ))}
                          </div>
                          <p className="text-gray-500 text-sm mt-2">{info.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Contact Buttons */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Need Immediate Assistance?</h3>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => window.open('tel:+919999999999')}
                    className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Phone size={18} />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={() => window.open('https://wa.me/919999999999', '_blank')}
                    className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Office Locations</h2>
            <p className="text-xl text-gray-600">Visit us at our offices across major cities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {officeLocations.map((office, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="text-blue-600" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{office.city}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="text-gray-500 mt-1" size={16} />
                    <p className="text-gray-700">{office.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="text-gray-500" size={16} />
                    <p className="text-gray-700">{office.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="text-gray-500" size={16} />
                    <p className="text-gray-700">{office.email}</p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media & Additional Contact */}
      <section className="py-5 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Stay Connected</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Follow us on social media for the latest updates, property listings, and real estate tips
            </p>

            <div className="flex items-center justify-center space-x-6 mb-6">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' }
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all group"
                  >
                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>

            <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">Emergency Contact</h3>
              <p className="text-blue-100 mb-6">
                Need urgent assistance outside business hours?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone size={20} />
                  <span className="font-semibold">Emergency: +91 77777 77777</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={20} />
                  <span className="font-semibold">urgent@resaleexpert.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
