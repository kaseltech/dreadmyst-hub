'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, Conversation, Message, Profile } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchConversation();
      fetchMessages();
      subscribeToMessages();
    } else if (!authLoading && !user) {
      router.push('/messages');
    }
  }, [authLoading, user, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchConversation() {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, listing:listings(*), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      router.push('/messages');
    } else {
      setConversation(data);
    }
  }

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);

      // Mark messages as read (messages not from current user)
      if (user) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', id)
          .neq('sender_id', user.id);
      }
    }
    setLoading(false);
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        async (payload) => {
          // Fetch the full message with sender profile
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } else {
      setNewMessage('');
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);
    }
    setSending(false);
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted">Conversation not found</p>
      </div>
    );
  }

  const otherUser = conversation.buyer_id === user?.id ? conversation.seller : conversation.buyer;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-card-border mb-4">
          <Link href="/messages" className="text-muted hover:text-foreground">
            ← Back
          </Link>
          <div className="flex items-center gap-3 flex-1">
            {otherUser?.avatar_url && (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.username}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">
                {otherUser?.username || 'Unknown'}
                {otherUser?.in_game_name && (
                  <span className="text-muted font-normal text-sm ml-2">IGN: {otherUser.in_game_name}</span>
                )}
              </p>
              <Link
                href={`/market/${conversation.listing_id}`}
                className="text-sm text-accent-light hover:text-accent"
              >
                Re: {conversation.listing?.item_name}
              </Link>
            </div>
          </div>
          {conversation.listing && (
            <div className="text-right">
              <span className="text-lg font-bold text-yellow-500">
                {conversation.listing.price.toLocaleString()}g
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showDate =
                  index === 0 ||
                  formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-muted my-4">
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-accent text-white rounded-br-sm'
                            : 'bg-card-bg border border-card-border rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-white/70' : 'text-muted'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
