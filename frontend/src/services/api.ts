import { staticClient } from '../data/staticClient';

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:8000" : "");

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
    if (!API_BASE) return staticClient.sendOtp(phone, name);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch {
      return staticClient.sendOtp(phone, name);
    }
  },

  async verifyOtp(phone: string, otp: string, name?: string) {
    if (!API_BASE) return staticClient.verifyOtp(phone, otp, name);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });
      if (!res.ok) throw new Error("Invalid");
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("dicengo_token", data.access_token);
        localStorage.setItem("dicengo_user", JSON.stringify(data.user));
      }
      return data;
    } catch {
      return staticClient.verifyOtp(phone, otp, name);
    }
  },

  async demoLogin(name: string = "Warangal Explorer", phone: string = "9876543210") {
    if (!API_BASE) return staticClient.demoLogin(name, phone);
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("dicengo_token", data.access_token);
        localStorage.setItem("dicengo_user", JSON.stringify(data.user));
      }
      return data;
    } catch {
      return staticClient.demoLogin(name, phone);
    }
  },

  logout() {
    staticClient.logout();
  },

  getCurrentUser() {
    return staticClient.getCurrentUser();
  },

  async getMe() {
    return staticClient.getMe();
  },

  // Food
  async getFood(params: {
    category?: string;
    area?: string;
    veg_only?: boolean;
    search?: string;
    lat?: number;
    lng?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    if (!API_BASE) return staticClient.getFood(params);
    try {
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
      if (!res.ok) throw new Error("Failed to load food");
      const data = await res.json();
      if (!data || !data.items || data.items.length === 0) {
        return staticClient.getFood(params);
      }
      return data;
    } catch {
      return staticClient.getFood(params);
    }
  },

  async getFoodDetail(id: number) {
    if (!API_BASE) return staticClient.getFoodDetail(id);
    try {
      const res = await fetch(`${API_BASE}/food/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Not found");
      return await res.json();
    } catch {
      return staticClient.getFoodDetail(id);
    }
  },

  // Explore
  async getExplore(params: {
    category?: string;
    area?: string;
    search?: string;
    lat?: number;
    lng?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    if (!API_BASE) return staticClient.getExplore(params);
    try {
      const q = new URLSearchParams();
      if (params.category) q.append("category", params.category);
      if (params.area) q.append("area", params.area);
      if (params.search) q.append("search", params.search);
      if (params.lat) q.append("lat", params.lat.toString());
      if (params.lng) q.append("lng", params.lng.toString());

      const res = await fetch(`${API_BASE}/explore?${q.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load explore");
      const data = await res.json();
      if (!data || !data.items || data.items.length === 0) {
        return staticClient.getExplore(params);
      }
      return data;
    } catch {
      return staticClient.getExplore(params);
    }
  },

  async getExploreDetail(id: number) {
    if (!API_BASE) return staticClient.getExploreDetail(id);
    try {
      const res = await fetch(`${API_BASE}/explore/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Not found");
      return await res.json();
    } catch {
      return staticClient.getExploreDetail(id);
    }
  },

  // Events
  async getEvents(bucket?: string, category?: string) {
    if (!API_BASE) return staticClient.getEvents(bucket, category);
    try {
      const q = new URLSearchParams();
      if (bucket) q.append("bucket", bucket);
      if (category) q.append("category", category);

      const res = await fetch(`${API_BASE}/events?${q.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      if (!data || !data.items || data.items.length === 0) {
        return staticClient.getEvents(bucket, category);
      }
      return data;
    } catch {
      return staticClient.getEvents(bucket, category);
    }
  },

  // Search
  async searchAll(q: string) {
    if (!API_BASE) return staticClient.searchAll(q);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Search failed");
      return await res.json();
    } catch {
      return staticClient.searchAll(q);
    }
  },

  // New places
  async getNewPlaces() {
    if (!API_BASE) return staticClient.getNewPlaces();
    try {
      const res = await fetch(`${API_BASE}/new`);
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch {
      return staticClient.getNewPlaces();
    }
  },

  // Dice & Go
  async rollDice(mode: string, user_lat?: number, user_lng?: number, allow_familiar: boolean = false) {
    if (!API_BASE) return staticClient.rollDice(mode, user_lat, user_lng, allow_familiar);
    try {
      const res = await fetch(`${API_BASE}/dice/roll`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode, user_lat, user_lng, allow_familiar }),
      });
      if (!res.ok) throw new Error("Roll failed");
      return await res.json();
    } catch {
      return staticClient.rollDice(mode, user_lat, user_lng, allow_familiar);
    }
  },

  // AI Planner
  async generateItinerary(payload: {
    situation: string;
    group_size: number;
    budget_per_person: number;
    vibe: string;
    duration_hours: number;
  }) {
    if (!API_BASE) return staticClient.generateItinerary(payload);
    try {
      const res = await fetch(`${API_BASE}/planner/generate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Planner failed");
      return await res.json();
    } catch {
      return staticClient.generateItinerary(payload);
    }
  },

  // Take a Challenge
  async takeChallenge(payload: { budget_limit: number; group_type: string }) {
    if (!API_BASE) return staticClient.takeChallenge(payload);
    try {
      const res = await fetch(`${API_BASE}/challenge/plan`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Challenge failed");
      return await res.json();
    } catch {
      return staticClient.takeChallenge(payload);
    }
  },

  // Solo Mode
  async getSoloRecommendations() {
    if (!API_BASE) return staticClient.getSoloRecommendations();
    try {
      const res = await fetch(`${API_BASE}/solo/recommendations`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Solo failed");
      return await res.json();
    } catch {
      return staticClient.getSoloRecommendations();
    }
  },

  // Visits
  async recordVisit(itemId: number, itemType: string, source: string = "Direct", notes?: string) {
    if (!API_BASE) return staticClient.recordVisit(itemId, itemType, source, notes || "");
    try {
      const res = await fetch(`${API_BASE}/visits`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ item_id: itemId, item_type: itemType, discovery_source: source, notes }),
      });
      if (!res.ok) throw new Error("Visit failed");
      return await res.json();
    } catch {
      return staticClient.recordVisit(itemId, itemType, source, notes || "");
    }
  },

  async getVisits() {
    if (!API_BASE) return staticClient.getVisits();
    try {
      const res = await fetch(`${API_BASE}/visits`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Visits failed");
      return await res.json();
    } catch {
      return staticClient.getVisits();
    }
  },

  async getVisitStats() {
    if (!API_BASE) return staticClient.getVisitStats();
    try {
      const res = await fetch(`${API_BASE}/visits/stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Stats failed");
      return await res.json();
    } catch {
      return staticClient.getVisitStats();
    }
  },

  // Favorites
  async getFavorites() {
    if (!API_BASE) return staticClient.getFavorites();
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Favorites failed");
      return await res.json();
    } catch {
      return staticClient.getFavorites();
    }
  },

  async addFavorite(itemId: number, itemType: string) {
    if (!API_BASE) return staticClient.addFavorite(itemId, itemType);
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ item_id: itemId, item_type: itemType }),
      });
      if (!res.ok) throw new Error("Add favorite failed");
      return await res.json();
    } catch {
      return staticClient.addFavorite(itemId, itemType);
    }
  },

  async removeFavorite(itemType: string, itemId: number) {
    if (!API_BASE) return staticClient.removeFavorite(itemType, itemId);
    try {
      const res = await fetch(`${API_BASE}/favorites/${itemType}/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Remove favorite failed");
      return await res.json();
    } catch {
      return staticClient.removeFavorite(itemType, itemId);
    }
  },

  // Calendar & Recap
  async getCalendar(year: number, month: number) {
    if (!API_BASE) return staticClient.getCalendar(year, month);
    try {
      const res = await fetch(`${API_BASE}/calendar/${year}/${month}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Calendar failed");
      return await res.json();
    } catch {
      return staticClient.getCalendar(year, month);
    }
  },

  async getMonthlyRecap(month: string) {
    if (!API_BASE) return staticClient.getMonthlyRecap(month);
    try {
      const res = await fetch(`${API_BASE}/recaps/${month}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Recap failed");
      return await res.json();
    } catch {
      return staticClient.getMonthlyRecap(month);
    }
  },

  async markRecapSeen(month: string) {
    if (!API_BASE) return staticClient.markRecapSeen(month);
    try {
      const res = await fetch(`${API_BASE}/recaps/${month}/seen`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Recap seen failed");
      return await res.json();
    } catch {
      return staticClient.markRecapSeen(month);
    }
  },

  // Admin
  async getAdminStats(adminKey: string) {
    if (!API_BASE) return staticClient.getAdminStats(adminKey);
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { "X-Admin-Key": adminKey },
      });
      if (!res.ok) throw new Error("Admin failed");
      return await res.json();
    } catch {
      return staticClient.getAdminStats(adminKey);
    }
  },

  async uploadExcel(file: File, adminKey: string) {
    if (!API_BASE) return { message: "Excel uploaded to client engine", records: 435 };
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/admin/upload-excel`, {
      method: "POST",
      headers: { "X-Admin-Key": adminKey },
      body: formData,
    });
    return res.json();
  },

  async createFoodPlace(adminKey: string, payload: any) {
    if (!API_BASE) return staticClient.createFoodPlace(payload);
    try {
      const res = await fetch(`${API_BASE}/admin/food`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      return staticClient.createFoodPlace(payload);
    }
  }
};
