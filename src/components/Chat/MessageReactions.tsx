"use client";

import { useState } from 'react';
import { MessageReaction } from '@/types/assistant';

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  onReact: (emoji: string) => Promise<void>;
}

const AVAILABLE_REACTIONS = ['👍', '❤️', '🎯', '💡', '🤔'];

export default function MessageReactions({ messageId, reactions, onReact }: MessageReactionsProps) {
  const [isSelectingEmoji, setIsSelectingEmoji] = useState(false);

  const handleReact = async (emoji: string) => {
    await onReact(emoji);
    setIsSelectingEmoji(false);
  };

  const getReactionCount = (emoji: string) => {
    return reactions.filter(r => r.emoji === emoji).length;
  };

  return (
    <div className="flex items-center space-x-2 mt-2">
      {/* Display existing reactions */}
      {AVAILABLE_REACTIONS.map(emoji => {
        const count = getReactionCount(emoji);
        if (count === 0) return null;
        
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className="flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1"
          >
            <span>{emoji}</span>
            <span className="text-gray-600">{count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setIsSelectingEmoji(!isSelectingEmoji)}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="text-xl">+</span>
        </button>

        {/* Emoji picker */}
        {isSelectingEmoji && (
          <div className="absolute bottom-8 left-0 bg-white shadow-lg rounded-lg p-2 flex space-x-2">
            {AVAILABLE_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="hover:bg-gray-100 p-1 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 