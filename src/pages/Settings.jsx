
import React from 'react'

export default function Settings(){
  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 12 }}>Settings</div>
      <div className="body">v0.1 — Web demo. Replace mock services with real APIs (SerpAPI, Google Events, Eventbrite) when ready.</div>
      <div className="body" style={{ marginTop: 8 }}><a href="https://serpapi.com/" target="_blank" rel="noreferrer">SerpAPI → serpapi.com</a></div>
      <div className="body"><a href="https://developers.google.com/maps/documentation/events" target="_blank" rel="noreferrer">Google Events API</a></div>
      <div className="body"><a href="https://www.eventbrite.com/platform" target="_blank" rel="noreferrer">Eventbrite Platform</a></div>
    </div>
  )
}
