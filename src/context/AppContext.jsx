import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
// Import your new service
import { runAnalysis } from '../services/analysisService';

const initialState = {
  user: null,
  artist: { name: '', genre: '', similar: [] },
  analysis: { cities: [], lastRunAt: null, isLoading: false }, // Added isLoading
  tour: {
  activeTourId: "default-tour",
  tours: [
    { id: "default-tour", name: "My Tour" }
    ],
    performances: []
  }
};

function reducer(state, action){
  switch(action.type){
    case 'LOGIN': return { ...state, user: action.payload };
    case 'SET_ARTIST': return { ...state, artist: { ...state.artist, ...action.payload } };
    case 'START_ANALYSIS': return { ...state, analysis: { ...state.analysis, isLoading: true } };
    case 'SET_ANALYSIS': 
    return { 
      ...state, 
      analysis: { 
        // Spread the results (cities, lastRunAt) into the analysis object
        ...action.payload, 
        isLoading: false 
      } 
    };
case 'ADD_PERFORMANCE': {
  const tourId = action.payload.tourId || state.tour.activeTourId;
  return {
    ...state,
    tour: {
      ...state.tour,
      performances: [...state.tour.performances, { ...action.payload, tourId }],
    },
  };
}    case 'UPDATE_PERFORMANCE':
      return { ...state, tour: { ...state.tour, performances: state.tour.performances.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) } };
    case 'REMOVE_PERFORMANCE':
      return { ...state, tour: { ...state.tour, performances: state.tour.performances.filter(p => p.id !== action.payload) } };
    case 'ADD_TOUR':
  return { ...state, tour: { ...state.tour, tours: [...state.tour.tours, action.payload] } };

case 'SET_ACTIVE_TOUR':
  return { ...state, tour: { ...state.tour, activeTourId: action.payload } };

      default: return state;
  }
  
  
}

const AppContext = createContext();

export function AppProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
  try {
    const savedRaw = localStorage.getItem('artist-venue-state');
    if (!savedRaw) return init;

    const saved = JSON.parse(savedRaw);

    // ---- MIGRATIONS / DEFAULTS ----
    const merged = {
      ...init,
      ...saved,
      analysis: { ...init.analysis, ...(saved.analysis || {}) },
      artist: { ...init.artist, ...(saved.artist || {}) },
      tour: { ...init.tour, ...(saved.tour || {}) },
    };

    // Ensure tours exist
    if (!Array.isArray(merged.tour.tours) || merged.tour.tours.length === 0) {
      merged.tour.tours = init.tour.tours;
    }

    // Ensure activeTourId exists and is valid
    if (!merged.tour.activeTourId || !merged.tour.tours.some(t => t.id === merged.tour.activeTourId)) {
      merged.tour.activeTourId = merged.tour.tours[0].id;
    }

    // Ensure every performance has a tourId
    merged.tour.performances = (merged.tour.performances || []).map(p => ({
      ...p,
      tourId: p.tourId || merged.tour.activeTourId,
    }));

    return merged;
  } catch {
    return init;
  }
});


  // Action: Trigger the real API analysis
const executeAnalysis = async (artistData) => {
    dispatch({ type: 'START_ANALYSIS' });
    console.log("1. Starting Analysis with:", artistData);
    
    try {
      const results = await runAnalysis(artistData);
      console.log("2. API Results Received:", results);

      // Verify that results.cities exists before dispatching
      if (!results || !results.cities) {
        throw new Error("Service returned invalid data structure");
      }

      dispatch({ type: 'SET_ANALYSIS', payload: results });
      console.log("3. Dispatch Complete");
      return results;
    } catch (error) {
      console.error("Analysis failed:", error);
      dispatch({ type: 'SET_ANALYSIS', payload: { cities: [], lastRunAt: new Date().toISOString() } });
    }
  };

  useEffect(()=>{
    try { localStorage.setItem('artist-venue-state', JSON.stringify(state)); } catch {}
  }, [state]);

  // Include executeAnalysis in the context value
  const value = useMemo(()=>({ state, dispatch, executeAnalysis }), [state]);
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(){ return useContext(AppContext); }