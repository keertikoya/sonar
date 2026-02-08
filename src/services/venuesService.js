const API_KEY = "41b62188dbc8c43a62c470b5400bcba4a5dab6d411918164bfccfa6d09caa743";

export async function searchVenues(cityName) {
  try {
    const params = new URLSearchParams({
      engine: "google_maps",
      type: "search",
      q: `live music venues in ${cityName}`,
      hl: "en",
      api_key: API_KEY
    });

    const response = await fetch(`/serpapi/search.json?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch venues");
    
    const data = await response.json();
    
    return (data.local_results || []).map((venue, index) => ({
      id: venue.data_id || `v-${index}`,
      name: venue.title,
      address: venue.address || "No address provided",
      phone: venue.phone || "No phone listed",
      website: venue.links?.website || null,
      thumbnail: venue.thumbnail,
      rating: venue.rating,
      reviews: venue.reviews,
      type: venue.type || "Music Venue",
      gps: venue.gps_coordinates
    }));
  } catch (error) {
    console.error("Venue Search Error:", error);
    return [];
  }
}