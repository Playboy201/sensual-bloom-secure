import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  goldBorder?: boolean;
  hoverable?: boolean;
}

export function PremiumCard({
  children,
  className,
  goldBorder = false,
  hoverable = false,
}: PremiumCardProps) {
  const cardContent = (
    <div
      className={cn(
        'bg-card rounded-xl p-6',
        'relative overflow-hidden',
        hoverable && 'transition-all duration-300 hover:shadow-elevated hover:-translate-y-1',
        !goldBorder && 'border border-border shadow-card',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--gold) / 0.05) 0%, transparent 50%)',
        }}
      />
      
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (goldBorder) {
    return (
      <div className="p-[1px] rounded-xl bg-gradient-to-br from-gold via-gold-light to-gold-dark shadow-gold">
        {cardContent}
      </div>
    );
  }

  return cardContent;
}
