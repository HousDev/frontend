// // src/pages/settings/IntegrationsPage.tsx
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   ArrowLeft,
//   Zap,
//   Settings,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
//   Eye,
//   EyeOff,
//   Mail,
//   MessageSquare,
//   DollarSign,
//   BarChart3,
//   Calendar,
//   Globe,
//   Link as LinkIcon,
//   Copy,
// } from 'lucide-react';

// import { useAuth } from '@/contexts/AuthContext';
// import Button from '@/components/ui/Button';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';

// import SMSConfigurationModal from './SettingsModals/SMSConfigurationModal';
// import RazorpayConfigurationModal from './SettingsModals/RazorpayConfigurationModal';
// import StripeConfigurationModal from './SettingsModals/StripeConfigurationModal';
// import EmailConfigurationModal from './SettingsModals/EmailConfiguration';

// import { toast } from 'react-toastify';
// import { smsIntegrationAPI } from '@/lib/smsIntegrationAPI';
// import { razorpayIntegrationAPI } from '@/lib/razorpayIntegrationAPI';
// import { stripeIntegrationAPI } from '@/lib/stripeIntegrationAPI';
// import { emailIntegrationAPI } from '@/lib/emailIntegrationAPI';
// import ChatGPTConfigurationModal from './SettingsModals/ChatGPTConfigurationModal';
// import WhatsAppConfigurationModal from './SettingsModals/WhatsAppConfigurationModal'; // ✅ ADDED

// type SyncStatus = 'success' | 'error' | 'pending' | 'never';

// interface Integration {
//   id: string;
//   name: string;
//   description: string;
//   category:
//   | 'email'
//   | 'communication'
//   | 'payment'
//   | 'analytics'
//   | 'scheduling'
//   | 'automation'
//   | 'ai'
//   | string;
//   provider: string;
//   is_enabled: boolean;
//   is_connected: boolean;
//   config: Record<string, any>;
//   last_sync?: string | null;
//   sync_status: SyncStatus;
//   webhook_url?: string | null;
//   api_key?: string | null;
//   instructions?: string | null;
// }

// const IntegrationsPage: React.FC = () => {
//   const { user } = useAuth();
//   const [integrations, setIntegrations] = useState<Integration[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeCategory, setActiveCategory] = useState<string>('all');
//   const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

//   // Modals
//   const [smsModalOpen, setSmsModalOpen] = useState(false);
//   const [smsIntegration, setSmsIntegration] = useState<Integration | null>(null);

//   const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
//   const [razorpayIntegration, setRazorpayIntegration] = useState<Integration | null>(null);

//   const [stripeModalOpen, setStripeModalOpen] = useState(false);
//   const [stripeIntegration, setStripeIntegration] = useState<Integration | null>(null);

//   const [emailModalOpen, setEmailModalOpen] = useState(false);
//   const [emailIntegration, setEmailIntegration] = useState<Integration | null>(null);

//   const [chatgptModalOpen, setChatgptModalOpen] = useState(false);
//   const [chatgptIntegration, setChatgptIntegration] = useState<Integration | null>(null);

//   const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
//   const [whatsappIntegration, setWhatsappIntegration] = useState<Integration | null>(null);

//   useEffect(() => {
//     fetchIntegrations();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /** Extracts the meaningful payload regardless of nesting */
//   const extract = (raw: any) => {
//     if (!raw) return null;
//     const a = raw?.data;
//     if (a?.success && a?.data) return a.data;
//     if (a?.data) return a.data;
//     if (a) return a;
//     if (raw?.success && raw?.data) return raw.data;
//     return raw;
//   };

//   const fetchIntegrations = async () => {
//     try {
//       setLoading(true);

//       // ---- SMS
//       let smsData: any = null;
//       try {
//         const resp = await smsIntegrationAPI.getIntegration();
//         smsData = extract(resp);
//       } catch (e: any) {
//         if (e?.response?.status !== 404) console.error('SMS fetch error', e);
//       }

//       // ---- Razorpay
//       let razorpayData: any = null;
//       try {
//         const resp = await razorpayIntegrationAPI.getIntegration();
//         const data = extract(resp);
//         razorpayData = data?.success && data?.data ? data.data : data;
//       } catch (e: any) {
//         if (e?.response?.status !== 404) console.error('Razorpay fetch error', e);
//       }

//       // ---- Stripe
//       let stripeData: any = null;
//       try {
//         if (stripeIntegrationAPI?.getIntegration) {
//           const resp = await stripeIntegrationAPI.getIntegration();
//           stripeData = extract(resp);
//         }
//       } catch (e) {
//         console.info('Stripe fetch skipped/failed', e);
//       }

//       // ---- Email (SMTP)
//       let emailData: any = null;
//       try {
//         const resp = await emailIntegrationAPI.getIntegration();
//         emailData = extract(resp);
//       } catch (e: any) {
//         if (e?.response?.status !== 404) console.error('Email fetch error', e);
//       }

//       const emailIntegrationRow: Integration = {
//         id: String(emailData?.id ?? 'email-smtp'),
//         name: (emailData?.provider || emailData?.config?.smtp_provider || 'SMTP')
//           .toString()
//           .toUpperCase(),
//         description: 'Send and receive emails via SMTP (Gmail/Zoho/SES/Mailgun).',
//         category: 'email',
//         provider: (emailData?.provider && emailData?.provider.toString()) || 'SMTP',
//         is_enabled: Boolean(emailData?.is_active === 1 || emailData?.is_active === true),
//         is_connected: Boolean(
//           (emailData?.username || emailData?.config?.username) &&
//           (emailData?.password || emailData?.config?.password) &&
//           (emailData?.host || emailData?.config?.host) &&
//           (emailData?.port || emailData?.config?.port)
//         ),
//         config: {
//           driver: emailData?.driver ?? 'SMTP',
//           smtp_provider:
//             (emailData?.config?.smtp_provider || emailData?.provider || 'SMTP')
//               .toString()
//               .toUpperCase(),
//           host: emailData?.config?.host ?? emailData?.host ?? '',
//           port: emailData?.config?.port ?? emailData?.port ?? '',
//           security: emailData?.config?.security ?? emailData?.security ?? 'STARTTLS',
//           username: emailData?.config?.username ?? emailData?.username ?? '',
//           password: emailData?.config?.password ?? emailData?.password ?? '',
//           from_address: emailData?.config?.from_address ?? emailData?.from_address ?? '',
//           from_name: emailData?.config?.from_name ?? emailData?.from_name ?? '',
//         },
//         last_sync: emailData?.updated_at ?? null,
//         sync_status: emailData ? 'success' : 'never',
//         instructions: emailData
//           ? 'SMTP configured. You can update From name/address.'
//           : 'Save SMTP settings to enable email sending.',
//       };

//       const smsIntegrationRow: Integration = {
//         id: 'sms-default',
//         name: 'SMS Integration',
//         description: 'Send SMS messages through your configured provider.',
//         category: 'communication',
//         provider: smsData?.provider || 'SMS',
//         is_enabled: Boolean(smsData?.is_active === 1 || smsData?.is_active === true),
//         is_connected: Boolean(smsData?.token),
//         config: {
//           sms_provider: smsData?.provider || null,
//           from_number: smsData?.sms_number || null,
//           sender_name: smsData?.sms_from || null,
//           token: smsData?.token ?? null,
//         },
//         last_sync: smsData?.updated_at ?? null,
//         sync_status: smsData?.token ? 'success' : 'never',
//         api_key: smsData?.api_key ?? null,
//         instructions: 'Configure your SMS provider to send notifications and alerts.',
//         webhook_url: smsData?.webhook_url ?? null,
//       };

//       // ---- WhatsApp Business (placeholder)
//       const whatsappBusinessRow: Integration = {
//         id: 'whatsapp-business',
//         name: 'WhatsApp Business',
//         description: 'WhatsApp messaging for customer communication.',
//         category: 'communication',
//         provider: 'Meta',
//         is_enabled: false,
//         is_connected: false,
//         config: {},
//         last_sync: null,
//         sync_status: 'never',
//         webhook_url: null,
//         instructions: 'Connect Meta WhatsApp Cloud API to enable WhatsApp messaging.',
//       };

//       const razorpayRow: Integration = {
//         id: 'razorpay',
//         name: 'Razorpay',
//         description:
//           'Razorpay payment gateway for India — payments, subscriptions and webhooks.',
//         category: 'payment',
//         provider: 'Razorpay',
//         is_enabled: Boolean(razorpayData?.is_active === 1 || razorpayData?.is_active === true),
//         is_connected: Boolean(razorpayData?.key_id),
//         config: {
//           currency: razorpayData?.currency || 'INR',
//           mode: razorpayData?.mode || 'test',
//           key_id: razorpayData?.key_id ? String(razorpayData.key_id) : '',
//           key_secret: razorpayData?.key_secret ?? null,
//           webhook_secret: razorpayData?.webhook_secret ?? null,
//           webhook_url: razorpayData?.webhook_url ?? null,
//         },
//         last_sync: razorpayData?.updated_at ?? null,
//         sync_status: razorpayData?.key_id ? 'success' : 'never',
//         api_key: razorpayData?.key_id ?? null,
//         webhook_url: razorpayData?.webhook_url ?? null,
//         instructions:
//           'Set Key ID/Secret & Webhook secret on server. Use backend to create orders and verify signatures.',
//       };

