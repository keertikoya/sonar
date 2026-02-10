import cityData from '../data/cities.json';

const API_KEY = import.meta.env.VITE_SERP_API_KEY;

async function resolveTopicId(query) {
  const params = new URLSearchParams({
    engine: "google_trends_autocomplete",
    q: query,
    hl: "en",
    api_key: API_KEY
  });

  const res = await fetch(`/serpapi/search.json?${params}`);
  const data = await res.json();

  const topic = data.suggestions?.find(s => s.type === "TOPIC");
  return topic?.mid || null;
}

export async function runAnalysis({ name, genre }) {
  const topicId = await resolveTopicId(name);
  const q = topicId ?? name; 
  console.log("Using Query/TopicID:", q);

  try {
    const params = new URLSearchParams({
      engine: "google_trends",
      q: q,
      geo: "US",
      hl: "en",
      data_type: "GEO_MAP_0",
      date: "today 12-m", 
      region: "CITY",
      include_low_search_volume: "true",
      api_key: API_KEY
    });

  
    const proxyUrl = `/serpapi/search.json?${params.toString()}`;
    console.log("Fetching via Proxy:", proxyUrl);
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`SerpApi failed: ${response.status}`);

    const data = await response.json();
    
    const rawCities = data.interest_by_region || [];
    console.log(`Received ${rawCities.length} cities from API`);

    const results = rawCities.map((item, index) => {
      const cityName = item.location || "Unknown City";

      const match = cityData.find(c => 
        cityName.toLowerCase().includes(c.city.toLowerCase())
      );

      return {
        id: `city-${index}`,
        city: cityName.split(',')[0].trim(),
        state: match ? match.state : "USA", 
        score: parseInt(item.extracted_value) || 0,
        lat: match ? match.latitude : null,
        lng: match ? match.longitude : null,
        trend: parseFloat((Math.random() * 10).toFixed(1)),
        saturation: parseFloat((Math.random() * 5).toFixed(1))
      };
    });

    // Filter out results where score is 0 if desired
    return { 
      cities: results.sort((a, b) => b.score - a.score),
      lastRunAt: new Date().toISOString() 
    };

  } catch (error) {
    console.error("❌ [SERVICE ERROR]:", error);
    return { cities: [], lastRunAt: new Date().toISOString() };
  }
}