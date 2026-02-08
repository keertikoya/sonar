# Sonar (WiCS 2026 Hackathon)

> **Tour where you’re already wanted.** > Sonar is a data-driven tour planning platform that helps emerging artists, venues, and promoters identify latent audience demand to book smarter, more profitable tours.

---

## Overview

Touring is often a financial gamble for young and emerging artists. **Sonar** transforms this "guesswork" into a data science problem. By analyzing public search behavior via Google Trends (SerpAPI) and cross-referencing it with venue data, the platform identifies "clusters of interest," or cities where fans are searching for the artist's music or genre.

### The Problem
* **Financial Risk:** Artists lose money on tour stops with low attendance.
* **Information Gap:** Lack of visibility into geographic search trends and fan density.
* **Fragmented Tools:** Booking, scheduling, and market research live in separate, disconnected silos.

### The Solution
A lightweight, artist-first dashboard that combines **search demand, genre trends, and venue availability** into a single visual decision system.

---

## Key Features

### Interactive Heatmap & Visualization
* **U.S. Demand Heatmap:** Powered by Leaflet.heat, visualizing city-level interest at a glance.
* **Color Intensity:** Represents the "Sonar Score," a weighted metric of search volume and trend velocity.
* **Clickable Markers:** Deep-dive into specific cities, allowing a view of potential performance locations.

### Ranked City Insights
Each city is analyzed and tiered:
* **Sonar Score:** The primary metric for artist-specific demand.
* **1-Year Growth Rate:** Identifies if your momentum is rising or cooling in a specific market.
* **Competition Rate:** Analyzes market saturation and venue density.

### Tour Planner & Setlist Manager
* **Drag-and-Drop Planning:** Add identified cities and venues directly to a tour itinerary.
* **Venue Discovery:** Access local venues and easily view ratings and contact information.
* **Setlist Management:** Track performance variations and crowd notes per city.

---

## Tech Stack

| **Layer** | **Technology** |
| :--- | :--- |
| **Frontend** | React, React Router |
| **State Management** | Context API |
| **Mapping** | Leaflet, Leaflet.heat |
| **Data Fetching** | SerpAPI (Google Trends, Google Maps), Last.fm|
| **Styling** | CSS Variables, Flexbox, Grid (Retro-modern aesthetic) |
| **Data** | Custom JSON dataset for U.S. city coordinates & metadata |

---

## How It Works

1.  **Artist Input:** User enters Artist Name, Genre, and Similar Artists to establish a keyword context.
2.  **SerpAPI Fetching:** The system programmatically queries Google Trends for `"Band Name music"` and `"Band Name concerts"` over the last 12 months.
3.  **Normalization:** The engine maps abbreviated state codes and city names to a local geographic dataset to ensure coordinate accuracy.
4.  **Clustering:** Signals are aggregated to identify "Interest Clusters," weighting artist-specific keywords higher than general genre trends.
5.  **Actionable Output:** The artist receives a ranked list of cities recommended to them by Sonar.
6.  **Tour Planning:** Users can create tour itineraries by selecting cities directly from the ranked list or heatmap.
7.  **Performance Scheduling:** Set performance dates for each city and visualize them in a calendar view for better planning and conflict avoidance.
8.  **Interactive Dashboard:** Explore demand metrics, city rankings, and scheduled shows all in one place for real-time tour management.

---
