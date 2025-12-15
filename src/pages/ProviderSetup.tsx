import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Shield, Upload, User, DollarSign, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumCheckbox } from '@/components/ui/PremiumCheckbox';
import { Logo } from '@/components/ui/Logo';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { FileUpload } from '@/components/ui/FileUpload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'Dados' },
  { label: 'Serviços' },
  { label: 'Fotos' },
  { label: 'Confirmação' },
];

const provinces = [
  'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala',
  'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa',
  'Luanda', 'Benguela', 'Huíla',
];

const availableServices = [
  'Companhia', 'Jantar', 'Eventos', 'Viagens', 'Massagem', 'Conversa',
];

export default function ProviderSetup() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [age, setAge] = useState('');
  const [province, setProvince] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingProfile, setExistingProfile] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchExistingProfile();
    }
  }, [user]);

  const fetchExistingProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setExistingProfile(data);
      setAge(data.age?.toString() || '');
      setProvince(data.province || '');
      setDescription(data.description || '');
      setPricePerHour(data.price_per_hour?.toString() || '');
      setSelectedServices(data.services || []);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (!user || photos.length === 0) return existingProfile?.photos || [];

    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, photo, { upsert: true });

      if (error) {
        console.error('Photo upload error:', error);
        continue;
      }

      uploadedUrls.push(fileName);
    }

    return [...(existingProfile?.photos || []), ...uploadedUrls];
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const photoUrls = await uploadPhotos();

      const profileData = {
        user_id: user.id,
        age: parseInt(age) || null,
        province: province || null,
        description: description.trim() || null,
        price_per_hour: parseFloat(pricePerHour) || null,
        services: selectedServices,
        photos: photoUrls,
        is_approved: false,
        is_visible: false,
      };

      if (existingProfile) {
        const { error } = await supabase
          .from('provider_profiles')
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('provider_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      toast.success('Perfil submetido para aprovação!');
      navigate('/provider');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao guardar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return age && province && description && pricePerHour;
      case 1:
        return selectedServices.length > 0;
      case 2:
        return photos.length > 0 || (existingProfile?.photos?.length > 0);
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(340 30% 8%) 50%, hsl(0 0% 3%) 100%)'
      }}
    >
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => navigate('/provider')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <Logo size="md" className="mb-6" />

        <StepIndicator steps={steps} currentStep={currentStep} className="mb-8" />

        <div className="animate-fade-in-up">
          <PremiumCard goldBorder className="p-6 sm:p-8">
            {/* Step 1: Personal Data */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold">Dados Pessoais</h2>
                </div>

                <PremiumInput
                  label="Idade"
                  type="number"
                  min={18}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  hint="Mínimo 18 anos"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Província</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Selecione...</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva-se brevemente..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length}/500 caracteres
                  </p>
                </div>

                <PremiumInput
                  label="Preço por Hora (MT)"
                  type="number"
                  min={0}
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  placeholder="500"
                  leftIcon={<DollarSign className="w-5 h-5" />}
                />
              </div>
            )}

            {/* Step 2: Services */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold">Serviços Oferecidos</h2>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os serviços que deseja oferecer
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {availableServices.map((service) => (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      className={cn(
                        'p-4 rounded-lg border transition-all text-left',
                        'hover:border-primary/50',
                        selectedServices.includes(service)
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-input'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center',
                          selectedServices.includes(service)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        )}>
                          {selectedServices.includes(service) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{service}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold">Fotos de Perfil</h2>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Adicione fotos atrativas. As fotos serão revisadas antes de serem aprovadas.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <FileUpload
                      key={index}
                      label={`Foto ${index + 1}`}
                      value={photos[index] || null}
                      onChange={(file) => {
                        const newPhotos = [...photos];
                        if (file) {
                          newPhotos[index] = file;
                        } else {
                          newPhotos.splice(index, 1);
                        }
                        setPhotos(newPhotos);
                      }}
                      accept="image/*"
                      maxSize={5}
                    />
                  ))}
                </div>

                {existingProfile?.photos?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Fotos existentes:</p>
                    <div className="flex gap-2">
                      {existingProfile.photos.map((photo: string, i: number) => (
                        <img
                          key={i}
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile-photos/${photo}`}
                          alt={`Foto ${i + 1}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display font-bold">Confirmação</h2>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idade</span>
                    <span className="font-medium">{age} anos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Província</span>
                    <span className="font-medium">{province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço/hora</span>
                    <span className="font-medium text-gradient-gold">{pricePerHour} MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviços</span>
                    <span className="font-medium">{selectedServices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fotos</span>
                    <span className="font-medium">{photos.length + (existingProfile?.photos?.length || 0)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm text-center">
                    <strong>Nota:</strong> O seu perfil será analisado em 24-48 horas.
                    Receberá uma notificação quando for aprovado.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <PremiumButton
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Anterior
              </PremiumButton>

              {currentStep < 3 ? (
                <PremiumButton
                  onClick={() => setCurrentStep((prev) => Math.min(3, prev + 1))}
                  disabled={!canProceed()}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Próximo
                </PremiumButton>
              ) : (
                <PremiumButton
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  rightIcon={<Shield className="w-4 h-4" />}
                >
                  Submeter para Aprovação
                </PremiumButton>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
