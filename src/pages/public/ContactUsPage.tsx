

// // src/pages/ContactUsPage.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   Phone,
//   Mail,
//   MapPin,
//   Clock,
//   Send,
//   Building,
//   ChevronDown,
//   Facebook,
//   Twitter,
//   Instagram,
//   Linkedin,
// } from 'lucide-react';
// import { getMasterDropdownOptions, type MasterOption } from '@/lib/useMasterData';
// import { contactsAPI } from '@/lib/contactsAPI';
// import { FaWhatsapp } from 'react-icons/fa';
// import Swal from 'sweetalert2';

// /* --------------------------------- Types --------------------------------- */

// interface ContactFormData {
//   name: string;
//   email: string;
//   phone: string;
//   subject: string;
//   message: string;
//   propertyType: string;
//   budget: string;
// }

// type FeedbackType = '' | 'success' | 'error';

// interface FeedbackState {
//   type: FeedbackType;
//   message: string;
// }

// interface OfficeLocation {
//   city: string;
//   address: string;
//   phone: string;
//   email: string;
//   lat?: number;
//   lng?: number;
// }

// /* ------------------------------- Component -------------------------------- */

// const ContactUsPage: React.FC = () => {
//   const [formData, setFormData] = useState<ContactFormData>({
//     name: '',
//     email: '',
//     phone: '',
//     subject: '',
//     message: '',
//     propertyType: '',
//     budget: '',
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
//   const [feedback, setFeedback] = useState<FeedbackState>({ type: '', message: '' });

//   // which FAQ is open (null = all closed)
//   const [openIndex, setOpenIndex] = useState<number | null>(null);
//   const toggle = (idx: number) => setOpenIndex((prev) => (prev === idx ? null : idx));

//   /* ------------------------------ Helpers --------------------------------- */

//   // Open Google Maps with Directions; accepts address string or {lat,lng}
//   const openDirections = (
//     addressOrLatLng: string | { lat: number; lng: number } | undefined | null
//   ) => {
//     if (!addressOrLatLng) return;

//     let url = '';
//     if (typeof addressOrLatLng === 'object') {
//       const { lat, lng } = addressOrLatLng;
//       url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&origin=Current+Location`;
//     } else {
//       url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
//         addressOrLatLng
//       )}&travelmode=driving&origin=Current+Location`;
//     }
//     window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   /* ----------------------------- Effects ---------------------------------- */

//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
//         setMasters(data || {});
//       } catch (err) {
//         console.error('Error fetching master options:', err);
//         setFeedback({ type: 'error', message: 'Failed to load dropdown options' });
//       } finally {
//         setMasterLoading(false);
//       }
//     };
//     fetchMasters();
//   }, []);

//   /* --------------------------- Form Handlers ------------------------------- */

//  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();

//   // Validation
//   if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
//       !formData.subject.trim() || !formData.message.trim()) {
//     await Swal.fire({
//       title: 'Error!',
//       text: 'Please fill all required fields.',
//       icon: 'error',
//       confirmButtonText: 'OK',
//       width: '380px',
//       padding: '1.2rem',
//       customClass: {
//         popup: 'rounded-xl shadow-xl',
//         title: 'text-lg font-bold',
//         confirmButton: 'px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition',
//       },
//       buttonsStyling: false,
//     });
//     return;
//   }

//   setIsSubmitting(true);

//   try {
//     const payload = {
//       name: formData.name.trim(),
//       email: formData.email.trim(),
//       phone: formData.phone.trim(),
//       subject: formData.subject.trim(),
//       message: formData.message.trim(),
//       propertyType: formData.propertyType || null,
//       budget: formData.budget || null,
//       source: 'website',
//     };

//     await contactsAPI.submitContact(payload);

//     // DIRECT SUCCESS SWEET ALERT - NO CONFIRMATION
//     await Swal.fire({
//       title: 'Thank You!',
//       text: 'We will get back to you within 24 hours.',
//       icon: 'success',
//       showCancelButton: false,
//       confirmButtonText: 'OK',
//       timer: 3000,
//       timerProgressBar: true,
//       width: '380px',
//       padding: '1.5rem',
//       customClass: {
//         popup: 'rounded-xl shadow-xl',
//         title: 'text-xl font-bold',
//         htmlContainer: 'text-sm text-gray-600',
//         confirmButton: 'px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition',
//         timerProgressBar: 'bg-green-500',
//       },
//       buttonsStyling: false,
//     });

//     // Clear form
//     setFormData({
//       name: '',
//       email: '',
//       phone: '',
//       subject: '',
//       message: '',
//       propertyType: '',
//       budget: '',
//     });

//   } catch (err: any) {
//     const errMsg = err?.response?.data?.message || 'Failed to send message. Please try again later.';
    
//     await Swal.fire({
//       title: 'Error!',
//       text: errMsg,
//       icon: 'error',
//       confirmButtonText: 'OK',
//       width: '380px',
//       padding: '1.2rem',
//       customClass: {
//         popup: 'rounded-xl shadow-xl',
//         title: 'text-lg font-bold',
//         confirmButton: 'px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition',
//       },
//       buttonsStyling: false,
//     });
//   } finally {
//     setIsSubmitting(false);
//   }
// };
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((s) => ({ ...s, [name]: value }));
//   };

//   /* ------------------------------- Data ------------------------------------ */

//   const contactInfo = [
//     {
//       icon: Phone,
//       title: 'Call Us',
//       details: ['+91 9637 00 9639', '+91 9146 00 9176'],
//       description: '24/7 Customer Support',
//       color: 'green',
//     },
//     {
//       icon: Mail,
//       title: 'Email Us',
//       details: ['info@resaleexpert.in'],
//       description: 'Quick Response Guaranteed',
//       color: 'blue',
//     },
//     {
//       icon: MapPin,
//       title: 'Visit Us',
//       details: ['Shubhchandra, Nakhate Chowk', 'Rahatani, Pimpri-Chinchwad'],
//       description: 'Pune, Maharashtra 411017, India',
//       color: 'purple',
//     },
//     {
//       icon: Clock,
//       title: 'Office Hours',
//       details: ['Mon - Fri: 10:00 AM - 8:00 PM', 'Sat - Sun: 9:00 AM - 9:00 PM'],
//       description: 'Extended Hours Available',
//       color: 'orange',
//     },
//   ] as const;

//   const officeLocations: OfficeLocation[] = [
//     {
//       city: 'Pune',
//       address: 'Shubhchandra, Rahatani, Pune - 411017',
//       phone: '+91 9637 00 9639',
//       email: 'pune@resaleexpert.in',
//       lat: 18.6070,
//       lng: 73.7919,
//     },
//   ];

//   const faqs = [
//     {
//       question: 'How quickly do you respond to inquiries?',
//       answer:
//         'We respond to all inquiries within 2-4 hours during business hours and within 24 hours on weekends.',
//     },
//     {
//       question: 'Do you charge for consultation?',
//       answer:
//         'Our initial consultation is completely free. We only charge when you decide to proceed with our services.',
//     },
//     {
//       question: 'What areas do you cover?',
//       answer:
//         'We currently operate in Mumbai, Pune, Delhi, Bangalore, and Hyderabad, with plans to expand to more cities.',
//     },
//     {
//       question: 'Can I schedule a property visit?',
//       answer:
//         'Yes! You can schedule property visits through our website, mobile app, or by calling our customer service team.',
//     },
//   ] as const;

//   // Master values
//   const propertyTypes: MasterOption[] = masters['property type'] || [];
//   const priceRanges: MasterOption[] = masters['price range'] || [];

//   /* -------------------------------- Render -------------------------------- */

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero */}
//       <section className="py-28 pt-28" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold mb-3 text-white">Get in Touch</h2>
//             <p className="text-lg mb-2 text-blue-100 max-w-3xl mx-auto">
//               Ready to find your dream property or sell your current one? Our expert team is here to help you every step
//               of the way.
//             </p>
//             <div className="flex items-center justify-center space-x-8 mt-6">
//               <div className="text-center">
//                 <div className="text-xl font-bold mb-2 text-white">2-4 Hours</div>
//                 <div className="text-blue-200">Response Time</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xl font-bold mb-2 text-white">24/7</div>
//                 <div className="text-blue-200">Support Available</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-xl font-bold mb-2 text-white">98%</div>
//                 <div className="text-blue-200">Satisfaction Rate</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Contact Form & Info */}
//       <section className="py-3">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//             {/* Form */}
//             <div className="bg-white rounded-2xl shadow-sm p-8">
//               <div className="mb-4 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-800 mb-4">Send us a Message</h2>
//                   <p className="text-gray-600">
//                     Fill out the form below and we'll get back to you within 24 hours with personalized assistance.
//                   </p>
//                 </div>

