import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api";
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');`;

const css = `
  ${FONT}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c10;
    --surface: #0d1117;
    --surface2: #131920;
    --surface3: #1a2230;
    --border: #1e2d3d;
    --border2: #243447;
    --text: #e8edf2;
    --text2: #8899aa;
    --text3: #556677;
    --accent: #00d4ff;
    --accent2: #0099bb;
    --green: #00e5a0;
    --red: #ff4d6a;
    --orange: #ff9533;
    --yellow: #ffd166;
    --purple: #a855f7;
    --live: #ff2d55;
  }
  html, body, #root { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); overflow: hidden; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  button { cursor: pointer; font-family: inherit; }
  input, select, textarea { font-family: inherit; }
`;

// ── DATA ────────────────────────────────────────────────────────────────────

const mockContent = [
  { id: 1, title: "Neon Requiem", type: "VOD", status: "published", duration: "1h 52m", views: 842310, revenue: 12430, thumb: "🎬", genre: "Thriller", monetization: "SVOD" },
  { id: 2, title: "Live: City Night Jazz", type: "LIVE", status: "live", duration: "—", views: 14220, revenue: 0, thumb: "🎵", genre: "Music", monetization: "AVOD" },
  { id: 3, title: "The Deep Channel", type: "LINEAR", status: "scheduled", duration: "24h", views: 5840, revenue: 880, thumb: "📺", genre: "Nature", monetization: "SVOD" },
  { id: 4, title: "Championship Finals PPV", type: "PPV", status: "upcoming", duration: "3h 00m", views: 0, revenue: 94200, thumb: "🏆", genre: "Sports", monetization: "TVOD" },
  { id: 5, title: "Quiet Hours", type: "VOD", status: "published", duration: "2h 10m", views: 320100, revenue: 4800, thumb: "🎭", genre: "Drama", monetization: "SVOD" },
  { id: 6, title: "Morning Brief Live", type: "LIVE", status: "scheduled", duration: "—", views: 0, revenue: 0, thumb: "📡", genre: "News", monetization: "AVOD" },
  { id: 7, title: "Cosmos: Remastered", type: "VOD", status: "draft", duration: "45m", views: 0, revenue: 0, thumb: "🌌", genre: "Documentary", monetization: "HYBRID" },
  { id: 8, title: "Arena Night — Box", type: "PPV", status: "published", duration: "4h 00m", views: 120400, revenue: 240800, thumb: "🥊", genre: "Sports", monetization: "TVOD" },
];

const scteMarkers = [
  { id: 1, stream: "Live: City Night Jazz", time: "00:14:32", type: "SPLICE_INSERT", duration: "30s", adBreak: "Pre-roll A", status: "fired" },
  { id: 2, stream: "Live: City Night Jazz", time: "00:44:32", type: "SPLICE_INSERT", duration: "60s", adBreak: "Mid-roll B", status: "pending" },
  { id: 3, stream: "Morning Brief Live", time: "00:05:00", type: "TIME_SIGNAL", duration: "15s", adBreak: "Pre-roll A", status: "scheduled" },
  { id: 4, stream: "The Deep Channel", time: "01:00:00", type: "SPLICE_INSERT", duration: "120s", adBreak: "Hour Break", status: "scheduled" },
  { id: 5, stream: "Championship Finals PPV", time: "00:30:00", type: "SPLICE_INSERT", duration: "30s", adBreak: "Sponsor Slot", status: "scheduled" },
];

const channels = [
  { id: 1, name: "Channel One HD", status: "on-air", epgSlots: 12, encoder: "AWS Elemental", bitrate: "8.5 Mbps", viewers: 4220 },
  { id: 2, name: "Sports 24", status: "on-air", epgSlots: 8, encoder: "MediaLive", bitrate: "12 Mbps", viewers: 9810 },
  { id: 3, name: "Kids Zone", status: "standby", epgSlots: 24, encoder: "Wowza", bitrate: "4 Mbps", viewers: 0 },
  { id: 4, name: "Music Vibes", status: "on-air", epgSlots: 6, encoder: "AWS Elemental", bitrate: "6 Mbps", viewers: 2340 },
];

const stats = [
  { label: "Total Streams", value: "2.4M", delta: "+18%", color: "var(--accent)", icon: "▶" },
  { label: "Active Live", value: "3", delta: "2 healthy", color: "var(--live)", icon: "●" },
  { label: "Monthly Revenue", value: "$348K", delta: "+22%", color: "var(--green)", icon: "$" },
  { label: "SCTE Events", value: "142", delta: "Today", color: "var(--orange)", icon: "⬦" },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "content", label: "Content Library", icon: "▤" },
  { id: "live", label: "Live Streams", icon: "◉" },
  { id: "linear", label: "Linear / EPG", icon: "▦" },
  { id: "ppv", label: "PPV Events", icon: "★" },
  { id: "scte", label: "SCTE Markers", icon: "⬦" },
  { id: "monetization", label: "Monetization", icon: "◈" },
  { id: "subscribers", label: "Subscribers", icon: "◎" },
  { id: "analytics", label: "Analytics", icon: "∿" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ type }) {
  const map = {
    VOD: { bg: "#0e2a3a", color: "var(--accent)", label: "VOD" },
    LIVE: { bg: "#2a0e14", color: "var(--live)", label: "LIVE" },
    LINEAR: { bg: "#1a1f2a", color: "var(--purple)", label: "LINEAR" },
    PPV: { bg: "#2a1a00", color: "var(--orange)", label: "PPV" },
    published: { bg: "#0a2a1a", color: "var(--green)", label: "Published" },
    live: { bg: "#2a0e14", color: "var(--live)", label: "● Live" },
    scheduled: { bg: "#1a1f2a", color: "var(--purple)", label: "Scheduled" },
    upcoming: { bg: "#2a1a00", color: "var(--orange)", label: "Upcoming" },
    draft: { bg: "#1a1a1a", color: "var(--text3)", label: "Draft" },
    SVOD: { bg: "#0e1a2a", color: "var(--accent)", label: "SVOD" },
    AVOD: { bg: "#1a2a0e", color: "var(--green)", label: "AVOD" },
    TVOD: { bg: "#2a1a00", color: "var(--orange)", label: "TVOD" },
    HYBRID: { bg: "#1a0e2a", color: "var(--purple)", label: "HYBRID" },
    fired: { bg: "#0a2a1a", color: "var(--green)", label: "Fired" },
    pending: { bg: "#2a1a00", color: "var(--orange)", label: "Pending" },
    "on-air": { bg: "#2a0e14", color: "var(--live)", label: "● On Air" },
    standby: { bg: "#1a1a1a", color: "var(--text3)", label: "Standby" },
  };
  const s = map[type] || { bg: "#1a1a1a", color: "var(--text3)", label: type };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "2px 8px", borderRadius: 4, fontSize: 11,
      fontFamily: "'DM Mono', monospace", fontWeight: 500,
      border: `1px solid ${s.color}22`, whiteSpace: "nowrap"
    }}>{s.label}</span>
  );
}

