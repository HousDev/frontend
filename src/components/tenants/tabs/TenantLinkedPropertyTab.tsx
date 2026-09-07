import React from 'react';
import { Tenant } from './types';

interface TenantLinkedPropertyTabProps {
  tenant: Tenant;
}

export default function TenantLinkedPropertyTab({ tenant }: TenantLinkedPropertyTabProps) {
  return (
    <div className="space-y-3">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <h2 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">Linked Property & Lease Status</h2>
        <p className="text-[10px] text-gray-500 mb-4">Official linked property details and landlord information</p>

        {tenant.rental_property_id ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-bold text-[9px]">
                  RENT-{tenant.rental_property_id}
                </span>
                <h3 className="font-bold text-xs text-slate-900 mt-1">{tenant.property_title || `Rental Property #${tenant.rental_property_id}`}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px]">
                Lease Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-gray-400 font-semibold block text-[10px]">Landlord / Owner</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{tenant.owner_name || 'Landlord'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block text-[10px]">Assigned Relationship Executive</span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">{tenant.assigned_to_name || 'CRM Team'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-[10px]">
            No rental property currently linked to this tenant profile.
          </div>
        )}
      </div>
    </div>
  );
}
