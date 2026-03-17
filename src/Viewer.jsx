import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Hls from "hls.js";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`;

// ── PREVIOUSLY WATCHED ────────────────────────────────────────────────────────

const WATCHED_KEY = "nubian_previously_watched";

function getWatched() {
  try { return JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]"); } catch { return []; }
}

function addToWatched(item) {
  if (!item.id) return;
  const entry = { id: item.id, title: item.title, thumb: item.thumb, hlsUrl: item.hlsUrl, poster: item.poster, type: item.type };
  const list = getWatched().filter(i => i.id !== item.id);
  list.unshift(entry);
  localStorage.setItem(WATCHED_KEY, JSON.stringify(list.slice(0, 10)));
}

// ── WINDOW WIDTH HOOK ──────────────────────────────────────────────────────────

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────

const LANGS = {
  en: { code: "en", label: "English", flag: "🇬🇧" },
  fr: { code: "fr", label: "Français", flag: "🇫🇷" },
  es: { code: "es", label: "Español", flag: "🇪🇸" },
  pt: { code: "pt", label: "Português", flag: "🇧🇷" },
  sw: { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
};

const T = {
  en: {
    home: "Home", liveTV: "Live TV", ppv: "Pay-Per-View", browse: "Browse",
    play: "Play", moreInfo: "More Info", match: "Match",
    continueWatching: "Continue Watching", watched: "watched",
    trending: "Trending Now", liveNow: "Live Now",
    searchPlaceholder: "Search titles...", searchResults: "Showing results for",
    popularSearches: "Popular Searches",
    allChannels: "ALL CHANNELS", upNext: "Up next",
    fullscreen: "Fullscreen", cast: "Cast",
    ppvTitle: "Pay-Per-View Events", ppvSubtitle: "Premium live events — buy once, watch anytime",
    buyNow: "Buy Now", addToList: "+ List",
    liveTVTitle: "Live TV", liveTVSubtitle: "Watch live channels in real time",
    about: "About", help: "Help", privacy: "Privacy", terms: "Terms", contact: "Contact",
    rights: "All rights reserved.",
  },
  fr: {
    home: "Accueil", liveTV: "TV en Direct", ppv: "Pay-Per-View", browse: "Parcourir",
    play: "Lire", moreInfo: "Plus d'infos", match: "Correspondance",
    continueWatching: "Continuer à regarder", watched: "regardé",
    trending: "Tendances", liveNow: "En Direct",
    searchPlaceholder: "Rechercher des titres...", searchResults: "Résultats pour",
    popularSearches: "Recherches populaires",
    allChannels: "TOUTES LES CHAÎNES", upNext: "Ensuite",
    fullscreen: "Plein écran", cast: "Diffuser",
    ppvTitle: "Événements Pay-Per-View", ppvSubtitle: "Événements premium — achetez une fois, regardez à tout moment",
    buyNow: "Acheter", addToList: "+ Liste",
    liveTVTitle: "TV en Direct", liveTVSubtitle: "Regardez les chaînes en direct",
    about: "À propos", help: "Aide", privacy: "Confidentialité", terms: "Conditions", contact: "Contact",
    rights: "Tous droits réservés.",
  },
  es: {
    home: "Inicio", liveTV: "TV en Vivo", ppv: "Pay-Per-View", browse: "Explorar",
    play: "Reproducir", moreInfo: "Más información", match: "Coincidencia",
    continueWatching: "Continuar viendo", watched: "visto",
    trending: "Tendencias", liveNow: "En Vivo",
    searchPlaceholder: "Buscar títulos...", searchResults: "Resultados para",
    popularSearches: "Búsquedas populares",
    allChannels: "TODOS LOS CANALES", upNext: "A continuación",
    fullscreen: "Pantalla completa", cast: "Transmitir",
    ppvTitle: "Eventos de Pago por Visión", ppvSubtitle: "Eventos premium en vivo — compra una vez, mira cuando quieras",
    buyNow: "Comprar", addToList: "+ Lista",
    liveTVTitle: "TV en Vivo", liveTVSubtitle: "Mira canales en vivo en tiempo real",
    about: "Acerca de", help: "Ayuda", privacy: "Privacidad", terms: "Términos", contact: "Contacto",
    rights: "Todos los derechos reservados.",
  },
  pt: {
    home: "Início", liveTV: "TV ao Vivo", ppv: "Pay-Per-View", browse: "Explorar",
    play: "Reproduzir", moreInfo: "Mais informações", match: "Correspondência",
    continueWatching: "Continuar assistindo", watched: "assistido",
    trending: "Em Alta", liveNow: "Ao Vivo",
    searchPlaceholder: "Pesquisar títulos...", searchResults: "Resultados para",
    popularSearches: "Pesquisas populares",
    allChannels: "TODOS OS CANAIS", upNext: "A seguir",
    fullscreen: "Tela cheia", cast: "Transmitir",
    ppvTitle: "Eventos Pay-Per-View", ppvSubtitle: "Eventos premium ao vivo — compre uma vez, assista quando quiser",
    buyNow: "Comprar", addToList: "+ Lista",
    liveTVTitle: "TV ao Vivo", liveTVSubtitle: "Assista canais ao vivo em tempo real",
    about: "Sobre", help: "Ajuda", privacy: "Privacidade", terms: "Termos", contact: "Contato",
    rights: "Todos os direitos reservados.",
  },
  sw: {
    home: "Nyumbani", liveTV: "TV Moja kwa Moja", ppv: "Pay-Per-View", browse: "Vinjari",
    play: "Cheza", moreInfo: "Maelezo zaidi", match: "Mechi",
    continueWatching: "Endelea Kutazama", watched: "imetazamwa",
    trending: "Inayopanda", liveNow: "Moja kwa Moja",
    searchPlaceholder: "Tafuta vichwa...", searchResults: "Matokeo ya",
    popularSearches: "Utafutaji Maarufu",
    allChannels: "NJIA ZOTE", upNext: "Inayofuata",
    fullscreen: "Skrini nzima", cast: "Tuma",
    ppvTitle: "Matukio ya Kulipa Kutazama", ppvSubtitle: "Matukio ya wasomi — lipa mara moja, tazama wakati wowote",
    buyNow: "Nunua", addToList: "+ Orodha",
    liveTVTitle: "TV Moja kwa Moja", liveTVSubtitle: "Tazama vituo moja kwa moja",
    about: "Kuhusu", help: "Msaada", privacy: "Faragha", terms: "Masharti", contact: "Wasiliana",
    rights: "Haki zote zimehifadhiwa.",
  },
};

const LangContext = createContext({ lang: "en", t: T.en, setLang: () => {} });
const useLang = () => useContext(LangContext);

function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGS[lang];

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        color: "var(--text2)", borderRadius: 6, padding: "5px 12px",
        fontSize: 12, display: "flex", alignItems: "center", gap: 6,
        transition: "border-color 0.15s",
      }}>
        <span>{current.flag}</span>
        <span style={{ fontFamily: "'DM Mono', monospace" }}>{current.code.toUpperCase()}</span>
        <span style={{ fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 8, overflow: "hidden", zIndex: 200, minWidth: 160,
          boxShadow: "0 8px 32px #000a",
        }}>
          {Object.values(LANGS).map(l => (
            <div key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", fontSize: 13,
              background: lang === l.code ? "var(--surface2)" : "transparent",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
              onMouseLeave={e => e.currentTarget.style.background = lang === l.code ? "var(--surface2)" : "transparent"}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {lang === l.code && <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: 12 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const css = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080808;
    --bg2: #111111;
    --bg3: #1a1a1a;
    --surface: #1e1e1e;
    --surface2: #252525;
    --border: #2a2a2a;
    --text: #ffffff;
    --text2: #aaaaaa;
    --text3: #666666;
    --accent: #e50914;
    --accent2: #ff1a1a;
    --gold: #f5a623;
    --live: #ff2d55;
    --green: #00e5a0;
    --blue: #0099ff;
  }
  html, body, #root { height: 100%; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  button { cursor: pointer; font-family: inherit; border: none; }
  input { font-family: inherit; }
  * { -webkit-tap-highlight-color: transparent; }
`;

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const R2 = "https://assets.nubianlive.com"; // R2 public bucket
const CF = "https://customer-nbylg9nks43yj4vv.cloudflarestream.com";
const hls = (id) => `${CF}/${id}/manifest/video.m3u8`;
const poster = (file) => `${R2}/${file}`;
const p = (file) => `${R2}/${file}`;

const featured = {
  id: 100,
  title: "WELCOME TO NUBIAN TELEVISION",
  hlsUrl: "https://customer-nbylg9nks43yj4vv.cloudflarestream.com/c9c2165b624096cb9cb84b2aef2f2ccd/manifest/video.m3u8",
  poster: "/favicon.ico",
  description: "The home of Black culture, stories, and entertainment. Stream original series, documentaries, live TV, and exclusive events — all in one place.",
  genre: "Platform",
  year: 2026,
  rating: "ALL",
  duration: null,
  match: null,
  thumb: "📺",
};

const continueWatching = [
  { id: 1, title: "Neon Requiem", progress: 65, duration: "1h 52m", thumb: "🎬", episode: null },
  { id: 2, title: "Quiet Hours", progress: 30, duration: "2h 10m", thumb: "🎭", episode: "S1 E3" },
  { id: 3, title: "Cosmos: Remastered", progress: 80, duration: "45m", thumb: "🌌", episode: "E2" },
  { id: 4, title: "Arena Night", progress: 45, duration: "4h 00m", thumb: "🥊", episode: null },
];

