import { MapPin, DollarSign, Calendar, Tag } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { cn } from '@/lib/utils';

interface Filters {
  province: string;
  minAge: number;
  maxAge: number;
  minPrice: number;
  maxPrice: number;
  services: string[];
}

interface FilterPanelProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const provinces = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa',
  'Luanda',
  'Benguela',
  'Huíla',
];

const availableServices = [
  'Companhia',
  'Jantar',
  'Eventos',
  'Viagens',
  'Massagem',
  'Conversa',
];

export function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const toggleService = (service: string) => {
    const services = filters.services.includes(service)
      ? filters.services.filter((s) => s !== service)
      : [...filters.services, service];
    setFilters({ ...filters, services });
  };

  const resetFilters = () => {
    setFilters({
      province: '',
      minAge: 18,
      maxAge: 99,
      minPrice: 0,
      maxPrice: 10000,
      services: [],
    });
  };

  return (
    <PremiumCard className="p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filtros</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-primary hover:underline"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-5">
        {/* Province */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Província
          </label>
          <select
            value={filters.province}
            onChange={(e) => setFilters({ ...filters, province: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:border-primary"
          >
            <option value="">Todas</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Idade
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={18}
              max={99}
              value={filters.minAge}
              onChange={(e) =>
                setFilters({ ...filters, minAge: parseInt(e.target.value) || 18 })
              }
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            />
            <span className="text-muted-foreground">a</span>
            <input
              type="number"
              min={18}
              max={99}
              value={filters.maxAge}
              onChange={(e) =>
                setFilters({ ...filters, maxAge: parseInt(e.target.value) || 99 })
              }
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Preço (MT/hora)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              placeholder="Min"
            />
            <span className="text-muted-foreground">a</span>
            <input
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxPrice: parseInt(e.target.value) || 10000,
                })
              }
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Serviços
          </label>
          <div className="flex flex-wrap gap-2">
            {availableServices.map((service) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filters.services.includes(service)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
