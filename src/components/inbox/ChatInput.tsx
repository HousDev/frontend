import { useState, useRef, KeyboardEvent } from 'react';
import { Send, FileText, Smile, Paperclip } from 'lucide-react';
import type { Template } from '../../types';

interface Props {
    templates: Template[];
    onSendText: (text: string) => Promise<void>;
    onSendTemplate: (templateName: string, vars: string[]) => Promise<void>;
    disabled?: boolean;
}

export default function ChatInput({ templates, onSendText, onSendTemplate, disabled }: Props) {
    const [text, setText] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const approvedTemplates = templates.filter((t) => t.status === 'APPROVED');

    const handleSend = async () => {
        if (!text.trim() || sending || disabled) return;
        setSending(true);
        await onSendText(text.trim());
        setText('');
        setSending(false);
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTemplateSelect = async (template: Template) => {
        setSending(true);
        setShowTemplates(false);
        await onSendTemplate(template.name, []);
        setSending(false);
    };

    return (
        <div className="relative border-t border-gray-200 bg-white">
            {showTemplates && approvedTemplates.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-xl shadow-xl max-h-64 overflow-y-auto z-10">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">Quick Templates</p>
                        <button
                            onClick={() => setShowTemplates(false)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Close
                        </button>
                    </div>
                    {approvedTemplates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleTemplateSelect(t)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        >
                            <p className="text-sm font-medium text-gray-800">{t.name}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{t.body}</p>
                        </button>
                    ))}
                </div>
            )}

<div className="flex items-end gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 mb-2">               
<div className="flex gap-0.5 sm:gap-1">                    <button
                        onClick={() => setShowTemplates((v) => !v)}
                        disabled={disabled}
                        title="Quick Templates"
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${showTemplates ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            } disabled:opacity-40`}
                    >
<FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />                    </button>
                    <button
                        disabled={disabled}
                        title="Attach file"
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-40"
                    >
<Paperclip className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />                    </button>
                </div>

                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? 'Conversation closed' : 'Type a message...'}
                    disabled={disabled || sending}
                    rows={1}
                    className="flex-1 min-w-0 resize-none bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed max-h-[120px] leading-relaxed"
                />

                <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending || disabled}
                    className="p-2 sm:p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
<Send className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />                    )}
                </button>
            </div>
        </div>
    );
}
