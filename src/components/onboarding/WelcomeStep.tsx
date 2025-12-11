import { User, Phone, Shield, ArrowRight } from 'lucide-react';
import { Country } from '@/types';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumCheckbox } from '@/components/ui/PremiumCheckbox';
import { Logo } from '@/components/ui/Logo';
import { SecurityBadges } from '@/components/ui/SecurityBadge';
import { CountrySelector, getPhonePrefix } from '@/components/ui/CountrySelector';
import { FileUpload } from '@/components/ui/FileUpload';

interface WelcomeStepProps {
  fullName: string;
  setFullName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  country: Country;
  setCountry: (value: Country) => void;
  isAdultConfirmed: boolean;
  setIsAdultConfirmed: (value: boolean) => void;
  frontDocument: File | null;
  setFrontDocument: (file: File | null) => void;
  backDocument: File | null;
  setBackDocument: (file: File | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function WelcomeStep({
  fullName,
  setFullName,
  phone,
  setPhone,
  country,
  setCountry,
  isAdultConfirmed,
  setIsAdultConfirmed,
  frontDocument,
  setFrontDocument,
  backDocument,
  setBackDocument,
  onSubmit,
  isSubmitting,
}: WelcomeStepProps) {
  const phonePrefix = getPhonePrefix(country);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-lg animate-fade-in-up">
        <Logo size="lg" className="mb-6" />

        <PremiumCard goldBorder className="p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2 mb-6 text-primary">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Registo Seguro</span>
          </div>

          <div className="space-y-5">
            {/* Country Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                País
              </label>
              <CountrySelector value={country} onChange={setCountry} />
            </div>

            {/* Full Name */}
            <PremiumInput
              label="Nome Completo"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              leftIcon={<User className="w-5 h-5" />}
              required
            />

            {/* Phone */}
            <PremiumInput
              label="Telemóvel"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="84 123 4567"
              leftIcon={
                <span className="text-sm font-medium text-muted-foreground">
                  {phonePrefix}
                </span>
              }
              hint="Número sem código de país"
              required
            />

            {/* Document Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUpload
                label="BI - Frente"
                description="Foto clara do documento"
                value={frontDocument}
                onChange={setFrontDocument}
                accept="image/*"
                maxSize={5}
              />
              <FileUpload
                label="BI - Verso"
                description="Foto clara do documento"
                value={backDocument}
                onChange={setBackDocument}
                accept="image/*"
                maxSize={5}
              />
            </div>

            {/* Adult Confirmation */}
            <PremiumCheckbox
              label="Confirmo que tenho mais de 18 anos"
              description="É obrigatório ser maior de idade para usar esta plataforma"
              checked={isAdultConfirmed}
              onChange={(e) => setIsAdultConfirmed(e.target.checked)}
            />

            {/* Submit Button */}
            <PremiumButton
              onClick={onSubmit}
              isLoading={isSubmitting}
              disabled={!fullName || !phone || !isAdultConfirmed || !frontDocument || !backDocument}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="w-full"
            >
              Entrar com Segurança
            </PremiumButton>
          </div>
        </PremiumCard>

        <SecurityBadges className="mt-6" />
      </div>
    </div>
  );
}
