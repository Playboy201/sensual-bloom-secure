import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileCheck, Shield, LogOut, Check, X, Eye,
  ChevronDown, ChevronUp, Clock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PendingDocument {
  id: string;
  user_id: string;
  front_url: string | null;
  back_url: string | null;
  status: string;
  created_at: string;
}

interface PendingProvider {
  id: string;
  user_id: string;
  description: string | null;
  age: number | null;
  province: string | null;
  services: string[];
  price_per_hour: number | null;
  photos: string[];
  created_at: string;
}

type AdminTab = 'documents' | 'providers' | 'transactions';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isModerator, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('documents');
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && !isAdmin && !isModerator) {
      toast.error('Acesso não autorizado');
      navigate('/');
    }
  }, [user, isAdmin, isModerator, isLoading, navigate]);

  useEffect(() => {
    if (user && (isAdmin || isModerator)) {
      fetchData();
    }
  }, [user, isAdmin, isModerator]);

  const fetchData = async () => {
    try {
      // Fetch pending documents
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (docsError) throw docsError;
      setPendingDocuments((docs as PendingDocument[]) || []);

      // Fetch pending providers
      const { data: providers, error: providersError } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: true });

      if (providersError) throw providersError;
      setPendingProviders((providers as PendingProvider[]) || []);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoadingData(false);
    }
  };

  const approveDocument = async (docId: string, userId: string) => {
    try {
      // Update document status
      const { error: docError } = await supabase
        .from('documents')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', docId);

      if (docError) throw docError;

      // Update user profile as verified
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast.success('Documento aprovado');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao aprovar documento');
    }
  };

  const rejectDocument = async (docId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', docId);

      if (error) throw error;

      toast.success('Documento rejeitado');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao rejeitar documento');
    }
  };

  const approveProvider = async (providerId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('provider_profiles')
        .update({ 
          is_approved: true,
          is_visible: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', providerId);

      if (error) throw error;

      toast.success('Perfil aprovado');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao aprovar perfil');
    }
  };

  const rejectProvider = async (providerId: string) => {
    try {
      const { error } = await supabase
        .from('provider_profiles')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      toast.success('Perfil rejeitado');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao rejeitar perfil');
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

  const tabs: { id: AdminTab; label: string; icon: typeof Users; count: number }[] = [
    { id: 'documents', label: 'Documentos', icon: FileCheck, count: pendingDocuments.length },
    { id: 'providers', label: 'Perfis', icon: Users, count: pendingProviders.length },
    { id: 'transactions', label: 'Transações', icon: Shield, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                Admin
              </div>
            </div>
            
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
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'p-6 rounded-xl border transition-all',
                activeTab === tab.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <tab.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">{tab.label}</p>
                  <p className="text-2xl font-bold">{tab.count}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <section>
            <h2 className="text-xl font-display font-bold mb-4">
              Documentos Pendentes ({pendingDocuments.length})
            </h2>

            {pendingDocuments.length > 0 ? (
              <div className="space-y-4">
                {pendingDocuments.map((doc) => (
                  <PremiumCard key={doc.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="font-medium">ID: {doc.user_id.slice(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedItem(expandedItem === doc.id ? null : doc.id)}
                          leftIcon={expandedItem === doc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        >
                          Ver
                        </PremiumButton>
                        <PremiumButton
                          size="sm"
                          onClick={() => approveDocument(doc.id, doc.user_id)}
                          leftIcon={<Check className="w-4 h-4" />}
                        >
                          Aprovar
                        </PremiumButton>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => rejectDocument(doc.id)}
                          leftIcon={<X className="w-4 h-4" />}
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          Rejeitar
                        </PremiumButton>
                      </div>
                    </div>

                    {expandedItem === doc.id && (
                      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                        {doc.front_url && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Frente</p>
                            <img
                              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documents/${doc.front_url}`}
                              alt="Documento Frente"
                              className="w-full rounded-lg"
                            />
                          </div>
                        )}
                        {doc.back_url && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Verso</p>
                            <img
                              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documents/${doc.back_url}`}
                              alt="Documento Verso"
                              className="w-full rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </PremiumCard>
                ))}
              </div>
            ) : (
              <PremiumCard className="p-12 text-center">
                <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum documento pendente</p>
              </PremiumCard>
            )}
          </section>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <section>
            <h2 className="text-xl font-display font-bold mb-4">
              Perfis Pendentes ({pendingProviders.length})
            </h2>

            {pendingProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProviders.map((provider) => (
                  <PremiumCard key={provider.id} className="p-4">
                    <div className="space-y-4">
                      {/* Photos */}
                      {provider.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {provider.photos.slice(0, 4).map((photo, i) => (
                            <img
                              key={i}
                              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile-photos/${photo}`}
                              alt={`Foto ${i + 1}`}
                              className="w-20 h-20 rounded-lg object-cover shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Idade:</span>
                          <span className="ml-2 font-medium">{provider.age || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Província:</span>
                          <span className="ml-2 font-medium">{provider.province || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Preço/h:</span>
                          <span className="ml-2 font-medium">{provider.price_per_hour || 'N/A'} MT</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Serviços:</span>
                          <span className="ml-2 font-medium">{provider.services.length}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {provider.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {provider.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <PremiumButton
                          size="sm"
                          onClick={() => approveProvider(provider.id, provider.user_id)}
                          leftIcon={<Check className="w-4 h-4" />}
                          className="flex-1"
                        >
                          Aprovar
                        </PremiumButton>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => rejectProvider(provider.id)}
                          leftIcon={<X className="w-4 h-4" />}
                          className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                        >
                          Rejeitar
                        </PremiumButton>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            ) : (
              <PremiumCard className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum perfil pendente</p>
              </PremiumCard>
            )}
          </section>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <section>
            <h2 className="text-xl font-display font-bold mb-4">
              Gestão de Transações
            </h2>

            <PremiumCard className="p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Sistema de gestão de transações em desenvolvimento
              </p>
            </PremiumCard>
          </section>
        )}
      </div>
    </div>
  );
}
