export interface Airport {
  code: string
  name: string
  city: string
  country: string
}

// Common airports dataset — covers the most frequently used routes
const AIRPORTS: Airport[] = [
  { code: 'TUN', name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
  { code: 'BCN', name: 'Barcelona El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy' },
  { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
  { code: 'RAK', name: 'Marrakech Menara Airport', city: 'Marrakech', country: 'Morocco' },
  { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria' },
  { code: 'MRS', name: 'Marseille Provence Airport', city: 'Marseille', country: 'France' },
  { code: 'NCE', name: "Nice Côte d'Azur Airport", city: 'Nice', country: 'France' },
  { code: 'LYS', name: 'Lyon-Saint Exupéry Airport', city: 'Lyon', country: 'France' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'BEY', name: 'Rafic Hariri International Airport', city: 'Beirut', country: 'Lebanon' },
  { code: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan' },
  { code: 'SFX', name: 'Sfax-Thyna International Airport', city: 'Sfax', country: 'Tunisia' },
  { code: 'MIR', name: 'Monastir Habib Bourguiba International Airport', city: 'Monastir', country: 'Tunisia' },
  { code: 'DJE', name: 'Djerba-Zarzis International Airport', city: 'Djerba', country: 'Tunisia' },
  { code: 'GAE', name: 'Gabès Matmata International Airport', city: 'Gabès', country: 'Tunisia' },
]

/**
 * Searches airports by IATA code, city, country or name.
 * Case-insensitive, returns up to 10 results.
 */
export function searchAirports(query: string): Airport[] {
  if (!query || query.trim().length < 1) return []
  const q = query.trim().toLowerCase()
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, 10)
}
