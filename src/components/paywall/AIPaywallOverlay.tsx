import React, { useState } from 'react';
import { Lock, Crown, Zap, Star, CheckCircle, X, CreditCard, Eye } from 'lucide-react';

interface AIPaywallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: string) => void;
  featureType: 'ai-recommendations' | 'ai-investment' | 'premium-details';
}

const AIPaywallOverlay: React.FC<AIPaywallOverlayProps> = ({ 
  isOpen, 
  onClose, 
  onSubscribe, 
  featureType 
}) => {
  const [selectedPlan, setSelectedPlan] = useState('pay-per-view-5');

  if (!isOpen) return null;

  const featureTitles = {
    'ai-recommendations': 'AI Recommendations',
    'ai-investment': 'AI Investment Analysis', 
    'premium-details': 'Premium Property Details'
  };

  const payPerViewPlans = [
    {
      id: 'pay-per-view-5',
      name: '5 Property Views',
      price: 299,
      views: 5,
      validity: '1 Month',
      popular: false,
      features: [
        'AI Investment Analysis',
        'AI Recommendations',
        'Price Predictions',
        'Market Insights',
        'ROI Calculations'
      ]
    },
    {
      id: 'pay-per-view-12',
      name: '12 Property Views',
      price: 599,
      views: 12,
      validity: '1 Month',
      popular: true,
      features: [
        'Everything in 5 Views',
        'Advanced Market Analytics',
        'Detailed Investment Reports',
        'Priority Support',
        'Market Trend Reports'
      ]
    },
    {
      id: 'unlimited',
      name: 'Unlimited Views',
      price: 1999,
      views: 'Unlimited',
      validity: '1 Month',
      popular: false,
      features: [
        'Everything in 12 Views',
        'Unlimited AI Analysis',
        'Premium Customer Support',
        'Custom Investment Reports',
        'Real-time Market Alerts'
      ]
    }
  ];

  const handlePayment = () => {
    // Razorpay integration will be handled here
    const selectedPlanData = payPerViewPlans.find(plan => plan.id === selectedPlan);
    if (selectedPlanData) {
      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_your_key_here', // Replace with actual Razorpay key
        amount: selectedPlanData.price * 100, // Amount in paise
        currency: 'INR',
        name: 'ResaleExpert',
        description: `${selectedPlanData.name} - AI Property Analysis`,
        handler: function (response: any) {
        
          onSubscribe(selectedPlan);
          onClose();
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '+91 9999999999'
        },
        theme: {
          color: '#2563eb'
        }
      };

      // @ts-ignore - Razorpay will be loaded externally
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative  text-white p-6 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Unlock {featureTitles[featureType]}</h2>
            <p className="text-blue-100">Get detailed AI-powered insights for smarter property decisions</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
            <p className="text-gray-600">Pay only for what you need - no hidden charges</p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {payPerViewPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.id === 'pay-per-view-5' ? 'bg-blue-100' :
                    plan.id === 'pay-per-view-12' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {plan.id === 'pay-per-view-5' ? <Eye className="text-blue-600" size={24} /> :
                     plan.id === 'pay-per-view-12' ? <Crown className="text-purple-600" size={24} /> :
                     <Zap className="text-orange-600" size={24} />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">₹{plan.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{plan.views} views • {plan.validity}</div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={`text-center font-medium ${
                  selectedPlan === plan.id ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {payPerViewPlans.find(p => p.id === selectedPlan)?.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  Valid for {payPerViewPlans.find(p => p.id === selectedPlan)?.validity}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{payPerViewPlans.find(p => p.id === selectedPlan)?.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">One-time payment</div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="w-full  bg-[#E6761D]  hover:bg-[#E6761D]  text-white py-4 px-6 rounded-xl transition-all font-semibold text-lg flex items-center justify-center space-x-2"
            >
              <CreditCard size={20} />
              <span>Pay with Razorpay</span>
            </button>

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-500" size={14} />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-500" size={14} />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="text-green-500" size={14} />
                  <span>No Auto-renewal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPaywallOverlay;