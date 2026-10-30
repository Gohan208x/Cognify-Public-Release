/**
 * Chat Component
 * 
 * Modern, professional chat interface with mobile responsiveness.
 */

import React, { useState, useEffect, useRef } from 'react';
import { chatApi, ConversationDto, MessageDto, SendMessageRequest } from '../src/api/chatApi';
import { ProfileAvatar, getThemedUsernameClass } from './ProfileAvatar';
import {
    MessageCircle,
    Send,
    Paperclip,
    Smile,
    X,
    ChevronLeft,
    Reply,
    Check,
    CheckCheck,
    Image,
    FileText,
    Loader2,
    Menu,
    Trash2
} from 'lucide-react';

interface ChatProps {
    initialUserId?: number;
    onViewProfile?: (userId: number) => void;
    onUnreadChange?: (count: number) => void;
}

export const Chat: React.FC<ChatProps> = ({ initialUserId, onViewProfile, onUnreadChange }) => {
    const [conversations, setConversations] = useState<ConversationDto[]>([]);
    const [activeConversation, setActiveConversation] = useState<ConversationDto | null>(null);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<MessageDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    const emojis = [
        '😀', '😂', '😍', '🤔', '😎', '🥳', '😭', '🔥', '❤️', '👍',
        '👎', '🎉', '💯', '✨', '🙏', '💪', '🤝', '📚', '✅', '❌',
        '💡', '🧠', '📝', '🎯', '⭐', '🏆', '💰', '🪙', '🚀', '👀'
    ];

    useEffect(() => {
        loadConversations();
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    const startedConversationRef = useRef<number | null>(null);

    useEffect(() => {
        if (initialUserId && startedConversationRef.current !== initialUserId) {
            startedConversationRef.current = initialUserId;
            startConversation(initialUserId);
        }
    }, [initialUserId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (activeConversation) {
            pollIntervalRef.current = setInterval(() => refreshMessages(), 3000);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [activeConversation?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const convos = await chatApi.getConversations();
            const uniqueConvos = convos.reduce((acc, convo) => {
                const existing = acc.find(c => c.otherUserId === convo.otherUserId);
                if (!existing) {
                    acc.push(convo);
                } else if (convo.unreadCount > 0 || (convo.lastMessage && !existing.lastMessage)) {
                    const index = acc.indexOf(existing);
                    acc[index] = convo;
                }
                return acc;
            }, [] as typeof convos);
            setConversations(uniqueConvos);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
        setIsLoading(false);
    };

    // Report total unread count to parent
    useEffect(() => {
        const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        onUnreadChange?.(totalUnread);
    }, [conversations, onUnreadChange]);

    const startConversation = async (userId: number) => {
        try {
            const convo = await chatApi.getOrCreateConversation(userId);
            setActiveConversation(convo);
            setShowMobileSidebar(false);
            if (!conversations.find(c => c.id === convo.id)) {
                setConversations(prev => [convo, ...prev]);
            }
            loadMessages(convo.id);
        } catch (err: any) {
            console.error('Failed to start conversation:', err);
        }
    };

    const loadMessages = async (conversationId: number) => {
        try {
            const msgs = await chatApi.getAllMessages(conversationId);
            setMessages(msgs);
            await chatApi.markAsRead(conversationId);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const refreshMessages = async () => {
        if (!activeConversation) return;
        try {
            const msgs = await chatApi.getAllMessages(activeConversation.id);
            setMessages(msgs);
        } catch (err) { /* Silent fail */ }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversation) return;
        const request: SendMessageRequest = {
            content: newMessage,
            replyToId: replyTo?.id
        };
        try {
            const sent = await chatApi.sendMessage(activeConversation.id, request);
            setMessages(prev => [...prev, sent]);
            setNewMessage('');
            setReplyTo(null);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversation) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB');
            return;
        }
        try {
            const sent = await chatApi.uploadFile(activeConversation.id, file);
            setMessages(prev => [...prev, sent]);
        } catch (err: any) {
            alert(err.message || 'Failed to upload file');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Today';
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const handleLinkClick = (url: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (confirm(`Open this link?\n${url}`)) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const linkifyText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                urlRegex.lastIndex = 0;
                return (
                    <a
                        key={index}
                        href={part}
                        onClick={(e) => handleLinkClick(part, e)}
                        className="text-primary-400 hover:text-primary-300 underline break-all"
                    >
                        {part.length > 40 ? part.substring(0, 40) + '...' : part}
                    </a>
                );
            }
            return part;
        });
    };

    const selectConversation = (convo: ConversationDto) => {
        setActiveConversation(convo);
        setShowMobileSidebar(false);
        loadMessages(convo.id);
    };

    const handleDeleteMessage = async () => {
        if (!messageToDelete || !activeConversation) return;
        try {
            await chatApi.deleteMessage(activeConversation.id, messageToDelete.id);
            setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
            setMessageToDelete(null);
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            {/* Mobile Overlay */}
            {!showMobileSidebar && activeConversation && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setShowMobileSidebar(true)}
                    style={{ display: 'none' }}
                />
            )}

            {/* Conversation Sidebar */}
            <div className={`
                ${showMobileSidebar ? 'flex' : 'hidden'} md:flex
                flex-col w-full md:w-80 bg-slate-900 border-r border-slate-800
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageCircle size={20} className="text-primary-400" />
                        Messages
                    </h2>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length > 0 ? (
                        conversations.map(convo => (
                            <button
                                key={convo.id}
                                onClick={() => selectConversation(convo)}
                                className={`w-full flex items-center gap-3 p-3 hover:bg-slate-800/50 transition-colors text-left border-b border-slate-800/50 ${activeConversation?.id === convo.id ? 'bg-slate-800' : ''
                                    }`}
                            >
                                <ProfileAvatar
                                    avatar={convo.otherAvatar}
                                    profilePictureUrl={convo.otherProfilePictureUrl}
                                    profileBorder={convo.otherProfileBorder}
                                    size="md"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold truncate ${getThemedUsernameClass(convo.otherProfileTheme)}`}>
                                        {convo.otherDisplayName || convo.otherUsername}
                                    </h4>
                                    <p className="text-sm text-slate-500 truncate">
                                        {convo.lastMessage || 'No messages yet'}
                                    </p>
                                </div>
                                {convo.unreadCount > 0 && (
                                    <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full px-1.5">
                                        {convo.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="p-6 text-center text-slate-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No conversations yet</p>
                            <p className="text-sm">Connect with users to start chatting!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`
                ${!showMobileSidebar ? 'flex' : 'hidden'} md:flex
                flex-col flex-1 min-w-0
            `}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => onViewProfile?.(activeConversation.otherUserId)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <ProfileAvatar
                                    avatar={activeConversation.otherAvatar}
                                    profilePictureUrl={activeConversation.otherProfilePictureUrl}
                                    profileBorder={activeConversation.otherProfileBorder}
                                    size="sm"
                                />
                                <h3 className={`font-semibold ${getThemedUsernameClass(activeConversation.otherProfileTheme)}`}>
                                    {activeConversation.otherDisplayName || activeConversation.otherUsername}
                                </h3>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg, idx) => {
                                const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
                                const showDate = !prevMsg ||
                                    new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                                const isSent = msg.senderId !== activeConversation.otherUserId;

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDate && (
                                            <div className="flex justify-center">
                                                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400">
                                                    {formatDate(msg.createdAt)}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] group relative ${isSent ? 'order-2' : ''}`}>
                                                {/* Reply Preview */}
                                                {msg.replyToContent && (
                                                    <div className={`text-xs px-3 py-1.5 rounded-t-lg border-l-2 mb-0.5 ${isSent
                                                        ? 'bg-primary-700/30 border-primary-500 text-slate-300'
                                                        : 'bg-slate-700/50 border-slate-500 text-slate-400'
                                                        }`}>
                                                        <Reply size={10} className="inline mr-1" />
                                                        {msg.replyToContent.substring(0, 50)}...
                                                    </div>
                                                )}

                                                {/* Message Bubble */}
                                                <div className={`px-4 py-2.5 rounded-2xl ${isSent
                                                    ? 'bg-primary-600 text-white rounded-br-md'
                                                    : 'bg-slate-800 text-slate-100 rounded-bl-md'
                                                    }`}>
                                                    {msg.messageType === 'TEXT' && (
                                                        <p className="text-sm break-words whitespace-pre-wrap">{linkifyText(msg.content || '')}</p>
                                                    )}

                                                    {msg.messageType === 'IMAGE' && (
                                                        <img
                                                            src={msg.fileUrl}
                                                            alt={msg.fileName}
                                                            className="max-w-full rounded-lg cursor-pointer"
                                                            onClick={() => window.open(msg.fileUrl, '_blank')}
                                                        />
                                                    )}

                                                    {msg.messageType === 'FILE' && (
                                                        <a
                                                            href={msg.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-sm hover:opacity-80"
                                                        >
                                                            <FileText size={16} />
                                                            <span className="truncate">{msg.fileName}</span>
                                                            <span className="text-xs opacity-70">
                                                                {((msg.fileSize || 0) / 1024).toFixed(1)} KB
                                                            </span>
                                                        </a>
                                                    )}

                                                    {/* Time & Read Status */}
                                                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${isSent ? 'text-white/60 justify-end' : 'text-slate-500'
                                                        }`}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {isSent && (
                                                            msg.readAt
                                                                ? <CheckCheck size={12} className="text-blue-300" />
                                                                : <Check size={12} />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSent ? '-left-20' : '-right-10'}`}>
                                                    <button
                                                        onClick={() => setReplyTo(msg)}
                                                        className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800"
                                                        title="Reply"
                                                    >
                                                        <Reply size={14} className="text-slate-400" />
                                                    </button>
                                                    {isSent && (
                                                        <button
                                                            onClick={() => setMessageToDelete(msg)}
                                                            className="p-1.5 bg-slate-900 border border-red-500/30 rounded-lg hover:bg-red-500/20"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} className="text-red-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Preview Bar */}
                        {replyTo && (
                            <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center gap-3">
                                <Reply size={16} className="text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-400">Replying to</p>
                                    <p className="text-sm text-slate-300 truncate">{replyTo.content?.substring(0, 50)}</p>
                                </div>
                                <button
                                    onClick={() => setReplyTo(null)}
                                    className="p-1 hover:bg-slate-700 rounded-lg text-slate-400"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-2 md:p-3 border-t border-slate-800 bg-slate-900/50 relative">
                            {/* Emoji Picker Popup - Outside overflow container */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 right-0 mx-2 mb-2 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
                                    <div className="grid grid-cols-8 md:grid-cols-10 gap-1">
                                        {emojis.map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => {
                                                    setNewMessage(prev => prev + emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="text-lg md:text-xl hover:bg-slate-800 p-1 rounded transition-colors"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-end gap-1.5 md:gap-2 w-full overflow-hidden">
                                {/* Emoji Picker */}
                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 md:p-2.5 hover:bg-slate-800 rounded-lg transition-colors ${showEmojiPicker ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}
                                    >
                                        <Smile size={18} className="md:w-5 md:h-5" />
                                    </button>
                                </div>

                                {/* Message Input */}
                                <textarea
                                    ref={chatInputRef}
                                    value={newMessage}
                                    onChange={e => {
                                        setNewMessage(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                    placeholder="Type a message..."
                                    rows={1}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                            if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
                                        }
                                    }}
                                    className="flex-1 min-w-0 bg-slate-800 border border-slate-700 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-sm resize-none overflow-hidden"
                                />

                                {/* File Upload */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 md:p-2.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
                                >
                                    <Paperclip size={18} className="md:w-5 md:h-5" />
                                </button>

                                {/* Send Button */}
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-2 md:p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors shrink-0"
                                >
                                    <Send size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
                        <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">Select a conversation</h3>
                        <p className="text-center text-sm">Choose from your existing conversations or connect with new users to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Delete Message Confirmation Modal */}
            {messageToDelete && (
                <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4" onClick={() => setMessageToDelete(null)}>
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <Trash2 size={32} />
                            <h3 className="text-xl font-bold text-white">Delete Message?</h3>
                        </div>
                        <p className="text-slate-400 mb-2">Are you sure you want to delete this message?</p>
                        <div className="bg-slate-800 rounded-lg p-3 mb-6 max-h-20 overflow-hidden">
                            <p className="text-sm text-slate-300 truncate">{messageToDelete.content || '[Attachment]'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setMessageToDelete(null)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700">Cancel</button>
                            <button onClick={handleDeleteMessage} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white font-bold border border-red-500/50">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
