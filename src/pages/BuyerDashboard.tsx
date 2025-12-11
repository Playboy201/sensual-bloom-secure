import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, Star, Shield, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { ProviderCard } from '@/components/buyer/ProviderCard';
import { FilterPanel } from '@/components/buyer/FilterPanel';
import { PaymentModal } from '@/components/buyer/PaymentModal';
import { toast } from 'sonner';

interface ProviderProfile {
  id: string;
  user_id: string;
  description: string | null;
  age: number | null;
  province: string | null;
  services: string[];
  price_per_hour: number | null;
  photos: string[];
  is_approved: boolean;
  is_visible: boolean;
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut, isAdmin, isModerator } = useAuth();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderProfile[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    province: '',
    minAge: 18,
    maxAge: 99,
    minPrice: 0,
    maxPrice: 10000,
    services: [] as string[],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && profile && profile.account_type !== 'buyer') {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [providers, searchQuery, filters]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('is_approved', true)
        .eq('is_visible', true);

      if (error) throw error;
      setProviders((data as ProviderProfile[]) || []);
    } catch (error: any) {
      toast.error('Erro ao carregar perfis');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const applyFilters = () => {
    let result = [...providers];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.description?.toLowerCase().includes(query) ||
          p.province?.toLowerCase().includes(query) ||
          p.services.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Province filter
    if (filters.province) {
      result = result.filter((p) => p.province === filters.province);
    }

    // Age filter
    result = result.filter(
      (p) => p.age && p.age >= filters.minAge && p.age <= filters.maxAge
    );

    // Price filter
    result = result.filter(
      (p) =>
        p.price_per_hour &&
        p.price_per_hour >= filters.minPrice &&
        p.price_per_hour <= filters.maxPrice
    );

    // Services filter
    if (filters.services.length > 0) {
      result = result.filter((p) =>
        filters.services.some((s) => p.services.includes(s))
      );
    }

    setFilteredProviders(result);
  };

  const handleContactProvider = (provider: ProviderProfile) => {
    setSelectedProvider(provider);
    setShowPaymentModal(true);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Logo size="sm" />
            
            <div className="flex-1 max-w-md">
              <PremiumInput
                type="search"
                placeholder="Pesquisar por serviço, localização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>

            <div className="flex items-center gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Filtros</span>
              </PremiumButton>
              
              {(isAdmin || isModerator) && (
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </PremiumButton>
              )}
              
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Sair</span>
              </PremiumButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="w-64 shrink-0 hidden lg:block">
              <FilterPanel filters={filters} setFilters={setFilters} />
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Featured Section */}
            <section className="mb-8">
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary" />
                Destaques do Dia
              </h2>
              
              {isLoadingProviders ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProviders.slice(0, 4).map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onContact={() => handleContactProvider(provider)}
                      featured
                    />
                  ))}
                </div>
              ) : (
                <PremiumCard className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum perfil encontrado. Tente ajustar os filtros.
                  </p>
                </PremiumCard>
              )}
            </section>

            {/* All Providers */}
            <section>
              <h2 className="text-xl font-display font-bold mb-4">
                Todos os Perfis ({filteredProviders.length})
              </h2>

              {filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onContact={() => handleContactProvider(provider)}
                    />
                  ))}
                </div>
              ) : (
                <PremiumCard className="p-12 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum perfil disponível</h3>
                  <p className="text-muted-foreground">
                    Novos perfis estão a ser verificados. Volte mais tarde.
                  </p>
                </PremiumCard>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedProvider && (
        <PaymentModal
          provider={selectedProvider}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedProvider(null);
          }}
        />
      )}
    </div>
  );
}
