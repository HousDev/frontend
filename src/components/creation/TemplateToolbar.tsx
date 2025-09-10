import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table,
  Eye,
  Code,
  Variable,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { ViewMode } from './types';

type TemplateToolbarProps = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showVariablePanel: boolean;
  setShowVariablePanel: (show: boolean) => void;
  onFormat: (command: string, value?: string) => void;
  onInsertTable: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
};

const TemplateToolbar: React.FC<TemplateToolbarProps> = ({
  viewMode,
  setViewMode,
  showVariablePanel,
  setShowVariablePanel,
  onFormat,
  onInsertTable,
  onInsertLink,
  onInsertImage
}) => {
  return (
    <div className="p-2 sm:p-4 border-b border-gray-200 bg-white flex-shrink-0 text-xs no-print">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 mr-4">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'visual'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Eye size={14} className="inline mr-1" />
              Visual
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'code'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Code size={14} className="inline mr-1" />
              HTML
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Paginated print preview"
            >
              <Eye size={14} className="inline mr-1" />
              Preview
            </button>
          </div>

          {viewMode === 'visual' && (
            <div className="flex items-center space-x-1 flex-wrap">
              {/* Text Formatting */}
              <button onClick={() => onFormat('bold')} className="p-2 rounded hover:bg-gray-100" title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={() => onFormat('italic')} className="p-2 rounded hover:bg-gray-100" title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={() => onFormat('underline')} className="p-2 rounded hover:bg-gray-100" title="Underline">
                <Underline size={16} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Alignment */}
              <button onClick={() => onFormat('justifyLeft')} className="p-2 rounded hover:bg-gray-100" title="Align Left">
                <AlignLeft size={16} />
              </button>
              <button onClick={() => onFormat('justifyCenter')} className="p-2 rounded hover:bg-gray-100" title="Align Center">
                <AlignCenter size={16} />
              </button>
              <button onClick={() => onFormat('justifyRight')} className="p-2 rounded hover:bg-gray-100" title="Align Right">
                <AlignRight size={16} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Lists */}
              <button onClick={() => onFormat('insertUnorderedList')} className="p-2 rounded hover:bg-gray-100" title="Bullet List">
                <List size={16} />
              </button>
              <button onClick={() => onFormat('insertOrderedList')} className="p-2 rounded hover:bg-gray-100" title="Numbered List">
                <ListOrdered size={16} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Font Size */}
              <select
                onChange={(e) => onFormat('fontSize', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded"
                defaultValue="3"
                title="Font Size"
              >
                <option value="1">8pt</option>
                <option value="2">10pt</option>
                <option value="3">12pt</option>
                <option value="4">14pt</option>
                <option value="5">18pt</option>
                <option value="6">24pt</option>
                <option value="7">36pt</option>
              </select>

              {/* Font Color */}
              <input
                type="color"
                onChange={(e) => onFormat('foreColor', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                title="Text Color"
              />

              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Insert Table / Link / Image */}
              <button onClick={onInsertTable} className="p-2 rounded hover:bg-gray-100" title="Insert Table">
                <Table size={16} />
              </button>
              <button onClick={onInsertLink} className="p-2 rounded hover:bg-gray-100" title="Insert Link">
                <LinkIcon size={16} />
              </button>
              <button onClick={onInsertImage} className="p-2 rounded hover:bg-gray-100" title="Insert Image">
                <ImageIcon size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowVariablePanel(!showVariablePanel)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Variable size={16} />
          <span>Variables</span>
        </button>
      </div>
    </div>  
  );
};

export default TemplateToolbar;