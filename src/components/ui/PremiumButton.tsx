import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants = {
  primary: cn(
    'bg-primary text-primary-foreground',
    'hover:bg-primary/90',
    'shadow-emerald'
  ),
  secondary: cn(
    'bg-secondary text-secondary-foreground',
    'hover:bg-secondary/90',
    'shadow-gold'
  ),
  outline: cn(
    'bg-transparent border-2 border-primary text-primary',
    'hover:bg-primary/10'
  ),
  ghost: cn(
    'bg-transparent text-foreground',
    'hover:bg-muted'
  ),
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-semibold rounded-lg',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          'hover:-translate-y-0.5 hover:shadow-lg',
          'active:translate-y-0',
          'relative overflow-hidden',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Shimmer effect on hover */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-300',
            'hover:opacity-100',
            'pointer-events-none'
          )}
          style={{
            background: 'linear-gradient(135deg, transparent 0%, hsl(0 0% 100% / 0.1) 50%, transparent 100%)',
          }}
        />

        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
