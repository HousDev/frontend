import { useEffect, useRef, useState } from 'react';
import { Bot, CheckCircle, Clock, PhoneCall, ArrowLeft, ChevronRight, Activity, BotMessageSquare } from 'lucide-react';
import type { WhatsAppConversation, WhatsAppContact, Tag, CrmUser, WhatsAppMessage, ConversationNote } from '../../types';
import { whatsappAPI } from '@/lib/whatsappApi';
import { formatDate } from '../../lib/formatters';
import { notificationStore } from '../../lib/notifications';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ContactInfo from './ContactInfo';

interface Props {
    conversation: WhatsAppConversation | null;
    contact: WhatsAppContact | null;
    users: CrmUser[];
    allTags: Tag[];
    onUpdateStage: (stage: string) => void;
    onAssign: (userId: string) => void;
    onAddTag: (tagId: string) => void;
    onRemoveTag: (tagId: string) => void;
    onClose?: () => void;
    onConversationUpdate?: (updatedConversation: WhatsAppConversation) => void;
}

export default function ChatWindow({
    conversation: initialConversation,
    contact,
    users,
    allTags,
    onUpdateStage,
    onAssign,
    onAddTag,
    onRemoveTag,
    onClose,
    onConversationUpdate,
}: Props) {
    const [conversation, setConversation] = useState<WhatsAppConversation | null>(initialConversation);
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [notes, setNotes] = useState<ConversationNote[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [flowStepCount, setFlowStepCount] = useState<number | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Sync conversation from props
    useEffect(() => {
        setConversation(initialConversation);
    }, [initialConversation]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!conversation || !contact) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            setLoading(true);
            try {
                // Try fetching by conversation.id first
                let msgs = await whatsappAPI.getMessages(conversation.id);
                console.log('Messages by conversation.id:', msgs);

                // If empty, try by contact.id (some APIs use contact ID)
                if (!msgs || msgs.length === 0) {
                    msgs = await whatsappAPI.getMessages(contact.id);
                    console.log('Messages by contact.id:', msgs);
                }

                // Normalise each message to match MessageBubble expectations
                const normalised:any = (msgs || []).map((msg: any) => ({
                    id: msg.id || Math.random().toString(),
                    direction: msg.direction || (msg.from === contact.phone ? 'inbound' : 'outbound'),
                    text: msg.text || msg.body || '',
                    timestamp: msg.timestamp || msg.created_at || msg.sent_at || new Date().toISOString(),
                    status: msg.status || 'delivered',
                    sender: msg.sender || null,
                })).filter(msg => msg.text); // ignore empty messages

                setMessages(normalised);

                // Mark conversation as read (if API supports)
                // if (whatsappAPI.markConversationRead) {
                    // await whatsappAPI.markConversationRead(conversation.id);
                // }
            } catch (err) {
                console.error('Failed to fetch messages', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();

       
    }, [conversation?.id, contact]);

    // Fetch notes for this conversation
    useEffect(() => {
        if (!conversation) {
            setNotes([]);
            return;
        }
        const fetchNotes = async () => {
            try {
                // const notesData = await whatsappAPI.getNotes(conversation.id);
                // setNotes(notesData);
            } catch (err) {
                console.error('Failed to fetch notes', err);
            }
        };
        fetchNotes();
    }, [conversation?.id]);

    // Fetch templates for the chat input
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const tpls = await whatsappAPI.getTemplates();
                setTemplates(tpls);
            } catch (err) {
                console.error('Failed to fetch templates', err);
            }
        };
        fetchTemplates();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Get flow step count (if needed)
    useEffect(() => {
        if (!conversation?.flow_id) {
            setFlowStepCount(null);
            return;
        }
        const fetchFlowSteps = async () => {
            try {
                // const steps = await whatsappAPI.getFlowSteps(conversation.flow_id);
                // setFlowStepCount(steps.length);
            } catch (err) {
                console.error('Failed to fetch flow steps', err);
            }
        };
        fetchFlowSteps();
    }, [conversation?.flow_id]);

    const handleSendText = async (text: string) => {
        if (!conversation || !contact) return;
        try {
            const newMsg = await whatsappAPI.sendMessage({ contact_id: contact.id, text });
            // Normalise the new message
            const normalisedMsg:any = {
                id: newMsg.id || Date.now().toString(),
                direction: 'out',
                text: newMsg.text || newMsg.body || text,
                timestamp: newMsg.timestamp || newMsg.created_at || newMsg.sent_at || new Date().toISOString(),
                status: newMsg.status || 'sent',
                sender: newMsg.sender || null,
            };
            setMessages(prev => [...prev, normalisedMsg]);
            notificationStore.push('message', 'Message Sent', `Sent to ${contact.name}`, {label:"",page:""});
        } catch (err) {
            console.error('Failed to send message', err);
            notificationStore.push('error', 'Send Failed', 'Could not send message. Try again.', { label: "", page: "" });
        }
    };

    const handleSendTemplate = async (templateName: string, vars: string[]) => {
        if (!conversation || !contact) return;
        try {
            // const newMsg = await whatsappAPI.sendTemplate({
            //     contact_id: contact.id,
            //     template_name: templateName,
            //     variables: vars,
            // });
            // const normalisedMsg = {
            //     id: newMsg.id || Date.now().toString(),
            //     direction: 'outbound',
            //     text: newMsg.text || newMsg.body || `Template: ${templateName}`,
            //     timestamp: newMsg.timestamp || newMsg.created_at || newMsg.sent_at || new Date().toISOString(),
            //     status: newMsg.status || 'sent',
            //     sender: newMsg.sender || null,
            // };
            // setMessages(prev => [...prev, normalisedMsg]);
            notificationStore.push('message', 'Template Sent', `Template "${templateName}" sent to ${contact.name}`, { label: "", page: "" });
        } catch (err) {
            console.error('Failed to send template', err);
            notificationStore.push('error', 'Send Failed', 'Could not send template. Try again.', { label: "", page: "" });
        }
    };

    const toggleBotActive = async () => {
        if (!conversation) return;
        const updated = { ...conversation, bot_active: !conversation.bot_active };
        try {
            // await whatsappAPI.updateConversation(conversation.id, { bot_active: updated.bot_active });
            setConversation(updated);
            onConversationUpdate?.(updated);
        } catch (err) {
            console.error('Failed to toggle bot', err);
            notificationStore.push('error', 'Update Failed', 'Could not toggle bot status.', { label: "", page: "" });
        }
    };

    const toggleResolved = async () => {
        if (!conversation) return;
        const newStatus = conversation.status === 'resolved' ? 'open' : 'resolved';
        const updated:any = { ...conversation, status: newStatus };
        try {
            // await whatsappAPI.updateConversation(conversation.id, { status: newStatus });
            setConversation(updated);
            onConversationUpdate?.(updated);
        } catch (err) {
            console.error('Failed to toggle resolved', err);
            notificationStore.push('error', 'Update Failed', 'Could not change conversation status.', { label: "", page: "" });
        }
    };

    const handleAddNote = async (body: string) => {
        if (!conversation) return;
        try {
            const newNote = await whatsappAPI.addNote(conversation.id, body);
            setNotes(prev => [...prev, newNote]);
        } catch (err) {
            console.error('Failed to add note', err);
            notificationStore.push('error', 'Note Failed', 'Could not add internal note.', { label: "", page: "" });
        }
    };

    if (!conversation || !contact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <PhoneCall size={28} className="text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-500">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">Choose from the list to start messaging</p>
            </div>
        );
    }

    const showBotProgress = conversation.bot_active && conversation.flow_id && flowStepCount !== null && flowStepCount > 0;
    const botProgressPercent = showBotProgress
        ? Math.min(100, Math.round(((conversation.current_step_index + 1) / flowStepCount) * 100))
        : 0;

    let lastDate = '';
    const messagesWithSeparators = messages.map((msg) => {
        const msgDate = formatDate(msg.timestamp);
        const showSeparator = msgDate !== lastDate;
        lastDate = msgDate;
        return { msg, showSeparator, dateLabel: msgDate };
    });

    return (
        <div className="flex flex-1 min-w-0 h-full">
            <div className="flex flex-col flex-1 min-w-0 h-full">
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                    {onClose && (
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                            <ArrowLeft size={18} />
                        </button>
                    )}

                    <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{contact.name}</h3>
                        <p className="text-xs text-gray-400 truncate">{contact.phone}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleBotActive}
                            title={conversation.bot_active ? 'Disable Bot' : 'Enable Bot'}
                            className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.bot_active
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {conversation.bot_active ? <Bot size={15} /> : <BotMessageSquare size={15} />}
                            <span className="hidden lg:inline text-xs font-medium">
                                {conversation.bot_active ? 'Bot On' : 'Bot Off'}
                            </span>
                        </button>

                        <button
                            onClick={toggleResolved}
                            title={conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
                            className={`p-2 rounded-lg transition-colors text-sm flex items-center gap-1.5 ${conversation.status === 'resolved'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {conversation.status === 'resolved' ? <Clock size={15} /> : <CheckCircle size={15} />}
                            <span className="hidden lg:inline text-xs font-medium">
                                {conversation.status === 'resolved' ? 'Reopen' : 'Resolve'}
                            </span>
                        </button>
                    </div>
                </div>

                {showBotProgress && (
                    <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                        <Activity size={13} className="text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-blue-700 font-medium">Bot Flow Active</span>
                                <span className="text-xs text-blue-500">
                                    Step {conversation.current_step_index + 1} / {flowStepCount}
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-1">
                                <div
                                    className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${botProgressPercent}%` }}
                                />
                            </div>
                        </div>
                        <ChevronRight size={13} className="text-blue-400 shrink-0" />
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-0.5">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p className="text-sm">No messages yet</p>
                        </div>
                    ) : (
                        messagesWithSeparators.map(({ msg, showSeparator, dateLabel }) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                showDateSeparator={showSeparator}
                                dateSeparatorLabel={dateLabel}
                            />
                        ))
                    )}
                    <div ref={endRef} />
                </div>

                <ChatInput
                    templates={templates}
                    onSendText={handleSendText}
                    onSendTemplate={handleSendTemplate}
                    disabled={conversation.status === 'resolved'}
                />
            </div>

            <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden xl:block">
                <ContactInfo
                    contact={contact}
                    users={users}
                    allTags={allTags}
                    onUpdateStage={onUpdateStage}
                    onAssign={onAssign}
                    onAddTag={onAddTag}
                    onRemoveTag={onRemoveTag}
                    onUpdateNotes={async (updatedNotes) => {
                        try {
                            await whatsappAPI.updateContact(contact.id, { notes: updatedNotes });
                        } catch (err) {
                            console.error('Failed to update notes', err);
                        }
                    }}
                    conversationNotes={notes}
                    onAddNote={handleAddNote}
                />
            </div>
        </div>
    );
}