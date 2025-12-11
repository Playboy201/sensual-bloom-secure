import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GenderType, AccountType, Country } from '@/types';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { GenderStep } from '@/components/onboarding/GenderStep';
import { IntentStep } from '@/components/onboarding/IntentStep';

type OnboardingStep = 'welcome' | 'gender' | 'intent';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<Country>('MZ');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [frontDocument, setFrontDocument] = useState<File | null>(null);
  const [backDocument, setBackDocument] = useState<File | null>(null);
  const [gender, setGender] = useState<GenderType | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCountry(profile.country as Country || 'MZ');
      setIsAdultConfirmed(profile.is_adult_confirmed || false);
      setGender(profile.gender || null);
      
      if (profile.account_type) {
        // Already completed onboarding
        if (profile.account_type === 'buyer') {
          navigate('/buyer');
        } else {
          navigate('/provider');
        }
      } else if (profile.gender) {
        setStep('intent');
      } else if (profile.full_name) {
        setStep('gender');
      }
    }
  }, [profile, navigate]);

  const uploadDocument = async (file: File, type: 'front' | 'back') => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
    
    const { error, data } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true });
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    return fileName;
  };

  const handleWelcomeSubmit = async () => {
    if (!user) return;
    
    if (!fullName.trim() || !phone.trim() || !isAdultConfirmed) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!frontDocument || !backDocument) {
      toast.error('Carregue frente e verso do BI');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload documents
      const frontUrl = await uploadDocument(frontDocument, 'front');
      const backUrl = await uploadDocument(backDocument, 'back');

      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          country,
          is_adult_confirmed: true,
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Create document record
      const { error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          front_url: frontUrl,
          back_url: backUrl,
          status: 'pending',
        });

      if (docError) throw docError;

      await refreshProfile();
      toast.success('Dados guardados com sucesso!');
      setStep('gender');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao guardar dados');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenderSubmit = async (selectedGender: GenderType) => {
    if (!user) return;
    
    setGender(selectedGender);
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ gender: selectedGender })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setStep('intent');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao guardar género');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIntentSubmit = async (selectedType: AccountType) => {
    if (!user) return;
    
    setAccountType(selectedType);
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: selectedType })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Registo completo!');
      
      if (selectedType === 'buyer') {
        navigate('/buyer');
      } else {
        navigate('/provider/setup');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao guardar tipo de conta');
    } finally {
      setIsSubmitting(false);
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
        background: 'linear-gradient(180deg, hsl(0 0% 8%) 0%, hsl(0 0% 5%) 50%, hsl(0 50% 8%) 100%)'
      }}
    >
      {step === 'welcome' && (
        <WelcomeStep
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          country={country}
          setCountry={setCountry}
          isAdultConfirmed={isAdultConfirmed}
          setIsAdultConfirmed={setIsAdultConfirmed}
          frontDocument={frontDocument}
          setFrontDocument={setFrontDocument}
          backDocument={backDocument}
          setBackDocument={setBackDocument}
          onSubmit={handleWelcomeSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {step === 'gender' && (
        <GenderStep
          selectedGender={gender}
          onSelect={handleGenderSubmit}
          isSubmitting={isSubmitting}
          onBack={() => setStep('welcome')}
        />
      )}

      {step === 'intent' && (
        <IntentStep
          selectedType={accountType}
          onSelect={handleIntentSubmit}
          isSubmitting={isSubmitting}
          onBack={() => setStep('gender')}
        />
      )}
    </div>
  );
}