//       const stripeRow: Integration = {
//         id: 'stripe',
//         name: 'Stripe',
//         description: 'Stripe payment gateway — global payments, billing & webhooks.',
//         category: 'payment',
//         provider: 'Stripe',
//         is_enabled: Boolean(stripeData?.is_active === 1 || stripeData?.is_active === true),
//         is_connected: Boolean(stripeData?.publishable_key),
//         config: {
//           currency: stripeData?.currency || 'INR',
//           mode: stripeData?.mode || 'test',
//           publishable_key: stripeData?.publishable_key ?? '',
//           secret_key: stripeData?.secret_key ?? null,
//           webhook_secret: stripeData?.webhook_secret ?? null,
//           webhook_url: stripeData?.webhook_url ?? null,
//         },
//         last_sync: stripeData?.updated_at ?? null,
//         sync_status: stripeData?.publishable_key ? 'success' : 'never',
//         api_key: stripeData?.publishable_key ?? null,
//         webhook_url: stripeData?.webhook_url ?? null,
//         instructions: 'Provide publishable & secret keys. Verify webhooks on the server.',
//       };

//       const placeholders: Integration[] = [
//         {
//           id: 'email-outlook',
//           name: 'Outlook',
//           description: 'Microsoft Outlook email integration (SMTP).',
//           category: 'email',
//           provider: 'Microsoft',
//           is_enabled: false,
//           is_connected: false,
//           config: {},
//           sync_status: 'never',
//           instructions: 'Add your Outlook SMTP to use this.',
//         },
//         {
//           id: 'ga',
//           name: 'Google Analytics',
//           description: 'Website analytics and tracking.',
//           category: 'analytics',
//           provider: 'Google',
//           is_enabled: false,
//           is_connected: false,
//           config: {},
//           sync_status: 'never',
//           instructions: 'Connect Google Analytics to track website performance.',
//         },
//         {
//           id: 'calendly',
//           name: 'Calendly',
//           description: 'Schedule meetings and appointments.',
//           category: 'scheduling',
//           provider: 'Calendly',
//           is_enabled: false,
//           is_connected: false,
//           config: {},
//           sync_status: 'never',
//           webhook_url: 'https://your-domain.com/webhooks/calendly',
//           instructions: 'Integrate Calendly for automated appointment scheduling.',
//         },
//         {
//           id: 'zapier',
//           name: 'Zapier',
//           description: 'Connect with 5000+ apps through Zapier.',
//           category: 'automation',
//           provider: 'Zapier',
//           is_enabled: false,
//           is_connected: false,
//           config: {},
//           sync_status: 'never',
//           webhook_url: 'https://your-domain.com/webhooks/zapier',
//           instructions: 'Use Zapier to connect with third-party applications.',
//         },
//         {
//           id: 'chatgpt',
//           name: 'ChatGPT',
//           description: 'Use OpenAI to generate text and automate workflows.',
//           category: 'ai',
//           provider: 'OpenAI',
//           is_enabled: false,
//           is_connected: false,
//           config: {
//             model: 'gpt-4o-mini',
//             system_prompt: 'You are a helpful assistant for customer support.',
//             max_tokens: 1024,
//             temperature: 0.7,
//             token: null,
//           },
//           last_sync: null,
//           sync_status: 'never',
//           api_key: null,
//           webhook_url: 'https://your-domain.com/webhooks/chatgpt',
//           instructions:
//             'Add your OpenAI API key on the server (do NOT store keys in the frontend).',
//         },
//       ];

//       setIntegrations([
//         emailIntegrationRow,
//         smsIntegrationRow,
//         whatsappBusinessRow,
//         razorpayRow,
//         stripeRow,
//         ...placeholders,
//       ]);
//     } catch (err) {
//       console.error('Error fetching integrations:', err);
//       toast.error('Failed to load integrations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle using provider-specific APIs with correct payloads
//   const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
//     // optimistic update
//     setIntegrations((prev) =>
//       prev.map((i) => (i.id === integrationId ? { ...i, is_enabled: enabled } : i))
//     );

//     try {
//       const integration = integrations.find((i) => i.id === integrationId);
//       if (!integration) throw new Error('Integration not found');

//       let resp: any = null;

//       if (integration.id === 'razorpay' || integration.provider === 'Razorpay') {
//         resp = await razorpayIntegrationAPI.toggleIntegration?.({ active: enabled });
//       } else if (integration.id === 'stripe' || integration.provider === 'Stripe') {
//         resp = await stripeIntegrationAPI.toggleIntegration?.({ active: enabled });
//       } else if (integration.category === 'email') {
//         resp = await emailIntegrationAPI.toggleIntegration?.({ id: integrationId, enabled });
//       } else if (
//         integration.category === 'communication' ||
//         integration.id === 'sms-default' ||
//         integration.id === 'whatsapp-business'
//       ) {
//         // resp = await smsIntegrationAPI.toggleIntegration?.({ active: enabled });
//       } else if (integration.id === 'chatgpt' || integration.category === 'ai' || integration.provider === 'OpenAI') {
//         // Placeholder: wire to your backend when ready
//         // resp = await chatgptIntegrationAPI.toggleIntegration?.({ active: enabled });
//         toast.success(`ChatGPT ${enabled ? 'enabled' : 'disabled'}`);
//       } else {
//         // Fallback for unknowns
//         toast.info('Toggle saved locally. Wire up a backend API for this provider.');
//       }

//       toast.success(`Integration ${enabled ? 'enabled' : 'disabled'} successfully`);
//     } catch (error: any) {
//       setIntegrations((prev) =>
//         prev.map((i) => (i.id === integrationId ? { ...i, is_enabled: !enabled } : i))
//       );
//       console.error('Toggle error:', error?.response?.data || error);
//       toast.error(error?.response?.data?.message || 'Failed to update integration');
//     }
//   };

//   const handleConfigure = (integrationId: string) => {
//     const i = integrations.find((x) => x.id === integrationId);
//     if (!i) return;

//     if (i.category === 'communication' && (i.id === 'sms-default' || i.name.includes('SMS'))) {
//       setSmsIntegration(i);
//       setSmsModalOpen(true);
//       return;
//     }
//     if (i.id === 'razorpay' || i.provider === 'Razorpay') {
//       setRazorpayIntegration(i);
//       setRazorpayModalOpen(true);
//       return;
//     }
//     if (i.id === 'stripe' || i.provider === 'Stripe') {
//       setStripeIntegration(i);
//       setStripeModalOpen(true);
//       return;
//     }
//     if (i.category === 'email') {
//       setEmailIntegration(i);
//       setEmailModalOpen(true);
//       return;
//     }
//     // ✅ WhatsApp Business (Meta)
//     if (i.id === 'whatsapp-business' || i.provider === 'Meta') {
//       setWhatsappIntegration(i);
//       setWhatsappModalOpen(true);
//       return;
//     }
//     // ✅ ChatGPT / OpenAI
//     if (i.id === 'chatgpt' || i.category === 'ai' || i.provider === 'OpenAI') {
//       setChatgptIntegration(i);
//       setChatgptModalOpen(true);
//       return;
//     }

//     toast.info('No configuration UI for this integration yet.');
//   };

//   // ---- Save handlers
//   const handleSaveSMSConfiguration = async (formData: any) => {
//     try {
//       const payload = {
//         provider: formData.provider,
//         apiKey: formData.apiKey,
//         token: formData.token,
//         smsNumber: formData.smsNumber,
//         smsFrom: formData.smsFrom,
//         createdBy: user?.id || 1,
//       };
//       const resp = await smsIntegrationAPI.saveIntegration(payload);
    
//       await fetchIntegrations();
//       toast.success('SMS configuration saved successfully');
//       setSmsModalOpen(false);
//       setSmsIntegration(null);
//     } catch (e: any) {
//       console.error('SMS save error', e?.response?.data || e);
//       toast.error(e?.response?.data?.message || 'Failed to save SMS configuration');
//     }
//   };

//   const handleSaveRazorpayConfiguration = async (data: {
//     keyId: string;
//     keySecret?: string | null;
//     webhookSecret?: string | null;
//     webhookUrl?: string | null;
//     isActive?: boolean;
//   }) => {
//     try {
//       const payload = {
//         provider: 'Razorpay',
//         key_id: data.keyId,
//         key_secret: data.keySecret ?? null,
//         webhook_secret: data.webhookSecret ?? null,
//         webhook_url: data.webhookUrl ?? null,
//         is_active: data.isActive ? 1 : 0,
//         updatedBy: user?.id || 1,
//       };
//       const resp = await razorpayIntegrationAPI.saveIntegration(payload as any);
    
//       await fetchIntegrations();
//       toast.success('Razorpay configuration saved successfully');
//       setRazorpayModalOpen(false);
//       setRazorpayIntegration(null);
//     } catch (e: any) {
//       console.error('Razorpay save error', e?.response?.data || e);
//       toast.error(e?.response?.data?.message || 'Failed to save Razorpay configuration');
//     }
//   };

//   const handleSaveStripeConfiguration = async (data: {
//     publishableKey: string;
//     secretKey?: string | null;
//     webhookSecret?: string | null;
//     webhookUrl?: string | null;
//     isActive?: boolean;
//   }) => {
//     try {
//       const payload = {
//         provider: 'Stripe',
//         publishable_key: data.publishableKey,
//         secret_key: data.secretKey ?? null,
//         webhook_secret: data.webhookSecret ?? null,
//         webhook_url: data.webhookUrl ?? null,
//         is_active: data.isActive ? 1 : 0,
//         updatedBy: user?.id || 1,
//       };
//       const resp = await stripeIntegrationAPI.saveIntegration(payload as any);
      
