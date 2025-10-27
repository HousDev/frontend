import React, { useState } from 'react';
import { 
  Handshake, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  User, 
  Building,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Award,
  Crown,
  Gem,
  Edit,
  Eye,
  Share,
  Download,
  Send,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Receipt,
  CreditCard,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Users,
  MapPin,
  Home,
  Shield,
  Zap,
  Bot,
  Brain,
  Lightbulb,
  Sparkles,
  X
} from 'lucide-react';

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const DealsManagement = ({ seller }: any) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  const deals = [
    {
      id: 1,
      property: {
        id: 'PROP001',
        title: 'Luxury 3BHK Apartment',
        address: 'Skyline Towers, Andheri West, Mumbai',
        image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      buyer: {
        name: 'Amit Patel',
        phone: '+91 98765 11111',
        email: 'amit.patel@email.com',
        budget: '₹2.2Cr - ₹2.6Cr'
      },
      dealDetails: {
        agreedPrice: 24500000,
        originalPrice: 25000000,
        negotiationDiscount: 500000,
        tokenAmount: 500000,
        registrationAmount: 24000000,
        brokerageRate: 2,
        brokerageAmount: 490000,
        dealDate: '2025-01-15',
        possessionDate: '2025-02-15',
        registrationDate: '2025-01-30'
      },
      status: 'token_received',
      stage: 'documentation',
      progress: 65,
      priority: 'high',
      timeline: [
        { date: '2025-01-10', event: 'Initial offer received', status: 'completed' },
        { date: '2025-01-12', event: 'Price negotiation', status: 'completed' },
        { date: '2025-01-15', event: 'Token amount received', status: 'completed' },
        { date: '2025-01-20', event: 'Documentation in progress', status: 'active' },
        { date: '2025-01-30', event: 'Registration scheduled', status: 'pending' }
      ],
      documents: [
        { name: 'Sale Agreement', status: 'completed', date: '2025-01-15' },
        { name: 'NOC from Society', status: 'pending', date: null },
        { name: 'Bank NOC', status: 'in_progress', date: null },
        { name: 'Registration Documents', status: 'pending', date: null }
      ],
      payments: [
        { type: 'Token Amount', amount: 500000, status: 'received', date: '2025-01-15' },
        { type: 'Registration Amount', amount: 24000000, status: 'pending', dueDate: '2025-01-30' }
      ]
    },
    {
      id: 2,
      property: {
        id: 'PROP002',
        title: 'Premium Villa with Garden',
        address: 'Green Valley Society, Pune',
        image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400'
      },
      buyer: {
        name: 'Priya Shah',
        phone: '+91 87654 32109',
        email: 'priya.shah@email.com',
        budget: '₹3.8Cr - ₹4.5Cr'
      },
      dealDetails: {
        agreedPrice: 41000000,
        originalPrice: 42000000,
        negotiationDiscount: 1000000,
        tokenAmount: 1000000,
        registrationAmount: 40000000,
        brokerageRate: 1.5,
        brokerageAmount: 615000,
        dealDate: '2025-01-08',
        possessionDate: '2025-03-01',
        registrationDate: '2025-02-15'
      },
      status: 'negotiation',
      stage: 'price_discussion',
      progress: 35,
      priority: 'medium',
      timeline: [
        { date: '2025-01-05', event: 'Initial inquiry', status: 'completed' },
        { date: '2025-01-08', event: 'Property visit', status: 'completed' },
        { date: '2025-01-10', event: 'Offer submitted', status: 'completed' },
        { date: '2025-01-12', event: 'Counter offer sent', status: 'active' },
        { date: '2025-01-18', event: 'Final negotiation', status: 'pending' }
      ],
      documents: [
        { name: 'Property Valuation', status: 'completed', date: '2025-01-08' },
        { name: 'Legal Verification', status: 'in_progress', date: null }
      ],
      payments: []
    }
  ];

  const dealTabs = [
    { id: 'active', label: 'Active Deals', count: deals.filter(d => d.status !== 'completed').length },
    { id: 'completed', label: 'Completed', count: deals.filter(d => d.status === 'completed').length },
    { id: 'pipeline', label: 'Pipeline', count: 5 },
    { id: 'all', label: 'All Deals', count: deals.length }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && deal.status !== 'completed') ||
                      (activeTab === 'completed' && deal.status === 'completed');
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'inquiry': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Inquiry' },
      'negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Negotiation' },
      'token_received': { bg: 'bg-green-100', text: 'text-green-700', label: 'Token Received' },
      'documentation': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Documentation' },
      'registration': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Registration' },
      'completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inquiry;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority', icon: '🔥' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority', icon: '⚡' },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority', icon: '🌱' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        <span className="hidden sm:inline">{config.label}</span>
      </span>
    );
  };

  const handleDealAction = (action: string, deal: any) => {
    switch (action) {
      case 'call':
        window.open(`tel:${deal.buyer.phone}`);
        break;
      case 'whatsapp':
        const message = `Hi ${deal.buyer.name}, regarding the deal for ${deal.property.title}. Current status: ${deal.status}. Let me know if you need any updates.`;
        window.open(`https://wa.me/${deal.buyer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        const subject = `Deal Update - ${deal.property.title}`;
        const body = `Dear ${deal.buyer.name},\n\nI hope this email finds you well.\n\nThis is to update you on the status of your property deal:\n\nProperty: ${deal.property.title}\nAgreed Price: ${formatCurrency(deal.dealDetails.agreedPrice)}\nCurrent Status: ${deal.status}\n\nNext steps will be communicated shortly.\n\nBest regards,\n${seller?.name || 'Property Agent'}`;
        window.open(`mailto:${deal.buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
      case 'view':
        setSelectedDeal(deal);
        break;
      default:
        
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Deals Management</h2>
          <p className="text-xs text-gray-600 mt-1">Track and manage all your property deals in one place</p>
        </div>
        <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs">
          <Plus size={14} />
          <span>Create Deal</span>
        </button>
      </div>

      {/* Deal Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Total Deal Value</p>
              <p className="text-sm sm:text-base font-bold">{formatCurrency(65500000)}</p>
            </div>
            <DollarSign size={18} className="text-green-200" />
          </div>
          <div className="text-green-100 text-xs mt-1">Across all active deals</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Active Deals</p>
              <p className="text-sm sm:text-base font-bold">{deals.filter(d => d.status !== 'completed').length}</p>
            </div>
            <Handshake size={18} className="text-blue-200" />
          </div>
          <div className="text-blue-100 text-xs mt-1">In various stages</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Avg Deal Time</p>
              <p className="text-sm sm:text-base font-bold">28 days</p>
            </div>
            <Clock size={18} className="text-purple-200" />
          </div>
          <div className="text-purple-100 text-xs mt-1">From inquiry to closure</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Success Rate</p>
              <p className="text-sm sm:text-base font-bold">78%</p>
            </div>
            <Target size={18} className="text-orange-200" />
          </div>
          <div className="text-orange-100 text-xs mt-1">Above industry average</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search deals by buyer name, property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
                <Filter size={14} />
                <span className="hidden sm:inline">Advanced Filters</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs">
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Deal Tabs */}
          <div className="mt-2">
            <div className="flex space-x-1 overflow-x-auto">
              {dealTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-xs whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-200' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-3">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 sm:p-4">
              {/* Deal Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0 mb-3">
                <div className="flex items-start space-x-3">
                  <img
                    src={deal.property.image}
                    alt={deal.property.title}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{deal.property.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(deal.status)}
                        {getPriorityBadge(deal.priority)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 mb-2">
                      <MapPin size={12} />
                      <span className="text-xs truncate">{deal.property.address}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User size={10} />
                        <span>Buyer: {deal.buyer.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={10} />
                        <span>Deal Date: {deal.dealDetails.dealDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-green-600">{formatCurrency(deal.dealDetails.agreedPrice)}</div>
                  <div className="text-xs text-gray-500">Agreed Price</div>
                  {deal.dealDetails.negotiationDiscount > 0 && (
                    <div className="text-xs text-red-600">-{formatCurrency(deal.dealDetails.negotiationDiscount)} discount</div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Deal Progress</span>
                  <span className="text-xs font-bold text-blue-600">{deal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${deal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Deal Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-xs sm:text-sm font-bold text-green-600">{formatCurrency(deal.dealDetails.brokerageAmount)}</div>
                  <div className="text-xs text-green-700">Brokerage ({deal.dealDetails.brokerageRate}%)</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-xs sm:text-sm font-bold text-blue-600">{formatCurrency(deal.dealDetails.tokenAmount)}</div>
                  <div className="text-xs text-blue-700">Token Amount</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                  <div className="text-xs sm:text-sm font-bold text-purple-600">{deal.dealDetails.possessionDate}</div>
                  <div className="text-xs text-purple-700">Possession Date</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <div className="text-xs sm:text-sm font-bold text-orange-600">{deal.dealDetails.registrationDate}</div>
                  <div className="text-xs text-orange-700">Registration Date</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Deal Timeline</h4>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {deal.timeline.map((event, index) => (
                    <div key={index} className="flex items-center space-x-2 min-w-max">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        event.status === 'completed' ? 'bg-green-500 text-white' :
                        event.status === 'active' ? 'bg-blue-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {event.status === 'completed' ? <CheckCircle size={12} /> :
                         event.status === 'active' ? <Clock size={12} /> :
                         <AlertCircle size={12} />}
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-gray-900 truncate max-w-24">{event.event}</div>
                        <div className="text-gray-500">{event.date}</div>
                      </div>
                      {index < deal.timeline.length - 1 && (
                        <div className="w-4 h-0.5 bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Status */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Document Status</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {deal.documents.map((doc, index) => (
                    <div key={index} className={`p-2 rounded-lg text-center ${
                      doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                      doc.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <div className="text-xs font-medium truncate">{doc.name}</div>
                      <div className="text-xs capitalize">{doc.status.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              {deal.payments.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Payment Status</h4>
                  <div className="space-y-2">
                    {deal.payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 text-xs">{payment.type}</div>
                          <div className="text-xs text-gray-600">{formatCurrency(payment.amount)}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'received' ? 'bg-green-100 text-green-700' :
                            payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {payment.status}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {payment.date || payment.dueDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDealAction('view', deal)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <Eye size={12} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDealAction('call', deal)}
                  className="flex items-center space-x-1 px-2 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                >
                  <Phone size={12} />
                  <span className="hidden sm:inline">Call</span>
                </button>
                <button
                  onClick={() => handleDealAction('whatsapp', deal)}
                  className="flex items-center space-x-1 px-2 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                >
                  <MessageCircle size={12} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleDealAction('email', deal)}
                  className="flex items-center space-x-1 px-2 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs"
                >
                  <Mail size={12} />
                  <span className="hidden sm:inline">Email</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Deal Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Brain className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">AI Deal Intelligence</h3>
            <p className="text-xs text-gray-600">Smart insights to optimize your deals</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="text-indigo-600" size={14} />
              <h4 className="font-semibold text-indigo-900 text-xs">Deal Optimization</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Sparkles className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Amit Patel deal has 85% closure probability - prioritize follow-up</span>
              </div>
              <div className="flex items-start space-x-2">
                <Sparkles className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Priya Shah may accept 2% additional discount - consider negotiation</span>
              </div>
              <div className="flex items-start space-x-2">
                <Sparkles className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Documentation delays detected - expedite NOC processes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="text-indigo-600" size={14} />
              <h4 className="font-semibold text-indigo-900 text-xs">Market Timing</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Gem className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Current market favors sellers - good time to close deals</span>
              </div>
              <div className="flex items-start space-x-2">
                <Gem className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Interest rates stable for next 3 months - buyer confidence high</span>
              </div>
              <div className="flex items-start space-x-2">
                <Gem className="text-indigo-600 mt-0.5" size={10} />
                <span className="text-xs text-indigo-800">Festival season approaching - accelerate closures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredDeals.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Handshake className="mx-auto text-gray-300 mb-4" size={36} />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">No deals found</h3>
          <p className="text-xs text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal 
          deal={selectedDeal} 
          onClose={() => setSelectedDeal(null)}
          onUpdate={(updatedDeal) => {
            setSelectedDeal(null);
          }}
        />
      )}
    </div>
  );
};

// Deal Detail Modal Component
const DealDetailModal = ({ deal, onClose, onUpdate }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Deal Details - {deal.property.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Deal Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3 text-xs">Deal Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-medium">{formatCurrency(deal.dealDetails.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Agreed Price:</span>
                    <span className="font-medium text-green-600">{formatCurrency(deal.dealDetails.agreedPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Given:</span>
                    <span className="font-medium text-red-600">{formatCurrency(deal.dealDetails.negotiationDiscount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brokerage:</span>
                    <span className="font-medium text-purple-600">{formatCurrency(deal.dealDetails.brokerageAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-3 text-xs">Buyer Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="font-medium text-blue-900">{deal.buyer.name}</div>
                  <div className="text-blue-700">{deal.buyer.phone}</div>
                  <div className="text-blue-700">{deal.buyer.email}</div>
                  <div className="text-blue-700">Budget: {deal.buyer.budget}</div>
                </div>
              </div>
            </div>

            {/* Timeline and Documents */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3 text-xs">Document Checklist</h4>
                <div className="space-y-2">
                  {deal.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{doc.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                        doc.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <h4 className="font-semibold text-green-900 mb-3 text-xs">Payment Schedule</h4>
                <div className="space-y-2">
                  {deal.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-green-900">{payment.type}</div>
                        <div className="text-xs text-green-700">{formatCurrency(payment.amount)}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'received' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
              Update Deal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsManagement;