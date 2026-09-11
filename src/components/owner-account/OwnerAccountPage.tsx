import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Building2, MessageSquare, Calendar, FileText,
  DollarSign, User, X, ArrowLeft, LogOut,
  IndianRupee, Clock, CheckCircle2, HeartHandshake
} from 'lucide-react';
import { toast } from 'react-toastify';
import ownerAPI from '@/lib/ownerAPI';
import { useAuth } from '@/contexts/AuthContext';
import LinkRentalPropertyModal from '@/components/owners/LinkRentalPropertyModal';
import OwnerFormModal from '@/components/owners/OwnerFormModal';
import OwnerHeader from './OwnerHeader';
import OwnerSidebar from './OwnerSidebar';
import OwnerOverviewTab from './OwnerOverviewTab';
import OwnerPropertiesTab from './OwnerPropertiesTab';
import OwnerInquiriesTab from './OwnerInquiriesTab';
import OwnerVisitsTab, { checkPastPendingVisit } from './OwnerVisitsTab';
import OwnerLeaseVaultTab from './OwnerLeaseVaultTab';
import OwnerFinancialsTab from './OwnerFinancialsTab';
import OwnerProfileTab from './OwnerProfileTab';
import OwnerSelfSetupModal from './OwnerSelfSetupModal';
import OwnerApplicantsTab from './OwnerApplicantsTab';

interface OwnerAccountPageProps {
  owner: any;
  onBack?: () => void;
  onUpdateOwner?: (updated: any) => Promise<void> | void;
}