//       await fetchIntegrations();
//       toast.success('Stripe configuration saved successfully');
//       setStripeModalOpen(false);
//       setStripeIntegration(null);
//     } catch (e: any) {
//       console.error('Stripe save error', e?.response?.data || e);
//       toast.error(e?.response?.data?.message || 'Failed to save Stripe configuration');
//     }
//   };

//   const handleSaveEmailConfiguration = async (payload: any) => {
//     try {
//       const resp = await emailIntegrationAPI.saveIntegration(payload);
     
//       await fetchIntegrations();
//       toast.success('Email configuration saved successfully');
//       setEmailModalOpen(false);
//       setEmailIntegration(null);
//     } catch (e: any) {
//       console.error('Email save error', e?.response?.data || e);
//       toast.error(e?.response?.data?.message || 'Failed to save Email configuration');
//     }
//   };

//   const handleSaveChatGPTConfiguration = async (data: { provider: 'OpenAI'; api_key: string; is_active?: boolean }) => {
//     try {
//       // If you have a dedicated API module, call it here later.
//       toast.success('ChatGPT API key updated ✅');
//       await fetchIntegrations();
//       setChatgptModalOpen(false);
//       setChatgptIntegration(null);
//     } catch (e: any) {
//       console.error('ChatGPT save error', e?.response?.data || e);
//       toast.error(e?.response?.data?.message || 'Failed to save ChatGPT configuration');
//     }
//   };

//   // ✅ WhatsApp save handler
//   const handleSaveWhatsAppConfiguration = async (data: {
//     provider: string;
//     phone_number_id: string;
//     waba_id: string;
//     access_token: string;
//     webhook_url?: string | null;
//     is_active?: boolean;
//   }) => {
//     try {
//       // Wire your backend here in future (e.g., whatsappIntegrationAPI.saveIntegration(data))
      
//       toast.success('WhatsApp Business configuration saved successfully');
//       await fetchIntegrations();
//       setWhatsappModalOpen(false);
//       setWhatsappIntegration(null);
//     } catch (e: any) {
//       console.error('WhatsApp save error', e?.response?.data || e);
//       toast.error(e?.response?.data?.message || 'Failed to save WhatsApp configuration');
//     }
//   };

//   const getStatusColor = (status: SyncStatus) => {
//     switch (status) {
//       case 'success':
//         return 'text-green-600';
//       case 'error':
//         return 'text-red-600';
//       case 'pending':
//         return 'text-yellow-600';
//       default:
//         return 'text-gray-600';
//     }
//   };

//   const getStatusIcon = (status: SyncStatus) => {
//     switch (status) {
//       case 'success':
//         return <CheckCircle className="h-4 w-4" />;
//       case 'error':
//         return <XCircle className="h-4 w-4" />;
//       case 'pending':
//         return <RefreshCw className="h-4 w-4 animate-spin" />;
//       default:
//         return <XCircle className="h-4 w-4" />;
//     }
//   };

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case 'email':
//         return <Mail className="h-5 w-5" />;
//       case 'communication':
//         return <MessageSquare className="h-5 w-5" />;
//       case 'payment':
//         return <DollarSign className="h-5 w-5" />;
//       case 'analytics':
//         return <BarChart3 className="h-5 w-5" />;
//       case 'scheduling':
//         return <Calendar className="h-5 w-5" />;
//       case 'automation':
//         return <Zap className="h-5 w-5" />;
//       default:
//         return <Globe className="h-5 w-5" />;
//     }
//   };

//   const visibleIntegrations =
//     activeCategory === 'all' ? integrations : integrations.filter((i) => i.category === activeCategory);

//   const categories = ['all', ...Array.from(new Set(integrations.map((i) => i.category)))];

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="py-4">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
//           <Link to="/dashboard/settings">
//             <Button variant="outline" className="flex items-center">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Settings
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Integrations</h1>
//             <p className="text-gray-600 mt-1 text-sm sm:text-base">Connect with third-party services and tools</p>
//           </div>
//         </div>
//       </div>

//       {/* Category Filter */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex space-x-4 overflow-x-auto">
//           {categories.map((c) => (
//             <button
//               key={c}
//               onClick={() => setActiveCategory(c)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeCategory === c ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//                 }`}
//             >
//               {c === 'all' ? 'All Integrations' : c.charAt(0).toUpperCase() + c.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Integrations Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
//         {visibleIntegrations.map((integration) => (
//           <div
//             key={integration.id}
//             className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
//           >
//             <div className="flex items-start justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                   {getCategoryIcon(integration.category)}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
//                   <p className="text-sm text-gray-600">{integration.provider}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className={`flex items-center space-x-1 ${getStatusColor(integration.sync_status)}`}>
//                   {getStatusIcon(integration.sync_status)}
//                 </div>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={integration.is_enabled}
//                     onChange={(e) => handleToggleIntegration(integration.id, e.target.checked)}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
//                 </label>
//               </div>
//             </div>

//             <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

//             {integration.instructions && (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                 <p className="text-xs text-blue-700">{integration.instructions}</p>
//               </div>
//             )}

//             {/* Configuration Details */}
//             {integration.is_enabled && Object.keys(integration.config || {}).length > 0 && (
//               <div className="space-y-2 mb-4">
//                 <h4 className="text-sm font-medium text-gray-900">Configuration:</h4>
//                 {Object.entries(integration.config)
//                   .filter(([k, v]) => v !== null && v !== undefined && v !== '' && k !== 'password' && k !== 'token')
//                   .map(([key, value]) => (
//                     <div key={key} className="flex justify-between text-xs">
//                       <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
//                       <span className="text-gray-900">{String(value)}</span>
//                     </div>
//                   ))}
//               </div>
//             )}

//             {/* API Key */}
//             {integration.api_key && integration.is_enabled && (
//               <div className="mb-4">
//                 <span className="text-xs text-gray-600 block mb-1">API Key:</span>
//                 <div className="relative">
//                   <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 pr-10 rounded border break-all">
//                     {integration.api_key}
//                   </div>
//                   <button
//                     onClick={() => {
//                       navigator.clipboard?.writeText(integration.api_key || '');
//                       toast.success('API Key copied to clipboard');
//                     }}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
//                   >
//                     <Copy className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Token */}
//             {integration.config?.token && integration.is_enabled && (
//               <div className="mb-4">
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-xs text-gray-600">Token:</span>
//                   <button
//                     onClick={() =>
//                       setShowApiKey((s) => ({ ...s, [`${integration.id}_token`]: !s[`${integration.id}_token`] }))
//                     }
//                     className="text-xs text-blue-600 hover:text-blue-800"
//                   >
//                     {showApiKey[`${integration.id}_token`] ? (
//                       <>
//                         <EyeOff className="h-3 w-3 inline mr-1" />
//                         Hide
//                       </>
//                     ) : (
//                       <>
//                         <Eye className="h-3 w-3 inline mr-1" />
//                         Show
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 <div className="relative">
//                   <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 pr-10 rounded border">
//                     {showApiKey[`${integration.id}_token`] ? integration.config.token : '••••••••••••••••'}
//                   </div>
//                   <button
//                     onClick={() => {
//                       navigator.clipboard?.writeText(integration.config.token || '');
//                       toast.success('Token copied to clipboard');
//                     }}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
//                   >
//                     <Copy className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Webhook URL */}
//             {integration.webhook_url && integration.is_enabled && (
//               <div className="mb-4">
//                 <div className="flex items-center space-x-1 mb-1">
//                   <LinkIcon className="h-3 w-3 text-gray-400" />
//                   <span className="text-xs text-gray-600">Webhook URL:</span>
//                 </div>
//                 <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
//                   {integration.webhook_url}
//                 </div>
//               </div>
//             )}

//             {/* Status & Actions */}
//             <div className="space-y-3">
//               {integration.last_sync && (
//                 <div className="text-xs text-gray-500">
//                   Last sync{' '}
//                   {(() => {
//                     try {
//                       return new Date(integration.last_sync as string).toLocaleString();
//                     } catch {
//                       return integration.last_sync;
//                     }
//                   })()}
//                 </div>
//               )}

//               <div className="flex space-x-2">
//                 <Button variant="outline" size="sm" onClick={() => handleConfigure(integration.id)}>
//                   <Settings className="h-3 w-3 mr-1" />
//                   Configure
//                 </Button>
//               </div>
//             </div>

//             {/* Connection Status */}
//             <div className="mt-3 pt-3 border-t border-gray-200">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs text-gray-600">Status:</span>
//                 <div className="flex items-center space-x-1">
//                   {integration.is_enabled && integration.is_connected ? (
//                     <>
//                       <CheckCircle className="h-3 w-3 text-green-600" />
//                       <span className="text-xs text-green-600">Connected</span>
//                     </>
//                   ) : (
//                     <>
//                       <XCircle className="h-3 w-3 text-red-600" />
//                       <span className="text-xs text-red-600">Not Connected</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* SMS Modal */}
//       <SMSConfigurationModal
//         isOpen={smsModalOpen}
//         onClose={() => {
//           setSmsModalOpen(false);
//           setSmsIntegration(null);
//         }}
//         onSave={handleSaveSMSConfiguration}
//         integration={smsIntegration}
//       />

