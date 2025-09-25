// ./components/userPageCompoents/UsersManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit, Trash2, Mail, Phone, Calendar, Activity, CheckCircle, XCircle,
  Eye, Share2, MessageCircle, Copy, Plus, Users as UsersIcon, UserPlus
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';
import { buyerAPI } from '@/lib/buyerAPI';
import { sellerAPI } from '@/lib/sellersAPI';

interface User {
  id?: string | number;
  username?: string;
  email: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  total_leads?: number;
  total_properties?: number;
  total_revenue?: number;
  modulePermissions?: any;
  dob?: string;
  blood_group?: string;
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
}

interface UsersManagementProps {
  onEditUser: (user: User) => void;
  refreshTrigger: number;
  userPasswords?: { [key: string]: string };
  getLabelFromValue: (masterKey: string, value: string) => string;
  masters: Record<string, any[]>;
  masterLoading: boolean;
  onCreateUser?: (opts: { role: 'buyer' | 'seller'; prefill?: Partial<User> }) => Promise<void> | void;
}

const TABS = [
  { id: 'all', name: 'Teams', roles: ['admin', 'executive', 'manager', 'team leader'], showCreateButton: false, createButtonText: '' },
  { id: 'buyers', name: 'Buyers', roles: ['buyer'], showCreateButton: true, createButtonText: '' },
  { id: 'sellers', name: 'Sellers', roles: ['seller'], showCreateButton: true, createButtonText: '' },
  { id: 'buyer-accounts', name: 'Buyer Accounts', roles: ['buyer'], showCreateButton: true, createButtonText: '' },
  { id: 'seller-accounts', name: 'Seller Accounts', roles: ['seller'], showCreateButton: true, createButtonText: 'Create Seller Account' }
];

const LOCAL_STORAGE_TAB_KEY = 'users-management-active-tab';

