
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Mic, MicOff, Send, Volume2, VolumeOff } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ImageUpload from './ImageUpload';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { OpenAIService, Message as OpenAIMessage } from '@/services/openai';
import { GeminiService, Message as GeminiMessage } from '@/services/gemini';

interface ChatInterfaceProps {
  apiKey: string;
  apiType: 'gemini' | 'openai';
}

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  imageData?: string; // For storing base64 image data
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey, apiType }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'You are a helpful, friendly assistant. Keep responses concise and engaging. If a user uploads an image, describe what you see and respond to any questions about it.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [imageData, setImageData] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking, error: ttsError } = useTextToSpeech();
  const [aiService, setAIService] = useState<OpenAIService | GeminiService | null>(null);

  // Initialize AI service
  useEffect(() => {
    if (apiKey) {
      if (apiType === 'gemini') {
        setAIService(new GeminiService(apiKey));
      } else {
        setAIService(new OpenAIService(apiKey));
      }
    } else {
      setAIService(null);
    }
  }, [apiKey, apiType]);

  // Speech recognition integration with improved accuracy
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
      // Don't auto-submit to allow user to correct any recognition errors
    }
  }, [isListening, transcript]);

  // Error handling
  useEffect(() => {
    if (speechError) {
      toast.error(`Speech recognition error: ${speechError}`);
    }
    if (ttsError) {
      toast.error(`Text-to-speech error: ${ttsError}`);
    }
  }, [speechError, ttsError]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  const handleImageSelect = (base64Image: string | null) => {
    setImageData(base64Image);
  };

  const sendMessage = async (userMessage: string) => {
    if (!aiService) {
      toast.error('API key is missing');
      return;
    }

    // Add user message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      imageData: imageData || undefined
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    
    // Clear input, transcript, and image
    setInputValue('');
    resetTranscript();
    
    // Get AI response
    setIsLoading(true);
    try {
      let response: string;
      
      if (apiType === 'gemini') {
        const geminiService = aiService as GeminiService;
        if (imageData) {
          // Use vision model if image is attached
          response = await geminiService.generateResponseWithImage(userMessage, imageData);
          setImageData(null); // Clear image after sending
        } else {
          // Convert our messages to Gemini format
          const geminiMessages: GeminiMessage[] = updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          response = await geminiService.generateResponse(geminiMessages);
        }
      } else {
        // Convert our messages to OpenAI format
        const openaiMessages: OpenAIMessage[] = updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        response = await (aiService as OpenAIService).generateResponse(openaiMessages);
      }
      
      // Add AI message
      const newAiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages([...updatedMessages, newAiMessage]);
      
      // Speak the response if audio is enabled
      if (audioEnabled) {
        speak(response);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to get a response');
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
      setImageData(null); // Clear the image data after sending
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = inputValue.trim();
    if (message) {
      sendMessage(message);
    }
  };

  // Filter out system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col overflow-hidden">
      <div className="bg-chatbot-primary text-white p-4 text-center">
        <h2 className="text-xl font-semibold">AI Chat Assistant</h2>
        <p className="text-sm mt-1">
          {apiType === 'gemini' ? 'Powered by Google Gemini AI' : 'Powered by OpenAI'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-center">
              Start a conversation by typing a message or pressing the microphone button.
              {apiType === 'gemini' && <span className="block mt-2">You can also upload images for analysis!</span>}
            </p>
          </div>
        ) : (
          displayMessages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              isUser={msg.role === 'user'}
              timestamp={msg.timestamp}
              imageData={msg.imageData}
            />
          ))
        )}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-chatbot-primary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-chatbot-primary animate-pulse delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-chatbot-primary animate-pulse delay-300"></div>
            </div>
            <span className="text-sm text-gray-500">AI is thinking...</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        {apiType === 'gemini' && (
          <div className="mb-2">
            <ImageUpload onImageSelect={handleImageSelect} />
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleMic}
            className={isListening ? 'bg-red-100 text-red-500 border-red-300' : ''}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            className="flex-1"
          />
          
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleAudio}
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeOff size={18} />}
          </Button>
          
          <Button type="submit" disabled={!inputValue.trim() && !imageData || isLoading}>
            <Send size={18} />
          </Button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-xs text-center text-gray-500">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
            Listening... (Click the microphone to stop and edit if needed)
          </div>
        )}
      </form>
    </Card>
  );
};

export default ChatInterface;