//                   <div
//                     className={`px-4 py-2 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
//                       }`}
//                   >
//                   </div>
                
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter your full name"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter your phone number"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter your email address"
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
//                     <select
//                       name="propertyType"
//                       value={formData.propertyType}
//                       onChange={handleChange}
//                       disabled={masterLoading}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select property type</option>
//                       {(propertyTypes || []).map((type) => (
//                         <option key={type.value} value={type.value}>
//                           {type.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
//                     <select
//                       name="budget"
//                       value={formData.budget}
//                       onChange={handleChange}
//                       disabled={masterLoading}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select budget range</option>
//                       {(priceRanges || []).map((range) => (
//                         <option key={range.value} value={range.value}>
//                           {range.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
//                   <input
//                     type="text"
//                     name="subject"
//                     value={formData.subject}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="What can we help you with?"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
//                   <textarea
//                     name="message"
//                     value={formData.message}
//                     onChange={handleChange}
//                     rows={5}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Tell us more about your requirements..."
//                     required
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full bg-[#E6761D] hover:bg-[#CC6A1A] text-white py-4 px-6 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
//                       <span>Sending...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Send size={20} />
//                       <span>Send Message</span>
//                     </>
//                   )}
//                 </button>
//               </form>
//             </div>

//             {/* Contact Information */}
//             <div className="space-y-8">
//               <div>
//                 <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Information</h2>
//                 <p className="text-gray-600 mb-8">Multiple ways to reach us. Choose what works best for you.</p>
//               </div>

//               <div className="space-y-6">
//                 {contactInfo.map((info, index) => {
//                   const Icon: any = info.icon; // lighten typing for lucide-react
//                   const colorClass = 'bg-[#E6761D]';
//                   const isVisit = info.title === 'Visit Us';
//                   return (
//                     <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
//                       <div className="flex items-start space-x-4">
//                         <div className={`p-3 rounded-xl ${colorClass}`}>
//                           <Icon className="text-white" size={20} />
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-bold text-gray-800 mb-2">{info.title}</h3>
//                           <div className="space-y-1">
//                             {info.details.map((detail, i) =>
//                               isVisit ? (
//                                 <p key={i} className="text-gray-700 font-medium">
//                                   <a
//                                     href={`https://www.google.com/maps/place/Resale+Expert/@18.6043773,73.7822784,786m/data=!3m2!1e3!4b1!4m6!3m5!1s0x210d06d018a02fa1:0xcb55e5426416ae86!8m2!3d18.6043723!4d73.7871493!16s%2Fg%2F11ksnvr1rf?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D=${encodeURIComponent(
//                                       detail
//                                     )}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="underline hover:no-underline"
//                                   >
//                                     {detail}
//                                   </a>
//                                 </p>
//                               ) : (
//                                 <p key={i} className="text-gray-700 font-medium">
//                                   {detail}
//                                 </p>
//                               )
//                             )}
//                           </div>
//                           <p className="text-gray-500 text-sm mt-2">{info.description}</p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Quick Contact Buttons */}
//               <div className="rounded-xl p-6 text-white" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
//                 <h3 className="text-xl font-bold mb-4">Need Immediate Assistance?</h3>
//                 <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
//                   {/* Call */}
//                   <button
//                     onClick={() => window.open('tel:+919637009639')}
//                     aria-label="Call Now"
//                     className="flex-1 bg-[#E6761D] text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white/30"
//                   >
//                     <Phone size={18} />
//                     <span>Call Now</span>
//                   </button>

//                   {/* WhatsApp */}
//                   <button
//                     onClick={() => window.open('https://wa.me/919637009639', '_blank')}
//                     aria-label="WhatsApp"
//                     className="flex-1 bg-[#25D366] hover:bg-[#1ebe57] active:bg-[#19a94d] text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white/30"
//                   >
//                     <FaWhatsapp size={18} />
//                     <span>WhatsApp</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Office Locations */}
//       <section className="py-3 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Office Locations</h2>
//             <p className="text-xl text-gray-600">Visit us at our offices across major cities</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {officeLocations.map((office, index) => (
//               <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all">
//                 <div className="flex items-center space-x-3 mb-4">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <Building className="text-blue-600" size={20} />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-800">{office.city}</h3>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex items-start space-x-2">
//                     <MapPin className="text-gray-500 mt-1" size={16} />
//                     <p className="text-gray-700">{office.address}</p>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Phone className="text-gray-500" size={16} />
//                     <p className="text-gray-700">{office.phone}</p>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Mail className="text-gray-500" size={16} />
//                     <p className="text-gray-700">{office.email}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() =>
//                     office.lat && office.lng
//                       ? openDirections({ lat: office.lat, lng: office.lng })
//                       : openDirections(office.address)
//                   }
//                   className="w-full mt-4 bg-[#E6761D] hover:bg-[#CC6A1A] text-white py-2 px-4 rounded-lg transition-colors"
//                 >
//                   Get Directions
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section className="py-3 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
//             <p className="text-xl text-gray-600">Quick answers to common questions</p>
//           </div>

//           <div className="space-y-2 sm:space-y-3">
//             {faqs.map((faq, index) => {
//               const isOpen = openIndex === index;
//               return (
//                 <div key={index} className="bg-white rounded-xl border border-gray-200">
//                   <button
//                     type="button"
//                     onClick={() => toggle(index)}
//                     aria-expanded={isOpen}
//                     aria-controls={`faq-panel-${index}`}
//                     className="w-full flex items-center justify-between gap-4 p-6 text-left"
//                   >
//                     <h3 className="text-base sm:text-lg font-semibold text-gray-900">{faq.question}</h3>
//                     <ChevronDown className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
//                   </button>

//                   <div
//                     id={`faq-panel-${index}`}
//                     role="region"
//                     className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
//                       }`}
//                   >
//                     <div className="overflow-hidden">
//                       <div className="px-6 pb-6 pt-0 text-gray-700 leading-relaxed">{faq.answer}</div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Social */}
//       <section className="py-3 text-white" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-2xl font-bold mb-6 text-white">Stay Connected</h2>
//             <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
//               Follow us on social media for the latest updates, property listings, and real estate tips
//             </p>

//             <div className="flex items-center justify-center space-x-6 mb-6">
//               {[
//                 { icon: Facebook, href: 'https://www.facebook.com/resaleexpert.i', label: 'Facebook' },
//                 { icon: Twitter, href: 'https://twitter.com/resaleexpertin', label: 'Twitter' },
//                 { icon: Instagram, href: 'https://www.instagram.com/resaleexpert.in/', label: 'Instagram' },
//                 { icon: Linkedin, href: 'https://www.linkedin.com/company/resaleexpertin/', label: 'LinkedIn' },
//               ].map((social, index) => {
//                 const Icon: any = social.icon;
//                 return (
//                   <a
//                     key={index}
//                     href={social.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="p-4 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all group"
//                     aria-label={social.label}
//                   >
//                     <Icon size={20} className="group-hover:scale-110 transition-transform" />
//                   </a>
//                 );
//               })}
//             </div>

//             <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
//               <h3 className="text-2xl font-bold mb-4 text-white">Emergency Contact</h3>
//               <p className="text-blue-100 mb-6">Need urgent assistance outside business hours?</p>
//               <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
//                 <div className="flex items-center space-x-2">
//                   <Phone size={20} />
//                   <span className="font-semibold">Emergency: +91 9146 00 9176</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Mail size={20} />
//                   <span className="font-semibold">urgent@resaleexpert.in</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ContactUsPage;


// // src/pages/ContactUsPage.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   Phone, Mail, MapPin, Clock, Send, Building,
//   ChevronDown, Facebook, Twitter, Instagram, Linkedin,
// } from 'lucide-react';
// import { getMasterDropdownOptions, type MasterOption } from '@/lib/useMasterData';
// import { contactsAPI } from '@/lib/contactsAPI';
// import { FaWhatsapp } from 'react-icons/fa';
// import Swal from 'sweetalert2';

// /* ─────────────────────────────────────────────────────────────────────────── */
// /*  IMPORTANT: We call buyer / seller APIs directly so the data lands in       */
// /*  the correct table.  We import the same API clients already used elsewhere. */
// /*  If your project exports them differently, adjust the import paths only.    */
// /* ─────────────────────────────────────────────────────────────────────────── */
// import { buyerAPI }  from '@/lib/buyerAPI';   // POST /buyers/createBuyer
// import { sellerAPI } from '@/lib/sellersAPI';  // POST /sellers/createSeller

// /* ─────────────────── Types ─────────────────── */
// type EnquiryType = '' | 'buyer' | 'seller' | 'new';

// interface ContactFormData {
//   enquiryType   : EnquiryType;
//   fullName      : string;
//   emailAddress  : string;
//   phoneNumber   : string;
//   propertyType  : string;
//   budgetRange   : string;
//   subjectLine   : string;
//   messageBody   : string;
// }

// interface OfficeLocation {
//   city    : string;
//   address : string;
//   phone   : string;
//   email   : string;
//   lat?    : number;
//   lng?    : number;
// }

// /* ─────────────────── Design tokens ─────────────────── */
// const BRAND  = '#E6761D';
// const NAVY   = '#0f2b3d';
// const BG     = '#f8f9fa';
// const BORDER = '#e4e7eb';

// /* ─────────────────── Swal helper ─────────────────── */
// const alert = (opts: object) =>
//   Swal.fire({
//     width: '380px',
//     padding: '1.2rem',
//     buttonsStyling: false,
//     customClass: { popup: 'rounded-xl shadow-xl' },
//     ...opts,
//   });

// const btnOk  = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E6761D]';
// const btnRed = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600';
// const btnGrn = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600';

// /* ─────────────────── Maps helper ─────────────────── */
// const openMaps = (v?: string | { lat: number; lng: number } | null) => {
//   if (!v) return;
//   const url =
//     typeof v === 'object'
//       ? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}&travelmode=driving`
//       : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v)}&travelmode=driving`;
//   window.open(url, '_blank', 'noopener,noreferrer');
// };

// /* ═══════════════════════════════════════════════════════════════════════════ */
// const ContactUsPage: React.FC = () => {

//   const EMPTY: ContactFormData = {
//     enquiryType  : '',
//     fullName     : '',
//     emailAddress : '',
//     phoneNumber  : '',
//     propertyType : '',
//     budgetRange  : '',
//     subjectLine  : '',
//     messageBody  : '',
//   };

//   const [form,          setForm]          = useState<ContactFormData>(EMPTY);
//   const [isSubmitting,  setIsSubmitting]  = useState(false);
//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters,       setMasters]       = useState<Record<string, MasterOption[]>>({});
//   const [openFaq,       setOpenFaq]       = useState<number | null>(null);

//   /* fetch dropdowns */
//   useEffect(() => {
//     (async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
//         setMasters(data || {});
//       } catch { /* silent */ } finally { setMasterLoading(false); }
//     })();
//   }, []);

//   const set = (k: keyof ContactFormData, v: string) =>
//     setForm(f => ({ ...f, [k]: v }));

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
//   ) => set(e.target.name as keyof ContactFormData, e.target.value);

//   /* ─────────────────── SUBMIT ─────────────────── */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     /* 1. enquiry type required */
//     if (!form.enquiryType) {
//       await alert({ title: 'Select Purpose', text: 'Please select: Buyer, Seller, or New Enquiry.', icon: 'warning', confirmButtonText: 'OK', customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnOk } });
//       return;
//     }

//     /* 2. required fields */
//     const required = [form.fullName, form.emailAddress, form.phoneNumber, form.subjectLine, form.messageBody];
//     if (required.some(v => !v.trim())) {
//       await alert({ title: 'Missing Fields', text: 'Please fill all required fields marked with *.', icon: 'error', confirmButtonText: 'OK', customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed } });
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       /* ── BUYER → buyers table ── */
//       if (form.enquiryType === 'buyer') {
//         /*
//           buyerAPI.create (or createBuyer) sends to POST /buyers/createBuyer
//           Fields match buyerController.createBuyer + Buyer model exactly:
//             name, phone, email, buyer_lead_source, buyer_lead_status,
//             buyer_lead_stage, buyer_lead_priority, requirements (JSON), notes
//         */
//         await buyerAPI.create({
//           name                : form.fullName.trim(),
//           phone               : form.phoneNumber.trim().replace(/\D/g, ''),
//           email               : form.emailAddress.trim().toLowerCase(),
//           buyer_lead_source   : 'Website',
//           buyer_lead_status   : 'new',
//           buyer_lead_stage    : 'initial_contact',
//           buyer_lead_priority : 'medium',
//           requirements        : JSON.stringify({
//             propertyType : form.propertyType || null,
//           }),
//           budget              : form.budgetRange || null,
//           notes               : `Subject: ${form.subjectLine.trim()}\n\n${form.messageBody.trim()}`,
//         });

//       /* ── SELLER → sellers table ── */
//       } else if (form.enquiryType === 'seller') {
//         /*
//           sellerAPI.create sends to POST /sellers/createSeller
//           Fields match sellerController.createSeller + normalizeSeller exactly:
//             name, phone, email, source, stage, status, priority, notes
//         */
//         await sellerAPI.create({
//           name     : form.fullName.trim(),
//           phone    : form.phoneNumber.trim().replace(/\D/g, ''),
//           email    : form.emailAddress.trim().toLowerCase(),
//           source   : 'Website',
//           stage    : 'initial_contact',
//           status   : 'new',
//           priority : 'medium',
//           notes    : `Subject: ${form.subjectLine.trim()}\n\n${form.messageBody.trim()}`,
//         });

//       /* ── NEW ENQUIRY → leads/contacts table ── */
//       } else {
//         /*
//           contactsAPI.submitContact → POST /contacts/submit → contact_inquiries table
//           This is the existing route, no change needed.
//         */
//         await contactsAPI.submitContact({
//           name        : form.fullName.trim(),
//           email       : form.emailAddress.trim().toLowerCase(),
//           phone       : form.phoneNumber.trim(),
//           subject     : form.subjectLine.trim(),
//           message     : form.messageBody.trim(),
//           propertyType: form.propertyType  || null,
//           budget      : form.budgetRange   || null,
//           source      : 'website',
//         });
//       }

//       await alert({
//         title: 'Submitted!',
//         text : 'Thank you! We will get back to you within 24 hours.',
//         icon : 'success',
//         timer: 3000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//         customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnGrn, timerProgressBar: 'bg-green-500' },
//       });

//       setForm(EMPTY);

//     } catch (err: any) {
//       const msg = err?.response?.data?.message || err?.message || 'Failed to send. Please try again.';
//       await alert({ title: 'Error', text: msg, icon: 'error', confirmButtonText: 'OK', customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed } });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ─────────────────── Static data ─────────────────── */
//   const contactCards = [
//     { icon: Phone,  title: 'Phone',        lines: ['+91 9637 00 9639', '+91 9146 00 9176'], sub: '24 / 7 Support' },
//     { icon: Mail,   title: 'Email',         lines: ['info@resaleexpert.in'],                 sub: 'Quick Response' },
//     { icon: MapPin, title: 'Office',        lines: ['Shubhchandra, Nakhate Chowk', 'Rahatani, Pimpri-Chinchwad, Pune 411017'], sub: 'Maharashtra, India' },
//     { icon: Clock,  title: 'Working Hours', lines: ['Mon – Fri  10:00 AM – 8:00 PM', 'Sat – Sun   9:00 AM – 9:00 PM'], sub: 'Extended hours' },
//   ] as const;

//   const offices: OfficeLocation[] = [
//     { city: 'Pune', address: 'Shubhchandra, Rahatani, Pune – 411017', phone: '+91 9637 00 9639', email: 'pune@resaleexpert.in', lat: 18.6070, lng: 73.7919 },
//   ];

//   const faqs = [
//     { q: 'How quickly do you respond?',          a: 'Within 2–4 hours during business hours; within 24 hours on weekends.' },
//     { q: 'Is the initial consultation free?',     a: 'Yes, our initial consultation is completely free of charge.' },
//     { q: 'Which cities do you operate in?',       a: 'Currently Mumbai, Pune, Delhi, Bangalore, and Hyderabad – expanding soon.' },
//     { q: 'Can I schedule a property visit?',      a: 'Absolutely – via our website, app, or by calling our team directly.' },
//   ] as const;

//   const propertyTypes: MasterOption[] = masters['property type'] || [];
//   const priceRanges  : MasterOption[] = masters['price range']   || [];

//   /* ─────────────────── Enquiry routing info ─────────────────── */
//   const routeInfo: Record<string, { label: string; color: string; bg: string; table: string }> = {
//     buyer  : { label: 'Buyer Lead',       color: '#2563eb', bg: '#eff6ff', table: 'buyers table'  },
//     seller : { label: 'Seller Lead',      color: BRAND,     bg: '#FFF4EC', table: 'sellers table' },
//     new    : { label: 'General Enquiry',  color: '#059669', bg: '#f0fdf4', table: 'contacts table' },
//   };

//   /* ══════════════════════════════ RENDER ══════════════════════════════════ */
//   return (
//     <div className="min-h-screen" style={{ backgroundColor: BG }}>

//       {/* ── Hero ── */}
//       <section className="relative overflow-hidden py-24 pt-28"
//         style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a52 100%)` }}>
//         {/* bg circles */}
//         <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-[0.06]"
//           style={{ background: BRAND }} />
//         <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-[0.06]"
//           style={{ background: BRAND }} />

//         <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <span className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
//               style={{ background: `${BRAND}22`, color: BRAND, border: `1px solid ${BRAND}44` }}>
//               <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: BRAND }} />
//               Always Here to Help
//             </span>
//             <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
//               Get in <span style={{ color: BRAND }}>Touch</span>
//             </h1>
//             <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
//               Whether you want to buy, sell, or just explore — our expert team guides you at every step.
//             </p>
//             <div className="flex flex-wrap items-center justify-center gap-12">
//               {[['2 – 4 hrs', 'Response Time'], ['24 / 7', 'Support'], ['98 %', 'Satisfaction']].map(
//                 ([v, l]) => (
//                   <div key={l} className="text-center">
//                     <div className="text-2xl font-bold mb-0.5" style={{ color: BRAND }}>{v}</div>
//                     <div className="text-sm text-blue-200">{l}</div>
//                   </div>
//                 ),
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Form + Contact info ── */}
//       <section className="py-10">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