const DEFAULT_CATEGORIES = [
  {
    name: "Reality",
    items: [
      { id: 20, title: "Charnita's World S1EP1", poster: poster("charnitas-world-s1ep1.png"), hlsUrl: hls("ad3176ed4fedb56c2575fced59e21674"), trailerUrl: hls("7ae1cc64a8e3c379319acf82caa8e703"), type: "Series", genre: "Reality", year: 2024, rating: "TV-PG", duration: "44m", description: "The life of Birmingham Socialite Charnita Horton and her family" },
      { id: 21, title: "Charnita's World S1EP3", poster: poster("charnitas-world-s1ep3.png"), hlsUrl: hls("978862668c06910b50b5d1b6714c1260"), trailerUrl: hls("7ae1cc64a8e3c379319acf82caa8e703"), type: "Series", genre: "Reality", year: 2024, rating: "TV-PG", duration: "44m", description: "The life of Birmingham Socialite Charnita Horton and her family" },
      { id: 23, title: "Charnita's World S1EP5", poster: p("charnitas-world-s1ep5.png"), hlsUrl: hls("e668112f6a3cbf10919271968c97c28f"), trailerUrl: hls("7ae1cc64a8e3c379319acf82caa8e703"), type: "Series", genre: "Reality", year: 2024, rating: "TV-PG", duration: "44m", description: "The life of Birmingham Socialite Charnita Horton and her family" },
      { id: 24, title: "Charnita's World S1EP6", poster: p("charnitas-world-s1ep6.png"), hlsUrl: hls("88f50d318c77f36d3aa90f044dbf283e"), trailerUrl: hls("7ae1cc64a8e3c379319acf82caa8e703"), type: "Series", genre: "Reality", year: 2024, rating: "TV-PG", duration: "44m", description: "The life of Birmingham Socialite Charnita Horton and her family" },
      { id: 25, title: "2 Koconut Heads", poster: p("2k-poster.png"), hlsUrl: hls("6c13a36b28c12fcdd40760c31a0e2132"), type: "Series", genre: "Reality", year: 2025, rating: "TV-PG", duration: "44m", description: "A beautiful couple with Caribbean roots travel the world interviewing celebrities and experiencing the finer things in life." },
      { id: 22, title: "Rockin With The Stars - Sneak Peek", poster: poster("rockin-with-the-stars-sneak-peek.png"), hlsUrl: hls("8df20177f191476dbf1d72b3dda6d9f5"), type: "VOD", genre: "Reality", year: 2025, description: "Up and coming talent showcase" },
    ],
  },
  {
    name: "Lifestyle",
    items: [
      { id: 40, title: "Yacht Living S1EP5", poster: p("yl-poster.png"), hlsUrl: hls("916bd388ec04cb01baa2bf9d5a57c39e"), type: "Series", genre: "Lifestyle", year: 2025, rating: "TV-14", duration: "44m", description: "A look at the most beautiful yachts for charter and sale" },
      { id: 41, title: "Horse Talk S1EP3", poster: p("horse-talk-poster.png"), hlsUrl: hls("c2f415fd160e45665513b5dec826e49a"), type: "Series", genre: "Lifestyle", year: 2023, description: "Life with horses hosted by Obba Babatunde" },
      { id: 42, title: "Africa a-la-carte", poster: p("alc-poster.png"), hlsUrl: hls("92ec6bce27c3f27394e777cca7d9791e"), type: "Series", genre: "Lifestyle", year: 2025, rating: "TV-14", duration: "44m", description: "Drina Li takes viewers around Africa and to her home country of Gabon" },
    ],
  },
  {
    name: "Movies",
    items: [
      { id: 50, title: "Rutland Manor", poster: poster("rutland-manor.png"), hlsUrl: hls("a90f760613916b84d22e7de55e7c2404"), type: "Movie", genre: "Movie", year: 2025, description: "A group of ambitious influencers accept an invite to a luxurious manor for a career-making social event. Survival is the only trend worth chasing." },
      { id: 51, title: "Panacea", poster: p("panacea-poster.png"), hlsUrl: hls("268902d88e0cdf8a5e2357d630dbf1f7"), type: "Movie", genre: "Movie", year: 2020, rating: "TV-PG", duration: "15m", description: "Panacea follows a man haunted by his past, who discovers an ethereal object that can cure him of all his pain and suffering. But at what cost?" },
      { id: 52, title: "3 OG's", poster: p("3-ogs-poster.png"), hlsUrl: hls("bdf883b962795b4044c88967a333fb45"), type: "Movie", genre: "Movie", year: 2024, description: "A stage play about the confrontation of 3 old friends" },
    ],
  },
  {
    name: "Documentaries",
    items: [
      { id: 30, title: "Troubled Water", poster: poster("troubled-water.png"), hlsUrl: hls("d96681ec8386f8769459af8980e417d1"), type: "Documentary", genre: "Documentary", year: 2023, description: "A look at environmental racism in America" },
      { id: 31, title: "American Hate", poster: p("american-hate-poster.png"), hlsUrl: hls("5fe405831cdbec5bd9e2c9c83031d726"), type: "Documentary", genre: "Documentary", year: 2023, rating: "TV-PG", duration: "44m", description: "An examination of Hate in America" },
      { id: 32, title: "A Soul Journey", poster: p("a-soul-journey-poster.jpeg"), hlsUrl: hls("5b68bf2f00d909217aa932be0e87d6ac"), type: "Documentary", genre: "Documentary", year: 2023, rating: "TV-PG", duration: "1h 30m", description: "A journey into Soul music through the lives and performances of some of the greatest Soul artists at Italy's Porretta Soul Festival." },
    ],
  },
  {
    name: "Live Now",
    items: [
      { id: 10, title: "Eastern",      thumb: "📺", type: "LIVE", tag: "LIVE", description: "Eastern Time — ET"  },
      { id: 15, title: "Central",      thumb: "📺", type: "LIVE", tag: "LIVE", description: "Central Time — CT"  },
      { id: 11, title: "Pacific",      thumb: "📺", type: "LIVE", tag: "LIVE", description: "Pacific Time — PT"  },
      { id: 12, title: "West Africa",  thumb: "📺", type: "LIVE", tag: "LIVE", description: "West Africa Time — WAT" },
      { id: 16, title: "Europe",       thumb: "📺", type: "LIVE", tag: "LIVE", description: "Central European Time — CET" },
      { id: 13, title: "Nubian Radio", thumb: "🎙️", type: "LIVE", tag: "LIVE", description: "Nubian Radio — Live Stream" },
    ],
  },
  {
    name: "Coming Soon",
    items: [],
  },
];

const ppvEvents = [
  { id: 1, title: "Championship Finals", subtitle: "World Cup Qualifier · Live", description: "Watch the biggest match of the season live. Two powerhouses go head-to-head for the championship title.", date: "Mar 15, 2026", time: "8:00 PM EST", buy_price: 19.99, rent_price: 9.99, thumb: "🏆", gradient: "linear-gradient(135deg, #1a0500, #2a1000)" },
  { id: 2, title: "Arena Night — Boxing", subtitle: "Heavyweight Championship", description: "The most anticipated heavyweight bout of the decade. Unlimited replays included with purchase.", date: "Mar 22, 2026", time: "9:00 PM EST", buy_price: 29.99, rent_price: 14.99, thumb: "🥊", gradient: "linear-gradient(135deg, #1a0010, #2a0020)" },
  { id: 3, title: "Global Music Fest", subtitle: "Live from Lagos · 12 Artists", description: "An all-night celebration of African music featuring 12 of the continent's biggest stars.", date: "Apr 5, 2026", time: "7:00 PM EST", buy_price: 14.99, rent_price: 7.99, thumb: "🎤", gradient: "linear-gradient(135deg, #001a10, #002a20)" },
];

const SCHEDULED_CHANNEL_IDS = [1, 5, 2, 3, 6];

const channels = [
  { id: 1, name: "Eastern",      current: "Live Now", next: "Coming Up", status: "live", thumb: "📺", blockOffsetSec: 0,     displayOffsetHr: 0,  tzLabel: "ET"  },
  { id: 5, name: "Central",      current: "Live Now", next: "Coming Up", status: "live", thumb: "📺", blockOffsetSec: 3600,  displayOffsetHr: -1, tzLabel: "CT"  },
  { id: 2, name: "Pacific",      current: "Live Now", next: "Coming Up", status: "live", thumb: "📺", blockOffsetSec: 10800, displayOffsetHr: -3, tzLabel: "PT"  },
  { id: 3, name: "West Africa",  current: "Live Now", next: "Coming Up", status: "live", thumb: "📺", blockOffsetSec: 0,     displayOffsetHr: 5,  tzLabel: "WAT" },
  { id: 6, name: "Europe",       current: "Live Now", next: "Coming Up", status: "live", thumb: "📺", blockOffsetSec: 7200,  displayOffsetHr: 6,  tzLabel: "CET" },
  { id: 4, name: "Nubian Radio", current: "Nubian Radio Live", next: "Coming Up", status: "live", thumb: "🎙️", isRadio: true },
];

const searchResults = [
  { id: 1, title: "Neon Requiem", thumb: "🎬", type: "Movie", year: 2024 },
  { id: 2, title: "Quiet Hours", thumb: "🎭", type: "Movie", year: 2024 },
  { id: 3, title: "City Night Jazz", thumb: "🎵", type: "Live", year: 2026 },
  { id: 4, title: "Cosmos: Remastered", thumb: "🌌", type: "Documentary", year: 2023 },
];

// ── EASTERN CHANNEL SCHEDULE ──────────────────────────────────────────────────

const AD_SLATE_ID = "5ddd6c7f8aa7108453155d183f200727";
const AD_SLATE_DURATION = 240;
const EASTERN_BLOCK = 14558; // total block = sum of all slot durations (video + ad breaks)

const EASTERN_SCHEDULE = [
  { title: "Africa a-la-carte",      videoId: "92ec6bce27c3f27394e777cca7d9791e", duration: 2640, adBreaks: [695, 977, 2010, 2378],  blockStart: 0     }, // slot: 3600s
  { title: "Charnita's World S1EP5", videoId: "e668112f6a3cbf10919271968c97c28f", duration: 2738, adBreaks: [837, 1222, 1588, 2239], blockStart: 3600  }, // slot: 3698s
  { title: "2 Koconut Heads",        videoId: "6c13a36b28c12fcdd40760c31a0e2132", duration: 1380, adBreaks: [450, 690],               blockStart: 7298  }, // slot: 1860s
  { title: "American Hate",          videoId: "5fe405831cdbec5bd9e2c9c83031d726", duration: 2640, adBreaks: [625, 1221, 2204, 2434],  blockStart: 9158  }, // slot: 3600s
  { title: "Horse Talk S1EP3",       videoId: "c2f415fd160e45665513b5dec826e49a", duration: 1320, adBreaks: [437, 951],               blockStart: 12758 }, // slot: 1800s
];

function getETSecondsSinceMidnight() {
  const etDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  return etDate.getHours() * 3600 + etDate.getMinutes() * 60 + etDate.getSeconds();
}

