import { cn } from '@/lib/utils';
import { Country } from '@/types';

interface CountrySelectorProps {
  value: Country;
  onChange: (country: Country) => void;
  className?: string;
}

const countries = [
  { code: 'MZ' as Country, name: 'Moçambique', flag: '🇲🇿', prefix: '+258' },
  { code: 'AO' as Country, name: 'Angola', flag: '🇦🇴', prefix: '+244' },
];

export function CountrySelector({ value, onChange, className }: CountrySelectorProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {countries.map((country) => (
        <button
          key={country.code}
          type="button"
          onClick={() => onChange(country.code)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
            'border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            value === country.code
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border bg-input text-muted-foreground hover:border-primary/50'
          )}
        >
          <span className="text-2xl">{country.flag}</span>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{country.name}</span>
            <span className="text-xs text-muted-foreground">{country.prefix}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function getPhonePrefix(country: Country): string {
  return countries.find((c) => c.code === country)?.prefix || '+258';
}
