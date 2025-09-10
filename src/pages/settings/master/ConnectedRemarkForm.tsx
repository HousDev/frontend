// ConnectedRemarkForm.tsx
import React, { useEffect, useState } from "react";
import { masterDataAPI } from "@/lib/mastersAPI";

interface ConnectedRemarkFormData {
  id?: string;
  tabId: string;
  type1: string;
  value1: string;
  type2: string;
  value2: string;
  remarks: string[];
  status: string;
  type1Name?: string;
  type2Name?: string;
  value1Name?: string;
  value2Name?: string;
  createdAt?: string;
}

/**
 * Accept either the API shape or our shape:
 * - Some APIs use snake_case (tab_id) while internal uses camelCase (tabId).
 * - remarks can be strings or objects from some payloads.
 */
type IncomingRemarkItem =
  | string
  | { note?: string; text?: string; remark?: string };

type IncomingConnectedRemark = Partial<ConnectedRemarkFormData> & {
  tab_id?: string;
  remarks?: IncomingRemarkItem[];
};

interface ConnectedRemarkFormProps {
  onClose: () => void;
  onSubmit: (data: ConnectedRemarkFormData) => void;
  initialData?: IncomingConnectedRemark | null;
}

/** Internal form state (no id/createdAt) */
type FormState = Omit<ConnectedRemarkFormData, "id" | "createdAt">;

interface Option {
  value: string;
  label: string;
}

interface MasterOptionsState {
  tabOptions: Option[];
  typeOptions: Option[];
  valueOptions: Option[];
  type2Options: Option[];
  value2Options: Option[];
  statusOptions: Option[];
}

