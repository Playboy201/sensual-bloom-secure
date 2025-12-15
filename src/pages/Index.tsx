import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { SecurityBadges } from '@/components/ui/SecurityBadge';

export default function Index() {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  // Mostrar loading apenas durante o carregamento inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(340 30% 8%) 50%, hsl(0 0% 3%) 100%)'
      }}
    >
      <div className="w-full max-w-lg text-center">
        <div className="animate-fade-in-up">
          <Logo size="lg" className="mb-8" />
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <PremiumCard goldBorder className="p-8 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4 text-primary">
              <Shield className="w-6 h-6" />
              <span className="text-sm font-medium">100% Seguro e Confidencial</span>
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Experiência Premium
            </h2>
            
            <p className="text-muted-foreground mb-8">
              Companhia exclusiva com total segurança, privacidade e pagamentos protegidos por sistema de escrow.
            </p>

            <div className="space-y-3">
              {user ? (
                <>
                  {profile?.account_type === 'buyer' ? (
                    <PremiumButton 
                      onClick={() => navigate('/buyer')} 
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="w-full"
                    >
                      Ir para Dashboard
                    </PremiumButton>
                  ) : profile?.account_type === 'provider' ? (
                    <PremiumButton 
                      onClick={() => navigate('/provider')} 
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="w-full"
                    >
                      Ir para Dashboard
                    </PremiumButton>
                  ) : (
                    <PremiumButton 
                      onClick={() => navigate('/onboarding')} 
                      rightIcon={<Sparkles className="w-5 h-5" />}
                      className="w-full"
                    >
                      Continuar Registo
                    </PremiumButton>
                  )}
                </>
              ) : (
                <>
                  <PremiumButton 
                    onClick={() => navigate('/auth')} 
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full"
                  >
                    Entrar com Segurança
                  </PremiumButton>
                  <PremiumButton 
                    onClick={() => navigate('/auth?mode=signup')} 
                    variant="outline"
                    className="w-full"
                  >
                    Criar Nova Conta
                  </PremiumButton>
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gradient-gold">100%</p>
                  <p className="text-xs text-muted-foreground">Reembolsável</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gradient-gold">24h</p>
                  <p className="text-xs text-muted-foreground">Aprovação</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gradient-gold">SSL</p>
                  <p className="text-xs text-muted-foreground">Encriptado</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <SecurityBadges />
        </div>
        
        <p className="text-xs text-muted-foreground mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          Apenas para maiores de 18 anos. Moçambique 🇲🇿 e Angola 🇦🇴
        </p>
      </div>
    </div>
  );
}
