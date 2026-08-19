import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ownerAPI from '@/lib/ownerAPI';
import OwnerAccountPage from './OwnerAccountPage';
import { toast } from 'react-toastify';

export const StandaloneOwnerAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOwner = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          setError('No owner id provided');
        }
        return;
      }

      try {
        setLoading(true);
        const res = await ownerAPI.getById(id);
        if (isMounted && res && res.success && res.data) {
          setOwner({
            ...res.data.owner,
            properties: res.data.properties || [],
            properties_count: res.data.properties?.length || 0,
          });
          setError(null);
        } else {
          setError("Failed to load owner data");
        }
      } catch (err) {
        console.error("Error fetching owner:", err);
        if (isMounted) {
          setError("Failed to load owner data");
          setOwner(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOwner();
    return () => { isMounted = false; };
  }, [id]);

  const handleBack = () => navigate('/dashboard/owners');

  const handleUpdateOwner = async (updatedOwner: any) => {
    try {
      if (!id) return;
      const res = await ownerAPI.update(id, updatedOwner);
      if (res && res.success && res.data) {
        setOwner(res.data);
        toast.success("Owner updated successfully");
      }
    } catch (err) {
      toast.error('Error updating owner');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#e67e22]" />
          <p className="mt-2 text-gray-600 text-xs font-semibold">Loading owner account...</p>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Owner Not Found</h3>
          <p className="text-gray-600 text-xs mb-4">{error || 'The owner you are looking for does not exist.'}</p>
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0f2b3d] text-white rounded-lg hover:opacity-90 text-xs font-semibold mx-auto"
          >
            <ArrowLeft size={14} />
            <span>Back to Owners</span>
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
