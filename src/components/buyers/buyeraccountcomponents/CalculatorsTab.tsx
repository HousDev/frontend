import React from 'react';
import { Calculator, DollarSign, FileText, TrendingUp } from 'lucide-react';

interface CalculatorsTabProps {
  buyer: any;
  onShowEMICalculator: () => void;
}

const CalculatorsTab: React.FC<CalculatorsTabProps> = ({ buyer, onShowEMICalculator }) => {
  const calculators = [
    {
      id: 'emi',
      title: 'EMI Calculator',
      description: 'Calculate your monthly EMI based on loan amount, interest rate, and tenure',
      icon: Calculator,
      color: 'blue',
      action: onShowEMICalculator
    },
    {
      id: 'affordability',
      title: 'Affordability Calculator',
      description: 'Find out how much property you can afford based on your income',
      icon: DollarSign,
      color: 'green',
      action: () => console.log('Affordability calculator')
    },
    {
      id: 'stamp_duty',
      title: 'Stamp Duty Calculator',
      description: 'Calculate stamp duty and registration charges for your property',
      icon: FileText,
      color: 'purple',
      action: () => console.log('Stamp duty calculator')
    },
    {
      id: 'roi',
      title: 'ROI Calculator',
      description: 'Calculate return on investment for property purchases',
      icon: TrendingUp,
      color: 'orange',
      action: () => console.log('ROI calculator')
    }
  ];

  return (
    <div className="p-6 space-y-6 text-xs">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Financial Calculators</h3>
        <p className="text-gray-600">Make informed decisions with our financial tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          return (
            <div
              key={calc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 bg-${calc.color}-100 rounded-lg`}>
                  <Icon className={`text-${calc.color}-600`} size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">{calc.title}</h4>
                  <p className="text-gray-600 mb-3">{calc.description}</p>
                  <button
                    onClick={calc.action}
                    className={`w-full bg-${calc.color}-600 text-white py-1.5 px-3 text-xs rounded-md hover:bg-${calc.color}-700 transition-colors`}
                  >
                    Open Calculator
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick EMI Calculation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick EMI Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">₹45,678</div>
            <div className="text-blue-700 text-xs">Estimated EMI</div>
            <div className="text-gray-500 text-[10px]">For ₹1.8Cr @ 8.5%</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">₹7L</div>
            <div className="text-green-700 text-xs">Down Payment</div>
            <div className="text-gray-500 text-[10px]">30% of property value</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">20 Years</div>
            <div className="text-purple-700 text-xs">Loan Tenure</div>
            <div className="text-gray-500 text-[10px]">Recommended</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorsTab;