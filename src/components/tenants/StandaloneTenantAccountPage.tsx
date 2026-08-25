import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { tenantAPI } from '@/lib/tenantAPI';
import TenantAccountPage from './TenantAccountPage';
import { toast } from 'react-toastify';

const StandaloneTenantAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!id) {
        setLoading(false);
        setError('No tenant ID provided');
        return;
      }

      try {
        setLoading(true);
        const data = await tenantAPI.getById(id);
        const normalized = data?.tenant || data?.data || data || null;
        setTenant(normalized);
        setError(null);
      } catch (err) {
        console.error('Error fetching tenant:', err);
        setError('Failed to load tenant account data');
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [id]);

  const handleBack = () => navigate('/dashboard/tenants');

  const handleUpdateTenant = async (updatedTenant: any) => {
    try {
      if (id) {
        await tenantAPI.update(id, updatedTenant);
        setTenant(updatedTenant);
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
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-xs border border-gray-200">
          <div className="text-red-500 mb-3">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Tenant Not Found</h3>
          <p className="text-xs text-gray-500 mb-4">{error || 'The requested tenant account could not be found.'}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Tenants</span>
          </button>
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
