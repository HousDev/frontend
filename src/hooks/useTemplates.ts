import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';

import toast from 'react-hot-toast';

export const useTemplates = (category?: string, search?: string) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getTemplates(category, search);
      setTemplates(response.data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: any) => {
    try {
      const response = await apiClient.createTemplate(templateData);
      setTemplates(prev => [...prev, response.data]);
      toast.success('Template created successfully');
      return response.data;
    } catch (err: any) {
      toast.error('Failed to create template');
      throw err;
    }
  };

  const updateTemplate = async (id: string, templateData: any) => {
    try {
      const response = await apiClient.updateTemplate(id, templateData);
      setTemplates(prev => prev.map((t: any) => t.id === id ? response.data : t));
      toast.success('Template updated successfully');
      return response.data;
    } catch (err: any) {
      toast.error('Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await apiClient.deleteTemplate(id);
      setTemplates(prev => prev.filter((t: any) => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete template');
      throw err;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [category, search]);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates
  };
};