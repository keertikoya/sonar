const API_KEY = "41b62188dbc8c43a62c470b5400bcba4a5dab6d411918164bfccfa6d09caa743";

export async function searchVenues(cityName, stateName, lat, lng) {
  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    console.warn("searchVenues aborted: Coordinates are missing.");
    return []; 
  }

  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    const llValue = `@${latitude},${longitude},13z`;

    const params = new URLSearchParams({
      engine: "google_maps",
      type: "search",
      q: `live music venues in ${cityName}, ${stateName}`,
      ll: llValue,
      hl: "en",
      api_key: API_KEY
    });

    const response = await fetch(`/serpapi/search.json?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API Error");
    }

    const data = await response.json();
    return (data.local_results || []).map((venue, index) => ({
      id: venue.data_id || `v-${index}`,
      name: venue.title,
      address: venue.address,
      phone: venue.phone,
      website: venue.links?.website || null,
      rating: venue.rating,
      reviews: venue.reviews,
      type: venue.type || "Music Venue"
    }));
  } catch (error) {
    console.error("Service Fetch Error:", error);
    return [];
  }
}