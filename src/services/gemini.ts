
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageData?: string;
}

interface ImageContent {
  type: 'image';
  data: string; // base64 encoded image
}

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      // Prepare the request content
      const contents = this.formatMessagesForGemini(messages);

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini API');
      }

      const data = await response.json();
      
      // Extract the text from the Gemini response format
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  // Format messages for Gemini API format
  private formatMessagesForGemini(messages: Message[]) {
    const formattedContents: any[] = [];
    let systemMessage = '';
    
    // Extract system message
    const systemMsgs = messages.filter(msg => msg.role === 'system');
    if (systemMsgs.length > 0) {
      systemMessage = systemMsgs[0].content;
    }
    
    // Get non-system messages
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    
    for (let i = 0; i < nonSystemMessages.length; i++) {
      const message = nonSystemMessages[i];
      const parts = [];
      
      // Add system message to the first user message
      if (i === 0 && message.role === 'user' && systemMessage) {
        parts.push({ text: `${systemMessage}\n\nUser: ${message.content}` });
      } else {
        // Regular text content
        parts.push({ text: message.content });
      }
      
      // Add image if present in user message
      if (message.role === 'user' && message.imageData) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: message.imageData
          }
        });
      }
      
      formattedContents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: parts
      });
    }
    
    return formattedContents;
  }

  // Special method for Gemini with vision capabilities
  async generateResponseWithImage(text: string, imageBase64: string): Promise<string> {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini Vision API');
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini Vision API');
      }
    } catch (error) {
      console.error('Error calling Gemini Vision API:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}