const UsersManagement: React.FC<UsersManagementProps> = ({
  onEditUser,
  refreshTrigger,
  userPasswords = {},
  getLabelFromValue,
  masters,
  masterLoading,
  onCreateUser
}) => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [buyersData, setBuyersData] = useState<User[]>([]);
  const [sellersData, setSellersData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Array<string | number>>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // 🔥 Tab state ko localStorage se initialize karenge
  const [activeTab, setActiveTab] = useState<'all' | 'buyers' | 'sellers' | 'buyer-accounts' | 'seller-accounts'>(() => {
    const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY) as any;
    return (savedTab && TABS.find(t => t.id === savedTab)) ? savedTab : 'all';
  });

  // 🔥 Tab change par localStorage update karenge
  const handleTabChange = (tabId: any) => {
    setActiveTab(tabId);
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, tabId);
  };

  // sharing modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingUser, setSharingUser] = useState<User | null>(null);

  // create-account modal fallback
  const [showCreateModalLocal, setShowCreateModalLocal] = useState(false);
  const [createAccountTypeLocal, setCreateAccountTypeLocal] = useState<'buyer' | 'seller'>('buyer');
  const [createPrefill, setCreatePrefill] = useState<Partial<User> | null>(null);
  const [localCreating, setLocalCreating] = useState(false);

  const getOriginalPassword = (userId?: string | number) => {
    if (userId === undefined || userId === null) return '';
    return userPasswords[String(userId)] || '';
  };

  const splitFullName = (fullName?: string) => {
    if (!fullName || typeof fullName !== 'string') return { first_name: '', last_name: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { first_name: parts[0], last_name: '' };
    return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
  };

  const normalizeBuyerSellerData = (data: any, role: 'buyer' | 'seller'): User => {
    const nameFromField = splitFullName(data.name);
    const first_name = (data.first_name && String(data.first_name).trim()) || nameFromField.first_name || '';
    const last_name = (data.last_name && String(data.last_name).trim()) || nameFromField.last_name || '';

    return {
      id: data.id,
      username: data.username,
      email: data.email || '',
      salutation: data.salutation || '',
      first_name,
      last_name,
      role,
      phone: data.phone || data.mobile || '',
      avatar: data.avatar,
      designation: data.designation,
      department: data.department,
      is_active: data.is_active ?? true,
      created_at: data.created_at,
      last_login: data.last_login,
      total_leads: data.total_leads || 0,
      total_properties: data.total_properties || 0,
      total_revenue: data.total_revenue || 0,
      dob: data.dob,
      blood_group: data.blood_group,
      buyer_id: data.buyer_id ?? (role === 'buyer' ? data.id : null),
      seller_id: data.seller_id ?? (role === 'seller' ? data.id : null),
    };
  };

  const normalizeListResponse = <T,>(resp: any): T[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as T[];
    if (Array.isArray(resp.data)) return resp.data as T[];
    return [];
  };

  // fetch buyers and sellers separate lists
  useEffect(() => {
    const fetchBuyersAndSellers = async () => {
      try {
        const bResp = await buyerAPI.getAll();
        const rawBuyersData = normalizeListResponse<any>(bResp);
        const normalizedBuyersData = rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer'));
        setBuyersData(normalizedBuyersData);
      } catch (err) {
        console.error('Error fetching buyers:', err);
        toast.error('Failed to load buyers data');
      }

      try {
        const sResp = await sellerAPI.getAll();
        const rawSellersData = normalizeListResponse<any>(sResp);
        const normalizedSellersData = rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller'));
        setSellersData(normalizedSellersData);
      } catch (err) {
        console.error('Error fetching sellers:', err);
        toast.error('Failed to load sellers data');
      }
    };
    fetchBuyersAndSellers();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!masterLoading) fetchUsers();
  }, [masterLoading, refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.filterData({});
      if (response?.success) {
        const users: User[] = (response.data || []).map((u: any) => {
          const fromName = splitFullName(u.name);
          const first_name = (u.first_name && String(u.first_name).trim()) || fromName.first_name || '';
          const last_name = (u.last_name && String(u.last_name).trim()) || fromName.last_name || '';
          return {
            id: u.id,
            username: u.username,
            email: u.email,
            salutation: u.salutation,
            first_name,
            last_name,
            role: u.role || '',
            phone: u.phone,
            avatar: u.avatar,
            designation: u.designation,
            department: u.department,
            is_active: !!u.is_active,
            created_at: u.created_at,
            last_login: u.last_login,
            total_leads: u.total_leads,
            total_properties: u.total_properties,
            total_revenue: u.total_revenue,
            dob: u.dob,
            blood_group: u.blood_group,
            buyer_id: u.buyer_id ?? null,
            seller_id: u.seller_id ?? null,
          } as User;
        });
        setAllUsers(users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast.error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toNullableId = (v: unknown): string | number | null => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return Number.isNaN(v) ? null : v;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (/^-?\d+$/.test(trimmed)) {
        const n = Number(trimmed);
        return Number.isNaN(n) ? trimmed : n;
      }
      return trimmed;
    }
    const n = Number(v as any);
    return Number.isNaN(n) ? null : n;
  };

  const startCreateAccount = async (type: 'buyer' | 'seller', prefill?: Partial<User>) => {
    const enrichedPrefill: Partial<User> = {
      ...prefill,
      role: type,
      buyer_id: prefill?.buyer_id ?? (type === 'buyer' ? prefill?.id ?? null : null),
      seller_id: prefill?.seller_id ?? (type === 'seller' ? prefill?.id ?? null : null),
    };

    if (onCreateUser) {
      try {
        await onCreateUser({ role: type, prefill: enrichedPrefill });
        handleTabChange(type === 'buyer' ? 'buyer-accounts' : 'seller-accounts');
        fetchUsers();
      } catch (err) {
        console.error('onCreateUser handler failed', err);
      }
      return;
    }
    setCreateAccountTypeLocal(type);
    setCreatePrefill(enrichedPrefill);
    setShowCreateModalLocal(true);
  };

  const handleCreateAccountSubmitLocal = async (accountData: Partial<User>) => {
    try {
      setLocalCreating(true);
      const prefill = createPrefill || {};
      const defaultIsActive = prefill.buyer_id || prefill.seller_id ? false : true;
      const rawBuyerId = accountData.buyer_id ?? prefill.buyer_id ?? null;
      const rawSellerId = accountData.seller_id ?? prefill.seller_id ?? null;

      const payload: any = {
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        email: accountData.email,
        phone: accountData.phone,
        username: accountData.username || undefined,
        password: accountData.password || undefined,
        role: createAccountTypeLocal,
        is_active: accountData.is_active !== undefined ? accountData.is_active : defaultIsActive,
        buyer_id: rawBuyerId === null ? null : (typeof rawBuyerId === 'string' && /^\d+$/.test(rawBuyerId) ? Number(rawBuyerId) : rawBuyerId),
        seller_id: rawSellerId === null ? null : (typeof rawSellerId === 'string' && /^\d+$/.test(rawSellerId) ? Number(rawSellerId) : rawSellerId),
      };

      const resp = await usersAPI.createUser(payload);
      if (!resp?.success) throw new Error(resp?.message || 'Failed to create user');
      const createdUser: User = resp.data;

      if (createAccountTypeLocal === 'buyer') {
        if (!payload.buyer_id) {
          try {
            const buyerResp = await buyerAPI.create({
              name: `${accountData.first_name || ''} ${accountData.last_name || ''}`.trim(),
              email: accountData.email,
              phone: accountData.phone,
              user_id: createdUser.id
            });
            if (buyerResp?.success && buyerResp.data?.id) {
              await usersAPI.updateUser(String(createdUser.id!), { buyer_id: buyerResp.data.id });
              createdUser.buyer_id = buyerResp.data.id;
            }
          } catch (err) {
            console.warn('Buyer creation failed (user created)', err);
          }
        }
      } else {
        if (!payload.seller_id) {
          try {
            const sellerResp = await sellerAPI.create({
              name: `${accountData.first_name || ''} ${accountData.last_name || ''}`.trim(),
              email: accountData.email,
              phone: accountData.phone,
              user_id: createdUser.id
            });
            if (sellerResp?.success && sellerResp.data?.id) {
              await usersAPI.updateUser(String(createdUser.id!), { seller_id: sellerResp.data.id });
              createdUser.seller_id = sellerResp.data.id;
            }
          } catch (err) {
            console.warn('Seller creation failed (user created)', err);
          }
        }
      }

      toast.success('Account created');

      setAllUsers(prev => {
        const exists = prev.some(u => String(u.id) === String(createdUser.id));
        if (exists) {
          return prev.map(u => String(u.id) === String(createdUser.id) ? { ...u, ...createdUser } : u);
        }
        return [createdUser, ...prev];
      });
      handleTabChange(createAccountTypeLocal === 'buyer' ? 'buyer-accounts' : 'seller-accounts');

      setShowCreateModalLocal(false);
      setCreatePrefill(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Error creating account (local):', err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to create account');
    } finally {
      setLocalCreating(false);
    }
  };

  const handleShareUser = (u: User) => {
    setSharingUser(u);
    setShowShareModal(true);
  };

  const shareViaEmail = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const subject = encodeURIComponent(`Account details — ${sharingUser.first_name} ${sharingUser.last_name}`);
    const body = encodeURIComponent(
      `Name: ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShareModal(false);
  };

  const shareViaWhatsApp = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const text = encodeURIComponent(
      `Account details\nName: ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
    );
    window.open(`https://wa.me/?text=${text}`);
    setShowShareModal(false);
  };

  const shareViaSMS = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const text = encodeURIComponent(
      `Account details — ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
    );
    window.open(`sms:?body=${text}`);
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const text =
      `Account details — ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\n` +
      `Email: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
      setShowShareModal(false);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const getFilteredUsers = () => {
    const activeTabConfig = TABS.find(t => t.id === activeTab) ?? TABS[0];

    let source: User[] = [];
    switch (activeTab) {
      case 'buyers':
        source = buyersData;
        break;
      case 'sellers':
        source = sellersData;
        break;
      case 'buyer-accounts':
        source = allUsers.filter(u => u.role?.toLowerCase() === 'buyer');
        break;
      case 'seller-accounts':
        source = allUsers.filter(u => u.role?.toLowerCase() === 'seller');
        break;
      default:
        source = allUsers.filter(u =>
          activeTabConfig.roles.some(r => u.role?.toLowerCase() === r.toLowerCase())
        );
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      source = source.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q)
      );
    }

    if (roleFilter !== 'all' && activeTab === 'all') {
      source = source.filter(u => u.role?.toLowerCase() === roleFilter.toLowerCase());
    }

    if (statusFilter !== 'all') {
      const active = statusFilter === 'active';
      source = source.filter(u => !!u.is_active === active);
    }

    return source;
  };

  const getUserCounts = () => {
    const counts: Record<string, number> = {};
    TABS.forEach(tab => {
      switch (tab.id) {
        case 'buyers':
          counts[tab.id] = buyersData.length;
          break;
        case 'sellers':
          counts[tab.id] = sellersData.length;
          break;
        case 'buyer-accounts':
          counts[tab.id] = allUsers.filter(u => u.role?.toLowerCase() === 'buyer').length;
          break;
        case 'seller-accounts':
          counts[tab.id] = allUsers.filter(u => u.role?.toLowerCase() === 'seller').length;
          break;
        default:
          counts[tab.id] = allUsers.filter(u =>
            tab.roles.some(r => u.role?.toLowerCase() === r.toLowerCase())
          ).length;
      }
    });
    return counts;
  };

  useEffect(() => {
    setSelectedUsers([]);
    setShowBulkActions(false);
  }, [activeTab]);

  const filteredUsers = getFilteredUsers();
  const userCounts = getUserCounts();

  const handleSelectUser = (id?: string | number) => {
    if (id === undefined || id === null) return;
    setSelectedUsers(prev => {
      const strId = String(id);
      const has = prev.some(x => String(x) === strId);
      const next = has ? prev.filter(x => String(x) !== strId) : [...prev, id];
      setShowBulkActions(next.length > 0);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredUsers.map(u => u.id!).filter(Boolean);
    if (selectedUsers.length === allIds.length) {
      setSelectedUsers([]);
      setShowBulkActions(false);
    } else {
      setSelectedUsers(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'delete' && !window.confirm(`Delete ${selectedUsers.length} users?`)) return;

    if (action !== 'delete') {
      const active = action === 'activate';
      setAllUsers(prev => prev.map(u => selectedUsers.some(id => String(id) === String(u.id)) ? { ...u, is_active: active } : u));

      // 🔥 Update buyers/sellers data separately for instant UI updates
      setBuyersData(prev => prev.map(u => selectedUsers.some(id => String(id) === String(u.id)) ? { ...u, is_active: active } : u));
      setSellersData(prev => prev.map(u => selectedUsers.some(id => String(id) === String(u.id)) ? { ...u, is_active: active } : u));
    } else {
      setAllUsers(prev => prev.filter(u => !selectedUsers.some(id => String(id) === String(u.id))));
      setBuyersData(prev => prev.filter(u => !selectedUsers.some(id => String(id) === String(u.id))));
      setSellersData(prev => prev.filter(u => !selectedUsers.some(id => String(id) === String(u.id))));
    }

    try {
      for (const id of selectedUsers) {
        // 🔥 Fix TypeScript error by converting to string
        if (action === 'delete') await usersAPI.deleteUser(String(id));
        else await usersAPI.updateUser(String(id), { is_active: action === 'activate' });
      }
      toast.success(`Bulk ${action} completed`);
      setSelectedUsers([]);
      setShowBulkActions(false);

      // 🔥 Instant API refresh after bulk action
      const refreshPromises = [fetchUsers()];

      if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
        refreshPromises.push(
          buyerAPI.getAll().then(bResp => {
            const rawBuyersData = normalizeListResponse<any>(bResp);
            const normalizedBuyersData = rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer'));
            setBuyersData(normalizedBuyersData);
          }).catch(err => console.error('Error refreshing buyers:', err))
        );
      }

      if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
        refreshPromises.push(
          sellerAPI.getAll().then(sResp => {
            const rawSellersData = normalizeListResponse<any>(sResp);
            const normalizedSellersData = rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller'));
            setSellersData(normalizedSellersData);
          }).catch(err => console.error('Error refreshing sellers:', err))
        );
      }

      await Promise.all(refreshPromises);
    } catch (err) {
      console.error('Bulk action error', err);
      toast.error('Bulk action failed');
      fetchUsers();
    }
  };

  // 🔥 Enhanced toggle function for instant updates across all data sources
  const handleToggleUserStatus = async (userId?: string | number, isActive?: boolean) => {
    if (userId === undefined || userId === null) return;

    const newStatus = !isActive;

    // 🔥 Update all data sources instantly for immediate UI feedback
    setAllUsers(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, is_active: newStatus } : u));
    setBuyersData(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, is_active: newStatus } : u));
    setSellersData(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, is_active: newStatus } : u));

    try {
      // 🔥 Fix TypeScript error by converting to string
      await usersAPI.updateUser(String(userId), { is_active: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);

      // 🔥 Instant API calls after status update
      const refreshPromises = [fetchUsers()];

      // Check which data source needs refresh based on current tab
      if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
        refreshPromises.push(
          buyerAPI.getAll().then(bResp => {
            const rawBuyersData = normalizeListResponse<any>(bResp);
            const normalizedBuyersData = rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer'));
            setBuyersData(normalizedBuyersData);
          }).catch(err => console.error('Error refreshing buyers:', err))
        );
      }

      if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
        refreshPromises.push(
          sellerAPI.getAll().then(sResp => {
            const rawSellersData = normalizeListResponse<any>(sResp);
            const normalizedSellersData = rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller'));
            setSellersData(normalizedSellersData);
          }).catch(err => console.error('Error refreshing sellers:', err))
        );
      }

      // Wait for all refresh operations
      await Promise.all(refreshPromises);
    } catch (err) {
      console.error('Error toggling user status', err);
      toast.error('Failed to update user status');
      // If API fails, revert the optimistic update by refetching
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId?: string | number) => {
    if (userId === undefined || userId === null) return;
    if (!window.confirm('Delete this user?')) return;

    // Store previous state for rollback
    const prevAllUsers = allUsers;
    const prevBuyersData = buyersData;
    const prevSellersData = sellersData;

    // 🔥 Optimistic remove from all data sources
    setAllUsers(prev => prev.filter(u => String(u.id) !== String(userId)));
    setBuyersData(prev => prev.filter(u => String(u.id) !== String(userId)));
    setSellersData(prev => prev.filter(u => String(u.id) !== String(userId)));

    try {
      // 🔥 Fix TypeScript error by converting to string
      await usersAPI.deleteUser(String(userId));
      toast.success('User deleted');

      // 🔥 Instant API refresh after delete
      const refreshPromises = [fetchUsers()];

      if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
        refreshPromises.push(
          buyerAPI.getAll().then(bResp => {
            const rawBuyersData = normalizeListResponse<any>(bResp);
            const normalizedBuyersData = rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer'));
            setBuyersData(normalizedBuyersData);
          }).catch(err => console.error('Error refreshing buyers:', err))
        );
      }

      if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
        refreshPromises.push(
          sellerAPI.getAll().then(sResp => {
            const rawSellersData = normalizeListResponse<any>(sResp);
            const normalizedSellersData = rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller'));
            setSellersData(normalizedSellersData);
          }).catch(err => console.error('Error refreshing sellers:', err))
        );
      }

      await Promise.all(refreshPromises);
    } catch (err) {
      console.error('Error deleting user', err);
      toast.error('Failed to delete user');
      // Rollback on error
      setAllUsers(prevAllUsers);
      setBuyersData(prevBuyersData);
      setSellersData(prevSellersData);
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-green-100 text-green-800';
      case 'buyer': return 'bg-orange-100 text-orange-800';
      case 'executive': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const roles = masters.role || [];
  const availableRoles = activeTab === 'all' ? roles : [];
  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  const buildPrefillFromUser = (u: Partial<User>): Partial<User> => ({
    salutation: u.salutation,
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    phone: u.phone,
    username: u.username,
    buyer_id: u.buyer_id ?? (u.role === 'buyer' ? u.id ?? null : null),
    seller_id: u.seller_id ?? (u.role === 'seller' ? u.id ?? null : null),
  });

  return (
    <div className="space-y-6">
      {/* Local create modal fallback */}
      {showCreateModalLocal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create {createAccountTypeLocal === 'buyer' ? 'Buyer' : 'Seller'} Account
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.target as HTMLFormElement);
              const payload = {
                first_name: (f.get('first_name') as string) || (createPrefill?.first_name || ''),
                last_name: (f.get('last_name') as string) || (createPrefill?.last_name || ''),
                email: (f.get('email') as string) || (createPrefill?.email || ''),
                phone: (f.get('phone') as string) || (createPrefill?.phone || ''),
                username: (f.get('username') as string) || (createPrefill?.username || ''),
                password: (f.get('password') as string),
                buyer_id: createPrefill?.buyer_id ?? null,
                seller_id: createPrefill?.seller_id ?? null,
              };
              handleCreateAccountSubmitLocal(payload);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input name="first_name" defaultValue={createPrefill?.first_name || ''} required className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input name="last_name" defaultValue={createPrefill?.last_name || ''} required className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" defaultValue={createPrefill?.email || ''} required className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" defaultValue={createPrefill?.phone || ''} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input name="username" defaultValue={createPrefill?.username || ''} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input name="password" type="password" required className="w-full px-3 py-2 border rounded" />
                </div>

                {createPrefill?.buyer_id && <input type="hidden" name="buyer_id" value={String(createPrefill.buyer_id)} />}
                {createPrefill?.seller_id && <input type="hidden" name="seller_id" value={String(createPrefill.seller_id)} />}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={() => { setShowCreateModalLocal(false); setCreatePrefill(null); }}>Cancel</Button>
                <Button type="submit" disabled={localCreating}>{localCreating ? 'Creating...' : 'Create Account'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShareModal && sharingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Share User Details</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-2">
                {sharingUser.salutation ? sharingUser.salutation + ' ' : ''}{sharingUser.first_name} {sharingUser.last_name}
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Email:</strong> {sharingUser.email}</p>
                <p><strong>Username:</strong> {sharingUser.username || 'N/A'}</p>
                <p><strong>Password:</strong> {getOriginalPassword(sharingUser.id) || 'Not available'}</p>
                <p><strong>Role:</strong> {getLabelFromValue('role', sharingUser.role)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={shareViaEmail} className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs"><Mail className="h-3 w-3" /><span>Email</span></button>
              <button onClick={shareViaWhatsApp} className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs"><MessageCircle className="h-3 w-3" /><span>WhatsApp</span></button>
              <button onClick={shareViaSMS} className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs"><Phone className="h-3 w-3" /><span>SMS</span></button>
              <button onClick={copyToClipboard} className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-xs"><Copy className="h-3 w-3" /><span>Copy</span></button>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowShareModal(false); setSharingUser(null); }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs + actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center px-6 py-4">
            <nav className="flex space-x-8" aria-label="Tabs">
              {TABS.map(tab => {
                const isActive = activeTab === (tab.id as any);
                const count = userCounts[tab.id] || 0;
                const Icon = (tab.id === 'all' ? UsersIcon : UserPlus);
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}>
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                    <span className={`${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-full px-2 py-1 text-xs font-medium`}>{count}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">{selectedUsers.length} user(s) selected</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>Activate</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')} className="text-red-600">Delete</Button>
              <Button variant="outline" size="sm" onClick={() => { setSelectedUsers([]); setShowBulkActions(false); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Search & filters */}
      <div className="rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-1.5 lg:space-y-0 lg:space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, or username..."
              className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex space-x-1.5">
            {activeTab === 'all' && (
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded-md" disabled={masterLoading}>
                <option value="all">All Roles</option>
                {availableRoles.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            )}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded-md">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(activeTab !== 'buyers' && activeTab !== 'sellers') && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.map(u => u.id!).filter(Boolean).length}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={String(user.id)} className="hover:bg-gray-50">
                    {(activeTab !== 'buyers' && activeTab !== 'sellers') && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.some(x => String(x) === String(user.id))}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {user.avatar ? (
                          <img src={String(user.avatar)} alt={`${user.first_name} avatar`} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.salutation ? user.salutation + ' ' : ''}{user.first_name} {user.last_name}</p>
                          {user.username && <p className="text-sm text-gray-500">@{user.username}</p>}
                          {user.dob && <p className="text-xs text-gray-400">DOB: {new Date(user.dob).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2"><Mail className="h-3 w-3 text-gray-400" /><span className="text-sm text-gray-900">{user.email}</span></div>
                        {user.phone && <div className="flex items-center space-x-2"><Phone className="h-3 w-3 text-gray-400" /><span className="text-sm text-gray-900">{user.phone}</span></div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>{user.role}</span>
                      {user.department && <div className="text-xs text-gray-400">Dept: {user.department}</div>}
                      {user.designation && <div className="text-xs text-gray-400">Desig: {user.designation}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {user.is_active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className={`text-sm ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{user.total_leads || 0} leads</div>
                        <div className="text-xs text-gray-500">{user.total_properties || 0} properties</div>
                        {user.total_revenue !== undefined && user.total_revenue !== null
                          ? <div className="text-xs text-gray-500">{formatCurrency(user.total_revenue)} revenue</div>
                          : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-900 space-y-1">
                        <div className="flex items-center space-x-1"><Calendar className="h-3 w-3 text-gray-400" /><span>Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span></div>
                        <div className="flex items-center space-x-1"><Activity className="h-3 w-3 text-gray-400" /><span>Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(activeTab === 'buyers' || activeTab === 'sellers') ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button onClick={() => startCreateAccount(activeTab === 'buyers' ? 'buyer' : 'seller', buildPrefillFromUser(user))} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Plus className="h-3 w-3 mr-1" /> Create Account
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <div>
                            <Button variant="outline" size="sm"><Eye className="h-3 w-3" /></Button>
                            <Button variant="outline" size="sm" onClick={() => onEditUser(user)}><Edit className="h-3 w-3" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleShareUser(user)} className="text-blue-600"><Share2 className="h-3 w-3" /></Button>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                              className={user.is_active ? 'text-red-600' : 'text-green-600'}>
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab === 'buyers' || activeTab === 'sellers' ? `No ${activeTab} data found` : 'No users found'}</h3>
                        <p className="text-gray-500 mb-4">{searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting filters' : 'No data to display'}</p>
                        {activeTabConfig?.showCreateButton && <Button onClick={() => startCreateAccount(activeTab.includes('buyer') ? 'buyer' : 'seller')}><Plus className="h-4 w-4" /> {activeTabConfig.createButtonText}</Button>}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;