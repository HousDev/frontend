// src/hooks/useTemplate.ts
import { useState, useEffect, useCallback } from 'react';
import type { Template } from '../types';
import { MOCK_TEMPLATES } from '../lib/mockData';
import { notificationStore } from '../lib/notifications';

// In‑memory store for templates (will be mutated)
let templatesStore: Template[] = JSON.parse(JSON.stringify(MOCK_TEMPLATES));
let nextTemplateId = 5;

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    await delay(300);
    setTemplates([...templatesStore]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'meta_template_id' | 'rejection_reason'>) => {
    await delay(500);
    const newTemplate: Template = {
      id: `tpl${nextTemplateId++}`,
      ...template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: template.status || 'PENDING',
      meta_template_id: null,
      rejection_reason: null,
    } as Template;
    templatesStore = [newTemplate, ...templatesStore];
    setTemplates([...templatesStore]);
    notificationStore.push('template', 'Template Saved', `Template "${template.name}" submitted for review.`,  {label:"",page:""});
    return { data: newTemplate, error: null };
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<Template>) => {
    await delay(300);
    const index = templatesStore.findIndex(t => t.id === id);
    if (index !== -1) {
      templatesStore[index] = {
        ...templatesStore[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setTemplates([...templatesStore]);
      return { data: templatesStore[index], error: null };
    }
    return { data: null, error: new Error('Template not found') };
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await delay(300);
    const initialLength = templatesStore.length;
    templatesStore = templatesStore.filter(t => t.id !== id);
    if (templatesStore.length !== initialLength) {
      setTemplates([...templatesStore]);
      return { error: null };
    }
    return { error: new Error('Template not found') };
  }, []);

  const submitToMeta = useCallback(async (id: string) => {
    await delay(500);
    const index = templatesStore.findIndex(t => t.id === id);
    if (index !== -1) {
      templatesStore[index] = {
        ...templatesStore[index],
        status: 'PENDING',
        updated_at: new Date().toISOString(),
      };
      setTemplates([...templatesStore]);
    }
    notificationStore.push('info', 'Template Submitted', 'Sent for Meta review.',  {label:"",page:""});
  }, []);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    submitToMeta,
    refresh: fetchTemplates,
  };
}