//             {/* ────────── LEFT: Form (3 cols) ────────── */}
//             <div className="lg:col-span-3">
//               <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: `1px solid ${BORDER}` }}>

//                 {/* card header */}
//                 <div className="border-b px-7 pb-5 pt-6" style={{ borderColor: BORDER }}>
//                   <h2 className="text-xl font-bold text-gray-900">Send us a Message</h2>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Fill out the form below — your enquiry goes directly to the right team.
//                   </p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-5 px-7 py-6">

//                   {/* ── ROW 1: Purpose of Enquiry (dropdown) ── */}
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       Purpose of Enquiry <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="enquiryType"
//                       value={form.enquiryType}
//                       onChange={handleChange}
//                       className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none bg-white transition-all focus:ring-2"
//                       style={{ borderColor: form.enquiryType ? BRAND : BORDER,
//                         boxShadow: form.enquiryType ? `0 0 0 3px ${BRAND}18` : 'none' }}
//                     >
//                       <option value="">— Select your purpose —</option>
//                       <option value="buyer">🏠  I want to Buy a Property</option>
//                       <option value="seller">🏷️  I want to Sell my Property</option>
//                       <option value="new">🔍  General / New Enquiry</option>
//                     </select>

//                     {/* routing badge */}
//                     {form.enquiryType && (() => {
//                       const r = routeInfo[form.enquiryType];
//                       return (
//                         <div className="mt-2 flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium"
//                           style={{ background: r.bg, color: r.color, border: `1px solid ${r.color}30` }}>
//                           <span>✓</span>
//                           <span>
//                             Submitted as <strong>{r.label}</strong> — stored in <strong>{r.table}</strong>
//                           </span>
//                         </div>
//                       );
//                     })()}
//                   </div>

