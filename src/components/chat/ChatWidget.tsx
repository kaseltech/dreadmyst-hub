'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase, Conversation, Message, Profile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { formatTimeAgo } from '@/lib/formatters';

interface ChatWidgetProps {
  onUnreadCountChange?: (count: number) => void;
}

interface Position {
  x: number;
  y: number;
}

type ChatMode = 'minimized' | 'open';
type ChatSize = 'small' | 'medium' | 'large';

interface UserChat {
  otherUser: Profile;
  conversations: Conversation[];
  lastMessage?: Message;
  unreadCount: number;
}

const SIZES: Record<ChatSize, { width: number; height: number }> = {
  small: { width: 320, height: 400 },
  medium: { width: 380, height: 500 },
  large: { width: 450, height: 600 },
};

const MINIMIZED_SIZE = { width: 48, height: 48 };

export default function ChatWidget({ onUnreadCountChange }: ChatWidgetProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<ChatMode>('minimized');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userChats, setUserChats] = useState<UserChat[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState<{ message: string; sender: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Size state for open mode
  const [chatSize, setChatSize] = useState<ChatSize>('medium');

  // Draggable state (works for both minimized and open modes)
  const [position, setPosition] = useState<Position | null>(null);
  const [minimizedPosition, setMinimizedPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatWidgetPosition');
    const savedMinPosition = localStorage.getItem('chatMinimizedPosition');
    const savedSize = localStorage.getItem('chatWidgetSize');
    if (savedPosition) {
      try { setPosition(JSON.parse(savedPosition)); } catch (e) {}
    }
    if (savedMinPosition) {
      try { setMinimizedPosition(JSON.parse(savedMinPosition)); } catch (e) {}
    }
    if (savedSize && ['small', 'medium', 'large'].includes(savedSize)) {
      setChatSize(savedSize as ChatSize);
    }
  }, []);

  // Listen for open event from messages page
  useEffect(() => {
    const handleOpenChat = () => setMode('open');
    window.addEventListener('openChatWidget', handleOpenChat);
    return () => window.removeEventListener('openChatWidget', handleOpenChat);
  }, []);

  // Save preferences
  useEffect(() => {
    if (position) {
      localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
    }
  }, [position]);

  useEffect(() => {
    if (minimizedPosition) {
      localStorage.setItem('chatMinimizedPosition', JSON.stringify(minimizedPosition));
    }
  }, [minimizedPosition]);

  useEffect(() => {
    localStorage.setItem('chatWidgetSize', chatSize);
  }, [chatSize]);

  // Drag handlers for open panel
  const handlePanelDragStart = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    e.preventDefault();
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  // Drag handlers for minimized icon
  const handleIconDragStart = (e: React.MouseEvent) => {
    if (!iconRef.current) return;
    e.preventDefault();
    const rect = iconRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (mode === 'minimized') {
        const maxX = window.innerWidth - MINIMIZED_SIZE.width;
        const maxY = window.innerHeight - MINIMIZED_SIZE.height;
        setMinimizedPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, maxX)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, maxY)),
        });
      } else {
        const size = SIZES[chatSize];
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        setPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, maxX)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, maxY)),
        });
      }
    };

    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, chatSize, mode]);

  const resetPosition = () => {
    setPosition(null);
    localStorage.removeItem('chatWidgetPosition');
  };

  // Fetch conversations and group by user
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*, listing:listings(*), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);

      // Group conversations by the OTHER user
      const userMap = new Map<string, UserChat>();

      for (const convo of data) {
        const otherUser = convo.buyer_id === user.id ? convo.seller : convo.buyer;
        if (!otherUser) continue;

        const existing = userMap.get(otherUser.id);
        if (existing) {
          existing.conversations.push(convo);
        } else {
          userMap.set(otherUser.id, {
            otherUser,
            conversations: [convo],
            unreadCount: 0,
          });
        }
      }

      // Fetch last message and unread count for each user
      for (const [userId, chat] of userMap) {
        const convoIds = chat.conversations.map(c => c.id);

        // Get last message
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convoIds)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastMsg) {
          chat.lastMessage = lastMsg;
        }

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convoIds)
          .eq('read', false)
          .neq('sender_id', user.id);

        chat.unreadCount = count || 0;
      }

      // Sort by last message time
      const sorted = Array.from(userMap.values()).sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.conversations[0]?.created_at || '';
        const bTime = b.lastMessage?.created_at || b.conversations[0]?.created_at || '';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setUserChats(sorted);
    }
  }, [user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    const { data: convos } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (!convos || convos.length === 0) {
      setUnreadCount(0);
      onUnreadCountChange?.(0);
      return;
    }

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convos.map(c => c.id))
      .eq('read', false)
      .neq('sender_id', user.id);

    setUnreadCount(count || 0);
    onUnreadCountChange?.(count || 0);
  }, [user, onUnreadCountChange]);

  // Fetch messages for active user (from ALL conversations with them)
  const fetchMessagesForUser = useCallback(async (otherUserId: string) => {
    if (!user) return;

    // Get all conversations with this user
    const userChat = userChats.find(c => c.otherUser.id === otherUserId);
    if (!userChat) return;

    const convoIds = userChat.conversations.map(c => c.id);

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .in('conversation_id', convoIds)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);

      // Mark all as read
      await supabase
        .from('messages')
        .update({ read: true })
        .in('conversation_id', convoIds)
        .neq('sender_id', user.id);

      fetchUnreadCount();
      fetchConversations();
    }
  }, [user, userChats, fetchUnreadCount, fetchConversations]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    fetchConversations();
    fetchUnreadCount();

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Show notification if not from us and chat not focused on that user
          if (newMsg.sender_id !== user.id) {
            const { data: sender } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMsg.sender_id)
              .single();

            // Only notify if not viewing this user's chat
            if (activeUserId !== newMsg.sender_id) {
              setNotification({
                message: newMsg.content.slice(0, 50) + (newMsg.content.length > 50 ? '...' : ''),
                sender: sender?.in_game_name || sender?.username || 'Someone',
              });

              if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
              notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);

              try {
                const audio = new Audio('/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {});
              } catch {}
            }

            fetchUnreadCount();
          }

          // If viewing this conversation, add message
          if (activeUserId) {
            const userChat = userChats.find(c => c.otherUser.id === activeUserId);
            if (userChat?.conversations.some(c => c.id === newMsg.conversation_id)) {
              const { data: fullMessage } = await supabase
                .from('messages')
                .select('*, sender:profiles(*)')
                .eq('id', newMsg.id)
                .single();

              if (fullMessage) {
                setMessages(prev => {
                  if (prev.some(m => m.id === fullMessage.id)) return prev;
                  return [...prev, fullMessage];
                });

                if (newMsg.sender_id !== user.id) {
                  await supabase.from('messages').update({ read: true }).eq('id', newMsg.id);
                  fetchUnreadCount();
                }
              }
            }
          }

          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, [user, activeUserId, userChats, fetchConversations, fetchUnreadCount]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when active user changes
  useEffect(() => {
    if (activeUserId) {
      fetchMessagesForUser(activeUserId);
    }
  }, [activeUserId, fetchMessagesForUser]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeUserId || sending) return;

    const userChat = userChats.find(c => c.otherUser.id === activeUserId);
    if (!userChat || userChat.conversations.length === 0) return;

    // Use the most recent conversation
    const conversation = userChat.conversations[0];
    const messageContent = newMessage.trim();

    setSending(true);
    setNewMessage('');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: messageContent,
      })
      .select('*, sender:profiles(*)')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
    } else if (data) {
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }
    setSending(false);
  };

  if (!user) return null;

  const activeUserChat = activeUserId ? userChats.find(c => c.otherUser.id === activeUserId) : null;
  const size = SIZES[chatSize];

  // Default positions
  const defaultMinPosition = { x: window.innerWidth - 64, y: window.innerHeight - 120 };
  const defaultOpenPosition = { x: window.innerWidth - size.width - 24, y: window.innerHeight - size.height - 24 };

  const currentMinPosition = minimizedPosition || defaultMinPosition;

  const widget = (
    <>
      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed z-[60] max-w-sm p-3 bg-[#1a1a24] border border-amber-500/50 rounded-lg shadow-2xl animate-in slide-in-from-right duration-300 cursor-pointer"
          style={{ bottom: mode === 'minimized' ? currentMinPosition.y - 80 : 100, right: 24 }}
          onClick={() => {
            setNotification(null);
            setMode('open');
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-amber-400">{notification.sender}</p>
              <p className="text-sm text-muted truncate">{notification.message}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setNotification(null); }} className="text-muted hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Minimized Icon - Draggable */}
      {mode === 'minimized' && (
        <div
          ref={iconRef}
          className={`fixed z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            left: currentMinPosition.x,
            top: currentMinPosition.y,
          }}
          onMouseDown={handleIconDragStart}
        >
          <div
            onClick={(e) => {
              if (!isDragging) {
                setMode('open');
              }
            }}
            className="relative w-12 h-12 rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-105 group"
            style={{
              background: 'linear-gradient(135deg, #1a1a24, #252532)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(245,158,11,0.1)'
            }}
          >
            {/* Envelope icon */}
            <svg className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Glow effect when has messages */}
            {unreadCount > 0 && (
              <div className="absolute inset-0 rounded-xl bg-amber-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            )}
          </div>
        </div>
      )}

      {/* Open Chat Panel */}
      {mode === 'open' && (
        <div
          ref={panelRef}
          className={`fixed z-50 bg-[#0c0c10] border border-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden ${
            isDragging ? '' : 'animate-in slide-in-from-bottom-2 duration-200'
          }`}
          style={{
            width: size.width,
            height: size.height,
            ...(position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 }),
          }}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-3 py-2 border-b border-gray-800 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ background: 'linear-gradient(180deg, #161620, #0c0c10)' }}
            onMouseDown={handlePanelDragStart}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {activeUserChat ? (
                <>
                  <button
                    onClick={() => setActiveUserId(null)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-1 text-muted hover:text-foreground rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {activeUserChat.otherUser.avatar_url && (
                    <img src={activeUserChat.otherUser.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate text-amber-400">
                      {activeUserChat.otherUser.in_game_name || activeUserChat.otherUser.username}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-sm">Messages</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
              {/* Size buttons */}
              <button
                onClick={() => setChatSize('small')}
                className={`p-1.5 rounded transition-colors ${chatSize === 'small' ? 'bg-amber-500/20 text-amber-400' : 'text-muted hover:text-foreground'}`}
                title="Small"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="4" y="4" width="8" height="8" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setChatSize('medium')}
                className={`p-1.5 rounded transition-colors ${chatSize === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'text-muted hover:text-foreground'}`}
                title="Medium"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="3" y="3" width="10" height="10" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setChatSize('large')}
                className={`p-1.5 rounded transition-colors ${chatSize === 'large' ? 'bg-amber-500/20 text-amber-400' : 'text-muted hover:text-foreground'}`}
                title="Large"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="2" y="2" width="12" height="12" rx="1" />
                </svg>
              </button>

              {/* Reset position */}
              {position && (
                <button onClick={resetPosition} className="p-1.5 text-muted hover:text-foreground rounded" title="Reset position">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}

              {/* Minimize */}
              <button
                onClick={() => setMode('minimized')}
                className="p-1.5 text-muted hover:text-amber-400 rounded"
                title="Minimize"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          {activeUserChat ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ background: '#08080a' }}>
                {messages.length === 0 ? (
                  <p className="text-center text-muted text-sm py-8">No messages yet</p>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.sender_id === user.id;
                    const showDate = idx === 0 ||
                      new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1].created_at).toDateString();

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center text-xs text-muted/50 py-2">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[85%]">
                            <div
                              className={`px-3 py-2 rounded-2xl text-sm ${
                                isOwn
                                  ? 'bg-amber-600 text-white rounded-br-md'
                                  : 'bg-gray-800 text-gray-100 rounded-bl-md'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                            <p className={`text-[10px] text-muted/50 mt-0.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-2 border-t border-gray-800" style={{ background: '#0c0c10' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm rounded-full bg-gray-900 border border-gray-800 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #b45309, #d97706)' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* User List */
            <div className="flex-1 overflow-y-auto" style={{ background: '#08080a' }}>
              {userChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <svg className="w-10 h-10 text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-muted text-sm">No conversations yet</p>
                  <p className="text-muted/50 text-xs mt-1">Contact a seller to start chatting</p>
                </div>
              ) : (
                userChats.map((chat) => (
                  <button
                    key={chat.otherUser.id}
                    onClick={() => setActiveUserId(chat.otherUser.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-900/50 transition-colors text-left border-b border-gray-800/50"
                  >
                    {chat.otherUser.avatar_url ? (
                      <img src={chat.otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-400 font-medium">
                          {(chat.otherUser.in_game_name || chat.otherUser.username)?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate text-amber-400">
                          {chat.otherUser.in_game_name || chat.otherUser.username}
                        </p>
                        {chat.lastMessage && (
                          <span className="text-[10px] text-muted/50">
                            {formatTimeAgo(chat.lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted truncate flex-1">
                          {chat.lastMessage?.content || 'No messages'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  if (typeof window !== 'undefined') {
    return createPortal(widget, document.body);
  }
  return null;
}