//       {/* Razorpay Modal */}
//       <RazorpayConfigurationModal
//         isOpen={razorpayModalOpen}
//         onClose={() => {
//           setRazorpayModalOpen(false);
//           setRazorpayIntegration(null);
//         }}
//         onSave={handleSaveRazorpayConfiguration}
//         integration={
//           razorpayIntegration
//             ? {
//               id: razorpayIntegration.id,
//               api_key: razorpayIntegration.api_key ?? null,
//               config: razorpayIntegration.config ?? null,
//               is_enabled: razorpayIntegration.is_enabled ?? false,
//             }
//             : null
//         }
//       />

//       {/* Stripe Modal */}
//       <StripeConfigurationModal
//         isOpen={stripeModalOpen}
//         onClose={() => {
//           setStripeModalOpen(false);
//           setStripeIntegration(null);
//         }}
//         onSave={handleSaveStripeConfiguration}
//         integration={
//           stripeIntegration
//             ? {
//               id: stripeIntegration.id,
//               api_key: stripeIntegration.api_key ?? null,
//               config: stripeIntegration.config ?? null,
//               is_enabled: stripeIntegration.is_enabled ?? false,
//             }
//             : null
//         }
//       />

//       {/* Email Modal */}
//       <EmailConfigurationModal
//         isOpen={emailModalOpen}
//         onClose={() => {
//           setEmailModalOpen(false);
//           setEmailIntegration(null);
//         }}
//         onSave={handleSaveEmailConfiguration}
//         integration={
//           emailIntegration
//             ? {
//               id: emailIntegration.id,
//               api_secret: emailIntegration.config?.password ?? '',
//               api_key: emailIntegration.config?.username ?? '',
//               config: {
//                 smtp_provider:
//                   (emailIntegration.config?.smtp_provider || emailIntegration.name || 'SMTP').toUpperCase(),
//                 driver: 'SMTP',
//                 provider_name: emailIntegration.name,
//                 host: emailIntegration.config?.host || '',
//                 port: emailIntegration.config?.port || '',
//                 security: emailIntegration.config?.security || 'NONE',
//                 username: emailIntegration.config?.username || '',
//                 password: emailIntegration.config?.password || '',
//                 from_address: emailIntegration.config?.from_address || '',
//                 from_name: emailIntegration.config?.from_name || '',
//               },
//               is_enabled: emailIntegration.is_enabled ?? false,
//             }
//             : null
//         }
//       />

//       {/* ChatGPT Modal */}
//       <ChatGPTConfigurationModal
//         isOpen={chatgptModalOpen}
//         onClose={() => {
//           setChatgptModalOpen(false);
//           setChatgptIntegration(null);
//         }}
//         onSave={handleSaveChatGPTConfiguration}
//         integration={
//           chatgptIntegration
//             ? {
//               id: chatgptIntegration.id,
//               is_enabled: chatgptIntegration.is_enabled ?? false,
//               api_key: chatgptIntegration.api_key ?? null,
//               config: chatgptIntegration.config ?? null,
//             }
//             : null
//         }
//       />

//       {/* ✅ WhatsApp Modal */}
//       <WhatsAppConfigurationModal
//         isOpen={whatsappModalOpen}
//         onClose={() => {
//           setWhatsappModalOpen(false);
//           setWhatsappIntegration(null);
//         }}
//         onSave={handleSaveWhatsAppConfiguration}
//         integration={
//           whatsappIntegration
//             ? {
//               id: whatsappIntegration.id,
//               config: whatsappIntegration.config ?? null,
//               is_enabled: whatsappIntegration.is_enabled ?? false,
//             }
//             : null
//         }
//       />
//     </div>
//   );
// };

// export default IntegrationsPage;



// // src/pages/settings/IntegrationsPage.tsx
// // ─── REDESIGNED: Single page, all configs inline (no separate modals),
// //     Navy #0c3854 + Orange #e87722 theme, unified integrationsAPI
// // ─────────────────────────────────────────────────────────────────────────────
// // src/pages/settings/IntegrationsPage.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import {
//   ArrowLeft, CheckCircle, XCircle, Mail, MessageSquare,
//   DollarSign, Brain, Phone, Settings2, Zap, Eye, EyeOff,
//   Key, Link as LinkIcon, AtSign, Shield, Server, X,
//   RefreshCw, Hash, Globe,
//   IndianRupee,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import { useAuth } from "@/contexts/AuthContext";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";
// import {
//   integrationsAPI,
//   type IntegrationTab,
//   type TabData,
// } from "@/lib/integrationsAPI";

// // ─── Theme ────────────────────────────────────────────────────────────────────
// const N  = "#0c3854";   // navy
// const O  = "#e87722";   // orange
// const BG = "#f0f4f8";
// const BD = "#dce5ee";
// const MU = "#7a95a8";

// // ─── Toggle Switch ────────────────────────────────────────────────────────────
// const Toggle = ({
//   checked, onChange, disabled,
// }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
//   <button
//     type="button"
//     role="switch"
//     aria-checked={checked}
//     disabled={disabled}
//     onClick={() => onChange(!checked)}
//     className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 cursor-pointer"
//     style={{ background: checked ? N : "#cbd5e1" }}
//   >
//     <span
//       className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ml-0.5"
//       style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
//     />
//   </button>
// );

// // ─── Field definitions ───────────────────────────────────────────────────────
// interface FieldDef {
//   key: string;
//   label: string;
//   type: "text" | "password" | "url" | "select";
//   required: boolean;
//   placeholder?: string;
//   icon?: "key" | "at" | "link" | "server" | "hash" | "phone";
//   options?: string[];
//   half?: boolean; // occupies half width in 2-col grid
// }

// const PROVIDER_FIELDS: Record<IntegrationTab, FieldDef[]> = {
//   email: [
//     { key: "smtp_provider", label: "SMTP Provider", type: "select", required: true, half: true,
//       options: ["GMAIL","ZOHO MAIL","AMAZON SES","MAILTRAP","SENDGRID (SMTP)","MAILGUN (SMTP)","POSTMARK (SMTP)","OUTLOOK / OFFICE 365","CUSTOM"] },
//     { key: "security",     label: "Security",      type: "select", required: true, half: true,
//       options: ["NONE","STARTTLS","SSL_TLS"] },
//     { key: "host",         label: "SMTP Host",     type: "text",   required: true, placeholder: "smtp.gmail.com", icon: "server", half: true },
//     { key: "port",         label: "Port",          type: "text",   required: true, placeholder: "587", half: true },
//     { key: "username",     label: "Username",      type: "text",   required: true, placeholder: "you@gmail.com", icon: "at", half: true },
//     { key: "password",     label: "Password",      type: "password", required: true, placeholder: "App password", half: true },
//     { key: "from_address", label: "From Email",    type: "text",   required: true, placeholder: "noreply@company.com", icon: "at", half: true },
//     { key: "from_name",    label: "From Name",     type: "text",   required: false, placeholder: "Resale Expert", half: true },
//   ],
//   sms: [
//     { key: "sms_provider", label: "SMS Provider",  type: "select", required: true, half: true,
//       options: ["TWILIO","AWS SNS","VONAGE","TEXTMAGIC","MESSAGEBIRD","PLIVO"] },
//     { key: "sms_number",   label: "From Number",   type: "text",   required: true, placeholder: "+13159152581", icon: "phone", half: true },
//     { key: "api_key",      label: "API Key / SID", type: "text",   required: true, placeholder: "ACxxxxx", icon: "key", half: true },
//     { key: "token",        label: "Token / Secret",type: "password",required: true, placeholder: "Auth Token", half: true },
//     { key: "sms_from",     label: "Sender Name",   type: "text",   required: false, placeholder: "ResaleExpert", half: true },
//   ],
//   whatsapp: [
//     { key: "phone_number_id", label: "Phone Number ID", type: "text",     required: true, placeholder: "1234567890", icon: "key", half: true },
//     { key: "waba_id",         label: "WABA ID",          type: "text",     required: true, placeholder: "WhatsApp Business Account ID", half: true },
//     { key: "access_token",    label: "Access Token",     type: "password", required: true, placeholder: "EAAxxxx..." },
//     { key: "webhook_url",     label: "Webhook URL",      type: "url",      required: false, placeholder: "https://your-domain.com/webhooks/whatsapp", icon: "link" },
//   ],
//   razorpay: [
//     { key: "key_id",         label: "Key ID",         type: "text",     required: true, placeholder: "rzp_test_xxxxx", icon: "key", half: true },
//     { key: "key_secret",     label: "Key Secret",     type: "password", required: true, placeholder: "Keep on server", half: true },
//     { key: "webhook_secret", label: "Webhook Secret", type: "password", required: true, placeholder: "Webhook verification secret", half: true },
//     { key: "webhook_url",    label: "Webhook URL",    type: "url",      required: true, placeholder: "https://your-domain.com/webhooks/razorpay", icon: "link", half: true },
//   ],
//   stripe: [
//     { key: "publishable_key", label: "Publishable Key (pk_...)", type: "text",     required: true, placeholder: "pk_test_xxxxx", icon: "key", half: true },
//     { key: "secret_key",      label: "Secret Key (sk_...)",     type: "password", required: true, placeholder: "sk_test_...", half: true },
//     { key: "webhook_secret",  label: "Webhook Signing Secret",  type: "password", required: true, placeholder: "whsec_...", half: true },
//     { key: "webhook_url",     label: "Webhook URL",             type: "url",      required: true, placeholder: "https://your-domain.com/webhooks/stripe", icon: "link", half: true },
//   ],
//   chatgpt: [
//     { key: "api_key", label: "OpenAI API Key", type: "password", required: true, placeholder: "sk-proj-...", icon: "key" },
//     { key: "model",   label: "Model",          type: "select",   required: false,
//       options: ["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"] },
//   ],
// };