//                   {/* ── ROW 2: Full Name + Phone Number ── */}
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                     <div>
//                       <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                         Full Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text" name="fullName" value={form.fullName}
//                         onChange={handleChange} required autoComplete="name"
//                         placeholder="e.g. Kamlesh Shah"
//                         className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
//                         style={{ borderColor: BORDER }}
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                         Phone Number <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="tel" name="phoneNumber" value={form.phoneNumber}
//                         onChange={handleChange} required autoComplete="tel"
//                         placeholder="+91 98765 43210"
//                         className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
//                         style={{ borderColor: BORDER }}
//                       />
//                     </div>
//                   </div>

//                   {/* ── ROW 3: Email Address + Property Type ── */}
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                     <div>
//                       <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                         Email Address <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="email" name="emailAddress" value={form.emailAddress}
//                         onChange={handleChange} required autoComplete="email"
//                         placeholder="you@example.com"
//                         className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
//                         style={{ borderColor: BORDER }}
//                       />
//                     </div>
//                     <div>
//                       <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                         Property Type
//                       </label>
//                       <select
//                         name="propertyType" value={form.propertyType}
//                         onChange={handleChange} disabled={masterLoading}
//                         className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none bg-white"
//                         style={{ borderColor: BORDER }}
//                       >
//                         <option value="">— Select type —</option>
//                         {propertyTypes.map(t => (
//                           <option key={t.value} value={t.value}>{t.label}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {/* ── ROW 4: Budget Range ── */}
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       Budget Range
//                     </label>
//                     <select
//                       name="budgetRange" value={form.budgetRange}
//                       onChange={handleChange} disabled={masterLoading}
//                       className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none bg-white"
//                       style={{ borderColor: BORDER }}
//                     >
//                       <option value="">— Select budget —</option>
//                       {priceRanges.map(r => (
//                         <option key={r.value} value={r.value}>{r.label}</option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* ── ROW 5: Subject Line ── */}
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       Subject Line <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text" name="subjectLine" value={form.subjectLine}
//                       onChange={handleChange} required
//                       placeholder="Briefly describe your requirement"
//                       className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
//                       style={{ borderColor: BORDER }}
//                     />
//                   </div>

//                   {/* ── ROW 6: Message Body ── */}
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
//                       Message <span className="text-red-500">*</span>
//                     </label>
//                     <textarea
//                       name="messageBody" value={form.messageBody}
//                       onChange={handleChange} rows={4} required
//                       placeholder="Describe your requirements in detail…"
//                       className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2"
//                       style={{ borderColor: BORDER }}
//                     />
//                   </div>

//                   {/* ── Submit ── */}
//                   <button
//                     type="submit" disabled={isSubmitting}
//                     className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-opacity disabled:opacity-50"
//                     style={{ background: BRAND }}
//                   >
//                     {isSubmitting ? (
//                       <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Sending…</span></>
//                     ) : (
//                       <><Send size={15} /><span>Send Message</span></>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {/* ────────── RIGHT: Contact info (2 cols) ────────── */}
//             <div className="space-y-4 lg:col-span-2">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
//                 <p className="mt-1 text-sm text-gray-500">Multiple ways to reach us. Choose what works best.</p>
//               </div>

//               {contactCards.map((c, i) => {
//                 const Icon = c.icon as any;
//                 return (
//                   <div key={i} className="flex items-start gap-4 rounded-xl bg-white p-4 transition-shadow hover:shadow-md"
//                     style={{ border: `1px solid ${BORDER}` }}>
//                     <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
//                       style={{ background: `${BRAND}15`, color: BRAND }}>
//                       <Icon size={15} />
//                     </div>
//                     <div className="min-w-0">
//                       <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{c.title}</div>
//                       {c.lines.map((l, j) => (
//                         <div key={j} className="text-sm font-medium text-gray-700">{l}</div>
//                       ))}
//                       <div className="mt-0.5 text-[11px] text-gray-400">{c.sub}</div>
//                     </div>
//                   </div>
//                 );
//               })}

//               {/* CTA card */}
//               <div className="rounded-xl p-5 text-white"
//                 style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
//                 <div className="mb-0.5 text-sm font-semibold">Need Immediate Assistance?</div>
//                 <div className="mb-4 text-xs text-blue-200">Available around the clock for urgent queries.</div>
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => window.open('tel:+919637009639')}
//                     className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
//                     style={{ background: BRAND }}>
//                     <Phone size={13} /> Call Now
//                   </button>
//                   <button
//                     onClick={() => window.open('https://wa.me/919637009639', '_blank')}
//                     className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
//                     style={{ background: '#25D366' }}>
//                     <FaWhatsapp size={13} /> WhatsApp
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Office Locations ── */}
//       <section className="bg-white py-8">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-7 text-center">
//             <h2 className="text-2xl font-bold text-gray-900">Our Office</h2>
//             <p className="mt-1 text-sm text-gray-500">Come visit us in Pune</p>
//           </div>
//           <div className="mx-auto max-w-sm">
//             {offices.map((o, i) => (
//               <div key={i} className="rounded-2xl p-6" style={{ background: BG, border: `1px solid ${BORDER}` }}>
//                 <div className="mb-4 flex items-center gap-3">
//                   <div className="rounded-xl p-2" style={{ background: `${BRAND}15`, color: BRAND }}>
//                     <Building size={15} />
//                   </div>
//                   <h3 className="font-bold text-gray-900">{o.city}</h3>
//                 </div>
//                 <div className="space-y-2 text-sm text-gray-600">
//                   <div className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0 text-gray-400" /><span>{o.address}</span></div>
//                   <div className="flex items-center gap-2"><Phone size={13} className="flex-shrink-0 text-gray-400" /><span>{o.phone}</span></div>
//                   <div className="flex items-center gap-2"><Mail  size={13} className="flex-shrink-0 text-gray-400" /><span>{o.email}</span></div>
//                 </div>
//                 <button
//                   onClick={() => o.lat && o.lng ? openMaps({ lat: o.lat, lng: o.lng }) : openMaps(o.address)}
//                   className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
//                   style={{ background: BRAND }}>
//                   Get Directions
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FAQ ── */}
//       <section className="py-8" style={{ background: BG }}>
//         <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-7 text-center">
//             <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
//             <p className="mt-1 text-sm text-gray-500">Quick answers to common queries</p>
//           </div>
//           <div className="space-y-2">
//             {faqs.map((f, i) => {
//               const open = openFaq === i;
//               return (
//                 <div key={i} className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${BORDER}` }}>
//                   <button type="button" onClick={() => setOpenFaq(open ? null : i)}
//                     className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
//                     <span className="text-sm font-semibold text-gray-900">{f.q}</span>
//                     <ChevronDown size={15}
//                       className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
//                   </button>
//                   <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
//                     <div className="overflow-hidden">
//                       <div className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{f.a}</div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── Social / Emergency ── */}
//       <section className="py-8" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="mb-2 text-xl font-bold text-white">Stay Connected</h2>
//           <p className="mb-6 text-sm text-blue-200">Follow us for the latest listings, news, and real estate tips</p>
//           <div className="mb-8 flex items-center justify-center gap-4">
//             {[
//               { Icon: Facebook,  href: 'https://www.facebook.com/resaleexpert.i' },
//               { Icon: Twitter,   href: 'https://twitter.com/resaleexpertin' },
//               { Icon: Instagram, href: 'https://www.instagram.com/resaleexpert.in/' },
//               { Icon: Linkedin,  href: 'https://www.linkedin.com/company/resaleexpertin/' },
//             ].map(({ Icon, href }, i) => (
//               <a key={i} href={href} target="_blank" rel="noopener noreferrer"
//                 className="rounded-xl p-3 transition-colors hover:bg-white/20"
//                 style={{ background: 'rgba(255,255,255,0.1)' }}>
//                 <Icon size={17} className="text-white" />
//               </a>
//             ))}
//           </div>
//           <div className="inline-block rounded-2xl px-8 py-6"
//             style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
//             <h3 className="mb-1 text-base font-bold text-white">Emergency Contact</h3>
//             <p className="mb-4 text-xs text-blue-200">Urgent assistance outside business hours</p>
//             <div className="flex flex-col items-center gap-3 text-sm text-white sm:flex-row sm:gap-8">
//               <div className="flex items-center gap-2"><Phone size={13} /><span>+91 9146 00 9176</span></div>
//               <div className="flex items-center gap-2"><Mail  size={13} /><span>urgent@resaleexpert.in</span></div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ContactUsPage;





