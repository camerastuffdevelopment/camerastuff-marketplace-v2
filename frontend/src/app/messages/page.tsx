'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

interface Conversation {
  listing_id: string;
  listing: {
    id: string;
    title: string;
    price_zar: number;
    image_urls: string[];
  };
  otherUser: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
  };
  lastMessage: {
    id: string;
    message_body: string;
    sender_id: string;
    created_at: string;
  };
  unreadCount: number;
  updated_at: string;
}

interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  message_body: string;
  read_at: string | null;
  created_at: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
  };
  recipient: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
  };
  listing: {
    id: string;
    title: string;
    price_zar: number;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const listingId = searchParams.get('listing_id');
  const userId = searchParams.get('user_id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    if (!session) return;

    const fetchConversations = async () => {
      try {
        const response = await api.get('/api/messages/conversations');
        if (response.data.success) {
          setConversations(response.data.data);

          // If listing_id in URL, select that conversation
          if (listingId) {
            const selected = response.data.data.find(
              (c: Conversation) => c.listing_id === listingId
            );
            if (selected) {
              setSelectedConversation(selected);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [session, listingId]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/api/messages?listing_id=${selectedConversation.listing_id}`
        );
        if (response.data.success) {
          setMessages(response.data.data);

          // Mark conversation as read
          await api.put(
            `/api/messages/conversation/${selectedConversation.listing_id}/read`
          );
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !session?.user?.id) return;

    setIsSending(true);
    try {
      const response = await api.post('/api/messages', {
        listing_id: selectedConversation.listing_id,
        recipient_id: selectedConversation.otherUser.id,
        message_body: newMessage,
      });

      if (response.data.success) {
        setMessages([response.data.data, ...messages]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConversation = async (listingId: string, recipientId: string) => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    // Check if conversation already exists
    const existing = conversations.find((c) => c.listing_id === listingId);
    if (existing) {
      setSelectedConversation(existing);
      return;
    }

    // Navigate to messages page with listing_id
    router.push(`/messages?listing_id=${listingId}&user_id=${recipientId}`);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Please log in to view messages</p>
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen bg-gray-100">
        {/* Conversations List */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start by messaging a seller about their listing</p>
              </div>
            ) : (
              <div className="space-y-0">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.listing_id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation?.listing_id === conversation.listing_id
                        ? 'bg-primary-50 border-l-4 border-l-primary-600'
                        : ''
                    }`}
                  >
                    {/* Listing Preview */}
                    <div className="flex gap-3 mb-2">
                      {conversation.listing.image_urls.length > 0 && (
                        <div className="relative w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={conversation.listing.image_urls[0]}
                            alt={conversation.listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {conversation.listing.title}
                        </p>
                        <p className="text-primary-600 font-bold text-xs">
                          R {conversation.listing.price_zar.toLocaleString()}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Other User */}
                    <div className="flex items-center gap-2 mb-2">
                      {conversation.otherUser.profile_image_url && (
                        <Image
                          src={conversation.otherUser.profile_image_url}
                          alt={conversation.otherUser.first_name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <p className="text-sm text-gray-700 font-medium">
                        {conversation.otherUser.first_name}
                      </p>
                    </div>

                    {/* Last Message */}
                    {conversation.lastMessage && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {conversation.lastMessage.message_body}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedConversation.listing.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      with {selectedConversation.otherUser.first_name}{' '}
                      {selectedConversation.otherUser.last_name}
                    </p>
                  </div>
                  <Link
                    href={`/listings/${selectedConversation.listing_id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    View Listing
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Start the conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === session?.user?.id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === session?.user?.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message_body}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === session?.user?.id
                              ? 'text-primary-100'
                              : 'text-gray-600'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="bg-white border-t border-gray-200 p-4"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>

        {/* Mobile Message View */}
        {selectedConversation && (
          <div className="flex md:hidden flex-1 flex-col fixed inset-0 bg-white z-50">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-200 p-4">
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                ← Back to Conversations
              </button>
            </div>

            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedConversation.listing.title}
              </h2>
              <p className="text-sm text-gray-600">
                with {selectedConversation.otherUser.first_name}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === session?.user?.id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender_id === session?.user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message_body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="bg-white border-t border-gray-200 p-4"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
