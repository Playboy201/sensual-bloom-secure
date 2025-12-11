import { MapPin, Clock, Star, Heart, Eye } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
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

interface ProviderCardProps {
  provider: ProviderProfile;
  onContact: () => void;
  featured?: boolean;
}

export function ProviderCard({ provider, onContact, featured = false }: ProviderCardProps) {
  const hasPhoto = provider.photos && provider.photos.length > 0;

  return (
    <PremiumCard
      goldBorder={featured}
      hoverable
      className={cn('overflow-hidden', featured && 'ring-2 ring-secondary/20')}
    >
      {/* Photo Section */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden -mx-6 -mt-6 mb-4">
        {hasPhoto ? (
          <div className="relative w-full h-full">
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile-photos/${provider.photos[0]}`}
              alt="Profile"
              className="w-full h-full object-cover blur-lg"
            />
            <div className="absolute inset-0 bg-background/30 backdrop-blur-md flex items-center justify-center">
              <div className="text-center text-foreground">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-60" />
                <p className="text-sm opacity-60">Ver foto completa</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl">👤</span>
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Destaque
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Info Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              {provider.age ? `${provider.age} anos` : 'Idade não informada'}
            </p>
            {provider.province && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {provider.province}
              </p>
            )}
          </div>
          
          {provider.price_per_hour && (
            <div className="text-right">
              <p className="text-lg font-bold text-gradient-gold">
                {provider.price_per_hour.toLocaleString()} MT
              </p>
              <p className="text-xs text-muted-foreground">/hora</p>
            </div>
          )}
        </div>

        {/* Services */}
        {provider.services && provider.services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {provider.services.slice(0, 3).map((service) => (
              <span
                key={service}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
              >
                {service}
              </span>
            ))}
            {provider.services.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                +{provider.services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {provider.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {provider.description}
          </p>
        )}

        {/* Contact Button */}
        <PremiumButton onClick={onContact} className="w-full" size="sm">
          Contactar
        </PremiumButton>
      </div>
    </PremiumCard>
  );
}
