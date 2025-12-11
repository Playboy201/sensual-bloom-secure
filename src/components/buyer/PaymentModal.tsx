import { useState } from 'react';
import { X, Shield, Clock, RefreshCw, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProviderProfile {
  id: string;
  user_id: string;
  description: string | null;
  age: number | null;
  province: string | null;
  services: string[];
  price_per_hour: number | null;
  photos: string[];
}

interface PaymentModalProps {
  provider: ProviderProfile;
  onClose: () => void;
}

type PaymentMethod = 'mpesa' | 'emis' | 'unitel';

const paymentMethods: { id: PaymentMethod; name: string; icon: typeof Smartphone }[] = [
  { id: 'mpesa', name: 'M-Pesa', icon: Smartphone },
  { id: 'emis', name: 'EMIS', icon: CreditCard },
  { id: 'unitel', name: 'Unitel Money', icon: Smartphone },
];

export function PaymentModal({ provider, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [hours, setHours] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = (provider.price_per_hour || 0) * hours;

  const handlePayment = async () => {
    if (!user || !selectedMethod) return;

    setIsProcessing(true);

    try {
      // Create transaction with escrow
      const escrowExpires = new Date();
      escrowExpires.setHours(escrowExpires.getHours() + 2);

      const { error } = await supabase.from('transactions').insert({
        buyer_id: user.id,
        provider_id: provider.user_id,
        amount: totalAmount,
        payment_method: selectedMethod,
        status: 'in_escrow',
        escrow_expires_at: escrowExpires.toISOString(),
      });

      if (error) throw error;

      toast.success('Pagamento em escrow! Aguarde confirmação do encontro.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md animate-scale-in">
        <PremiumCard goldBorder className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-display font-bold mb-6">
            Pagamento Seguro
          </h2>

          {/* Provider Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Perfil</span>
              <span className="font-medium">
                {provider.age ? `${provider.age} anos` : 'N/A'} • {provider.province || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Preço/hora</span>
              <span className="font-bold text-gradient-gold">
                {provider.price_per_hour?.toLocaleString()} MT
              </span>
            </div>
          </div>

          {/* Hours Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Duração (horas)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border transition-colors',
                    hours === h
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-input text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Método de Pagamento
            </label>
            <div className="space-y-2">
              {paymentMethods.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedMethod(id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                    selectedMethod === id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-input hover:border-primary/50'
                  )}
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{name}</span>
                  {selectedMethod === id && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-gradient-gold">
                {totalAmount.toLocaleString()} MT
              </span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-primary" />
              <span>Escrow Seguro</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>2h para confirmar</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span>100% Reembolso</span>
            </div>
          </div>

          {/* Warning */}
          <p className="text-xs text-muted-foreground text-center mb-4">
            O valor fica em caução segura. Se o encontro não for confirmado em 2 horas,
            o reembolso é automático.
          </p>

          {/* Submit */}
          <PremiumButton
            onClick={handlePayment}
            isLoading={isProcessing}
            disabled={!selectedMethod}
            className="w-full"
          >
            Pagar com Segurança
          </PremiumButton>
        </PremiumCard>
      </div>
    </div>
  );
}
