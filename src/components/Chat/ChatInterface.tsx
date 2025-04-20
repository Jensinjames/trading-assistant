"use client";

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChatMessage, MessageCategory } from '@/types/assistant';
import MessageReactions from './MessageReactions';
import Image from 'next/image';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StaticImageData } from 'next/image';

interface ChatInterfaceProps {
  threadId?: string;
}

const MESSAGE_CATEGORIES: MessageCategory[] = ['general', 'analysis', 'advice', 'alert'];

export default function ChatInterface({ threadId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewThread = async (title: string) => {
    try {
      const response = await fetch('/api/assistant/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      return data.thread;
    } catch (error) {
      console.error('Error creating thread:', error);
      return null;
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) throw new Error('Failed to add reaction');

      const { reactions } = await response.json();
      
      // Update the messages state with the new reactions
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, reactions } : msg
        )
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const sendMessage = async (content: string) => {
    if ((!content.trim() && !selectedImage) || !session) return;

    setIsLoading(true);
    let currentThreadId = threadId;
    let imageUrl = null;

    try {
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      if (!currentThreadId) {
        const thread = await createNewThread('Trading Discussion');
        if (!thread) throw new Error('Failed to create thread');
        currentThreadId = thread.id;
      }

      const response = await fetch('/api/assistant/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThreadId,
          content,
          category: selectedCategory,
          imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages(prev => [...prev, data.message]);
      setInput('');
      clearImage();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      category: 'general',
      createdAt: new Date(),
      reactions: [],
      userId: session?.user?.id || '',
      threadId: threadId || '',
    };

    if (selectedImage) {
      const imageUrl = await uploadImage(selectedImage);
      newMessage.imageUrl = imageUrl;
    }

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    clearImage();

    await sendMessage(input);
  };

  const getCategoryIcon = (category: MessageCategory) => {
    switch (category) {
      case 'analysis': return '📊';
      case 'advice': return '💡';
      case 'alert': return '⚠️';
      default: return '💬';
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className="max-w-[70%]">
              <div className={`rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{getCategoryIcon(message.category)}</span>
                  <span className="text-sm opacity-75 capitalize">{message.category}</span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={message.imageUrl}
                      alt="Message attachment"
                      width={300}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions}
                onReact={(emoji) => handleReaction(message.id, emoji)}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="space-y-2">
          <div className="flex space-x-2">
            {MESSAGE_CATEGORIES.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
          {imagePreview && (
            <div className="relative w-32 h-32">
              <Image
                src={imagePreview}
                alt="Upload preview"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 p-4 border-t">
            {selectedImage && (
              <div className="relative">
                <Image
                  src={imagePreview as string | StaticImageData}
                  alt="Selected image"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <label htmlFor="image-upload" className="sr-only">Upload image</label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <button
              onClick={() => document.getElementById('image-upload')?.click()}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Upload image"
            >
              <PhotoIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trading strategies..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 