
import venues from '../data/sampleVenues.json';
export function getVenuesByCity(city){ return venues.filter(v => v.city === city); }
