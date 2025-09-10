export type Template = {
  id?: string | number;
  name?: string;
  description?: string;
  category?: string;
  content?: string;
  variables?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
  created_by?: string;
  lastUsed?: string;
};

export type TemplateEditorProps = {
  template?: Template | null;
  onSave: (t: Template) => void;
  onClose: () => void;
  onDelete?: (id: string | number) => void;
};

export type ViewMode = 'visual' | 'code' | 'preview';

export type Variable = {
  name: string;
  label: string;
  category: string;
};

export type DocumentSettings = {
  headerTitle: string;
  logoUrl: string;
  watermarkText: string;
  watermarkOpacity: number;
};

export type TemplateData = {
  name: string;
  description: string;
  category: string;
};