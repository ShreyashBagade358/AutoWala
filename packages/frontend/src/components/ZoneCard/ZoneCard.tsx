import { Zone } from '@shared/types';

interface ZoneCardProps {
  zone: Zone;
  onClick: () => void;
  selected?: boolean;
  language?: 'en' | 'mr';
}

export default function ZoneCard({ zone, onClick, selected, language = 'en' }: ZoneCardProps) {
  const name = language === 'mr' ? zone.nameMarathi : zone.name;
  
  return (
    <div 
      onClick={onClick}
      className={`zone-card ${selected ? 'selected' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">₹{zone.minimumFare}+</p>
        </div>
      </div>
    </div>
  );
}