export const ConnectedRemarkForm: React.FC<ConnectedRemarkFormProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<FormState>({
    tabId: "",
    type1: "",
    value1: "",
    type2: "",
    value2: "",
    remarks: [""],
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [masterOptions, setMasterOptions] = useState<MasterOptionsState>({
    tabOptions: [
      { value: "property", label: "Property" },
      { value: "buyer", label: "Buyer" },
      { value: "seller", label: "Seller" },
      { value: "lead", label: "Lead" },
    ],
    typeOptions: [],
    valueOptions: [],
    type2Options: [],
    value2Options: [],
    statusOptions: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  });

  // Helpers
  const normalizeRemarkItem = (item: IncomingRemarkItem): string => {
    if (typeof item === "string") return item;
    return item.note || item.text || item.remark || "";
  };

  // Fetch master types for a tab
  const fetchMasterTypes = async (tabId: string) => {
    try {
      if (!tabId) {
        setMasterOptions((prev) => ({
          ...prev,
          typeOptions: [],
          type2Options: [],
          valueOptions: [],
          value2Options: [],
        }));
        return;
      }

      setLoading(true);
      setError(null);

      const types = await masterDataAPI.getAllMasterTypes(tabId);
      const typeOptions: Option[] = (types || []).map((type: any) => ({
        value: String(type.id),
        label: String(type.name ?? type.label ?? type.id),
      }));

      setMasterOptions((prev) => ({
        ...prev,
        typeOptions,
        type2Options: typeOptions,
      }));

      // console.log('Loaded master types for tab:', tabId, typeOptions);
    } catch (err) {
      console.error("Failed to load master types:", err);
      setError(
        `Failed to load dropdown options: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch values for a type
  const fetchMasterValues = async (typeId: string, isType2 = false) => {
    try {
      if (!typeId) {
        setMasterOptions((prev) =>
          isType2 ? { ...prev, value2Options: [] } : { ...prev, valueOptions: [] }
        );
        return;
      }

      setLoading(true);
      const values = await masterDataAPI.getMasterValues(typeId);
      const valueOptions: Option[] = (values || []).map((v: any) => ({
        value: String(v.id),
        label: String(v.value ?? v.name ?? v.label ?? v.id),
      }));

      setMasterOptions((prev) =>
        isType2 ? { ...prev, value2Options: valueOptions } : { ...prev, valueOptions: valueOptions }
      );

      // console.log(`Loaded values for ${isType2 ? 'type2' : 'type1'}:`, typeId, valueOptions);
    } catch (err) {
      console.error("Failed to load master values:", err);
      setError(
        `Failed to load dropdown options: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize form (handles edit mode)
  useEffect(() => {
    const initializeForm = async () => {
      if (initialData) {
        // Map incoming keys (supports tab_id too)
        const incomingTabId = initialData.tabId ?? initialData.tab_id ?? "";
        const incomingType1 = initialData.type1 ?? "";
        const incomingType2 = initialData.type2 ?? "";
        const incomingValue1 = initialData.value1 ?? "";
        const incomingValue2 = initialData.value2 ?? "";

        const incomingRemarks = Array.isArray(initialData.remarks)
          ? initialData.remarks.map(normalizeRemarkItem)
          : [""];

        const newForm: FormState = {
          tabId: incomingTabId,
          type1: incomingType1,
          value1: incomingValue1,
          type2: incomingType2,
          value2: incomingValue2,
          remarks: incomingRemarks.length > 0 ? incomingRemarks : [""],
          status: initialData.status ?? "Active",
        };

        setFormData(newForm);

        // load the master types + their values
        if (newForm.tabId) {
          await fetchMasterTypes(newForm.tabId);
          if (newForm.type1) await fetchMasterValues(newForm.type1, false);
          if (newForm.type2) await fetchMasterValues(newForm.type2, true);
        }

        setIsInitialized(true);
      } else {
        // fresh form defaults
        setFormData({
          tabId: "",
          type1: "",
          value1: "",
          type2: "",
          value2: "",
          remarks: [""],
          status: "Active",
        });
        setIsInitialized(true);
      }
    };

    initializeForm();
    // We want this to run whenever initialData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // When tabId changes (new selection), fetch master types and reset dependent fields
  useEffect(() => {
    if (!isInitialized) return;

    // Avoid refetch when it's the same as initialData's tab (edit mode)
    const initialTab =
      (initialData && (initialData.tabId ?? initialData.tab_id ?? "")) || "";

    if (formData.tabId && formData.tabId !== initialTab) {
      fetchMasterTypes(formData.tabId);
      setFormData((prev) => ({
        ...prev,
        type1: "",
        value1: "",
        type2: "",
        value2: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tabId, isInitialized]);

  // When type1 changes, fetch values and reset value1 if changed
  useEffect(() => {
    if (!isInitialized) return;
    const initialType1 = initialData?.type1 ?? "";

    if (formData.type1) {
      fetchMasterValues(formData.type1, false);
      if (formData.type1 !== initialType1) {
        setFormData((prev) => ({ ...prev, value1: "" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type1, isInitialized]);

  // When type2 changes, fetch values and reset value2 if changed
  useEffect(() => {
    if (!isInitialized) return;
    const initialType2 = initialData?.type2 ?? "";

    if (formData.type2) {
      fetchMasterValues(formData.type2, true);
      if (formData.type2 !== initialType2) {
        setFormData((prev) => ({ ...prev, value2: "" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type2, isInitialized]);

  // Controlled change handlers
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name as keyof FormState;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemarkChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newRemarks = [...prev.remarks];
      newRemarks[index] = value;
      return { ...prev, remarks: newRemarks };
    });
  };

  const addRemarkField = () => {
    setFormData((prev) => ({ ...prev, remarks: [...prev.remarks, ""] }));
  };

  const removeRemarkField = (index: number) => {
    setFormData((prev) => {
      if (prev.remarks.length <= 1) return prev;
      const newRemarks = [...prev.remarks];
      newRemarks.splice(index, 1);
      return { ...prev, remarks: newRemarks };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Resolve display names from masterOptions (if available)
    const type1Name =
      masterOptions.typeOptions.find((opt) => opt.value === formData.type1)?.label || "";
    const type2Name =
      masterOptions.type2Options.find((opt) => opt.value === formData.type2)?.label || "";
    const value1Name =
      masterOptions.valueOptions.find((opt) => opt.value === formData.value1)?.label || "";
    const value2Name =
      masterOptions.value2Options.find((opt) => opt.value === formData.value2)?.label || "";

    const submitData: ConnectedRemarkFormData = {
      ...formData,
      id: (initialData && (initialData.id as string)) || `cr-${Date.now()}`,
      type1Name,
      type2Name,
      value1Name,
      value2Name,
      createdAt: (initialData && initialData.createdAt) || new Date().toISOString(),
    };

    try {
      setApiLoading(true);
      setError(null);
      // console.log('Submitting data:', submitData);
      onSubmit(submitData);
    } catch (err) {
      console.error("Submit Error:", err);
      setError(
        `Failed to ${initialData ? "update" : "create"} connected remark: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setApiLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="max-w-3xl mx-auto text-xs">
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          <span className="ml-2">Loading form...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-xs">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md ring-1 ring-gray-200 space-y-3"
      >
        {loading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            <span className="ml-2">Loading options...</span>
          </div>
        )}

        {apiLoading && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" />
            <span className="ml-2">{initialData ? "Updating..." : "Creating..."}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2 text-xs">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => formData.tabId && fetchMasterTypes(formData.tabId)}
              className="mt-1 text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Retry Loading Data
            </button>
          </div>
        )}

        {/* Top Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Select Master Tab</label>
            <select
              name="tabId"
              value={formData.tabId}
              onChange={handleSelectChange}
              required
              className="w-full p-1 border rounded text-xs"
            >
              <option value="">Select Tab</option>
              {masterOptions.tabOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Select Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              className="w-full p-1 border rounded text-xs"
            >
              {masterOptions.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type & Value Rows */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Select Master Type 1</label>
            <select
              name="type1"
              value={formData.type1}
              onChange={handleSelectChange}
              required
              className="w-full p-1 border rounded text-xs"
              disabled={!formData.tabId}
            >
              <option value="">Select Master Type 1</option>
              {masterOptions.typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Select Master Value 1</label>
            <select
              name="value1"
              value={formData.value1}
              onChange={handleSelectChange}
              required
              disabled={!formData.type1}
              className="w-full p-1 border rounded text-xs disabled:bg-gray-100"
            >
              <option value="">Select Master Value 1</option>
              {masterOptions.valueOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1">Select Master Type 2</label>
            <select
              name="type2"
              value={formData.type2}
              onChange={handleSelectChange}
              required
              className="w-full p-1 border rounded text-xs"
              disabled={!formData.tabId}
            >
              <option value="">Select Master Type 2</option>
              {masterOptions.type2Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Select Master Value 2</label>
            <select
              name="value2"
              value={formData.value2}
              onChange={handleSelectChange}
              required
              disabled={!formData.type2}
              className="w-full p-1 border rounded text-xs disabled:bg-gray-100"
            >
              <option value="">Select Master Value 2</option>
              {masterOptions.value2Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block mb-1 font-medium">Remarks</label>
          <div className="space-y-2">
            {formData.remarks.map((remark, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium min-w-[24px] text-center">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => handleRemarkChange(index, e.target.value)}
                  required
                  className="flex-1 p-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  placeholder={`Enter remark ${index + 1}...`}
                />

                {formData.remarks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRemarkField(index)}
                    className="text-red-500 px-2 py-1 rounded text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRemarkField}
            className="mt-2 border border-blue-600 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
          >
            + Add Another Remark
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={apiLoading}
            className="border border-gray-300 text-gray-700 py-1 px-3 rounded text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={apiLoading || loading}
            className="bg-blue-600 text-white py-1 px-3 rounded text-xs hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {initialData ? "Update" : "Create"} Connected Remark
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConnectedRemarkForm;