// // ─── Card meta ────────────────────────────────────────────────────────────────
// interface CardMeta {
//   tab: IntegrationTab;
//   label: string;
//   subLabel: string;
//   description: string;
//   icon: React.ReactNode;
//   category: "email" | "communication" | "payment" | "ai";
//   // which config keys to show in the card preview
//   previewKeys: Array<{ key: string; label: string }>;
// }

// const CARD_META: CardMeta[] = [
//   {
//     tab: "email", label: "SMTP", subLabel: "SMTP", description: "Send and receive emails via SMTP.",
//     icon: <Mail className="h-5 w-5" />, category: "email",
//     previewKeys: [
//       { key: "host",         label: "Host" },
//       { key: "port",         label: "Port" },
//       { key: "username",     label: "Username" },
//       { key: "from_address", label: "From Email" },
//     ],
//   },
//   {
//     tab: "sms", label: "SMS Integration", subLabel: "—", description: "Send SMS messages through your provider.",
//     icon: <MessageSquare className="h-5 w-5" />, category: "communication",
//     previewKeys: [
//       { key: "sms_provider", label: "Provider" },
//       { key: "api_key",      label: "Account SID" },
//       { key: "sms_number",   label: "From Number" },
//     ],
//   },
//   {
//     tab: "whatsapp", label: "WhatsApp Business", subLabel: "Meta", description: "WhatsApp Cloud API for customer messaging.",
//     icon: <Phone className="h-5 w-5" />, category: "communication",
//     previewKeys: [
//       { key: "phone_number_id", label: "Phone Number ID" },
//       { key: "waba_id",         label: "WABA ID" },
//     ],
//   },
//   {
//     tab: "razorpay", label: "Payment Gateway", subLabel: "Razorpay", description: "Accept online payments via Razorpay gateway.",
//     icon: <DollarSign className="h-5 w-5" />, category: "payment",
//     previewKeys: [
//       { key: "key_id",      label: "Key ID" },
//       { key: "webhook_url", label: "Webhook" },
//     ],
//   },
//   {
//     tab: "stripe", label: "Payment Gateway", subLabel: "Stripe", description: "Global payments, billing and webhooks via Stripe.",
//     icon: <DollarSign className="h-5 w-5" />, category: "payment",
//     previewKeys: [
//       { key: "publishable_key", label: "Publishable Key" },
//       { key: "webhook_url",     label: "Webhook" },
//     ],
//   },
//   {
//     tab: "chatgpt", label: "ChatGPT / OpenAI", subLabel: "OpenAI", description: "Use OpenAI models to automate support workflows.",
//     icon: <Brain className="h-5 w-5" />, category: "ai",
//     previewKeys: [
//       { key: "model",   label: "Model" },
//     ],
//   },
// ];

// type TabFilter = "all" | "email" | "communication" | "payment" | "ai";

// const TAB_FILTERS: Array<{ key: TabFilter; label: string; icon: React.ReactNode }> = [
//   { key: "all",           label: "All",           icon: <Globe          className="h-4 w-4" /> },
//   { key: "email",         label: "Email",          icon: <Mail           className="h-4 w-4" /> },
//   { key: "communication", label: "Communication",  icon: <MessageSquare  className="h-4 w-4" /> },
//   { key: "payment",       label: "Payment",        icon: <IndianRupee    className="h-4 w-4" /> },
//   { key: "ai",            label: "AI",             icon: <Brain          className="h-4 w-4" /> },
// ];

// // ─── Category icon bg ─────────────────────────────────────────────────────────
// const catStyle = (cat: string) => ({
//   email:         { bg: `${N}15`,   color: N    },
//   communication: { bg: `${O}15`,   color: O    },
//   payment:       { bg: "#dcfce7",  color: "#15803d" },
//   ai:            { bg: "#f3e8ff",  color: "#7c3aed" },
// }[cat] ?? { bg: `${N}12`, color: N });

// // ─── Truncate display value ───────────────────────────────────────────────────
// const trunc = (v: string | null | undefined, n = 14) => {
//   if (!v) return "—";
//   return v.length > n ? v.slice(0, n) + "…" : v;
// };

// // ─── Field input inside modal ─────────────────────────────────────────────────
// const ModalInput = ({
//   def, value, onChange, error,
// }: { def: FieldDef; value: string; onChange: (v: string) => void; error?: string }) => {
//   const [show, setShow] = useState(false);
//   const isPass = def.type === "password";
//   const type   = isPass ? (show ? "text" : "password") : def.type === "url" ? "url" : "text";

//   const IconEl = {
//     key: Key, at: AtSign, link: LinkIcon, server: Server, hash: Hash, phone: Phone,
//   }[def.icon ?? ""] as any;

//   const borderColor = error ? "#ef4444" : BD;

//   if (def.type === "select") {
//     return (
//       <div>
//         <label className="block text-xs font-semibold mb-1" style={{ color: error ? "#ef4444" : N }}>
//           {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
//         </label>
//         <select
//           value={value}
//           onChange={e => onChange(e.target.value)}
//           className="w-full px-3 py-2 text-sm rounded-lg border bg-white outline-none transition-all"
//           style={{ borderColor, color: N }}
//         >
//           <option value="">— Select —</option>
//           {def.options?.map(o => <option key={o} value={o}>{o}</option>)}
//         </select>
//         {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <label className="block text-xs font-semibold mb-1" style={{ color: error ? "#ef4444" : N }}>
//         {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
//       </label>
//       <div className="relative">
//         {IconEl && (
//           <IconEl className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: MU }} />
//         )}
//         <input
//           type={type}
//           value={value}
//           onChange={e => onChange(e.target.value)}
//           placeholder={def.placeholder}
//           autoComplete={isPass ? "new-password" : "off"}
//           className="w-full py-2 text-sm rounded-lg border outline-none transition-all"
//           style={{
//             paddingLeft:  IconEl  ? "2rem"  : "0.75rem",
//             paddingRight: isPass  ? "2rem"  : "0.75rem",
//             borderColor, color: N,
//           }}
//         />
//         {isPass && (
//           <button type="button" onClick={() => setShow(s => !s)}
//             className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: MU }}>
//             {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
//           </button>
//         )}
//       </div>
//       {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
//   );
// };

// // ─── Compact Configure Modal ──────────────────────────────────────────────────
// const ConfigureModal = ({
//   meta, config, onClose, onSave,
// }: {
//   meta: CardMeta;
//   config: Record<string, string | null>;
//   onClose: () => void;
//   onSave: (tab: IntegrationTab, cfg: Record<string, string>) => Promise<void>;
// }) => {
//   const fields = PROVIDER_FIELDS[meta.tab];
//   const [form,    setForm]    = useState<Record<string, string>>(() => {
//     const init: Record<string, string> = {};
//     fields.forEach(f => { init[f.key] = config[f.key] ?? ""; });
//     return init;
//   });
//   const [errors,  setErrors]  = useState<Record<string, string>>({});
//   const [saving,  setSaving]  = useState(false);
//   const cs = catStyle(meta.category);

//   const setField = (key: string, val: string) => {
//     setForm(p => ({ ...p, [key]: val }));
//     if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
//   };

//   const validate = () => {
//     const e: Record<string, string> = {};
//     fields.forEach(f => {
//       if (f.required && !String(form[f.key] ?? "").trim()) e[f.key] = `${f.label} is required`;
//     });
//     setErrors(e);
//     return !Object.keys(e).length;
//   };

//   const handleSave = async () => {
//     if (!validate()) return;
//     setSaving(true);
//     try {
//       await onSave(meta.tab, form);
//       onClose();
//     } catch { /* toast handled in parent */ }
//     finally { setSaving(false); }
//   };

//   // backdrop click closes
//   const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) onClose();
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(12,56,84,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onBackdrop}
//     >
//       <div
//         className="bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
//         style={{ maxWidth: 560, maxHeight: "90vh" }}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center gap-3 px-5 py-4" style={{ background: N, borderBottom: `2px solid ${O}` }}>
//           <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${O}25` }}>
//             <span style={{ color: O }}>{meta.icon}</span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <h2 className="text-sm font-bold text-white leading-tight">{meta.label}</h2>
//             <p className="text-xs" style={{ color: `${O}cc` }}>{meta.subLabel} — Configure Integration</p>
//           </div>
//           <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
//             <X className="h-4 w-4 text-white" />
//           </button>
//         </div>

//         {/* Body — scrollable */}
//         <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: BG }}>
//           {/* Security note */}
//           <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
//             style={{ background: `${N}08`, border: `1px solid ${N}20`, color: N }}>
//             <Shield className="h-3.5 w-3.5 shrink-0" style={{ color: N }} />
//             Secrets are stored encrypted and never exposed after saving.
//           </div>

//           {/* Form grid */}
//           <div className="grid grid-cols-2 gap-3">
//             {fields.map(f => (
//               <div key={f.key} className={f.half === false ? "col-span-2" : f.type === "url" ? "col-span-2" : ""}>
//                 <ModalInput
//                   def={f}
//                   value={form[f.key] ?? ""}
//                   onChange={v => setField(f.key, v)}
//                   error={errors[f.key]}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-end gap-3 px-5 py-3 border-t" style={{ borderColor: BD }}>
//           <button
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
//             style={{ borderColor: BD, color: N }}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
//             style={{ background: N }}
//           >
//             {saving
//               ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Saving…</>
//               : <><CheckCircle className="h-3.5 w-3.5" style={{ color: O }} />Save Configuration</>
//             }
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Integration Card ─────────────────────────────────────────────────────────
// const IntegrationCard = ({
//   meta, data, onToggle, onConfigure,
// }: {
//   meta: CardMeta;
//   data: TabData | null;
//   onToggle: (tab: IntegrationTab, val: boolean) => Promise<void>;
//   onConfigure: (meta: CardMeta) => void;
// }) => {
//   const [toggling, setToggling] = useState(false);
//   const isActive    = data?.is_active ?? false;
//   const config      = data?.config ?? {};
//   const isConnected = Object.values(config).some(v => v && v.trim() !== "");
//   const cs = catStyle(meta.category);

