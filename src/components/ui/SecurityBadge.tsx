import { Shield, Lock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityBadgeProps {
  variant?: 'ssl' | 'encrypted' | 'privacy';
  className?: string;
}

const badges = {
  ssl: {
    icon: Shield,
    label: 'SSL 256-bit',
  },
  encrypted: {
    icon: Lock,
    label: 'Dados Encriptados',
  },
  privacy: {
    icon: Eye,
    label: 'Privacidade Garantida',
  },
};

export function SecurityBadge({ variant = 'ssl', className }: SecurityBadgeProps) {
  const { icon: Icon, label } = badges[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        'bg-primary/10 text-primary border border-primary/20',
        'transition-all duration-200 hover:bg-primary/15',
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}

export function SecurityBadges({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
      <SecurityBadge variant="ssl" />
      <SecurityBadge variant="encrypted" />
      <SecurityBadge variant="privacy" />
    </div>
  );
}
