import React, { useEffect, useMemo, useState } from 'react';
import {
  Variable as VariableIcon,
  Copy,
  Search,
  User,
  Building,
  CreditCard,
} from 'lucide-react';
import { variableAPI } from '@/lib/variableAPI';

// ---- Types ----
export type MappedVariable = {
  name: string;
  label: string;
  category: string;    // MUST match one of: buyer, seller, property, leads, account, company, common
  description: string;
};

type Props = {
  onVariableInsert?: (v: MappedVariable) => void;
  onLoaded?: (vars: MappedVariable[]) => void; // optional lift to parent
};

// ---- Fixed Category Meta (as you specified) ----
const CATEGORY_META: { id: string; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'all',      label: 'All Variables',     icon: VariableIcon },
  { id: 'buyer',    label: 'Buyer Variables',   icon: User },
  { id: 'seller',   label: 'Seller Variables',  icon: User },
  { id: 'property', label: 'Property Variables',icon: Building },
  { id: 'leads',    label: 'Leads Variables',   icon: User },
  { id: 'account',  label: 'Account Variables', icon: CreditCard },
  { id: 'company',  label: 'Company Variables', icon: Building },
  { id: 'common',   label: 'Common Variables',  icon: VariableIcon },
];

// ---- Helper: safe normalize category coming from API ----
function normalizeCategory(raw: any): string {
  const v = String(raw || '').toLowerCase().trim();
  const allowed = new Set(CATEGORY_META.map(c => c.id).filter(id => id !== 'all'));
  return allowed.has(v) ? v : 'common';
}

// ---- Grouping utility for console printing ----
function groupByCategory(vars: MappedVariable[]) {
  const groups: Record<string, MappedVariable[]> = {};
  for (const v of vars) {
    const cat = v.category || 'common';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(v);
  }
  return groups;
}

const VariablePanel: React.FC<Props> = ({ onVariableInsert, onLoaded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [variables, setVariables] = useState<MappedVariable[]>([]);

// Fetch & map
useEffect(() => {
  (async () => {
    try {
      const apiResponse = await variableAPI.getAll();
      const mappedData: MappedVariable[] = (apiResponse?.data || []).map((item: any) => ({
        name: item.variable_key,
        label: item.name,
        category: normalizeCategory(item.category),
        description: item.name,
      }));

      setVariables(mappedData);
      onLoaded?.(mappedData);

    } catch (err) {
      console.error('Error fetching variables:', err);
      setVariables([]);
      onLoaded?.([]);
    }
  })();
}, [onLoaded]);


  // Derived categories (only those that exist in data, preserving fixed order)
  const dynamicCategories = useMemo(() => {
    const present = new Set(variables.map(v => v.category));
    const fixedWithoutAll = CATEGORY_META.filter(c => c.id !== 'all');
    const ordered = fixedWithoutAll.filter(c => present.has(c.id));
    return [{ id: 'all', label: 'All Variables', icon: VariableIcon }, ...ordered];
  }, [variables]);

  // Filtered list for UI
  const filteredVariables = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return variables.filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(term) ||
        v.label.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [variables, searchTerm, selectedCategory]);

  // Counts per category for badges on tabs
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of variables) {
      counts[v.category] = (counts[v.category] || 0) + 1;
    }
    counts['all'] = variables.length;
    return counts;
  }, [variables]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variables Panel</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Category Tabs (only categories present in data, in fixed order) */}
        <div className="flex flex-wrap gap-1">
          {dynamicCategories.map((category) => {
            const Icon = category.icon;
            const active = selectedCategory === category.id;
            const count = catCounts[category.id] ?? 0;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={`${category.label} (${count})`}
              >
                <Icon size={12} />
                <span>{category.label}</span>
                <span className={`ml-1 inline-block px-1 rounded ${active ? 'bg-blue-200' : 'bg-gray-200'} text-[10px]`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variables List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {filteredVariables.map((variable) => (
            <div
              key={variable.name}
              onClick={() => onVariableInsert?.(variable)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-600 group-hover:bg-blue-100">
                      {`{{${variable.name}}}`}
                    </code>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{variable.category}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                </div>
                <Copy className="text-gray-400 group-hover:text-blue-600" size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredVariables.length === 0 && (
        <div className="p-8 text-center">
          <VariableIcon className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 text-sm">No variables found</p>
        </div>
      )}
    </div>
  );
};

export default VariablePanel;
