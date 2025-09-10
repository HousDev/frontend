import React, { useState, useEffect } from 'react';
import { X, Calculator, DollarSign, Percent, Calendar, TrendingUp, PieChart, BarChart3, Download, Share } from 'lucide-react';

const EMICalculatorModal = ({ isOpen, onClose, buyer }: any) => {
  const [calculatorData, setCalculatorData] = useState({
    loanAmount: buyer?.financials?.loanAmount || 2000000,
    interestRate: 8.5,
    loanTenure: 20, // years
    downPayment: buyer?.financials?.downPayment || 500000,
    propertyValue: buyer?.budget?.max || 2500000
  });

  const [results, setResults] = useState({
    emi: 0,
    totalAmount: 0,
    totalInterest: 0,
    loanToValue: 0,
    monthlyIncome: buyer?.financials?.monthlyIncome || 100000,
    emiToIncomeRatio: 0
  });

  const [activeCalculator, setActiveCalculator] = useState('emi');

  useEffect(() => {
    calculateEMI();
  }, [calculatorData]);

  if (!isOpen) return null;

  const calculateEMI = () => {
    const { loanAmount, interestRate, loanTenure } = calculatorData;
    const monthlyRate = interestRate / (12 * 100);
    const tenureMonths = loanTenure * 12;
    
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalAmount = emi * tenureMonths;
    const totalInterest = totalAmount - loanAmount;
    const loanToValue = (loanAmount / calculatorData.propertyValue) * 100;
    const emiToIncomeRatio = (emi / results.monthlyIncome) * 100;

    setResults({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      loanToValue: Math.round(loanToValue),
      monthlyIncome: results.monthlyIncome,
      emiToIncomeRatio: Math.round(emiToIncomeRatio)
    });
  };

  const calculateAffordability = () => {
    const maxEMI = results.monthlyIncome * 0.6; // 60% of income
    const monthlyRate = calculatorData.interestRate / (12 * 100);
    const tenureMonths = calculatorData.loanTenure * 12;
    
    const maxLoanAmount = (maxEMI * (Math.pow(1 + monthlyRate, tenureMonths) - 1)) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));
    
    return Math.round(maxLoanAmount);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const calculators = [
    { id: 'emi', label: 'EMI Calculator', icon: Calculator },
    { id: 'affordability', label: 'Affordability', icon: DollarSign },
    { id: 'comparison', label: 'Loan Comparison', icon: BarChart3 },
    { id: 'prepayment', label: 'Prepayment', icon: TrendingUp }
  ];

  const bankRates = [
    { name: 'HDFC Bank', rate: 8.5, processing: 0.5 },
    { name: 'ICICI Bank', rate: 8.7, processing: 0.5 },
    { name: 'SBI', rate: 8.4, processing: 0.25 },
    { name: 'Axis Bank', rate: 8.8, processing: 0.5 },
    { name: 'Kotak Bank', rate: 8.6, processing: 0.5 }
  ];

  const handleInputChange = (field: string, value: number) => {
    setCalculatorData(prev => ({ ...prev, [field]: value }));
  };

  const generateAmortizationSchedule = () => {
    const schedule = [];
    const { loanAmount, interestRate } = calculatorData;
    const monthlyRate = interestRate / (12 * 100);
    let balance = loanAmount;
    
    for (let month = 1; month <= Math.min(12, calculatorData.loanTenure * 12); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = results.emi - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        month,
        emi: results.emi,
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(balance)
      });
    }
    
    return schedule;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calculator className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial Calculators</h2>
                <p className="text-gray-600 mt-1">Plan your home purchase with accurate calculations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[80vh]">
          {/* Calculator Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Calculators</h3>
            <div className="space-y-2">
              {calculators.map((calc) => {
                const Icon = calc.icon;
                return (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      activeCalculator === calc.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{calc.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Controls */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={calculatorData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  value={calculatorData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Tenure (Years)</label>
                <select
                  value={calculatorData.loanTenure}
                  onChange={(e) => handleInputChange('loanTenure', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 10, 15, 20, 25, 30].map((years) => (
                    <option key={years} value={years}>
                      {years} years
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Value (₹)</label>
                <input
                  type="number"
                  value={calculatorData.propertyValue}
                  onChange={(e) => handleInputChange('propertyValue', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Main Calculator Area */}
          <div className="flex-1 p-6 overflow-auto">
            {activeCalculator === 'emi' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">EMI Calculator Results</h3>
                
                {/* EMI Results */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Monthly EMI</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.emi)}</p>
                      </div>
                      <Calculator size={24} className="text-blue-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Total Amount</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.totalAmount)}</p>
                      </div>
                      <DollarSign size={24} className="text-green-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Total Interest</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.totalInterest)}</p>
                      </div>
                      <Percent size={24} className="text-orange-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">LTV Ratio</p>
                        <p className="text-2xl font-bold">{results.loanToValue}%</p>
                      </div>
                      <PieChart size={24} className="text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* EMI Breakdown Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">EMI Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="mx-auto text-gray-400 mb-2" size={48} />
                          <p className="text-gray-500">Principal vs Interest Chart</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700">Principal Amount</span>
                        <span className="font-bold text-blue-900">{formatCurrency(calculatorData.loanAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-700">Interest Amount</span>
                        <span className="font-bold text-orange-900">{formatCurrency(results.totalInterest)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Down Payment</span>
                        <span className="font-bold text-green-900">{formatCurrency(calculatorData.downPayment)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700">EMI to Income Ratio</span>
                        <span className="font-bold text-purple-900">{results.emiToIncomeRatio}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amortization Schedule */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Amortization Schedule (First Year)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Month</th>
                          <th className="px-4 py-2 text-left">EMI</th>
                          <th className="px-4 py-2 text-left">Principal</th>
                          <th className="px-4 py-2 text-left">Interest</th>
                          <th className="px-4 py-2 text-left">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {generateAmortizationSchedule().map((row) => (
                          <tr key={row.month}>
                            <td className="px-4 py-2">{row.month}</td>
                            <td className="px-4 py-2 font-medium">{formatCurrency(row.emi)}</td>
                            <td className="px-4 py-2 text-blue-600">{formatCurrency(row.principal)}</td>
                            <td className="px-4 py-2 text-orange-600">{formatCurrency(row.interest)}</td>
                            <td className="px-4 py-2 text-gray-600">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeCalculator === 'affordability' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Affordability Calculator</h3>
                
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-green-900 mb-4">What You Can Afford</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatCurrency(calculateAffordability())}
                      </div>
                      <p className="text-green-700">Maximum Loan Amount</p>
                      <p className="text-sm text-green-600 mt-1">Based on 60% of your income</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatCurrency(calculateAffordability() + calculatorData.downPayment)}
                      </div>
                      <p className="text-blue-700">Maximum Property Value</p>
                      <p className="text-sm text-blue-600 mt-1">Including down payment</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Income Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={results.monthlyIncome}
                        onChange={(e) => setResults({...results, monthlyIncome: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(results.monthlyIncome * 0.6)}</div>
                        <div className="text-sm text-blue-700">Max EMI (60%)</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(results.monthlyIncome * 0.4)}</div>
                        <div className="text-sm text-green-700">Available for Expenses</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{results.emiToIncomeRatio}%</div>
                        <div className="text-sm text-purple-700">Current EMI Ratio</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeCalculator === 'comparison' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Bank Loan Comparison</h3>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Compare Loan Offers</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">Bank</th>
                          <th className="px-4 py-3 text-left">Interest Rate</th>
                          <th className="px-4 py-3 text-left">Processing Fee</th>
                          <th className="px-4 py-3 text-left">Monthly EMI</th>
                          <th className="px-4 py-3 text-left">Total Interest</th>
                          <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bankRates.map((bank, index) => {
                          const emi = calculateEMIForBank(bank.rate);
                          const totalInterest = (emi * calculatorData.loanTenure * 12) - calculatorData.loanAmount;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{bank.name}</td>
                              <td className="px-4 py-3 text-green-600 font-bold">{bank.rate}%</td>
                              <td className="px-4 py-3">{bank.processing}%</td>
                              <td className="px-4 py-3 font-bold">{formatCurrency(emi)}</td>
                              <td className="px-4 py-3 text-orange-600">{formatCurrency(totalInterest)}</td>
                              <td className="px-4 py-3">
                                <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                                  Apply
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              All calculations are approximate and for reference only
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download size={16} />
                <span>Download Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Share size={16} />
                <span>Share Results</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function calculateEMIForBank(rate: number) {
    const monthlyRate = rate / (12 * 100);
    const tenureMonths = calculatorData.loanTenure * 12;
    const emi = (calculatorData.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }
};

export default EMICalculatorModal;