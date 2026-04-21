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
  X,
  ChevronRight
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
    { id: 'active', label: 'Active', count: deals.filter(d => d.status !== 'completed').length },
    { id: 'completed', label: 'Completed', count: deals.filter(d => d.status === 'completed').length },
    { id: 'pipeline', label: 'Pipeline', count: 5 },
    { id: 'all', label: 'All', count: deals.length }
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
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'inquiry': { bg: '#DBEAFE', text: '#2563EB', label: 'Inquiry' },
      'negotiation': { bg: '#FEF3C7', text: '#D97706', label: 'Negotiation' },
      'token_received': { bg: '#D1FAE5', text: '#059669', label: 'Token Received' },
      'documentation': { bg: '#F3E8FF', text: '#9333EA', label: 'Documentation' },
      'registration': { bg: '#E0E7FF', text: '#4F46E5', label: 'Registration' },
      'completed': { bg: '#D1FAE5', text: '#059669', label: 'Completed' }
    };
    const config = statusConfig[status] || statusConfig.inquiry;
    // Increased from text-[8px] to text-[10px]
    return <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ background: config.bg, color: config.text }}>{config.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      'high': { bg: '#FEE2E2', text: '#DC2626', label: 'High', icon: '🔥' },
      'medium': { bg: '#FEF3C7', text: '#D97706', label: 'Medium', icon: '⚡' },
      'low': { bg: '#D1FAE5', text: '#059669', label: 'Low', icon: '🌱' }
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    // Increased from text-[8px] to text-[10px]
    return <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ background: config.bg, color: config.text }}>{config.icon} {config.label}</span>;
  };

  const handleDealAction = (action: string, deal: any) => {
    switch (action) {
      case 'call': window.open(`tel:${deal.buyer.phone}`); break;
      case 'whatsapp':
        const message = `Hi ${deal.buyer.name}, regarding the deal for ${deal.property.title}. Current status: ${deal.status}`;
        window.open(`https://wa.me/${deal.buyer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank'); break;
      case 'email':
        const subject = `Deal Update - ${deal.property.title}`;
        const body = `Dear ${deal.buyer.name},\n\nProperty: ${deal.property.title}\nAgreed Price: ${formatCurrency(deal.dealDetails.agreedPrice)}\nCurrent Status: ${deal.status}`;
        window.open(`mailto:${deal.buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank'); break;
      case 'view': setSelectedDeal(deal); break;
    }
  };

  return (
    <div className="p-0 space-y-3"> {/* Increased space-y from 2 to 3 */}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {/* Increased from text-xs to text-sm, text-[10px] to text-xs */}
          <h2 className="text-sm font-bold text-gray-900">Deals Management</h2>
          <p className="text-xs text-gray-500">Track and manage all your property deals</p>
        </div>
        {/* Increased text-[9px] to text-xs, icon size from 10 to 12 */}
        <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700">
          <Plus size={12} /><span>Create Deal</span>
        </button>
      </div>

      {/* Stats Cards - Original Colors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2"> {/* Increased gap from 1.5 to 2 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2.5 text-white"> {/* Increased padding from p-2 to p-2.5 */}
          <div className="flex items-center justify-between">
            <div>
              {/* Increased text-[8px] to text-[10px] */}
              <p className="text-[10px] text-green-100">Total Value</p>
              {/* Increased text-xs to text-sm */}
              <p className="text-sm font-bold">{formatCurrency(65500000)}</p>
            </div>
            {/* Increased icon size from 12 to 14 */}
            <DollarSign size={14} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2.5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-100">Active Deals</p>
              <p className="text-sm font-bold">{deals.filter(d => d.status !== 'completed').length}</p>
            </div>
            <Handshake size={14} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2.5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-purple-100">Avg Deal Time</p>
              <p className="text-sm font-bold">28 days</p>
            </div>
            <Clock size={14} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-2.5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-orange-100">Success Rate</p>
              <p className="text-sm font-bold">78%</p>
            </div>
            <Target size={14} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-3 border border-gray-200"> {/* Increased padding from p-2 to p-3 */}
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" /> {/* Increased icon from 10 to 12 */}
          <input
            type="text"
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500" // Increased text-[9px] to text-xs, py-1 to py-1.5
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2"> {/* Increased gap from 1 to 1.5, mt-1.5 to mt-2 */}
          {/* Increased text-[8px] to text-[10px], icon size from 8 to 10 */}
          <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-[10px] text-gray-600">
            <Filter size={10} />Filter
          </button>
          <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-[10px] text-gray-600">
            <Download size={10} />Export
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-gray-200"> {/* Increased gap and mt */}
          {dealTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              // Increased text-[8px] to text-[10px]
              className={`px-2 py-1 rounded-full text-[10px] transition-all ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600'}`}
            >
              {tab.label}<span className="ml-1 text-[9px]">({tab.count})</span> {/* Increased text-[7px] to text-[9px] */}
            </button>
          ))}
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-2"> {/* Increased space-y from 1.5 to 2 */}
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="p-3"> {/* Increased padding from p-2 to p-3 */}
              <div className="flex gap-3"> {/* Increased gap from 2 to 3 */}
                <img src={deal.property.image} alt={deal.property.title} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" /> {/* Increased from 10 to 12 */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1"> {/* Increased gap and mb */}
                    {/* Increased text-[9px] to text-xs */}
                    <h3 className="text-xs font-semibold truncate flex-1 text-gray-900">{deal.property.title}</h3>
                    {getStatusBadge(deal.status)}
                    {getPriorityBadge(deal.priority)}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Increased icon size from 8 to 10 */}
                    <MapPin size={10} className="text-gray-400" />
                    {/* Increased text-[7px] to text-[9px] */}
                    <span className="text-[9px] truncate text-gray-500">{deal.property.address}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] text-gray-500"> {/* Increased mt and text size */}
                    <User size={9} />{deal.buyer.name}
                    <Calendar size={9} className="ml-0.5" />{deal.dealDetails.dealDate}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {/* Increased text-[10px] to text-xs */}
                  <div className="text-xs font-bold text-green-600">{formatCurrency(deal.dealDetails.agreedPrice)}</div>
                  <div className="text-[8px] text-gray-500">Agreed</div> {/* Increased from text-[6px] to text-[8px] */}
                  {deal.dealDetails.negotiationDiscount > 0 && (
                    <div className="text-[8px] text-red-500">-{formatCurrency(deal.dealDetails.negotiationDiscount)}</div> /* Increased from text-[6px] to text-[8px] */
                  )}
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  {/* Increased text-[7px] to text-[9px] */}
                  <span className="text-[9px] text-gray-500">Progress</span>
                  <span className="text-[9px] font-bold text-blue-600">{deal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5"> {/* Increased h-1 to h-1.5 */}
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all" style={{ width: `${deal.progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mt-2"> {/* Increased gap from 1 to 1.5, mt-1.5 to mt-2 */}
                <div className="bg-gray-50 rounded p-1.5 text-center"> {/* Increased padding */}
                  {/* Increased text-[7px] to text-[9px] */}
                  <div className="text-[9px] font-bold text-green-600">{formatCurrency(deal.dealDetails.brokerageAmount)}</div>
                  <div className="text-[8px] text-gray-500">Brokerage</div> {/* Increased text-[6px] to text-[8px] */}
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <div className="text-[9px] font-bold text-blue-600">{formatCurrency(deal.dealDetails.tokenAmount)}</div>
                  <div className="text-[8px] text-gray-500">Token</div>
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <div className="text-[9px] font-bold text-purple-600">{deal.dealDetails.possessionDate}</div>
                  <div className="text-[8px] text-gray-500">Possession</div>
                </div>
                <div className="bg-gray-50 rounded p-1.5 text-center">
                  <div className="text-[9px] font-bold text-orange-600">{deal.dealDetails.registrationDate}</div>
                  <div className="text-[8px] text-gray-500">Registration</div>
                </div>
              </div>

              <div className="flex gap-1.5 mt-2 pt-1.5 border-t border-gray-200"> {/* Increased gap and mt */}
                {/* Increased text-[7px] to text-[9px], icon size from 7 to 9 */}
                <button onClick={() => handleDealAction('view', deal)} className="flex-1 py-1 rounded text-[9px] font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <Eye size={9} className="inline mr-1" />View
                </button>
                <button onClick={() => handleDealAction('call', deal)} className="py-1 px-2 rounded text-[9px] font-medium bg-green-100 text-green-700">
                  <Phone size={9} className="inline" />
                </button>
                <button onClick={() => handleDealAction('whatsapp', deal)} className="py-1 px-2 rounded text-[9px] font-medium bg-green-100 text-green-700">
                  <MessageCircle size={9} className="inline" />
                </button>
                <button onClick={() => handleDealAction('email', deal)} className="py-1 px-2 rounded text-[9px] font-medium bg-purple-100 text-purple-700">
                  <Mail size={9} className="inline" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights - Original Colors */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-3"> {/* Increased padding from p-2 to p-3 */}
        <div className="flex items-center gap-2 mb-2"> {/* Increased gap and mb */}
          {/* Increased icon padding and size */}
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Brain size={12} className="text-white" />
          </div>
          <div>
            {/* Increased text-[8px] to text-[10px] */}
            <h3 className="text-[10px] font-bold text-gray-900">AI Deal Intelligence</h3>
            <p className="text-[8px] text-gray-500">Smart insights to optimize your deals</p> {/* Increased text-[6px] to text-[8px] */}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5"> {/* Increased gap from 1 to 1.5 */}
          <div className="bg-white rounded p-2 border border-indigo-100"> {/* Increased padding */}
            <div className="flex items-center gap-1.5 mb-1.5"> {/* Increased gap and mb */}
              <Target size={10} className="text-indigo-600" /> {/* Increased icon size from 8 to 10 */}
              {/* Increased text-[7px] to text-[9px] */}
              <h4 className="text-[9px] font-semibold text-indigo-900">Deal Optimization</h4>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-1">
                <Sparkles size={8} className="text-indigo-600" /> {/* Increased icon size from 6 to 8 */}
                {/* Increased text-[6px] to text-[8px] */}
                <span className="text-[8px] text-indigo-800">Amit Patel: 85% closure probability</span>
              </div>
              <div className="flex items-start gap-1">
                <Sparkles size={8} className="text-indigo-600" />
                <span className="text-[8px] text-indigo-800">Priya Shah: 2% discount possible</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded p-2 border border-indigo-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={10} className="text-indigo-600" />
              <h4 className="text-[9px] font-semibold text-indigo-900">Market Timing</h4>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-1">
                <Gem size={8} className="text-indigo-600" />
                <span className="text-[8px] text-indigo-800">Seller market - good to close</span>
              </div>
              <div className="flex items-start gap-1">
                <Gem size={8} className="text-indigo-600" />
                <span className="text-[8px] text-indigo-800">Festival season - accelerate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
          <Handshake size={28} className="mx-auto mb-2 text-gray-300" /> {/* Increased icon size and mb */}
          <h3 className="text-[11px] font-semibold text-gray-900 mb-1">No deals found</h3> {/* Increased text sizes */}
          <p className="text-[9px] text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} onUpdate={() => setSelectedDeal(null)} />
      )}
    </div>
  );
};

