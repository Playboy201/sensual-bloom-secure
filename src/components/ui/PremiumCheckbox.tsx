import { forwardRef, InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const PremiumCheckbox = forwardRef<HTMLInputElement, PremiumCheckboxProps>(
  ({ label, description, error, className, checked, ...props }, ref) => {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
        <div className="relative mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          
          <div
            className={cn(
              'w-5 h-5 rounded border-2 transition-all duration-200',
              'flex items-center justify-center',
              'group-hover:border-primary/50',
              checked
                ? 'bg-primary border-primary'
                : 'bg-input border-border',
              error && 'border-destructive'
            )}
          >
            <Check
              className={cn(
                'w-3.5 h-3.5 text-primary-foreground transition-all duration-200',
                checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              )}
            />
          </div>
        </div>

        <div className="flex-1">
          <span
            className={cn(
              'text-sm font-medium',
              error ? 'text-destructive' : 'text-foreground'
            )}
          >
            {label}
          </span>
          
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
          
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>
      </label>
    );
  }
);

PremiumCheckbox.displayName = 'PremiumCheckbox';
