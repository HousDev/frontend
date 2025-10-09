import React, { useState, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';
import TemplateEditor from './TemplateEditor';
import { documentsTemplateAPI } from '@/lib/documentsTemplateAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
export type Template = {
  id: number | string;
  name: string;
  description: string;
  category: string;
  variables: string[];
  lastUsed: string;
  usageCount: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  content: string;
  created_by?: string | number;
  updated_by?: string | number;
};

type Props = {
  currentUserId?: string | number;
};

function safeLower(v: unknown): string {
  if (v == null) return '';
  try { return String(v).toLowerCase(); } catch { return ''; }
}

/** normalize any shape {data: {...}} | {...} into our Template shape-ish */
function normalizeTemplate(raw: any): Template {
  const t = raw?.data ?? raw ?? {};
  return {
    id: t.id,
    name: t.name ?? '',
    description: t.description ?? '',
    category: safeLower(t.category ?? ''),
    variables: Array.isArray(t.variables) ? t.variables : [],
    lastUsed: t.lastUsed ?? t.last_used ?? '',
    usageCount: typeof t.usageCount === 'number'
      ? t.usageCount
      : (typeof t.usage_count === 'number' ? t.usage_count : 0),
    status: (safeLower(t.status ?? 'draft') as 'draft' | 'active' | 'archived'),
    content: t.content ?? '',
    created_at: t.created_at ?? '',
    updated_at: t.updated_at ?? '',
    created_by: t.created_by,
    updated_by: t.updated_by,
  };
}

const TemplateCreation: React.FC<Props> = ({ currentUserId: currentUserIdProp }) => {
    const { user } = useAuth();
     const currentUserId = user?.id ?? currentUserIdProp ?? null;

  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const closeEditor = () => {
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  const getNow = () => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
  };

  // ---------------- Fetch Templates ----------------
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await documentsTemplateAPI.getAll();
      const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const sanitized = arr.map(normalizeTemplate);
      setTemplates(sanitized);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // ---------------- Handlers ----------------
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleDeleteTemplate = async (templateId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await documentsTemplateAPI.delete(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success('Template deleted successfully!');
      // optional: refetch to be 100% consistent
      fetchTemplates();
    } catch (err) {
      console.error('Delete template failed:', err);
      toast.error('Failed to delete template!');
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const { iso, date } = getNow();
      const duplicateData: Partial<Template> = {
        ...template,
        name: `${template.name} (Copy)`,
        usageCount: 0,
        lastUsed: date,
        created_at: iso,
        updated_at: iso,
        created_by: currentUserId,
        updated_by: currentUserId,
      };
      delete (duplicateData as any).id;

      const created = await documentsTemplateAPI.create(duplicateData);
      const newTemplate = normalizeTemplate(created);
      // optimistic add
      setTemplates((prev) => [...prev, newTemplate]);
      toast.success('Template duplicated successfully!');
      // refetch to sync anything the backend may have changed
      fetchTemplates();
    } catch (err) {
      console.error('Duplicate template failed:', err);
      toast.error('Failed to duplicate template!');
    }
  };

  const handleSaveTemplate = async (templateData: Template | Partial<Template>) => {
    const { iso, date } = getNow();

    // audit fields
    const payload: Partial<Template> = {
      ...templateData,
      updated_at: iso,
      updated_by: currentUserId,
    };

    try {
      if (editingTemplate?.id) {
        // UPDATE
        const updatedRes = await documentsTemplateAPI.update(editingTemplate.id, payload);
        const updated = normalizeTemplate(updatedRes);

        // optimistic replace
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplate.id ? updated : t))
        );
        toast.success('Template updated successfully!');
        // refetch to be sure
        await fetchTemplates();
      } else {
        // CREATE
        const createPayload: Partial<Template> = {
          ...payload,
          created_at: iso,
          lastUsed: (payload as Template).lastUsed || date,
          created_by: currentUserId,
          variables: Array.isArray((payload as Template)?.variables)
            ? (payload as Template).variables
            : [],
        };

        const createdRes = await documentsTemplateAPI.create(createPayload);
        const newTemplate = normalizeTemplate(createdRes);

        // optimistic add
        setTemplates((prev) => [...prev, newTemplate]);
        toast.success('Template saved successfully!');
        // refetch to be sure
        await fetchTemplates();
      }
      closeEditor();
    } catch (err) {
      console.error('Save template failed:', err);
      toast.error('Failed to save template!');
    }
  };

  // ---------------- Render ----------------
  if (loading) return <p>Loading templates...</p>;

  return (
    <div>
      {!showTemplateEditor ? (
        <TemplateSelector
          mode="manage"
          templates={templates}
          onCreateTemplate={handleCreateTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
        />
      ) : (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={closeEditor}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default TemplateCreation;
