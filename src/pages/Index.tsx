
import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import APIKeyInput from '@/components/APIKeyInput';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved API key in localStorage
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    setIsLoading(false);
    
    // Check for speech synthesis voices and load them
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Check if speech recognition is supported
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser. Try using Chrome.');
    }
  }, []);

  const handleAPIKeySubmit = (key: string) => {
    setApiKey(key);
  };

  const resetApiKey = () => {
    localStorage.removeItem('openai-api-key');
    setApiKey('');
    toast.success('API key removed');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-chatbot-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-chatbot-primary mb-2">
          Voice-Enabled AI Assistant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Chat with AI using text or voice
        </p>

        {apiKey ? (
          <div className="space-y-6">
            <ChatInterface apiKey={apiKey} />
            
            <div className="text-center">
              <button 
                onClick={resetApiKey}
                className="text-sm text-gray-500 hover:underline"
              >
                Reset API Key
              </button>
            </div>
          </div>
        ) : (
          <APIKeyInput onSubmit={handleAPIKeySubmit} />
        )}
      </div>
    </div>
  );
};

export default Index;
