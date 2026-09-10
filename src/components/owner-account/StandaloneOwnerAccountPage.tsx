import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ownerAPI from '@/lib/ownerAPI';
import OwnerAccountPage from './OwnerAccountPage';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

export const StandaloneOwnerAccountPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOwner = async () => {
      const targetId = id || (currentUser as any)?.owner_id || (currentUser as any)?.id || '';

      try {
        setLoading(true);
        let normalized: any = null;

        if (targetId) {
          try {
            const res = await ownerAPI.getById(targetId);
            if (res && res.success && res.data) {
              normalized = {
                ...res.data.owner,
                properties: res.data.properties || [],
                properties_count: res.data.properties?.length || 0,
              };
            }
          } catch (e) {
            console.warn('Direct owner fetch by id note:', e);
          }
        }

        // Fallback: match by email or phone if targetId didn't yield an owner
        if (!normalized && (currentUser?.email || currentUser?.phone)) {
          try {
            const allRes = await ownerAPI.getAll();
            const list = Array.isArray(allRes) ? allRes : (allRes?.data || []);
            const found = list.find((o: any) => 
              (currentUser.email && o.email && o.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
              (currentUser.phone && o.phone && o.phone.trim() === currentUser.phone.trim())
            );
            if (found) {
              const res = await ownerAPI.getById(found.id);
              if (res && res.success && res.data) {
                normalized = {
                  ...res.data.owner,
                  properties: res.data.properties || [],
                  properties_count: res.data.properties?.length || 0,
                };
              } else {
                normalized = found;
              }
            }
          } catch (e) {
            console.warn('Fallback owner search note:', e);
          }
        }

        if (isMounted) {
          if (normalized) {
            setOwner(normalized);
            setError(null);
          } else {
            setError('No owner profile found for this account.');
            setOwner(null);
          }
        }
      } catch (err) {
        console.error('Error fetching owner:', err);
        if (isMounted) {
          setError('Failed to load owner account data');
          setOwner(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOwner();
    return () => { isMounted = false; };
  }, [id, currentUser]);

  const isOwnerUser = currentUser?.role?.toLowerCase() === 'owner';

  const handleBack = () => {
    if (isOwnerUser) {
      navigate('/properties');
    } else {
      navigate('/dashboard/owners');
    }
  };

  const handleUpdateOwner = async (updatedOwner: any) => {
    try {
      const oid = owner?.id || id;
      if (!oid) return;
      const res = await ownerAPI.update(oid, updatedOwner);
      if (res && res.success && res.data) {
        setOwner((prev: any) => ({ ...prev, ...res.data }));
        toast.success('Owner updated successfully');
      }
    } catch (err) {
      toast.error('Error updating owner');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#e67e22]" />
          <p className="mt-2 text-gray-600 text-xs font-semibold">Loading owner account...</p>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-red-500 mb-3">
            <svg className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Owner Account Not Found</h3>
          <p className="text-gray-500 text-xs mb-4">{error || 'The owner profile for this account does not exist.'}</p>
          <button
            onClick={handleBack}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#0f2b3d] text-white rounded-xl hover:opacity-90 text-xs font-semibold mx-auto w-full cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{isOwnerUser ? 'Back to Properties' : 'Back to Owners'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <OwnerAccountPage
      owner={owner}
      onBack={handleBack}
      onUpdateOwner={handleUpdateOwner}
    />
  );
};

export default StandaloneOwnerAccountPage;