function formatET(totalSec) {
  const h = Math.floor(totalSec / 3600) % 24;
  const m = Math.floor((totalSec % 3600) / 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm} ET`;
}

// Returns { videoPos, isInAd, adSeek } given wall-clock seconds elapsed since show start
function calcEasternPos(timeInShow, adBreaks) {
  const breaks = [...adBreaks].sort((a, b) => a - b);
  let wallClock = 0, videoPos = 0;
  for (const breakAt of breaks) {
    const toBreak = breakAt - videoPos;
    if (wallClock + toBreak > timeInShow) {
      return { videoPos: videoPos + (timeInShow - wallClock), isInAd: false, adSeek: 0 };
    }
    wallClock += toBreak;
    videoPos = breakAt;
    if (wallClock + AD_SLATE_DURATION > timeInShow) {
      return { videoPos, isInAd: true, adSeek: timeInShow - wallClock };
    }
    wallClock += AD_SLATE_DURATION;
  }
  return { videoPos: videoPos + (timeInShow - wallClock), isInAd: false, adSeek: 0 };
}

// ── EASTERN CHANNEL COMPONENT ─────────────────────────────────────────────────

function ScheduledChannel({ muted, volume, blockOffsetSec, displayOffsetHr, tzLabel }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const currentVideoIdRef = useRef(null);
  const [nowPlaying, setNowPlaying] = useState("");
  const [upNext, setUpNext] = useState("");
  const [isAdSlate, setIsAdSlate] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState("");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayTimerRef = useRef(null);

  // Show overlay when show changes, then fade out after 5s
  useEffect(() => {
    if (!nowPlaying) return;
    setOverlayVisible(true);
    clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setOverlayVisible(false), 5000);
    return () => clearTimeout(overlayTimerRef.current);
  }, [nowPlaying]);

  function showOverlayBriefly() {
    setOverlayVisible(true);
    clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setOverlayVisible(false), 5000);
  }

  function loadVideo(videoId, seekPos) {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const url = hls(videoId);
    if (Hls.isSupported()) {
      const h = new Hls();
      hlsRef.current = h;
      h.loadSource(url);
      h.attachMedia(video);
      h.on(Hls.Events.MANIFEST_PARSED, () => {
        if (seekPos > 0) video.currentTime = seekPos;
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        if (seekPos > 0) video.currentTime = seekPos;
        video.play().catch(() => {});
      }, { once: true });
    }
  }

  useEffect(() => {
    function sync() {
      const etSec = getETSecondsSinceMidnight();

      // Apply offset: subtract blockOffsetSec to shift when block starts in ET terms
      const posInBlock = (etSec - blockOffsetSec + EASTERN_BLOCK * 100) % EASTERN_BLOCK;

      // Local display time
      const localSec = (etSec + displayOffsetHr * 3600 + 86400 * 10) % 86400;
      const h = Math.floor(localSec / 3600) % 24;
      const m = Math.floor((localSec % 3600) / 60);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      setTimeDisplay(`${h12}:${String(m).padStart(2, "0")} ${ampm} ${tzLabel}`);

      // Find current show
      let idx = 0;
      for (let i = EASTERN_SCHEDULE.length - 1; i >= 0; i--) {
        if (posInBlock >= EASTERN_SCHEDULE[i].blockStart) { idx = i; break; }
      }
      const show = EASTERN_SCHEDULE[idx];
      const nextShow = EASTERN_SCHEDULE[(idx + 1) % EASTERN_SCHEDULE.length];
      const timeInShow = posInBlock - show.blockStart;
      const { videoPos, isInAd, adSeek } = calcEasternPos(timeInShow, show.adBreaks);

      const targetId = isInAd ? AD_SLATE_ID : show.videoId;
      const targetPos = isInAd ? adSeek : videoPos;

      setIsAdSlate(isInAd);
      setNowPlaying(show.title);
      setUpNext(isInAd ? show.title : nextShow.title);

      if (currentVideoIdRef.current !== targetId) {
        currentVideoIdRef.current = targetId;
        loadVideo(targetId, targetPos);
      } else if (videoRef.current) {
        const drift = Math.abs(videoRef.current.currentTime - targetPos);
        if (drift > 15) videoRef.current.currentTime = targetPos;
      }
    }

    sync();
    const interval = setInterval(sync, 5000);
    return () => {
      clearInterval(interval);
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [blockOffsetSec, displayOffsetHr, tzLabel]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }} onMouseEnter={showOverlayBriefly}>
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <LiveBadge />
        {isAdSlate && (
          <span style={{ background: "#ff9500", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>AD</span>
        )}
      </div>
      <div style={{ position: "absolute", top: 16, right: 16, fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: "'DM Mono', monospace", background: "rgba(0,0,0,0.55)", padding: "3px 8px", borderRadius: 4 }}>
        {timeDisplay}
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "60px 24px 16px",
        background: "linear-gradient(to top, #000c, transparent)",
        pointerEvents: "none",
        opacity: overlayVisible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          {isAdSlate ? "Commercial Break" : `Now Playing: ${nowPlaying}`}
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>Up Next: {upNext}</div>
      </div>
    </div>
  );
}

// ── EPG TIMELINE ──────────────────────────────────────────────────────────────

function EPGTimeline({ channel }) {
  const scrollRef = useRef(null);
  const [, setTick] = useState(0);
  const PX_PER_MIN = 4;
  const RULER_H = 26;
  const ROW_H = 56;
  const BLOCK_MIN = EASTERN_BLOCK / 60; // 240 min

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  function getLocalMin() {
    const etSec = getETSecondsSinceMidnight();
    return (etSec + (channel.displayOffsetHr || 0) * 3600 + 86400 * 10) % 86400 / 60;
  }

  function fmtMin(min) {
    const m = ((Math.round(min) % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60) % 24;
    const mm = m % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
  }

  const localMin = getLocalMin();
  const HALF_WIN = 6 * 60;
  const windowStartMin = localMin - HALF_WIN;
  const windowEndMin = localMin + HALF_WIN;
  const totalWidth = 12 * 60 * PX_PER_MIN; // 2880px
  const toX = (m) => (m - windowStartMin) * PX_PER_MIN;
  const nowX = toX(localMin); // always = HALF_WIN * PX_PER_MIN

  let blocks = [];
  if (channel.isRadio) {
    blocks = [{ title: "24/7 Nubian Radio Live", x: 0, width: totalWidth, isCurrent: true }];
  } else {
    const anchorRaw = ((channel.blockOffsetSec || 0) + (channel.displayOffsetHr || 0) * 3600) / 60;
    const kStart = Math.floor((windowStartMin - anchorRaw) / BLOCK_MIN) - 1;
    const kEnd = Math.ceil((windowEndMin - anchorRaw) / BLOCK_MIN) + 1;
    for (let k = kStart; k <= kEnd; k++) {
      const cycleStart = anchorRaw + k * BLOCK_MIN;
      EASTERN_SCHEDULE.forEach((show, i) => {
        const showStartMin = cycleStart + show.blockStart / 60;
        const nextBs = i < EASTERN_SCHEDULE.length - 1 ? EASTERN_SCHEDULE[i + 1].blockStart : EASTERN_BLOCK;
        const showEndMin = cycleStart + nextBs / 60;
        if (showEndMin < windowStartMin || showStartMin > windowEndMin) return;
        blocks.push({
          title: show.title,
          x: toX(showStartMin),
          width: (showEndMin - showStartMin) * PX_PER_MIN,
          isCurrent: localMin >= showStartMin && localMin < showEndMin,
        });
      });
    }
  }

  const rulerTicks = [];
  const firstTick = Math.ceil(windowStartMin / 30) * 30;
  for (let m = firstTick; m <= windowEndMin; m += 30) {
    rulerTicks.push({ x: toX(m), label: fmtMin(m) });
  }

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollLeft = nowX - scrollRef.current.clientWidth / 2;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  return (
    <div style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", overflow: "hidden" }}>
      <div ref={scrollRef} style={{ overflowX: "auto", overflowY: "hidden", scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}>
        <div style={{ position: "relative", width: totalWidth, height: RULER_H + ROW_H }}>
          {/* Ruler */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: RULER_H, background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
            {rulerTicks.map(({ x, label }) => (
              <div key={x} style={{ position: "absolute", left: x, top: 0, height: "100%" }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: 1, height: "100%", background: "var(--border)" }} />
                <span style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text3)", whiteSpace: "nowrap" }}>{label}</span>
              </div>
            ))}
          </div>
          {/* Show blocks */}
          <div style={{ position: "absolute", top: RULER_H, left: 0, width: "100%", height: ROW_H }}>
            {blocks.map((b, i) => (
              <div key={i} style={{
                position: "absolute", left: b.x + 1, top: 6,
                width: Math.max(b.width - 2, 2), height: ROW_H - 12,
                background: b.isCurrent ? "var(--accent)" : "var(--surface)",
                border: `1px solid ${b.isCurrent ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", padding: "0 8px",
              }}>
                <span style={{ fontSize: 11, fontWeight: b.isCurrent ? 700 : 400, color: b.isCurrent ? "white" : "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.title}
                </span>
              </div>
            ))}
          </div>
          {/* NOW indicator */}
          <div style={{ position: "absolute", left: nowX, top: 0, width: 2, height: RULER_H + ROW_H, background: "#e50914", zIndex: 10, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 3, left: -12, background: "#e50914", borderRadius: 3, padding: "1px 4px", fontSize: 9, color: "white", fontWeight: 800, letterSpacing: "0.03em" }}>NOW</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span style={{
      background: "var(--live)", color: "white",
      fontSize: 10, fontWeight: 700, padding: "2px 7px",
      borderRadius: 3, fontFamily: "'DM Mono', monospace",
      letterSpacing: 1, animation: "pulse 2s infinite",
    }}>● LIVE</span>
  );
}

function ContentCard({ item, onClick }) {
  const w = useWindowWidth();
  const [hovered, setHovered] = useState(false);
  const { t } = useLang();
  const isLive = item.type === "LIVE";
  const cardW = w < 768 ? 140 : 200;
  const cardH = Math.round(cardW * (4 / 3));
  const titleFontSize = w < 768 ? 11 : 13;

  return (
    <div
      onClick={() => onClick && onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: cardW, flexShrink: 0, cursor: "pointer",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.2s ease",
        zIndex: hovered ? 10 : 1, position: "relative",
      }}
    >
      {/* Poster thumbnail */}
      <div style={{
        width: cardW, height: cardH,
        background: `linear-gradient(160deg, #1a1a2e, #111)`,
        borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: w < 768 ? 28 : 48, border: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        {item.poster
          ? <img src={item.poster} alt={item.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <span>{item.thumb}</span>
        }

        {/* Bottom gradient for title */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "28px 10px 10px",
          background: "linear-gradient(to top, #000d, transparent)",
          fontSize: titleFontSize, fontWeight: 600,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{item.title}</div>

        {isLive && (
          <div style={{ position: "absolute", top: 8, left: 8 }}><LiveBadge /></div>
        )}
        {item.match && (
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: 10, color: "var(--green)", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{item.match}%</div>
        )}

        {/* Hover overlay with play button */}
        {hovered && (
          <div style={{
            position: "absolute", inset: 0, background: "#000a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "white", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 20, marginLeft: 4 }}>▶</span>
            </div>
          </div>
        )}
      </div>

      {/* Info panel below on hover */}
      {hovered && (
        <div style={{
          background: "var(--surface)", borderRadius: "0 0 8px 8px",
          padding: "10px 12px", border: "1px solid var(--border)", borderTop: "none",
          position: "absolute", left: 0, right: 0, top: cardH - 1, zIndex: 20,
          boxShadow: "0 8px 24px #000a",
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
            {isLive ? (
              <span style={{ fontSize: 11, color: "var(--text3)" }}>👁 {item.viewers}</span>
            ) : (
              <>
                {item.year && <span style={{ fontSize: 11, color: "var(--green)" }}>{item.year}</span>}
                {item.rating && <span style={{ fontSize: 10, border: "1px solid var(--text3)", color: "var(--text3)", padding: "0 4px", borderRadius: 2 }}>{item.rating}</span>}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ background: "white", color: "black", borderRadius: 4, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>▶ {t.play}</button>
            <button style={{ background: "var(--surface2)", color: "white", borderRadius: 4, padding: "5px 10px", fontSize: 11, border: "1px solid var(--border)" }}>{t.addToList}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentRow({ category, onSelect }) {
  const w = useWindowWidth();
  const rowRef = useRef(null);
  if (!category.items || category.items.length === 0) return null;
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
  };
  const sidePad = w < 768 ? 16 : 48;

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, paddingLeft: sidePad }}>{category.name}</div>
      <div style={{ position: "relative" }}>
        {w >= 768 && (
          <button onClick={() => scroll(-1)} style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
            background: "linear-gradient(to right, var(--bg), transparent)",
            color: "white", fontSize: 20, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
        )}
        <div ref={rowRef} style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingLeft: sidePad, paddingRight: sidePad,
          scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 30,
          WebkitOverflowScrolling: "touch",
        }}>
          {category.items.map(item => (
            <ContentCard key={item.id} item={item} onClick={onSelect} />
          ))}
        </div>
        {w >= 768 && (
          <button onClick={() => scroll(1)} style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
            background: "linear-gradient(to left, var(--bg), transparent)",
            color: "white", fontSize: 20, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>›</button>
        )}
      </div>
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────

const HERO_HLS_URL = "https://customer-nbylg9nks43yj4vv.cloudflarestream.com/c9c2165b624096cb9cb84b2aef2f2ccd/manifest/video.m3u8";

function Hero({ onPlay, t }) {
  const w = useWindowWidth();
  const heroHeight = w < 768 ? "60vh" : "85vh";
  const titleFontSize = w < 768 ? 36 : w < 1024 ? 56 : 72;
  const sidePad = w < 768 ? 16 : 48;
  const bgVideoRef = useRef(null);
  const bgHlsRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const h = new Hls();
      bgHlsRef.current = h;
      h.loadSource(HERO_HLS_URL);
      h.attachMedia(video);
      h.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      video.addEventListener("ended", () => { video.currentTime = 0; video.play().catch(() => {}); });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HERO_HLS_URL;
      video.play().catch(() => {});
    }
    return () => { bgHlsRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    if (bgVideoRef.current) bgVideoRef.current.muted = muted;
  }, [muted]);

  return (
    <div style={{ position: "relative", height: heroHeight, minHeight: 320, overflow: "hidden" }}>
      {/* Background HLS video */}
      <video
        ref={bgVideoRef}
        muted
        playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", pointerEvents: "none",
        }}
      />

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, #00000088 60%, #00000044 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--bg) 0%, transparent 55%)" }} />

      {/* Content */}
      <div style={{ position: "absolute", bottom: w < 768 ? "20%" : "18%", left: sidePad, maxWidth: w < 768 ? "calc(100% - 32px)" : 520 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: titleFontSize,
          letterSpacing: 3, lineHeight: 1, marginBottom: 16,
          textShadow: "0 2px 20px #000a",
        }}>{featured.title}</div>

        {/* Info badges — hidden on mobile */}
        {w >= 768 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ color: "var(--green)", fontSize: 13, fontWeight: 600 }}>{featured.match} Match</span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{featured.year}</span>
            <span style={{ fontSize: 11, border: "1px solid var(--text3)", color: "var(--text3)", padding: "1px 6px", borderRadius: 2 }}>{featured.rating}</span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{featured.duration}</span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{featured.genre}</span>
          </div>
        )}

        {/* Description — hidden on mobile */}
        {w >= 768 && (
          <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 24, maxWidth: 440 }}>
            {featured.description}
          </div>
        )}

        <div style={{
          display: "flex",
          flexDirection: w < 768 ? "column" : "row",
          alignItems: w < 768 ? "flex-start" : "center",
          gap: 12,
          marginTop: w < 768 ? 16 : 0,
        }}>
          <button onClick={onPlay} style={{
            background: "white", color: "black",
            padding: "12px 28px", borderRadius: 6,
            fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", gap: 8,
            transition: "background 0.15s",
          }}>▶ {t.play}</button>
        </div>
      </div>

      {/* Mute/unmute button — bottom right */}
      <button
        onClick={() => setMuted(m => !m)}
        style={{
          position: "absolute", bottom: 20, right: 20,
          background: "#00000066", border: "1px solid #ffffff33",
          color: "white", borderRadius: "50%",
          width: 40, height: 40, fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", transition: "background 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#000000aa"}
        onMouseLeave={e => e.currentTarget.style.background = "#00000066"}
      >{muted ? "🔇" : "🔊"}</button>
    </div>
  );
}

// ── CONTINUE WATCHING ─────────────────────────────────────────────────────────

function ContinueWatchingCard({ item, onSelect }) {
  const w = useWindowWidth();
  const [hovered, setHovered] = useState(false);
  const cardW = w < 768 ? 140 : 200;
  const cardH = Math.round(cardW * (4 / 3));
  const titleFontSize = w < 768 ? 11 : 13;
  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: cardW, flexShrink: 0, cursor: "pointer",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.2s ease",
        zIndex: hovered ? 10 : 1, position: "relative",
      }}
    >
      <div style={{
        width: cardW, height: cardH,
        background: "linear-gradient(160deg, #1a1a2e, #111)",
        borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: w < 768 ? 28 : 48, border: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        {item.poster
          ? <img src={item.poster} alt={item.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <span>{item.thumb || "🎬"}</span>
        }
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "28px 10px 10px",
          background: "linear-gradient(to top, #000d, transparent)",
          fontSize: titleFontSize, fontWeight: 600,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{item.title}</div>
        {hovered && (
          <div style={{ position: "absolute", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, marginLeft: 4 }}>▶</span>
            </div>
          </div>
        )}
      </div>
      {hovered && (
        <div style={{
          background: "var(--surface)", borderRadius: "0 0 8px 8px",
          padding: "10px 12px", border: "1px solid var(--border)", borderTop: "none",
          position: "absolute", left: 0, right: 0, top: cardH - 1, zIndex: 20,
          boxShadow: "0 8px 24px #000a",
        }}>
          {item.year && <span style={{ fontSize: 11, color: "var(--green)", marginRight: 6 }}>{item.year}</span>}
          {item.rating && <span style={{ fontSize: 10, border: "1px solid var(--text3)", color: "var(--text3)", padding: "0 4px", borderRadius: 2 }}>{item.rating}</span>}
        </div>
      )}
    </div>
  );
}

function ContinueWatching({ onSelect }) {
  const w = useWindowWidth();
  const sidePad = w < 768 ? 16 : 48;
  const items = getWatched();

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 40, marginTop: w < 768 ? 16 : -80, position: "relative", zIndex: 2 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, paddingLeft: sidePad }}>Previously Watched</div>
      <div style={{
        display: "flex", gap: 10, paddingLeft: sidePad, paddingRight: sidePad,
        overflowX: "auto", scrollbarWidth: "none", paddingBottom: 8,
        WebkitOverflowScrolling: "touch",
      }}>
        {items.map(item => (
          <ContinueWatchingCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ── LIVE TV ───────────────────────────────────────────────────────────────────

function RadioVisualizer({ muted }) {
  const bars = [3, 5, 8, 6, 4, 7, 5, 9, 6, 4, 8, 5, 7, 4, 6];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          background: muted ? "var(--text3)" : "var(--accent)",
          height: muted ? 8 : undefined,
          animation: muted ? "none" : `radioBar${i % 4} ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
          minHeight: 4,
        }} />
      ))}
    </div>
  );
}

const SC_EMBED_URL = "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/djbossforever/sets/r-b-and-soul&color=%23ff0000&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false";

function LiveTV({ t, initialChannelId }) {
  const w = useWindowWidth();
  const [activeChannel, setActiveChannel] = useState(
    () => (initialChannelId ? channels.find(c => c.id === initialChannelId) : null) || channels[0]
  );

  useEffect(() => {
    if (initialChannelId) {
      const ch = channels.find(c => c.id === initialChannelId);
      if (ch) setActiveChannel(ch);
    }
  }, [initialChannelId]);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const isMobile = w < 768;
  const sidePad = isMobile ? 16 : 48;
  const isRadio = !!activeChannel.isRadio;

  // Reset radio state when switching away
  useEffect(() => {
    if (!isRadio) setRadioPlaying(false);
  }, [isRadio]);

  // HLS video effect
  useEffect(() => {
    if (isRadio) return;
    if (SCHEDULED_CHANNEL_IDS.includes(activeChannel.id)) return; // scheduled channels manage their own HLS
    const video = videoRef.current;
    if (!video || !activeChannel.hlsUrl) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    let h;
    if (Hls.isSupported()) {
      h = new Hls();
      hlsRef.current = h;
      h.loadSource(activeChannel.hlsUrl);
      h.attachMedia(video);
      h.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = activeChannel.hlsUrl;
      video.play().catch(() => {});
    }
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [activeChannel, isRadio]);

  // Sync mute/volume to video
  useEffect(() => {
    if (!isRadio && videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume, isRadio]);

  const radioBarKeyframes = `
    @keyframes radioBar0 { from { height: 8px } to { height: 36px } }
    @keyframes radioBar1 { from { height: 12px } to { height: 44px } }
    @keyframes radioBar2 { from { height: 6px } to { height: 28px } }
    @keyframes radioBar3 { from { height: 10px } to { height: 40px } }
  `;

  return (
    <div style={{ padding: `24px ${sidePad}px` }}>
      <style>{radioBarKeyframes}</style>

{/* SoundCloud iframe — rendered inside radio UI when playing */}

      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 6 }}>{t.liveTVTitle}</div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>{t.liveTVSubtitle}</div>

      {/* Mobile: channel tabs */}
      {isMobile && (
        <div style={{
          display: "flex", overflowX: "auto", gap: 8, marginBottom: 16,
          scrollbarWidth: "none", WebkitOverflowScrolling: "touch", paddingBottom: 4,
        }}>
          {channels.map(ch => (
            <button key={ch.id} onClick={() => setActiveChannel(ch)} style={{
              flexShrink: 0,
              background: activeChannel.id === ch.id ? "var(--accent)" : "var(--surface)",
              color: "white", borderRadius: 20, padding: "7px 16px", fontSize: 12,
              border: activeChannel.id === ch.id ? "none" : "1px solid var(--border)",
              fontWeight: activeChannel.id === ch.id ? 700 : 400,
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
              <span>{ch.thumb}</span><span>{ch.name}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20 }}>
        {/* Main player area */}
        <div style={{ background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", flex: 1 }}>
          <div style={{ position: "relative", background: "#000" }}>
            {isRadio ? (
              /* Radio UI */
              <div style={{
                aspectRatio: "16/9",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 24,
                background: "radial-gradient(ellipse at center, #1a0a1a 0%, #0a0a0a 70%)",
                position: "relative", overflow: "hidden",
              }}>
                {/* Background glow */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, #e5091422 0%, transparent 60%)", pointerEvents: "none" }} />

                {/* Station icon */}
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: "linear-gradient(135deg, #1a1a2e, #2a1a2a)",
                  border: "2px solid var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 44,
                  boxShadow: radioPlaying ? "0 0 40px #e5091444" : "none",
                }}>🎙️</div>

                {/* Station name */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3 }}>Nubian Radio</div>
                  <div style={{ fontSize: 13, color: radioPlaying ? "var(--accent)" : "var(--text3)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                    {radioPlaying ? "● NOW PLAYING" : "● READY TO PLAY"}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 6 }}>Nubian Radio Live</div>
                </div>

                {/* Play button or animated bars */}
                {radioPlaying ? (
                  <>
                    <RadioVisualizer muted={false} />
                    <button onClick={() => setRadioPlaying(false)} style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      color: "var(--text2)", borderRadius: "50%", width: 44, height: 44,
                      fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}>⏹</button>
                  </>
                ) : (
                  <button onClick={() => setRadioPlaying(true)} style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "var(--accent)", border: "none",
                    color: "white", fontSize: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 0 32px #e5091466",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 0 48px #e5091488"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 32px #e5091466"; }}
                  >▶</button>
                )}

                {/* Hidden SoundCloud iframe */}
                {radioPlaying && (
                  <iframe
                    id="sc-radio-player"
                    title="Nubian Radio"
                    src={SC_EMBED_URL}
                    allow="autoplay"
                    style={{ position: "absolute", width: 0, height: 0, border: 0, visibility: "hidden", pointerEvents: "none" }}
                    onLoad={() => {
                      const loadApi = () => {
                        const widget = window.SC.Widget(document.getElementById("sc-radio-player"));
                        widget.bind(window.SC.Widget.Events.READY, () => {
                          widget.getDuration(totalMs => {
                            if (!totalMs) return;
                            const totalSec = totalMs / 1000;
                            const offsetSec = (Date.now() / 1000) % totalSec;
                            widget.seekTo(offsetSec * 1000);
                          });
                        });
                      };
                      if (window.SC && window.SC.Widget) {
                        loadApi();
                      } else {
                        const script = document.createElement("script");
                        script.src = "https://w.soundcloud.com/player/api.js";
                        script.onload = loadApi;
                        document.head.appendChild(script);
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              /* Video player */
              <>
                {SCHEDULED_CHANNEL_IDS.includes(activeChannel.id) ? (
                  <ScheduledChannel
                    key={activeChannel.id}
                    muted={muted}
                    volume={volume}
                    blockOffsetSec={activeChannel.blockOffsetSec}
                    displayOffsetHr={activeChannel.displayOffsetHr}
                    tzLabel={activeChannel.tzLabel}
                  />
                ) : activeChannel.hlsUrl ? (
                  <video
                    ref={videoRef}
                    muted={muted}
                    style={{ width: "100%", aspectRatio: "16/9", display: "block", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 80 }}>{activeChannel.thumb}</span>
                  </div>
                )}
                {!SCHEDULED_CHANNEL_IDS.includes(activeChannel.id) && (
                  <>
                    <div style={{ position: "absolute", top: 16, left: 16 }}><LiveBadge /></div>
                    <div style={{ position: "absolute", bottom: 48, left: 0, right: 0, padding: "60px 24px 16px", background: "linear-gradient(to top, #000, transparent)", pointerEvents: "none" }}>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{activeChannel.current}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{t.upNext}: {activeChannel.next}</div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {!isRadio && (
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{activeChannel.name}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{activeChannel.current}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => setMuted(m => !m)} style={{ background: "var(--surface2)", color: "white", borderRadius: 6, padding: "7px 12px", fontSize: 14, border: "1px solid var(--border)" }}>{muted ? "🔇" : "🔊"}</button>
                <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                  onChange={e => { setVolume(Number(e.target.value)); if (muted) setMuted(false); }}
                  style={{ width: 80, accentColor: "var(--accent)" }}
                />
                <button style={{ background: "var(--accent)", color: "white", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600 }}>📺 {t.cast}</button>
              </div>
            </div>
          )}
          <EPGTimeline channel={activeChannel} />
        </div>

        {/* Channel list — desktop sidebar */}
        {!isMobile && (
          <div style={{ width: 320, background: "var(--bg2)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{t.allChannels}</div>
            {channels.map(ch => (
              <div key={ch.id} onClick={() => setActiveChannel(ch)} style={{
                padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                background: activeChannel.id === ch.id ? "var(--surface)" : "transparent",
                borderBottom: "1px solid var(--border)", transition: "background 0.15s",
                borderLeft: activeChannel.id === ch.id ? "3px solid var(--accent)" : "3px solid transparent",
              }}
                onMouseEnter={e => { if (activeChannel.id !== ch.id) e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { if (activeChannel.id !== ch.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 24 }}>{ch.thumb}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ch.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.current}</div>
                </div>
                <LiveBadge />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PPV SECTION ───────────────────────────────────────────────────────────────

const PPV_KEY = "nubian_ppv_purchases";

function getPPVPurchases() {
  try { return JSON.parse(localStorage.getItem(PPV_KEY) || "[]"); }
  catch { return []; }
}

function savePPVPurchase(eventId, type) {
  const purchases = getPPVPurchases().filter(p => p.event_id !== eventId);
  purchases.push({
    event_id: eventId,
    type,
    expires: type === "rent" ? Date.now() + 48 * 60 * 60 * 1000 : null,
  });
  localStorage.setItem(PPV_KEY, JSON.stringify(purchases));
}

function isPPVOwned(eventId) {
  const purchases = getPPVPurchases();
  const p = purchases.find(x => x.event_id === eventId);
  if (!p) return false;
  if (p.type === "rent" && p.expires && Date.now() > p.expires) return false;
  return true;
}

async function startPPVCheckout(ev, type) {
  try {
    const res = await fetch(`${API_BASE}/api/stripe/create-ppv-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: ev.id, type }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Could not start checkout. Please try again.");
  } catch { alert("Could not start checkout. Please try again."); }
}

function fmtEventDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  } catch { return d; }
}

