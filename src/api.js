const API_BASE = "https://api.nubianlive.com";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  return res.json();
}

export const api = {
  // Content
  getContent: () => request("/api/content"),
  createContent: (data) => request("/api/content", { method: "POST", body: JSON.stringify(data) }),
  deleteContent: (id) => request(`/api/content/${id}`, { method: "DELETE" }),

  // Subscribers
  getSubscribers: () => request("/api/subscribers"),
  createSubscriber: (data) => request("/api/subscribers", { method: "POST", body: JSON.stringify(data) }),
  updateSubscriber: (id, data) => request(`/api/subscribers/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Streams
  getStreams: () => request("/api/streams"),
  createStream: (data) => request("/api/streams", { method: "POST", body: JSON.stringify(data) }),

  // SCTE
  getSCTE: () => request("/api/scte"),
  createSCTE: (data) => request("/api/scte", { method: "POST", body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => request("/api/analytics"),

  // Upload
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE}/api/upload`, { method: "POST", body: formData }).then(r => r.json());
  },
};