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
  Settings,
  LogOut,
  Crown,
  Star,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SellerAccountSidebar = ({ activeTab, onTabChange, seller, unreadCount }: any) => {
  const menuItems = [
    { id: 'dashboard',    label: 'Dashboard',        icon: Home,      description: 'Overview & insights' },
    { id: 'properties',   label: 'My Properties',    icon: Building,  description: 'Property listings' },
    { id: 'activities',   label: 'Activities',       icon: Activity,  description: 'Timeline & history' },
    { id: 'visits',       label: 'Site Visits',      icon: Eye,       description: 'Visit management' },
    { id: 'analytics',    label: 'Analytics',        icon: BarChart3, description: 'Performance metrics' },
    { id: 'vendors',      label: 'Vendor Directory', icon: Users,     description: 'Service providers' },
    { id: 'deals',        label: 'Deals',            icon: Handshake, description: 'Deal management' },
    { id: 'transactions', label: 'Transactions',     icon: CreditCard,description: 'Financial records' },
    { id: 'calculators',  label: 'Calculators',      icon: Calculator,description: 'Financial tools' },
    { id: 'documents',    label: 'Documents',        icon: FileText,  description: 'Document management' },
  ];

  const propertyCount =
    typeof seller?.properties_count === 'number'
      ? seller.properties_count
      : Array.isArray(seller?.properties)
      ? seller.properties.length
      : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const { logout } = useAuth();

  const sellerName: string = seller?.name || '';
  const firstLetter = sellerName?.[0]?.toUpperCase?.() || '?';

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Profile */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base">
              {firstLetter}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Crown className="text-white" size={9} />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {seller?.salutation ? `${seller.salutation} ` : ''}
              {sellerName || 'Seller'}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {[seller?.location, seller?.city].filter(Boolean).join(', ')}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400 fill-current" size={11} />
                <span className="text-[10px] font-medium text-gray-700">
                  {(seller?.leadScore ?? 90)}/100
                </span>
              </div>
              <span className="text-[9px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                Premium
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded p-2 text-center">
            <span className="text-sm font-semibold">{propertyCount}</span>
            <div className="text-[10px] text-blue-700">Properties</div>
          </div>
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="text-sm font-bold text-green-600">24</div>
            <div className="text-[10px] text-green-700">Inquiries</div>
          </div>
        </div>
      </div>

      {/* Menu (scrollable) */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-left group
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <div
                  className={`p-1.5 rounded-md
                  ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}
                >
                  <Icon size={15} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{item.description}</div>
                </div>

                {item.id === 'activities' && unreadCount > 0 && (
                  <div className="min-w-5 h-5 px-1 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{unreadCount}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-md p-3 text-white mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-xs">Portfolio Value</h4>
              <div className="text-lg font-bold leading-tight">{formatCurrency(67000000)}</div>
            </div>
            <TrendingUp size={18} className="text-green-100" />
          </div>
          <div className="text-[10px] text-green-100 mt-1">+12% from last month</div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
            <Settings size={15} />
            <span className="text-sm">Account Settings</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut size={15} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerAccountSidebar;
