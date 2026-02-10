const API_KEY = '';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export async function searchTracks(query) {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      method: 'track.search',
      track: query,
      api_key: API_KEY,
      format: 'json',
      limit: 6
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Last.fm API response was not ok');
    
    const data = await response.json();
    
    const tracks = data.results?.trackmatches?.track || [];

    return tracks.map(track => ({
      title: track.name,
      artist: track.artist,
      image: track.image?.[1]?.['#text'] || '' 
    }));
  } catch (error) {
    console.error("Music Search Error:", error);
    return [];
  }
}