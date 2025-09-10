// TemplateEditorContent.tsx
import React, { useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css'; // choose a theme you like

type Props = {
  viewMode: 'visual' | 'code' | 'preview';
  content: string;
  setContent: (s: string) => void;
  codeContent: string;
  setCodeContent: (s: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  pages: string[];
  templateData: any;
  documentSettings: any;
  onContentChange: () => void;
};

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PAGE_PADDING = 24;
const HEADER_HEIGHT = 90;
const FOOTER_HEIGHT = 60;

const highlightCode = (code: string) => {
  try {
    return Prism.highlight(code, Prism.languages.markup, 'html');
  } catch {
    return code;
  }
};

const TemplateEditorContent: React.FC<Props> = ({
  viewMode,
  content,
  setContent,
  codeContent,
  setCodeContent,
  editorRef,
  isLoading,
  pages,
  templateData,
  documentSettings,
  onContentChange
}) => {
  // keep visual DOM in sync when content prop changes
  useEffect(() => {
    if (viewMode === 'visual' && editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, [content, viewMode, editorRef]);

  return (
    <div className="flex-1 min-h-0 bg-gray-50 overflow-auto">
      {isLoading ? (
        <div className="w-full h-full bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-center">
          <div className="text-gray-500">Loading template...</div>
        </div>
      ) : viewMode === 'visual' ? (
        <div className="w-full flex justify-center py-4 no-print">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={onContentChange}
            className="bg-white border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base overflow-auto relative"
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              padding: `${PAGE_PADDING}px`,
              borderRadius: '8px',
              whiteSpace: 'normal'
            }}
          />
        </div>
      ) : viewMode === 'code' ? (
        <div className="w-full flex justify-center py-4 no-print">
          <div className="code-editor-wrapper" style={{ width: A4_WIDTH_PX }}>
            <Editor
              value={codeContent}
              onValueChange={(code) => {
                setCodeContent(code);
                // do NOT set content here to highlighted HTML; only keep raw string
              }}
              highlight={(code) => highlightCode(code)}
              padding={12}
              textareaId="template-code-editor"
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 12,
                minHeight: A4_HEIGHT_PX - 40,
                outline: 0,
                background: 'transparent',
                color: 'inherit'
              }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-4 gap-6">
          {pages.map((html, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-300 shadow-md relative print-page"
              style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: PAGE_PADDING,
                  right: PAGE_PADDING,
                  top: PAGE_PADDING,
                  height: HEADER_HEIGHT - 8,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: 8
                }}
              >
                {documentSettings.logoUrl ? (
                  <img
                    src={documentSettings.logoUrl}
                    alt="Logo"
                    style={{ height: HEADER_HEIGHT - 24, width: 'auto', marginRight: 12 }}
                  />
                ) : null}
                <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>
                  {documentSettings.headerTitle || 'Document Title'}
                </div>
              </div>

              {!!documentSettings.watermarkText && (
                <div
                  className="wm-overlay"
                  style={{
                    position: 'absolute',
                    inset: `${PAGE_PADDING}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  <div
                    className="wm-text"
                    style={{
                      transform: 'rotate(-30deg)',
                      fontSize: 84,
                      fontWeight: 700,
                      letterSpacing: 6,
                      color: '#000',
                      opacity: documentSettings.watermarkOpacity,
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      lineHeight: 1,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {documentSettings.watermarkText}
                  </div>
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  left: PAGE_PADDING,
                  right: PAGE_PADDING,
                  top: PAGE_PADDING + HEADER_HEIGHT,
                  bottom: PAGE_PADDING + FOOTER_HEIGHT,
                  overflow: 'hidden'
                }}
              >
                <div className="page-content-inner" dangerouslySetInnerHTML={{ __html: html }} />
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: PAGE_PADDING,
                  right: PAGE_PADDING,
                  bottom: PAGE_PADDING,
                  height: FOOTER_HEIGHT - 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: 8,
                  fontSize: 12,
                  color: '#6b7280'
                }}
              >
                <span>{templateData.name || 'Untitled Template'}</span>
                <span>Page {idx + 1} of {pages.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .code-editor-wrapper {
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          background: #0b1220;
        }
        .page-content-inner { font-family: Arial, sans-serif; font-size:14px; line-height:1.6; color:#111827; box-sizing:border-box; padding-bottom:1px; }
      `}</style>
    </div>
  );
};

export default TemplateEditorContent;