//   const handleToggle = async (val: boolean) => {
//     if (!isConnected) { toast.warn("Please configure this integration first"); return; }
//     setToggling(true);
//     try { await onToggle(meta.tab, val); }
//     finally { setToggling(false); }
//   };

//   return (
//     <div
//       className="bg-white rounded-2xl border flex flex-col transition-all hover:shadow-lg"
//       style={{
//         borderColor: isActive && isConnected ? `${O}60` : BD,
//         boxShadow: isActive && isConnected ? `0 0 0 1px ${O}30` : undefined,
//       }}
//     >
//       {/* Card header */}
//       <div className="flex items-start justify-between p-5 pb-3">
//         <div className="flex items-center gap-3">
//           <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cs.bg }}>
//             <span style={{ color: cs.color }}>{meta.icon}</span>
//           </div>
//           <div>
//             <div className="flex items-center gap-1.5">
//               {isConnected && <CheckCircle className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />}
//               <h3 className="font-bold text-sm leading-tight" style={{ color: N }}>{meta.label}</h3>
//             </div>
//             <p className="text-xs" style={{ color: MU }}>{meta.subLabel}</p>
//           </div>
//         </div>
//         <Toggle checked={isActive} onChange={handleToggle} disabled={toggling} />
//       </div>

//       {/* Description */}
//       <p className="px-5 text-xs leading-relaxed" style={{ color: MU }}>{meta.description}</p>

//       {/* Config preview */}
//       <div className="mx-5 mt-4 rounded-xl p-3" style={{ background: BG, border: `1px solid ${BD}` }}>
//         <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: MU }}>Configured</p>
//         <div className="space-y-1.5">
//           {meta.previewKeys.map(pk => (
//             <div key={pk.key} className="flex items-center justify-between gap-2">
//               <span className="text-xs" style={{ color: MU }}>{pk.label}</span>
//               <span className="text-xs font-medium text-right" style={{ color: N }}>
//                 {trunc(config[pk.key], 18)}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Instructions hint */}
//       <div
//         className="mx-5 mt-3 px-3 py-2 rounded-lg text-xs"
//         style={{
//           background: isConnected ? "#f0fdf4" : "#eff6ff",
//           color:      isConnected ? "#15803d" : "#1d4ed8",
//           border:     `1px solid ${isConnected ? "#bbf7d0" : "#bfdbfe"}`,
//         }}
//       >
//         {isConnected
//           ? `Configure ${meta.subLabel} to update settings.`
//           : `Configure ${meta.subLabel} to enable this integration.`}
//       </div>

//       {/* Configure button */}
//       <div className="p-5 pt-3">
//         <button
//           onClick={() => onConfigure(meta)}
//           className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
//           style={{ background: N }}
//         >
//           <Settings2 className="h-4 w-4" style={{ color: O }} />
//           Configure
//         </button>
//       </div>

//       {/* Status footer */}
//       <div
//         className="flex items-center justify-between px-5 py-3 rounded-b-2xl border-t"
//         style={{ borderColor: BD, background: BG }}
//       >
//         <span className="text-xs" style={{ color: MU }}>Status</span>
//         {isConnected && isActive ? (
//           <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#16a34a" }}>
//             <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
//             Connected
//           </span>
//         ) : (
//           <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MU }}>
//             <XCircle className="h-3.5 w-3.5" />
//             {isConnected ? "Disabled" : "Disconnected"}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// // ─── Main Page ────────────────────────────────────────────────────────────────
// const IntegrationsPage: React.FC = () => {
//   const { user } = useAuth();
//   const [loading,    setLoading]    = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [allData,    setAllData]    = useState<Record<string, TabData>>({});
//   const [activeTab,  setActiveTab]  = useState<TabFilter>("all");
//   const [modalMeta,  setModalMeta]  = useState<CardMeta | null>(null);

//   // ── Fetch all tabs from /integrations (grouped by tab column) ──────────────
//   const fetchAll = useCallback(async (quiet = false) => {
//     quiet ? setRefreshing(true) : setLoading(true);
//     try {
//       const data = await integrationsAPI.getAll();
//       setAllData(data as any);
//     } catch (err) {
//       console.error("fetchAll error:", err);
//       toast.error("Failed to load integrations");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => { fetchAll(); }, [fetchAll]);

//   // ── Toggle ─────────────────────────────────────────────────────────────────
//   const handleToggle = async (tab: IntegrationTab, val: boolean) => {
//     await integrationsAPI.toggleByTab(tab, val);
//     toast.success(`${tab} ${val ? "enabled" : "disabled"}`);
//     await fetchAll(true);
//   };

//   // ── Save config ────────────────────────────────────────────────────────────
//   const handleSave = async (tab: IntegrationTab, config: Record<string, string>) => {
//     await integrationsAPI.saveByTab(tab, config);
//     toast.success(`${tab} configuration saved`);
//     await fetchAll(true);
//   };

//   // ── Filtered cards ─────────────────────────────────────────────────────────
//   const visibleCards = CARD_META.filter(m =>
//     activeTab === "all" ? true : m.category === activeTab
//   );

//   if (loading) return (
//     <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
//   );

//   return (
//     <div className="p-4 sm:p-6 space-y-5 min-h-full" style={{ background: BG }}>

//       {/* ── Header ──────────────────────────────────────────────────────────── */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div className="flex flex-col sm:flex-row sm:items-center gap-3">
         
//           <div>
//             <div className="flex items-center gap-2.5">
//               <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: N }}>
//                 <Zap className="h-4 w-4" style={{ color: O }} />
//               </div>
//               <h1 className="text-xl sm:text-2xl font-bold" style={{ color: N }}>Integrations</h1>
//             </div>
//             <p className="text-sm mt-0.5" style={{ color: MU }}>Configure platform settings and preferences</p>
//           </div>
//         </div>

//         <button
//           onClick={() => fetchAll(true)}
//           disabled={refreshing}
//           className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:shadow-sm"
//           style={{ borderColor: BD, color: N, background: "white" }}
//         >
//           <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
//           Refresh
//         </button>
//       </div>

//       {/* ── Tab Filter Bar ───────────────────────────────────────────────────── */}
//       <div
//         className="flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto"
//         style={{ background: "white", border: `1px solid ${BD}` }}
//       >
//         {TAB_FILTERS.map(t => {
//           const active = activeTab === t.key;
//           return (
//             <button
//               key={t.key}
//               onClick={() => setActiveTab(t.key)}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0"
//               style={{
//                 background: active ? N : "transparent",
//                 color:      active ? "white" : MU,
//                 boxShadow:  active ? `0 2px 8px ${N}30` : undefined,
//               }}
//             >
//               <span style={{ color: active ? O : MU }}>{t.icon}</span>
//               {t.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Cards Grid ──────────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//         {visibleCards.map(meta => (
//           <IntegrationCard
//             key={meta.tab}
//             meta={meta}
//             data={allData[meta.tab] ?? null}
//             onToggle={handleToggle}
//             onConfigure={m => setModalMeta(m)}
//           />
//         ))}
//       </div>

//       {/* ── Configure Modal ─────────────────────────────────────────────────── */}
//       {modalMeta && (
//         <ConfigureModal
//           meta={modalMeta}
//           config={allData[modalMeta.tab]?.config ?? {}}
//           onClose={() => setModalMeta(null)}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// };

// export default IntegrationsPage;


// src/pages/settings/IntegrationsPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, XCircle, Mail, MessageSquare,
  DollarSign, Brain, Phone, Settings2, Zap, Eye, EyeOff,
  Key, Link as LinkIcon, AtSign, Shield, Server, X,
  RefreshCw, Hash, Globe,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  integrationsAPI,
  type IntegrationTab,
  type TabData,
} from "@/lib/integrationsAPI";
import { createPortal } from "react-dom";


// ─── Theme ────────────────────────────────────────────────────────────────────
const N  = "#0e3658";   
const O  = "#e67e22";   
const BG = "#f8fafc";   // Very light blue-gray background
const BD = "#e2e8f0";   // Light border color
const MU = "#5a7184";   // Muted text color

// Tab-specific header colors
const TAB_HEADER_COLORS: Record<IntegrationTab, { bg: string; border: string; text: string }> = {
  email:     { bg: "#2563eb", border: "#1d4ed8", text: "#ffffff" }, // Blue for SMTP/Email
  sms:       { bg: "#16a34a", border: "#15803d", text: "#ffffff" }, // Green for SMS
  whatsapp:  { bg: "#0d9488", border: "#128C7E", text: "#ffffff" }, // WhatsApp green
  razorpay:  { bg: "#0b132b", border: "#1e2a5e", text: "#ffffff" }, // Dark blue for Razorpay
  stripe:    { bg: "#635bff", border: "#4a42d9", text: "#ffffff" }, // Stripe purple
  chatgpt:   { bg: "#10a37f", border: "#0e8a6b", text: "#ffffff" }, // OpenAI green
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 cursor-pointer"
    style={{ background: checked ? N : "#cbd5e1" }}
  >
    <span
      className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ml-0.5"
      style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
    />
  </button>
);

