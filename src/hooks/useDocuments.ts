import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';

import toast from 'react-hot-toast';

export const useDocuments = (status?: string, search?: string) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getDocuments(status, search);
      setDocuments(response.data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: any) => {
    try {
      const response = await apiClient.createDocument(documentData);
      setDocuments(prev => [...prev, response.data]);
      toast.success('Document created successfully');
      return response.data;
    } catch (err: any) {
      toast.error('Failed to create document');
      throw err;
    }
  };

  const updateDocument = async (id: string, documentData: any) => {
    try {
      const response = await apiClient.updateDocument(id, documentData);
      setDocuments(prev => prev.map((d: any) => d.id === id ? response.data : d));
      toast.success('Document updated successfully');
      return response.data;
    } catch (err: any) {
      toast.error('Failed to update document');
      throw err;
    }
  };

  const generateDocument = async (id: string, format: 'pdf' | 'docx' = 'pdf') => {
    try {
      const response = await apiClient.generateDocument(id, format);
      toast.success(`${format.toUpperCase()} generated successfully`);
      return response.data;
    } catch (err: any) {
      toast.error(`Failed to generate ${format.toUpperCase()}`);
      throw err;
    }
  };

  const shareDocument = async (id: string, channels: string[], recipients: string[]) => {
    try {
      const response = await apiClient.shareDocument(id, channels, recipients);
      toast.success('Document shared successfully');
      return response.data;
    } catch (err: any) {
      toast.error('Failed to share document');
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [status, search]);

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    generateDocument,
    shareDocument,
    refetch: fetchDocuments
  };
};