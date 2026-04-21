import { Check, CheckCheck, Clock, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import type { WhatsAppMessage } from '../../types';
import { formatTime } from '../../lib/formatters';

const STATUS_ICONS = {
    pending: <Clock size={12} className="text-gray-400" />,
    sent: <Check size={12} className="text-gray-400" />,
    delivered: <CheckCheck size={12} className="text-gray-400" />,
    read: <CheckCheck size={12} className="text-emerald-400" />,
    failed: <AlertCircle size={12} className="text-red-400" />,
};

interface Props {
    message: WhatsAppMessage;
    showDateSeparator: boolean;
    dateSeparatorLabel: string;
}

export default function MessageBubble({ message, showDateSeparator, dateSeparatorLabel }: Props) {
    const isOutbound = message.direction === 'out';


    return (
        <>
            {showDateSeparator && (
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium px-2">{dateSeparatorLabel}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
            )}

            <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`max-w-[72%] ${isOutbound ? 'items-end' : 'items-start'} flex flex-col`}>
                    {message.message_type === 'image' && message.media_url && (
                        <div
                            className={`rounded-xl overflow-hidden shadow-sm mb-0.5 ${isOutbound ? 'bg-emerald-500' : 'bg-white border border-gray-200'
                                }`}
                        >
                            <img
                                src={message.media_url}
                                alt={message.caption || 'Image'}
                                className="max-w-full max-h-64 object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            {message.caption && (
                                <p
                                    className={`text-sm px-3 py-2 ${isOutbound ? 'text-white' : 'text-gray-800'
                                        }`}
                                >
                                    {message.caption}
                                </p>
                            )}
                        </div>
                    )}

                    {message.message_type === 'document' && (
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm ${isOutbound
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                        >
                            <FileText size={20} />
                            <div>
                                <p className="text-sm font-medium">{message.caption || 'Document'}</p>
                                <p className={`text-xs ${isOutbound ? 'text-emerald-100' : 'text-gray-400'}`}>
                                    {message.media_mime_type || 'PDF'}
                                </p>
                            </div>
                        </div>
                    )}

                    {message.message_type === 'template' && (
                        <div
                            className={`px-4 py-3 rounded-xl shadow-sm max-w-xs ${isOutbound
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                        >
                            <p className={`text-xs font-semibold mb-1 ${isOutbound ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                Template: {message.template_name}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                    )}

                    {/* {(message.message_type === 'text' || message.message_type === 'interactive') && message.text && ( */}
                        { message.text && (
                        <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${isOutbound
                                    ? 'bg-emerald-500 text-white rounded-br-sm'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                        </div>
                    )}

                    <div
                        className={`flex items-center gap-1 mt-0.5 ${isOutbound ? 'flex-row-reverse' : ''}`}
                    >
                        <span className="text-[10px] text-gray-400">{formatTime(message.timestamp)}</span>
                        {isOutbound && STATUS_ICONS[message.status]}
                        {message.sender && (
                            <span className="text-[10px] text-gray-400">
                                {message.sender.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
