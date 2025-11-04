import React from 'react';
import { Plus, Eye, Calendar, MessageCircle, MapPin, Star } from 'lucide-react';

interface VisitsTabProps {
  buyer: any;
  onScheduleVisit: () => void;
}

const VisitsTab: React.FC<VisitsTabProps> = ({ buyer, onScheduleVisit }) => {
  const sampleVisits = [
    {
      id: 1,
      property: 'Luxury 3BHK Apartment',
      address: 'Skyline Towers, Andheri West',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'scheduled',
      seller: 'Rajesh Kumar',
      feedback: '',
      rating: 0
    },
    {
      id: 2,
      property: 'Premium Villa',
      address: 'Green Valley, Pune',
      date: '2025-01-10',
      time: '2:00 PM',
      status: 'completed',
      seller: 'Priya Sharma',
      feedback: 'Excellent property, loved the location and amenities',
      rating: 5
    }
  ];

  const getVisitStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled', icon: '📅' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: '✅' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: '❌' },
      'rescheduled': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Rescheduled', icon: '🔄' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Site Visits</h3>
        <button
          onClick={onScheduleVisit}
          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
        >
          <Plus size={14} />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Visit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">{sampleVisits.length}</div>
          <div className="text-xs text-blue-700">Total Visits</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">{sampleVisits.filter(v => v.status === 'completed').length}</div>
          <div className="text-xs text-green-700">Completed</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-lg font-bold text-orange-600">{sampleVisits.filter(v => v.status === 'scheduled').length}</div>
          <div className="text-xs text-orange-700">Scheduled</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-600">
            {sampleVisits.filter(v => v.rating >= 4).length}
          </div>
          <div className="text-xs text-purple-700">Highly Rated</div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {sampleVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{visit.property}</h4>
                <div className="flex items-center space-x-1 text-gray-600 mt-0.5 text-xs">
                  <MapPin size={12} />
                  <span>{visit.address}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {getVisitStatusBadge(visit.status)}
                  <span className="text-xs text-gray-500">{visit.date} • {visit.time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-0.5">Seller: {visit.seller}</div>
                {visit.rating > 0 && (
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < visit.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {visit.feedback && (
              <div className="bg-gray-50 rounded-lg p-2">
                <span className="text-gray-500 text-xs">Feedback:</span>
                <p className="text-gray-700 mt-0.5 text-xs">{visit.feedback}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-3">
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
                <Eye size={12} />
                <span>View Property</span>
              </button>
              {visit.status === 'completed' && (
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs">
                  <Calendar size={12} />
                  <span>Schedule Revisit</span>
                </button>
              )}
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs">
                <MessageCircle size={12} />
                <span>Contact Seller</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitsTab;