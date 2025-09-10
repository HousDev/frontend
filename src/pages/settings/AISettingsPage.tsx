import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Brain,
  Target,
  MessageSquare,
  TrendingUp,
  Users,
  Building,
  Mail,
  Phone,
  Calendar,
  Save,
  RotateCcw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

interface AISettings {
  lead_scoring: {
    enabled: boolean;
    model: string;
    confidence_threshold: number;
    auto_update_scores: boolean;
    factors: {
      email_engagement: number;
      website_activity: number;
      demographic_data: number;
      interaction_frequency: number;
      budget_qualification: number;
    };
  };
  property_recommendations: {
    enabled: boolean;
    algorithm: string;
    max_recommendations: number;
    update_frequency: string;
    consider_budget: boolean;
    consider_location: boolean;
    consider_preferences: boolean;
  };
  chatbot: {
    enabled: boolean;
    personality: string;
    response_tone: string;
    auto_escalate: boolean;
    escalation_triggers: string[];
    business_hours_only: boolean;
    languages: string[];
  };
  automated_communications: {
    enabled: boolean;
    welcome_emails: boolean;
    follow_up_reminders: boolean;
    property_alerts: boolean;
    appointment_confirmations: boolean;
    lead_nurturing: boolean;
    personalization_level: string;
  };
  predictive_analytics: {
    enabled: boolean;
    sales_forecasting: boolean;
    market_trend_analysis: boolean;
    customer_lifetime_value: boolean;
    churn_prediction: boolean;
    price_optimization: boolean;
  };
}

const AISettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'scoring' | 'recommendations' | 'chatbot' | 'communications' | 'analytics'>('scoring');

  useEffect(() => {
    fetchAISettings();
  }, []);

  const fetchAISettings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setSettings({
        lead_scoring: {
          enabled: true,
          model: 'advanced',
          confidence_threshold: 0.75,
          auto_update_scores: true,
          factors: {
            email_engagement: 25,
            website_activity: 20,
            demographic_data: 15,
            interaction_frequency: 25,
            budget_qualification: 15,
          },
        },
        property_recommendations: {
          enabled: true,
          algorithm: 'collaborative_filtering',
          max_recommendations: 10,
          update_frequency: 'daily',
          consider_budget: true,
          consider_location: true,
          consider_preferences: true,
        },
        chatbot: {
          enabled: false,
          personality: 'professional',
          response_tone: 'helpful',
          auto_escalate: true,
          escalation_triggers: ['pricing', 'technical_support', 'complaints'],
          business_hours_only: true,
          languages: ['en', 'es'],
        },
        automated_communications: {
          enabled: true,
          welcome_emails: true,
          follow_up_reminders: true,
          property_alerts: true,
          appointment_confirmations: true,
          lead_nurturing: false,
          personalization_level: 'medium',
        },
        predictive_analytics: {
          enabled: true,
          sales_forecasting: true,
          market_trend_analysis: false,
          customer_lifetime_value: true,
          churn_prediction: false,
          price_optimization: false,
        },
      });
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      toast.error('Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('AI settings saved successfully');
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast.error('Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof AISettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const updateNestedSettings = (section: keyof AISettings, nestedSection: string, field: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [nestedSection]: {
          ...(settings[section] as any)[nestedSection],
          [field]: value,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Settings Not Available</h2>
          <p className="text-gray-600 mb-6">Unable to load AI settings. Please try again later.</p>
          <Button onClick={fetchAISettings}>Retry</Button>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900">AI Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure AI features and automation
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchAISettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* AI Features Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered CRM</h2>
            <p className="text-gray-600">Enhance your CRM with artificial intelligence and automation</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="font-medium">Lead Scoring</span>
            </div>
            <p className="text-sm text-gray-600">Automatically score leads based on behavior and demographics</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Smart Recommendations</span>
            </div>
            <p className="text-sm text-gray-600">AI-powered property recommendations for buyers</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Predictive Analytics</span>
            </div>
            <p className="text-sm text-gray-600">Forecast sales trends and market opportunities</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('scoring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Lead Scoring</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Recommendations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chatbot'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chatbot</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('communications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'communications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Auto Communications</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Predictive Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'scoring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Lead Scoring Configuration</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lead_scoring.enabled}
                    onChange={(e) => updateSettings('lead_scoring', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.lead_scoring.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scoring Model</label>
                      <select
                        value={settings.lead_scoring.model}
                        onChange={(e) => updateSettings('lead_scoring', 'model', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="basic">Basic Model</option>
                        <option value="advanced">Advanced Model</option>
                        <option value="custom">Custom Model</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confidence Threshold ({(settings.lead_scoring.confidence_threshold * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={settings.lead_scoring.confidence_threshold}
                        onChange={(e) => updateSettings('lead_scoring', 'confidence_threshold', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        checked={settings.lead_scoring.auto_update_scores}
                        onChange={(e) => updateSettings('lead_scoring', 'auto_update_scores', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">Auto-update scores when new data is available</label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Scoring Factors (Total: {Object.values(settings.lead_scoring.factors).reduce((a, b) => a + b, 0)}%)</h4>
                    <div className="space-y-4">
                      {Object.entries(settings.lead_scoring.factors).map(([factor, weight]) => (
                        <div key={factor} className="flex items-center justify-between">
                          <label className="text-sm text-gray-700 capitalize">
                            {factor.replace('_', ' ')}
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={weight}
                              onChange={(e) => updateNestedSettings('lead_scoring', 'factors', factor, parseInt(e.target.value))}
                              className="w-32"
                            />
                            <span className="text-sm text-gray-900 w-8">{weight}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Property Recommendations</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.property_recommendations.enabled}
                    onChange={(e) => updateSettings('property_recommendations', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.property_recommendations.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
                      <select
                        value={settings.property_recommendations.algorithm}
                        onChange={(e) => updateSettings('property_recommendations', 'algorithm', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="collaborative_filtering">Collaborative Filtering</option>
                        <option value="content_based">Content-Based</option>
                        <option value="hybrid">Hybrid Approach</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Recommendations</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.property_recommendations.max_recommendations}
                        onChange={(e) => updateSettings('property_recommendations', 'max_recommendations', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Frequency</label>
                      <select
                        value={settings.property_recommendations.update_frequency}
                        onChange={(e) => updateSettings('property_recommendations', 'update_frequency', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Recommendation Factors</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'consider_budget', label: 'Consider budget constraints' },
                        { key: 'consider_location', label: 'Consider location preferences' },
                        { key: 'consider_preferences', label: 'Consider property type preferences' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(settings.property_recommendations as any)[key]}
                            onChange={(e) => updateSettings('property_recommendations', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label className="text-sm text-gray-700">{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chatbot' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI Chatbot</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chatbot.enabled}
                    onChange={(e) => updateSettings('chatbot', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.chatbot.enabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Personality</label>
                      <select
                        value={settings.chatbot.personality}
                        onChange={(e) => updateSettings('chatbot', 'personality', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Response Tone</label>
                      <select
                        value={settings.chatbot.response_tone}
                        onChange={(e) => updateSettings('chatbot', 'response_tone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="helpful">Helpful</option>
                        <option value="informative">Informative</option>
                        <option value="empathetic">Empathetic</option>
                        <option value="direct">Direct</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'auto_escalate', label: 'Auto-escalate complex queries to human agents' },
                      { key: 'business_hours_only', label: 'Only operate during business hours' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(settings.chatbot as any)[key]}
                          onChange={(e) => updateSettings('chatbot', key, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-700">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Automated Communications</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.automated_communications.enabled}
                    onChange={(e) => updateSettings('automated_communications', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.automated_communications.enabled && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personalization Level</label>
                    <select
                      value={settings.automated_communications.personalization_level}
                      onChange={(e) => updateSettings('automated_communications', 'personalization_level', e.target.value)}
                      className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="basic">Basic</option>
                      <option value="medium">Medium</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Automated Messages</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'welcome_emails', label: 'Welcome emails for new leads', icon: <Mail className="h-4 w-4" /> },
                        { key: 'follow_up_reminders', label: 'Follow-up reminders for agents', icon: <Calendar className="h-4 w-4" /> },
                        { key: 'property_alerts', label: 'Property match alerts for buyers', icon: <Building className="h-4 w-4" /> },
                        { key: 'appointment_confirmations', label: 'Appointment confirmations', icon: <CheckCircle className="h-4 w-4" /> },
                        { key: 'lead_nurturing', label: 'Lead nurturing campaigns', icon: <TrendingUp className="h-4 w-4" /> },
                      ].map(({ key, label, icon }) => (
                        <div key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <input
                            type="checkbox"
                            checked={(settings.automated_communications as any)[key]}
                            onChange={(e) => updateSettings('automated_communications', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="text-blue-600">{icon}</div>
                          <label className="text-sm text-gray-700 flex-1">{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.predictive_analytics.enabled}
                    onChange={(e) => updateSettings('predictive_analytics', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.predictive_analytics.enabled && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Premium Feature</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Predictive analytics requires advanced AI models and significant computational resources. 
                          Some features may require additional subscription tiers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Available Analytics</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'sales_forecasting', label: 'Sales forecasting and pipeline prediction' },
                        { key: 'market_trend_analysis', label: 'Market trend analysis and insights' },
                        { key: 'customer_lifetime_value', label: 'Customer lifetime value calculation' },
                        { key: 'churn_prediction', label: 'Churn prediction and risk assessment' },
                        { key: 'price_optimization', label: 'Property price optimization suggestions' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <label className="text-sm text-gray-700 flex-1">{label}</label>
                          <input
                            type="checkbox"
                            checked={(settings.predictive_analytics as any)[key]}
                            onChange={(e) => updateSettings('predictive_analytics', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISettingsPage;