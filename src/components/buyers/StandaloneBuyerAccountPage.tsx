
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { buyerAPI } from '@/lib/buyerAPI';
import BuyerAccountPage from '@/components/buyers/BuyerAccountPage';
import { toast } from 'react-toastify';

const StandaloneBuyerAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyer = async () => {
      if (!id) {
        setLoading(false);
        setError('No buyer id provided');
        return;
      }

      try {
        setLoading(true);
        // ensure this API method exists in your lib; rename to buyerAPI.get if needed
        const buyerData = await buyerAPI.getById(id);
       
        const normalized = buyerData ? buyerData : null;
       
        setBuyer(normalized);
        setError(null);
      } catch (err) {
        
        setError('Failed to load buyer data');
        setBuyer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [id]);

  const handleBack = () => navigate('/');

  const handleUpdateBuyer = async (updatedBuyer) => {
    try {
      // ensure buyerAPI.update exists
      await buyerAPI.update(id, updatedBuyer);
      setBuyer(updatedBuyer);
    } catch (err) {
      toast.error('Error updating buyer:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="mt-2 text-gray-600">Loading buyer account...</p>
        </div>
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Buyer Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The buyer you are looking for does not exist.'}</p>
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
          >
            <ArrowLeft size={16} />
            <span>Back to Buyers</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <BuyerAccountPage
      buyer={buyer}
      onBack={handleBack}
      onUpdateBuyer={handleUpdateBuyer}
    />
  );
};

export default StandaloneBuyerAccountPage;
