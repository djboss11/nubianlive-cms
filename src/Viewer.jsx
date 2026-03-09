import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import Hls from "hls.js";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`;

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

const featured = {
  id: 1,
  title: "NEON REQUIEM",
  hlsUrl: "https://customer-nbylg9nks43yj4vv.cloudflarestream.com/c9c2165b624096cb9cb84b2aef2f2ccd/manifest/video.m3u8",
  description: "A neo-noir thriller set in a rain-soaked African megacity. When a jazz musician witnesses a murder, he's drawn into a web of corporate espionage, ancient ritual, and electric danger.",
  genre: "Thriller · Drama",
  year: 2024,
  rating: "TV-MA",
  duration: "1h 52m",
  match: "97%",
  thumb: "🎬",
  gradient: "linear-gradient(135deg, #1a0a2e 0%, #0d1117 40%, #080808 100%)",
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
    ],
  },
  {
    name: "Live Now",
    items: [
      { id: 10, title: "City Night Jazz", thumb: "🎵", type: "LIVE", viewers: "14.2K", tag: "LIVE" },
      { id: 11, title: "Sports 24", thumb: "⚽", type: "LIVE", viewers: "9.8K", tag: "LIVE" },
      { id: 12, title: "Music Vibes", thumb: "🎶", type: "LIVE", viewers: "2.3K", tag: "LIVE" },
      { id: 13, title: "Morning Brief", thumb: "📡", type: "LIVE", viewers: "5.1K", tag: "LIVE" },
    ],
  },
  {
    name: "Drama & Thriller",
    items: [
      { id: 20, title: "Neon Requiem", thumb: "🎬", type: "VOD", rating: "TV-MA", year: 2024, match: 97 },
      { id: 21, title: "Quiet Hours", thumb: "🎭", type: "VOD", rating: "TV-14", year: 2024, match: 94 },
      { id: 22, title: "The Drift", thumb: "🌊", type: "VOD", rating: "TV-MA", year: 2023, match: 82 },
      { id: 23, title: "Night Protocol", thumb: "🌙", type: "VOD", rating: "TV-MA", year: 2024, match: 78 },
      { id: 24, title: "Obsidian", thumb: "🔮", type: "VOD", rating: "TV-14", year: 2023, match: 74 },
      { id: 25, title: "Red Kalahari", thumb: "🏜️", type: "VOD", rating: "TV-MA", year: 2024, match: 71 },
    ],
  },
  {
    name: "Documentaries",
    items: [
      { id: 30, title: "Cosmos: Remastered", thumb: "🌌", type: "VOD", rating: "TV-G", year: 2023, match: 91 },
      { id: 31, title: "Echoes of Kush", thumb: "🏛️", type: "VOD", rating: "TV-14", year: 2023, match: 76 },
      { id: 32, title: "Iron Savanna", thumb: "🦁", type: "VOD", rating: "TV-PG", year: 2024, match: 79 },
      { id: 33, title: "Ocean Deep", thumb: "🐋", type: "VOD", rating: "TV-G", year: 2024, match: 88 },
      { id: 34, title: "The Grid", thumb: "⚡", type: "VOD", rating: "TV-PG", year: 2023, match: 72 },
    ],
  },
];

const ppvEvents = [
  { id: 1, title: "Championship Finals", subtitle: "World Cup Qualifier · Live", date: "Mar 15, 2026", time: "8:00 PM EST", price: 19.99, thumb: "🏆", gradient: "linear-gradient(135deg, #1a0500, #2a1000)" },
  { id: 2, title: "Arena Night — Boxing", subtitle: "Heavyweight Championship", date: "Mar 22, 2026", time: "9:00 PM EST", price: 29.99, thumb: "🥊", gradient: "linear-gradient(135deg, #1a0010, #2a0020)" },
  { id: 3, title: "Global Music Fest", subtitle: "Live from Lagos · 12 Artists", date: "Apr 5, 2026", time: "7:00 PM EST", price: 14.99, thumb: "🎤", gradient: "linear-gradient(135deg, #001a10, #002a20)" },
];

const channels = [
  { id: 1, name: "Channel One HD", current: "Morning News", next: "Talk Show Live", status: "live", thumb: "📺" },
  { id: 2, name: "Sports 24", current: "Championship Match", next: "Pre-Game Analysis", status: "live", thumb: "⚽" },
  { id: 3, name: "Music Vibes", current: "Jazz Morning", next: "Top 40 Countdown", status: "live", thumb: "🎵" },
  { id: 4, name: "Kids Zone", current: "Cartoon Hour", next: "Story Time", status: "live", thumb: "🧸" },
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

function ContentCard({ item, size = "normal", onClick }) {
  const [hovered, setHovered] = useState(false);
  const { t } = useLang();
  const isLive = item.type === "LIVE";
  const w = size === "large" ? 260 : size === "small" ? 140 : 200;
  const h = size === "large" ? 146 : size === "small" ? 79 : 113;

  return (
    <div
      onClick={() => onClick && onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: w, flexShrink: 0, cursor: "pointer",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "transform 0.2s ease, z-index 0s",
        zIndex: hovered ? 10 : 1, position: "relative",
        borderRadius: 6, overflow: "hidden",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: w, height: h,
        background: `linear-gradient(135deg, #${Math.floor(Math.random() * 0x444444 + 0x111111).toString(16).padStart(6, "0")}, #111)`,
        borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size === "small" ? 28 : 40, border: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        <span>{item.thumb}</span>
        {isLive && (
          <div style={{ position: "absolute", top: 8, left: 8 }}><LiveBadge /></div>
        )}
        {item.match && (
          <div style={{ position: "absolute", top: 8, right: 8, fontSize: 10, color: "var(--green)", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{item.match}%</div>
        )}
        {hovered && (
          <div style={{
            position: "absolute", inset: 0, background: "#000a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "white", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 18, marginLeft: 3 }}>▶</span>
            </div>
          </div>
        )}
      </div>

      {/* Info on hover */}
      {hovered && (
        <div style={{
          background: "var(--surface)", borderRadius: "0 0 6px 6px",
          padding: "10px 12px", border: "1px solid var(--border)", borderTop: "none",
          position: "absolute", left: 0, right: 0, top: h - 1, zIndex: 20,
          boxShadow: "0 8px 24px #000a",
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {isLive ? (
              <span style={{ fontSize: 11, color: "var(--text3)" }}>👁 {item.viewers}</span>
            ) : (
              <>
                {item.year && <span style={{ fontSize: 11, color: "var(--green)" }}>{item.year}</span>}
                {item.rating && <span style={{ fontSize: 10, border: "1px solid var(--text3)", color: "var(--text3)", padding: "0 4px", borderRadius: 2 }}>{item.rating}</span>}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button style={{ background: "white", color: "black", borderRadius: 4, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>▶ {t.play}</button>
            <button style={{ background: "var(--surface2)", color: "white", borderRadius: 4, padding: "5px 10px", fontSize: 11, border: "1px solid var(--border)" }}>{t.addToList}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentRow({ category, onSelect }) {
  const rowRef = useRef(null);
  const scroll = (dir) => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, paddingLeft: 48 }}>{category.name}</div>
      <div style={{ position: "relative" }}>
        <button onClick={() => scroll(-1)} style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
          background: "linear-gradient(to right, var(--bg), transparent)",
          color: "white", fontSize: 20, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
        }}>‹</button>
        <div ref={rowRef} style={{
          display: "flex", gap: 8, overflowX: "auto", paddingLeft: 48, paddingRight: 48,
          scrollbarWidth: "none", msOverflowStyle: "none", paddingBottom: 60,
        }}>
          {category.items.map(item => (
            <ContentCard key={item.id} item={item} onClick={onSelect} />
          ))}
        </div>
        <button onClick={() => scroll(1)} style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
          background: "linear-gradient(to left, var(--bg), transparent)",
          color: "white", fontSize: 20, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center",
        }}>›</button>
      </div>
    </div>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function Hero({ onPlay, t }) {
  return (
    <div style={{ position: "relative", height: "85vh", minHeight: 500, overflow: "hidden" }}>
      {/* Background */}
      <div style={{
        position: "absolute", inset: 0,
        background: featured.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 140, opacity: 0.12 }}>{featured.thumb}</span>
      </div>

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 60%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--bg) 0%, transparent 50%)" }} />

      {/* Content */}
      <div style={{ position: "absolute", bottom: "18%", left: 48, maxWidth: 520 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(48px, 8vw, 80px)",
          letterSpacing: 3, lineHeight: 1, marginBottom: 16,
          textShadow: "0 2px 20px #000a",
        }}>{featured.title}</div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ color: "var(--green)", fontSize: 13, fontWeight: 600 }}>{featured.match} Match</span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>{featured.year}</span>
          <span style={{ fontSize: 11, border: "1px solid var(--text3)", color: "var(--text3)", padding: "1px 6px", borderRadius: 2 }}>{featured.rating}</span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>{featured.duration}</span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>{featured.genre}</span>
        </div>

        <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 24, maxWidth: 440 }}>
          {featured.description}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
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
    </div>
  );
}

// ── CONTINUE WATCHING ─────────────────────────────────────────────────────────

function ContinueWatching({ onSelect, t }) {
  return (
    <div style={{ marginBottom: 40, marginTop: -80, position: "relative", zIndex: 2 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, paddingLeft: 48 }}>{t.continueWatching}</div>
      <div style={{ display: "flex", gap: 10, paddingLeft: 48, paddingRight: 48, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 8 }}>
        {continueWatching.map(item => (
          <div key={item.id} onClick={() => onSelect(item)} style={{ width: 220, flexShrink: 0, cursor: "pointer" }}>
            <div style={{ position: "relative", height: 124, background: "#1a1a1a", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 6 }}>
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

function LiveTV({ t }) {
  const [activeChannel, setActiveChannel] = useState(channels[0]);

  return (
    <div style={{ padding: "24px 48px" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 6 }}>{t.liveTVTitle}</div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>{t.liveTVSubtitle}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Main player */}
        <div style={{ background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: 360, background: "linear-gradient(135deg, #0a0a0a, #1a1a1a)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <span style={{ fontSize: 80 }}>{activeChannel.thumb}</span>
            <div style={{ position: "absolute", top: 16, left: 16 }}><LiveBadge /></div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "60px 24px 24px", background: "linear-gradient(to top, #000, transparent)" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{activeChannel.current}</div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>{t.upNext}: {activeChannel.next}</div>
            </div>
            <button style={{ position: "absolute", inset: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ffffff22", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ffffff44" }}>
                <span style={{ fontSize: 24, marginLeft: 4 }}>▶</span>
              </div>
            </button>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{activeChannel.name}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{activeChannel.current}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ background: "var(--surface2)", color: "white", borderRadius: 6, padding: "7px 14px", fontSize: 12, border: "1px solid var(--border)" }}>⛶ {t.fullscreen}</button>
              <button style={{ background: "var(--accent)", color: "white", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600 }}>📺 {t.cast}</button>
            </div>
          </div>
        </div>

        {/* Channel list */}
        <div style={{ background: "var(--bg2)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{t.allChannels}</div>
          {channels.map(ch => (
            <div key={ch.id} onClick={() => setActiveChannel(ch)} style={{
              padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
              background: activeChannel.id === ch.id ? "var(--surface)" : "transparent",
              borderBottom: "1px solid var(--border)", transition: "background 0.15s",
              borderLeft: activeChannel.id === ch.id ? "3px solid var(--accent)" : "3px solid transparent",
            }}>
              <span style={{ fontSize: 24 }}>{ch.thumb}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ch.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.current}</div>
              </div>
              <LiveBadge />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PPV SECTION ───────────────────────────────────────────────────────────────

function PPVSection({ t }) {
  return (
    <div style={{ padding: "24px 48px" }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 6 }}>{t.ppvTitle}</div>
      <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>{t.ppvSubtitle}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
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
  const filtered = query.length > 1
    ? searchResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    : searchResults;

  return (
    <div style={{ padding: "24px 48px" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
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
      const hls = new Hls();
      hls.loadSource(item.hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = item.hlsUrl;
      video.play();
    }
  }, [item]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000e", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "80vw", maxWidth: 900, background: "var(--bg2)", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ position: "relative", background: "#000" }}>
          {item.hlsUrl ? (
            <video
              ref={videoRef}
              controls
              style={{ width: "100%", maxHeight: 480, display: "block" }}
            />
          ) : (
            <div style={{ height: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  const [showSearch, setShowSearch] = useState(false);
  const { t } = useLang();

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "var(--bg)" : "linear-gradient(to bottom, #000a, transparent)",
      transition: "background 0.3s",
      padding: "0 48px", height: 64,
      display: "flex", alignItems: "center", gap: 32,
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
    }}>
      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
  <img src="/logo.png" alt="Nubian Black Television" style={{ height: 36, width: "auto" }} />
</div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        {[
          { id: "home", label: t.home },
          { id: "live", label: t.liveTV },
          { id: "ppv", label: t.ppv },
          { id: "search", label: t.browse },
        ].map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background: "transparent", color: page === n.id ? "white" : "var(--text2)",
            fontSize: 14, fontWeight: page === n.id ? 600 : 400,
            transition: "color 0.15s", padding: 0,
            borderBottom: page === n.id ? "2px solid var(--accent)" : "2px solid transparent",
            paddingBottom: 2,
          }}>{n.label}</button>
        ))}
      </div>

      {/* Right controls */}
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
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function NubianLiveViewer() {
  const [page, setPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [lang, setLang] = useState("en");
  const t = T[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <style>{css}</style>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <Navbar
        page={page} setPage={setPage}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        scrolled={scrolled}
      />

      <div style={{ minHeight: "100vh" }}>
        {page === "home" && (
          <>
            <Hero onPlay={() => setPlaying(featured)} t={t} />
            <ContinueWatching onSelect={setPlaying} t={t} />
            {categories.map(cat => (
              <ContentRow key={cat.name} category={cat} onSelect={setPlaying} t={t} />
            ))}
          </>
        )}

        {page === "live" && (
          <div style={{ paddingTop: 80 }}>
            <LiveTV t={t} />
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
      </div>

      {/* Footer */}
      <div style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", padding: "40px 48px", marginTop: 60 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: "var(--accent)" }}>NUBIAN LIVE</div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--text3)" }}>
            {[t.about, t.help, t.privacy, t.terms, t.contact].map(l => (
              <span key={l} style={{ cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "var(--text3)"}
              >{l}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>© 2026 Nubian Live. {t.rights}</div>
      </div>

      {/* Player modal */}
      {playing && <PlayerModal item={playing} onClose={() => setPlaying(null)} />}
    </LangContext.Provider>
  );
}
