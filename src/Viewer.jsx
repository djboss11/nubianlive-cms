import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Hls from "hls.js";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`;

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
    home: "Home", liveTV: "Live TV", ppv: "PPV Events", browse: "Browse",
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
    home: "Accueil", liveTV: "TV en Direct", ppv: "Événements PPV", browse: "Parcourir",
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
    home: "Inicio", liveTV: "TV en Vivo", ppv: "Eventos PPV", browse: "Explorar",
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
    home: "Início", liveTV: "TV ao Vivo", ppv: "Eventos PPV", browse: "Explorar",
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
    home: "Nyumbani", liveTV: "TV Moja kwa Moja", ppv: "Matukio ya PPV", browse: "Vinjari",
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

const R2 = "https://pub-b5e20d7acaed4dbdb22f50a4327fd686.r2.dev";
const CF = "https://customer-nbylg9nks43yj4vv.cloudflarestream.com";
const hls = (id) => `${CF}/${id}/manifest/video.m3u8`;
const poster = (file) => `${R2}/${file}`;

const featured = {
  id: 100,
  title: "WELCOME TO NUBIAN TELEVISION",
  hlsUrl: "https://customer-nbylg9nks43yj4vv.cloudflarestream.com/c9c2165b624096cb9cb84b2aef2f2ccd/manifest/video.m3u8",
  poster: poster("rutland-manor.png"),
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

const categories = [
  {
    name: "Trending Now",
    items: [
      { id: 1, title: "Neon Requiem", thumb: "🎬", type: "VOD", rating: "TV-MA", year: 2024, match: 97 },
      { id: 2, title: "Quiet Hours", thumb: "🎭", type: "VOD", rating: "TV-14", year: 2024, match: 94 },
      { id: 3, title: "Cosmos: Remastered", thumb: "🌌", type: "VOD", rating: "TV-G", year: 2023, match: 91 },
      { id: 4, title: "Arena Night", thumb: "🥊", type: "VOD", rating: "TV-14", year: 2024, match: 88 },
      { id: 5, title: "City Lights", thumb: "🌆", type: "VOD", rating: "TV-PG", year: 2024, match: 85 },
      { id: 6, title: "The Drift", thumb: "🌊", type: "VOD", rating: "TV-MA", year: 2023, match: 82 },
      { id: 7, title: "Iron Savanna", thumb: "🦁", type: "VOD", rating: "TV-PG", year: 2024, match: 79 },
      { id: 8, title: "Echoes of Kush", thumb: "🏛️", type: "VOD", rating: "TV-14", year: 2023, match: 76 },
      { id: 9, title: "Rockin With The Stars - Sneak Peek", poster: poster("rockin-with-the-stars-sneak-peek.png"), hlsUrl: hls("8df20177f191476dbf1d72b3dda6d9f5"), type: "VOD", genre: "Reality", year: 2025, description: "Up and coming talent showcase" },
    ],
  },
  {
    name: "Live Now",
    items: [
      { id: 10, title: "Eastern", thumb: "📺", type: "LIVE", viewers: "14.2K", tag: "LIVE" },
      { id: 11, title: "Pacific", thumb: "⚽", type: "LIVE", viewers: "9.8K", tag: "LIVE" },
      { id: 12, title: "Africa/Europe", thumb: "🎵", type: "LIVE", viewers: "2.3K", tag: "LIVE" },
      { id: 13, title: "Nubian Radio", thumb: "🎙️", type: "LIVE", viewers: "5.1K", tag: "LIVE" },
    ],
  },
  {
    name: "Reality",
    items: [
      { id: 20, title: "Charnita's World S1EP1", poster: poster("charnitas-world-s1ep1.png"), hlsUrl: hls("ad3176ed4fedb56c2575fced59e21674"), type: "VOD", genre: "Reality", year: 2024, description: "The life of Birmingham Socialite Charnita Horton and her family" },
      { id: 21, title: "Charnita's World S1EP3", poster: poster("charnitas-world-s1ep3.png"), hlsUrl: hls("978862668c06910b50b5d1b6714c1260"), type: "VOD", genre: "Reality", year: 2024, description: "The life of Birmingham Socialite Charnita Horton and her family" },
      { id: 22, title: "Rockin With The Stars - Sneak Peek", poster: poster("rockin-with-the-stars-sneak-peek.png"), hlsUrl: hls("8df20177f191476dbf1d72b3dda6d9f5"), type: "VOD", genre: "Reality", year: 2025, description: "Up and coming talent showcase" },
    ],
  },
  {
    name: "Lifestyle",
    items: [
      { id: 40, title: "Quiet Hours", thumb: "🎭", type: "VOD", rating: "TV-14", year: 2024, match: 94 },
      { id: 41, title: "City Lights", thumb: "🌆", type: "VOD", rating: "TV-PG", year: 2024, match: 85 },
      { id: 42, title: "Iron Savanna", thumb: "🦁", type: "VOD", rating: "TV-PG", year: 2024, match: 79 },
      { id: 43, title: "Ocean Deep", thumb: "🐋", type: "VOD", rating: "TV-G", year: 2024, match: 88 },
    ],
  },
  {
    name: "Movies",
    items: [
      { id: 50, title: "Rutland Manor", poster: poster("rutland-manor.png"), hlsUrl: hls("a90f760613916b84d22e7de55e7c2404"), type: "VOD", genre: "Movie", year: 2025, description: "A group of ambitious influencers accept an invite to a luxurious manor for a career-making social event. Survival is the only trend worth chasing." },
      { id: 51, title: "Neon Requiem", thumb: "🎬", type: "VOD", rating: "TV-MA", year: 2024, match: 97 },
      { id: 52, title: "Quiet Hours", thumb: "🎭", type: "VOD", rating: "TV-14", year: 2024, match: 94 },
      { id: 53, title: "Arena Night", thumb: "🥊", type: "VOD", rating: "TV-14", year: 2024, match: 88 },
    ],
  },
  {
    name: "Documentaries",
    items: [
      { id: 30, title: "Troubled Water", poster: poster("troubled-water.png"), hlsUrl: hls("d96681ec8386f8769459af8980e417d1"), type: "VOD", genre: "Documentary", year: 2023, description: "A look at environmental racism in America" },
      { id: 31, title: "Cosmos: Remastered", thumb: "🌌", type: "VOD", rating: "TV-G", year: 2023, match: 91 },
      { id: 32, title: "Echoes of Kush", thumb: "🏛️", type: "VOD", rating: "TV-14", year: 2023, match: 76 },
      { id: 33, title: "Ocean Deep", thumb: "🐋", type: "VOD", rating: "TV-G", year: 2024, match: 88 },
    ],
  },
];

const ppvEvents = [
  { id: 1, title: "Championship Finals", subtitle: "World Cup Qualifier · Live", date: "Mar 15, 2026", time: "8:00 PM EST", price: 19.99, thumb: "🏆", gradient: "linear-gradient(135deg, #1a0500, #2a1000)" },
  { id: 2, title: "Arena Night — Boxing", subtitle: "Heavyweight Championship", date: "Mar 22, 2026", time: "9:00 PM EST", price: 29.99, thumb: "🥊", gradient: "linear-gradient(135deg, #1a0010, #2a0020)" },
  { id: 3, title: "Global Music Fest", subtitle: "Live from Lagos · 12 Artists", date: "Apr 5, 2026", time: "7:00 PM EST", price: 14.99, thumb: "🎤", gradient: "linear-gradient(135deg, #001a10, #002a20)" },
];

const channels = [
  { id: 1, name: "Eastern", current: "Live Now", next: "Coming Up", status: "live", thumb: "📺", hlsUrl: "https://customer-nbylg9nks43yj4vv.cloudflarestream.com/0800a710bf6f0ceb73c96919a2354741/manifest/video.m3u8" },
  { id: 2, name: "Pacific", current: "Championship Match", next: "Pre-Game Analysis", status: "live", thumb: "⚽" },
  { id: 3, name: "Africa/Europe", current: "Jazz Morning", next: "Top 40 Countdown", status: "live", thumb: "🎵" },
  { id: 4, name: "Nubian Radio", current: "Nubian Radio Live", next: "Coming Up", status: "live", thumb: "🎙️", isRadio: true },
];

const searchResults = [
  { id: 1, title: "Neon Requiem", thumb: "🎬", type: "Movie", year: 2024 },
  { id: 2, title: "Quiet Hours", thumb: "🎭", type: "Movie", year: 2024 },
  { id: 3, title: "City Night Jazz", thumb: "🎵", type: "Live", year: 2026 },
  { id: 4, title: "Cosmos: Remastered", thumb: "🌌", type: "Documentary", year: 2023 },
];

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
  const cardW = w < 768 ? 110 : 160;
  const cardH = Math.round(cardW * (4 / 3));
  const titleFontSize = w < 768 ? 10 : 12;

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
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
  };
  const sidePad = w < 768 ? 16 : 48;

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, paddingLeft: sidePad }}>{category.name}</div>
      <div style={{ position: "relative" }}>
        {w >= 768 && (
          <button onClick={() => scroll(-1)} style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
            background: "linear-gradient(to right, var(--bg), transparent)",
            color: "white", fontSize: 20, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>‹</button>
        )}
        <div ref={rowRef} style={{
          display: "flex", gap: 12, overflowX: "auto",
          paddingLeft: sidePad, paddingRight: sidePad,
          scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 80,
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
      <div style={{ position: "absolute", bottom: w < 768 ? "12%" : "18%", left: sidePad, maxWidth: w < 768 ? "calc(100% - 32px)" : 520 }}>
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
          <button style={{
            background: "#ffffff33", color: "white",
            padding: "12px 24px", borderRadius: 6,
            fontWeight: 600, fontSize: 15, backdropFilter: "blur(4px)",
            border: "1px solid #ffffff22",
          }}>ℹ {t.moreInfo}</button>
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

function ContinueWatching({ onSelect, t }) {
  const w = useWindowWidth();
  const sidePad = w < 768 ? 16 : 48;

  return (
    <div style={{ marginBottom: 40, marginTop: -80, position: "relative", zIndex: 2 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, paddingLeft: sidePad }}>{t.continueWatching}</div>
      <div style={{
        display: "flex", gap: 10, paddingLeft: sidePad, paddingRight: sidePad,
        overflowX: "auto", scrollbarWidth: "none", paddingBottom: 8,
        WebkitOverflowScrolling: "touch",
      }}>
        {continueWatching.map(item => (
          <div key={item.id} onClick={() => onSelect(item)} style={{ width: w < 768 ? 160 : 220, flexShrink: 0, cursor: "pointer" }}>
            <div style={{ position: "relative", height: w < 768 ? 90 : 124, background: "#1a1a1a", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 6 }}>
              <span>{item.thumb}</span>
              {/* Progress bar */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#333" }}>
                <div style={{ width: `${item.progress}%`, height: "100%", background: "var(--accent)" }} />
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", background: "#000a" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, marginLeft: 3 }}>▶</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{item.episode || item.duration} · {item.progress}% {t.watched}</div>
          </div>
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
                {activeChannel.hlsUrl ? (
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
                <div style={{ position: "absolute", top: 16, left: 16 }}><LiveBadge /></div>
                <div style={{ position: "absolute", bottom: 48, left: 0, right: 0, padding: "60px 24px 16px", background: "linear-gradient(to top, #000, transparent)", pointerEvents: "none" }}>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{activeChannel.current}</div>
                  <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{t.upNext}: {activeChannel.next}</div>
                </div>
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

function PPVSection({ t }) {
  const w = useWindowWidth();
  const sidePad = w < 768 ? 16 : 48;
  const gridCols = w < 768 ? "1fr" : w < 1024 ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{ padding: `24px ${sidePad}px` }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 6 }}>{t.ppvTitle}</div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>{t.ppvSubtitle}</div>

      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20 }}>
        {ppvEvents.map(ev => (
          <div key={ev.id} style={{ background: ev.gradient, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
              <span>{ev.thumb}</span>
              <div style={{ position: "absolute", top: 12, right: 12, background: "var(--gold)", color: "black", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>PPV</div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, marginBottom: 4 }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>{ev.subtitle}</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 12, color: "var(--text2)" }}>
                <span>📅 {ev.date}</span>
                <span>🕐 {ev.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "var(--gold)" }}>${ev.price}</div>
                <button style={{
                  background: "var(--accent)", color: "white", borderRadius: 8,
                  padding: "10px 20px", fontWeight: 700, fontSize: 14,
                  transition: "background 0.15s",
                }}>{t.buyNow}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
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

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !item.hlsUrl) return;

    if (Hls.isSupported()) {
      const hlsInstance = new Hls();
      hlsInstance.loadSource(item.hlsUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      return () => hlsInstance.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = item.hlsUrl;
      video.play();
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
            <video
              ref={videoRef}
              controls
              muted
              style={{ width: "100%", maxHeight: isMobile ? "55vh" : 480, display: "block" }}
            />
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

function Navbar({ page, setPage, searchQuery, setSearchQuery, scrolled }) {
  const w = useWindowWidth();
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLang();
  const isMobile = w < 768;

  const navLinks = [
    { id: "home", label: t.home },
    { id: "live", label: t.liveTV },
    { id: "ppv", label: t.ppv },
    { id: "search", label: t.browse },
  ];

  const handleNavClick = (id) => {
    setPage(id);
    setMenuOpen(false);
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
          <div style={{ borderTop: "1px solid var(--border)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--live)22", border: "1px solid var(--live)44", borderRadius: 20, padding: "4px 10px", cursor: "pointer" }} onClick={() => { setPage("live"); setMenuOpen(false); }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--live)", display: "block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "var(--live)", fontFamily: "'DM Mono', monospace" }}>3 LIVE</span>
            </div>
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

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function NubianLiveViewer() {
  const w = useWindowWidth();
  const [page, setPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [lang, setLang] = useState("en");
  const [liveChannelId, setLiveChannelId] = useState(null);
  const t = T[lang];

  const navigate = useCallback((p) => {
    setPage(p);
    setPlaying(null);
  }, []);

  const handleContentSelect = useCallback((item) => {
    if (item.type === "LIVE") {
      const ch = channels.find(c => c.name === item.title);
      setLiveChannelId(ch ? ch.id : channels[0].id);
      navigate("live");
    } else {
      setPlaying(item);
    }
  }, [navigate]);

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
      />

      <div style={{ minHeight: "100vh" }}>
        {page === "home" && (
          <>
            <Hero onPlay={() => setPlaying(featured)} t={t} />
            <ContinueWatching onSelect={setPlaying} t={t} />
            {categories.map(cat => (
              <ContentRow key={cat.name} category={cat} onSelect={handleContentSelect} t={t} />
            ))}
          </>
        )}

        {page === "live" && (
          <div style={{ paddingTop: 80 }}>
            <LiveTV t={t} initialChannelId={liveChannelId} />
          </div>
        )}

        {page === "ppv" && (
          <div style={{ paddingTop: 80 }}>
            <PPVSection t={t} />
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
      </div>

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