export const OwnerAccountPage: React.FC<OwnerAccountPageProps> = ({
  owner: initialOwner,
  onBack,
  onUpdateOwner,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isOwnerUser = user?.role?.toLowerCase() === 'owner';

  const [owner, setOwner] = useState<any>(initialOwner);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Sub-data for Owner
  const [properties, setProperties] = useState<any[]>(initialOwner?.properties || []);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [interestsList, setInterestsList] = useState<any[]>([]);

  // Modals
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showSelfSetupModal, setShowSelfSetupModal] = useState<boolean>(false);

  // Auto-prompt self-setup for new/unconfigured owner accounts
  useEffect(() => {
    if (!owner?.id) return;
    const shouldPrompt =
      localStorage.getItem(`prompt_owner_setup_${owner.id}`) === 'true' ||
      localStorage.getItem('prompt_owner_setup') === 'true' ||
      !localStorage.getItem(`owner_preferred_slots_${owner.id}`);

    if (shouldPrompt) {
      const timer = setTimeout(() => setShowSelfSetupModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [owner?.id]);

  // Fetch full details for this owner
  const fetchOwnerFullData = async () => {
    if (!owner?.id) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getById(owner.id);
      if (res && res.success && res.data) {
        const d = res.data;
        setOwner(d.owner || owner);
        setProperties(d.properties || []);
        setInquiries(d.tenant_inquiries || d.inquiries || []);
        setVisits(d.tenant_visits || d.visits || []);
        setActivities(d.activities || []);
        setInterestsList(d.interests || []);
      }
    } catch (err) {
      console.error('Error fetching owner full data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerFullData();
  }, [owner?.id]);

  // Derived Username (e.g. Heena Bagwan -> hbagwan)
  const derivedUsername = useMemo(() => {
    if (owner?.username) return owner.username;
    const name = String(owner?.name || '').trim();
    if (!name) return `owner_${owner?.id || '101'}`;
    const parts = name.split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join('') || '';
    if (lastName) {
      return `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    }
    return firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }, [owner?.username, owner?.name, owner?.id]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (isOwnerUser) {
      navigate('/properties');
    } else {
      navigate('/dashboard/owners');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    toast.info('Logged out from owner account');
    window.location.href = '/login';
  };

  const handleSavedOwner = (updated?: any) => {
    if (updated) {
      setOwner((prev: any) => ({ ...prev, ...updated }));
      if (onUpdateOwner) {
        onUpdateOwner(updated);
      }
    }
    fetchOwnerFullData();
    setShowEditModal(false);
  };

  const tabs = [
    { id: 'dashboard', label: 'Portal Dashboard', icon: Home },
    { id: 'properties', label: `My Properties (${properties.length})`, icon: Building2 },
    { id: 'inquiries', label: `Tenant Inquiries (${inquiries.length})`, icon: MessageSquare, badge: inquiries.length > 0 ? inquiries.length : undefined },
    { id: 'applicants', label: 'Applicants', icon: HeartHandshake },
    { id: 'visits', label: `Site Visits (${visits.length})`, icon: Calendar, badge: visits.length > 0 ? visits.length : undefined },
    { id: 'vault', label: 'Lease & Doc Vault', icon: FileText },
    { id: 'financials', label: 'Rent Tracker & ROI', icon: IndianRupee },
    { id: 'profile', label: 'Profile & Credentials', icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-800">
      {/* 🧭 Desktop Left Sidebar (Clean White Theme matching Tenant Account) */}
      <OwnerSidebar
        owner={owner}
        derivedUsername={derivedUsername}
        activeTab={activeTab}
        tabs={tabs}
        isOwnerUser={isOwnerUser}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onBack={handleBack}
        onLogout={handleLogout}
        onBackToWebsite={() => navigate('/properties')}
      />

      {/* 📱 Mobile Drawer Sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-xs">
                  {owner.name?.charAt(0)?.toUpperCase() || 'O'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs truncate">{owner.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-orange-600">OWN{String(owner.id || '1').padStart(4, '0')}</span>
                    <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1 py-0.2 rounded">@{derivedUsername}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${active
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon size={14} className={active ? 'text-orange-600' : 'text-gray-400'} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-orange-100 text-orange-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-1.5">
              <button
                onClick={() => {
                  setShowMobileSidebar(false);
                  navigate('/properties');
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 text-xs cursor-pointer shadow-2xs"
              >
                <Home size={13} className="text-gray-500" />
                <span>Back to Website</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileSidebar(false);
                  handleBack();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 font-semibold hover:bg-gray-100 text-xs cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={13} />
                <span>{isOwnerUser ? 'Back to CRM List' : 'Back to Owners'}</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileSidebar(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Right Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        {/* Compact Top Header Toolbar */}
        <OwnerHeader
          owner={owner}
          visits={visits}
          inquiries={inquiries}
          onOpenMobileSidebar={() => setShowMobileSidebar(true)}
          onLogout={handleLogout}
          onOpenEditModal={() => setShowEditModal(true)}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
        />

        {/* Scrollable Tab View Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-custom-vertical">
          {/* ⏰ Global Post-Visit Feedback Prompt Banner */}
          {(() => {
            const pendingPastVisit = checkPastPendingVisit(visits, 5);
            if (!pendingPastVisit || activeTab === 'visits') return null;
            return (
              <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-lg border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                        Visit Outcome Needed
                      </span>
                      <span className="text-xs text-amber-100 font-medium">Scheduled Visit Passed</span>
                    </div>
                    <p className="font-extrabold text-sm text-white mt-0.5">
                      Did your visit take place for {pendingPastVisit.property_title || pendingPastVisit.rental_property_title || 'Rental Property'}?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('visits')}
                  className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-50 transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Confirm Visit Outcome</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </button>
              </div>
            );
          })()}

          {activeTab === 'dashboard' && (
            <OwnerOverviewTab
              owner={owner}
              properties={properties}
              inquiries={inquiries}
              visits={visits}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
              onOpenLinkModal={() => setShowLinkModal(true)}
              onOpenEditModal={() => setShowEditModal(true)}
            />
          )}

          {activeTab === 'properties' && (
            <OwnerPropertiesTab
              properties={properties}
              onOpenLinkModal={() => setShowLinkModal(true)}
              onRefresh={fetchOwnerFullData}
            />
          )}

          {activeTab === 'inquiries' && (
            <OwnerInquiriesTab
              inquiries={inquiries}
              ownerName={owner?.name || 'Owner'}
              ownerId={owner?.id}
              onRefresh={fetchOwnerFullData}
            />
          )}

          {activeTab === 'applicants' && (
            <OwnerApplicantsTab
              ownerId={owner?.id}
              ownerName={owner?.name || 'Owner'}
              onRefresh={fetchOwnerFullData}
            />
          )}

          {activeTab === 'visits' && (
            <OwnerVisitsTab
              visits={visits}
              ownerName={owner?.name || 'Owner'}
              onRefreshVisits={fetchOwnerFullData}
            />
          )}

          {activeTab === 'vault' && (
            <OwnerLeaseVaultTab
              properties={properties}
              ownerName={owner?.name || 'Owner'}
            />
          )}

          {activeTab === 'financials' && (
            <OwnerFinancialsTab
              properties={properties}
            />
          )}

          {activeTab === 'profile' && (
            <OwnerProfileTab
              owner={owner}
              derivedUsername={derivedUsername}
              onOpenEditModal={() => setShowEditModal(true)}
            />
          )}
        </main>
      </div>

      {/* 🔗 Modals */}
      {showLinkModal && (
        <LinkRentalPropertyModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          linkingOwner={owner}
          onSelectProperty={() => {
            fetchOwnerFullData();
            setShowLinkModal(false);
          }}
          onLinkProperties={() => {
            fetchOwnerFullData();
            setShowLinkModal(false);
          }}
        />
      )}

      {showEditModal && (
        <OwnerFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          owner={owner}
          onSave={handleSavedOwner}
        />
      )}

      {showSelfSetupModal && (
        <OwnerSelfSetupModal
          isOpen={showSelfSetupModal}
          onClose={() => setShowSelfSetupModal(false)}
          owner={owner}
          derivedUsername={derivedUsername}
          onSaveSuccess={(updated) => {
            setOwner((prev: any) => ({ ...prev, ...updated }));
            if (onUpdateOwner) onUpdateOwner(updated);
          }}
          allowDismiss={true}
        />
      )}
    </div>
  );
};

export default OwnerAccountPage;