// // src/pages/ContactUsPage.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   Phone, Mail, MapPin, Clock, Send, Building,
//   ChevronDown, Facebook, Twitter, Instagram, Linkedin,
// } from 'lucide-react';
// import { getMasterDropdownOptions, type MasterOption } from '@/lib/useMasterData';
// import { leadsAPI } from '@/lib/api';
// import { buyerAPI }  from '@/lib/buyerAPI';
// import { sellerAPI } from '@/lib/sellersAPI';
// import { FaWhatsapp } from 'react-icons/fa';
// import Swal from 'sweetalert2';

// type EnquiryType = 'lead' | 'buyer' | 'seller';

// interface FormData {
//   enquiryType    : EnquiryType;
//   salutation     : string;
//   fullName       : string;
//   emailAddress   : string;
//   phoneNumber    : string;
//   messageBody    : string;
//   // buyer extras
//   propertyType   : string;
//   budgetMin      : string;
//   budgetMax      : string;
//   // seller extras
//   sellerPropType : string;
//   expectedPrice  : string;
//   expectedClose  : string;
// }

// const BRAND  = '#E6761D';
// const NAVY   = '#0f2b3d';
// const BG     = '#f8f9fa';
// const BORDER = '#e4e7eb';

// const btnOk  = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E6761D]';
// const btnRed = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600';
// const btnGrn = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600';

// const swal = (opts: object) =>
//   Swal.fire({ width: '380px', padding: '1.2rem', buttonsStyling: false,
//     customClass: { popup: 'rounded-xl shadow-xl' }, ...opts });

// const openMaps = (v: string | { lat: number; lng: number }) => {
//   const url = typeof v === 'object'
//     ? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}&travelmode=driving`
//     : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v)}&travelmode=driving`;
//   window.open(url, '_blank', 'noopener,noreferrer');
// };

// const inputCls = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-orange-200 bg-white';
// const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

// const EMPTY: FormData = {
//   enquiryType   : 'lead',
//   salutation    : 'Mr.',
//   fullName      : '',
//   emailAddress  : '',
//   phoneNumber   : '',
//   messageBody   : '',
//   propertyType  : '',
//   budgetMin     : '',
//   budgetMax     : '',
//   sellerPropType: '',
//   expectedPrice : '',
//   expectedClose : '',
// };

// const ContactUsPage: React.FC = () => {
//   const [form,         setForm]         = useState<FormData>(EMPTY);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [masterLoading,setMasterLoading]= useState(true);
//   const [masters,      setMasters]      = useState<Record<string, MasterOption[]>>({});
//   const [openFaq,      setOpenFaq]      = useState<number | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
//         setMasters(data || {});
//       } catch { /* silent */ } finally { setMasterLoading(false); }
//     })();
//   }, []);

//   const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
//   const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
//     set(e.target.name as keyof FormData, e.target.value);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.fullName.trim() || !form.emailAddress.trim() || !form.phoneNumber.trim() || !form.messageBody.trim()) {
//       await swal({ title: 'Missing Fields', text: 'Please fill all required fields.', icon: 'error',
//         confirmButtonText: 'OK', customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed } });
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       if (form.enquiryType === 'buyer') {
//         await buyerAPI.create({
//           salutation         : form.salutation,
//           name               : form.fullName.trim(),
//           phone              : form.phoneNumber.trim().replace(/\D/g, ''),
//           email              : form.emailAddress.trim().toLowerCase(),
//           buyer_lead_source  : 'Website',
//           buyer_lead_status  : 'new',
//           buyer_lead_stage   : 'initial_contact',
//           buyer_lead_priority: 'medium',
//           budget_min         : form.budgetMin  ? Number(form.budgetMin)  : null,
//           budget_max         : form.budgetMax  ? Number(form.budgetMax)  : null,
//           requirements       : JSON.stringify({ propertyType: form.propertyType || null }),
//           notes              : form.messageBody.trim(),
//         });
//       } else if (form.enquiryType === 'seller') {
//         await sellerAPI.create({
//           salutation    : form.salutation,
//           name          : form.fullName.trim(),
//           phone         : form.phoneNumber.trim().replace(/\D/g, ''),
//           email         : form.emailAddress.trim().toLowerCase(),
//           source        : 'Website',
//           stage         : 'initial_contact',
//           status        : 'new',
//           priority      : 'medium',
//           leadType      : form.sellerPropType  || null,
//           deal_value    : form.expectedPrice   ? Number(form.expectedPrice) : null,
//           expected_close: form.expectedClose   || null,
//           notes         : form.messageBody.trim(),
//         });
//       } else {
//         // General enquiry → client_leads table
//        await leadsAPI.createLead({
//   salutation        : form.salutation,
//   name              : form.fullName.trim(),
//   phone             : form.phoneNumber.trim().replace(/\D/g, ''),
//   email             : form.emailAddress.trim().toLowerCase(),
//   lead_source       : 'Website',
//   lead_type         : 'General Enquiry',
//   status            : 'new',
//   priority          : 'medium',
//   whatsapp_number   : form.phoneNumber.trim().replace(/\D/g, '') || null,
//   notes             : form.messageBody.trim(),
//   // 👇 Add missing fields as null
//   state             : null,
//   city              : null,
//   location          : null,
//   assigned_executive: null,
//   // created_by and updated_by will be set by backend from req.userId
// });
//       }

//       await swal({
//         title: 'Submitted!', text: 'Thank you! We will get back to you within 24 hours.',
//         icon: 'success', timer: 3000, timerProgressBar: true, showConfirmButton: false,
//         customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnGrn },
//       });
//       setForm(EMPTY);
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || err?.message || 'Failed to send. Please try again.';
//       await swal({ title: 'Error', text: msg, icon: 'error', confirmButtonText: 'OK',
//         customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed } });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const propertyTypeOptions: MasterOption[] = masters['property type'] || [];
//   const propTypeList = propertyTypeOptions.length
//     ? propertyTypeOptions
//     : [
//         { value: 'Residential', label: 'Residential' },
//         { value: 'Commercial',  label: 'Commercial'  },
//         { value: 'Plot',        label: 'Plot'        },
//         { value: 'Villa',       label: 'Villa'       },
//       ] as any;

//   const contactCards = [
//     { icon: Phone,  title: 'Phone',        lines: ['+91 9637 00 9639', '+91 9146 00 9176'], sub: '24 / 7 Support' },
//     { icon: Mail,   title: 'Email',         lines: ['info@resaleexpert.in'],                sub: 'Quick Response' },
//     { icon: MapPin, title: 'Office',        lines: ['Shubhchandra, Nakhate Chowk', 'Rahatani, Pimpri-Chinchwad, Pune 411017'], sub: 'Maharashtra, India' },
//     { icon: Clock,  title: 'Working Hours', lines: ['Mon – Fri  10:00 AM – 8:00 PM', 'Sat – Sun   9:00 AM – 9:00 PM'], sub: 'Extended hours' },
//   ] as const;

//   const offices = [
//     { city: 'Pune', address: 'Shubhchandra, Rahatani, Pune – 411017', phone: '+91 9637 00 9639', email: 'pune@resaleexpert.in', lat: 18.6070, lng: 73.7919 },
//   ];

//   const faqs = [
//     { q: 'How quickly do you respond?',       a: 'Within 2–4 hours during business hours; within 24 hours on weekends.' },
//     { q: 'Is the initial consultation free?',  a: 'Yes, our initial consultation is completely free of charge.' },
//     { q: 'Which cities do you operate in?',    a: 'Currently Mumbai, Pune, Delhi, Bangalore, and Hyderabad – expanding soon.' },
//     { q: 'Can I schedule a property visit?',   a: 'Absolutely – via our website, app, or by calling our team directly.' },
//   ] as const;

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: BG }}>

//       {/* ── Hero ── */}
//       <section className="relative overflow-hidden py-24 pt-28"
//         style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a52 100%)` }}>
//         <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-[0.06]" style={{ background: BRAND }} />
//         <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-[0.06]" style={{ background: BRAND }} />
//         <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <span className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
//               style={{ background: `${BRAND}22`, color: BRAND, border: `1px solid ${BRAND}44` }}>
//               <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: BRAND }} />
//               Always Here to Help
//             </span>
//             <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
//               Get in <span style={{ color: BRAND }}>Touch</span>
//             </h1>
//             <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
//               Whether you want to buy, sell, or just explore — our expert team guides you at every step.
//             </p>
//             <div className="flex flex-wrap items-center justify-center gap-12">
//               {[['2 – 4 hrs', 'Response Time'], ['24 / 7', 'Support'], ['98 %', 'Satisfaction']].map(([v, l]) => (
//                 <div key={l} className="text-center">
//                   <div className="text-2xl font-bold mb-0.5" style={{ color: BRAND }}>{v}</div>
//                   <div className="text-sm text-blue-200">{l}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Form + Contact info ── */}
//       <section className="py-10">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

