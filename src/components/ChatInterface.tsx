
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Mic, MicOff, Send, Volume2, VolumeOff } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { OpenAIService, Message } from '@/services/openai';

interface ChatInterfaceProps {
  apiKey: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful, friendly assistant. Keep responses concise and engaging.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSpeaking, error: ttsError } = useTextToSpeech();
  const [openAIService, setOpenAIService] = useState<OpenAIService | null>(null);
  const [hasAPIKey, setHasAPIKey] = useState(!!apiKey);

  // Initialize OpenAI service
  useEffect(() => {
    if (apiKey) {
      setOpenAIService(new OpenAIService(apiKey));
      setHasAPIKey(true);
    } else {
      setHasAPIKey(false);
    }
  }, [apiKey]);

  // Speech recognition integration
  useEffect(() => {
    if (transcript && !isListening) {
      setInputValue(transcript);
      if (transcript.trim()) {
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
      }
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

  const sendMessage = async (userMessage: string) => {
    if (!openAIService) {
      toast.error('OpenAI API key is missing');
      return;
    }

    // Add user message to chat
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);
    
    // Clear input and transcript
    setInputValue('');
    resetTranscript();
    
    // Get AI response
    setIsLoading(true);
    try {
      const response = await openAIService.generateResponse(updatedMessages);
      
      // Add AI message
      const newMessages = [...updatedMessages, { role: 'assistant', content: response }];
      setMessages(newMessages);
      
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
        {!hasAPIKey && (
          <p className="text-sm mt-1 text-red-200">Please enter your OpenAI API key</p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-center">
              Start a conversation by typing a message or pressing the microphone button.
            </p>
          </div>
        ) : (
          displayMessages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.content}
              isUser={msg.role === 'user'}
              timestamp={new Date()}
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
            disabled={isListening}
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
          
          <Button type="submit" disabled={!inputValue.trim() || isLoading}>
            <Send size={18} />
          </Button>
        </div>
        
        {isListening && (
          <div className="mt-2 text-xs text-center text-gray-500">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
            Listening... (Click the microphone to stop)
          </div>
        )}
      </form>
    </Card>
  );
};

export default ChatInterface;
