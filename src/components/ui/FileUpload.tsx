import { useState, useRef } from 'react';
import { Upload, X, FileText, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  value?: File | null;
  onChange: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  label,
  description,
  accept = 'image/*',
  maxSize = 5,
  value,
  onChange,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    setError(null);

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Ficheiro muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center p-6',
          'cursor-pointer hover:border-primary/50',
          isDragging && 'border-primary bg-primary/5',
          value && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          !value && !isDragging && 'border-border bg-input/50'
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {value && preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className={cn(
                'absolute -top-2 -right-2 p-1 rounded-full',
                'bg-destructive text-destructive-foreground',
                'hover:bg-destructive/90 transition-colors'
              )}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-xs">
              <Check className="w-3 h-3" />
              Carregado
            </div>
          </div>
        ) : (
          <>
            <Upload className={cn(
              'w-10 h-10 mb-3',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
            <p className="text-sm text-center text-muted-foreground">
              Arraste ou clique para carregar
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Máximo {maxSize}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