//             {/* ────────── LEFT: Form ────────── */}
//             <div className="lg:col-span-3">
//               <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: `1px solid ${BORDER}` }}>
//                 <div className="border-b px-7 pb-5 pt-6" style={{ borderColor: BORDER }}>
//                   <h2 className="text-xl font-bold text-gray-900">Send us a Message</h2>
//                   <p className="mt-1 text-sm text-gray-500">Fill out the form and our team will reach out shortly.</p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-5 px-7 py-6">

//                   {/* ── ROW 1: Salutation + Full Name ── */}
//                   <div className="grid grid-cols-4 gap-3">
//                     <div>
//                       <label className={labelCls}>Salutation</label>
//                       <select name="salutation" value={form.salutation} onChange={onChange}
//                         className={inputCls} style={{ borderColor: BORDER }}>
//                         {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map(s => <option key={s} value={s}>{s}</option>)}
//                       </select>
//                     </div>
//                     <div className="col-span-3">
//                       <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
//                       <input type="text" name="fullName" value={form.fullName} onChange={onChange}
//                         placeholder="e.g. Kamlesh Shah" required autoComplete="name"
//                         className={inputCls} style={{ borderColor: BORDER }} />
//                     </div>
//                   </div>

//                   {/* ── ROW 2: Email + Phone ── */}
//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                     <div>
//                       <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
//                       <input type="email" name="emailAddress" value={form.emailAddress} onChange={onChange}
//                         placeholder="you@example.com" required autoComplete="email"
//                         className={inputCls} style={{ borderColor: BORDER }} />
//                     </div>
//                     <div>
//                       <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
//                       <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={onChange}
//                         placeholder="+91 98765 43210" required autoComplete="tel"
//                         className={inputCls} style={{ borderColor: BORDER }} />
//                     </div>
//                   </div>

//                   {/* ── ROW 3: Purpose of Enquiry dropdown ── */}
//                   <div>
//                     <label className={labelCls}>Purpose of Enquiry <span className="text-red-500">*</span></label>
//                     <select name="enquiryType" value={form.enquiryType} onChange={onChange}
//                       className={inputCls} style={{ borderColor: BORDER }}>
//                       <option value="lead">🔍 General / New Enquiry</option>
//                       <option value="buyer">🏠 I want to Buy a Property</option>
//                       <option value="seller">🏷️ I want to Sell my Property</option>
//                     </select>

//                     {/* routing badge */}
//                     {(() => {
//                       const map: Record<EnquiryType, { label: string; color: string; bg: string; desc: string }> = {
//                         lead  : { label: 'General Enquiry', color: '#059669', bg: '#f0fdf4', desc: 'Saved to Leads' },
//                         buyer : { label: 'Buyer Lead',      color: '#2563eb', bg: '#eff6ff', desc: 'Saved to Buyers' },
//                         seller: { label: 'Seller Lead',     color: BRAND,     bg: '#FFF4EC', desc: 'Saved to Sellers' },
//                       };
//                       const r = map[form.enquiryType];
//                       return (
//                         <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium"
//                           style={{ background: r.bg, color: r.color, border: `1px solid ${r.color}30` }}>
//                           <span>✓</span>
//                           <span><strong>{r.label}</strong> — {r.desc}</span>
//                         </div>
//                       );
//                     })()}
//                   </div>

//                   {/* ══ BUYER conditional fields ══ */}
//                   {form.enquiryType === 'buyer' && (
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                       <div>
//                         <label className={labelCls}>Property Type</label>
//                         <select name="propertyType" value={form.propertyType} onChange={onChange}
//                           className={inputCls} style={{ borderColor: BORDER }}>
//                           <option value="">— Select —</option>
//                           {propTypeList.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
//                         </select>
//                       </div>
//                       <div>
//                         <label className={labelCls}>Budget Min (₹)</label>
//                         <input type="number" name="budgetMin" value={form.budgetMin} onChange={onChange}
//                           placeholder="e.g. 5000000" className={inputCls} style={{ borderColor: BORDER }} />
//                       </div>
//                       <div>
//                         <label className={labelCls}>Budget Max (₹)</label>
//                         <input type="number" name="budgetMax" value={form.budgetMax} onChange={onChange}
//                           placeholder="e.g. 10000000" className={inputCls} style={{ borderColor: BORDER }} />
//                       </div>
//                     </div>
//                   )}

//                   {/* ══ SELLER conditional fields ══ */}
//                   {form.enquiryType === 'seller' && (
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                       <div>
//                         <label className={labelCls}>Property Type</label>
//                         <select name="sellerPropType" value={form.sellerPropType} onChange={onChange}
//                           className={inputCls} style={{ borderColor: BORDER }}>
//                           <option value="">— Select —</option>
//                           {propTypeList.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
//                         </select>
//                       </div>
//                       <div>
//                         <label className={labelCls}>Expected Price (₹)</label>
//                         <input type="number" name="expectedPrice" value={form.expectedPrice} onChange={onChange}
//                           placeholder="e.g. 7500000" className={inputCls} style={{ borderColor: BORDER }} />
//                       </div>
//                       <div>
//                         <label className={labelCls}>Sell By Date</label>
//                         <input type="date" name="expectedClose" value={form.expectedClose} onChange={onChange}
//                           className={inputCls} style={{ borderColor: BORDER }} />
//                       </div>
//                     </div>
//                   )}

//                   {/* ── Message ── */}
//                   <div>
//                     <label className={labelCls}>Message <span className="text-red-500">*</span></label>
//                     <textarea name="messageBody" value={form.messageBody} onChange={onChange}
//                       rows={4} required
//                       placeholder="Describe your requirements in detail…"
//                       className="w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-orange-200"
//                       style={{ borderColor: BORDER }} />
//                   </div>

//                   {/* ── Submit ── */}
//                   <button type="submit" disabled={isSubmitting}
//                     className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-opacity disabled:opacity-50"
//                     style={{ background: BRAND }}>
//                     {isSubmitting
//                       ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Sending…</span></>
//                       : <><Send size={15} /><span>Send Message</span></>}
//                   </button>

//                 </form>
//               </div>
//             </div>

//             {/* ────────── RIGHT: Contact info ────────── */}
//             <div className="space-y-4 lg:col-span-2">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
//                 <p className="mt-1 text-sm text-gray-500">Multiple ways to reach us. Choose what works best.</p>
//               </div>

//               {contactCards.map((c, i) => {
//                 const Icon = c.icon as any;
//                 return (
//                   <div key={i} className="flex items-start gap-4 rounded-xl bg-white p-4 transition-shadow hover:shadow-md"
//                     style={{ border: `1px solid ${BORDER}` }}>
//                     <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
//                       style={{ background: `${BRAND}15`, color: BRAND }}>
//                       <Icon size={15} />
//                     </div>
//                     <div className="min-w-0">
//                       <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{c.title}</div>
//                       {c.lines.map((l, j) => <div key={j} className="text-sm font-medium text-gray-700">{l}</div>)}
//                       <div className="mt-0.5 text-[11px] text-gray-400">{c.sub}</div>
//                     </div>
//                   </div>
//                 );
//               })}

//               {/* CTA card */}
//               <div className="rounded-xl p-5 text-white"
//                 style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
//                 <div className="mb-0.5 text-sm font-semibold">Need Immediate Assistance?</div>
//                 <div className="mb-4 text-xs text-blue-200">Available around the clock for urgent queries.</div>
//                 <div className="flex gap-3">
//                   <button onClick={() => window.open('tel:+919637009639')}
//                     className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90"
//                     style={{ background: BRAND }}>
//                     <Phone size={13} /> Call Now
//                   </button>
//                   <button onClick={() => window.open('https://wa.me/919637009639', '_blank')}
//                     className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90"
//                     style={{ background: '#25D366' }}>
//                     <FaWhatsapp size={13} /> WhatsApp
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ── Office Locations ── */}
//       <section className="bg-white py-8">
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-7 text-center">
//             <h2 className="text-2xl font-bold text-gray-900">Our Office</h2>
//             <p className="mt-1 text-sm text-gray-500">Come visit us in Pune</p>
//           </div>
//           <div className="mx-auto max-w-sm">
//             {offices.map((o, i) => (
//               <div key={i} className="rounded-2xl p-6" style={{ background: BG, border: `1px solid ${BORDER}` }}>
//                 <div className="mb-4 flex items-center gap-3">
//                   <div className="rounded-xl p-2" style={{ background: `${BRAND}15`, color: BRAND }}>
//                     <Building size={15} />
//                   </div>
//                   <h3 className="font-bold text-gray-900">{o.city}</h3>
//                 </div>
//                 <div className="space-y-2 text-sm text-gray-600">
//                   <div className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0 text-gray-400" /><span>{o.address}</span></div>
//                   <div className="flex items-center gap-2"><Phone size={13} className="flex-shrink-0 text-gray-400" /><span>{o.phone}</span></div>
//                   <div className="flex items-center gap-2"><Mail  size={13} className="flex-shrink-0 text-gray-400" /><span>{o.email}</span></div>
//                 </div>
//                 <button onClick={() => openMaps({ lat: o.lat, lng: o.lng })}
//                   className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90"
//                   style={{ background: BRAND }}>
//                   Get Directions
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FAQ ── */}
//       <section className="py-8" style={{ background: BG }}>
//         <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
//           <div className="mb-7 text-center">
//             <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
//             <p className="mt-1 text-sm text-gray-500">Quick answers to common queries</p>
//           </div>
//           <div className="space-y-2">
//             {faqs.map((f, i) => {
//               const open = openFaq === i;
//               return (
//                 <div key={i} className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${BORDER}` }}>
//                   <button type="button" onClick={() => setOpenFaq(open ? null : i)}
//                     className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
//                     <span className="text-sm font-semibold text-gray-900">{f.q}</span>
//                     <ChevronDown size={15} className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
//                   </button>
//                   <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
//                     <div className="overflow-hidden">
//                       <div className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{f.a}</div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* ── Social / Emergency ── */}
//       <section className="py-8" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="mb-2 text-xl font-bold text-white">Stay Connected</h2>
//           <p className="mb-6 text-sm text-blue-200">Follow us for the latest listings, news, and real estate tips</p>
//           <div className="mb-8 flex items-center justify-center gap-4">
//             {[
//               { Icon: Facebook,  href: 'https://www.facebook.com/resaleexpert.i' },
//               { Icon: Twitter,   href: 'https://twitter.com/resaleexpertin' },
//               { Icon: Instagram, href: 'https://www.instagram.com/resaleexpert.in/' },
//               { Icon: Linkedin,  href: 'https://www.linkedin.com/company/resaleexpertin/' },
//             ].map(({ Icon, href }, i) => (
//               <a key={i} href={href} target="_blank" rel="noopener noreferrer"
//                 className="rounded-xl p-3 transition-colors hover:bg-white/20"
//                 style={{ background: 'rgba(255,255,255,0.1)' }}>
//                 <Icon size={17} className="text-white" />
//               </a>
//             ))}
//           </div>
//           <div className="inline-block rounded-2xl px-8 py-6"
//             style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
//             <h3 className="mb-1 text-base font-bold text-white">Emergency Contact</h3>
//             <p className="mb-4 text-xs text-blue-200">Urgent assistance outside business hours</p>
//             <div className="flex flex-col items-center gap-3 text-sm text-white sm:flex-row sm:gap-8">
//               <div className="flex items-center gap-2"><Phone size={13} /><span>+91 9146 00 9176</span></div>
//               <div className="flex items-center gap-2"><Mail  size={13} /><span>urgent@resaleexpert.in</span></div>
//             </div>
//           </div>
//         </div>
//       </section>

