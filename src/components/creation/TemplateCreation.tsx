import React, { useState, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';
import TemplateEditor from './TemplateEditor';
import { documentsTemplateAPI } from '@/lib/documentsTemplateAPI';
import { toast } from 'react-toastify';

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
  /** Optional: if you have auth, pass logged-in user's id */
  currentUserId?: string | number;
};

const TemplateCreation: React.FC<Props> = ({ currentUserId }) => {
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
      const data: Template[] = await documentsTemplateAPI.getAll();
      const sanitized = (Array.isArray(data) ? data : []).map((t) => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : [],
      }));
      setTemplates(sanitized);
    } catch (err) {
      console.error('Error fetching templates:', err);
      // graceful UI is handled by TemplateSelector empty state
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
      alert('Template deleted successfully!');
    } catch (err) {
      console.error('Delete template failed:', err);
      alert('Failed to delete template!');
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

      const newTemplate = await documentsTemplateAPI.create(duplicateData);
      setTemplates((prev) => [...prev, newTemplate]);
      alert('Template duplicated successfully!');
    } catch (err) {
      console.error('Duplicate template failed:', err);
      alert('Failed to duplicate template!');
    }
  };

  const handleSaveTemplate = async (templateData: Template | Partial<Template>) => {
    const { iso, date } = getNow();

    // Inject audit fields
    const payload: Partial<Template> = {
      ...templateData,
      updated_at: iso,
      updated_by: currentUserId,
    };

    try {
      if (editingTemplate?.id) {
        await documentsTemplateAPI.update(editingTemplate.id, payload);
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === editingTemplate.id
              ? {
                  ...(t as Template),
                  ...(payload as Template),
                  id: editingTemplate.id,
                  lastUsed: (payload as Template).lastUsed || date,
                }
              : t
          )
        );
        // alert('Template updated successfully!');
      } else {
        const createPayload: Partial<Template> = {
          ...payload,
          created_at: iso,
          lastUsed: (payload as Template).lastUsed || date,
          created_by: currentUserId,
          // ensure arrays
          variables: Array.isArray((payload as Template)?.variables)
            ? (payload as Template).variables
            : [],
        };
        const newTemplate = await documentsTemplateAPI.create(createPayload);
        setTemplates((prev) => [...prev, newTemplate]);
       toast.success('Template saved successfully!');
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
