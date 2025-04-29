
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ImageUploadProps {
  onImageSelect: (base64Image: string | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      onImageSelect(null);
      return;
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract just the base64 part
      const base64String = result.split(',')[1];
      setPreview(result);
      onImageSelect(base64String);
    };
    reader.onerror = () => {
      toast.error('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="mb-2">
      <input 
        type="file" 
        accept="image/*" 
        id="image-upload" 
        className="hidden" 
        onChange={handleImageChange}
      />
      
      {!preview ? (
        <label htmlFor="image-upload" className="cursor-pointer">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs"
          >
            <ImageIcon size={16} className="mr-1" />
            Attach Image
          </Button>
        </label>
      ) : (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Selected" 
            className="w-20 h-20 object-cover rounded-md" 
          />
          <Button 
            type="button"
            variant="destructive" 
            size="icon" 
            className="absolute -top-2 -right-2 h-5 w-5" 
            onClick={clearImage}
          >
            <X size={12} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
