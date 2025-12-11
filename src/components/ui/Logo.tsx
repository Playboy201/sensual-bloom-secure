import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
};

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <h1
        className={cn(
          'font-display font-bold tracking-tight',
          'text-gradient-gold',
          sizes[size]
        )}
      >
        Sensual Bloom
      </h1>
      <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
        Premium Experience
      </p>
    </div>
  );
}