// ─── Field definitions ───────────────────────────────────────────────────────
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "select";
  required: boolean;
  placeholder?: string;
  icon?: "key" | "at" | "link" | "server" | "hash" | "phone";
  options?: string[];
  half?: boolean; // occupies half width in 2-col grid
}

const PROVIDER_FIELDS: Record<IntegrationTab, FieldDef[]> = {
  email: [
        { key: "host",           label: "SMTP Host",       type: "text",   required: true, placeholder: "smtp.gmail.com", icon: "server", half: true },
    { key: "port",           label: "Port",            type: "text",   required: true, placeholder: "587", half: true },
    { key: "username",       label: "Username",        type: "text",   required: true, placeholder: "you@gmail.com", icon: "at", half: true },
    { key: "password",       label: "Password",        type: "password", required: true, placeholder: "App password", half: true },
 { key: "from_address",   label: "From Email",      type: "text",   required: true, placeholder: "noreply@company.com", icon: "at", half: true },
    { key: "from_name",      label: "From Name",       type: "text",   required: false, placeholder: "Resale Expert", half: true },
  ],
  sms: [
    { key: "sms_provider", label: "API Provider",         type: "select", required: true, half: true,
      options: ["MSG91","TWILIO","AWS SNS","VONAGE","TEXTMAGIC","MESSAGEBIRD","PLIVO"] },
    { key: "api_key",      label: "ID/Key",          type: "password",required: true, placeholder: "Your API Key", icon: "key", half: true },
    { key: "token",        label: "Token / Secret",   type: "password",required: false, placeholder: "Auth Token", half: true },
        { key: "sms_number",   label: "SMS Number",      type: "text",   required: false, placeholder: "+13159152581", icon: "phone", half: true },

    { key: "sms_from",     label: "SMS From",      type: "text",   required: false, placeholder: "ResaleExpert", half: true },
  ],
  whatsapp: [
    { key: "phone_number_id", label: "Phone Number ID", type: "text",     required: true, placeholder: "1234567890", icon: "key", half: true },
    { key: "waba_id",         label: "WABA ID",          type: "text",     required: true, placeholder: "WhatsApp Business Account ID", half: true },
    { key: "access_token",    label: "Access Token",     type: "password", required: true, placeholder: "EAAxxxx..." },
    { key: "webhook_url",     label: "Webhook URL",      type: "url",      required: false, placeholder: "https://your-domain.com/webhooks/whatsapp", icon: "link" },
  ],
  razorpay: [
    { key: "key_id",         label: "Key ID",         type: "text",     required: true, placeholder: "rzp_test_xxxxx", icon: "key", half: true },
    { key: "key_secret",     label: "Key Secret",     type: "password", required: true, placeholder: "Keep on server", half: true },
    { key: "webhook_secret", label: "Webhook Secret", type: "password", required: true, placeholder: "Webhook verification secret", half: true },
  ],
  stripe: [
    { key: "publishable_key", label: "Publishable Key (pk_...)", type: "text",     required: true, placeholder: "pk_test_xxxxx", icon: "key", half: true },
    { key: "secret_key",      label: "Secret Key (sk_...)",     type: "password", required: true, placeholder: "sk_test_...", half: true },
    { key: "webhook_secret",  label: "Webhook Signing Secret",  type: "password", required: true, placeholder: "whsec_...", half: true },
    { key: "webhook_url",     label: "Webhook URL",             type: "url",      required: true, placeholder: "https://your-domain.com/webhooks/stripe", icon: "link", half: true },
  ],
  chatgpt: [
    { key: "api_key", label: "OpenAI API Key", type: "password", required: true, placeholder: "sk-proj-...", icon: "key" },
    { key: "model",   label: "Model",          type: "select",   required: false,
      options: ["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"] },
  ],
};

// ─── Card meta ────────────────────────────────────────────────────────────────
interface CardMeta {
  tab: IntegrationTab;
  label: string;
  subLabel: string;
  description: string;
  icon: React.ReactNode;
  category: "email" | "communication" | "payment" | "ai";
  previewKeys: Array<{ key: string; label: string }>;
}

const CARD_META: CardMeta[] = [
  {
    tab: "email", label: "SMTP / Email", subLabel: "Email API", description: "Send and receive emails via SMTP or Mailgun.",
    icon: <Mail className="h-5 w-5" />, category: "email",
    previewKeys: [
      { key: "host",         label: "SMTP Host" },
      { key: "port",  label: "Port" },
      { key: "username",           label: "Username" },
      { key: "password",   label: "Password" },
      { key: "from_address",   label: "From Email" },
      { key: "from_name",   label: "From Name" },
    ],
  },
  {
    tab: "sms", label: "SMS Integration", subLabel: "MSG91 / Twilio", description: "Send SMS messages through your provider.",
    icon: <MessageSquare className="h-5 w-5" />, category: "communication",
    previewKeys: [
      { key: "sms_provider", label: "API Provider" },
       { key: "api_key",      label: "ID/Key"},
      { key: "token",        label: "Token / Secret"},
       { key: "sms_number",   label: "SMS Number"},
       { key: "sms_from",     label: "SMS From"},
    ],
  },
  {
    tab: "whatsapp", label: "WhatsApp Business", subLabel: "Meta", description: "WhatsApp Cloud API for customer messaging.",
    icon: <Phone className="h-5 w-5" />, category: "communication",
    previewKeys: [
      { key: "phone_number_id", label: "Phone Number ID" },
      { key: "waba_id",         label: "WABA ID" },
      { key: "access_token",    label: "Access Token"},
      { key: "webhook_url",     label: "Webhook URL"},
    ],
  },
  {
    tab: "razorpay", label: "Payment Gateway", subLabel: "Razorpay", description: "Accept online payments via Razorpay gateway.",
    icon: <IndianRupee className="h-5 w-5" />, category: "payment",
    previewKeys: [
      { key: "key_id",      label: "Key ID" },
      { key: "key_secret",     label: "Key Secret"},
      { key: "webhook_secret", label: "Webhook Secret"},
    ],
  },
  {
    tab: "stripe", label: "Payment Gateway", subLabel: "Stripe", description: "Global payments, billing and webhooks via Stripe.",
    icon: <IndianRupee className="h-5 w-5" />, category: "payment",
    previewKeys: [
      { key: "publishable_key", label: "Publishable Key" },
      { key: "secret_key",      label: "Secret Key "},
      { key: "webhook_secret",  label: "Webhook Signing Secret"},
      { key: "webhook_url",     label: "Webhook" },
    ],
  },
  {
    tab: "chatgpt", label: "ChatGPT / OpenAI", subLabel: "OpenAI", description: "Use OpenAI models to automate support workflows.",
    icon: <Brain className="h-5 w-5" />, category: "ai",
    previewKeys: [
      { key: "api_key", label: "OpenAI API Key"},
      { key: "model",   label: "Model" },
    ],
  },
];

type TabFilter = "all" | "email" | "communication" | "payment" | "ai";

const TAB_FILTERS: Array<{ key: TabFilter; label: string; icon: React.ReactNode }> = [
  { key: "all",           label: "All",           icon: <Globe          className="h-4 w-4" /> },
  { key: "email",         label: "Email",          icon: <Mail           className="h-4 w-4" /> },
  { key: "communication", label: "Communication",  icon: <MessageSquare  className="h-4 w-4" /> },
  { key: "payment",       label: "Payment",        icon: <IndianRupee    className="h-4 w-4" /> },
  { key: "ai",            label: "AI",             icon: <Brain          className="h-4 w-4" /> },
];

// ─── Category icon bg ─────────────────────────────────────────────────────────
const catStyle = (cat: string) => ({
  email:         { bg: `${N}12`,   color: N    },
  communication: { bg: `${O}12`,   color: O    },
  payment:       { bg: "#dcfce7",  color: "#15803d" },
  ai:            { bg: "#f3e8ff",  color: "#7c3aed" },
}[cat] ?? { bg: `${N}12`, color: N });

// ─── Truncate display value ───────────────────────────────────────────────────
const trunc = (v: string | null | undefined, n = 14) => {
  if (!v) return "—";
  return v.length > n ? v.slice(0, n) + "…" : v;
};

