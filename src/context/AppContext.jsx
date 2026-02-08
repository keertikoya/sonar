import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';
// Import your new service
import { runAnalysis } from '../services/analysisService';

const initialState = {
  user: null,
  artist: { name: '', genre: '', similar: [] },
  analysis: { cities: [], lastRunAt: null, isLoading: false }, // Added isLoading
  tour: { performances: [] }
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
    case 'ADD_PERFORMANCE': return { ...state, tour: { ...state.tour, performances: [...state.tour.performances, action.payload] } };
    case 'UPDATE_PERFORMANCE':
      return { ...state, tour: { ...state.tour, performances: state.tour.performances.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) } };
    case 'REMOVE_PERFORMANCE':
      return { ...state, tour: { ...state.tour, performances: state.tour.performances.filter(p => p.id !== action.payload) } };
    default: return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState, (init)=>{
    try {
      const saved = localStorage.getItem('artist-venue-state');
      return saved ? JSON.parse(saved) : init;
    } catch { return init; }
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