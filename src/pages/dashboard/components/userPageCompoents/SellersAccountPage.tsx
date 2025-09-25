import React, { useEffect, useState } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Mail, Phone, Calendar, Activity, UserPlus } from 'lucide-react';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';
import { sellerAPI } from '@/lib/sellersAPI';

interface Seller {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  last_login?: string;
}

const SellersAccountPage: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const resp = await sellerAPI.getAll();   // 👈 direct seller API call
      if (resp?.success) {
        setSellers(resp.data || []);
      } else {
        toast.error(resp?.message || 'Failed to load sellers');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error fetching sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Sellers</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : sellers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {sellers.map((s) => (
              <li key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">
                    {s.first_name} {s.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{s.email}</div>
                  {s.phone && <div className="text-sm text-gray-500">{s.phone}</div>}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className={s.is_active ? 'text-red-600' : 'text-green-600'}>
                    {s.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <UserPlus className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            No sellers found
          </div>
        )}
      </div>
    </div>
  );
};

export default SellersAccountPage;
