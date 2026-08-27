import React, { useState } from 'react';
import { TrendingUp, CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

interface RentalStagesTabProps {
  property: any;
  onUpdateStage?: (stage: string) => void;
}

const RENTAL_STAGES = [
  { id: 'lead', label: 'Lead / New Listing', desc: 'Initial contact & rental property onboarding' },
  { id: 'marketing', label: 'Active Promotion', desc: 'Listed on portals & tenant matching active' },
  { id: 'visit', label: 'Tenant Inspection', desc: 'Site visits & property walkthroughs' },
  { id: 'negotiation', label: 'Rent Negotiation', desc: 'Rent, deposit & lock-in terms discussion' },
  { id: 'agreement', label: 'Rent Agreement', desc: 'Drafting agreement & police verification' },
  { id: 'leased', label: 'Tenant Occupied', desc: 'Keys handed over & active lease agreement' },
];

const RentalStagesTab: React.FC<RentalStagesTabProps> = ({
  property,
  onUpdateStage
}) => {
  const [currentStage, setCurrentStage] = useState(property?.stage || 'lead');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: N }}>Rental Property Lifecycle Stages</h3>
          <p className="text-[11px] text-gray-500">Track progress from initial rental listing to tenant occupancy</p>
        </div>
      </div>

      {/* Lifecycle Flow Grid */}
      <div className="bg-white rounded-xl border p-4 shadow-sm" style={{ borderColor: BD }}>
        <div className="space-y-3">
          {RENTAL_STAGES.map((st, idx) => {
            const isActive = currentStage === st.id;
            return (
              <div
                key={st.id}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${isActive ? 'bg-orange-50/50 border-orange-300 ring-1 ring-orange-200' : 'bg-slate-50/50 border-slate-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: N }}>{st.label}</h4>
                    <p className="text-[10px] text-gray-500">{st.desc}</p>
                  </div>
                </div>

                {isActive && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700">
                    Current Stage
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RentalStagesTab;
