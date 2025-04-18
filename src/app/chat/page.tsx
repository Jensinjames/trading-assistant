"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import {
  PlusIcon,
  TrashIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string;
}

interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const threadParam = searchParams.get('thread');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        
        recognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput(transcript);
        };
      }
      
      synth.current = window.speechSynthesis;
    }
  }, []);

  // Load chat threads
  useEffect(() => {
    fetchThreads();
  }, []);

  // If thread param exists, load that thread
  useEffect(() => {
    if (threadParam && threads.length > 0) {
      const thread = threads.find(t => t.id === threadParam);
      if (thread) {
        loadThread(thread.id);
      }
    }
  }, [threadParam, threads]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/threads');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat threads');
      }
      
      const data = await response.json();
      setThreads(data);
      
      // If we have threads but no current thread, set the most recent one
      if (data.length > 0 && !currentThread) {
        await loadThread(data[0].id);
      } else if (data.length === 0) {
        await createNewThread();
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load chat thread');
      }
      
      const thread = await response.json();
      setCurrentThread(thread);
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  const createNewThread = async () => {
    try {
      const response = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialMessage: '' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new chat thread');
      }
      
      const newThread = await response.json();
      setThreads(prev => [newThread, ...prev]);
      setCurrentThread(newThread);
    } catch (error) {
      console.error('Error creating new thread:', error);
    }
  };

  const deleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chat thread');
      }
      
      setThreads(prev => prev.filter(thread => thread.id !== threadId));
      
      // If the deleted thread is the current one, switch to another thread or create a new one
      if (currentThread && currentThread.id === threadId) {
        const remainingThreads = threads.filter(thread => thread.id !== threadId);
        if (remainingThreads.length > 0) {
          await loadThread(remainingThreads[0].id);
        } else {
          await createNewThread();
        }
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && !selectedImage) || isSending || !currentThread) return;
    
    setIsSending(true);
    
    try {
      // First, add the user's message to the thread
      const messageResponse = await fetch(`/api/chat/threads/${currentThread.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: 'user', 
          content: input,
          image: selectedImage
        })
      });
      
      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }

      // Get AI response
      const apiEndpoint = selectedImage ? '/api/chat/vision' : '/api/chat';
      const aiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...currentThread.messages,
            { role: 'user', content: input || 'What do you see in this image?' }
          ],
          image: selectedImage
        })
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiReply = await aiResponse.json();
      
      // Add AI response to thread
      await fetch(`/api/chat/threads/${currentThread.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'assistant',
          content: aiReply.content
        })
      });
      
      setInput('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload thread to get all messages
      await loadThread(currentThread.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      recognition.current?.start();
    } else {
      recognition.current?.stop();
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-9rem)]">
        {/* Sidebar with chat threads */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-medium text-gray-800 dark:text-white">Chat History</h2>
            <button 
              onClick={createNewThread}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="New chat"
            >
              <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => loadThread(thread.id)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center ${
                  currentThread?.id === thread.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate w-44">
                    {thread.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(thread.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteThread(thread.id, e)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label="Delete thread"
                >
                  <TrashIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
            </div>
          ) : currentThread ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="font-medium text-gray-800 dark:text-white">{currentThread.title}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentThread.messages.map(message => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-100 dark:bg-blue-900 dark:text-white ml-auto'
                        : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded content"
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {formatDate(message.timestamp)}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={sendMessage} className="space-y-4">
                  {selectedImage && (
                    <div className="relative">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        aria-label="Remove image"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="image-upload"
                      aria-label="Upload image"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label="Upload image"
                    >
                      <PhotoIcon className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={`p-2 ${
                        voiceEnabled
                          ? 'text-red-500 hover:text-red-700'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                      aria-label={voiceEnabled ? "Stop voice recording" : "Start voice recording"}
                    >
                      {voiceEnabled ? (
                        <StopCircleIcon className="h-6 w-6" />
                      ) : (
                        <MicrophoneIcon className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className={`p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${
                        isSending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label="Send message"
                    >
                      <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No thread selected</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
