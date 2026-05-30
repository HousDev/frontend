
import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Send, FileText, Smile, Paperclip, Mic, X } from 'lucide-react';
import type { Template } from '../../types';
import {
  Image,
  Camera,
  MapPin,
  User,
  
  Headphones,
  BarChart3,
  CalendarDays,
  Sparkles
} from "lucide-react";
import { notificationStore } from '@/lib/notifications';
interface Props {
    templates: Template[];
    onSendText: (text: string) => Promise<void>;
    onSendTemplate: (templateName: string, vars: string[]) => Promise<void>;
    onSendMedia?: (file: File, caption: string) => Promise<void>;
    onSendLocation?: (lat: number, lng: number) => Promise<void>;
    disabled?: boolean;
        isBlocked?: boolean;

}

// Complete WhatsApp emoji set with proper categories
const EMOJI_CATEGORIES = [
    {
        name: '😀',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😶‍🌫️', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖']
    },
    {
        name: '👋',
        emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🫀', '🫁', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦', '💋', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵']
    },
    {
        name: '🐶',
        emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🪶', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧']
    },
    {
        name: '🍎',
        emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🧄', '🧅', '🥔', '🍠', '🫘', '🌽', '🍞', '🥐', '🥖', '🫓', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫔', '🌮', '🌯', '🥙', '🧆', '🥚', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍘', '🍥', '🥮', '🍡', '🥠', '🫓', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🧃', '🥤', '🧋', '☕', '🍵', '🧉', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧊']
    },
    {
        name: '⚽',
        emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🪈']
    },
    {
        name: '🚗',
        emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚁', '🛸', '✈️', '🛩️', '🚀', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒']
    },
    {
        name: '💡',
        emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '💡', '🔦', '🕯️', '🪔', '🧱', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🪙', '💹', '✉️', '📧', '📨', '📩', '📪', '📫', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖊️', '🖋️', '📝', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '🗺️', '📏', '📐', '✂️', '🗃️', '🔍', '🔎', '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔧', '🔩', '⚙️', '🗜️']
    },
    {
        name: '❤️',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '✅', '☑️', '✔️', '❎', '🔰', '♻️', '🆒', '🆕', '🆙', '🆓', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🆖', '🆗', '🔔', '🔕', '🎵', '🎶', '💤', '🔇', '🔈', '🔉', '🔊', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️']
    }
];

const ATTACHMENT_OPTIONS = [
  {
    icon: <Image size={24} strokeWidth={2.2} className="text-[#0B8FFF]" />,
    label: "Gallery",
    bg: "#EAF2FF",
    type: "file",
    accept: "image/*,video/*"
  },
  {
    icon: <Camera size={24} strokeWidth={2.2} className="text-[#FF2D7A]" />,
    label: "Camera",
    bg: "#FFEAF1",
    type: "camera",
    accept: "image/*"
  },
  {
    icon: <MapPin size={24} strokeWidth={2.2} className="text-[#00C47A]" />,
    label: "Location",
    bg: "#E9FFF5",
    type: "location"
  },
  {
    icon: <User size={24} strokeWidth={2.2} className="text-[#1DA1F2]" />,
    label: "Contact",
    bg: "#EEF6FF",
    type: "contact"
  },
  {
    icon: <FileText size={24} strokeWidth={2.2} className="text-[#7B61FF]" />,
    label: "Document",
    bg: "#F4EEFF",
    type: "file",
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx"
  },
  {
    icon: <Headphones size={24} strokeWidth={2.2} className="text-[#FF7A1A]" />,
    label: "Audio",
    bg: "#FFF1E7",
    type: "file",
    accept: "audio/*"
  },
  {
    icon: <BarChart3 size={24} strokeWidth={2.2} className="text-[#F5B400]" />,
    label: "Poll",
    bg: "#FFF9DF",
    type: "poll"
  },
  {
    icon: <CalendarDays size={24} strokeWidth={2.2} className="text-[#FF2D7A]" />,
    label: "Event",
    bg: "#FFEAF1",
    type: "event"
  },
  {
    icon: <Sparkles size={24} strokeWidth={2.2} className="text-[#0B8FFF]" />,
    label: "Imagine",
    bg: "#EEF6FF",
    type: "imagine"
  }
];


