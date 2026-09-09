import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { tenantAPI } from '@/lib/tenantAPI';
import TenantAccountPage from './TenantAccountPage';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

const StandaloneTenantAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      const targetId = id || (currentUser as any)?.tenant_id || (currentUser as any)?.id || '';
      
      try {
        setLoading(true);
        let normalized: any = null;

        if (targetId) {
          try {
            const data = await tenantAPI.getById(targetId);
            normalized = data?.tenant || data?.data || data || null;
          } catch (e) {
            console.warn('Direct tenant fetch by id note:', e);
          }
        }

        if (!normalized && currentUser?.email) {
          try {
            const allRes = await tenantAPI.getAll();
            const list = Array.isArray(allRes) ? allRes : (allRes?.data || []);
            normalized = list.find((t: any) => t.email?.toLowerCase() === currentUser.email?.toLowerCase()) || null;
          } catch (e) {
            console.warn('Fallback email search note:', e);
          }
        }

        if (normalized) {
          setTenant(normalized);
          setError(null);
        } else {
          setError('No tenant profile found for this account.');
          setTenant(null);
        }
      } catch (err) {
        console.error('Error fetching tenant:', err);
        setError('Failed to load tenant account data');
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [id, currentUser]);

  const handleBack = () => navigate('/properties?transaction=rent&tab=rent');

  const handleUpdateTenant = async (updatedTenant: any) => {
    try {
      const targetId = updatedTenant?.id || id || (currentUser as any)?.tenant_id;
      if (targetId) {
        await tenantAPI.update(targetId, updatedTenant);
        setTenant((prev: any) => ({ ...prev, ...updatedTenant }));
        toast.success('Tenant preferences updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update tenant');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-xs font-semibold text-gray-600">Loading tenant account...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="text-center max-w-md w-full p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <ArrowLeft size={28} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">No Tenant Account Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No active tenant profile is linked in the database. Please explore available rental properties or log in with your credentials.
            </p>
          </div>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem('verified_tenant');
                localStorage.removeItem('prompt_tenant_preferences');
                navigate('/properties?transaction=rent&tab=rent');
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#0b3856] hover:bg-[#07263b] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Browse Rental Homes
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('verified_tenant');
                localStorage.removeItem('prompt_tenant_preferences');
                navigate('/login');
              }}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TenantAccountPage
      tenant={tenant}
      onBack={handleBack}
      onUpdateTenant={handleUpdateTenant}
    />
  );
};

export default StandaloneTenantAccountPage;
