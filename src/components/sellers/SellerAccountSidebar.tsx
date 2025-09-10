import React from 'react';
import { 
  Home, 
  Building, 
  Activity, 
  Eye, 
  BarChart3, 
  Users, 
  Handshake, 
  CreditCard, 
  Calculator,
  User,
  Bell,
  Settings,
  LogOut,
  Crown,
  Star,
  Shield,
  Award,
  TrendingUp,
  FileText
} from 'lucide-react';

const SellerAccountSidebar = ({ activeTab, onTabChange, seller, unreadCount }: any) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & insights' },
    { id: 'properties', label: 'My Properties', icon: Building, description: 'Property listings' },
    { id: 'activities', label: 'Activities', icon: Activity, description: 'Timeline & history' },
    { id: 'visits', label: 'Site Visits', icon: Eye, description: 'Visit management' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance metrics' },
    { id: 'vendors', label: 'Vendor Directory', icon: Users, description: 'Service providers' },
    { id: 'deals', label: 'Deals', icon: Handshake, description: 'Deal management' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, description: 'Financial records' },
    { id: 'calculators', label: 'Calculators', icon: Calculator, description: 'Financial tools' },
    { id: 'documents', label: 'Documents', icon: FileText, description: 'Document management' }
  ];
const propertyCount =
  typeof seller?.properties_count === "number"
    ? seller.properties_count
    : Array.isArray(seller?.properties)
    ? seller.properties.length
    : 0;
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {seller.name.charAt(0)}
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Crown className="text-white" size={12} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{seller.salutation} {seller.name}</h3>
            <p className="text-sm text-gray-600">{seller.location}, {seller.city}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-400 fill-current" size={12} />
                <span className="text-xs font-medium text-gray-700">{seller.leadScore}/100</span>
              </div>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Premium Seller
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
           <span className="text-xs font-semibold">{propertyCount}</span>
            <div className="text-xs text-blue-700">Properties</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">24</div>
            <div className="text-xs text-green-700">Inquiries</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
                {item.id === 'activities' && unreadCount > 0 && (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{unreadCount}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Total Portfolio Value</h4>
              <div className="text-2xl font-bold">{formatCurrency(67000000)}</div>
            </div>
            <TrendingUp size={24} className="text-green-200" />
          </div>
          <div className="text-green-100 text-xs mt-2">+12% from last month</div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings size={16} />
            <span className="text-sm">Account Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerAccountSidebar;