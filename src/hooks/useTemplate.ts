// // src/hooks/useTemplate.ts
// import { useState, useEffect, useCallback } from 'react';
// import type { Template } from '../types';
// import { MOCK_TEMPLATES } from '../lib/mockData';
// import { notificationStore } from '../lib/notifications';

// // In‑memory store for templates (will be mutated)
// let templatesStore: Template[] = JSON.parse(JSON.stringify(MOCK_TEMPLATES));
// let nextTemplateId = 5;

// // Helper to simulate delay
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export function useTemplates() {
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchTemplates = useCallback(async () => {
//     setLoading(true);
//     await delay(300);
//     setTemplates([...templatesStore]);
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchTemplates();
//   }, [fetchTemplates]);

//   const createTemplate = useCallback(async (template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'meta_template_id' | 'rejection_reason'>) => {
//     await delay(500);
//     const newTemplate: Template = {
//       id: `tpl${nextTemplateId++}`,
//       ...template,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//       status: template.status || 'PENDING',
//       meta_template_id: null,
//       rejection_reason: null,
//     } as Template;
//     templatesStore = [newTemplate, ...templatesStore];
//     setTemplates([...templatesStore]);
//     notificationStore.push('template', 'Template Saved', `Template "${template.name}" submitted for review.`,  {label:"",page:""});
//     return { data: newTemplate, error: null };
//   }, []);

//   const updateTemplate = useCallback(async (id: string, updates: Partial<Template>) => {
//     await delay(300);
//     const index = templatesStore.findIndex(t => t.id === id);
//     if (index !== -1) {
//       templatesStore[index] = {
//         ...templatesStore[index],
//         ...updates,
//         updated_at: new Date().toISOString(),
//       };
//       setTemplates([...templatesStore]);
//       return { data: templatesStore[index], error: null };
//     }
//     return { data: null, error: new Error('Template not found') };
//   }, []);

//   const deleteTemplate = useCallback(async (id: string) => {
//     await delay(300);
//     const initialLength = templatesStore.length;
//     templatesStore = templatesStore.filter(t => t.id !== id);
//     if (templatesStore.length !== initialLength) {
//       setTemplates([...templatesStore]);
//       return { error: null };
//     }
//     return { error: new Error('Template not found') };
//   }, []);

//   const submitToMeta = useCallback(async (id: string) => {
//     await delay(500);
//     const index = templatesStore.findIndex(t => t.id === id);
//     if (index !== -1) {
//       templatesStore[index] = {
//         ...templatesStore[index],
//         status: 'PENDING',
//         updated_at: new Date().toISOString(),
//       };
//       setTemplates([...templatesStore]);
//     }
//     notificationStore.push('info', 'Template Submitted', 'Sent for Meta review.',  {label:"",page:""});
//   }, []);

//   return {
//     templates,
//     loading,
//     createTemplate,
//     updateTemplate,
//     deleteTemplate,
//     submitToMeta,
//     refresh: fetchTemplates,
//   };
// }

// src/hooks/useTemplates.ts
import { useState, useEffect, useCallback } from 'react';
import { whatsappAPI } from '../lib/whatsappApi';
import type { Template } from '../types';
import { notificationStore } from '../lib/notifications';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data:any = await whatsappAPI.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
      notificationStore.push('error', 'Fetch Failed', 'Could not load templates.', { label: "", page: "" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'meta_template_id' | 'rejection_reason'>) => {
    try {
      const newTemplate = await whatsappAPI.createTemplate(template);
      setTemplates((prev:any) => [newTemplate, ...prev]);
      notificationStore.push('template', 'Template Saved', `Template "${template.name}" submitted for review.`, { label: "", page: "" });
      return { data: newTemplate, error: null };
    } catch (err: any) {
      console.error('Failed to create template', err);
      notificationStore.push('error', 'Create Failed', err.message || 'Could not create template.', { label: "", page: "" });
      return { data: null, error: err };
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<Template>) => {
    try {
      const updated = await whatsappAPI.updateTemplate(id, updates);
      setTemplates((prev:any) => prev.map(t => t.id === id ? updated : t));
      notificationStore.push('success', 'Template Updated', `Template "${updated.name}" has been updated.`, { label: "", page: "" });
      return { data: updated, error: null };
    } catch (err: any) {
      console.error('Failed to update template', err);
      notificationStore.push('error', 'Update Failed', err.message || 'Could not update template.', { label: "", page: "" });
      return { data: null, error: err };
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await whatsappAPI.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      notificationStore.push('success', 'Template Deleted', 'Template has been deleted.', { label: "", page: "" });
      return { error: null };
    } catch (err: any) {
      console.error('Failed to delete template', err);
      notificationStore.push('error', 'Delete Failed', err.message || 'Could not delete template.', { label: "", page: "" });
      return { error: err };
    }
  }, []);

  const submitToMeta = useCallback(async (id: string) => {
    try {
      const result = await whatsappAPI.submitTemplateToMeta(id);
      setTemplates((prev:any) => prev.map(t => t.id === id ? result.template : t));
      notificationStore.push('info', 'Template Submitted', 'Sent for Meta review.', { label: "", page: "" });
      return result;
    } catch (err: any) {
      console.error('Failed to submit template to Meta', err);
      notificationStore.push('error', 'Submit Failed', err.message || 'Could not submit template to Meta.', { label: "", page: "" });
      return { success: false, error: err };
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    submitToMeta,
    refresh,
  };
}