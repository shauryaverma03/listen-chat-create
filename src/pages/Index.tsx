
import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import APIKeyInput from '@/components/APIKeyInput';
import { toast } from '@/components/ui/sonner';

// Default Gemini API key
const DEFAULT_GEMINI_API_KEY = 'AIzaSyARHSVHuHcvQTx_ggY1BlAfQLIbxvOqRd0';

const Index = () => {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_GEMINI_API_KEY);
  const [apiType, setApiType] = useState<'gemini' | 'openai'>('gemini');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set the default Gemini API key
    localStorage.setItem('gemini-api-key', DEFAULT_GEMINI_API_KEY);
    localStorage.setItem('ai-api-type', 'gemini');
    
    // Check for saved API key in localStorage for OpenAI (in case user wants to switch)
    const savedOpenAIKey = localStorage.getItem('openai-api-key');
    if (!savedOpenAIKey) {
      localStorage.setItem('openai-api-key', '');
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

  const handleAPIKeySubmit = (key: string, type: 'gemini' | 'openai') => {
    setApiKey(key);
    setApiType(type);
  };

  const resetApiKey = () => {
    if (apiType === 'gemini') {
      setApiKey(DEFAULT_GEMINI_API_KEY);
      localStorage.setItem('gemini-api-key', DEFAULT_GEMINI_API_KEY);
      toast.success('Reset to default Gemini API key');
    } else {
      localStorage.removeItem(`${apiType}-api-key`);
      setApiKey('');
      toast.success('API key removed');
    }
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
          Healthcare AI Assistant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Get answers to your healthcare questions • Ask about medicines and treatments{apiType === 'gemini' && " • Upload medical images for analysis"}
        </p>

        {apiKey ? (
          <div className="space-y-6">
            <ChatInterface apiKey={apiKey} apiType={apiType} />
            
            <div className="text-center">
              <button 
                onClick={resetApiKey}
                className="text-sm text-gray-500 hover:underline"
              >
                {apiType === 'gemini' ? 'Reset to Default Gemini Key' : 'Reset API Key'}
              </button>
              <span className="mx-2 text-gray-400">|</span>
              <button
                onClick={() => setApiKey('')}
                className="text-sm text-gray-500 hover:underline"
              >
                Switch API Provider
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
