'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase, createRealtimeClient, Conversation, Message, Profile } from '@/lib/supabase';
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
interface UserChat {
  otherUser: Profile;
  conversations: Conversation[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isBlocked: boolean;
  isBookmarked: boolean;
}

const MINIMIZED_SIZE = { width: 48, height: 48 };
const MIN_SIZE = { width: 300, height: 350 };
const MAX_SIZE = { width: 600, height: 800 };
const DEFAULT_SIZE = { width: 380, height: 500 };

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
  const lastFetchRef = useRef<number>(0);
  const fetchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isMuted, setIsMuted] = useState(false);

  // Request notification permission on mount & reset title on visibility change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Reset document title when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && document.title.includes('(New Message)')) {
        document.title = 'Dreadmyst Nexus';
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const showBrowserNotification = (title: string, body: string, onClick?: () => void) => {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        body,
        icon: '/portal.png',
        badge: '/favicon-32x32.png',
        tag: 'dreadmyst-chat', // Prevents duplicate notifications
      });
      notification.onclick = () => {
        window.focus();
        onClick?.();
        notification.close();
      };
    }
  };

  // Archive/Block/Bookmark state
  const [archivedConvoIds, setArchivedConvoIds] = useState<Set<string>>(new Set());
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [bookmarkedUserIds, setBookmarkedUserIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Size state for open mode (resizable)
  const [chatSize, setChatSize] = useState<{ width: number; height: number }>(DEFAULT_SIZE);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

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
    const savedMuted = localStorage.getItem('chatMuted');
    if (savedPosition) {
      try { setPosition(JSON.parse(savedPosition)); } catch (e) {}
    }
    if (savedMinPosition) {
      try { setMinimizedPosition(JSON.parse(savedMinPosition)); } catch (e) {}
    }
    if (savedSize) {
      try {
        const parsed = JSON.parse(savedSize);
        if (parsed.width && parsed.height) {
          setChatSize(parsed);
        }
      } catch (e) {}
    }
    if (savedMuted === 'true') {
      setIsMuted(true);
    }
  }, []);

  // Listen for open events
  useEffect(() => {
    const handleOpenChat = () => setMode('open');
    const handleOpenChatWithUser = (e: CustomEvent<{ userId: string }>) => {
      setMode('open');
      // Set active user after a short delay to allow conversations to load
      setTimeout(() => {
        setActiveUserId(e.detail.userId);
      }, 100);
    };

    window.addEventListener('openChatWidget', handleOpenChat);
    window.addEventListener('openChatWithUser', handleOpenChatWithUser as EventListener);
    return () => {
      window.removeEventListener('openChatWidget', handleOpenChat);
      window.removeEventListener('openChatWithUser', handleOpenChatWithUser as EventListener);
    };
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
    localStorage.setItem('chatWidgetSize', JSON.stringify(chatSize));
  }, [chatSize]);

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('chatMuted', newMuted.toString());
  };

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
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    setIsDragging(true);
  };

  // Resize handlers for corners
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizeCorner(corner);
    setIsResizing(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeCorner && dragStartPos) {
        // Handle resize
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;

        setChatSize(prev => {
          let newWidth = prev.width;
          let newHeight = prev.height;

          if (resizeCorner.includes('e')) newWidth = Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, prev.width + dx));
          if (resizeCorner.includes('w')) newWidth = Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, prev.width - dx));
          if (resizeCorner.includes('s')) newHeight = Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, prev.height + dy));
          if (resizeCorner.includes('n')) newHeight = Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, prev.height - dy));

          return { width: newWidth, height: newHeight };
        });

        // Adjust position for nw, n, ne, w corners
        if (resizeCorner.includes('w') || resizeCorner.includes('n')) {
          setPosition(prev => {
            if (!prev) return prev;
            let newX = prev.x;
            let newY = prev.y;
            if (resizeCorner.includes('w')) newX = prev.x + dx;
            if (resizeCorner.includes('n')) newY = prev.y + dy;
            return { x: newX, y: newY };
          });
        }

        setDragStartPos({ x: e.clientX, y: e.clientY });
        return;
      }

      if (isDragging) {
        // Check if we've actually moved (threshold of 5px)
        if (dragStartPos) {
          const dist = Math.sqrt(Math.pow(e.clientX - dragStartPos.x, 2) + Math.pow(e.clientY - dragStartPos.y, 2));
          if (dist > 5) setHasDragged(true);
        }

        if (mode === 'minimized') {
          const maxX = window.innerWidth - MINIMIZED_SIZE.width;
          const maxY = window.innerHeight - MINIMIZED_SIZE.height;
          setMinimizedPosition({
            x: Math.max(0, Math.min(e.clientX - dragOffset.x, maxX)),
            y: Math.max(0, Math.min(e.clientY - dragOffset.y, maxY)),
          });
        } else {
          const maxX = window.innerWidth - chatSize.width;
          const maxY = window.innerHeight - chatSize.height;
          setPosition({
            x: Math.max(0, Math.min(e.clientX - dragOffset.x, maxX)),
            y: Math.max(0, Math.min(e.clientY - dragOffset.y, maxY)),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeCorner(null);
      setDragStartPos(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeCorner, dragOffset, chatSize, mode, dragStartPos]);

  const resetPosition = () => {
    setPosition(null);
    localStorage.removeItem('chatWidgetPosition');
  };

  // Fetch archived conversation IDs
  const fetchArchivedConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('archived_conversations')
      .select('conversation_id')
      .eq('user_id', user.id);
    if (data) {
      setArchivedConvoIds(new Set(data.map(d => d.conversation_id)));
    }
  }, [user]);

  // Fetch blocked user IDs
  const fetchBlockedUsers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', user.id);
    if (data) {
      setBlockedUserIds(new Set(data.map(d => d.blocked_id)));
    }
  }, [user]);

  // Fetch bookmarked user IDs
  const fetchBookmarkedUsers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookmarked_users')
      .select('bookmarked_id')
      .eq('user_id', user.id);
    if (data) {
      setBookmarkedUserIds(new Set(data.map(d => d.bookmarked_id)));
    }
  }, [user]);

  // Toggle archive for a conversation
  const toggleArchive = async (conversationId: string) => {
    if (!user) return;
    const isArchived = archivedConvoIds.has(conversationId);
    if (isArchived) {
      await supabase.from('archived_conversations').delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);
    } else {
      await supabase.from('archived_conversations').insert({
        user_id: user.id,
        conversation_id: conversationId,
      });
    }
    fetchArchivedConversations();
    fetchConversations();
  };

  // Block a user
  const blockUser = async (blockedId: string) => {
    if (!user || blockedUserIds.has(blockedId)) return;
    await supabase.from('blocked_users').insert({
      blocker_id: user.id,
      blocked_id: blockedId,
    });
    fetchBlockedUsers();
    setActiveUserId(null);
  };

  // Toggle bookmark for a user
  const toggleBookmark = async (bookmarkedId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedUserIds.has(bookmarkedId);
    if (isBookmarked) {
      await supabase.from('bookmarked_users').delete()
        .eq('user_id', user.id)
        .eq('bookmarked_id', bookmarkedId);
    } else {
      await supabase.from('bookmarked_users').insert({
        user_id: user.id,
        bookmarked_id: bookmarkedId,
      });
    }
    fetchBookmarkedUsers();
  };

  // Fetch conversations and group by user (with rate limiting)
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    // Rate limit: don't fetch more than once per 5 seconds
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      return;
    }
    lastFetchRef.current = now;

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

        // Skip blocked users
        if (blockedUserIds.has(otherUser.id)) continue;

        const existing = userMap.get(otherUser.id);
        if (existing) {
          existing.conversations.push(convo);
        } else {
          // Check if any conversation with this user is archived
          const isArchived = archivedConvoIds.has(convo.id);
          userMap.set(otherUser.id, {
            otherUser,
            conversations: [convo],
            unreadCount: 0,
            isArchived,
            isBlocked: false,
            isBookmarked: bookmarkedUserIds.has(otherUser.id),
          });
        }
      }

      // Collect all conversation IDs for batch queries
      const allConvoIds = data.map(c => c.id);

      // Batch query: Get recent messages for all conversations at once
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', allConvoIds)
        .order('created_at', { ascending: false })
        .limit(100); // Get enough to find last message per convo

      // Batch query: Get unread counts for all conversations at once
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', allConvoIds)
        .eq('read', false)
        .neq('sender_id', user.id);

      // Build lookup maps from batch results
      const lastMessageByConvo = new Map<string, Message>();
      if (recentMessages) {
        for (const msg of recentMessages) {
          if (!lastMessageByConvo.has(msg.conversation_id)) {
            lastMessageByConvo.set(msg.conversation_id, msg as Message);
          }
        }
      }

      const unreadCountByConvo = new Map<string, number>();
      if (unreadMessages) {
        for (const msg of unreadMessages) {
          unreadCountByConvo.set(msg.conversation_id, (unreadCountByConvo.get(msg.conversation_id) || 0) + 1);
        }
      }

      // Update each user chat with batch results
      for (const [userId, chat] of userMap) {
        const convoIds = chat.conversations.map(c => c.id);

        // Update isArchived if ALL conversations are archived
        chat.isArchived = convoIds.every(id => archivedConvoIds.has(id));

        // Find last message across all convos with this user
        let lastMessage: Message | undefined;
        for (const convoId of convoIds) {
          const msg = lastMessageByConvo.get(convoId);
          if (msg && (!lastMessage || new Date(msg.created_at) > new Date(lastMessage.created_at))) {
            lastMessage = msg;
          }
        }
        if (lastMessage) {
          chat.lastMessage = lastMessage;
        }

        // Sum unread counts across all convos with this user
        let totalUnread = 0;
        for (const convoId of convoIds) {
          totalUnread += unreadCountByConvo.get(convoId) || 0;
        }
        chat.unreadCount = totalUnread;
      }

      // Sort by last message time
      const sorted = Array.from(userMap.values()).sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.conversations[0]?.created_at || '';
        const bTime = b.lastMessage?.created_at || b.conversations[0]?.created_at || '';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setUserChats(sorted);
    }
  }, [user, blockedUserIds, archivedConvoIds, bookmarkedUserIds]);

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

  // Subscribe to new messages (delay initial fetch to not block page render)
  useEffect(() => {
    if (!user) return;

    // Delay initial fetch so page content loads first (3 seconds)
    const initTimer = setTimeout(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 3000);

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;
          console.log('[Chat] New message received via realtime:', newMsg.id);

          // Show notification if not from us and chat not focused on that user
          if (newMsg.sender_id !== user.id) {
            console.log('[Chat] Message from other user, checking notification conditions...');
            console.log('[Chat] activeUserId:', activeUserId, 'sender:', newMsg.sender_id, 'muted:', isMuted);
            const { data: sender } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMsg.sender_id)
              .single();

            // Only notify if not viewing this user's chat and not muted
            if (activeUserId !== newMsg.sender_id && !isMuted) {
              const senderName = sender?.in_game_name || sender?.username || 'Someone';
              const messagePreview = newMsg.content.slice(0, 50) + (newMsg.content.length > 50 ? '...' : '');
              console.log('[Chat] Showing notification from:', senderName);

              // In-app toast notification
              setNotification({
                message: messagePreview,
                sender: senderName,
              });

              if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
              notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);

              // Browser push notification (works even if tab not focused)
              showBrowserNotification(
                `Message from ${senderName}`,
                messagePreview,
                () => {
                  setMode('open');
                  setActiveUserId(newMsg.sender_id);
                }
              );

              // Update document title to show unread
              if (document.hidden) {
                document.title = `(New Message) Dreadmyst Nexus`;
              }

              // Play notification sound using Web Audio API
              try {
                const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800; // Hz
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;

                oscillator.start();
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.stop(audioContext.currentTime + 0.3);
              } catch {
                // Audio API not supported - that's okay
              }
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

          // Debounce the conversation refresh to avoid hammering the database
          if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
          fetchDebounceRef.current = setTimeout(() => {
            fetchConversations();
          }, 2000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(initTimer);
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      supabase.removeChannel(channel);
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
    // Note: Intentionally not including userChats to prevent re-subscription cascade
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeUserId, isMuted]);

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

  // Default positions
  const defaultMinPosition = { x: window.innerWidth - 64, y: window.innerHeight - 120 };
  const defaultOpenPosition = { x: window.innerWidth - chatSize.width - 24, y: window.innerHeight - chatSize.height - 24 };

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
              // Only open if we didn't drag
              if (!hasDragged) {
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
            isDragging || isResizing ? '' : 'animate-in slide-in-from-bottom-2 duration-200'
          }`}
          style={{
            width: chatSize.width,
            height: chatSize.height,
            ...(position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 }),
          }}
        >
          {/* Resize handles */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner handles */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize pointer-events-auto hover:bg-amber-500/20 rounded-bl transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            >
              <svg className="w-3 h-3 text-muted/50" viewBox="0 0 12 12">
                <path d="M11 11L11 7M11 11L7 11M11 11L4 4M8 11L11 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            {/* Edge handles */}
            <div
              className="absolute top-0 left-3 right-3 h-1 cursor-n-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div
              className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div
              className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'w')}
            />
            <div
              className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize pointer-events-auto"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
          </div>
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
              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className={`p-1.5 rounded transition-colors ${isMuted ? 'text-red-400 hover:text-red-300' : 'text-muted hover:text-foreground'}`}
                title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
              >
                {isMuted ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
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
              {/* Notification permission prompt */}
              {notificationPermission === 'default' && (
                <div className="p-3 border-b border-gray-800 bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-xs text-muted flex-1">Enable notifications to know when you get messages</p>
                    <button
                      onClick={requestNotificationPermission}
                      className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              )}
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
