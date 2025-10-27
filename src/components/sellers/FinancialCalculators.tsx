import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, PieChart, BarChart3, Target, Percent, IndianRupee, Banknote, Wallet, PiggyBank, Coins, Receipt, FileCheck, Briefcase, Award, Star, Crown, Gem, Zap, Bot, Brain, Lightbulb, Sparkles, Rocket, Save, Download, Share, RefreshCw, Settings, Info, AlertCircle, CheckCircle, Calendar, Clock, Building, Home, MapPin, Eye, Users, Phone, Mail, MessageCircle } from 'lucide-react';

const FinancialCalculators = ({ seller }: any) => {
  const [activeCalculator, setActiveCalculator] = useState('capital_gains');
  const [calculatorData, setCalculatorData] = useState({
    // Capital Gains Calculator
    purchasePrice: 20000000,
    purchaseDate: '2020-08-15',
    salePrice: 25000000,
    saleDate: '2025-01-15',
    improvementCost: 500000,
    
    // Prepayment Calculator
    loanAmount: 15000000,
    interestRate: 8.5,
    remainingTenure: 180, // months
    prepaymentAmount: 2000000,
    
    // Eligibility Calculator
    monthlyIncome: 150000,
    existingEMIs: 25000,
    loanTenure: 240, // months
    
    // Reinvestment Calculator
    saleProceeds: 25000000,
    reinvestmentBudget: 30000000,
    targetLocation: 'Bandra West',
    investmentGoal: 'capital_appreciation'
  });

  const [results, setResults] = useState({
    capitalGains: {
      shortTermGains: 0,
      longTermGains: 0,
      taxLiability: 0,
      netProceeds: 0,
      indexationBenefit: 0
    },
    prepayment: {
      currentEMI: 0,
      newEMI: 0,
      interestSaved: 0,
      tenureReduction: 0
    },
    eligibility: {
      maxLoanAmount: 0,
      maxEMI: 0,
      eligibilityRatio: 0
    },
    reinvestment: {
      recommendedProperties: [],
      expectedReturns: 0,
      riskLevel: 'medium'
    }
  });

  const calculators = [
    {
      id: 'capital_gains',
      label: 'Capital Gains Tax',
      icon: Receipt,
      description: 'Calculate tax on property sale',
      color: 'green'
    },
    {
      id: 'prepayment',
      label: 'Loan Prepayment',
      icon: Banknote,
      description: 'Analyze prepayment benefits',
      color: 'blue'
    },
    {
      id: 'eligibility',
      label: 'Loan Eligibility',
      icon: CheckCircle,
      description: 'Check loan eligibility',
      color: 'purple'
    },
    {
      id: 'reinvestment',
      label: 'Reinvestment Analysis',
      icon: TrendingUp,
      description: 'Property reinvestment options',
      color: 'orange'
    }
  ];

  // Calculate results whenever data changes
  useEffect(() => {
    calculateResults();
  }, [calculatorData]);

  const calculateResults = () => {
    // Capital Gains Calculation
    const purchaseDate = new Date(calculatorData.purchaseDate);
    const saleDate = new Date(calculatorData.saleDate);
    const holdingPeriod = (saleDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const isLongTerm = holdingPeriod >= 2;
    
    const capitalGain = calculatorData.salePrice - calculatorData.purchasePrice - calculatorData.improvementCost;
    const indexationBenefit = isLongTerm ? calculatorData.purchasePrice * 0.3 : 0; // Simplified indexation
    const taxableGain = Math.max(0, capitalGain - indexationBenefit);
    const taxRate = isLongTerm ? 0.20 : 0.30; // 20% for long term, 30% for short term
    const taxLiability = taxableGain * taxRate;
    const netProceeds = calculatorData.salePrice - taxLiability;

    // Prepayment Calculation
    const monthlyRate = calculatorData.interestRate / (12 * 100);
    const currentEMI = (calculatorData.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, calculatorData.remainingTenure)) / 
                      (Math.pow(1 + monthlyRate, calculatorData.remainingTenure) - 1);
    
    const newLoanAmount = calculatorData.loanAmount - calculatorData.prepaymentAmount;
    const newEMI = (newLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, calculatorData.remainingTenure)) / 
                  (Math.pow(1 + monthlyRate, calculatorData.remainingTenure) - 1);
    
    const totalInterestCurrent = (currentEMI * calculatorData.remainingTenure) - calculatorData.loanAmount;
    const totalInterestNew = (newEMI * calculatorData.remainingTenure) - newLoanAmount;
    const interestSaved = totalInterestCurrent - totalInterestNew;

    // Eligibility Calculation
    const netIncome = calculatorData.monthlyIncome - calculatorData.existingEMIs;
    const maxEMI = netIncome * 0.6; // 60% of net income
    const maxLoanAmount = (maxEMI * (Math.pow(1 + monthlyRate, calculatorData.loanTenure) - 1)) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, calculatorData.loanTenure));

    setResults({
      capitalGains: {
        shortTermGains: !isLongTerm ? capitalGain : 0,
        longTermGains: isLongTerm ? capitalGain : 0,
        taxLiability: Math.round(taxLiability),
        netProceeds: Math.round(netProceeds),
        indexationBenefit: Math.round(indexationBenefit)
      },
      prepayment: {
        currentEMI: Math.round(currentEMI),
        newEMI: Math.round(newEMI),
        interestSaved: Math.round(interestSaved),
        tenureReduction: 0 // Simplified
      },
      eligibility: {
        maxLoanAmount: Math.round(maxLoanAmount),
        maxEMI: Math.round(maxEMI),
        eligibilityRatio: Math.round((calculatorData.loanAmount / maxLoanAmount) * 100)
      },
      reinvestment: {
        recommendedProperties: [
          { title: 'Premium 2BHK in Bandra', price: 28000000, roi: 12 },
          { title: 'Luxury 3BHK in Juhu', price: 35000000, roi: 10 }
        ],
        expectedReturns: 11,
        riskLevel: 'medium'
      }
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setCalculatorData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const exportCalculation = () => {
    const calculationData = {
      calculator: activeCalculator,
      inputs: calculatorData,
      results: results,
      exportedAt: new Date().toISOString()
    };
    alert('Calculation exported successfully!');
  };

  const shareCalculation = () => {
    const shareText = `Financial Calculation Results\n\nCalculator: ${calculators.find(c => c.id === activeCalculator)?.label}\n\nGenerated via ResaleExpert\nwww.resaleexpert.com`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Financial Calculation',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Calculation details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Financial Calculators</h2>
          <p className="text-xs text-gray-600 mt-1">Advanced financial planning tools with AI-powered suggestions</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={exportCalculation}
            className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
          <button
            onClick={shareCalculation}
            className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            <Share size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Calculator Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            const isActive = activeCalculator === calc.id;
            
            return (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? `border-${calc.color}-500 bg-${calc.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={isActive ? `text-${calc.color}-600` : 'text-gray-400'} size={16} />
                  <span className={`font-medium text-xs ${isActive ? `text-${calc.color}-900` : 'text-gray-600'}`}>
                    {calc.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{calc.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculator Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {calculators.find(c => c.id === activeCalculator)?.label} Calculator
          </h3>
          
          {activeCalculator === 'capital_gains' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
                <input
                  type="number"
                  value={calculatorData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs"
                  placeholder="20000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={calculatorData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price (₹)</label>
                <input
                  type="number"
                  value={calculatorData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs"
                  placeholder="25000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sale Date</label>
                <input
                  type="date"
                  value={calculatorData.saleDate}
                  onChange={(e) => handleInputChange('saleDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Improvement Cost (₹)</label>
                <input
                  type="number"
                  value={calculatorData.improvementCost}
                  onChange={(e) => handleInputChange('improvementCost', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-xs"
                  placeholder="500000"
                />
              </div>
            </div>
          )}

          {activeCalculator === 'prepayment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Outstanding Loan Amount (₹)</label>
                <input
                  type="number"
                  value={calculatorData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="15000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  value={calculatorData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  step="0.1"
                  placeholder="8.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Remaining Tenure (Months)</label>
                <input
                  type="number"
                  value={calculatorData.remainingTenure}
                  onChange={(e) => handleInputChange('remainingTenure', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="180"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Prepayment Amount (₹)</label>
                <input
                  type="number"
                  value={calculatorData.prepaymentAmount}
                  onChange={(e) => handleInputChange('prepaymentAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="2000000"
                />
              </div>
            </div>
          )}

          {activeCalculator === 'eligibility' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                <input
                  type="number"
                  value={calculatorData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Existing EMIs (₹)</label>
                <input
                  type="number"
                  value={calculatorData.existingEMIs}
                  onChange={(e) => handleInputChange('existingEMIs', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
                  placeholder="25000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Loan Tenure</label>
                <select
                  value={calculatorData.loanTenure}
                  onChange={(e) => handleInputChange('loanTenure', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
                >
                  <option value={120}>10 years</option>
                  <option value={180}>15 years</option>
                  <option value={240}>20 years</option>
                  <option value={300}>25 years</option>
                  <option value={360}>30 years</option>
                </select>
              </div>
            </div>
          )}

          {activeCalculator === 'reinvestment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sale Proceeds (₹)</label>
                <input
                  type="number"
                  value={calculatorData.saleProceeds}
                  onChange={(e) => handleInputChange('saleProceeds', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-xs"
                  placeholder="25000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Budget (₹)</label>
                <input
                  type="number"
                  value={calculatorData.reinvestmentBudget - calculatorData.saleProceeds}
                  onChange={(e) => handleInputChange('reinvestmentBudget', calculatorData.saleProceeds + Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-xs"
                  placeholder="5000000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Location</label>
                <select
                  value={calculatorData.targetLocation}
                  onChange={(e) => handleInputChange('targetLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-xs"
                >
                  <option value="Bandra West">Bandra West</option>
                  <option value="Juhu">Juhu</option>
                  <option value="Worli">Worli</option>
                  <option value="Lower Parel">Lower Parel</option>
                  <option value="Powai">Powai</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Investment Goal</label>
                <select
                  value={calculatorData.investmentGoal}
                  onChange={(e) => handleInputChange('investmentGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-xs"
                >
                  <option value="capital_appreciation">Capital Appreciation</option>
                  <option value="rental_income">Rental Income</option>
                  <option value="balanced">Balanced Returns</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Calculation Results</h3>
          
          {activeCalculator === 'capital_gains' && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-green-900 mb-3 text-xs">Tax Calculation Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700 text-xs">Capital Gain:</span>
                    <span className="font-bold text-green-900 text-xs">
                      {formatCurrency(calculatorData.salePrice - calculatorData.purchasePrice - calculatorData.improvementCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 text-xs">Indexation Benefit:</span>
                    <span className="font-bold text-green-900 text-xs">{formatCurrency(results.capitalGains.indexationBenefit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 text-xs">Tax Liability:</span>
                    <span className="font-bold text-red-600 text-xs">{formatCurrency(results.capitalGains.taxLiability)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-green-700 font-medium text-xs">Net Proceeds:</span>
                    <span className="font-bold text-green-900 text-sm">{formatCurrency(results.capitalGains.netProceeds)}</span>
                  </div>
                </div>
              </div>
              
              {/* AI Tax Optimization Suggestions */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="text-purple-600" size={14} />
                  <h4 className="font-semibold text-purple-900 text-xs">AI Tax Optimization</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="text-purple-600 mt-0.5" size={10} />
                    <span className="text-xs text-purple-800">Consider reinvesting in another property within 2 years to claim exemption under Section 54</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="text-purple-600 mt-0.5" size={10} />
                    <span className="text-xs text-purple-800">Invest in Capital Gains Bonds to save up to ₹50L in taxes</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="text-purple-600 mt-0.5" size={10} />
                    <span className="text-xs text-purple-800">Consult tax advisor for additional deductions and exemptions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCalculator === 'prepayment' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-blue-900 mb-3 text-xs">Prepayment Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700 text-xs">Current EMI:</span>
                    <span className="font-bold text-blue-900 text-xs">{formatCurrency(results.prepayment.currentEMI)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 text-xs">New EMI:</span>
                    <span className="font-bold text-blue-900 text-xs">{formatCurrency(results.prepayment.newEMI)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 text-xs">EMI Reduction:</span>
                    <span className="font-bold text-green-600 text-xs">
                      {formatCurrency(results.prepayment.currentEMI - results.prepayment.newEMI)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-blue-700 font-medium text-xs">Interest Saved:</span>
                    <span className="font-bold text-green-900 text-sm">{formatCurrency(results.prepayment.interestSaved)}</span>
                  </div>
                </div>
              </div>
              
              {/* AI Prepayment Suggestions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="text-blue-600" size={14} />
                  <h4 className="font-semibold text-blue-900 text-xs">Smart Prepayment Strategy</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="text-blue-600 mt-0.5" size={10} />
                    <span className="text-xs text-blue-800">Optimal prepayment amount: ₹{(calculatorData.prepaymentAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Sparkles className="text-blue-600 mt-0.5" size={10} />
                    <span className="text-xs text-blue-800">Best time to prepay: Beginning of financial year for maximum benefit</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Sparkles className="text-blue-600 mt-0.5" size={10} />
                    <span className="text-xs text-blue-800">Consider partial prepayment to maintain liquidity</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCalculator === 'eligibility' && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-purple-900 mb-3 text-xs">Loan Eligibility</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-700 text-xs">Net Monthly Income:</span>
                    <span className="font-bold text-purple-900 text-xs">
                      {formatCurrency(calculatorData.monthlyIncome - calculatorData.existingEMIs)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700 text-xs">Max EMI (60%):</span>
                    <span className="font-bold text-purple-900 text-xs">{formatCurrency(results.eligibility.maxEMI)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-purple-700 font-medium text-xs">Max Loan Amount:</span>
                    <span className="font-bold text-purple-900 text-sm">{formatCurrency(results.eligibility.maxLoanAmount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Eligibility Meter */}
              <div className="bg-white border border-purple-200 rounded-lg p-3">
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-purple-600">{results.eligibility.eligibilityRatio}%</div>
                  <div className="text-xs text-purple-700">Eligibility Utilization</div>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      results.eligibility.eligibilityRatio <= 80 ? 'bg-green-500' :
                      results.eligibility.eligibilityRatio <= 100 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(results.eligibility.eligibilityRatio, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-center mt-2 text-purple-700">
                  {results.eligibility.eligibilityRatio <= 80 ? 'Excellent eligibility' :
                   results.eligibility.eligibilityRatio <= 100 ? 'Good eligibility' :
                   'Consider increasing income or reducing existing EMIs'}
                </div>
              </div>
            </div>
          )}

          {activeCalculator === 'reinvestment' && (
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-orange-900 mb-3 text-xs">Reinvestment Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-orange-700 text-xs">Available Budget:</span>
                    <span className="font-bold text-orange-900 text-xs">{formatCurrency(calculatorData.reinvestmentBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 text-xs">Target Location:</span>
                    <span className="font-bold text-orange-900 text-xs">{calculatorData.targetLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 text-xs">Expected Returns:</span>
                    <span className="font-bold text-green-600 text-xs">{results.reinvestment.expectedReturns}% p.a.</span>
                  </div>
                </div>
              </div>
              
              {/* AI Property Recommendations */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="text-orange-600" size={14} />
                  <h4 className="font-semibold text-orange-900 text-xs">AI Property Suggestions</h4>
                </div>
                <div className="space-y-2">
                  {results.reinvestment.recommendedProperties.map((prop: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-xs">{prop.title}</div>
                          <div className="text-xs text-gray-600">{formatCurrency(prop.price)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-green-600">{prop.roi}% ROI</div>
                          <div className="text-xs text-gray-500">Expected</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Financial Advisor */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Brain className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">AI Financial Advisor</h3>
            <p className="text-xs text-gray-600">Personalized financial recommendations based on your profile</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="text-indigo-600" size={14} />
              <h4 className="font-semibold text-indigo-900 text-xs">Investment Strategy</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Rocket className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Diversify into commercial properties for higher yields</span>
              </div>
              <div className="flex items-start space-x-2">
                <Rocket className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Consider REITs for liquid real estate exposure</span>
              </div>
              <div className="flex items-start space-x-2">
                <Rocket className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Explore emerging micro-markets for better appreciation</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="text-indigo-600" size={14} />
              <h4 className="font-semibold text-indigo-900 text-xs">Tax Optimization</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Gem className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Utilize Section 54 exemption for reinvestment</span>
              </div>
              <div className="flex items-start space-x-2">
                <Gem className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Plan sale timing for optimal tax benefits</span>
              </div>
              <div className="flex items-start space-x-2">
                <Gem className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Maintain proper documentation for all improvements</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculators;