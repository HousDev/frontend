import React, { FC, useMemo, useState, useEffect, useRef } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Check,
    Upload,
    Download,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { variableAPI } from '@/lib/variableAPI';
import { toast } from 'react-toastify';
import TableLoader from '@/components/ui/TableLoader';


type Status = 'active' | 'inactive';

interface Variable {
    id: number;
    name: string;
    variable_name: string; // matches backend
    variableTabId: string;
    status: Status;
}

type VariablesState = Record<string, Variable[]>;

interface Tab {
    id: string;
    label: string;
}

const TABS: Tab[] = [
    { id: 'buyer', label: 'Buyer Variables' },
    { id: 'seller', label: 'Seller Variables' },
    { id: 'property', label: 'Property Variables' },
    { id: 'leads', label: 'Leads Variables' },
    { id: 'account', label: 'Account Variables' },
    { id: 'company', label: 'Company Variables' },
    { id: 'common', label: 'Common Variables' },
];

const normalizeKey = (s: string = '') =>
    s.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();

const toVarToken = (name: string = '') => {
    const key = normalizeKey(name);
    return key ? `{{${key}}}` : '';
};

const stripBraces = (token: string = '') => String(token).replace(/^\{\{|\}\}$/g, '').trim();

const VariableCenter: FC = () => {
    const [variables, setVariables] = useState<VariablesState>({});
    const [activeTabId, setActiveTabId] = useState<string>(TABS[0].id);
    const [query, setQuery] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<{ name: string; variable_name: string; status: Status }>({
        name: '',
        variable_name: '',
        status: 'active',
    });
    const [isVarNameDirty, setIsVarNameDirty] = useState(false);
    const [error, setError] = useState('');

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    // top with other useState hooks
    const [loading, setLoading] = useState<boolean>(false);

    // NEW state (put with other useState hooks)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importTabId, setImportTabId] = useState<string>(activeTabId);
    const [skipDupOnImport, setSkipDupOnImport] = useState<boolean>(true);

    // ------------------------ Dynamic tab placeholders ------------------------
    const TAB_PLACEHOLDERS: Record<string, { display: string; token: string }> = {
        buyer: { display: 'Buyer Name', token: '{{buyer_name}}' },
        seller: { display: 'Seller Name', token: '{{seller_name}}' },
        property: { display: 'Property Title', token: '{{property_title}}' },
        leads: { display: 'Lead Name', token: '{{lead_name}}' },
        account: { display: 'Account Name', token: '{{account_name}}' },
        company: { display: 'Company Name', token: '{{company_name}}' },
        common: { display: 'Common Variable', token: '{{common_variable}}' },
    };

    // ------------------------ inside VariableCenter component ------------------------
    const activeTabPlaceholder = TAB_PLACEHOLDERS[activeTabId]?.display || 'Variable Name';
    const activeTabToken = TAB_PLACEHOLDERS[activeTabId]?.token || '{{variable_name}}';


    const tabsById = useMemo(() => {
        const m = new Map<string, Tab>();
        TABS.forEach((t) => m.set(t.id, t));
        return m;
    }, []);




    // ---- Dynamic CSV template per tab (includes variableTabId) ----
    const buildVariableCsvTemplate = (tabId: string) => {
        const header = ['name', 'variable_name', 'variableTabId', 'status'];

        // [name, tokenKeyWithoutBraces, status]
        const samples: Record<string, [string, string, 'active' | 'inactive'][]> = {
            buyer: [
                ['Buyer Name', 'buyer_name', 'active'],

            ],
            seller: [
                ['Seller Name', 'seller_name', 'active'],

            ],
            property: [
                ['Property Title', 'property_title', 'active'],

            ],
            leads: [
                ['Lead Name', 'lead_name', 'active'],

            ],
            account: [
                ['Account Name', 'account_name', 'active'],
                ['Account Number', 'account_number', 'inactive'],
            ],
            company: [
                ['Company Name', 'company_name', 'active'],

            ],
            common: [
                ['Common Variable', 'common_variable', 'active'],
            ],
        };

        const sampleRows =
            (samples[tabId] || [['Sample Name', 'sample_name', 'active']]).map(
                ([name, key, status]) => [name, `{{${key}}}`, tabId, status]
            );

        const rows = [header, ...sampleRows]
            .map(cols => cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        return new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    };

    const downloadTemplateCSV = (tabId: string, tabLabel: string) => {
        const blob = buildVariableCsvTemplate(tabId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Import_Template_${(tabLabel || 'Variables').replace(/\s+/g, '_')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };



    // Load variables for current tab
    const loadVariables = async (tabId: string) => {
        try {
            const res = await variableAPI.getByTab(tabId);
            if (res.success) {
                setVariables((prev) => ({ ...prev, [tabId]: res.data }));
            } else {
                toast.error('Failed to fetch variables.');
            }
        } catch (err) {
            console.error('Error fetching variables:', err);
            toast.error('Failed to fetch variables.');
        }
    };

    useEffect(() => {
        loadVariables(activeTabId);
        setSelectedIds(new Set());
    }, [activeTabId]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = variables[activeTabId] || [];
        if (!q) return list;
        return list.filter(
            (v) =>
                v.name.toLowerCase().includes(q) ||
                v.variable_name.toLowerCase().includes(q)
        );
    }, [variables, activeTabId, query]);

    const totalCount = useMemo(
        () => Object.values(variables).reduce((sum, list) => sum + list.length, 0),
        [variables]
    );

    const tabCounts = useMemo(() => {
        const m = new Map<string, number>();
        for (const t of TABS) m.set(t.id, variables[t.id]?.length ?? 0);
        return m;
    }, [variables]);

    const activeTabLabel = tabsById.get(activeTabId)?.label ?? 'Variables';

    const resetForm = () => {
        setEditingId(null);
        setForm({ name: '', variable_name: '', status: 'active' });
        setIsVarNameDirty(false);
        setError('');
        setIsModalOpen(false);
    };

    const openAddModal = () => {
        setEditingId(null);
        setForm({ name: '', variable_name: '', status: 'active' });
        setIsVarNameDirty(false);
        setError('');
        setIsModalOpen(true);
    };

    const startEdit = (item: Variable) => {
        setEditingId(item.id);
        setForm({ name: item.name, variable_name: item.variable_name, status: item.status });
        setIsVarNameDirty(true);
        setError('');
        setIsModalOpen(true);
    };

    const validate = (name: string, variable_name: string, ignoreId: number | null): string => {
        if (!name.trim()) return 'Please enter Name.';
        if (!variable_name.trim()) return 'Please enter Variable Name.';
        if (!/^\{\{[a-z0-9_]+\}\}$/.test(variable_name))
            return 'Variable Name must be like {{buyer_name}}';

        const tokenKey = stripBraces(variable_name).toLowerCase();
        const list = variables[activeTabId] || []; // only current tab
        const duplicateExists = list.some(
            (v) => stripBraces(v.variable_name).toLowerCase() === tokenKey && v.id !== ignoreId
        );
        if (duplicateExists) return `Variable Name '${variable_name}' already exists.`;
        return '';
    };


    const addVariable = async () => {
        const name = form.name.trim();
        const variable_name = form.variable_name || toVarToken(name);
        const err = validate(name, variable_name, null);
        if (err) {
            setError(err);
            toast.error(err);
            return;
        }

        try {
            const res = await variableAPI.create({
                name: form.name,
                variableName: form.variable_name, // map to camelCase for API
                variableTabId: activeTabId,
                status: form.status,
            });
            if (res.success) {
                toast.success('Variable added.');
                loadVariables(activeTabId);
                resetForm();
            } else {
                toast.error('Failed to add variable.');
            }
        } catch (err: any) {
            const msg = err?.message || 'Error adding variable';
            setError(msg);
            toast.error(msg);
        }
    };

    const saveEdit = async () => {
        if (!editingId) return;
        const err = validate(form.name, form.variable_name, editingId);
        if (err) {
            setError(err);
            toast.error(err);
            return;
        }

        try {
            const res = await variableAPI.update(editingId, {
                name: form.name,
                variableName: form.variable_name, // map to camelCase for API
                status: form.status,
            });
            if (res.success) {
                toast.success('Variable updated.');
                loadVariables(activeTabId);
                resetForm();
            } else {
                toast.error('Failed to update variable.');
            }
        } catch (err: any) {
            const msg = err?.message || 'Error updating variable';
            setError(msg);
            toast.error(msg);
        }
    };

    const remove = async (id: number) => {
        if (!window.confirm('Delete this variable?')) return;
        try {
            const res = await variableAPI.delete(id);
            if (res.success) {
                toast.success('Variable deleted.');
                loadVariables(activeTabId);
            } else {
                toast.error('Failed to delete variable.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete variable.');
        }
    };

    const removeSelected = async () => {
        if (!selectedIds.size) return;
        if (!window.confirm(`Delete ${selectedIds.size} selected variable(s)?`)) return;
        try {
            const res = await variableAPI.bulkDelete(Array.from(selectedIds));
            if (res.success) {
                toast.success(`${selectedIds.size} variable(s) deleted.`);
                loadVariables(activeTabId);
                setSelectedIds(new Set());
            } else {
                toast.error('Failed to delete selected variables.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete selected variables.');
        }
    };

    const updateSelectedStatus = async (status: Status) => {
        if (!selectedIds.size) return;
        try {
            const res = await variableAPI.bulkUpdateStatus(Array.from(selectedIds), status);
            if (res.success) {
                toast.success(
                    `Marked ${selectedIds.size} as ${status === 'active' ? 'Active' : 'Inactive'}.`
                );
                loadVariables(activeTabId);
                setSelectedIds(new Set());
            } else {
                toast.error('Failed to update status.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status.');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(new Set(filtered.map((v) => v.id)));
        else setSelectedIds(new Set());
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const handleExport = () => {
        const rows = variables[activeTabId] || [];
        const header = ['id', 'name', 'variable_name', 'variableTabId', 'status'];
        const csv = [
            header.join(','),
            ...rows.map((r) =>
                [r.id, `"${r.name}"`, `"${r.variable_name}"`, r.variableTabId, r.status].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTabId}-variables.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success(`Exported ${rows.length} item(s).`);
    };

    // inside toolbar, replace alert with a hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        setImportTabId(activeTabId);
        setSkipDupOnImport(true);
        setIsImportModalOpen(true);
    };


    const triggerFileChooser = () => fileInputRef.current?.click();


    return (
        <div className="bg-slate-50 text-xs">
            {/* Toasts */}


            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <header className="flex items-center justify-between gap-3 p-4 border-b bg-white shadow-sm">
                    <h1 className="text-lg font-semibold">
                        Variable Data Management
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            Total: {totalCount}
                        </span>
                    </h1>
                </header>

                {/* Tabs */}
                <div className="bg-white border-b">
                    <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTabId(t.id)}
                                className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1 transition-colors ${activeTabId === t.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span>{t.label}</span>
                                {/* count removed from tab */}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-4 flex items-center gap-3 p-4">
                    <div className="font-bold text-slate-900">{activeTabLabel}</div>
                    <div className="text-slate-500">
                        {tabCounts.get(activeTabId) ?? 0} items
                    </div>
                    <div className="ml-auto w-full max-w-md">
                        <input
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder={`Search in ${activeTabLabel}...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                            onClick={handleImportClick}
                        >
                            <Upload size={14} />
                            Import
                        </button>
                        <input

                            type="file"

                            className="hidden"

                        />

                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-white hover:bg-orange-700"
                            onClick={handleExport}
                        >
                            <Download size={14} />
                            Export
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                            onClick={openAddModal}
                        >
                            <Plus size={14} />
                            Add Variable
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="mx-4 mt-4 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    {/* Selected items toolbar */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center justify-between rounded-t-xl border-b border-blue-200 bg-blue-50 px-4 py-2">
                            <div className="font-semibold text-blue-800">{selectedIds.size} selected</div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => updateSelectedStatus('active')}
                                    className="inline-flex items-center gap-1 font-medium text-green-600 hover:text-green-800"
                                >
                                    <CheckCircle2 size={12} />
                                    Mark as Active
                                </button>
                                <button
                                    onClick={() => updateSelectedStatus('inactive')}
                                    className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-800"
                                >
                                    <XCircle size={12} />
                                    Mark as Inactive
                                </button>
                                <button
                                    onClick={removeSelected}
                                    className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={12} />
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 uppercase text-slate-600">
                                <tr>
                                    <th className="w-4 p-3">
                                        <input
                                            type="checkbox"
                                            ref={headerCheckboxRef}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Variable Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Loader while fetching
                                    <tr>
                                        <td colSpan={5} className="p-0">
                                            <TableLoader colSpan={5} />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    // Empty state when not loading
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-slate-500">
                                            <p className="font-semibold">No variables found.</p>
                                            <p className="mt-1">Try another search or click “Add Variable”.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((v) => (
                                        <tr
                                            key={v.id}
                                            className={`border-b ${selectedIds.has(v.id) ? 'bg-blue-50' : 'bg-white'} hover:bg-slate-50`}
                                        >
                                            <td className="w-4 p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(v.id)}
                                                    onChange={() => handleSelectOne(v.id)}
                                                    className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-3 font-medium text-slate-900">{v.name}</td>
                                            <td className="px-6 py-3 font-mono text-blue-700">{v.variable_name}</td>
                                            <td className="px-6 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {v.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(v)}
                                                        className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => remove(v.id)}
                                                        className="rounded-md p-2 text-red-600 hover:bg-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={resetForm}
                title={
                    editingId
                        ? `Edit Variable — ${activeTabLabel}`
                        : `Add New Variable — ${activeTabLabel}`
                }
            >
                <div className="">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block font-medium text-slate-700">Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setForm((f) => ({
                                        ...f,
                                        name,
                                        variable_name: isVarNameDirty ? f.variable_name : toVarToken(name),
                                    }));
                                    setError('');
                                }}
                                placeholder={`e.g., ${activeTabPlaceholder}`}  // <-- dynamic placeholder
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block font-medium text-slate-700">Variable Name</label>
                            <input
                                type="text"
                                value={form.variable_name}
                                onChange={(e) => {
                                    setIsVarNameDirty(true);
                                    let val = e.target.value.trim();
                                    if (/^[a-z0-9_]+$/.test(val)) val = `{{${val}}}`;
                                    setForm((f) => ({ ...f, variable_name: val }));
                                    setError('');
                                }}
                                placeholder={activeTabToken}  // <-- dynamic token
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="mb-1 block font-medium text-slate-700">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {error && <div className="mt-3 font-medium text-red-600">{error}</div>}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <button
                        onClick={resetForm}
                        className="rounded-md bg-white px-3 py-2 font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={editingId ? saveEdit : addVariable}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        {editingId ? <Check size={14} /> : <Plus size={14} />}
                        {editingId ? 'Update Variable' : 'Add Variable'}
                    </button>
                </div>
            </Modal>
            {/* Import Modal */}
            {/* Import Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title={`Import ${tabsById.get(importTabId)?.label || 'Variables'}`}
            >
                <div className="space-y-4">
                    {/* Download Template */}
                    <button
                        onClick={() => downloadTemplateCSV(importTabId, tabsById.get(importTabId)?.label || 'Variables')}
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                        <Download size={14} />
                        Download Template
                    </button>


                    {/* File Input */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Select File (CSV or Excel)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"

                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Supported formats: CSV, Excel (.xlsx, .xls)
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
                        <button
                            onClick={() => setIsImportModalOpen(false)}
                            className="rounded-md bg-white px-3 py-2 font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={triggerFileChooser}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            <Upload size={14} />
                            Import
                        </button>
                    </div>
                </div>
            </Modal>


        </div>
    );
};

export default VariableCenter;
