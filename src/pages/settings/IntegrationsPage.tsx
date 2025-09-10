// IntegrationsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Phone,
  DollarSign,
  BarChart3,
  Calendar,
  FileText,
  Globe,
  Key,
  Link as LinkIcon,
  X,
  Copy,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import SMSConfigurationModal from './SettingsModals/SMSConfigurationModal';
import RazorpayConfigurationModal from './SettingsModals/RazorpayConfigurationModal';
import { smsIntegrationAPI } from '@/lib/smsIntegrationAPI';
import { razorpayIntegrationAPI } from '@/lib/razorpayIntegrationAPI';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  is_enabled: boolean;
  is_connected: boolean;
  config: Record<string, any>;
  last_sync?: string | null;
  sync_status: 'success' | 'error' | 'pending' | 'never';
  webhook_url?: string | null;
  api_key?: string | null;
  instructions?: string | null;
}

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsIntegration, setSmsIntegration] = useState<Integration | null>(null);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayIntegration, setRazorpayIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    fetchIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
// replace your sms fetch block with this:
const extractIntegrationData = (raw: any) => {
  if (!raw) return null;

  // axios response: raw.data => wrapper { success, data }
  if (raw.data && raw.data.success && raw.data.data) return raw.data.data;

  // sometimes backend returns wrapper already (when you passed response.data)
  if (raw.success && raw.data) return raw.data;

  // sometimes it's nested: raw.data.data (double wrapped)
  if (raw.data && raw.data.data) return raw.data.data;

  // sometimes the API returns the object directly (contains api_key/token keys)
  if (typeof raw === 'object' && (raw.api_key || raw.token || raw.sms_number || raw.is_active !== undefined))
    return raw;

  return null;
};

