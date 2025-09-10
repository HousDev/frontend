// TemplateEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import TemplateHeader from './TemplateHeader';
import TemplateInfo from './TemplateInfo';
import TemplateToolbar from './TemplateToolbar';
import TemplateEditorContent from './TemplateEditorContent';
import VariablesPanel from './VariablesPanel';
import {
  Template,
  TemplateEditorProps,
  ViewMode,
  Variable,
  TemplateData,
  DocumentSettings
} from './types';
import { buildDefaultContent } from './constants';
import { normalizeVariablesForSave, buildPaginatedPreview } from './paginationUtils';
import { handleDownloadPDF } from './downloadUtils';

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onClose, onDelete }) => {
  const [content, setContent] = useState<string>('');         // visual DOM HTML
  const [codeContent, setCodeContent] = useState<string>(''); // raw HTML for code editor (no highlighted markup)
  const [variables, setVariables] = useState<string[]>([]);
  const [showVariablePanel, setShowVariablePanel] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [isLoading, setIsLoading] = useState(false);
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: '',
    description: '',
    category: 'deal'
  });

  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({
    headerTitle: 'Document Title',
    logoUrl: '',
    watermarkText: 'RESALE EXPERTS',
    watermarkOpacity: 0.08
  });

  const [pages, setPages] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Create New
  const handleCreateNew = () => {
    setTemplateData({ name: '', description: '', category: 'deal' });
    setVariables([]);
    const def = buildDefaultContent();
    setContent(def);
    setCodeContent(def);
    if (editorRef.current) editorRef.current.innerHTML = def;
    setViewMode('visual');
    setPages([]);
  };

  // Download PDF
  const handleDownload = () => {
    const ensurePages = () =>
      new Promise<void>((resolve) => {
        if (viewMode !== 'preview') {
          setViewMode('preview');
          setTimeout(() => resolve(), 150);
        } else resolve();
      });

    ensurePages().then(() => {
      handleDownloadPDF(pages, templateData, documentSettings);
    });
  };

  // Delete
  const handleDelete = () => {
    if (template?.id && typeof onDelete === 'function') {
      if (confirm('Delete this template permanently?')) onDelete(template.id);
    } else {
      if (confirm('Clear current template content?')) handleCreateNew();
    }
  };

  // Init Template
  useEffect(() => {
    setIsLoading(true);

    let templateContent = template?.content;
    if (!templateContent) {
      templateContent = template?.name ? buildDefaultContent(template.name) : buildDefaultContent();
    }

    setContent(templateContent || '');
    setCodeContent(templateContent || '');
    setVariables(template?.variables || []);
    setTemplateData({
      name: template?.name || '',
      description: template?.description || '',
      category: template?.category || 'deal'
    });

    const id = setTimeout(() => {
      if (editorRef.current && viewMode === 'visual') {
        editorRef.current.innerHTML = templateContent || '';
      }
      setIsLoading(false);
    }, 60);

    return () => clearTimeout(id);
  }, [template]);

  // Keep editor sync (visual mode)
  useEffect(() => {
    if (viewMode === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, [viewMode, content]);

  // Build preview pages
  useEffect(() => {
    if (viewMode === 'preview') {
      let workingContent = content;
      if (editorRef.current) {
        const edHtml = editorRef.current.innerHTML;
        if (edHtml && edHtml !== content) workingContent = edHtml;
      }

      let bodyContent = workingContent;
      try {
        const lower = workingContent.toLowerCase();
        if (lower.includes('<html') || lower.includes('<head')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(workingContent, 'text/html');
          bodyContent = doc.body ? doc.body.innerHTML : workingContent;
        }
      } catch (err) {
        bodyContent = workingContent;
      }

      try {
        const newPages = buildPaginatedPreview(bodyContent);
        setPages(newPages);
      } catch (err) {
        console.error('Error building paginated preview:', err);
        setPages([bodyContent]);
      }
    }
  }, [viewMode, content, documentSettings]);

  // Formatting helpers
  const focusEditor = () => editorRef.current?.focus();

  const formatText = (command: string, value?: string) => {
    focusEditor();
    try {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        setContent(html);
        setCodeContent(html); // keep code mirror in sync when formatting in visual
      }
    } catch (err) {
      console.warn('formatText failed', err);
    }
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (url) formatText('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('Enter Image URL');
    if (url) {
      focusEditor();
      try {
        document.execCommand('insertImage', false, url);
        if (editorRef.current) {
          const html = editorRef.current.innerHTML;
          setContent(html);
          setCodeContent(html);
        }
      } catch (err) {
        console.warn('insertImage failed', err);
      }
    }
  };

  const insertVariable = (variable: Variable) => {
    const variableTag = `{{${variable.name}}}`;

    if (viewMode === 'visual' && editorRef.current) {
      const selection = window.getSelection();
      const span = document.createElement('span');
      span.className =
        'bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono text-xs align-baseline';
      span.textContent = variableTag;
      span.contentEditable = 'false';
      span.setAttribute('data-var', variable.name);

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.appendChild(span);
      }
      const html = editorRef.current.innerHTML;
      setContent(html);
      setCodeContent(html);
    } else {
      setCodeContent((prev) => prev + variableTag);
      setContent((prev) => prev + variableTag);
    }

    setVariables((prev) => Array.from(new Set([...prev, variable.name])));
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 1</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 2</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
        </tr>
      </table>`;
    if (viewMode === 'visual' && editorRef.current) {
      focusEditor();
      try {
        document.execCommand('insertHTML', false, tableHTML);
        const html = editorRef.current.innerHTML;
        setContent(html);
        setCodeContent(html);
      } catch (err) {
        console.warn('insertTable failed', err);
      }
    } else {
      setCodeContent(prev => prev + tableHTML);
      setContent(prev => prev + tableHTML);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      setCodeContent(html);
    }
  };

  // Save
  const handleSave = () => {
    if (!templateData.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const rawHtml =
      viewMode === 'visual' && editorRef.current ? editorRef.current.innerHTML : content || codeContent;

    const cleanHTML = normalizeVariablesForSave(rawHtml);

    const isNew = !template?.id;

    const templateToSave: Template = {
      ...templateData,
      content: cleanHTML,
      variables: Array.from(new Set(variables)),
      id: template?.id || Date.now(),
      status: template?.status || 'active',
      created_at: template?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: template?.usage_count || 0,
      created_by: template?.created_by || 'Admin User',
      lastUsed: template?.lastUsed || new Date().toISOString().split('T')[0]
    };

    onSave(templateToSave);
    alert(isNew ? 'Template created successfully!' : 'Template saved successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[95vh] flex flex-col">
        <TemplateHeader
          template={template}
          templateData={templateData}
          setTemplateData={setTemplateData}
          variables={variables}
          viewMode={viewMode}
          onSave={handleSave}
          onClose={onClose}
          onCreateNew={handleCreateNew}
          onDownload={handleDownload}
        />

        <div className="flex flex-col lg:flex-row min-h-0" style={{ height: 'calc(95vh - 56px)' }}>
          <div className="flex-1 flex min-h-0 flex-col">
            <TemplateInfo
              templateData={templateData}
              setTemplateData={setTemplateData}
              documentSettings={documentSettings}
              setDocumentSettings={setDocumentSettings}
            />

            <TemplateToolbar
              viewMode={viewMode}
              setViewMode={setViewMode}
              showVariablePanel={showVariablePanel}
              setShowVariablePanel={setShowVariablePanel}
              onFormat={formatText}
              onInsertTable={insertTable}
              onInsertLink={insertLink}
              onInsertImage={insertImage}
            />

            <div className="lg:hidden">
              <VariablesPanel
                showVariablePanel={showVariablePanel}
                variables={variables}
                onInsertVariable={insertVariable}
              />
            </div>

            {/* Pass codeContent + setCodeContent into TemplateEditorContent */}
            <TemplateEditorContent
              viewMode={viewMode}
              content={content}
              setContent={setContent}
              codeContent={codeContent}
              setCodeContent={setCodeContent}
              editorRef={editorRef}
              isLoading={isLoading}
              pages={pages}
              templateData={templateData}
              documentSettings={documentSettings}
              onContentChange={handleContentChange}
            />
          </div>

          <div className="hidden lg:flex">
            <VariablesPanel
              showVariablePanel={showVariablePanel}
              variables={variables}
              onInsertVariable={insertVariable}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
