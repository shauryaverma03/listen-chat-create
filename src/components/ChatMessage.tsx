
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  imageData?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp = new Date(), imageData }) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-chatbot-primary text-white rounded-br-none"
            : "bg-chatbot-assistant rounded-bl-none"
        )}
      >
        {imageData && (
          <div className="mb-2">
            <img 
              src={`data:image/jpeg;base64,${imageData}`} 
              alt="Uploaded medical image" 
              className="max-w-full rounded max-h-60 object-contain" 
            />
          </div>
        )}
        <p className="text-sm sm:text-base">{message}</p>
        <div className={cn(
          "text-xs mt-1 opacity-70",
          isUser ? "text-white/70" : "text-gray-500"
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
