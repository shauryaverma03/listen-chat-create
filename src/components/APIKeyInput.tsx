
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

interface APIKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }
    
    // Simple validation to ensure it at least looks like an OpenAI key
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }
    
    onSubmit(apiKey);
    toast.success('API key saved!');
    
    // Save the API key in localStorage
    localStorage.setItem('openai-api-key', apiKey);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-chatbot-primary">OpenAI API Key</CardTitle>
        <CardDescription>
          Enter your OpenAI API key to use the chat assistant. Your key will be stored locally on your device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Input
                type={isVisible ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
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
              Your OpenAI API key is stored only on your device and is never sent to our servers.
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-chatbot-primary hover:underline">OpenAI's website</a>.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default APIKeyInput;
