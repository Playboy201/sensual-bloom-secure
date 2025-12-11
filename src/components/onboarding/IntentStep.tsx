import { ArrowLeft, Search, Star, Shield, RefreshCw } from 'lucide-react';
import { AccountType } from '@/types';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

interface IntentStepProps {
  selectedType: AccountType | null;
  onSelect: (type: AccountType) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

const intentOptions: {
  value: AccountType;
  title: string;
  description: string;
  icon: typeof Search;
  color: 'emerald' | 'gold';
}[] = [
  {
    value: 'buyer',
    title: 'Quero Contratar Companhia',
    description: 'Encontre perfis verificados com pagamento protegido',
    icon: Search,
    color: 'emerald',
  },
  {
    value: 'provider',
    title: 'Quero Oferecer Serviços',
    description: 'Crie seu perfil e receba pagamentos seguros',
    icon: Star,
    color: 'gold',
  },
];

export function IntentStep({ selectedType, onSelect, isSubmitting, onBack }: IntentStepProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-2xl animate-fade-in-up">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <Logo size="md" className="mb-6" />

        <h2 className="text-2xl font-display font-bold text-center mb-2">
          O que pretende fazer?
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Escolha como deseja usar a plataforma
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {intentOptions.map(({ value, title, description, icon: Icon, color }) => (
            <button
              key={value}
              onClick={() => !isSubmitting && onSelect(value)}
              disabled={isSubmitting}
              className={cn(
                'text-left p-6 rounded-xl border-2 transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
                selectedType === value
                  ? color === 'emerald'
                    ? 'border-primary bg-primary/10 shadow-emerald focus:ring-primary'
                    : 'border-secondary bg-secondary/10 shadow-gold focus:ring-secondary'
                  : 'border-border bg-card hover:border-primary/50 focus:ring-primary/50'
              )}
            >
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center mb-4',
                color === 'emerald' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}>
                <Icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              
              {isSubmitting && selectedType === value && (
                <div className="mt-4 flex items-center gap-2 text-primary">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">A processar...</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <PremiumCard className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-5 h-5 text-primary" />
              <span>100% Reembolsável</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-5 h-5 text-secondary" />
              <span>Perfis Verificados</span>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
