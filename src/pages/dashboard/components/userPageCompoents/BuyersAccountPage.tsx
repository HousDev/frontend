import React, { useEffect, useState } from 'react';
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Activity,
  UserPlus
} from 'lucide-react';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';
import { buyerAPI } from '@/lib/buyerAPI';

interface Buyer {
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

const BuyersAccountPage: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const resp = await buyerAPI.getAll(); // 👈 buyers API call
      if (resp?.success) {
        setBuyers(resp.data || []);
      } else {
        toast.error(resp?.message || 'Failed to load buyers');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error fetching buyers');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchBuyers();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Buyers</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : buyers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {buyers.map((b) => (
              <li
                key={b.id}
                className="p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {b.first_name} {b.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{b.email}</div>
                  {b.phone && <div className="text-sm text-gray-500">{b.phone}</div>}
                </div>
               
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <UserPlus className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            No buyers found
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyersAccountPage;