//     </div>
//   );
// };

// export default ContactUsPage;



// src/pages/ContactUsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Phone, Mail, MapPin, Clock, Send, Building,
  ChevronDown, Facebook, Twitter, Instagram, Linkedin,
} from 'lucide-react';
import { getMasterDropdownOptions, type MasterOption } from '@/lib/useMasterData';
import { leadsAPI } from '@/lib/api';
import { buyerAPI }  from '@/lib/buyerAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import { FaWhatsapp } from 'react-icons/fa';
import Swal from 'sweetalert2';

type EnquiryType = 'lead' | 'buyer' | 'seller';

interface FormData {
  enquiryType    : EnquiryType;
  salutation     : string;
  fullName       : string;
  emailAddress   : string;
  phoneNumber    : string;
  messageBody    : string;
  // Location fields (common for all)
  city           : string;
  state          : string;
  location       : string;   // area / locality
  // buyer extras
  propertyType   : string;
  budgetMin      : string;
  budgetMax      : string;
  // seller extras
  sellerPropType : string;
  expectedPrice  : string;
  expectedClose  : string;
}

const BRAND  = '#E6761D';
const NAVY   = '#0f2b3d';
const BG     = '#f8f9fa';
const BORDER = '#e4e7eb';

const btnOk  = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E6761D]';
const btnRed = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600';
const btnGrn = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600';

const swal = (opts: object) =>
  Swal.fire({ width: '380px', padding: '1.2rem', buttonsStyling: false,
    customClass: { popup: 'rounded-xl shadow-xl' }, ...opts });