// ─── Field input inside modal ─────────────────────────────────────────────────
const ModalInput = ({
  def, value, onChange, error,
}: { def: FieldDef; value: string; onChange: (v: string) => void; error?: string }) => {
  const [show, setShow] = useState(false);
  const isPass = def.type === "password";
  const type   = isPass ? (show ? "text" : "password") : def.type === "url" ? "url" : "text";

  const IconEl = {
    key: Key, at: AtSign, link: LinkIcon, server: Server, hash: Hash, phone: Phone,
  }[def.icon ?? ""] as any;

  const borderColor = error ? "#ef4444" : BD;

  if (def.type === "select") {
    return (
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: error ? "#ef4444" : N }}>
          {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border bg-white outline-none transition-all"
          style={{ borderColor, color: N }}
        >
          <option value="">— Select —</option>
          {def.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: error ? "#ef4444" : N }}>
        {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {IconEl && (
          <IconEl className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: MU }} />
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={def.placeholder}
          autoComplete={isPass ? "new-password" : "off"}
          className="w-full py-2 text-sm rounded-lg border outline-none transition-all"
          style={{
            paddingLeft:  IconEl  ? "2rem"  : "0.75rem",
            paddingRight: isPass  ? "2rem"  : "0.75rem",
            borderColor, color: N,
          }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: MU }}>
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── Compact Configure Modal ──────────────────────────────────────────────────
// ─── Compact Configure Modal ──────────────────────────────────────────────────
const ConfigureModal = ({
  meta, config, onClose, onSave,
}: {
  meta: CardMeta;
  config: Record<string, string | null>;
  onClose: () => void;
  onSave: (tab: IntegrationTab, cfg: Record<string, string>) => Promise<void>;
}) => {
  const fields = PROVIDER_FIELDS[meta.tab];
  const [form,    setForm]    = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.key] = config[f.key] ?? ""; });
    return init;
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [saving,  setSaving]  = useState(false);
  const cs = catStyle(meta.category);
  const headerColor = TAB_HEADER_COLORS[meta.tab] || { bg: N, border: O, text: "#ffffff" };

  const setField = (key: string, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    fields.forEach(f => {
      if (f.required && !String(form[f.key] ?? "").trim()) e[f.key] = `${f.label} is required`;
    });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(meta.tab, form);
      onClose();
    } catch { /* toast handled in parent */ }
    finally { setSaving(false); }
  };

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
     className="flex items-center justify-center p-4"
style={{ 
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15,43,61,0.6)", 
  backdropFilter: "blur(4px)",
  zIndex: 999999
}}
      onClick={onBackdrop}
    >
      <div
        className="bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with dynamic color based on tab */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: headerColor.bg, borderBottom: `2px solid ${headerColor.border}` }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${headerColor.border}40` }}>
            <span style={{ color: headerColor.text }}>{meta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white leading-tight">{meta.label}</h2>
            <p className="text-xs" style={{ color: `${headerColor.text}cc` }}>{meta.subLabel} — Configure Integration</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: BG }}>
          {/* Security note */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: `${N}08`, border: `1px solid ${N}15`, color: N }}>
            <Shield className="h-3.5 w-3.5 shrink-0" style={{ color: N }} />
            Secrets are stored encrypted and never exposed after saving.
          </div>

          {/* Form grid - responsive: 1 column on mobile, 2 columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.half === false ? "sm:col-span-2" : f.type === "url" ? "sm:col-span-2" : ""}>
                <ModalInput
                  def={f}
                  value={form[f.key] ?? ""}
                  onChange={v => setField(f.key, v)}
                  error={errors[f.key]}
                />
              </div>
            ))}
          </div>

          {/* Additional note for SMS */}
          {meta.tab === "sms" && (
            <div className="text-xs p-2 rounded-lg" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
              ⚡ Sender ID must be pre-approved by your SMS provider. Use Transactional route for OTP & alerts.
            </div>
          )}

         
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-5 py-3 border-t" style={{ borderColor: BD }}>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
            style={{ borderColor: BD, color: N }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: headerColor.bg }}  // ← CHANGED: Now uses dynamic header color
          >
            {saving
              ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Saving…</>
              : <><CheckCircle className="h-3.5 w-3.5" style={{ color: headerColor.border }} />Save Configuration</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Integration Card ─────────────────────────────────────────────────────────
// ─── Integration Card ─────────────────────────────────────────────────────────
const IntegrationCard = ({
  meta, data, onToggle, onConfigure,
}: {
  meta: CardMeta;
  data: TabData | null;
  onToggle: (tab: IntegrationTab, val: boolean) => Promise<void>;
  onConfigure: (meta: CardMeta) => void;
}) => {
  const [toggling, setToggling] = useState(false);
  const isActive    = data?.is_active ?? false;
  const config      = data?.config ?? {};
  const isConnected = Object.values(config).some(v => v && v.trim() !== "");
  const cs = catStyle(meta.category);

  const handleToggle = async (val: boolean) => {
    if (!isConnected) { toast.warn("Please configure this integration first"); return; }
    setToggling(true);
    try { await onToggle(meta.tab, val); }
    finally { setToggling(false); }
  };

  return (
    <div
      className="bg-white rounded-2xl border flex flex-col h-full transition-all hover:shadow-lg"
      style={{
        borderColor: isActive && isConnected ? `${O}60` : BD,
        boxShadow: isActive && isConnected ? `0 0 0 1px ${O}30` : undefined,
      }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cs.bg }}>
            <span style={{ color: cs.color }}>{meta.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              {isConnected && <CheckCircle className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />}
              <h3 className="font-bold text-sm leading-tight" style={{ color: N }}>{meta.label}</h3>
            </div>
            <p className="text-xs" style={{ color: MU }}>{meta.subLabel}</p>
          </div>
        </div>
        <Toggle checked={isActive} onChange={handleToggle} disabled={toggling} />
      </div>

      {/* Description */}
      <p className="px-5 text-xs leading-relaxed" style={{ color: MU }}>{meta.description}</p>

      {/* Config preview */}
      <div className="mx-5 mt-4 rounded-xl p-3" style={{ background: BG, border: `1px solid ${BD}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: MU }}>Configured</p>
        <div className="space-y-1.5">
          {meta.previewKeys.map(pk => (
            <div key={pk.key} className="flex items-center justify-between gap-2">
              <span className="text-xs" style={{ color: MU }}>{pk.label}</span>
              <span className="text-xs font-medium text-right" style={{ color: N }}>
                {trunc(config[pk.key], 18)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* THIS DIV - Fixed height container for consistent button + hint alignment */}
      <div className="flex flex-col flex-1 justify-end">
        {/* Instructions hint - now positioned consistently */}
        <div
          className="mx-5 mt-4 px-3 py-2 rounded-lg text-xs"
          style={{
            background: isConnected ? "#f0fdf4" : "#eff6ff",
            color:      isConnected ? "#15803d" : "#1d4ed8",
            border:     `1px solid ${isConnected ? "#bbf7d0" : "#bfdbfe"}`,
          }}
        >
          {isConnected
            ? `Configure ${meta.subLabel} to update settings.`
            : `Configure ${meta.subLabel} to enable this integration.`}
        </div>

        {/* Configure button - now fixed position */}
        <div className="p-5 pt-3">
          <button
            onClick={() => onConfigure(meta)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: N }}
          >
            <Settings2 className="h-4 w-4" style={{ color: O }} />
            Configure
          </button>
        </div>
      </div>

      {/* Status footer - sticky at bottom */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-b-2xl border-t"
        style={{ borderColor: BD, background: BG }}
      >
        <span className="text-xs" style={{ color: MU }}>Status</span>
        {isConnected && isActive ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#16a34a" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MU }}>
            <XCircle className="h-3.5 w-3.5" />
            {isConnected ? "Disabled" : "Disconnected"}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allData,    setAllData]    = useState<Record<string, TabData>>({});
  const [activeTab,  setActiveTab]  = useState<TabFilter>("all");
  const [modalMeta,  setModalMeta]  = useState<CardMeta | null>(null);

  const fetchAll = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      const data = await integrationsAPI.getAll();
      setAllData(data as any);
    } catch (err) {
      console.error("fetchAll error:", err);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggle = async (tab: IntegrationTab, val: boolean) => {
    await integrationsAPI.toggleByTab(tab, val);
    toast.success(`${tab} ${val ? "enabled" : "disabled"}`);
    await fetchAll(true);
  };

  const handleSave = async (tab: IntegrationTab, config: Record<string, string>) => {
    await integrationsAPI.saveByTab(tab, config);
    toast.success(`${tab} configuration saved`);
    await fetchAll(true);
  };

  const visibleCards = CARD_META.filter(m =>
    activeTab === "all" ? true : m.category === activeTab
  );

  if (loading) return (
    <div className="flex justify-center py-2"><LoadingSpinner size="lg" /></div>
  );

  return (
<div className="flex flex-col p-5 sm:p-4 gap-5" style={{ background: BG,  overflow: "hidden" }}>

      {/* Header - responsive */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: N }}>
              <Zap className="h-4 w-4" style={{ color: O }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: N }}>Integrations</h1>
          </div>
          <p className="text-sm mt-0.5" style={{ color: MU }}>Configure platform settings and preferences</p>
        </div>

       
      </div>

      {/* Tab Filter Bar - responsive scroll */}
      <div
        className="flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto shrink-0"
        style={{ background: "white", border: `1px solid ${BD}` }}
      >
        {TAB_FILTERS.map(t => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: active ? N : "transparent",
                color:      active ? "white" : MU,
                boxShadow:  active ? `0 2px 8px ${N}30` : undefined,
              }}
            >
              <span style={{ color: active ? O : MU }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Cards Grid - responsive columns */}
<div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 cards-grid "
  style={{
    maxHeight: "calc(100vh - 250px)",   
    overflowY: "auto",
    paddingRight: "4px", 
    paddingBottom:"3px",          
    scrollbarWidth: "thin",        
    scrollbarColor: "#cbd5e1 transparent", 
    alignContent: "start",       
  }}
>   
    {visibleCards.map(meta => (
          <IntegrationCard
            key={meta.tab}
            meta={meta}
            data={allData[meta.tab] ?? null}
            onToggle={handleToggle}
            onConfigure={m => setModalMeta(m)}
          />
        ))}
      </div>

      {/* Configure Modal */}
      {modalMeta && (
        <ConfigureModal
          meta={modalMeta}
          config={allData[modalMeta.tab]?.config ?? {}}
          onClose={() => setModalMeta(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default IntegrationsPage;