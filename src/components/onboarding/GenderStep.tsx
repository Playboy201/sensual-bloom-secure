import { ArrowLeft, User, Users, HelpCircle } from 'lucide-react';
import { GenderType } from '@/types';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

interface GenderStepProps {
  selectedGender: GenderType | null;
  onSelect: (gender: GenderType) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

const genderOptions: { value: GenderType; label: string; icon: typeof User }[] = [
  { value: 'male', label: 'Masculino', icon: User },
  { value: 'female', label: 'Feminino', icon: Users },
  { value: 'other', label: 'Outro / Prefiro não dizer', icon: HelpCircle },
];

export function GenderStep({ selectedGender, onSelect, isSubmitting, onBack }: GenderStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md animate-fade-in-up">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <Logo size="md" className="mb-6" />

        <PremiumCard className="p-6 sm:p-8">
          <h2 className="text-xl font-display font-bold text-center mb-2">
            Qual é o seu género?
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Esta informação é confidencial e ajuda-nos a personalizar a sua experiência
          </p>

          <div className="space-y-3">
            {genderOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => !isSubmitting && onSelect(value)}
                disabled={isSubmitting}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
                  'hover:border-primary/50 hover:bg-primary/5',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  selectedGender === value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-input/50'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  selectedGender === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-base font-medium">{label}</span>
                
                {isSubmitting && selectedGender === value && (
                  <div className="ml-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