function StatCard({ stat }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 8,
      position: "relative", overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${stat.color}18 0%, transparent 70%)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{stat.label}</span>
        <span style={{ fontSize: 18, color: stat.color }}>{stat.icon}</span>
      </div>
      <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "var(--text)" }}>{stat.value}</div>
      <div style={{ fontSize: 12, color: stat.color, fontFamily: "'DM Mono', monospace" }}>{stat.delta}</div>
    </div>
  );
}

function MiniChart({ color }) {
  const points = Array.from({ length: 20 }, (_, i) => Math.random() * 60 + 20);
  const max = Math.max(...points);
  const w = 120, h = 40;
  const pts = points.map((p, i) => `${(i / 19) * w},${h - (p / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ opacity: 0.8 }}>
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
      <polyline fill={`${color}15`} stroke="none"
        points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard() {
  const [analytics, setAnalytics] = useState({ total_content: 0, active_subscribers: 0, live_streams: 0 });

  useEffect(() => {
    api.getAnalytics().then(data => setAnalytics(data));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Platform Overview</div>
        <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {stats.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Content */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Recent Content</span>
            <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>View all →</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mockContent.slice(0, 5).map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{c.thumb}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{c.views.toLocaleString()} views</div>
                </div>
                <Badge type={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Live Streams */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Live Streams</span>
            <span style={{ background: "var(--live)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: "'DM Mono', monospace", animation: "pulse 2s infinite" }}>● LIVE</span>
          </div>
          {channels.filter(c => c.status === "on-air").map(ch => (
            <div key={ch.id} style={{ background: "var(--surface2)", borderRadius: 8, padding: 14, marginBottom: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ch.name}</div>
                <Badge type="on-air" />
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>
                <span>⚡ {ch.bitrate}</span>
                <span>👁 {ch.viewers.toLocaleString()}</span>
                <span>🔧 {ch.encoder}</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <MiniChart color="var(--live)" />
              </div>
            </div>
          ))}

          {/* SCTE preview */}
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Upcoming SCTE Triggers</div>
            {scteMarkers.filter(m => m.status === "pending" || m.status === "scheduled").slice(0, 3).map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: "var(--orange)", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{m.time}</span>
                <span style={{ flex: 1, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.stream}</span>
                <span style={{ color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>{m.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by model */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Revenue by Monetization Model</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "SVOD", value: "$148,200", pct: 42, color: "var(--accent)", subs: "12,400 active" },
            { label: "AVOD", value: "$82,400", pct: 24, color: "var(--green)", subs: "2.1M impressions" },
            { label: "TVOD/PPV", value: "$117,600", pct: 34, color: "var(--orange)", subs: "4,820 purchases" },
          ].map(m => (
            <div key={m.label} style={{ background: "var(--surface2)", borderRadius: 10, padding: 18, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Badge type={m.label} />
                <span style={{ fontSize: 11, color: m.color, fontFamily: "'DM Mono', monospace" }}>{m.pct}% share</span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{m.subs}</div>
              <div style={{ marginTop: 12, height: 4, background: "var(--border)", borderRadius: 2 }}>
                <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 2, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CONTENT LIBRARY ──────────────────────────────────────────────────────────

function ContentLibrary() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState(mockContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getContent().then(data => {
      if (data && data.length > 0) setContent(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const types = ["ALL", "VOD", "LIVE", "LINEAR", "PPV"];
  const filtered = content.filter(c =>
    (filter === "ALL" || c.type === filter) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Content Library</div>
          <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{mockContent.length} titles across all types</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          background: "var(--accent)", color: "var(--bg)",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
          cursor: "pointer", transition: "opacity 0.2s",
        }}>+ Upload Content</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            background: filter === t ? "var(--accent)" : "var(--surface2)",
            color: filter === t ? "var(--bg)" : "var(--text2)",
            border: `1px solid ${filter === t ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 6, padding: "6px 14px", fontSize: 12,
            fontFamily: "'DM Mono', monospace", cursor: "pointer", transition: "all 0.15s",
          }}>{t}</button>
        ))}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search titles..."
          style={{
            marginLeft: "auto", background: "var(--surface2)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "7px 14px", color: "var(--text)", fontSize: 13,
            outline: "none", width: 200,
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
              {["Content", "Type", "Status", "Duration", "Views", "Revenue", "Monetization", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{
                borderBottom: "1px solid var(--border)",
                background: i % 2 === 0 ? "transparent" : "var(--surface2)08",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface3)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--surface2)08"}
              >
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{c.thumb}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{c.genre}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}><Badge type={c.type} /></td>
                <td style={{ padding: "14px 16px" }}><Badge type={c.status} /></td>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text2)" }}>{c.duration}</td>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text2)" }}>{c.views.toLocaleString()}</td>
                <td style={{ padding: "14px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--green)" }}>${c.revenue.toLocaleString()}</td>
                <td style={{ padding: "14px 16px" }}><Badge type={c.monetization} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Edit", "Analytics", "⋮"].map(a => (
                      <button key={a} style={{
                        background: "var(--surface3)", border: "1px solid var(--border)",
                        color: "var(--text2)", borderRadius: 5, padding: "4px 10px",
                        fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                        onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text2)"; }}
                      >{a}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000a", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: 16, padding: 32, width: 520, maxWidth: "90vw",
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Upload Content</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Title", type: "text", placeholder: "Content title..." },
                { label: "Genre", type: "text", placeholder: "e.g. Drama, Sports..." },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{f.label.toUpperCase()}</label>
                  <input type={f.type} placeholder={f.placeholder} style={{
                    width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none",
                  }} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>CONTENT TYPE</label>
                  <select style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                    <option>VOD</option><option>LIVE</option><option>LINEAR</option><option>PPV</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>MONETIZATION</label>
                  <select style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                    <option>SVOD</option><option>AVOD</option><option>TVOD</option><option>HYBRID</option>
                  </select>
                </div>
              </div>
              <div style={{
                border: "2px dashed var(--border2)", borderRadius: 10, padding: 32,
                textAlign: "center", color: "var(--text3)", fontSize: 13, cursor: "pointer",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.target.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.target.style.borderColor = "var(--border2)"}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                <div>Drop video file or <span style={{ color: "var(--accent)" }}>browse</span></div>
                <div style={{ fontSize: 11, marginTop: 4 }}>MP4, MOV, MXF, HLS supported</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button style={{ background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "10px 24px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Upload & Process</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SCTE MARKERS ─────────────────────────────────────────────────────────────

function SCTEPanel() {
  const [markers, setMarkers] = useState(scteMarkers);
  const [showNew, setShowNew] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>SCTE-35 Markers</div>
          <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>Ad splice & cue tone management for live streams</div>
        </div>
        <button onClick={() => setShowNew(true)} style={{
          background: "var(--orange)", color: "var(--bg)",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>+ Insert Marker</button>
      </div>

      {/* Info banner */}
      <div style={{ background: "var(--orange)11", border: "1px solid var(--orange)44", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⬦</span>
        <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--orange)" }}>SCTE-35</strong> markers signal ad insertion points in live/linear streams. <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--accent)" }}>SPLICE_INSERT</span> replaces the stream segment with an ad; <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--accent)" }}>TIME_SIGNAL</span> carries metadata for downstream SSAI systems like AWS MediaTailor or Google DAI.
        </div>
      </div>

      {/* Marker cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {markers.map(m => (
          <div key={m.id} style={{
            background: "var(--surface)", border: `1px solid ${m.status === "fired" ? "var(--green)44" : m.status === "pending" ? "var(--orange)44" : "var(--border)"}`,
            borderRadius: 10, padding: "16px 20px",
            display: "grid", gridTemplateColumns: "auto 1fr auto auto auto auto",
            gap: 20, alignItems: "center",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.status === "fired" ? "var(--green)" : m.status === "pending" ? "var(--orange)" : "var(--text3)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.stream}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{m.adBreak}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>TIMECODE</div>
              <div style={{ fontFamily: "'DM Mono', monospace", color: "var(--accent)", fontSize: 13 }}>{m.time}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>TYPE</div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--purple)", background: "var(--purple)15", padding: "2px 8px", borderRadius: 4 }}>{m.type}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>DURATION</div>
              <div style={{ fontFamily: "'DM Mono', monospace", color: "var(--text2)", fontSize: 13 }}>{m.duration}</div>
            </div>
            <Badge type={m.status} />
          </div>
        ))}
      </div>

      {/* SCTE Timeline visualization */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Timeline View — Live: City Night Jazz</div>
        <div style={{ position: "relative", height: 60, background: "var(--surface2)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
          {/* stream bar */}
          <div style={{ position: "absolute", inset: "20px 0", background: "linear-gradient(90deg, var(--accent)33, var(--accent)22)", borderRadius: 4 }} />
          {/* markers */}
          {[{ pct: 20, label: "00:14:32", fired: true }, { pct: 62, label: "00:44:32", fired: false }].map((mk, i) => (
            <div key={i} style={{ position: "absolute", left: `${mk.pct}%`, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 2, height: "100%", background: mk.fired ? "var(--green)" : "var(--orange)", position: "relative" }}>
                <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", background: mk.fired ? "var(--green)" : "var(--orange)", borderRadius: 3, padding: "2px 6px", fontSize: 9, color: "var(--bg)", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{mk.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>
          <span style={{ color: "var(--green)" }}>■ Fired splice</span>
          <span style={{ color: "var(--orange)" }}>■ Pending splice</span>
          <span style={{ color: "var(--accent)" }}>■ Stream content</span>
        </div>
      </div>

      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNew(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 16, padding: 32, width: 480 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Insert SCTE-35 Marker</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ label: "STREAM", type: "select", opts: ["Live: City Night Jazz", "Morning Brief Live", "Championship Finals PPV"] },
                { label: "MARKER TYPE", type: "select", opts: ["SPLICE_INSERT", "TIME_SIGNAL", "SPLICE_NULL", "BANDWIDTH_RESERVATION"] },
                { label: "AD BREAK", type: "select", opts: ["Pre-roll A", "Mid-roll B", "Post-roll C", "Sponsor Slot", "Hour Break"] },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{f.label}</label>
                  <select style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none" }}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>TIMECODE (HH:MM:SS)</label>
                  <input defaultValue="00:30:00" style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--accent)", fontSize: 13, outline: "none", fontFamily: "'DM Mono', monospace" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>DURATION (seconds)</label>
                  <input defaultValue="30" style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "'DM Mono', monospace" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowNew(false)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowNew(false)} style={{ background: "var(--orange)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "10px 24px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>⬦ Insert Marker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LINEAR / EPG ─────────────────────────────────────────────────────────────

function LinearEPG() {
  const hours = Array.from({ length: 8 }, (_, i) => i + 8);
  const programs = [
    { ch: "Channel One HD", start: 8, end: 9, title: "Morning News" },
    { ch: "Channel One HD", start: 9, end: 10.5, title: "Talk Show Live" },
    { ch: "Channel One HD", start: 10.5, end: 12, title: "Documentary Hour" },
    { ch: "Sports 24", start: 8, end: 10, title: "Pre-Game Analysis" },
    { ch: "Sports 24", start: 10, end: 13, title: "Championship Match" },
    { ch: "Music Vibes", start: 8, end: 9.5, title: "Top 40 Countdown" },
    { ch: "Music Vibes", start: 9.5, end: 11, title: "Indie Spotlight" },
    { ch: "Music Vibes", start: 11, end: 14, title: "Jazz Morning" },
  ];
  const chNames = [...new Set(programs.map(p => p.ch))];
  const colors = { "Channel One HD": "var(--accent)", "Sports 24": "var(--live)", "Music Vibes": "var(--purple)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Linear Channels & EPG</div>
          <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>Electronic Program Guide management</div>
        </div>
        <button style={{ background: "var(--purple)", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Schedule Program</button>
      </div>

      {/* Channels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {channels.map(ch => (
          <div key={ch.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{ch.name}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
                {ch.encoder} · {ch.bitrate} · {ch.epgSlots} slots
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge type={ch.status} />
              {ch.viewers > 0 && <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 6 }}>👁 {ch.viewers.toLocaleString()}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* EPG Grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, overflow: "auto" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 16 }}>Today's Schedule</div>
        <div style={{ minWidth: 800 }}>
          {/* Hour headers */}
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", marginBottom: 8 }}>
            <div />
            <div style={{ display: "flex" }}>
              {hours.map(h => (
                <div key={h} style={{ flex: 1, fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", borderLeft: "1px solid var(--border)", paddingLeft: 6 }}>
                  {h.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>
          {/* Rows */}
          {chNames.map(chName => (
            <div key={chName} style={{ display: "grid", gridTemplateColumns: "140px 1fr", marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, paddingRight: 12, display: "flex", alignItems: "center", borderRight: "1px solid var(--border)", paddingLeft: 4 }}>{chName}</div>
              <div style={{ position: "relative", height: 40, borderLeft: "none" }}>
                {/* grid lines */}
                {hours.map((h, i) => (
                  <div key={h} style={{ position: "absolute", left: `${(i / hours.length) * 100}%`, top: 0, bottom: 0, borderLeft: "1px solid var(--border)22", width: 1 }} />
                ))}
                {programs.filter(p => p.ch === chName).map((p, i) => {
                  const left = ((p.start - 8) / hours.length) * 100;
                  const width = ((p.end - p.start) / hours.length) * 100;
                  const color = colors[chName] || "var(--accent)";
                  return (
                    <div key={i} style={{
                      position: "absolute", left: `${left}%`, width: `calc(${width}% - 4px)`,
                      top: 2, bottom: 2, background: `${color}22`, border: `1px solid ${color}66`,
                      borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px",
                      overflow: "hidden", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = `${color}44`}
                      onMouseLeave={e => e.currentTarget.style.background = `${color}22`}
                    >
                      <span style={{ fontSize: 11, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}>{p.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PPV ───────────────────────────────────────────────────────────────────────

function PPVPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>PPV Events</div>
          <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>Pay-per-view & ticketed live events</div>
        </div>
        <button style={{ background: "var(--orange)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Create PPV Event</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {mockContent.filter(c => c.type === "PPV").map(ev => (
          <div key={ev.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, var(--orange)22, var(--orange)11)", padding: "24px 24px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{ev.thumb}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{ev.genre} · {ev.duration}</div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Status", val: <Badge type={ev.status} /> },
                  { label: "Revenue", val: <span style={{ color: "var(--green)", fontFamily: "'DM Mono', monospace" }}>${ev.revenue.toLocaleString()}</span> },
                  { label: "Views", val: <span style={{ fontFamily: "'DM Mono', monospace" }}>{ev.views.toLocaleString()}</span> },
                ].map(d => (
                  <div key={d.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>{d.label.toUpperCase()}</div>
                    <div style={{ fontSize: 13 }}>{d.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 7, padding: "8px 0", fontSize: 12, cursor: "pointer" }}>Set Price</button>
                <button style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 7, padding: "8px 0", fontSize: 12, cursor: "pointer" }}>Geo-block</button>
                <button style={{ flex: 1, background: "var(--orange)22", border: "1px solid var(--orange)66", color: "var(--orange)", borderRadius: 7, padding: "8px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Manage</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing config */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>PPV Pricing Tiers</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { tier: "Standard", price: "$9.99", access: "HD Stream", color: "var(--text2)" },
            { tier: "Premium", price: "$19.99", access: "4K + Replay 48h", color: "var(--orange)" },
            { tier: "VIP", price: "$49.99", access: "4K + Backstage + 30d replay", color: "var(--yellow)" },
          ].map(t => (
            <div key={t.tier} style={{ background: "var(--surface2)", border: `1px solid ${t.color}44`, borderRadius: 10, padding: 18, textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: t.color, fontSize: 15, marginBottom: 8 }}>{t.tier}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{t.price}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{t.access}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MONETIZATION ──────────────────────────────────────────────────────────────

function Monetization() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Monetization</div>
        <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>SVOD · AVOD / SSAI · TVOD · Hybrid configuration</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* SVOD */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Badge type="SVOD" />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Subscription Plans</span>
          </div>
          {[
            { plan: "Basic", price: "$4.99/mo", subs: "3,420", color: "var(--text2)" },
            { plan: "Standard", price: "$9.99/mo", subs: "6,880", color: "var(--accent)" },
            { plan: "Premium", price: "$14.99/mo", subs: "2,100", color: "var(--yellow)" },
          ].map(p => (
            <div key={p.plan} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontWeight: 600, color: p.color }}>{p.plan}</div>
                <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>{p.price}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--text)" }}>{p.subs}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>subscribers</div>
              </div>
            </div>
          ))}
        </div>

        {/* AVOD / SSAI */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Badge type="AVOD" />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>SSAI Ad Configuration</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Ad Server", val: "AWS MediaTailor", type: "config" },
              { label: "VAST Version", val: "VAST 4.0", type: "config" },
              { label: "Impression Rate", val: "94.2%", type: "metric" },
              { label: "Fill Rate", val: "88.7%", type: "metric" },
              { label: "eCPM", val: "$4.82", type: "metric" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, color: "var(--text3)" }}>{r.label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: r.type === "metric" ? "var(--green)" : "var(--accent)" }}>{r.val}</span>
              </div>
            ))}
          </div>
          <button style={{ marginTop: 16, width: "100%", background: "var(--green)22", border: "1px solid var(--green)44", color: "var(--green)", borderRadius: 8, padding: "9px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Configure SSAI Endpoints</button>
        </div>
      </div>

      {/* Hybrid rules */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 22 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 18 }}>Hybrid Monetization Rules</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { rule: "Free content → AVOD (pre-roll 15s)", trigger: "content.plan == FREE", action: "inject_ad(pre_roll, 15s)", active: true },
            { rule: "SVOD subscriber → No ads", trigger: "user.subscription == ACTIVE", action: "skip_ads()", active: true },
            { rule: "Premium VOD → TVOD paywall", trigger: "content.tier == PREMIUM && !user.purchased", action: "show_paywall()", active: true },
            { rule: "Lapsed subscriber → Show upsell", trigger: "user.subscription == LAPSED", action: "show_upsell_modal()", active: false },
          ].map((r, i) => (
            <div key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.active ? "var(--green)" : "var(--text3)", marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{r.rule}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--purple)", background: "var(--purple)15", padding: "2px 8px", borderRadius: 4 }}>IF {r.trigger}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--accent)", background: "var(--accent)15", padding: "2px 8px", borderRadius: 4 }}>THEN {r.action}</span>
                </div>
              </div>
              <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text3)", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LIVE STREAM MANAGER ───────────────────────────────────────────────────────

const liveStreams = [
  { id: 1, name: "City Night Jazz", status: "live", encoder: "AWS Elemental Live", ingestUrl: "rtmp://ingest.streamcms.io/live/ax9f2", protocol: "HLS", bitrate: 6200, targetBitrate: 6000, fps: 30, keyframe: 2, latency: 4.2, viewers: 14220, uptime: "02:14:33", health: 98, thumb: "🎵", cdn: "CloudFront", drm: "Widevine+FairPlay", resolution: "1080p" },
  { id: 2, name: "Sports 24 — Live", status: "live", encoder: "MediaLive", ingestUrl: "rtmp://ingest.streamcms.io/live/bz7k1", protocol: "DASH", bitrate: 11800, targetBitrate: 12000, fps: 60, keyframe: 2, latency: 2.1, viewers: 9810, uptime: "05:42:10", health: 100, thumb: "⚽", cdn: "Akamai", drm: "Widevine", resolution: "4K" },
  { id: 3, name: "Morning Brief", status: "starting", encoder: "Wowza", ingestUrl: "rtmp://ingest.streamcms.io/live/cm3p9", protocol: "HLS", bitrate: 0, targetBitrate: 4000, fps: 30, keyframe: 2, latency: 0, viewers: 0, uptime: "00:00:00", health: 0, thumb: "📡", cdn: "CloudFront", drm: "None", resolution: "720p" },
  { id: 4, name: "Music Vibes", status: "live", encoder: "AWS Elemental Live", ingestUrl: "rtmp://ingest.streamcms.io/live/dq5h8", protocol: "HLS", bitrate: 5900, targetBitrate: 6000, fps: 30, keyframe: 2, latency: 3.8, viewers: 2340, uptime: "01:08:22", health: 95, thumb: "🎶", cdn: "CloudFront", drm: "FairPlay", resolution: "1080p" },
];

function SparkLine({ color, height = 36, points: externalPoints }) {
  const [points] = useState(() => externalPoints || Array.from({ length: 24 }, () => Math.random() * 80 + 20));
  const w = 160, h = height;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const norm = points.map(p => h - ((p - min) / range) * (h - 4) - 2);
  const pts = norm.map((y, i) => `${(i / (points.length - 1)) * w},${y}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`g${color.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill={`url(#g${color.replace(/[^a-z]/gi, "")})`} stroke="none"
        points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function HealthBar({ pct, color }) {
  return (
    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
    </div>
  );
}

function LiveStreamManager() {
  const [streams, setStreams] = useState(liveStreams);
  const [selected, setSelected] = useState(liveStreams[0]);
  const [bitrateHistory] = useState(() => liveStreams.reduce((acc, s) => {
    acc[s.id] = Array.from({ length: 24 }, (_, i) => s.targetBitrate * (0.85 + Math.random() * 0.2));
    return acc;
  }, {}));

  useEffect(() => {
    api.getStreams().then(data => {
      if (data && data.length > 0) {
        setStreams(data);
        setSelected(data[0]);
      }
    }).catch(() => {});
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Live Stream Manager</div>
          <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
            Encoder health · Ingest monitoring · HLS/DASH delivery
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 8, padding: "9px 16px", fontSize: 12, cursor: "pointer" }}>⊕ Add Input</button>
          <button style={{ background: "var(--live)", color: "white", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>● Start Stream</button>
        </div>
      </div>

      {/* Stream cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {liveStreams.map(s => {
          const isSelected = selected?.id === s.id;
          const healthColor = s.health > 90 ? "var(--green)" : s.health > 70 ? "var(--orange)" : "var(--red)";
          return (
            <div key={s.id} onClick={() => setSelected(s)} style={{
              background: "var(--surface)", border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{s.thumb}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{s.encoder}</div>
                  </div>
                </div>
                <Badge type={s.status === "live" ? "on-air" : "scheduled"} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "BITRATE", val: s.status === "live" ? `${(s.bitrate / 1000).toFixed(1)}M` : "—", color: s.bitrate > s.targetBitrate * 0.95 ? "var(--green)" : "var(--orange)" },
                  { label: "LATENCY", val: s.latency > 0 ? `${s.latency}s` : "—", color: s.latency < 5 ? "var(--green)" : "var(--orange)" },
                  { label: "VIEWERS", val: s.viewers > 0 ? s.viewers.toLocaleString() : "0", color: "var(--text)" },
                  { label: "UPTIME", val: s.uptime, color: "var(--text2)" },
                ].map(m => (
                  <div key={m.label} style={{ background: "var(--surface2)", borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: m.color, fontWeight: 500 }}>{m.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>STREAM HEALTH</span>
                  <span style={{ fontSize: 10, color: healthColor, fontFamily: "'DM Mono', monospace" }}>{s.health}%</span>
                </div>
                <HealthBar pct={s.health} color={healthColor} />
              </div>

              {s.status === "live" && (
                <SparkLine color={healthColor} height={32} points={bitrateHistory[s.id]} />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span>{selected.thumb}</span> {selected.name} — Stream Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {/* Ingest */}
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Ingest Configuration</div>
              {[
                { k: "Ingest URL", v: selected.ingestUrl },
                { k: "Protocol", v: selected.protocol },
                { k: "Resolution", v: selected.resolution },
                { k: "Frame Rate", v: `${selected.fps} fps` },
                { k: "Keyframe Int.", v: `${selected.keyframe}s` },
                { k: "Target Bitrate", v: `${(selected.targetBitrate / 1000).toFixed(1)} Mbps` },
              ].map(r => (
                <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{r.k}</span>
                  <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--accent)" }}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Delivery */}
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Delivery</div>
              {[
                { k: "CDN", v: selected.cdn },
                { k: "DRM", v: selected.drm },
                { k: "Latency Mode", v: selected.latency < 3 ? "Ultra-Low" : "Low" },
                { k: "ABR Profiles", v: "4 renditions" },
                { k: "Segment Length", v: "2s" },
                { k: "DVR Window", v: "4h" },
              ].map(r => (
                <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{r.k}</span>
                  <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--green)" }}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Controls</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "⊙ Preview Player", color: "var(--accent)" },
                  { label: "⬦ Insert SCTE Marker", color: "var(--orange)" },
                  { label: "⊕ Add Rendition", color: "var(--purple)" },
                  { label: "↻ Restart Encoder", color: "var(--text2)" },
                  { label: "▣ Record to VOD", color: "var(--green)" },
                  { label: "◼ Stop Stream", color: "var(--red)" },
                ].map(a => (
                  <button key={a.label} style={{
                    background: "var(--surface2)", border: `1px solid ${a.color}44`,
                    color: a.color, borderRadius: 8, padding: "9px 14px",
                    fontSize: 12, cursor: "pointer", textAlign: "left", fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${a.color}15`}
                    onMouseLeave={e => e.currentTarget.style.background = "var(--surface2)"}
                  >{a.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Bitrate chart */}
          <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 10, textTransform: "uppercase" }}>Bitrate History (last 24 segments)</div>
            <SparkLine color="var(--accent)" height={60} points={bitrateHistory[selected.id]} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── SUBSCRIBER MANAGEMENT ─────────────────────────────────────────────────────

const subscribers = [
  { id: 1, name: "Amara Osei", email: "amara@example.com", plan: "Premium", status: "active", joined: "Jan 12, 2024", renewal: "Jan 12, 2025", spent: 179.88, country: "🇬🇧", watched: 142, avatar: "AO" },
  { id: 2, name: "Carlos Mendes", email: "carlos@example.com", plan: "Standard", status: "active", joined: "Mar 5, 2024", renewal: "Mar 5, 2025", spent: 89.91, country: "🇧🇷", watched: 88, avatar: "CM" },
  { id: 3, name: "Yuki Tanaka", email: "yuki@example.com", plan: "Basic", status: "lapsed", joined: "Nov 20, 2023", renewal: "Nov 20, 2024", spent: 59.88, country: "🇯🇵", watched: 204, avatar: "YT" },
  { id: 4, name: "Sofia Eriksson", email: "sofia@example.com", plan: "Premium", status: "active", joined: "Feb 1, 2024", renewal: "Feb 1, 2025", spent: 179.88, country: "🇸🇪", watched: 317, avatar: "SE" },
  { id: 5, name: "Marcus Webb", email: "marcus@example.com", plan: "Standard", status: "cancelled", joined: "Aug 14, 2023", renewal: "—", spent: 119.88, country: "🇺🇸", watched: 56, avatar: "MW" },
  { id: 6, name: "Priya Sharma", email: "priya@example.com", plan: "Premium", status: "active", joined: "Apr 22, 2024", renewal: "Apr 22, 2025", spent: 119.92, country: "🇮🇳", watched: 99, avatar: "PS" },
  { id: 7, name: "Leon Dubois", email: "leon@example.com", plan: "Basic", status: "active", joined: "Jun 30, 2024", renewal: "Jun 30, 2025", spent: 29.94, country: "🇫🇷", watched: 31, avatar: "LD" },
  { id: 8, name: "Hana Müller", email: "hana@example.com", plan: "Standard", status: "active", joined: "Sep 3, 2023", renewal: "Sep 3, 2025", spent: 239.76, country: "🇩🇪", watched: 521, avatar: "HM" },
];

function SubAvatar({ initials, color }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>{initials}</div>
  );
}

function SubscriberManagement() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [subList, setSubList] = useState(subscribers);
  const avatarColors = ["#00d4ff", "#a855f7", "#ff9533", "#00e5a0", "#ff4d6a", "#ffd166"];

  useEffect(() => {
    api.getSubscribers().then(data => {
      if (data && data.length > 0) setSubList(data);
    }).catch(() => {});
  }, []);

  const filtered = subList.filter(s =>
    (filter === "all" || s.status === filter || s.plan.toLowerCase() === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColors = { active: "var(--green)", lapsed: "var(--orange)", cancelled: "var(--red)" };

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 140px)" }}>
      {/* Left: list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Subscribers</div>
            <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              {subscribers.filter(s => s.status === "active").length} active · {subscribers.filter(s => s.status === "lapsed").length} lapsed · {subscribers.filter(s => s.status === "cancelled").length} cancelled
            </div>
          </div>
          <button style={{ background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "9px 18px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add Subscriber</button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Total", val: subscribers.length, color: "var(--text)" },
            { label: "Active", val: subscribers.filter(s => s.status === "active").length, color: "var(--green)" },
            { label: "MRR", val: "$12,400", color: "var(--accent)" },
            { label: "Churn", val: "2.4%", color: "var(--orange)" },
          ].map(c => (
            <div key={c.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{c.label.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["all", "active", "lapsed", "cancelled", "Premium", "Standard", "Basic"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? "var(--accent)" : "var(--surface2)",
              color: filter === f ? "var(--bg)" : "var(--text3)",
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 6, padding: "5px 12px", fontSize: 11,
              fontFamily: "'DM Mono', monospace", cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize",
            }}>{f}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ marginLeft: "auto", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", color: "var(--text)", fontSize: 12, outline: "none", width: 160 }} />
        </div>

        {/* Table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface2)", position: "sticky", top: 0 }}>
                {["Subscriber", "Plan", "Status", "Joined", "Renewal", "Spent", "Watched", ""].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 400, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} onClick={() => setSelected(s)} style={{
                  borderBottom: "1px solid var(--border)", cursor: "pointer",
                  background: selected?.id === s.id ? "var(--surface3)" : "transparent",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => { if (selected?.id !== s.id) e.currentTarget.style.background = "var(--surface2)"; }}
                  onMouseLeave={e => { if (selected?.id !== s.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <SubAvatar initials={s.avatar} color={avatarColors[i % avatarColors.length]} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{s.country} {s.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge type={s.plan} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, color: statusColors[s.status], fontFamily: "'DM Mono', monospace", background: `${statusColors[s.status]}18`, padding: "2px 8px", borderRadius: 4, textTransform: "capitalize" }}>{s.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text3)", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{s.joined}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text2)", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{s.renewal}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--green)", fontFamily: "'DM Mono', monospace" }}>${s.spent}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text2)", fontFamily: "'DM Mono', monospace" }}>{s.watched}h</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text3)", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer" }}>⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: detail drawer */}
      {selected && (
        <div style={{ width: 280, flexShrink: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <SubAvatar initials={selected.avatar} color={avatarColors[subscribers.indexOf(selected) % avatarColors.length]} />
            <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>{selected.country} {selected.name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{selected.email}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { k: "Plan", v: selected.plan },
              { k: "Status", v: selected.status },
              { k: "Joined", v: selected.joined },
              { k: "Renewal", v: selected.renewal },
              { k: "Total Spent", v: `$${selected.spent}` },
              { k: "Watch Hours", v: `${selected.watched}h` },
            ].map(r => (
              <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{r.k}</span>
                <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--text)" }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Send Email", "Change Plan", "Issue Refund", "Suspend Account"].map((a, i) => (
              <button key={a} style={{
                background: "var(--surface2)", border: "1px solid var(--border)", color: i === 3 ? "var(--red)" : "var(--text2)",
                borderRadius: 8, padding: "9px 14px", fontSize: 12, cursor: "pointer", textAlign: "left",
              }}>{a}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────

function AnalyticsDashboard() {
  const [range, setRange] = useState("30d");
  const [tab, setTab] = useState("overview");

  const genSeries = (len, base, variance) =>
    Array.from({ length: len }, (_, i) => Math.max(0, base + Math.sin(i / 3) * variance + (Math.random() - 0.5) * variance * 0.5));

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const viewerData = genSeries(days, 42000, 12000);
  const revenueData = genSeries(days, 11000, 3000);
  const retentionData = [100, 88, 76, 68, 62, 57, 53, 50, 47, 45];

  function AreaChart({ data, color, height = 120, label }) {
    const w = 500, h = height;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const xs = data.map((_, i) => (i / (data.length - 1)) * w);
    const ys = data.map(v => h - ((v - min) / range) * (h - 8) - 4);
    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
        <defs>
          <linearGradient id={`area-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#area-${label})`} points={`0,${h} ${pts} ${w},${h}`} />
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} />
      </svg>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Analytics</div>
          <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>Viewership · Revenue · Retention · Geography</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["7d", "30d", "90d"].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              background: range === r ? "var(--accent)" : "var(--surface2)",
              color: range === r ? "var(--bg)" : "var(--text3)",
              border: `1px solid ${range === r ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 6, padding: "6px 14px", fontSize: 12,
              fontFamily: "'DM Mono', monospace", cursor: "pointer",
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["overview", "content", "geography", "devices"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "var(--surface3)" : "transparent",
            border: "none", color: tab === t ? "var(--text)" : "var(--text3)",
            borderRadius: 7, padding: "7px 18px", fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", textTransform: "capitalize", transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { label: "Concurrent Peak", val: "64,210", sub: "+12% vs prev", color: "var(--accent)" },
              { label: "Total Views", val: "2.4M", sub: `Last ${range}`, color: "var(--text)" },
              { label: "Avg Watch Time", val: "38m", sub: "+5m vs prev", color: "var(--green)" },
              { label: "Completion Rate", val: "67%", sub: "VOD avg", color: "var(--yellow)" },
              { label: "Revenue", val: "$348K", sub: "+22% vs prev", color: "var(--orange)" },
            ].map(k => (
              <div key={k.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{k.label.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Daily Viewers</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>Unique viewers per day</div>
              <AreaChart data={viewerData} color="var(--accent)" height={120} label="viewers" />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>
                <span>{days}d ago</span><span>Today</span>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Daily Revenue</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>SVOD + AVOD + TVOD combined</div>
              <AreaChart data={revenueData} color="var(--green)" height={120} label="revenue" />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>
                <span>{days}d ago</span><span>Today</span>
              </div>
            </div>
          </div>

          {/* Retention + Top content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Retention curve */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Audience Retention Curve</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                {retentionData.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", background: `hsl(${160 + v * 0.8}, 70%, 50%)`, borderRadius: "2px 2px 0 0", height: `${v * 0.8}%`, minHeight: 2 }} />
                    <span style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>{i * 10}%</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
                <span>Start</span><span>Mid</span><span>End</span>
              </div>
            </div>

            {/* Top content */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Top Performing Content</div>
              {mockContent.filter(c => c.views > 0).sort((a, b) => b.views - a.views).map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace", width: 16 }}>#{i + 1}</span>
                  <span style={{ fontSize: 16 }}>{c.thumb}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginTop: 4 }}>
                      <div style={{ width: `${(c.views / 842310) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--text2)" }}>{(c.views / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "geography" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Viewers by Country</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { country: "🇺🇸 United States", pct: 34, viewers: 812400 },
              { country: "🇬🇧 United Kingdom", pct: 18, viewers: 430200 },
              { country: "🇩🇪 Germany", pct: 12, viewers: 286800 },
              { country: "🇯🇵 Japan", pct: 9, viewers: 215100 },
              { country: "🇧🇷 Brazil", pct: 8, viewers: 191200 },
              { country: "🇫🇷 France", pct: 7, viewers: 167300 },
              { country: "🇮🇳 India", pct: 6, viewers: 143400 },
              { country: "Other", pct: 6, viewers: 143400 },
            ].map(g => (
              <div key={g.country} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 140, fontSize: 13 }}>{g.country}</span>
                <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4 }}>
                  <div style={{ width: `${g.pct}%`, height: "100%", background: "var(--accent)", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--text3)", width: 80, textAlign: "right" }}>{g.viewers.toLocaleString()}</span>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--accent)", width: 36, textAlign: "right" }}>{g.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "devices" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Smart TV", pct: 38, icon: "📺", color: "var(--accent)" },
            { label: "Mobile", pct: 31, icon: "📱", color: "var(--purple)" },
            { label: "Desktop", pct: 19, icon: "💻", color: "var(--green)" },
            { label: "Tablet", pct: 8, icon: "⬛", color: "var(--orange)" },
            { label: "Set-Top Box", pct: 4, icon: "📦", color: "var(--yellow)" },
          ].map(d => (
            <div key={d.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 32 }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{d.label}</div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: d.color }}>{d.pct}%</div>
            </div>
          ))}
        </div>
      )}

      {tab === "content" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 20 }}>Content Performance Matrix</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface2)" }}>
                {["Title", "Type", "Views", "Avg Watch", "Completion", "Revenue", "Rating"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "var(--text3)", fontFamily: "'DM Mono', monospace", borderBottom: "1px solid var(--border)", fontWeight: 400, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockContent.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>{c.thumb} {c.title}</td>
                  <td style={{ padding: "12px 14px" }}><Badge type={c.type} /></td>
                  <td style={{ padding: "12px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text2)" }}>{c.views.toLocaleString()}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text2)" }}>{Math.floor(Math.random() * 40 + 15)}m</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--green)" }}>{Math.floor(Math.random() * 40 + 45)}%</td>
                  <td style={{ padding: "12px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--yellow)" }}>${c.revenue.toLocaleString()}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 1 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ fontSize: 10, color: star <= Math.round(Math.random() * 2 + 3) ? "var(--yellow)" : "var(--border2)" }}>★</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── PLATFORM SETTINGS ─────────────────────────────────────────────────────────

function PlatformSettings() {
  const [tab, setTab] = useState("drm");
  const [drmWide, setDrmWide] = useState(true);
  const [drmFair, setDrmFair] = useState(true);
  const [drmPlay, setDrmPlay] = useState(false);

  function Toggle({ val, onChange }) {
    return (
      <div onClick={() => onChange(!val)} style={{
        width: 40, height: 22, borderRadius: 11, background: val ? "var(--accent)" : "var(--border2)",
        position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: val ? 21 : 3, transition: "left 0.2s" }} />
      </div>
    );
  }

  function Section({ title, children }) {
    return (
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--text3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
        {children}
      </div>
    );
  }

  function Field({ label, value, mono, editable = true }) {
    const [val, setVal] = useState(value);
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 13, color: "var(--text2)", flex: 1 }}>{label}</span>
        {editable ? (
          <input defaultValue={val} style={{
            background: "var(--surface3)", border: "1px solid var(--border)", borderRadius: 6,
            padding: "5px 10px", color: mono ? "var(--accent)" : "var(--text)",
            fontSize: 12, outline: "none", textAlign: "right", width: 240,
            fontFamily: mono ? "'DM Mono', monospace" : "inherit",
          }} />
        ) : (
          <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--accent)" }}>{val}</span>
        )}
      </div>
    );
  }

  const tabs = ["drm", "cdn", "api", "notifications", "team"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800 }}>Platform Settings</div>
        <div style={{ color: "var(--text3)", fontSize: 13, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>DRM · CDN · API Keys · Notifications · Team</div>
      </div>

      <div style={{ display: "flex", gap: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? "var(--surface3)" : "transparent", border: "none",
            color: tab === t ? "var(--text)" : "var(--text3)", borderRadius: 7,
            padding: "7px 18px", fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 0.5, transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {tab === "drm" && (
        <div>
          <div style={{ background: "var(--accent)11", border: "1px solid var(--accent)33", borderRadius: 10, padding: "12px 18px", marginBottom: 16, fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--accent)" }}>DRM Configuration</strong> — Protect your content with multi-DRM. Widevine covers Android & Chrome; FairPlay covers Apple devices; PlayReady covers Windows & Xbox.
          </div>

          <Section title="Widevine (Google)">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>Enable Widevine</span>
              <Toggle val={drmWide} onChange={setDrmWide} />
            </div>
            <Field label="License Server URL" value="https://license.widevine.example.com/v1" mono />
            <Field label="Provider ID" value="streamcms-prod-001" mono />
            <Field label="Content Key Rotation" value="Every 24h" />
          </Section>

          <Section title="FairPlay (Apple)">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>Enable FairPlay</span>
              <Toggle val={drmFair} onChange={setDrmFair} />
            </div>
            <Field label="License Server URL" value="https://license.fairplay.example.com/fp" mono />
            <Field label="Certificate URL" value="https://cdn.example.com/fairplay.cer" mono />
            <Field label="Application ID" value="com.streamcms.player" mono />
          </Section>

          <Section title="PlayReady (Microsoft)">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text2)" }}>Enable PlayReady</span>
              <Toggle val={drmPlay} onChange={setDrmPlay} />
            </div>
            <Field label="License Server URL" value="https://license.playready.example.com" mono />
            <Field label="Custom Attributes" value="" />
          </Section>

          <button style={{ background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "11px 24px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save DRM Config</button>
        </div>
      )}

      {tab === "cdn" && (
        <div>
          <Section title="CDN Provider">
            {[
              { label: "Primary CDN", value: "Amazon CloudFront" },
              { label: "Failover CDN", value: "Akamai" },
              { label: "Origin URL", value: "https://origin.streamcms.io", mono: true },
              { label: "CDN Pull Zone", value: "streamcms.cloudfront.net", mono: true },
              { label: "Token Signing Key", value: "••••••••••••••••••••••••••••••••", mono: true },
              { label: "Token Expiry", value: "3600s" },
            ].map(f => <Field key={f.label} {...f} />)}
          </Section>

          <Section title="Delivery Profiles">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "4K Ultra HD", bitrate: "20 Mbps", codec: "H.265/HEVC", status: true },
                { label: "1080p HD", bitrate: "8 Mbps", codec: "H.264/AVC", status: true },
                { label: "720p HD", bitrate: "4 Mbps", codec: "H.264/AVC", status: true },
                { label: "480p SD", bitrate: "1.5 Mbps", codec: "H.264/AVC", status: true },
                { label: "360p Low", bitrate: "0.8 Mbps", codec: "H.264/AVC", status: false },
                { label: "Audio Only", bitrate: "128 kbps", codec: "AAC", status: true },
              ].map(p => (
                <div key={p.label} style={{ background: "var(--surface3)", border: `1px solid ${p.status ? "var(--green)44" : "var(--border)"}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace" }}>{p.bitrate} · {p.codec}</div>
                  <div style={{ fontSize: 10, color: p.status ? "var(--green)" : "var(--text3)", marginTop: 6 }}>{p.status ? "● Active" : "○ Inactive"}</div>
                </div>
              ))}
            </div>
          </Section>
          <button style={{ background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: 8, padding: "11px 24px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save CDN Config</button>
        </div>
      )}

      {tab === "api" && (
        <div>
          <Section title="API Keys">
            {[
              { name: "Production API Key", key: "sk_live_x9f2az••••••••••••••••••••••", scope: "Full Access", created: "Jan 2024" },
              { name: "Staging API Key", key: "sk_test_bz7k1m••••••••••••••••••••", scope: "Read-Only", created: "Mar 2024" },
              { name: "Webhook Secret", key: "whsec_cm3p9q••••••••••••••••••", scope: "Webhooks", created: "Jan 2024" },
            ].map(k => (
              <div key={k.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{k.name}</div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--accent)", marginTop: 3 }}>{k.key}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{k.scope} · Created {k.created}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "var(--surface3)", border: "1px solid var(--border)", color: "var(--text2)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>Reveal</button>
                  <button style={{ background: "var(--red)15", border: "1px solid var(--red)44", color: "var(--red)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>Revoke</button>
                </div>
              </div>
            ))}
            <button style={{ marginTop: 12, background: "var(--surface3)", border: "1px dashed var(--border2)", color: "var(--text2)", borderRadius: 8, padding: "10px 20px", fontSize: 12, cursor: "pointer" }}>+ Generate New Key</button>
          </Section>

          <Section title="Webhook Endpoints">
            {[
              { url: "https://yourapp.io/webhooks/stream", events: "stream.start, stream.end", status: "active" },
              { url: "https://yourapp.io/webhooks/subs", events: "subscriber.created, subscriber.cancelled", status: "active" },
              { url: "https://yourapp.io/webhooks/scte", events: "scte.marker.fired", status: "inactive" },
            ].map(w => (
              <div key={w.url} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)" }}>{w.url}</div>
                  <span style={{ fontSize: 10, color: w.status === "active" ? "var(--green)" : "var(--text3)", fontFamily: "'DM Mono', monospace" }}>{w.status}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{w.events}</div>
              </div>
            ))}
          </Section>
        </div>
      )}

      {tab === "notifications" && (
        <div>
          <Section title="Alert Rules">
            {[
              { label: "Stream goes offline unexpectedly", channel: "Email + Slack", enabled: true },
              { label: "Bitrate drops below 80% of target", channel: "Slack", enabled: true },
              { label: "Concurrent viewers exceed 100K", channel: "Email", enabled: false },
              { label: "SCTE marker fire failure", channel: "Email + PagerDuty", enabled: true },
              { label: "DRM license server unreachable", channel: "PagerDuty", enabled: true },
              { label: "Monthly revenue milestone", channel: "Email", enabled: true },
              { label: "Subscriber churn spike (>5%)", channel: "Email + Slack", enabled: false },
            ].map((n, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13 }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>via {n.channel}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: n.enabled ? "var(--green)" : "var(--text3)" }}>{n.enabled ? "On" : "Off"}</span>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: n.enabled ? "var(--green)" : "var(--border2)", position: "relative", cursor: "pointer" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: n.enabled ? 19 : 3, transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      )}

      {tab === "team" && (
        <div>
          <Section title="Team Members">
            {[
              { name: "Alex Rivera", email: "alex@streamcms.io", role: "Owner", avatar: "AR", lastSeen: "Just now" },
              { name: "Jade Kim", email: "jade@streamcms.io", role: "Admin", avatar: "JK", lastSeen: "2h ago" },
              { name: "Sam Okafor", email: "sam@streamcms.io", role: "Editor", avatar: "SO", lastSeen: "Yesterday" },
              { name: "Mia Llorente", email: "mia@streamcms.io", role: "Viewer", avatar: "ML", lastSeen: "3d ago" },
            ].map((m, i) => (
              <div key={m.email} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: ["var(--accent)", "var(--purple)", "var(--green)", "var(--orange)"][i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--bg)", flexShrink: 0 }}>{m.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{m.email}</div>
                </div>
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--text3)" }}>{m.lastSeen}</span>
                <span style={{ fontSize: 11, background: "var(--surface3)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: 5, fontFamily: "'DM Mono', monospace", color: "var(--text2)" }}>{m.role}</span>
                <button style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text3)", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer" }}>Edit</button>
              </div>
            ))}
            <button style={{ marginTop: 12, background: "var(--surface3)", border: "1px dashed var(--border2)", color: "var(--text2)", borderRadius: 8, padding: "10px 20px", fontSize: 12, cursor: "pointer" }}>+ Invite Team Member</button>
          </Section>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function OTTCMSDashboard() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const panels = {
    dashboard: <Dashboard />,
    content: <ContentLibrary />,
    live: <LiveStreamManager />,
    linear: <LinearEPG />,
    ppv: <PPVPanel />,
    scte: <SCTEPanel />,
    monetization: <Monetization />,
    subscribers: <SubscriberManagement />,
    analytics: <AnalyticsDashboard />,
    settings: <PlatformSettings />,
  };

  return (
    <>
      <style>{css}</style>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
        .nav-item { transition: all 0.15s; }
        .nav-item:hover { background: var(--surface3) !important; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: collapsed ? 56 : 220, flexShrink: 0,
          background: "var(--surface)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{ padding: "18px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, height: 60, flexShrink: 0 }}>
            <div style={{ width: 26, height: 26, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 14, color: "var(--bg)", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>▶</span>
            </div>
            {!collapsed && <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: "var(--text)", whiteSpace: "nowrap" }}>StreamCMS</span>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto", overflowX: "hidden" }}>
            {navItems.map(item => (
              <button key={item.id} className="nav-item" onClick={() => setActive(item.id)} style={{
                width: "100%", background: active === item.id ? "var(--surface3)" : "transparent",
                border: "none", borderLeft: active === item.id ? "2px solid var(--accent)" : "2px solid transparent",
                color: active === item.id ? "var(--text)" : "var(--text3)",
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "10px 0" : "10px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                cursor: "pointer", fontSize: 13,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, fontStyle: "normal" }}>{item.icon}</span>
                {!collapsed && <span style={{ fontWeight: active === item.id ? 600 : 400, whiteSpace: "nowrap" }}>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Collapse btn */}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: "transparent", border: "none", borderTop: "1px solid var(--border)",
            color: "var(--text3)", padding: "12px 16px", cursor: "pointer", fontSize: 16,
            display: "flex", justifyContent: collapsed ? "center" : "flex-end",
          }}>{collapsed ? "›" : "‹"}</button>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <div style={{ height: 60, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
              <input placeholder="Search content, streams, events..." style={{
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "7px 14px", color: "var(--text)", fontSize: 13,
                outline: "none", width: 280,
              }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Live indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--live)15", border: "1px solid var(--live)44", borderRadius: 20, padding: "4px 12px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--live)", animation: "pulse 1.5s infinite", display: "block" }} />
                <span style={{ fontSize: 11, color: "var(--live)", fontFamily: "'DM Mono', monospace" }}>3 LIVE</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🔔</div>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer" }}>A</div>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            {panels[active]}
          </div>
        </div>
      </div>
    </>
  );
}