// Deal Detail Modal Component
const DealDetailModal = ({ deal, onClose, onUpdate }: any) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-200 bg-gray-50"> {/* Increased padding */}
          {/* Increased text-xs to text-sm */}
          <h3 className="text-sm font-bold text-gray-900">Deal Details - {deal.property.title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition-colors">
            <X size={16} className="text-gray-500" /> {/* Increased icon size from 14 to 16 */}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3"> {/* Increased padding and space-y */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {/* Increased gap */}
            <div className="bg-gray-50 rounded-lg p-3"> {/* Increased padding */}
              {/* Increased text-[8px] to text-[10px] */}
              <h4 className="text-[10px] font-semibold text-gray-900 mb-2">Deal Summary</h4>
              <div className="space-y-1 text-[9px]"> {/* Increased text-[7px] to text-[9px] */}
                <div className="flex justify-between">
                  <span className="text-gray-500">Original:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(deal.dealDetails.originalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Agreed:</span>
                  <span className="font-medium text-green-600">{formatCurrency(deal.dealDetails.agreedPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount:</span>
                  <span className="font-medium text-red-500">{formatCurrency(deal.dealDetails.negotiationDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Brokerage:</span>
                  <span className="font-medium text-purple-600">{formatCurrency(deal.dealDetails.brokerageAmount)}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              {/* Increased text-[8px] to text-[10px] */}
              <h4 className="text-[10px] font-semibold text-blue-900 mb-2">Buyer Information</h4>
              <div className="space-y-1 text-[9px]"> {/* Increased text-[7px] to text-[9px] */}
                <div className="font-medium text-blue-900">{deal.buyer.name}</div>
                <div className="text-blue-700">{deal.buyer.phone}</div>
                <div className="text-blue-700">{deal.buyer.email}</div>
                <div className="text-blue-700">Budget: {deal.buyer.budget}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-[10px] font-semibold text-gray-900 mb-2">Document Checklist</h4>
            <div className="space-y-1.5">
              {deal.documents.map((doc: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-600">{doc.name}</span> {/* Increased text size */}
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${doc.status === 'completed' ? 'bg-green-100 text-green-700' : doc.status === 'in_progress' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="text-[10px] font-semibold text-green-900 mb-2">Payment Schedule</h4>
            <div className="space-y-1.5">
              {deal.payments.map((payment: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-medium text-green-900">{payment.type}</div> {/* Increased text size */}
                    <div className="text-[8px] text-green-700">{formatCurrency(payment.amount)}</div> {/* Increased text size */}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${payment.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 shrink-0 bg-gray-50"> {/* Increased padding */}
          <button onClick={onClose} className="px-3 py-1.5 text-[9px] font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-100"> {/* Increased padding */}
            Close
          </button>
          <button className="px-3 py-1.5 text-[9px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
            Update Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealsManagement;