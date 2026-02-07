
import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';

const initialState = {
  user: null,
  artist: { name: '', genre: '', similar: [] },
  analysis: { cities: [], lastRunAt: null },
  tour: { performances: [] }
};

function reducer(state, action){
  switch(action.type){
    case 'LOGIN': return { ...state, user: action.payload };
    case 'SET_ARTIST': return { ...state, artist: { ...state.artist, ...action.payload } };
    case 'SET_ANALYSIS': return { ...state, analysis: action.payload };
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
    try{
      const saved = localStorage.getItem('artist-venue-state');
      return saved ? JSON.parse(saved) : init;
    }catch{ return init; }
  });

  useEffect(()=>{
    try{ localStorage.setItem('artist-venue-state', JSON.stringify(state)); }catch{}
  }, [state]);

  const value = useMemo(()=>({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export function useApp(){ return useContext(AppContext); }