function PPVSection({ t, subscription }) {
  const w = useWindowWidth();
  const sidePad = w < 768 ? 16 : 48;
  const gridCols = w < 768 ? "1fr" : w < 1024 ? "1fr 1fr" : "1fr 1fr 1fr";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState(() => getPPVPurchases());
  const [signInPrompt, setSignInPrompt] = useState(null);
  const [checkingSession, setCheckingSession] = useState(false);

  // Load events from API
  useEffect(() => {
    fetch(`${API_BASE}/api/ppv`)
      .then(r => r.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Check for ppv_session_id in URL after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("ppv_session_id");
    const eventId = params.get("event_id");
    const type = params.get("type");
    if (!sessionId || !eventId) return;
    setCheckingSession(true);
    fetch(`${API_BASE}/api/subscription/verify?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.payment_status === "paid") {
          savePPVPurchase(Number(eventId), type || "buy");
          setPurchases(getPPVPurchases());
        }
      })
      .catch(() => {})
      .finally(() => {
        setCheckingSession(false);
        // Clean URL without reload
        const clean = window.location.pathname;
        window.history.replaceState({}, "", clean);
      });
  }, []);

  const handlePurchase = (ev, type) => {
    if (!subscription?.subscribed) {
      setSignInPrompt({ ev, type });
      return;
    }
    startPPVCheckout(ev, type);
  };

  const owned = (evId) => isPPVOwned(evId) || purchases.some(p => {
    if (p.event_id !== evId) return false;
    if (p.type === "rent" && p.expires && Date.now() > p.expires) return false;
    return true;
  });

  return (
    <div style={{ padding: `24px ${sidePad}px` }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 6 }}>{t.ppvTitle}</div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>{t.ppvSubtitle}</div>

      {checkingSession && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--accent)", borderRadius: 10, padding: "14px 20px", marginBottom: 20, fontSize: 13, color: "var(--accent)" }}>
          Verifying your purchase...
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14, letterSpacing: 1 }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>★</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, marginBottom: 8 }}>No Events Scheduled</div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>Check back soon for upcoming Pay-Per-View events.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20 }}>
          {events.map(ev => {
            const isOwned = owned(ev.id);
            const posterUrl = ev.poster_filename
              ? (ev.poster_filename.startsWith("http") ? ev.poster_filename : `${R2}/${ev.poster_filename}`)
              : null;
            return (
              <div key={ev.id} style={{ background: "linear-gradient(135deg, #0a0a14, #111120)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 200, position: "relative", background: "#0d0d1a", overflow: "hidden" }}>
                  {posterUrl ? (
                    <img src={posterUrl} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>★</div>
                  )}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "var(--accent)", color: "black", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>PAY-PER-VIEW</div>
                  {ev.status === "live" && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "#ff2d55", color: "white", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>● LIVE</div>
                  )}
                </div>
                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, marginBottom: 6 }}>{ev.title}</div>
                  {ev.description && <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14, lineHeight: 1.5, flex: 1 }}>{ev.description}</div>}
                  {ev.event_date && (
                    <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>📅 {fmtEventDate(ev.event_date)}</div>
                  )}
                  {isOwned ? (
                    <button style={{ background: "var(--green)", color: "black", borderRadius: 8, padding: "12px 20px", fontWeight: 800, fontSize: 14, width: "100%", border: "none" }}>
                      ▶ Watch Now
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                      {ev.buy_price != null && (
                        <button onClick={() => handlePurchase(ev, "buy")} style={{ background: "var(--accent)", color: "black", borderRadius: 8, padding: "11px 16px", fontWeight: 800, fontSize: 14, width: "100%", border: "none" }}>
                          Buy ${Number(ev.buy_price).toFixed(2)}
                        </button>
                      )}
                      {ev.rent_price != null && (
                        <button onClick={() => handlePurchase(ev, "rent")} style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", fontWeight: 600, fontSize: 13, width: "100%" }}>
                          Rent 48hrs ${Number(ev.rent_price).toFixed(2)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sign-in prompt modal */}
      {signInPrompt && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, maxWidth: 380, width: "100%", position: "relative" }}>
            <button onClick={() => setSignInPrompt(null)} style={{ position: "absolute", top: 14, right: 14, background: "transparent", color: "var(--text3)", fontSize: 20, lineHeight: 1, border: "none" }}>✕</button>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🔐</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Sign in to purchase</div>
            <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 24 }}>
              You need a Nubian Television account to purchase Pay-Per-View events.
            </div>
            <button
              onClick={() => { setSignInPrompt(null); startPPVCheckout(signInPrompt.ev, signInPrompt.type); }}
              style={{ background: "var(--accent)", color: "black", borderRadius: 8, padding: "12px 20px", fontWeight: 800, fontSize: 14, width: "100%", marginBottom: 10, border: "none" }}
            >
              Continue as Guest
            </button>
            <button onClick={() => setSignInPrompt(null)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 8, padding: "10px 20px", fontSize: 13, width: "100%" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SEARCH ────────────────────────────────────────────────────────────────────

function SearchPanel({ query, onSelect, t }) {
  const w = useWindowWidth();
  const sidePad = w < 768 ? 16 : 48;
  const gridCols = w < 768 ? "1fr" : w < 1024 ? "1fr 1fr" : "repeat(3, 1fr)";

  const filtered = query.length > 1
    ? searchResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    : searchResults;

  return (
    <div style={{ padding: `24px ${sidePad}px` }}>
      {query.length > 1 && (
        <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 20 }}>
          {t.searchResults} <span style={{ color: "white", fontWeight: 600 }}>"{query}"</span>
        </div>
      )}
      {query.length === 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{t.popularSearches}</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12 }}>
        {filtered.map(item => (
          <div key={item.id} onClick={() => onSelect(item)} style={{
            background: "var(--bg2)", borderRadius: 8, overflow: "hidden",
            border: "1px solid var(--border)", cursor: "pointer", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{ height: 100, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
              {item.thumb}
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{item.type} · {item.year}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PLAYER MODAL ──────────────────────────────────────────────────────────────

function PlayerModal({ item, onClose }) {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const videoRef = useRef(null);
  const [showUnmute, setShowUnmute] = useState(true);
  const [unmuteFading, setUnmuteFading] = useState(false);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (video) { video.muted = false; video.volume = 1; }
    setShowUnmute(false);
  };

  useEffect(() => {
    if (!showUnmute) return;
    const fadeTimer = setTimeout(() => setUnmuteFading(true), 4500);
    const hideTimer = setTimeout(() => setShowUnmute(false), 5000);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, [showUnmute]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item.hlsUrl) return;
    setShowUnmute(true);
    setUnmuteFading(false);

    const onReady = () => {
      video.muted = true;
      video.volume = 1;
      video.play().catch(() => {});
    };

    if (Hls.isSupported()) {
      const hlsInstance = new Hls();
      hlsInstance.loadSource(item.hlsUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, onReady);
      return () => hlsInstance.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = item.hlsUrl;
      video.addEventListener("loadedmetadata", onReady, { once: true });
    }
  }, [item]);

  const modalStyle = isMobile
    ? {
        position: "fixed", inset: 0, borderRadius: 0,
        width: "100vw", height: "100vh",
        background: "var(--bg2)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }
    : {
        width: "80vw", maxWidth: 900,
        background: "var(--bg2)", borderRadius: 16,
        overflow: "hidden", border: "1px solid var(--border)",
      };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: isMobile ? "#000" : "#000e",
        zIndex: 1000, display: "flex",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "center",
      }}
      onClick={isMobile ? undefined : onClose}
    >
      <div onClick={e => e.stopPropagation()} style={modalStyle}>
        <div style={{ position: "relative", background: "#000", flex: isMobile ? "none" : undefined }}>
          {item.hlsUrl ? (
            <>
              <video
                ref={videoRef}
                controls
                muted
                style={{ width: "100%", maxHeight: isMobile ? "55vh" : 480, display: "block" }}
              />
              {showUnmute && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                }}>
                  <button
                    onClick={handleUnmute}
                    style={{
                      pointerEvents: "all",
                      background: "rgba(0,0,0,0.72)",
                      border: "2px solid rgba(255,255,255,0.6)",
                      borderRadius: 50,
                      color: "#fff",
                      fontSize: isMobile ? 16 : 18,
                      fontWeight: 600,
                      padding: "14px 28px",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      backdropFilter: "blur(6px)",
                      transition: "opacity 0.5s",
                      opacity: unmuteFading ? 0 : 1,
                      letterSpacing: 0.5,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>🔊</span> Tap to Unmute
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ height: isMobile ? "55vh" : 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 100, opacity: 0.3 }}>{item.thumb}</span>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ffffff22", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ffffff44" }}>
                  <span style={{ fontSize: 28, marginLeft: 5 }}>▶</span>
                </div>
              </div>
            </div>
          )}
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#000a", color: "white", borderRadius: "50%", width: 36, height: 36, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1 }}>{item.title}</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{item.type} · {item.year || "Live"}</div>
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────────────────

function Navbar({ page, setPage, searchQuery, setSearchQuery, scrolled, onRadioClick, subscription, onManageSubscription }) {
  const w = useWindowWidth();
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();
  const isMobile = w < 768;

  const navLinks = [
    { id: "home", label: t.home },
    { id: "live", label: t.liveTV },
    { id: "ppv", label: t.ppv },
  ];

  const handleNavClick = (id) => {
    if (id === "radio") {
      onRadioClick && onRadioClick();
      setMenuOpen(false);
    } else {
      setPage(id);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "var(--bg)" : "linear-gradient(to bottom, #000a, transparent)",
        transition: "background 0.3s",
        padding: isMobile ? "0 16px" : "0 48px", height: 64,
        display: "flex", alignItems: "center", gap: isMobile ? 0 : 32,
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
      }}>
        {/* Logo */}
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0, flex: isMobile ? 1 : "none" }}>
          <img src="/logo.png" alt="Nubian Black Television" style={{ height: 36, width: "auto" }} />
        </div>

        {/* Desktop: Nav links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 24, flex: 1 }}>
            {navLinks.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                background: "transparent", color: page === n.id ? "white" : "var(--text2)",
                fontSize: 14, fontWeight: page === n.id ? 600 : 400,
                transition: "color 0.15s", padding: 0,
                borderBottom: page === n.id ? "2px solid var(--accent)" : "2px solid transparent",
                paddingBottom: 2,
              }}>{n.label}</button>
            ))}
          </div>
        )}

        {/* Desktop: Right controls */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {showSearch ? (
              <input
                autoFocus
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage("search"); }}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                placeholder={t.searchPlaceholder}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "7px 14px", color: "white", fontSize: 13,
                  outline: "none", width: 220,
                }}
              />
            ) : (
              <button onClick={() => setShowSearch(true)} style={{ background: "transparent", color: "var(--text2)", fontSize: 18 }}>🔍</button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--live)22", border: "1px solid var(--live)44", borderRadius: 20, padding: "4px 10px", cursor: "pointer" }} onClick={() => setPage("live")}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--live)", display: "block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--live)", fontFamily: "'DM Mono', monospace" }}>3 LIVE</span>
            </div>
            {subscription?.guest ? (
              <span style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Guest</span>
            ) : subscription?.subscribed ? (
              <button onClick={onManageSubscription} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Manage</button>
            ) : (
              <button onClick={() => setPage("subscribe")} style={{ background: "var(--accent)", color: "white", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Subscribe</button>
            )}
            <LanguageSwitcher />
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>N</div>
          </div>
        )}

        {/* Mobile: search + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => { setShowSearch(s => !s); if (!showSearch) setMenuOpen(false); }} style={{ background: "transparent", color: "var(--text2)", fontSize: 18, padding: 4 }}>🔍</button>
            <button onClick={() => { setMenuOpen(o => !o); setShowSearch(false); }} style={{ background: "transparent", color: "white", fontSize: 22, padding: 4, lineHeight: 1 }}>☰</button>
          </div>
        )}
      </div>

      {/* Mobile: search bar below navbar */}
      {isMobile && showSearch && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
          padding: "10px 16px",
        }}>
          <input
            autoFocus
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage("search"); }}
            onBlur={() => { if (!searchQuery) setShowSearch(false); }}
            placeholder={t.searchPlaceholder}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "10px 14px", color: "white", fontSize: 14,
              outline: "none", width: "100%",
            }}
          />
        </div>
      )}

      {/* Mobile: dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: "var(--bg)", borderBottom: "1px solid var(--border)",
          padding: "8px 0",
        }}>
          {navLinks.map(n => (
            <button key={n.id} onClick={() => handleNavClick(n.id)} style={{
              display: "block", width: "100%", textAlign: "left",
              background: page === n.id ? "var(--surface)" : "transparent",
              color: page === n.id ? "white" : "var(--text2)",
              fontSize: 15, fontWeight: page === n.id ? 600 : 400,
              padding: "14px 20px",
              borderLeft: page === n.id ? "3px solid var(--accent)" : "3px solid transparent",
            }}>{n.label}</button>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--live)22", border: "1px solid var(--live)44", borderRadius: 20, padding: "4px 10px", cursor: "pointer" }} onClick={() => { setPage("live"); setMenuOpen(false); }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--live)", display: "block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--live)", fontFamily: "'DM Mono', monospace" }}>3 LIVE</span>
            </div>
            {subscription?.guest ? (
              <span style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Guest</span>
            ) : subscription?.subscribed ? (
              <button onClick={() => { onManageSubscription(); setMenuOpen(false); }} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Manage Subscription</button>
            ) : (
              <button onClick={() => { setPage("subscribe"); setMenuOpen(false); }} style={{ background: "var(--accent)", color: "white", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 700 }}>Subscribe</button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}

function SocialIcon({ url, brand, label, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? brand : "#666",
        transition: "color 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

// ── STATIC PAGES ──────────────────────────────────────────────────────────────

function PageShell({ children }) {
  const w = useWindowWidth();
  return (
    <div style={{ paddingTop: 100, paddingBottom: 60, maxWidth: 860, margin: "0 auto", padding: `100px ${w < 768 ? 20 : 48}px 60px` }}>
      {children}
    </div>
  );
}

function PageHeading({ children }) {
  return (
    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 2, marginBottom: 8 }}>{children}</h1>
  );
}

function PageBody({ children }) {
  return <div style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.8 }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, margin: "32px 0 10px", color: "var(--text)" }}>{children}</h2>;
}

function AboutPage() {
  return (
    <PageShell>
      <PageHeading>About Nubian Television</PageHeading>
      <div style={{ color: "var(--accent)", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 2, marginBottom: 24 }}>STREAMING BLACK CULTURE WORLDWIDE</div>
      <PageBody>
        <p>Nubian Television is a premium streaming platform built for and by the Black community. We are dedicated to amplifying Black voices, stories, and culture — from Africa to the Americas and beyond.</p>
        <SectionTitle>Our Mission</SectionTitle>
        <p>We believe that representation matters. Nubian Television exists to give Black creators a global stage, and Black audiences a home where their stories are centered, not marginalised. Our platform features original series, documentaries, live television, PPV events, and music programming that reflects the richness and diversity of the African diaspora.</p>
        <SectionTitle>What We Offer</SectionTitle>
        <p><strong style={{ color: "var(--text)" }}>On-Demand Content</strong> — Movies, series, documentaries, and reality programming available anytime.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: "var(--text)" }}>Live TV</strong> — Four channels streaming 24/7: Eastern, Pacific, Africa/Europe, and Nubian Radio.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: "var(--text)" }}>PPV Events</strong> — Premium live events including boxing, concerts, and special broadcasts.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: "var(--text)" }}>Global Reach</strong> — Available in English, French, Spanish, Portuguese, and Kiswahili.</p>
        <SectionTitle>Our Story</SectionTitle>
        <p>Founded with a passion for authentic Black storytelling, Nubian Television has grown into a destination for millions of viewers across Africa, the Caribbean, Europe, and North America. We partner with independent creators, production companies, and live broadcasters to bring the best in Black entertainment to your screen.</p>
        <SectionTitle>Contact Us</SectionTitle>
        <p>For business inquiries, partnerships, or press requests, reach us through our <strong style={{ color: "var(--text)" }}>Contact</strong> page or email us at <span style={{ color: "var(--accent)" }}>info@nubianlive.com</span>.</p>
      </PageBody>
    </PageShell>
  );
}

function HelpPage() {
  const faqs = [
    { q: "How do I subscribe to Nubian Television?", a: "Visit our subscription page and choose from Basic, Standard, or Premium plans. Payment is processed securely through Stripe." },
    { q: "What devices can I watch on?", a: "Nubian Television works on any modern web browser on desktop, tablet, and mobile. Apps for smart TVs and mobile platforms are coming soon." },
    { q: "Can I watch live TV and PPV events on all plans?", a: "Live TV is available on Standard and Premium plans. PPV events are available for purchase on all plans as one-time payments." },
    { q: "My video is buffering or not playing — what should I do?", a: "First, check your internet connection. We recommend a minimum of 5 Mbps for SD, 15 Mbps for HD, and 25 Mbps for 4K streams. Try refreshing the page or clearing your browser cache." },
    { q: "How do I cancel my subscription?", a: "You can cancel anytime from your account settings. Cancellations take effect at the end of your current billing period." },
    { q: "Can I share my account with family members?", a: "Premium plans allow up to 4 simultaneous streams. Basic and Standard plans allow 1 stream at a time." },
    { q: "Is there a free trial?", a: "Yes — new subscribers get a 7-day free trial on any plan. No charges until the trial ends." },
    { q: "What video quality is available?", a: "We stream up to 1080p HD on most content and 4K on select titles, depending on your plan and internet speed." },
    { q: "Are there subtitles or closed captions?", a: "Subtitles are available on most VOD content. You can switch languages in the player settings." },
    { q: "How do I contact support?", a: "Use the Contact page to send us a message. Our support team responds within 24 hours." },
  ];
  return (
    <PageShell>
      <PageHeading>Help & FAQ</PageHeading>
      <div style={{ color: "var(--text3)", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1, marginBottom: 32 }}>FREQUENTLY ASKED QUESTIONS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </PageShell>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>{question}</span>
        <span style={{ fontSize: 18, color: "var(--text3)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </div>
      {open && (
        <div style={{ padding: "0 20px 16px", color: "var(--text2)", fontSize: 14, lineHeight: 1.7, borderTop: "1px solid var(--border)" }}>
          <div style={{ paddingTop: 14 }}>{answer}</div>
        </div>
      )}
    </div>
  );
}

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeading>Privacy Policy</PageHeading>
      <div style={{ color: "var(--text3)", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, marginBottom: 32 }}>LAST UPDATED: MARCH 2026</div>
      <PageBody>
        <p>Nubian Television ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.</p>
        <SectionTitle>Information We Collect</SectionTitle>
        <p><strong style={{ color: "var(--text)" }}>Account Information:</strong> Name, email address, and payment details when you register or subscribe.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: "var(--text)" }}>Usage Data:</strong> Pages visited, content watched, watch history, search queries, and device information.</p>
        <p style={{ marginTop: 12 }}><strong style={{ color: "var(--text)" }}>Technical Data:</strong> IP address, browser type, operating system, and cookies.</p>
        <SectionTitle>How We Use Your Information</SectionTitle>
        <p>We use your data to: provide and personalise our streaming service; process subscription payments; send account-related communications; improve our platform and content recommendations; comply with legal obligations.</p>
        <SectionTitle>Data Sharing</SectionTitle>
        <p>We do not sell your personal data. We may share data with trusted third-party providers (such as payment processors and analytics services) strictly to operate our service. All third parties are contractually bound to protect your data.</p>
        <SectionTitle>Cookies</SectionTitle>
        <p>We use cookies to maintain your session, remember preferences, and analyse traffic. You can disable cookies in your browser settings, though some features may not function correctly.</p>
        <SectionTitle>Data Retention</SectionTitle>
        <p>We retain your data for as long as your account is active or as required by law. You may request deletion of your account and associated data at any time.</p>
        <SectionTitle>Your Rights</SectionTitle>
        <p>Depending on your location, you may have rights to access, correct, delete, or export your personal data. To exercise these rights, contact us at <span style={{ color: "var(--accent)" }}>privacy@nubianlive.com</span>.</p>
        <SectionTitle>Security</SectionTitle>
        <p>We use industry-standard encryption and security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
        <SectionTitle>Changes to This Policy</SectionTitle>
        <p>We may update this policy periodically. We will notify you of significant changes via email or a notice on our platform.</p>
      </PageBody>
    </PageShell>
  );
}

function TermsPage() {
  return (
    <PageShell>
      <PageHeading>Terms of Service</PageHeading>
      <div style={{ color: "var(--text3)", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, marginBottom: 32 }}>LAST UPDATED: MARCH 2026</div>
      <PageBody>
        <p>Welcome to Nubian Television. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
        <SectionTitle>1. Eligibility</SectionTitle>
        <p>You must be at least 13 years old to use Nubian Television. By creating an account, you confirm that all information you provide is accurate and complete.</p>
        <SectionTitle>2. Subscriptions and Payments</SectionTitle>
        <p>Subscriptions are billed monthly or annually in advance. You authorise us to charge your payment method on a recurring basis. All fees are non-refundable except as required by law. You may cancel at any time; cancellation takes effect at the end of the current billing cycle.</p>
        <SectionTitle>3. Acceptable Use</SectionTitle>
        <p>You agree not to: share your account credentials with others (beyond plan limits); copy, reproduce, or redistribute any content from our platform; use automated tools to access or scrape the service; attempt to circumvent any content protection measures.</p>
        <SectionTitle>4. Content</SectionTitle>
        <p>All content on Nubian Television is licensed or owned by us or our content partners. You are granted a limited, non-exclusive, non-transferable licence to stream content for personal, non-commercial use only.</p>
        <SectionTitle>5. PPV Events</SectionTitle>
        <p>Pay-Per-View purchases are one-time charges for a specific event or content window. PPV content is available for the specified viewing period only and is non-refundable once purchased.</p>
        <SectionTitle>6. Termination</SectionTitle>
        <p>We reserve the right to suspend or terminate your account if you violate these Terms. You may also terminate your account at any time by cancelling your subscription and contacting support.</p>
        <SectionTitle>7. Disclaimer</SectionTitle>
        <p>Nubian Television is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        <SectionTitle>8. Governing Law</SectionTitle>
        <p>These Terms are governed by applicable law. Disputes will be resolved through binding arbitration where permitted by law.</p>
        <SectionTitle>9. Changes to Terms</SectionTitle>
        <p>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
        <SectionTitle>10. Contact</SectionTitle>
        <p>For questions about these Terms, contact us at <span style={{ color: "var(--accent)" }}>legal@nubianlive.com</span>.</p>
      </PageBody>
    </PageShell>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const w = useWindowWidth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1200);
  };

  const inputStyle = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, padding: "12px 16px", color: "var(--text)", fontSize: 14,
    fontFamily: "inherit", outline: "none", transition: "border-color 0.15s",
  };

  if (submitted) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <PageHeading>Message Sent</PageHeading>
          <p style={{ color: "var(--text2)", fontSize: 15, marginTop: 12 }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeading>Contact Us</PageHeading>
      <div style={{ color: "var(--text3)", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1, marginBottom: 32 }}>WE'D LOVE TO HEAR FROM YOU</div>
      <div style={{ display: "grid", gridTemplateColumns: w < 768 ? "1fr" : "1fr 1fr", gap: 40 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>NAME</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your full name"
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>EMAIL</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="your@email.com"
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>SUBJECT</label>
            <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} placeholder="How can we help?"
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>MESSAGE</label>
            <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Tell us more..."
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <button type="submit" disabled={sending} style={{
            background: "var(--accent)", color: "white", border: "none",
            borderRadius: 8, padding: "14px 28px", fontSize: 14, fontWeight: 600,
            cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1,
            transition: "opacity 0.2s", fontFamily: "inherit",
          }}>{sending ? "Sending…" : "Send Message"}</button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, marginBottom: 8 }}>Support</div>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>For technical issues, billing questions, or account help, our team is available 7 days a week.</p>
            <p style={{ color: "var(--accent)", fontSize: 14, marginTop: 8 }}>support@nubianlive.com</p>
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, marginBottom: 8 }}>Business & Partnerships</div>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>Interested in distributing content on our platform or partnering with us?</p>
            <p style={{ color: "var(--accent)", fontSize: 14, marginTop: 8 }}>partnerships@nubianlive.com</p>
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, marginBottom: 8 }}>Press & Media</div>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>For press inquiries, interview requests, or media assets.</p>
            <p style={{ color: "var(--accent)", fontSize: 14, marginTop: 8 }}>press@nubianlive.com</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ── TITLE DETAIL PAGE ─────────────────────────────────────────────────────────

function stripEpisode(title) {
  return title.replace(/\s+(S\d+\s*EP?\s*\d+|Season\s*\d+|Ep\s*\d+|Episode\s*\d+|-\s*Sneak\s*Peek|-\s*Trailer)\s*$/i, "").trim();
}

function TitleDetailPage({ item, onBack, onPlay, onSelect }) {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const trailerRef = useRef(null);
  const sidePad = isMobile ? 16 : 48;
  const heroH = isMobile ? 320 : 520;

  useEffect(() => { window.scrollTo(0, 0); }, [item.id]);

  useEffect(() => {
    if (!item.trailerUrl) return;
    const video = trailerRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const h = new Hls();
      h.loadSource(item.trailerUrl);
      h.attachMedia(video);
      return () => h.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = item.trailerUrl;
    }
  }, [item]);

  const allItems = categories.flatMap(c => c.items);
  const seriesBase = stripEpisode(item.title);
  const moreEpisodes = allItems.filter(i => i.id !== item.id && stripEpisode(i.title) === seriesBase);
  const moreLikeThis = item.genre
    ? allItems.filter(i => i.id !== item.id && i.genre === item.genre && stripEpisode(i.title) !== seriesBase)
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Hero ── */}
      <div style={{ position: "relative", height: heroH, background: "#000", overflow: "hidden" }}>

        {item.trailerUrl ? (
          <video
            ref={trailerRef}
            autoPlay muted loop playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }}
          />
        ) : item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, opacity: 0.15 }}>
            {item.thumb || "🎬"}
          </div>
        )}

        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 65%)" }} />

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute", top: isMobile ? 72 : 90, left: isMobile ? 14 : 24,
            background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)",
            color: "white", borderRadius: "50%", width: 42, height: 42,
            fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10, backdropFilter: "blur(6px)",
          }}
        >←</button>

        {/* Text + buttons */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${sidePad}px 36px` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            {item.genre && <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>{item.genre.toUpperCase()}</span>}
            {item.year && <span style={{ fontSize: 12, color: "var(--text2)" }}>{item.year}</span>}
            {item.rating && <span style={{ fontSize: 10, border: "1px solid var(--text3)", color: "var(--text3)", padding: "1px 6px", borderRadius: 2 }}>{item.rating}</span>}
            {item.duration && <span style={{ fontSize: 12, color: "var(--text2)" }}>{item.duration}</span>}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isMobile ? 34 : 56,
            letterSpacing: 2, lineHeight: 1,
            marginBottom: 12, textShadow: "0 2px 24px #000c",
          }}>{item.title}</div>
          {item.description && (
            <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65, marginBottom: 22, maxWidth: 480 }}>
              {item.description}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => onPlay(item)}
              style={{
                background: "white", color: "black", border: "none", borderRadius: 6,
                padding: "12px 30px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >▶ Play</button>
            {item.trailerUrl && (
              <button
                onClick={() => onPlay({ ...item, hlsUrl: item.trailerUrl, title: item.title + " — Trailer" })}
                style={{
                  background: "rgba(255,255,255,0.15)", color: "white",
                  border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6,
                  padding: "12px 24px", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >🎬 Trailer</button>
            )}
          </div>
        </div>
      </div>

      {/* ── More Episodes ── */}
      {moreEpisodes.length > 0 && (
        <div style={{ padding: `36px ${sidePad}px 0` }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>More Episodes</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
            {moreEpisodes.map(ep => (
              <ContentCard key={ep.id} item={ep} onClick={onSelect} />
            ))}
          </div>
        </div>
      )}

      {/* ── More Like This ── */}
      {moreLikeThis.length > 0 && (
        <div style={{ padding: `36px ${sidePad}px 40px` }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>More Like This</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
            {moreLikeThis.map(rel => (
              <ContentCard key={rel.id} item={rel} onClick={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUBSCRIPTION ──────────────────────────────────────────────────────────────

const API_BASE = "https://api.nubianlive.com";

function getSubscription() {
  try { return JSON.parse(localStorage.getItem("nubian_subscription") || "null"); }
  catch { return null; }
}
function saveSubscription(data) {
  localStorage.setItem("nubian_subscription", JSON.stringify(data));
}

async function startCheckout(plan) {
  try {
    const res = await fetch(`${API_BASE}/api/stripe/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  } catch { alert("Could not start checkout. Please try again."); }
}

async function openPortal(customerId) {
  try {
    const res = await fetch(`${API_BASE}/api/stripe/create-portal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: customerId, return_url: window.location.origin }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  } catch { alert("Could not open portal. Please try again."); }
}

function PaywallModal({ item, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "transparent", color: "var(--text3)", fontSize: 20, lineHeight: 1 }}>✕</button>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Subscribe to watch</h2>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>{item?.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => startCheckout("monthly")} style={{ background: "var(--accent)", color: "white", borderRadius: 8, padding: "13px 20px", fontSize: 15, fontWeight: 700, width: "100%" }}>
            Subscribe — $2.99/mo
          </button>
          <button onClick={() => startCheckout("annual")} style={{ background: "var(--surface)", color: "white", border: "1px solid var(--border)", borderRadius: 8, padding: "13px 20px", fontSize: 15, fontWeight: 600, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Subscribe — $29.99/yr <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>Save 17%</span>
          </button>
        </div>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={onClose} style={{ background: "transparent", color: "var(--text3)", fontSize: 13, textDecoration: "underline" }}>Continue as Guest</button>
        </div>
      </div>
    </div>
  );
}

function SubscribePage({ navigate, onGuestActivated }) {
  const w = useWindowWidth();
  const isMobile = w < 640;
  const features = ["Full library access", "Live TV channels", "New content weekly", "Watch on any device"];
  const [guestCode, setGuestCode] = useState("");
  const [guestStatus, setGuestStatus] = useState(null); // "loading" | "success" | "error"
  const [guestError, setGuestError] = useState("");

  async function activateGuestCode() {
    if (!guestCode.trim()) return;
    setGuestStatus("loading");
    setGuestError("");
    try {
      const res = await fetch("https://api.nubianlive.com/api/guest/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: guestCode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid !== false) {
        const sub = { subscribed: true, plan: "guest", guest: true };
        saveSubscription(sub);
        onGuestActivated(sub);
        setGuestStatus("success");
      } else {
        setGuestStatus("error");
        setGuestError(data.error || "Invalid guest code. Please try again.");
      }
    } catch {
      setGuestStatus("error");
      setGuestError("Could not connect. Please check your connection.");
    }
  }
  return (
    <div style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ background: "var(--accent)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>Stream Now</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 30 : 48, fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
          Unlimited Black Entertainment
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 16, maxWidth: 520, margin: "0 auto 48px" }}>
          Watch original series, movies, documentaries, and live TV — all in one place.
        </p>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, justifyContent: "center", marginBottom: 48, alignItems: isMobile ? "stretch" : "flex-start" }}>
          {/* Monthly */}
          <div style={{ flex: 1, maxWidth: 340, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Monthly</div>
            <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 2 }}>$2.99</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 28 }}>per month · Cancel anytime</div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {features.map(f => (
                <li key={f} style={{ fontSize: 14, color: "var(--text2)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#4ade80" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => startCheckout("monthly")} style={{ width: "100%", background: "var(--accent)", color: "white", borderRadius: 8, padding: "13px 20px", fontSize: 15, fontWeight: 700 }}>
              Subscribe Now
            </button>
          </div>

          {/* Annual */}
          <div style={{ flex: 1, maxWidth: 340, background: "var(--bg2)", border: "2px solid var(--accent)", borderRadius: 16, padding: 32, textAlign: "left", position: "relative" }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#4ade80", color: "#000", fontSize: 11, fontWeight: 800, padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>BEST VALUE — Save 17%</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Annual</div>
            <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 2 }}>$29.99</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 28 }}>per year · just $2.50/mo</div>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {features.map(f => (
                <li key={f} style={{ fontSize: 14, color: "var(--text2)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#4ade80" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => startCheckout("annual")} style={{ width: "100%", background: "var(--accent)", color: "white", borderRadius: 8, padding: "13px 20px", fontSize: 15, fontWeight: 700 }}>
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Guest code */}
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 28, background: "var(--surface2)", maxWidth: 480, margin: "0 auto" }}>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Have a Guest Code?</p>
          <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 18 }}>Enter your code below to get full access as a guest.</p>
          {guestStatus === "success" ? (
            <p style={{ color: "#4ade80", fontWeight: 600, fontSize: 14 }}>Welcome! You now have guest access.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input
                  type="text"
                  value={guestCode}
                  onChange={e => setGuestCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && activateGuestCode()}
                  placeholder="Enter guest code"
                  style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", color: "white", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={activateGuestCode}
                  disabled={guestStatus === "loading"}
                  style={{ background: "var(--accent)", color: "white", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: guestStatus === "loading" ? 0.6 : 1 }}
                >
                  {guestStatus === "loading" ? "..." : "Activate"}
                </button>
              </div>
              {guestStatus === "error" && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{guestError}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function NubianLiveViewer() {
  const w = useWindowWidth();
  const [page, setPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [lang, setLang] = useState("en");
  const [liveChannelId, setLiveChannelId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [subscription, setSubscription] = useState(() => getSubscription());
  const [paywallItem, setPaywallItem] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [contentLoading, setContentLoading] = useState(true);
  const t = T[lang];

  useEffect(() => {
    const GENRE_CATS = ["Reality", "Lifestyle", "Movies", "Documentaries", "Coming Soon"];
    fetch(`${API_BASE}/api/content`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return;
        const grouped = {};
        GENRE_CATS.forEach(g => { grouped[g] = []; });
        data.forEach(item => {
          if (!item.video_id) return;
          const cat = GENRE_CATS.find(g => g === item.genre);
          if (!cat) return;
          const mins = parseInt(item.duration);
          const durationStr = isNaN(mins) ? undefined
            : mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`
            : `${mins}m`;
          grouped[cat].push({
            id: item.id,
            title: item.title,
            poster: item.poster_filename ? (item.poster_filename.startsWith("http") ? item.poster_filename : `${R2}/${item.poster_filename}`) : undefined,
            hlsUrl: hls(item.video_id),
            trailerUrl: item.trailer_id ? hls(item.trailer_id) : undefined,
            type: item.type || "VOD",
            genre: item.genre,
            year: item.year ? parseInt(item.year) : undefined,
            rating: item.rating || undefined,
            duration: durationStr,
            description: item.description || undefined,
          });
        });
        const liveNow = DEFAULT_CATEGORIES.find(c => c.name === "Live Now");
        const built = GENRE_CATS.filter(g => grouped[g].length > 0).map(g => ({ name: g, items: grouped[g] }));
        if (liveNow) built.push(liveNow);
        setCategories(built);
      })
      .catch(() => {})
      .finally(() => setContentLoading(false));
  }, []);

  const navigate = useCallback((p) => {
    setPage(p);
    setPlaying(null);
    setDetailItem(null);
  }, []);

  const openDetail = useCallback((item) => {
    setDetailItem(item);
    window.scrollTo(0, 0);
  }, []);

  const VOD_TYPES = ["Series", "Movie", "Documentary"];

  const handleContentSelect = useCallback((item) => {
    if (item.type === "LIVE") {
      const ch = channels.find(c => c.name === item.title);
      setLiveChannelId(ch ? ch.id : channels[0].id);
      navigate("live");
    } else if (!subscription?.subscribed && VOD_TYPES.includes(item.type)) {
      setPaywallItem(item);
    } else {
      openDetail(item);
    }
  }, [navigate, openDetail, subscription]);

  const handlePlay = useCallback((item) => {
    if (!subscription?.subscribed && VOD_TYPES.includes(item.type)) {
      setPaywallItem(item);
    } else {
      addToWatched(item);
      setPlaying(item);
    }
  }, [subscription]);

  const handleManageSubscription = useCallback(() => {
    if (subscription?.customer_id) {
      openPortal(subscription.customer_id);
    } else {
      navigate("subscribe");
    }
  }, [subscription, navigate]);

  // Verify Stripe session on redirect back from checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;
    // Clean URL immediately
    window.history.replaceState({}, "", window.location.pathname);
    fetch(`${API_BASE}/api/subscription/verify?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.subscription_status === "active" || data.payment_status === "paid") {
          const sub = {
            subscribed: true,
            plan: data.plan,
            customer_email: data.customer_email,
            customer_id: data.customer_id,
          };
          saveSubscription(sub);
          setSubscription(sub);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMobile = w < 768;
  const footerPad = isMobile ? 24 : 48;

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <style>{css}</style>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <Navbar
        page={page} setPage={navigate}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        scrolled={scrolled}
        onRadioClick={() => {
          setLiveChannelId(4);
          setTimeout(() => navigate("live"), 0);
        }}
        subscription={subscription}
        onManageSubscription={handleManageSubscription}
      />

      <div style={{ minHeight: "100vh" }}>
        {detailItem ? (
          <div style={{ paddingTop: 0 }}>
            <TitleDetailPage
              item={detailItem}
              onBack={() => setDetailItem(null)}
              onPlay={handlePlay}
              onSelect={handleContentSelect}
            />
          </div>
        ) : page === "home" ? (
          <>
            <Hero onPlay={() => { addToWatched(featured); setPlaying(featured); }} t={t} />
            <ContinueWatching onSelect={openDetail} t={t} />
            {contentLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14, letterSpacing: 1 }}>Loading content...</div>
            ) : categories.map(cat => (
              <ContentRow key={cat.name} category={cat} onSelect={handleContentSelect} t={t} />
            ))}
          </>
        ) : null}

        {!detailItem && page !== "home" && (
          <>

        {page === "live" && (
          <div style={{ paddingTop: 80 }}>
            <LiveTV t={t} initialChannelId={liveChannelId} />
          </div>
        )}

        {page === "ppv" && (
          <div style={{ paddingTop: 80 }}>
            <PPVSection t={t} subscription={subscription} />
          </div>
        )}

        {page === "search" && (
          <div style={{ paddingTop: 90 }}>
            <SearchPanel query={searchQuery} onSelect={setPlaying} t={t} />
          </div>
        )}

        {page === "about" && <AboutPage />}
        {page === "help" && <HelpPage />}
        {page === "privacy" && <PrivacyPage />}
        {page === "terms" && <TermsPage />}
        {page === "contact" && <ContactPage />}
        {page === "subscribe" && <SubscribePage navigate={navigate} onGuestActivated={sub => { setSubscription(sub); navigate("home"); }} />}
          </>
        )}
      </div>

      {paywallItem && (
        <PaywallModal
          item={paywallItem}
          onClose={() => setPaywallItem(null)}
        />
      )}

      {/* Footer */}
      <div style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", padding: `40px ${footerPad}px`, marginTop: 60 }}>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: "center",
          gap: isMobile ? 24 : 0,
          marginBottom: 24,
          textAlign: isMobile ? "center" : "left",
        }}>
          <img src="/logo.png" alt="Nubian Black Television" style={{ height: 32, width: "auto" }} />
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-end",
            gap: isMobile ? 16 : 24,
            fontSize: 13,
            color: "var(--text3)",
          }}>
            {[
              { label: t.about, page: "about" },
              { label: t.help, page: "help" },
              { label: t.privacy, page: "privacy" },
              { label: t.terms, page: "terms" },
              { label: t.contact, page: "contact" },
            ].map(({ label, page: pg }) => (
              <span key={pg} onClick={() => navigate(pg)} style={{ cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "var(--text3)"}
              >{label}</span>
            ))}
          </div>
        </div>

        {/* Social media links */}
        <div style={{ display: "flex", gap: 20, justifyContent: isMobile ? "center" : "flex-start", marginBottom: 20 }}>
          {[
            {
              url: "https://www.facebook.com/nubiantelevision",
              brand: "#1877F2",
              label: "Facebook",
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
            },
            {
              url: "https://www.instagram.com/nubiantelevision",
              brand: "#E1306C",
              label: "Instagram",
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
            },
            {
              url: "https://www.youtube.com/@NubianTelevision",
              brand: "#FF0000",
              label: "YouTube",
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
            },
            {
              url: "https://www.tiktok.com/@nubiantelevision?_r=1&_t=ZS-94ZwyV65Ybo",
              brand: "#69C9D0",
              label: "TikTok",
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>,
            },
          ].map(({ url, brand, label, svg }) => (
            <SocialIcon key={url} url={url} brand={brand} label={label}>{svg}</SocialIcon>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "var(--text3)", textAlign: isMobile ? "center" : "left" }}>© 2026 Nubian Live. {t.rights}</div>
      </div>

      {/* Player modal */}
      {playing && <PlayerModal item={playing} onClose={() => setPlaying(null)} />}
    </LangContext.Provider>
  );
}
