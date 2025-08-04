import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
}

export default function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a blob URL for preview
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {value ? (
        <Card className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </Card>
      ) : (
        <Card
          className="aspect-square flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 cursor-pointer transition-colors"
          onClick={handleClick}
        >
          <div className="text-center p-4">
            <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <Button type="button" variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Gambar
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG, max 5MB
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}