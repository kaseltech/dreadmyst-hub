'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase, Conversation, Message, Profile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { formatTimeAgo } from '@/lib/formatters';

interface ChatWidgetProps {
  onUnreadCountChange?: (count: number) => void;
}

export default function ChatWidget({ onUnreadCountChange }: ChatWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState<{ message: string; sender: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*, listing:listings(*), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  }, [user]);

  // Fetch unread count (defined before fetchMessages since it's used there)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    // Get all conversations for this user
    const { data: convos } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (!convos || convos.length === 0) {
      setUnreadCount(0);
      onUnreadCountChange?.(0);
      return;
    }

    const convoIds = convos.map(c => c.id);

    // Count unread messages not from this user
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convoIds)
      .eq('read', false)
      .neq('sender_id', user.id);

    if (!error) {
      setUnreadCount(count || 0);
      onUnreadCountChange?.(count || 0);
    }
  }, [user, onUnreadCountChange]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user?.id);

      if (!updateError) {
        // Refresh unread count after marking as read
        fetchUnreadCount();
      }
    }
  }, [user, fetchUnreadCount]);

  // Subscribe to new messages globally
  useEffect(() => {
    if (!user) return;

    fetchConversations();
    fetchUnreadCount();

    // Subscribe to all messages for this user's conversations
    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Check if this message is for one of our conversations
          const convo = conversations.find(c => c.id === newMsg.conversation_id);
          if (!convo) {
            // Refetch conversations in case this is a new one
            await fetchConversations();
          }

          // If message is not from us, show notification
          if (newMsg.sender_id !== user.id) {
            // Fetch sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMsg.sender_id)
              .single();

            // Show notification toast
            setNotification({
              message: newMsg.content.slice(0, 50) + (newMsg.content.length > 50 ? '...' : ''),
              sender: sender?.username || 'Someone',
            });

            // Clear notification after 5 seconds
            if (notificationTimeoutRef.current) {
              clearTimeout(notificationTimeoutRef.current);
            }
            notificationTimeoutRef.current = setTimeout(() => {
              setNotification(null);
            }, 5000);

            // Play notification sound
            try {
              const audio = new Audio('/notification.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}

            // Update unread count
            fetchUnreadCount();
          }

          // If we're viewing this conversation, add the message
          if (activeConversation?.id === newMsg.conversation_id) {
            const { data: fullMessage } = await supabase
              .from('messages')
              .select('*, sender:profiles(*)')
              .eq('id', newMsg.id)
              .single();

            if (fullMessage) {
              // Add message, avoiding duplicates
              setMessages(prev => {
                if (prev.some(m => m.id === fullMessage.id)) return prev;
                return [...prev, fullMessage];
              });

              // Mark as read since we're viewing it
              if (newMsg.sender_id !== user.id) {
                await supabase
                  .from('messages')
                  .update({ read: true })
                  .eq('id', newMsg.id);
                fetchUnreadCount();
              }
            }
          }

          // Refresh conversations to update order
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [user, activeConversation, conversations, fetchConversations, fetchUnreadCount]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation, fetchMessages]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConversation || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    setNewMessage(''); // Clear input immediately for better UX

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: messageContent,
      })
      .select('*, sender:profiles(*)')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message on error
    } else if (data) {
      // Add message to local state immediately (don't rely on subscription)
      setMessages(prev => {
        // Avoid duplicates if subscription already added it
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversation.id);
    }
    setSending(false);
  };

  if (!user) return null;

  const getOtherUser = (convo: Conversation): Profile | undefined => {
    return convo.buyer_id === user.id ? convo.seller : convo.buyer;
  };

  const widget = (
    <>
      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed bottom-24 right-6 z-[60] max-w-sm p-4 bg-card-bg border border-accent rounded-lg shadow-2xl animate-in slide-in-from-right duration-300 cursor-pointer"
          onClick={() => {
            setNotification(null);
            setIsOpen(true);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{notification.sender}</p>
              <p className="text-sm text-muted truncate">{notification.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotification(null);
              }}
              className="text-muted hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent hover:bg-accent-light rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-card-bg border border-card-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-background">
            {activeConversation ? (
              <>
                <button
                  onClick={() => setActiveConversation(null)}
                  className="text-muted hover:text-foreground mr-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getOtherUser(activeConversation)?.avatar_url && (
                    <img
                      src={getOtherUser(activeConversation)!.avatar_url!}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getOtherUser(activeConversation)?.username || 'Unknown'}
                      {getOtherUser(activeConversation)?.in_game_name && (
                        <span className="text-muted font-normal"> IGN: {getOtherUser(activeConversation)?.in_game_name}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {activeConversation.listing?.item_name}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <h3 className="font-semibold">Messages</h3>
            )}
          </div>

          {/* Content */}
          {activeConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-muted text-sm py-8">No messages yet</p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-accent text-white rounded-br-sm'
                              : 'bg-card-border rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-card-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Conversation List */
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <svg className="w-12 h-12 text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-muted text-sm">No conversations yet</p>
                  <p className="text-muted text-xs mt-1">Contact a seller to start chatting</p>
                </div>
              ) : (
                conversations.map((convo) => {
                  const otherUser = getOtherUser(convo);
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setActiveConversation(convo)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-card-border/50 transition-colors text-left border-b border-card-border/50"
                    >
                      {otherUser?.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <span className="text-accent font-medium">
                            {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {otherUser?.username || 'Unknown'}
                          </p>
                          <span className="text-xs text-muted">
                            {formatTimeAgo(convo.updated_at)}
                          </span>
                        </div>
                        {otherUser?.in_game_name && (
                          <p className="text-xs text-accent truncate">
                            IGN: {otherUser.in_game_name}
                          </p>
                        )}
                        <p className="text-xs text-muted truncate">
                          {convo.listing?.item_name || 'Item'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  // Use portal to render at body level
  if (typeof window !== 'undefined') {
    return createPortal(widget, document.body);
  }

  return null;
}
