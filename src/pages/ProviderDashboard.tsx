import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, DollarSign, Eye, EyeOff, Settings, LogOut, 
  CheckCircle, XCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProviderProfile {
  id: string;
  description: string | null;
  age: number | null;
  province: string | null;
  services: string[];
  price_per_hour: number | null;
  photos: string[];
  is_approved: boolean;
  is_visible: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut } = useAuth();
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && profile && profile.account_type !== 'provider') {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (providerError) throw providerError;
      
      if (!providerData) {
        // No profile yet, redirect to setup
        navigate('/provider/setup');
        return;
      }

      setProviderProfile(providerData as ProviderProfile);

      // Fetch transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transError) throw transError;
      setTransactions((transData as Transaction[]) || []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleVisibility = async () => {
    if (!user || !providerProfile) return;

    try {
      const { error } = await supabase
        .from('provider_profiles')
        .update({ is_visible: !providerProfile.is_visible })
        .eq('user_id', user.id);

      if (error) throw error;

      setProviderProfile({ ...providerProfile, is_visible: !providerProfile.is_visible });
      toast.success(providerProfile.is_visible ? 'Perfil ocultado' : 'Perfil visível');
    } catch (error: any) {
      toast.error('Erro ao atualizar visibilidade');
    }
  };

  const confirmTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast.success('Encontro confirmado! Pagamento será liberado.');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao confirmar encontro');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingTransactions = transactions.filter(t => t.status === 'in_escrow');
  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            
            <div className="flex items-center gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/provider/setup')}
                leftIcon={<Settings className="w-4 h-4" />}
              >
                Editar Perfil
              </PremiumButton>
              
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sair
              </PremiumButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Status Alert */}
        {providerProfile && !providerProfile.is_approved && (
          <div className="mb-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-medium">Perfil em análise</p>
              <p className="text-sm text-muted-foreground">
                O seu perfil está a ser verificado. Isto pode levar 24-48 horas.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <PremiumCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ganho</p>
                <p className="text-2xl font-bold">{totalEarnings.toLocaleString()} MT</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingTransactions.length}</p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  providerProfile?.is_visible ? "bg-primary/10" : "bg-muted"
                )}>
                  {providerProfile?.is_visible ? (
                    <Eye className="w-6 h-6 text-primary" />
                  ) : (
                    <EyeOff className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visibilidade</p>
                  <p className="font-bold">
                    {providerProfile?.is_visible ? 'Visível' : 'Oculto'}
                  </p>
                </div>
              </div>
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={toggleVisibility}
                disabled={!providerProfile?.is_approved}
              >
                {providerProfile?.is_visible ? 'Ocultar' : 'Mostrar'}
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>

        {/* Pending Transactions */}
        <section className="mb-8">
          <h2 className="text-xl font-display font-bold mb-4">
            Encontros Pendentes
          </h2>

          {pendingTransactions.length > 0 ? (
            <div className="space-y-3">
              {pendingTransactions.map((trans) => (
                <PremiumCard key={trans.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{trans.amount.toLocaleString()} MT</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(trans.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                        Em Escrow
                      </span>
                      <PremiumButton
                        size="sm"
                        onClick={() => confirmTransaction(trans.id)}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Confirmar
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          ) : (
            <PremiumCard className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum encontro pendente</p>
            </PremiumCard>
          )}
        </section>

        {/* Transaction History */}
        <section>
          <h2 className="text-xl font-display font-bold mb-4">
            Histórico de Transações
          </h2>

          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((trans) => (
                <PremiumCard key={trans.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        trans.status === 'completed' && "bg-primary/10",
                        trans.status === 'refunded' && "bg-destructive/10",
                        trans.status === 'in_escrow' && "bg-secondary/10"
                      )}>
                        {trans.status === 'completed' && <CheckCircle className="w-5 h-5 text-primary" />}
                        {trans.status === 'refunded' && <RefreshCw className="w-5 h-5 text-destructive" />}
                        {trans.status === 'in_escrow' && <Clock className="w-5 h-5 text-secondary" />}
                      </div>
                      <div>
                        <p className="font-medium">{trans.amount.toLocaleString()} MT</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trans.created_at).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      trans.status === 'completed' && "bg-primary/10 text-primary",
                      trans.status === 'refunded' && "bg-destructive/10 text-destructive",
                      trans.status === 'in_escrow' && "bg-secondary/10 text-secondary"
                    )}>
                      {trans.status === 'completed' && 'Concluído'}
                      {trans.status === 'refunded' && 'Reembolsado'}
                      {trans.status === 'in_escrow' && 'Em Escrow'}
                      {trans.status === 'pending' && 'Pendente'}
                    </span>
                  </div>
                </PremiumCard>
              ))}
            </div>
          ) : (
            <PremiumCard className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma transação ainda</p>
            </PremiumCard>
          )}
        </section>
      </div>
    </div>
  );
}
