import React, { CSSProperties, useState } from 'react';
import { Activity, CheckCircle, RefreshCw } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
  progress: number;
  description: string;
  tasks: string[];
  nextStage: string | null;
}

interface StatusHistory {
  id: string;
  previous_status: string;
  status: string;
  remarks?: string;
  update_reason?: string;
  updated_by?: string;
  timestamp: string;
  price_adjustment?: boolean;
  new_price?: number;
  notify_parties?: boolean;
  effective_date?: string;
}

interface StagesTabProps {
  property: any;
  stages: Stage[];
  onStageUpdate: (newStage: string, remarks: string) => void;
  onShowStageModal: () => void;
  statusHistory: StatusHistory[];
  loadingStatusHistory: boolean;
  onRefreshHistory: () => void;
}

const StagesTab: React.FC<StagesTabProps> = ({
  property,
  stages,
  onStageUpdate,
  onShowStageModal,
  statusHistory,
  loadingStatusHistory,
  onRefreshHistory
}) => {
  const [activeSubTab, setActiveSubTab] = useState('stage');
  const currentStage = stages.find((s) => s.id === property.stage) || stages[0];
  const currentStageIndex = stages.findIndex((s) => s.id === property.stage);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      'Available': { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢', label: 'Available' },
      'Sold': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔵', label: 'Sold' },
      'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟡', label: 'Under Negotiation' },
      'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚫', label: 'On Hold' },
      'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🟣', label: 'Finalization' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab('stage')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'stage'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Stage Progress
            </button>
            <button
              onClick={() => setActiveSubTab('status')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'status'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Status Progress
            </button>
          </div>

          <div className="flex space-x-2">
            {activeSubTab === 'status' && (
              <button
                onClick={onRefreshHistory}
                disabled={loadingStatusHistory}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <RefreshCw size={14} className={loadingStatusHistory ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            )}
            {activeSubTab === 'stage' && (
              <button
                onClick={onShowStageModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Stage
              </button>
            )}
          </div>
        </div>

        {/* Stage Progress Content */}
        {activeSubTab === 'stage' && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentStage.label}</span>
                <span>{currentStage.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentStage.progress}%` } as CSSProperties}
                />
              </div>
            </div>

            {/* Current Stage Tasks */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Stage: {currentStage.label}</h4>
              <p className="text-sm text-blue-700 mb-3">{currentStage.description}</p>
              <div className="space-y-2">
                {currentStage.tasks.map((task: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="text-blue-600" size={14} />
                    <span className="text-sm text-blue-800">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="space-y-3">
              {stages.map((stage: Stage, index: number) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      {isCompleted ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isCurrent ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {stage.label}
                      </div>
                      <div className="text-sm text-gray-500">{stage.description}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {stage.progress}%
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Status Progress Content with API data */}
        {activeSubTab === 'status' && (
          <>
            {/* Current Status Display */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 mb-6 border border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3">Current Property Status</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusBadge(property.status)}
                  <div className="text-sm text-gray-600">
                    Last updated: {property.lastStatusUpdate ?
                      new Date(property.lastStatusUpdate).toLocaleDateString() :
                      'Not updated yet'
                    }
                  </div>
                </div>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openStatusUpdateModal', { detail: property });
                    window.dispatchEvent(event);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Update Status
                </button>
              </div>
            </div>

            {/* Status History Timeline from API */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Status History</h4>

              {loadingStatusHistory ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 mt-2">Loading status history...</p>
                </div>
              ) : statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((record: StatusHistory) => (
                    <div key={record.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="text-blue-600" size={16} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-gray-900 truncate">
                            Status changed from "{record.previous_status || 'Unknown'}" to "{record.status}"
                          </h5>
                          <time className="text-xs text-gray-500 flex-shrink-0">
                            {formatDateTime(record.timestamp)}
                          </time>
                        </div>

                        {record.remarks && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Remarks:</strong> {record.remarks}
                          </p>
                        )}

                        {record.update_reason && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Reason:</strong> {record.update_reason}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            By: {record.updated_by || 'Unknown User'}
                          </span>

                          <div className="flex items-center space-x-2">
                            {record.price_adjustment && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Price Updated: ₹{Number(record.new_price || 0).toLocaleString('en-IN')}
                              </span>
                            )}
                            {record.notify_parties && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Parties Notified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Show additional details if available */}
                        {record.effective_date && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div>
                              <span className="font-medium">Effective Date:</span> {formatDateTime(record.effective_date)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Activity className="mx-auto mb-2" size={32} />
                  <p>No status updates recorded yet</p>
                  <p className="text-sm">Status changes will appear here when they occur</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Recent Activities (All Types) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {property.activities?.slice(0, 5).map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.description}</div>
                <div className="text-sm text-gray-600">{activity.remarks}</div>
                <div className="text-xs text-gray-500">{activity.date} • {activity.user}</div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto mb-2" size={32} />
                <p>No activities recorded yet</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StagesTab;