interface SelectedFile {
    file: File;
    preview: string;
    type: 'image' | 'video' | 'audio' | 'document';
}

export default function ChatInput({ templates, onSendText, onSendTemplate, onSendMedia, onSendLocation, disabled, isBlocked }: Props) {
    const [text, setText] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAttach, setShowAttach] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState(0);
    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
    const [caption, setCaption] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const attachMenuRef = useRef<HTMLDivElement>(null);
    const [fileAccept, setFileAccept] = useState('*');
const [emojiSearch, setEmojiSearch] = useState('');

    const approvedTemplates = templates.filter((t) => t.status === 'APPROVED');

    // Close panels when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(target) && 
                !target.closest('[data-emoji-btn]')) {
                setShowEmoji(false);
            }
            if (attachMenuRef.current && !attachMenuRef.current.contains(target) && 
                !target.closest('[data-attach-btn]')) {
                setShowAttach(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMicClick = () => {
    if (canSend) {
        handleSend();
    } else {
        // Mic recording - coming soon
        notificationStore?.push?.('info', 'Coming Soon', 'Voice recording will be available soon', { label: '', page: '' });
    }
};

const handleSend = async () => {
    if (sending || disabled) return;
    
    // ADD THIS - prevent double fire
    if (!selectedFile && !text.trim()) return;
    
    setSending(true);
    
    try {
        if (selectedFile) {
            if (!onSendMedia) return;
            
            const fileToSend = selectedFile.file; // capture before removeFile
            const finalCaption = text.trim();
            
            removeFile(); // ← MOVE THIS BEFORE await to prevent double click
            setText('');
            
            await onSendMedia(fileToSend, finalCaption);
            return;
        }
        if (text.trim()) {
            const textToSend = text.trim();
            setText(''); // ← CLEAR TEXT BEFORE await
            await onSendText(textToSend);
        }
    } catch (error) {
        console.error('Failed to send:', error);
    } finally {
        setSending(false);
        textareaRef.current?.focus();
    }
};

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (canSend) {  
            handleSend();
        }
        }
    };

    const handleTemplateSelect = async (template: Template) => {
        setSending(true);
        setShowTemplates(false);
        await onSendTemplate(template.name, []);
        setSending(false);
    };

    const insertEmoji = (emoji: string) => {
        const ta = textareaRef.current;
        if (!ta) {
            setText((t) => t + emoji);
            return;
        }
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newText = text.slice(0, start) + emoji + text.slice(end);
        setText(newText);
        setTimeout(() => {
            ta.selectionStart = ta.selectionEnd = start + emoji.length;
            ta.focus();
        }, 0);
    };

    const handleAttachOption = (opt: typeof ATTACHMENT_OPTIONS[0]) => {
        setShowAttach(false);
        if (opt.type === 'file' && opt.accept) {
            setFileAccept(opt.accept);
            setTimeout(() => fileInputRef.current?.click(), 50);
        } else if (opt.type === 'camera') {
            // Handle camera capture
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => handleFileChange(e as any);
            input.click();
       } else if (opt.type === 'location') {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            if (onSendLocation) {
                await onSendLocation(position.coords.latitude, position.coords.longitude);
            } else {
                // fallback if prop not provided
                onSendText(`📍 https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`);
            }
        });
    }
}else if (opt.type === 'contact') {
            // Handle contact sharing
            onSendText('📇 Contact sharing feature coming soon');
        } else if (opt.type === 'poll') {
            onSendText('📊 Poll feature coming soon');
        } else if (opt.type === 'event') {
            onSendText('📅 Event feature coming soon');
        } else if (opt.type === 'imagine') {
            onSendText('✨ Imagine AI feature coming soon');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let fileType: SelectedFile['type'] = 'document';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('video/')) fileType = 'video';
        else if (file.type.startsWith('audio/')) fileType = 'audio';

        const preview = (fileType === 'image' || fileType === 'video')
            ? URL.createObjectURL(file)
            : '';

        setSelectedFile({ file, preview, type: fileType });
        e.target.value = '';

            setTimeout(() => textareaRef.current?.focus(), 100);

    };

    const removeFile = () => {
        if (selectedFile?.preview) URL.revokeObjectURL(selectedFile.preview);
        setSelectedFile(null);
        setCaption('');
    };

    const canSend = (text.trim() || selectedFile || caption.trim()) && !sending && !disabled;

    return (
        <div className="relative bg-[#f0f2f5] border-t border-gray-200">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={fileAccept}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Template picker */}
            {showTemplates && approvedTemplates.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-xl shadow-xl max-h-64 overflow-y-auto z-30">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">Quick Templates</p>
                        <button onClick={() => setShowTemplates(false)} className="text-xs text-gray-400 hover:text-gray-600">
                            <X size={16} />
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

            {/* WhatsApp-style Emoji Picker */}
          {showEmoji && (
    <div
        ref={emojiPickerRef}
        className="absolute bottom-full left-0 right-0 bg-white shadow-2xl z-30 rounded-t-2xl"
        style={{ height: '360px', maxHeight: '360px' }}
    >
       

        {emojiSearch.trim() ? (
            /* Search results */
            <div className="overflow-y-auto h-[calc(360px-88px)] p-2">
                <div className="grid grid-cols-8 gap-1">
                    {EMOJI_CATEGORIES.flatMap(cat => cat.emojis)
                        .filter(emoji => {
                            // Basic search by unicode name isn't available, so just show all when searching
                            // For a real name search you'd need a library; this filters by the emoji character itself
                            return true; // show all — replace with emoji-name library if needed
                        })
                        .slice(0, 64)
                        .map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => insertEmoji(emoji)}
                                className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))
                    }
                </div>
            </div>
        ) : (
            <>
                {/* Category tabs */}
                <div className="flex border-b border-gray-200 px-2 py-1 gap-1 overflow-x-auto scrollbar-hide">
                    {EMOJI_CATEGORIES.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => setEmojiCategory(i)}
                            className={`shrink-0 w-10 h-10 flex items-center justify-center text-xl rounded-full transition-all ${
                                emojiCategory === i
                                    ? 'bg-[#e8f0fe] text-[#008069]'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Emoji grid */}
                <div className="overflow-y-auto h-[calc(360px-100px)] p-2">
                    <div className="grid grid-cols-8 gap-1">
                        {EMOJI_CATEGORIES[emojiCategory].emojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => insertEmoji(emoji)}
                                className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
)}

{showAttach && (
  <div
    ref={attachMenuRef}
    className="
      absolute bottom-full right-0
      bg-white
      rounded-2xl
      p-3
      shadow-[0_4px_24px_rgba(0,0,0,0.15)]
      z-30
      border border-gray-100
      mb-1
    "
    style={{ width: '240px' }}
  >
    <div className="grid grid-cols-3 gap-2">
      {ATTACHMENT_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          onClick={() => handleAttachOption(opt)}
          className="flex flex-col items-center justify-center gap-1 group py-2 px-1 rounded-xl hover:bg-gray-50 transition-all"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: opt.bg }}
          >
            {opt.icon}
          </div>
          <span className="text-[10px] text-[#54656F] font-medium text-center leading-tight">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  </div>
)}



            {/* File preview with caption input */}
          {/* WhatsApp Style File Preview */}
{selectedFile && (
  <div className=" ">
    <div className="bg-white rounded-t-2xl  overflow-hidden">
      
      <div className="flex items-center gap-3 px-3 py-2">
        
        {/* Thumbnail */}
        <div className="relative shrink-0">
          {selectedFile.type === 'image' && (
            <img
              src={selectedFile.preview}
              alt="preview"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover"
            />
          )}

          {selectedFile.type === 'video' && (
            <video
              src={selectedFile.preview}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover"
              muted
            />
          )}

          {(selectedFile.type === 'audio' ||
            selectedFile.type === 'document') && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#e8f0fe] flex items-center justify-center">
              <span className="text-2xl">
                {selectedFile.type === 'audio' ? '🎧' : '📄'}
              </span>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#111b21] truncate">
            {selectedFile.file.name}
          </p>

          <p className="text-[12px] text-[#667781]">
            {(selectedFile.file.size / 1024).toFixed(0)} KB •{" "}
            {selectedFile.type}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={removeFile}
          className="shrink-0 text-[#667781] hover:text-[#111b21]"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  </div>
)}

            {/* Main input row */}
<div className="flex items-end gap-0.5 sm:gap-1 px-1 sm:px-2 py-1.5 sm:py-2">                
    <button
        onClick={() => { setShowTemplates(v => !v); setShowEmoji(false); setShowAttach(false); }}
        disabled={disabled}
        data-template-btn
        className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
            showTemplates ? 'text-[#008069] bg-[#e8f0fe]' : 'text-[#8696a0] hover:bg-gray-200'
        } disabled:opacity-40`}
    >
        <FileText size={18} className="sm:w-[22px] sm:h-[22px]" />
    </button>

                {/* Emoji button */}
              <button
    onClick={() => { setShowEmoji(v => !v); setShowAttach(false); setShowTemplates(false); setEmojiSearch(''); }}
    disabled={disabled}
    data-emoji-btn
    className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
        showEmoji ? 'text-[#008069] bg-[#e8f0fe]' : 'text-[#8696a0] hover:bg-gray-200'
    } disabled:opacity-40`}
>
    <Smile size={18} className="sm:w-[22px] sm:h-[22px]" />
</button>

                {/* Textarea */}
                <textarea
    ref={textareaRef}
    value={text}
    onChange={(e) => {
        setText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    }}
    onKeyDown={handleKeyDown}
placeholder={disabled ? (isBlocked ? 'Contact is blocked' : 'Conversation closed') : 'Message'}
    disabled={disabled || sending}
    rows={1}
    className="flex-1 min-w-0 resize-none bg-white rounded-2xl px-3 sm:px-4 py-2 text-[14px] text-[#111b21] placeholder-[#8696a0] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed max-h-[100px] leading-relaxed"
/>

                {/* Attachment button (only when no text and no file selected) */}
              {!text.trim() && !selectedFile && (
    <button
        onClick={() => { setShowAttach(v => !v); setShowEmoji(false); setShowTemplates(false); }}
        disabled={disabled}
        data-attach-btn
        className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
            showAttach ? 'text-[#008069] bg-[#e8f0fe]' : 'text-[#8696a0] hover:bg-gray-200'
        } disabled:opacity-40`}
    >
        <Paperclip size={18} className="sm:w-[22px] sm:h-[22px]" />
    </button>
)}

                {/* Send / Mic button */}
             <button
    onClick={canSend ? handleSend : undefined}
    disabled={sending || disabled}
    className="w-10 h-10 sm:w-11 sm:h-11 bg-[#008069] text-white rounded-full flex items-center justify-center hover:bg-[#017561] active:bg-[#015f4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md"
>
    {sending ? (
        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : canSend ? (
        <Send size={15} className="sm:w-[18px] sm:h-[18px]" />
    ) : (
        <Mic size={15} className="sm:w-[18px] sm:h-[18px]" />
    )}
</button>
            </div>

            <style >{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}