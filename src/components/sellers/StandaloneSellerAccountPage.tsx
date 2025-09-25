// components/sellers/StandaloneSellerAccountPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { sellerAPI } from '@/lib/sellersAPI';
import SellerAccountPage from './SellerAccountPage';

const StandaloneSellerAccountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSeller = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          setError('No seller id provided');
        }
        return;
      }

      try {
  setLoading(true);
  const sellerData = await sellerAPI.getById(id);
  console.log("seller data", sellerData);
  if (isMounted) {
    setSeller({
      ...sellerData.data.seller,
      properties: sellerData.data.properties || [],
      properties_count: sellerData.data.properties?.length || 0,
    });
    setError(null);
  }
} catch (err) {
  console.error("Error fetching seller:", err);
  if (isMounted) {
    setError("Failed to load seller data");
    setSeller(null);
  }
} finally {
  if (isMounted) setLoading(false);
}}

    fetchSeller();
    return () => { isMounted = false; };
  }, [id]);

  const handleBack = () => navigate('/');

  const handleUpdateSeller = async (updatedSeller: any) => {
    try {
      const savedSeller = await sellerAPI.update(id, updatedSeller);
      setSeller(savedSeller);
    } catch (err) {
      console.error('Error updating seller:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading seller account...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Seller Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The seller you are looking for does not exist.'}</p>
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft size={16} />
            <span>Back to Sellers</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <SellerAccountPage
      seller={seller}
      onBack={handleBack}
      onUpdateSeller={handleUpdateSeller}
    />
  );
};

export default StandaloneSellerAccountPage;
