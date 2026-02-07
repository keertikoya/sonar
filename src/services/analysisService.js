
import sample from '../data/sampleCities.json';
export async function runAnalysis({ name, genre, similarArtists }){
  const ranked = [...sample].map(c => ({
    ...c,
    score: c.search * 0.6 + c.trend * 0.3 + (1 - c.saturation) * 0.1,
    tier: (c.search > 0.6 && c.saturation < 0.4) ? 'High/Low' : (c.search > 0.6 ? 'High/High' : 'Low'),
    genreAlignment: Math.min(1, Math.max(0, c.genreAlignment ?? 0.6))
  })).sort((a,b)=> b.score - a.score);
  return { cities: ranked, lastRunAt: new Date().toISOString() };
}