let smsData: any = null;
try {
  const smsResponse = await smsIntegrationAPI.getIntegration();
  console.log('sms raw response', smsResponse);
  smsData = extractIntegrationData(smsResponse);
  if (!smsData) {
    console.warn('SMS integration: no usable data extracted from response', smsResponse);
  } else {
    console.log('smsData (extracted)', smsData);
  }
} catch (err: any) {
  if (err?.response?.status === 404) {
    console.warn('SMS config not found (404)');
  } else {
    console.error('Error loading SMS integration', err);
  }
}

      // Fetch Razorpay config
      let razorpayData: any = null;
      try {
        const razorResp = await razorpayIntegrationAPI.getIntegration();
        const resp = razorResp?.data ?? razorResp ?? null;
        if (resp?.success && resp.data) {
          razorpayData = resp.data;
        } else {
          console.info('No Razorpay config from backend', resp?.message || '');
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          console.warn('Razorpay config not found (404)');
        } else {
          console.error('Error loading Razorpay integration', err);
        }
      }

      // Build integrations list (replace with backend list later if available)
      setIntegrations([
        {
          id: '1',
          name: 'Gmail',
          description: 'Send and receive emails through Gmail',
          category: 'email',
          provider: 'Google',
          is_enabled: true,
          is_connected: true,
          config: { email: 'admin@company.com' },
          last_sync: '2024-07-31T02:00:00Z',
          sync_status: 'success',
          instructions:
            'Connect your Gmail account to send automated emails and track email interactions.',
        },
        {
          id: '2',
          name: 'Outlook',
          description: 'Microsoft Outlook email integration',
          category: 'email',
          provider: 'Microsoft',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          instructions: 'Connect your Outlook account for email communication.',
        },
        {
          id: '3',
          name: 'SMS Integration',
          description: 'Send SMS messages through your configured provider',
          category: 'communication',
          provider: smsData?.provider || 'SMS',
          is_enabled: smsData ? Boolean(smsData?.is_active === 1 || smsData?.is_active === true) : false,
          is_connected: smsData ? !!smsData?.token : false,
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
        },
        {
          id: '4',
          name: 'WhatsApp Business',
          description: 'WhatsApp messaging for customer communication',
          category: 'communication',
          provider: 'Meta',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          instructions: 'Connect WhatsApp Business API for messaging.',
        },
        {
          id: '5',
          name: 'Razorpay',
          description: 'Razorpay payment gateway for India — payments, subscriptions and webhooks',
          category: 'payment',
          provider: 'Razorpay',
          is_enabled: razorpayData ? Boolean(razorpayData?.is_active === 1 || razorpayData?.is_active === true) : true,
          is_connected: razorpayData ? !!(razorpayData?.key_id) : false,
          config: {
            currency: razorpayData?.currency || 'INR',
            mode: razorpayData?.mode || 'test',
            key_id: razorpayData?.key_id ? String(razorpayData.key_id) : '',
            key_secret: razorpayData?.key_secret ?? null,
            webhook_secret: razorpayData?.webhook_secret ?? null,
            webhook_url: razorpayData?.webhook_url ?? null
          },
          last_sync: razorpayData?.updated_at ?? '',
          sync_status: razorpayData?.key_id ? 'success' : 'never',
          api_key: razorpayData?.key_id ?? '',
          webhook_url: razorpayData?.webhook_url ?? 'https://your-domain.com/webhooks/razorpay',
          instructions:
            'Configure Razorpay by setting Key ID on the frontend (only), keep secrets & webhook secret on server. Use backend endpoints to create orders and verify signatures.',
        },
        {
          id: '6',
          name: 'Google Analytics',
          description: 'Website analytics and tracking',
          category: 'analytics',
          provider: 'Google',
          is_enabled: true,
          is_connected: false,
          config: {},
          sync_status: 'error',
          instructions: 'Connect Google Analytics to track website performance.',
        },
        {
          id: '7',
          name: 'Calendly',
          description: 'Schedule meetings and appointments',
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
          id: '8',
          name: 'Zapier',
          description: 'Connect with 5000+ apps through Zapier',
          category: 'automation',
          provider: 'Zapier',
          is_enabled: false,
          is_connected: false,
          config: {},
          sync_status: 'never',
          webhook_url: 'https://your-domain.com/webhooks/zapier',
          instructions: 'Use Zapier to connect with thousands of third-party applications.',
        },
        {
          id: '9',
          name: 'ChatGPT',
          description:
            'Use OpenAI (ChatGPT) to generate text, summaries, responses and automate workflows.',
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
            'Configure ChatGPT by adding your OpenAI API key on the server (do NOT store keys in the frontend). Use server-side proxy endpoints to call OpenAI and route responses back to the app. Configure model, system prompt and safety settings here.',
        },
      ]);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  // Toggle using provider-specific API where relevant
  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      const integration = integrations.find((i) => i.id === integrationId);
      if (!integration) throw new Error('Integration not found');

      const payload: any = {
        id: integrationId,
        active: enabled ? 1 : 0,
      };

      let response: any = null;

      if (integration.provider === 'Razorpay' || integration.name === 'Razorpay') {
        response = await razorpayIntegrationAPI.toggleIntegration(payload);
      } else {
        response = await smsIntegrationAPI.toggleIntegration(payload);
      }

      console.log('✅ Toggle response:', response);

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? { ...integration, is_enabled: enabled } : integration
        )
      );

      toast.success(`Integration ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error: any) {
      console.error('❌ Error toggling integration:', error?.response?.data || error);
      toast.error(error?.response?.data?.message || 'Failed to update integration');
    }
  };

  const handleConfigure = (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);

    if (!integration) {
      console.error('Integration not found for ID:', integrationId);
      return;
    }

    if (
      integration.name === 'SMS Integration' ||
      integrationId === 'sms-integration' ||
      (integration.category === 'communication' && integration.config?.sms_provider)
    ) {
      setSmsIntegration(integration);
      setSmsModalOpen(true);
      return;
    }

    if (integration.name === 'Razorpay' || integration.provider === 'Razorpay' || integration.category === 'payment') {
      setRazorpayIntegration(integration);
      setRazorpayModalOpen(true);
      return;
    }

    setConfiguring(integrationId);
  };

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

      const response = await smsIntegrationAPI.saveIntegration(payload);
      console.log('✅ Backend response (SMS):', response);

      await fetchIntegrations();
      toast.success('SMS configuration saved successfully ✅');

      setSmsModalOpen(false);
      setSmsIntegration(null);
    } catch (error: any) {
      console.error('❌ Error saving SMS configuration:', error?.response?.data || error);
      toast.error(error?.response?.data?.message || 'Failed to save SMS configuration');
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
      // ---------- FIX: include webhook_url in payload ----------
      const payload = {
        provider: 'Razorpay',
        key_id: data.keyId,
        key_secret: data.keySecret || null,
        webhook_secret: data.webhookSecret || null,
        webhook_url: data.webhookUrl || null, // <-- added this line
        is_active: data.isActive ? 1 : 0,
        updatedBy: user?.id || 1,
      };

      // helpful debug log to confirm what we send
      console.log('🔁 Sending Razorpay payload to backend:', payload);

      const response = await razorpayIntegrationAPI.saveIntegration(payload as any);
      console.log('✅ Backend response (Razorpay):', response);

      await fetchIntegrations();
      toast.success('Razorpay configuration saved successfully ✅');

      setRazorpayModalOpen(false);
      setRazorpayIntegration(null);
    } catch (error: any) {
      console.error('❌ Error saving Razorpay configuration:', error?.response?.data || error);
      toast.error(error?.response?.data?.message || 'Failed to save Razorpay configuration');
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const filteredIntegrations =
    activeCategory === 'all' ? integrations : integrations.filter((integration) => integration.category === activeCategory);

  const categories = ['all', ...Array.from(new Set(integrations.map((i) => i.category)))];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/settings">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1">Connect with third-party services and tools</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeCategory === category ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              {category === 'all' ? 'All Integrations' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
            {integration.is_enabled && Object.keys(integration.config).length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-900">Configuration:</h4>
                {Object.entries(integration.config).map(([key, value]) => {
                  if (key === 'token') return null;
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-gray-900">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* API Key Display */}
            {integration.api_key && integration.api_key !== '-' && integration.is_enabled && (
              <div className="mb-4">
                <span className="text-xs text-gray-600 block mb-1">API Key:</span>
                <div className="relative">
                  <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 pr-10 rounded border break-all">{integration.api_key}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(integration.api_key || '');
                      toast.success('API Key copied to clipboard!');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Token Display */}
            {integration.config?.token && integration.config.token !== '-' && integration.is_enabled && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Token:</span>
                  <button
                    onClick={() => setShowApiKey({ ...showApiKey, [`${integration.id}_token`]: !showApiKey[`${integration.id}_token`] })}
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
                      toast.success('Token copied to clipboard!');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
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
                <div className="text-xs text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">{integration.webhook_url}</div>
              </div>
            )}

            {/* Status and Actions */}
            <div className="space-y-3">
              {integration.last_sync && (
                <div className="text-xs text-gray-500">
                  Last sync:{' '}
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

      {/* SMS Configuration Modal */}
      <SMSConfigurationModal
        isOpen={smsModalOpen}
        onClose={() => {
          setSmsModalOpen(false);
          setSmsIntegration(null);
        }}
        onSave={handleSaveSMSConfiguration}
        integration={smsIntegration}
      />

      {/* Razorpay Configuration Modal */}
      <RazorpayConfigurationModal
        isOpen={razorpayModalOpen}
        onClose={() => {
          setRazorpayModalOpen(false);
          setRazorpayIntegration(null);
        }}
        onSave={handleSaveRazorpayConfiguration}
        integration={razorpayIntegration}
      />

      {/* Generic Configuration Modal for other integrations */}
      {configuring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure {integrations.find((i) => i.id === configuring)?.name}</h3>
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Integration configuration UI would go here</p>
              <p className="text-sm text-gray-400 mt-2">This would include API key input, authentication flows, and specific settings for each integration.</p>
            </div>
            <div className="flex space-x-3">
              <Button className="flex-1">Save Configuration</Button>
              <Button variant="outline" onClick={() => setConfiguring(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
