import React, { useState } from 'react';
import { X, Crown, Star, Check, Zap, Shield, TrendingUp, Users, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      icon: Star,
      color: 'blue',
      monthlyPrice: 999,
      yearlyPrice: 9999,
      description: 'Perfect for casual property seekers',
      features: [
        'Browse unlimited properties',
        'Contact up to 5 owners per month',
        'Basic property alerts',
        'Standard customer support',
        'Mobile app access'
      ],
      limitations: [
        'Limited to 5 property contacts per month',
        'No priority support',
        'Basic search filters only'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      color: 'purple',
      monthlyPrice: 1999,
      yearlyPrice: 19999,
      popular: true,
      description: 'Most popular for serious buyers/sellers',
      features: [
        'Everything in Basic',
        'Unlimited property contacts',
        'Advanced AI property matching',
        'Priority customer support',
        'Detailed market analytics',
        'Property price predictions',
        'Virtual property tours',
        'Dedicated relationship manager',
        'Priority listing placement'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Zap,
      color: 'orange',
      monthlyPrice: 4999,
      yearlyPrice: 49999,
      description: 'For real estate professionals & agencies',
      features: [
        'Everything in Pro',
        'Multiple user accounts',
        'White-label solutions',
        'API access',
        'Custom integrations',
        'Advanced analytics dashboard',
        'Bulk property uploads',
        'Premium listing features',
        'Dedicated account manager',
        'Custom branding options'
      ],
      limitations: []
    }
  ];

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully subscribed to ${selectedPlan.toUpperCase()} plan!`);
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDiscountPercentage = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    return Math.round(((monthlyCost - yearlyPrice) / monthlyCost) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-600">Unlock premium features and find your dream property faster</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
              const discount = billingCycle === 'yearly' ? getDiscountPercentage(plan.monthlyPrice, plan.yearlyPrice) : 0;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                    isSelected
                      ? `border-${plan.color}-500 bg-${plan.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-r from-${plan.color}-500 to-${plan.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        per {billingCycle === 'yearly' ? 'year' : 'month'}
                      </div>
                      {billingCycle === 'yearly' && discount > 0 && (
                        <div className="text-sm text-green-600 font-semibold">
                          Save {discount}% annually
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Check className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <X className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                              <span className="text-sm text-gray-600">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      isSelected
                        ? `bg-gradient-to-r from-${plan.color}-600 to-${plan.color}-700 text-white`
                        : `border border-${plan.color}-600 text-${plan.color}-600 hover:bg-${plan.color}-50`
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Choose Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Subscribe?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Shield className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Verified Properties</h4>
                <p className="text-sm text-gray-600">Access to 100% verified properties with legal clearance</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="text-green-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Market Insights</h4>
                <p className="text-sm text-gray-600">AI-powered market trends and price predictions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="text-purple-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-gray-900">Expert Support</h4>
                <p className="text-sm text-gray-600">Dedicated support from real estate experts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>• Cancel anytime • 30-day money back guarantee • No hidden fees</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Crown size={18} />
                  <span>Subscribe Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;