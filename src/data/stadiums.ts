export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: 'MX' | 'CA' | 'US';
}

export const STADIUMS: Stadium[] = [
  // Mexico
  { id: 'azt', name: 'Estadio Azteca',            city: 'Mexico',         country: 'MX' },
  { id: 'gdl', name: 'Estadio Guadalajara',       city: 'Guadalajara',    country: 'MX' },
  { id: 'mty', name: 'Estadio BBVA',              city: 'Monterrey',      country: 'MX' },
  // Canada
  { id: 'tor', name: 'BMO Field',                 city: 'Toronto',        country: 'CA' },
  { id: 'van', name: 'BC Place',                  city: 'Vancouver',      country: 'CA' },
  // USA
  { id: 'atl', name: 'Mercedes-Benz Stadium',     city: 'Atlanta',        country: 'US' },
  { id: 'bos', name: 'Gillette Stadium',          city: 'Boston',         country: 'US' },
  { id: 'dal', name: 'AT&T Stadium',              city: 'Dallas',         country: 'US' },
  { id: 'hou', name: 'NRG Stadium',               city: 'Houston',        country: 'US' },
  { id: 'kc',  name: 'Arrowhead Stadium',         city: 'Kansas City',    country: 'US' },
  { id: 'la',  name: 'SoFi Stadium',              city: 'Los Angeles',    country: 'US' },
  { id: 'mia', name: 'Hard Rock Stadium',         city: 'Miami',          country: 'US' },
  { id: 'nyc', name: 'MetLife Stadium',           city: 'New York / NJ',  country: 'US' },
  { id: 'phi', name: 'Lincoln Financial Field',   city: 'Philadelphia',   country: 'US' },
  { id: 'sf',  name: "Levi's Stadium",            city: 'San Francisco',  country: 'US' },
  { id: 'sea', name: 'Lumen Field',               city: 'Seattle',        country: 'US' },
];

export const STADIUMS_BY_ID: Record<string, Stadium> = Object.fromEntries(
  STADIUMS.map(s => [s.id, s])
);

export function stadiumLabel(id: string | null | undefined): string {
  if (!id) return '';
  const s = STADIUMS_BY_ID[id];
  return s ? `${s.name} — ${s.city}` : '';
}
