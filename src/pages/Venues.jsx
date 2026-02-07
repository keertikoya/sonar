import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getVenuesByCity } from '../services/venuesService'

// ---------------------------
// Helpers
// ---------------------------
function isEmail(str){
  return typeof str === 'string' && /.+@.+\..+/.test(str.trim());
}

function toExternalUrl(contact){
  if(!contact) return null;
  const v = String(contact).trim();
  if(!v) return null;
  if(isEmail(v)) return `mailto:${v}`;
  if(v.startsWith('http://') || v.startsWith('https://')) return v;
  // instagram.com/... and other domains
  return `https://${v}`;
}

function contactLabel(contact){
  if(!contact) return null;
  const v = String(contact).trim();
  if(isEmail(v)) return v;
  // strip protocol for display
  return v.replace(/^https?:\/\//, '');
}

function unique(arr){
  return Array.from(new Set(arr.filter(Boolean)));
}

function bucketCapacity(capacity){
  const c = Number(capacity ?? 0);
  if(!Number.isFinite(c) || c <= 0) return 'Unknown';
  if(c < 300) return '<300';
  if(c < 800) return '300–799';
  if(c < 1500) return '800–1499';
  return '1500+';
}

function hasWeekend(typicalDays){
  const days = (typicalDays ?? []).map(d => String(d).toLowerCase());
  return days.some(d => d.startsWith('fri') || d.startsWith('sat'));
}

function bookingDifficulty(venue){
  // Heuristic: larger venues + weekend-heavy tends to be more competitive
  const cap = Number(venue?.capacity ?? 0);
  const weekend = hasWeekend(venue?.typicalDays);
  const contact = String(venue?.contact ?? '').toLowerCase();

  let score = 0;
  if(cap >= 1500) score += 2;
  else if(cap >= 800) score += 1;
  if(weekend) score += 1;
  if(contact.includes('instagram')) score += 1; // often informal / unpredictable
  if(contact.includes('contact')) score += 1; // form queues

  if(score >= 4) return { label: 'Competitive', tone: 'danger' };
  if(score >= 2) return { label: 'Moderate', tone: 'warn' };
  return { label: 'Easier', tone: 'ok' };
}

function idealDrawRange(venue){
  const cap = Number(venue?.capacity ?? 0);
  if(!Number.isFinite(cap) || cap <= 0) return '—';
  // Rule of thumb: aim for 35%–85% of cap for a "healthy" room.
  const lo = Math.max(20, Math.round(cap * 0.35));
  const hi = Math.max(lo + 10, Math.round(cap * 0.85));
  return `${lo}–${hi} fans`;
}

function genreTags(venue){
  const raw = String(venue?.genreFit ?? '').split(/[\/,]/).map(s => s.trim()).filter(Boolean);
  // Keep short tags
  return raw.slice(0, 3);
}

function dayTags(venue){
  const days = venue?.typicalDays ?? [];
  return Array.isArray(days) ? days.slice(0, 3) : [];
}

function buildNotes(venue){
  const cap = Number(venue?.capacity ?? 0);
  const weekend = hasWeekend(venue?.typicalDays);
  const contact = String(venue?.contact ?? '').toLowerCase();
  const notes = [];
  if(cap && cap <= 350) notes.push('Intimate room — great for building new fans.');
  if(cap && cap >= 1200) notes.push('Bigger room — strongest with local support or a package.');
  if(weekend) notes.push('Weekend-friendly (Fri/Sat) — good for higher attendance.');
  if(!weekend) notes.push('Weeknight-leaning — consider an earlier show or local opener.');
  if(contact.includes('instagram')) notes.push('Contact is via social — keep outreach short + professional.');
  if(contact.includes('contact')) notes.push('Booking form queue — send a concise pitch + EPK link.');
  return notes;
}

function similarityScore(a, b){
  // higher is more similar
  let score = 0;
  const ac = Number(a?.capacity ?? 0);
  const bc = Number(b?.capacity ?? 0);
  if(Number.isFinite(ac) && Number.isFinite(bc) && ac > 0 && bc > 0){
    const ratio = Math.min(ac, bc) / Math.max(ac, bc);
    score += ratio * 2;
  }
  const ag = new Set(genreTags(a).map(s => s.toLowerCase()));
  const bg = new Set(genreTags(b).map(s => s.toLowerCase()));
  let overlap = 0;
  for(const g of ag) if(bg.has(g)) overlap += 1;
  score += overlap * 1.5;

  const aw = hasWeekend(a?.typicalDays);
  const bw = hasWeekend(b?.typicalDays);
  if(aw === bw) score += 0.5;
  return score;
}

function Chip({ active, onClick, children }){
  return (
    <button
      className={active ? 'chip chip--active' : 'chip'}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function IconButton({ title, onClick, children, variant='ghost', disabled=false }){
  const cls = variant === 'primary' ? 'iconBtn iconBtn--primary' : variant === 'danger' ? 'iconBtn iconBtn--danger' : 'iconBtn';
  return (
    <button className={cls} title={title} onClick={onClick} type="button" disabled={disabled}>
      {children}
    </button>
  )
}

function Drawer({ open, onClose, children, title }){
  const closeBtnRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e){
      if(e.key === 'Escape') onClose?.();
    }
    if(open){
      window.addEventListener('keydown', onKeyDown);
      setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if(!open) return null;
  return (
    <>
      <div className="drawerBackdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title ?? 'Venue details'}>
        <div className="drawerHeader">
          <div className="drawerTitle">{title}</div>
          <button ref={closeBtnRef} className="drawerClose" onClick={onClose} type="button">✕</button>
        </div>
        <div className="drawerBody">{children}</div>
      </aside>
    </>
  );
}

// ---------------------------
// Page
// ---------------------------
export default function Venues(){
  const { state, dispatch } = useApp();
  const { cityId } = useParams();
  const navigate = useNavigate();

  const city = useMemo(
    () => state.analysis.cities.find(c => c.id === cityId),
    [state.analysis.cities, cityId]
  );

  const venues = useMemo(
    () => getVenuesByCity(city?.city) ?? [],
    [city?.city]
  );

  // Saved venues: keep simple + localStorage-based (no global state changes needed)
  const [savedIds, setSavedIds] = useState(() => {
    try{
      const raw = localStorage.getItem('artist-venue-saved');
      return raw ? JSON.parse(raw) : [];
    }catch{ return []; }
  });

  useEffect(() => {
    try{ localStorage.setItem('artist-venue-saved', JSON.stringify(savedIds)); }catch{}
  }, [savedIds]);

  const toggleSaved = (venue) => {
    const key = `${venue.city}:${venue.id}`;
    setSavedIds(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const isSaved = (venue) => savedIds.includes(`${venue.city}:${venue.id}`);

  const addToTour = (venue) => {
    if(!city) return;
    const id = `${city.id}-${venue.id}-${Date.now()}`;
    dispatch({ type: 'ADD_PERFORMANCE', payload: { id, city: city.city, state: city.state, venue: venue.name, date: null, setlist: [] } });
    navigate('/tour');
  };

  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [dayFilter, setDayFilter] = useState('Any'); // Any | Weekend | Weekdays
  const [capFilter, setCapFilter] = useState('Any'); // Any | <300 | 300–799 | 800–1499 | 1500+
  const [sort, setSort] = useState('Best match');

  const [selected, setSelected] = useState(null);

  const genreOptions = useMemo(() => {
    const tags = venues.flatMap(v => genreTags(v));
    return ['All', ...unique(tags).slice(0, 8)];
  }, [venues]);

  const filteredVenues = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = venues.slice();

    if(q){
      list = list.filter(v => {
        const hay = `${v.name} ${v.genreFit ?? ''} ${(v.typicalDays ?? []).join(' ')} ${v.contact ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if(genreFilter !== 'All'){
      const gf = genreFilter.toLowerCase();
      list = list.filter(v => genreTags(v).some(t => t.toLowerCase() === gf) || String(v.genreFit ?? '').toLowerCase().includes(gf));
    }

    if(dayFilter === 'Weekend') list = list.filter(v => hasWeekend(v.typicalDays));
    if(dayFilter === 'Weekdays') list = list.filter(v => !hasWeekend(v.typicalDays));

    if(capFilter !== 'Any'){
      list = list.filter(v => bucketCapacity(v.capacity) === capFilter);
    }

    // sort
    if(sort === 'Capacity (high → low)'){
      list.sort((a,b) => (Number(b.capacity ?? 0) - Number(a.capacity ?? 0)));
    }else if(sort === 'Capacity (low → high)'){
      list.sort((a,b) => (Number(a.capacity ?? 0) - Number(b.capacity ?? 0)));
    }else if(sort === 'Weekend-friendly'){
      list.sort((a,b) => Number(hasWeekend(b.typicalDays)) - Number(hasWeekend(a.typicalDays)));
    }else{
      // Best match heuristic: weekend venues first, then moderate booking difficulty, then cap near 900 (mid-size)
      const target = 900;
      list.sort((a,b) => {
        const aw = Number(hasWeekend(a.typicalDays));
        const bw = Number(hasWeekend(b.typicalDays));
        if(aw !== bw) return bw - aw;
        const ad = bookingDifficulty(a).label;
        const bd = bookingDifficulty(b).label;
        const rank = { 'Easier': 2, 'Moderate': 3, 'Competitive': 1 };
        if(rank[ad] !== rank[bd]) return rank[bd] - rank[ad];
        const ac = Number(a.capacity ?? 0);
        const bc = Number(b.capacity ?? 0);
        return Math.abs(ac - target) - Math.abs(bc - target);
      });
    }

    // saved pinning
    list.sort((a,b) => Number(isSaved(b)) - Number(isSaved(a)));
    return list;
  }, [venues, query, genreFilter, dayFilter, capFilter, sort, savedIds]);

  const similarVenues = useMemo(() => {
    if(!selected) return [];
    return venues
      .filter(v => v.id !== selected.id)
      .map(v => ({ v, score: similarityScore(selected, v) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.v);
  }, [selected, venues]);

  if(!city) return <div className="container">Not found</div>

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="venuesHeader">
        <div className="venuesTitleBlock">
          <div className="venuesKicker">Artist Venue</div>
          <div className="venuesH1">{city.city}: Venues</div>
          <div className="venuesSub">Shortlist venues that fit your sound, your crowd size, and your best show nights.</div>
        </div>

        <div className="venuesControls">
          <input
            className="venuesSearch"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Search venue, genre, day, contact…"
          />
          <select className="venuesSelect" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option>Best match</option>
            <option>Weekend-friendly</option>
            <option>Capacity (high → low)</option>
            <option>Capacity (low → high)</option>
          </select>
        </div>
      </div>

      <div className="venuesFilters">
        <div className="venuesFilterGroup">
          <div className="venuesFilterLabel">Genre</div>
          <div className="venuesChips">
            {genreOptions.map(g => (
              <Chip key={g} active={genreFilter===g} onClick={()=>setGenreFilter(g)}>{g}</Chip>
            ))}
          </div>
        </div>

        <div className="venuesFilterGroup">
          <div className="venuesFilterLabel">Best days</div>
          <div className="venuesChips">
            <Chip active={dayFilter==='Any'} onClick={()=>setDayFilter('Any')}>Any</Chip>
            <Chip active={dayFilter==='Weekend'} onClick={()=>setDayFilter('Weekend')}>Fri/Sat</Chip>
            <Chip active={dayFilter==='Weekdays'} onClick={()=>setDayFilter('Weekdays')}>Weekdays</Chip>
          </div>
        </div>

        <div className="venuesFilterGroup">
          <div className="venuesFilterLabel">Capacity</div>
          <div className="venuesChips">
            {['Any','<300','300–799','800–1499','1500+','Unknown'].map(b => (
              <Chip key={b} active={capFilter===b} onClick={()=>setCapFilter(b)}>{b}</Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="venuesMetaRow">
        <div className="venuesMetaText">Showing <b>{filteredVenues.length}</b> venues</div>
        <div className="venuesMetaHint">Tip: Click a card to open details.</div>
      </div>

      <div className="venuesGrid">
        {filteredVenues.map(v => {
          const contact = v.contact;
          const url = toExternalUrl(contact);
          const diff = bookingDifficulty(v);
          const saved = isSaved(v);
          const draw = idealDrawRange(v);
          return (
            <div key={v.id} className={saved ? 'venueCard venueCard--saved' : 'venueCard'} onClick={()=>setSelected(v)} role="button" tabIndex={0}>
              <div className="venueCardTop">
                <div className="venueCardTitleRow">
                  <div className="venueCardTitle">{v.name}</div>
                  <div className="venueBadges">
                    {genreTags(v).map(t => (<span key={t} className="badge badge--soft">{t}</span>))}
                    {dayTags(v).map(d => (<span key={d} className={String(d).toLowerCase().startsWith('fri')||String(d).toLowerCase().startsWith('sat') ? 'badge badge--day badge--dayHot' : 'badge badge--day'}>{d}</span>))}
                  </div>
                </div>

                <div className="venueSummary">
                  <div className="venueSummaryItem"><span className="venueLabel">Capacity</span><span className="venueValue">{v.capacity ?? '—'}</span></div>
                  <div className="venueSummaryItem"><span className="venueLabel">Ideal draw</span><span className="venueValue">{draw}</span></div>
                  <div className="venueSummaryItem"><span className="venueLabel">Booking</span><span className={`venueValue venueValue--${diff.tone}`}>{diff.label}</span></div>
                </div>

                {url && (
                  <div className="venueContact" onClick={(e)=>e.stopPropagation()}>
                    <a className="venueLink" href={url} target={url.startsWith('mailto:') ? undefined : '_blank'} rel={url.startsWith('mailto:') ? undefined : 'noreferrer'}>
                      {isEmail(contact) ? '✉️ ' : '🔗 '}{contactLabel(contact)}
                    </a>
                  </div>
                )}
              </div>

              <div className="venueActions" onClick={(e)=>e.stopPropagation()}>
                <IconButton
                  title={saved ? 'Saved' : 'Save'}
                  onClick={()=>toggleSaved(v)}
                >
                  {saved ? '★ Saved' : '☆ Save'}
                </IconButton>

                <IconButton
                  title="Copy contact"
                  onClick={async ()=>{
                    const text = v.contact ? String(v.contact) : '';
                    try{ await navigator.clipboard.writeText(text); }catch{}
                  }}
                  disabled={!v.contact}
                >
                  📋 Copy
                </IconButton>

                <IconButton
                  title="Open contact"
                  onClick={()=>{ if(url) window.open(url, '_blank', 'noreferrer'); }}
                  disabled={!url || url.startsWith('mailto:')}
                >
                  ↗ Open
                </IconButton>

                <IconButton
                  variant="primary"
                  title="Add to tour"
                  onClick={()=>addToTour(v)}
                >
                  ➕ Add to Tour
                </IconButton>

                <IconButton
                  title="Details"
                  onClick={()=>setSelected(v)}
                >
                  ℹ️ Details
                </IconButton>
              </div>
            </div>
          )
        })}
      </div>

      <Drawer
        open={!!selected}
        onClose={()=>setSelected(null)}
        title={selected ? selected.name : 'Venue details'}
      >
        {selected && (
          <>
            <div className="drawerSection">
              <div className="drawerSectionTitle">Fit summary</div>
              <div className="drawerPills">
                {genreTags(selected).map(t => (<span key={t} className="pill">{t}</span>))}
                {dayTags(selected).map(d => (<span key={d} className={String(d).toLowerCase().startsWith('fri')||String(d).toLowerCase().startsWith('sat') ? 'pill pill--hot' : 'pill'}>{d}</span>))}
                <span className="pill">Capacity: {selected.capacity ?? '—'}</span>
              </div>

              <div className="drawerGrid">
                <div className="drawerStat">
                  <div className="drawerStatLabel">Ideal draw</div>
                  <div className="drawerStatValue">{idealDrawRange(selected)}</div>
                </div>
                <div className="drawerStat">
                  <div className="drawerStatLabel">Booking difficulty</div>
                  <div className={`drawerStatValue drawerStatValue--${bookingDifficulty(selected).tone}`}>{bookingDifficulty(selected).label}</div>
                </div>
                <div className="drawerStat">
                  <div className="drawerStatLabel">Typical nights</div>
                  <div className="drawerStatValue">{(selected.typicalDays ?? []).join(', ') || '—'}</div>
                </div>
              </div>
            </div>

            <div className="drawerSection">
              <div className="drawerSectionTitle">Booking info</div>
              <div className="drawerBodyText">
                <div><b>Contact:</b> {selected.contact ? contactLabel(selected.contact) : '—'}</div>
                <div><b>Method:</b> {isEmail(selected.contact) ? 'Email' : (String(selected.contact ?? '').toLowerCase().includes('instagram') ? 'Social / DM' : 'Link / Form')}</div>
                <div><b>Suggested lead time:</b> {Number(selected.capacity ?? 0) >= 1500 ? '8–16 weeks' : Number(selected.capacity ?? 0) >= 800 ? '6–12 weeks' : '4–8 weeks'}</div>
              </div>
              <div className="drawerActionRow">
                <IconButton variant="primary" title="Add to tour" onClick={()=>addToTour(selected)}>➕ Add to Tour</IconButton>
                <IconButton title={isSaved(selected) ? 'Saved' : 'Save'} onClick={()=>toggleSaved(selected)}>
                  {isSaved(selected) ? '★ Saved' : '☆ Save'}
                </IconButton>
                <IconButton title="Copy contact" onClick={async ()=>{
                  try{ await navigator.clipboard.writeText(String(selected.contact ?? '')); }catch{}
                }} disabled={!selected.contact}>📋 Copy</IconButton>
                <IconButton title="Open contact" onClick={()=>{
                  const u = toExternalUrl(selected.contact);
                  if(u && !u.startsWith('mailto:')) window.open(u, '_blank', 'noreferrer');
                }} disabled={!toExternalUrl(selected.contact) || String(toExternalUrl(selected.contact)).startsWith('mailto:')}>↗ Open</IconButton>
              </div>
            </div>

            <div className="drawerSection">
              <div className="drawerSectionTitle">Notes</div>
              <ul className="drawerList">
                {buildNotes(selected).map((n, idx) => (<li key={idx}>{n}</li>))}
              </ul>
            </div>

            <div className="drawerSection">
              <div className="drawerSectionTitle">Similar venues in {selected.city}</div>
              {similarVenues.length === 0 ? (
                <div className="drawerBodyText">No similar venues found.</div>
              ) : (
                <div className="drawerMiniGrid">
                  {similarVenues.map(v => (
                    <button key={v.id} className="miniCard" type="button" onClick={()=>setSelected(v)}>
                      <div className="miniTitle">{v.name}</div>
                      <div className="miniMeta">Cap {v.capacity ?? '—'} · {(v.typicalDays ?? []).join(', ') || '—'}</div>
                      <div className="miniBadges">
                        {genreTags(v).slice(0,2).map(t => (<span key={t} className="badge badge--soft">{t}</span>))}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}
