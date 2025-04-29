
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface APIKeyInputProps {
  onSubmit: (apiKey: string, apiType: 'gemini' | 'openai') => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [apiType, setApiType] = useState<'gemini' | 'openai'>('gemini');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error(`Please enter your ${apiType === 'gemini' ? 'Google Gemini' : 'OpenAI'} API key`);
      return;
    }
    
    // Simple validation 
    if (apiType === 'openai' && (!apiKey.startsWith('sk-') || apiKey.length < 20)) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }
    
    onSubmit(apiKey, apiType);
    toast.success('API key saved!');
    
    // Save the API key in localStorage
    localStorage.setItem(`${apiType}-api-key`, apiKey);
    localStorage.setItem('ai-api-type', apiType);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-chatbot-primary">AI API Key</CardTitle>
        <CardDescription>
          Enter your API key to use the chat assistant. Your key will be stored locally on your device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <Tabs defaultValue="gemini" className="w-full" onValueChange={(value) => setApiType(value as 'gemini' | 'openai')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gemini">Google Gemini</TabsTrigger>
                <TabsTrigger value="openai">OpenAI</TabsTrigger>
              </TabsList>
              <TabsContent value="gemini" className="pt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Use Google's Gemini AI model for chat and image analysis
                </div>
              </TabsContent>
              <TabsContent value="openai" className="pt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Use OpenAI's models for text-based chat
                </div>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <Input
                type={isVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={apiType === 'gemini' ? 'AIzaSyA...' : 'sk-...'}
                className="pr-24"
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 text-xs"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            <Button type="submit" className="w-full bg-chatbot-primary hover:bg-chatbot-secondary">
              Save API Key
            </Button>
            
            <p className="text-xs text-gray-500 mt-2">
              Your API key is stored only on your device and is never sent to our servers.
              {apiType === 'gemini' ? (
                <span> Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-chatbot-primary hover:underline">Google AI Studio</a>.</span>
              ) : (
                <span> Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-chatbot-primary hover:underline">OpenAI's website</a>.</span>
              )}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default APIKeyInput;
