// src/pages/settings/IntegrationsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  DollarSign,
  BarChart3,
  Calendar,
  Globe,
  Link as LinkIcon,
  Copy,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import SMSConfigurationModal from './SettingsModals/SMSConfigurationModal';
import RazorpayConfigurationModal from './SettingsModals/RazorpayConfigurationModal';
import StripeConfigurationModal from './SettingsModals/StripeConfigurationModal';
import EmailConfigurationModal from './SettingsModals/EmailConfiguration';

import { toast } from 'react-toastify';
import { smsIntegrationAPI } from '@/lib/smsIntegrationAPI';
import { razorpayIntegrationAPI } from '@/lib/razorpayIntegrationAPI';
import { stripeIntegrationAPI } from '@/lib/stripeIntegrationAPI';
import { emailIntegrationAPI } from '@/lib/emailIntegrationAPI';
import ChatGPTConfigurationModal from './SettingsModals/ChatGPTConfigurationModal';
import WhatsAppConfigurationModal from './SettingsModals/WhatsAppConfigurationModal'; // ✅ ADDED

type SyncStatus = 'success' | 'error' | 'pending' | 'never';

interface Integration {
  id: string;
  name: string;
  description: string;
  category:
  | 'email'
  | 'communication'
  | 'payment'
  | 'analytics'
  | 'scheduling'
  | 'automation'
  | 'ai'
  | string;
  provider: string;
  is_enabled: boolean;
  is_connected: boolean;
  config: Record<string, any>;
  last_sync?: string | null;
  sync_status: SyncStatus;
  webhook_url?: string | null;
  api_key?: string | null;
  instructions?: string | null;
}

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Modals
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsIntegration, setSmsIntegration] = useState<Integration | null>(null);

  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayIntegration, setRazorpayIntegration] = useState<Integration | null>(null);

  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeIntegration, setStripeIntegration] = useState<Integration | null>(null);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailIntegration, setEmailIntegration] = useState<Integration | null>(null);

  const [chatgptModalOpen, setChatgptModalOpen] = useState(false);
  const [chatgptIntegration, setChatgptIntegration] = useState<Integration | null>(null);

  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappIntegration, setWhatsappIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    fetchIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Extracts the meaningful payload regardless of nesting */
  const extract = (raw: any) => {
    if (!raw) return null;
    const a = raw?.data;
    if (a?.success && a?.data) return a.data;
    if (a?.data) return a.data;
    if (a) return a;
    if (raw?.success && raw?.data) return raw.data;
    return raw;
  };

  const fetchIntegrations = async () => {
    try {
      setLoading(true);

      // ---- SMS
      let smsData: any = null;
      try {
        const resp = await smsIntegrationAPI.getIntegration();
        smsData = extract(resp);
      } catch (e: any) {
        if (e?.response?.status !== 404) console.error('SMS fetch error', e);
      }

      // ---- Razorpay
      let razorpayData: any = null;
      try {
        const resp = await razorpayIntegrationAPI.getIntegration();
        const data = extract(resp);
        razorpayData = data?.success && data?.data ? data.data : data;
      } catch (e: any) {
        if (e?.response?.status !== 404) console.error('Razorpay fetch error', e);
      }

      // ---- Stripe
      let stripeData: any = null;
      try {
        if (stripeIntegrationAPI?.getIntegration) {
          const resp = await stripeIntegrationAPI.getIntegration();
          stripeData = extract(resp);
        }
      } catch (e) {
        console.info('Stripe fetch skipped/failed', e);
      }

      // ---- Email (SMTP)
      let emailData: any = null;
      try {
        const resp = await emailIntegrationAPI.getIntegration();
        emailData = extract(resp);
      } catch (e: any) {
        if (e?.response?.status !== 404) console.error('Email fetch error', e);
      }

      const emailIntegrationRow: Integration = {
        id: String(emailData?.id ?? 'email-smtp'),
        name: (emailData?.provider || emailData?.config?.smtp_provider || 'SMTP')
          .toString()
          .toUpperCase(),
        description: 'Send and receive emails via SMTP (Gmail/Zoho/SES/Mailgun).',
        category: 'email',
        provider: (emailData?.provider && emailData?.provider.toString()) || 'SMTP',
        is_enabled: Boolean(emailData?.is_active === 1 || emailData?.is_active === true),
        is_connected: Boolean(
          (emailData?.username || emailData?.config?.username) &&
          (emailData?.password || emailData?.config?.password) &&
          (emailData?.host || emailData?.config?.host) &&
          (emailData?.port || emailData?.config?.port)
        ),
        config: {
          driver: emailData?.driver ?? 'SMTP',
          smtp_provider:
            (emailData?.config?.smtp_provider || emailData?.provider || 'SMTP')
              .toString()
              .toUpperCase(),
          host: emailData?.config?.host ?? emailData?.host ?? '',
          port: emailData?.config?.port ?? emailData?.port ?? '',
          security: emailData?.config?.security ?? emailData?.security ?? 'STARTTLS',
          username: emailData?.config?.username ?? emailData?.username ?? '',
          password: emailData?.config?.password ?? emailData?.password ?? '',
          from_address: emailData?.config?.from_address ?? emailData?.from_address ?? '',
          from_name: emailData?.config?.from_name ?? emailData?.from_name ?? '',
        },
        last_sync: emailData?.updated_at ?? null,
        sync_status: emailData ? 'success' : 'never',
        instructions: emailData
          ? 'SMTP configured. You can update From name/address.'
          : 'Save SMTP settings to enable email sending.',
      };

      const smsIntegrationRow: Integration = {
        id: 'sms-default',
        name: 'SMS Integration',
        description: 'Send SMS messages through your configured provider.',
        category: 'communication',
        provider: smsData?.provider || 'SMS',
        is_enabled: Boolean(smsData?.is_active === 1 || smsData?.is_active === true),
        is_connected: Boolean(smsData?.token),
        config: {
          sms_provider: smsData?.provider || null,
          from_number: smsData?.sms_number || null,
          sender_name: smsData?.sms_from || null,
          token: smsData?.token ?? null,
        },
        last_sync: smsData?.updated_at ?? null,
        sync_status: smsData?.token ? 'success' : 'never',
        api_key: smsData?.api_key ?? null,
        instructions: 'Configure your SMS provider to send notifications and alerts.',
        webhook_url: smsData?.webhook_url ?? null,
      };

      // ---- WhatsApp Business (placeholder)
      const whatsappBusinessRow: Integration = {
        id: 'whatsapp-business',
        name: 'WhatsApp Business',
        description: 'WhatsApp messaging for customer communication.',
        category: 'communication',
        provider: 'Meta',
        is_enabled: false,
        is_connected: false,
        config: {},
        last_sync: null,
        sync_status: 'never',
        webhook_url: null,
        instructions: 'Connect Meta WhatsApp Cloud API to enable WhatsApp messaging.',
      };

      const razorpayRow: Integration = {
        id: 'razorpay',
        name: 'Razorpay',
        description:
          'Razorpay payment gateway for India — payments, subscriptions and webhooks.',
        category: 'payment',
        provider: 'Razorpay',
        is_enabled: Boolean(razorpayData?.is_active === 1 || razorpayData?.is_active === true),
        is_connected: Boolean(razorpayData?.key_id),
        config: {
          currency: razorpayData?.currency || 'INR',
          mode: razorpayData?.mode || 'test',
          key_id: razorpayData?.key_id ? String(razorpayData.key_id) : '',
          key_secret: razorpayData?.key_secret ?? null,
          webhook_secret: razorpayData?.webhook_secret ?? null,
          webhook_url: razorpayData?.webhook_url ?? null,
        },
        last_sync: razorpayData?.updated_at ?? null,
        sync_status: razorpayData?.key_id ? 'success' : 'never',
        api_key: razorpayData?.key_id ?? null,
        webhook_url: razorpayData?.webhook_url ?? null,
        instructions:
          'Set Key ID/Secret & Webhook secret on server. Use backend to create orders and verify signatures.',
      };

      const stripeRow: Integration = {
        id: 'stripe',
        name: 'Stripe',
        description: 'Stripe payment gateway — global payments, billing & webhooks.',
        category: 'payment',
        provider: 'Stripe',
        is_enabled: Boolean(stripeData?.is_active === 1 || stripeData?.is_active === true),
        is_connected: Boolean(stripeData?.publishable_key),
        config: {
          currency: stripeData?.currency || 'INR',
          mode: stripeData?.mode || 'test',
          publishable_key: stripeData?.publishable_key ?? '',
          secret_key: stripeData?.secret_key ?? null,
          webhook_secret: stripeData?.webhook_secret ?? null,
          webhook_url: stripeData?.webhook_url ?? null,
        },
        last_sync: stripeData?.updated_at ?? null,
        sync_status: stripeData?.publishable_key ? 'success' : 'never',
        api_key: stripeData?.publishable_key ?? null,
        webhook_url: stripeData?.webhook_url ?? null,
        instructions: 'Provide publishable & secret keys. Verify webhooks on the server.',
      };

      const placeholders: Integration[] = [
        {
          id: 'email-outlook',
          name: 'Outlook',
          description: 'Microsoft Outlook email integration (SMTP).',
          category: 'email',
          provider: 'Microsoft',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          instructions: 'Add your Outlook SMTP to use this.',
        },
        {
          id: 'ga',
          name: 'Google Analytics',
          description: 'Website analytics and tracking.',
          category: 'analytics',
          provider: 'Google',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          instructions: 'Connect Google Analytics to track website performance.',
        },
        {
          id: 'calendly',
          name: 'Calendly',
          description: 'Schedule meetings and appointments.',
          category: 'scheduling',
          provider: 'Calendly',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          webhook_url: 'https://your-domain.com/webhooks/calendly',
          instructions: 'Integrate Calendly for automated appointment scheduling.',
        },
        {
          id: 'zapier',
          name: 'Zapier',
          description: 'Connect with 5000+ apps through Zapier.',
          category: 'automation',
          provider: 'Zapier',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          webhook_url: 'https://your-domain.com/webhooks/zapier',
          instructions: 'Use Zapier to connect with third-party applications.',
        },
        {
          id: 'chatgpt',
          name: 'ChatGPT',
          description: 'Use OpenAI to generate text and automate workflows.',
          category: 'ai',
          provider: 'OpenAI',
          is_enabled: false,
          is_connected: false,
          config: {
            model: 'gpt-4o-mini',
            system_prompt: 'You are a helpful assistant for customer support.',
            max_tokens: 1024,
            temperature: 0.7,
            token: null,
          },
          last_sync: null,
          sync_status: 'never',
          api_key: null,
          webhook_url: 'https://your-domain.com/webhooks/chatgpt',
          instructions:
            'Add your OpenAI API key on the server (do NOT store keys in the frontend).',
        },
      ];

      setIntegrations([
        emailIntegrationRow,
        smsIntegrationRow,
        whatsappBusinessRow,
        razorpayRow,
        stripeRow,
        ...placeholders,
      ]);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  // Toggle using provider-specific APIs with correct payloads
  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    // optimistic update
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, is_enabled: enabled } : i))
    );

    try {
      const integration = integrations.find((i) => i.id === integrationId);
      if (!integration) throw new Error('Integration not found');

      let resp: any = null;

      if (integration.id === 'razorpay' || integration.provider === 'Razorpay') {
        resp = await razorpayIntegrationAPI.toggleIntegration?.({ active: enabled });
      } else if (integration.id === 'stripe' || integration.provider === 'Stripe') {
        resp = await stripeIntegrationAPI.toggleIntegration?.({ active: enabled });
      } else if (integration.category === 'email') {
        resp = await emailIntegrationAPI.toggleIntegration?.({ id: integrationId, enabled });
      } else if (
        integration.category === 'communication' ||
        integration.id === 'sms-default' ||
        integration.id === 'whatsapp-business'
      ) {
        // resp = await smsIntegrationAPI.toggleIntegration?.({ active: enabled });
      } else if (integration.id === 'chatgpt' || integration.category === 'ai' || integration.provider === 'OpenAI') {
        // Placeholder: wire to your backend when ready
        // resp = await chatgptIntegrationAPI.toggleIntegration?.({ active: enabled });
        toast.success(`ChatGPT ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        // Fallback for unknowns
        toast.info('Toggle saved locally. Wire up a backend API for this provider.');
      }

      toast.success(`Integration ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error: any) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, is_enabled: !enabled } : i))
      );
      console.error('Toggle error:', error?.response?.data || error);
      toast.error(error?.response?.data?.message || 'Failed to update integration');
    }
  };

  const handleConfigure = (integrationId: string) => {
    const i = integrations.find((x) => x.id === integrationId);
    if (!i) return;

    if (i.category === 'communication' && (i.id === 'sms-default' || i.name.includes('SMS'))) {
      setSmsIntegration(i);
      setSmsModalOpen(true);
      return;
    }
    if (i.id === 'razorpay' || i.provider === 'Razorpay') {
      setRazorpayIntegration(i);
      setRazorpayModalOpen(true);
      return;
    }
    if (i.id === 'stripe' || i.provider === 'Stripe') {
      setStripeIntegration(i);
      setStripeModalOpen(true);
      return;
    }
    if (i.category === 'email') {
      setEmailIntegration(i);
      setEmailModalOpen(true);
      return;
    }
    // ✅ WhatsApp Business (Meta)
    if (i.id === 'whatsapp-business' || i.provider === 'Meta') {
      setWhatsappIntegration(i);
      setWhatsappModalOpen(true);
      return;
    }
    // ✅ ChatGPT / OpenAI
    if (i.id === 'chatgpt' || i.category === 'ai' || i.provider === 'OpenAI') {
      setChatgptIntegration(i);
      setChatgptModalOpen(true);
      return;
    }

    toast.info('No configuration UI for this integration yet.');
  };

  // ---- Save handlers
  const handleSaveSMSConfiguration = async (formData: any) => {
    try {
      const payload = {
        provider: formData.provider,
        apiKey: formData.apiKey,
        token: formData.token,
        smsNumber: formData.smsNumber,
        smsFrom: formData.smsFrom,
        createdBy: user?.id || 1,
      };
      const resp = await smsIntegrationAPI.saveIntegration(payload);
    
      await fetchIntegrations();
      toast.success('SMS configuration saved successfully');
      setSmsModalOpen(false);
      setSmsIntegration(null);
    } catch (e: any) {
      console.error('SMS save error', e?.response?.data || e);
      toast.error(e?.response?.data?.message || 'Failed to save SMS configuration');
    }
  };

  const handleSaveRazorpayConfiguration = async (data: {
    keyId: string;
    keySecret?: string | null;
    webhookSecret?: string | null;
    webhookUrl?: string | null;
    isActive?: boolean;
  }) => {
    try {
      const payload = {
        provider: 'Razorpay',
        key_id: data.keyId,
        key_secret: data.keySecret ?? null,
        webhook_secret: data.webhookSecret ?? null,
        webhook_url: data.webhookUrl ?? null,
        is_active: data.isActive ? 1 : 0,
        updatedBy: user?.id || 1,
      };
      const resp = await razorpayIntegrationAPI.saveIntegration(payload as any);
    
      await fetchIntegrations();
      toast.success('Razorpay configuration saved successfully');
      setRazorpayModalOpen(false);
      setRazorpayIntegration(null);
    } catch (e: any) {
      console.error('Razorpay save error', e?.response?.data || e);
      toast.error(e?.response?.data?.message || 'Failed to save Razorpay configuration');
    }
  };

  const handleSaveStripeConfiguration = async (data: {
    publishableKey: string;
    secretKey?: string | null;
    webhookSecret?: string | null;
    webhookUrl?: string | null;
    isActive?: boolean;
  }) => {
    try {
      const payload = {
        provider: 'Stripe',
        publishable_key: data.publishableKey,
        secret_key: data.secretKey ?? null,
        webhook_secret: data.webhookSecret ?? null,
        webhook_url: data.webhookUrl ?? null,
        is_active: data.isActive ? 1 : 0,
        updatedBy: user?.id || 1,
      };
      const resp = await stripeIntegrationAPI.saveIntegration(payload as any);
      
      await fetchIntegrations();
      toast.success('Stripe configuration saved successfully');
      setStripeModalOpen(false);
      setStripeIntegration(null);
    } catch (e: any) {
      console.error('Stripe save error', e?.response?.data || e);
      toast.error(e?.response?.data?.message || 'Failed to save Stripe configuration');
    }
  };

  const handleSaveEmailConfiguration = async (payload: any) => {
    try {
      const resp = await emailIntegrationAPI.saveIntegration(payload);
     
      await fetchIntegrations();
      toast.success('Email configuration saved successfully');
      setEmailModalOpen(false);
      setEmailIntegration(null);
    } catch (e: any) {
      console.error('Email save error', e?.response?.data || e);
      toast.error(e?.response?.data?.message || 'Failed to save Email configuration');
    }
  };

  const handleSaveChatGPTConfiguration = async (data: { provider: 'OpenAI'; api_key: string; is_active?: boolean }) => {
    try {
      // If you have a dedicated API module, call it here later.
      toast.success('ChatGPT API key updated ✅');
      await fetchIntegrations();
      setChatgptModalOpen(false);
      setChatgptIntegration(null);
    } catch (e: any) {
      console.error('ChatGPT save error', e?.response?.data || e);
      toast.error(e?.response?.data?.message || 'Failed to save ChatGPT configuration');
    }
  };

  // ✅ WhatsApp save handler
  const handleSaveWhatsAppConfiguration = async (data: {
    provider: string;
    phone_number_id: string;
    waba_id: string;
    access_token: string;
    webhook_url?: string | null;
    is_active?: boolean;
  }) => {
    try {
      // Wire your backend here in future (e.g., whatsappIntegrationAPI.saveIntegration(data))
      
      toast.success('WhatsApp Business configuration saved successfully');
      await fetchIntegrations();
      setWhatsappModalOpen(false);
      setWhatsappIntegration(null);
    } catch (e: any) {
      console.error('WhatsApp save error', e?.response?.data || e);
      toast.error(e?.response?.data?.message || 'Failed to save WhatsApp configuration');
    }
  };

  const getStatusColor = (status: SyncStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5" />;
      case 'payment':
        return <DollarSign className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'scheduling':
        return <Calendar className="h-5 w-5" />;
      case 'automation':
        return <Zap className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const visibleIntegrations =
    activeCategory === 'all' ? integrations : integrations.filter((i) => i.category === activeCategory);

  const categories = ['all', ...Array.from(new Set(integrations.map((i) => i.category)))];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <Link to="/dashboard/settings">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Connect with third-party services and tools</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeCategory === c ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              {c === 'all' ? 'All Integrations' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {visibleIntegrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getCategoryIcon(integration.category)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-600">{integration.provider}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 ${getStatusColor(integration.sync_status)}`}>
                  {getStatusIcon(integration.sync_status)}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={integration.is_enabled}
                    onChange={(e) => handleToggleIntegration(integration.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

            {integration.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">{integration.instructions}</p>
              </div>
            )}

            {/* Configuration Details */}
            {integration.is_enabled && Object.keys(integration.config || {}).length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-900">Configuration:</h4>
                {Object.entries(integration.config)
                  .filter(([k, v]) => v !== null && v !== undefined && v !== '' && k !== 'password' && k !== 'token')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-gray-900">{String(value)}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* API Key */}
            {integration.api_key && integration.is_enabled && (
              <div className="mb-4">
                <span className="text-xs text-gray-600 block mb-1">API Key:</span>
                <div className="relative">
                  <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 pr-10 rounded border break-all">
                    {integration.api_key}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(integration.api_key || '');
                      toast.success('API Key copied to clipboard');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Token */}
            {integration.config?.token && integration.is_enabled && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Token:</span>
                  <button
                    onClick={() =>
                      setShowApiKey((s) => ({ ...s, [`${integration.id}_token`]: !s[`${integration.id}_token`] }))
                    }
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showApiKey[`${integration.id}_token`] ? (
                      <>
                        <EyeOff className="h-3 w-3 inline mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 inline mr-1" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 pr-10 rounded border">
                    {showApiKey[`${integration.id}_token`] ? integration.config.token : '••••••••••••••••'}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(integration.config.token || '');
                      toast.success('Token copied to clipboard');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Webhook URL */}
            {integration.webhook_url && integration.is_enabled && (
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-1">
                  <LinkIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">Webhook URL:</span>
                </div>
                <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
                  {integration.webhook_url}
                </div>
              </div>
            )}

            {/* Status & Actions */}
            <div className="space-y-3">
              {integration.last_sync && (
                <div className="text-xs text-gray-500">
                  Last sync{' '}
                  {(() => {
                    try {
                      return new Date(integration.last_sync as string).toLocaleString();
                    } catch {
                      return integration.last_sync;
                    }
                  })()}
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleConfigure(integration.id)}>
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <div className="flex items-center space-x-1">
                  {integration.is_enabled && integration.is_connected ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SMS Modal */}
      <SMSConfigurationModal
        isOpen={smsModalOpen}
        onClose={() => {
          setSmsModalOpen(false);
          setSmsIntegration(null);
        }}
        onSave={handleSaveSMSConfiguration}
        integration={smsIntegration}
      />

      {/* Razorpay Modal */}
      <RazorpayConfigurationModal
        isOpen={razorpayModalOpen}
        onClose={() => {
          setRazorpayModalOpen(false);
          setRazorpayIntegration(null);
        }}
        onSave={handleSaveRazorpayConfiguration}
        integration={
          razorpayIntegration
            ? {
              id: razorpayIntegration.id,
              api_key: razorpayIntegration.api_key ?? null,
              config: razorpayIntegration.config ?? null,
              is_enabled: razorpayIntegration.is_enabled ?? false,
            }
            : null
        }
      />

      {/* Stripe Modal */}
      <StripeConfigurationModal
        isOpen={stripeModalOpen}
        onClose={() => {
          setStripeModalOpen(false);
          setStripeIntegration(null);
        }}
        onSave={handleSaveStripeConfiguration}
        integration={
          stripeIntegration
            ? {
              id: stripeIntegration.id,
              api_key: stripeIntegration.api_key ?? null,
              config: stripeIntegration.config ?? null,
              is_enabled: stripeIntegration.is_enabled ?? false,
            }
            : null
        }
      />

      {/* Email Modal */}
      <EmailConfigurationModal
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setEmailIntegration(null);
        }}
        onSave={handleSaveEmailConfiguration}
        integration={
          emailIntegration
            ? {
              id: emailIntegration.id,
              api_secret: emailIntegration.config?.password ?? '',
              api_key: emailIntegration.config?.username ?? '',
              config: {
                smtp_provider:
                  (emailIntegration.config?.smtp_provider || emailIntegration.name || 'SMTP').toUpperCase(),
                driver: 'SMTP',
                provider_name: emailIntegration.name,
                host: emailIntegration.config?.host || '',
                port: emailIntegration.config?.port || '',
                security: emailIntegration.config?.security || 'NONE',
                username: emailIntegration.config?.username || '',
                password: emailIntegration.config?.password || '',
                from_address: emailIntegration.config?.from_address || '',
                from_name: emailIntegration.config?.from_name || '',
              },
              is_enabled: emailIntegration.is_enabled ?? false,
            }
            : null
        }
      />

      {/* ChatGPT Modal */}
      <ChatGPTConfigurationModal
        isOpen={chatgptModalOpen}
        onClose={() => {
          setChatgptModalOpen(false);
          setChatgptIntegration(null);
        }}
        onSave={handleSaveChatGPTConfiguration}
        integration={
          chatgptIntegration
            ? {
              id: chatgptIntegration.id,
              is_enabled: chatgptIntegration.is_enabled ?? false,
              api_key: chatgptIntegration.api_key ?? null,
              config: chatgptIntegration.config ?? null,
            }
            : null
        }
      />

      {/* ✅ WhatsApp Modal */}
      <WhatsAppConfigurationModal
        isOpen={whatsappModalOpen}
        onClose={() => {
          setWhatsappModalOpen(false);
          setWhatsappIntegration(null);
        }}
        onSave={handleSaveWhatsAppConfiguration}
        integration={
          whatsappIntegration
            ? {
              id: whatsappIntegration.id,
              config: whatsappIntegration.config ?? null,
              is_enabled: whatsappIntegration.is_enabled ?? false,
            }
            : null
        }
      />
    </div>
  );
};

export default IntegrationsPage;
