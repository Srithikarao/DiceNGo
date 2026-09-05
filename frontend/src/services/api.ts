const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("dicengo_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async sendOtp(phone: string, name?: string) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to send OTP" }));
      throw new Error(err.detail || "Failed to send OTP");
    }
    return res.json();
  },

  async verifyOtp(phone: string, otp: string, name?: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Invalid OTP code" }));
      throw new Error(err.detail || "Invalid OTP code");
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("dicengo_token", data.access_token);
      localStorage.setItem("dicengo_user", JSON.stringify(data.user));
    }
    return data;
  },

  async demoLogin(name: string = "Warangal Explorer", phone: string = "9876543210") {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (!res.ok) throw new Error("Demo login failed");
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("dicengo_token", data.access_token);
      localStorage.setItem("dicengo_user", JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem("dicengo_token");
    localStorage.removeItem("dicengo_user");
  },

  getCurrentUser() {
    const u = localStorage.getItem("dicengo_user");
    return u ? JSON.parse(u) : null;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Food
  async getFood(params: { category?: string; area?: string; veg_only?: boolean; search?: string; lat?: number; lng?: number; limit?: number; offset?: number }) {
    const q = new URLSearchParams();
    if (params.category) q.append("category", params.category);
    if (params.area) q.append("area", params.area);
    if (params.veg_only) q.append("veg_only", "true");
    if (params.search) q.append("search", params.search);
    if (params.lat) q.append("lat", params.lat.toString());
    if (params.lng) q.append("lng", params.lng.toString());
    if (params.limit) q.append("limit", params.limit.toString());
    if (params.offset) q.append("offset", params.offset.toString());

    const res = await fetch(`${API_BASE}/food?${q.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getFoodDetail(id: number) {
    const res = await fetch(`${API_BASE}/food/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Explore
  async getExplore(params: { category?: string; area?: string; search?: string; lat?: number; lng?: number }) {
    const q = new URLSearchParams();
    if (params.category) q.append("category", params.category);
    if (params.area) q.append("area", params.area);
    if (params.search) q.append("search", params.search);
    if (params.lat) q.append("lat", params.lat.toString());
    if (params.lng) q.append("lng", params.lng.toString());

    const res = await fetch(`${API_BASE}/explore?${q.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getExploreDetail(id: number) {
    const res = await fetch(`${API_BASE}/explore/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Events
  async getEvents(bucket?: string, category?: string) {
    const q = new URLSearchParams();
    if (bucket) q.append("bucket", bucket);
    if (category) q.append("category", category);

    const res = await fetch(`${API_BASE}/events?${q.toString()}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Search
  async searchAll(q: string) {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // New places
  async getNewPlaces() {
    const res = await fetch(`${API_BASE}/new`);
    return res.json();
  },

  // Dice & Go
  async rollDice(mode: string, user_lat?: number, user_lng?: number, allow_familiar: boolean = false) {
    const res = await fetch(`${API_BASE}/dice/roll`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ mode, user_lat, user_lng, allow_familiar }),
    });
    return res.json();
  },

  // AI Planner
  async generateItinerary(payload: { situation: string; group_size: number; budget_per_person: number; vibe: string; duration_hours: number }) {
    const res = await fetch(`${API_BASE}/planner/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Take a Challenge
  async takeChallenge(payload: { budget_limit: number; group_type: string }) {
    const res = await fetch(`${API_BASE}/challenge/plan`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Solo Mode
  async getSoloRecommendations() {
    const res = await fetch(`${API_BASE}/solo/recommendations`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Visits
  async recordVisit(itemId: number, itemType: string, source: string = "Direct", notes?: string) {
    const res = await fetch(`${API_BASE}/visits`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ item_id: itemId, item_type: itemType, discovery_source: source, notes }),
    });
    return res.json();
  },

  async getVisits() {
    const res = await fetch(`${API_BASE}/visits`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getVisitStats() {
    const res = await fetch(`${API_BASE}/visits/stats`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Favorites
  async getFavorites() {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async addFavorite(itemId: number, itemType: string) {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ item_id: itemId, item_type: itemType }),
    });
    return res.json();
  },

  async removeFavorite(itemType: string, itemId: number) {
    const res = await fetch(`${API_BASE}/favorites/${itemType}/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Calendar & Recap
  async getCalendar(year: number, month: number) {
    const res = await fetch(`${API_BASE}/calendar/${year}/${month}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getMonthlyRecap(month: string) {
    const res = await fetch(`${API_BASE}/recaps/${month}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async markRecapSeen(month: string) {
    const res = await fetch(`${API_BASE}/recaps/${month}/seen`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Admin
  async getAdminStats(adminKey: string) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { "X-Admin-Key": adminKey },
    });
    return res.json();
  },

  async uploadExcel(file: File, adminKey: string) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/admin/upload-excel`, {
      method: "POST",
      headers: { "X-Admin-Key": adminKey },
      body: formData,
    });
    return res.json();
  }
};