const openMaps = (v: string | { lat: number; lng: number }) => {
  const url = typeof v === 'object'
    ? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v)}&travelmode=driving`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const inputCls = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-orange-200 bg-white';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

const EMPTY: FormData = {
  enquiryType   : 'lead',
  salutation    : 'Mr.',
  fullName      : '',
  emailAddress  : '',
  phoneNumber   : '',
  messageBody   : '',
  city          : '',
  state         : '',
  location      : '',
  propertyType  : '',
  budgetMin     : '',
  budgetMax     : '',
  sellerPropType: '',
  expectedPrice : '',
  expectedClose : '',
};

const ContactUsPage: React.FC = () => {
  const [form,         setForm]         = useState<FormData>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterLoading,setMasterLoading]= useState(true);
  const [masters,      setMasters]      = useState<Record<string, MasterOption[]>>({});
  const [openFaq,      setOpenFaq]      = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
        setMasters(data || {});
      } catch { /* silent */ } finally { setMasterLoading(false); }
    })();
  }, []);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(e.target.name as keyof FormData, e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Required fields validation
    if (!form.fullName.trim() || !form.emailAddress.trim() || !form.phoneNumber.trim() || !form.messageBody.trim()) {
      await swal({ title: 'Missing Fields', text: 'Please fill all required fields.', icon: 'error',
        confirmButtonText: 'OK', customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed } });
      return;
    }
    setIsSubmitting(true);
    try {
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
      const commonPayload = {
        salutation: form.salutation,
        name: form.fullName.trim(),
        phone: form.phoneNumber.trim().replace(/\D/g, ''),
        email: form.emailAddress.trim().toLowerCase(),
        city: form.city.trim(),
        state: form.state.trim(),
        location: form.location.trim(),
        notes: form.messageBody.trim(),
        guest_id: guestId,
      };

      if (form.enquiryType === 'buyer') {
        await buyerAPI.create({
          ...commonPayload,
          buyer_lead_source  : 'Website',
          buyer_lead_status  : 'new',
          buyer_lead_stage   : 'initial_contact',
          buyer_lead_priority: 'medium',
          budget_min         : form.budgetMin  ? Number(form.budgetMin)  : null,
          budget_max         : form.budgetMax  ? Number(form.budgetMax)  : null,
          requirements       : JSON.stringify({ propertyType: form.propertyType || null }),
        });
      } else if (form.enquiryType === 'seller') {
        await sellerAPI.create({
          ...commonPayload,
          source        : 'Website',
          stage         : 'initial_contact',
          status        : 'new',
          priority      : 'medium',
          leadType      : form.sellerPropType  || null,
          deal_value    : form.expectedPrice   ? Number(form.expectedPrice) : null,
          expected_close: form.expectedClose   || null,
        });
      } else {
        // General enquiry → client_leads table
        await leadsAPI.createLead({
          salutation        : form.salutation,
          name              : form.fullName.trim(),
          phone             : form.phoneNumber.trim().replace(/\D/g, ''),
          email             : form.emailAddress.trim().toLowerCase(),
          lead_source       : 'Website',
          lead_type         : 'General Enquiry',
          status            : 'new',
          priority          : 'medium',
          whatsapp_number   : form.phoneNumber.trim().replace(/\D/g, '') || null,
          notes             : form.messageBody.trim(),
          guest_id          : guestId,
          // 👇 Location fields – convert empty strings to null
          state             : form.state.trim() || null,
          city              : form.city.trim() || null,
          location          : form.location.trim() || null,
          assigned_executive: null,
        });
      }

      await swal({
        title: 'Submitted!', text: 'Thank you! We will get back to you within 24 hours.',
        icon: 'success', timer: 3000, timerProgressBar: true, showConfirmButton: false,
        customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnGrn },
      });
      setForm(EMPTY);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send. Please try again.';
      await swal({ title: 'Error', text: msg, icon: 'error', confirmButtonText: 'OK',
        customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed } });
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypeOptions: MasterOption[] = masters['property type'] || [];
  const propTypeList = propertyTypeOptions.length
    ? propertyTypeOptions
    : [
        { value: 'Residential', label: 'Residential' },
        { value: 'Commercial',  label: 'Commercial'  },
        { value: 'Plot',        label: 'Plot'        },
        { value: 'Villa',       label: 'Villa'       },
      ] as any;

  const contactCards = [
    { icon: Phone,  title: 'Phone',        lines: ['+91 9637 00 9639', '+91 9146 00 9176'], sub: '24 / 7 Support' },
    { icon: Mail,   title: 'Email',         lines: ['info@resaleexpert.in'],                sub: 'Quick Response' },
    { icon: MapPin, title: 'Office',        lines: ['Shubhchandra, Nakhate Chowk', 'Rahatani, Pimpri-Chinchwad, Pune 411017'], sub: 'Maharashtra, India' },
    { icon: Clock,  title: 'Working Hours', lines: ['Mon – Fri  10:00 AM – 8:00 PM', 'Sat – Sun   9:00 AM – 9:00 PM'], sub: 'Extended hours' },
  ] as const;

  const offices = [
    { city: 'Pune', address: 'Shubhchandra, Rahatani, Pune – 411017', phone: '+91 9637 00 9639', email: 'pune@resaleexpert.in', lat: 18.6070, lng: 73.7919 },
  ];

  const faqs = [
    { q: 'How quickly do you respond?',       a: 'Within 2–4 hours during business hours; within 24 hours on weekends.' },
    { q: 'Is the initial consultation free?',  a: 'Yes, our initial consultation is completely free of charge.' },
    { q: 'Which cities do you operate in?',    a: 'Currently Mumbai, Pune, Delhi, Bangalore, and Hyderabad – expanding soon.' },
    { q: 'Can I schedule a property visit?',   a: 'Absolutely – via our website, app, or by calling our team directly.' },
  ] as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>

      {/* ── Hero ── */}
        <section className="py-28 pt-28" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center">
             <h2 className="text-3xl font-bold mb-3 text-white">Get in Touch</h2>
             <p className="text-lg mb-2 text-blue-100 max-w-3xl mx-auto">
               Ready to find your dream property or sell your current one? Our expert team is here to help you every step
               of the way.
             </p>
             <div className="flex items-center justify-center space-x-8 mt-6">
               <div className="text-center">
                 <div className="text-xl font-bold mb-2 text-white">2-4 Hours</div>
                 <div className="text-blue-200">Response Time</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold mb-2 text-white">24/7</div>
                 <div className="text-blue-200">Support Available</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold mb-2 text-white">98%</div>
                 <div className="text-blue-200">Satisfaction Rate</div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* ── Form + Contact info ── */}
   <section className="py-6">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

      {/* ────────── LEFT: Form ────────── */}
      <div className="lg:col-span-3">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm" style={{ border: `1px solid ${BORDER}` }}>
          <div className="border-b px-5 pb-3 pt-4" style={{ borderColor: BORDER }}>
            <h2 className="text-lg font-bold text-gray-900">Send us a Message</h2>
            <p className="mt-0.5 text-xs text-gray-500">Fill out the form and our team will reach out shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">

            {/* ── ROW 1: Salutation + Full Name + Phone ── */}
            <div className="grid grid-cols-5 gap-2">
              <div>
                <label className={labelCls + " text-xs"}>Salutation</label>
                <select name="salutation" value={form.salutation} onChange={onChange}
                  className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                  {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls + " text-xs"}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" value={form.fullName} onChange={onChange}
                  placeholder="e.g. Rahul Sharma" required autoComplete="name"
                  className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
              </div>
              <div className="col-span-2">
                <label className={labelCls + " text-xs"}>Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={onChange}  maxLength={10}
                  placeholder="+91 98765 43210" required autoComplete="tel"
                  className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
              </div>
            </div>

            {/* ── ROW 2: Email + Purpose of Enquiry ── */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls + " text-xs"}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="emailAddress" value={form.emailAddress} onChange={onChange}
                  placeholder="you@example.com" required autoComplete="email"
                  className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
              </div>
              <div>
                <label className={labelCls + " text-xs"}>Purpose of Enquiry <span className="text-red-500">*</span></label>
                <select name="enquiryType" value={form.enquiryType} onChange={onChange}
                  className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                  <option value="lead">General / New Enquiry</option>
                  <option value="buyer">I want to Buy a Property</option>
                  <option value="seller">I want to Sell my Property</option>
                </select>
              </div>
            </div>

            {/* ── ROW 3: City + State + Location (All in one row) ── */}
            <div className="space-y-2 border-t border-dashed pt-3" style={{ borderColor: BORDER }}>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Property Location (Optional)</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className={labelCls + " text-xs"}>City</label>
                  <input type="text" name="city" value={form.city} onChange={onChange}
                    placeholder="e.g. Pune" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className={labelCls + " text-xs"}>State</label>
                  <input type="text" name="state" value={form.state} onChange={onChange}
                    placeholder="e.g. Maharashtra" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className={labelCls + " text-xs"}>Area / Locality</label>
                  <input type="text" name="location" value={form.location} onChange={onChange}
                    placeholder="e.g. Wakad, Hinjewadi" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                </div>
              </div>
            </div>

            {/* ══ BUYER conditional fields ══ */}
            {form.enquiryType === 'buyer' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelCls + " text-xs"}>Property Type</label>
                  <select name="propertyType" value={form.propertyType} onChange={onChange}
                    className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                    <option value="">— Select —</option>
                    {propTypeList.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls + " text-xs"}>Budget Min (₹)</label>
                  <input type="text" inputMode="numeric" name="budgetMin" value={form.budgetMin} onChange={onChange}
                    placeholder="e.g. 50,00,000" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                </div>
                <div>
                  <label className={labelCls + " text-xs"}>Budget Max (₹)</label>
                  <input type="text" inputMode="numeric" name="budgetMax" value={form.budgetMax} onChange={onChange}
                    placeholder="e.g. 1,00,00,000" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                </div>
              </div>
            )}

            {/* ══ SELLER conditional fields ══ */}
            {form.enquiryType === 'seller' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls + " text-xs"}>Property Type</label>
                  <select name="sellerPropType" value={form.sellerPropType} onChange={onChange}
                    className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                    <option value="">— Select —</option>
                    {propTypeList.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls + " text-xs"}>Selling Price (₹)</label>
                  <input type="text" inputMode="numeric" name="expectedPrice" value={form.expectedPrice} onChange={onChange}
                    placeholder="e.g. 75,00,000" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                </div>
              </div>
            )}

            {/* ── Message ── */}
            <div>
              <label className={labelCls + " text-xs"}>Message <span className="text-red-500">*</span></label>
              <textarea name="messageBody" value={form.messageBody} onChange={onChange}
                rows={3} required
                placeholder="Describe your requirements in detail…"
                className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-orange-200"
                style={{ borderColor: BORDER }} />
            </div>

            {/* ── Submit ── */}
            <button type="submit" disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: BRAND }}>
              {isSubmitting
                ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Sending…</span></>
                : <><Send size={14} /><span>Send Message</span></>}
            </button>

          </form>
        </div>
      </div>

      {/* ────────── RIGHT: Contact info ────────── */}
      <div className="space-y-3 lg:col-span-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
          <p className="mt-0.5 text-xs text-gray-500">Multiple ways to reach us.</p>
        </div>

        {contactCards.map((c, i) => {
          const Icon = c.icon as any;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-white p-3 transition-shadow hover:shadow-md"
              style={{ border: `1px solid ${BORDER}` }}>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${BRAND}15`, color: BRAND }}>
                <Icon size={13} />
              </div>
              <div className="min-w-0">
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">{c.title}</div>
                {c.lines.map((l, j) => <div key={j} className="text-xs font-medium text-gray-700">{l}</div>)}
                <div className="mt-0.5 text-[10px] text-gray-400">{c.sub}</div>
              </div>
            </div>
          );
        })}

        {/* CTA card */}
        <div className="rounded-lg p-4 text-white"
          style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
          <div className="mb-0.5 text-sm font-semibold">Need Immediate Assistance?</div>
          <div className="mb-3 text-[10px] text-blue-200">Available around the clock.</div>
          <div className="flex gap-2">
            <button onClick={() => window.open('tel:+919637009639')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white hover:opacity-90"
              style={{ background: BRAND }}>
              <Phone size={12} /> Call Now
            </button>
            <button onClick={() => window.open('https://wa.me/919637009639', '_blank')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white hover:opacity-90"
              style={{ background: '#25D366' }}>
              <FaWhatsapp size={12} /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ── Office Locations ── */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Our Office</h2>
            <p className="mt-1 text-sm text-gray-500">Come visit us in Pune</p>
          </div>
          <div className="mx-auto max-w-sm">
            {offices.map((o, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl p-2" style={{ background: `${BRAND}15`, color: BRAND }}>
                    <Building size={15} />
                  </div>
                  <h3 className="font-bold text-gray-900">{o.city}</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0 text-gray-400" /><span>{o.address}</span></div>
                  <div className="flex items-center gap-2"><Phone size={13} className="flex-shrink-0 text-gray-400" /><span>{o.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail  size={13} className="flex-shrink-0 text-gray-400" /><span>{o.email}</span></div>
                </div>
                <button onClick={() => openMaps({ lat: o.lat, lng: o.lng })}
                  className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: BRAND }}>
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-8" style={{ background: BG }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-1 text-sm text-gray-500">Quick answers to common queries</p>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${BORDER}` }}>
                  <button type="button" onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="text-sm font-semibold text-gray-900">{f.q}</span>
                    <ChevronDown size={15} className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="px-5 pb-4 text-sm leading-relaxed text-gray-600">{f.a}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social / Emergency ── */}
      <section className="py-8" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">Stay Connected</h2>
          <p className="mb-6 text-sm text-blue-200">Follow us for the latest listings, news, and real estate tips</p>
          <div className="mb-8 flex items-center justify-center gap-4">
            {[
              { Icon: Facebook,  href: 'https://www.facebook.com/resaleexpert.i' },
              { Icon: Twitter,   href: 'https://twitter.com/resaleexpertin' },
              { Icon: Instagram, href: 'https://www.instagram.com/resaleexpert.in/' },
              { Icon: Linkedin,  href: 'https://www.linkedin.com/company/resaleexpertin/' },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                className="rounded-xl p-3 transition-colors hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Icon size={17} className="text-white" />
              </a>
            ))}
          </div>
          <div className="inline-block rounded-2xl px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h3 className="mb-1 text-base font-bold text-white">Emergency Contact</h3>
            <p className="mb-4 text-xs text-blue-200">Urgent assistance outside business hours</p>
            <div className="flex flex-col items-center gap-3 text-sm text-white sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2"><Phone size={13} /><span>+91 9146 00 9176</span></div>
              <div className="flex items-center gap-2"><Mail  size={13} /><span>urgent@resaleexpert.in</span></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUsPage;