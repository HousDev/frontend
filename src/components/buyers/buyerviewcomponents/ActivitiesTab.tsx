import React from 'react';
import { Phone, Eye, Users, Mail, MessageCircle, Activity, Plus, Edit, Star } from 'lucide-react';

interface ActivitiesTabProps {
  buyer: any;
  onAddActivity: () => void;
  onEditActivity: (activity: any) => void;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ buyer, onAddActivity, onEditActivity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="text-blue-600" size={16} />;
      case 'visit': return <Eye className="text-green-600" size={16} />;
      case 'meeting': return <Users className="text-purple-600" size={16} />;
      case 'email': return <Mail className="text-orange-600" size={16} />;
      case 'whatsapp': return <MessageCircle className="text-green-600" size={16} />;
      default: return <Activity className="text-gray-600" size={16} />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      'call': 'Phone Call',
      'visit': 'Property Visit',
      'meeting': 'Meeting',
      'email': 'Email',
      'whatsapp': 'WhatsApp',
      'presentation': 'Presentation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 mb-1 md:mb-0">
          Activity Timeline
        </h3>
        <button
          onClick={onAddActivity}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          <span>Add Activity</span>
        </button>
      </div>

      {buyer.activities?.length > 0 ? (
        <div className="space-y-2">
          {buyer.activities.map((activity: any, index: number) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < buyer.activities.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-200"></div>
              )}

              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="p-2 bg-white border border-gray-200 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 text-xs">
                        {activity.description}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                        {getActivityTypeLabel(activity.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-gray-500">
                        {activity.date} • {activity.time}
                      </span>
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-[11px]">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium ml-1">{activity.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stage:</span>
                      <span className="font-medium ml-1">
                        {activity.stage.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Executed by:</span>
                      <span className="font-medium ml-1">{activity.executedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center space-x-0.5 ml-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < activity.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-gray-500">Outcome:</span>
                      <p className="text-gray-700">{activity.outcome}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Action:</span>
                      <p className="text-gray-700">{activity.nextAction}</p>
                    </div>
                    {activity.remarks && (
                      <div>
                        <span className="text-gray-500">Remarks:</span>
                        <p className="text-gray-700">{activity.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 p-6 text-center">
          <Activity className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-xs font-semibold text-gray-900 mb-1">
            No Activities Yet
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            Start tracking buyer interactions and activities
          </p>
          <button
            onClick={onAddActivity}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
          >
            Add First Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;