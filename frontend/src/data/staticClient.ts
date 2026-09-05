import warangalData from './warangalData.json';

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  cuisine: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  maps_url: string;
  opening_time: string;
  closing_time: string;
  rating: number;
  review_count: number;
  price_range: string;
  best_known_for: string;
  veg: boolean;
  non_veg: boolean;
  indoor_seating: boolean;
  outdoor_seating: boolean;
  parking: boolean;
  discounts: string;
  seating_capacity: number;
  instagram_url: string;
  images: string;
  description: string;
  is_new: boolean;
  is_featured: boolean;
}

export interface ExploreItem {
  id: number;
  name: string;
  category: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  maps_url: string;
  best_time: string;
  entry_fee: string;
  opening_time: string;
  closing_time: string;
  rating: number;
  review_count: number;
  parking: boolean;
  friends_suitable: boolean;
  family_suitable: boolean;
  images: string;
  description: string;
  is_new: boolean;
  is_featured: boolean;
}

export interface EventItem {
  id: number;
  event_name: string;
  venue: string;
  category: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  date: string;
  start_time: string;
  end_time: string;
  individual_or_group: string;
  contact: string;
  maps_url: string;
  instagram_url: string;
  website_url: string;
  fee: string;
  rating: number;
  reviews: number;
  images: string;
  description: string;
  booking_information: string;
  is_featured: boolean;
}

const foodDatabase: FoodItem[] = warangalData.food as FoodItem[];
const exploreDatabase: ExploreItem[] = warangalData.explore as ExploreItem[];
const eventDatabase: EventItem[] = warangalData.events as EventItem[];

// Calculate Haversine distance in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Local Storage helpers
const STORAGE_KEYS = {
  VISITS: 'dicengo_visits_v1',
  FAVORITES: 'dicengo_favorites_v1',
  USER: 'dicengo_user',
  TOKEN: 'dicengo_token'
};

function getStoredVisits(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISITS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredVisits(visits: any[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  } catch (e) {
    console.error(e);
  }
}

function getStoredFavorites(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredFavorites(favs: any[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) {
    console.error(e);
  }
}

export const staticClient = {
  // Auth
  async sendOtp(phone: string, name?: string) {
    return { success: true, message: `OTP sent to ${phone}! Use 123456 to log in.` };
  },

  async verifyOtp(phone: string, otp: string, name?: string) {
    const userName = name?.trim() || "Warangal Explorer";
    const user = {
      id: 1,
      phone: phone,
      name: userName,
      tri_city_area: "Hanamkonda",
      explorer_level: "Rookie Roll",
      points: 150,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`
    };
    const token = "mock-jwt-token-warangal";
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { access_token: token, user };
  },

  async demoLogin(name: string = "Warangal Explorer", phone: string = "9876543210") {
    return this.verifyOtp(phone, "123456", name);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser() {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  async getMe() {
    return this.getCurrentUser();
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
    let items = [...foodDatabase];

    if (params.category && params.category !== "All") {
      const catLower = params.category.toLowerCase();
      items = items.filter(f => f.category.toLowerCase().includes(catLower));
    }

    if (params.area && params.area !== "All Areas") {
      const areaLower = params.area.toLowerCase();
      items = items.filter(f => f.area.toLowerCase().includes(areaLower));
    }

    if (params.veg_only) {
      items = items.filter(f => f.veg === true);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.toLowerCase().trim();
      items = items.filter(f =>
        f.name.toLowerCase().includes(s) ||
        f.cuisine.toLowerCase().includes(s) ||
        f.best_known_for.toLowerCase().includes(s) ||
        f.area.toLowerCase().includes(s) ||
        f.address.toLowerCase().includes(s)
      );
    }

    // Sort by rating descending
    items.sort((a, b) => b.rating - a.rating);

    const total = items.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginated = items.slice(offset, offset + limit);

    return { total, items: paginated };
  },

  async getFoodDetail(id: number) {
    const item = foodDatabase.find(f => f.id === Number(id));
    if (!item) throw new Error("Food place not found");
    return item;
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
    let items = [...exploreDatabase];

    if (params.category && params.category !== "All") {
      const catLower = params.category.toLowerCase();
      items = items.filter(e => e.category.toLowerCase().includes(catLower));
    }

    if (params.area && params.area !== "All Areas") {
      const areaLower = params.area.toLowerCase();
      items = items.filter(e => e.area.toLowerCase().includes(areaLower));
    }

    if (params.search && params.search.trim()) {
      const s = params.search.toLowerCase().trim();
      items = items.filter(e =>
        e.name.toLowerCase().includes(s) ||
        e.category.toLowerCase().includes(s) ||
        e.best_time.toLowerCase().includes(s) ||
        e.area.toLowerCase().includes(s) ||
        e.address.toLowerCase().includes(s)
      );
    }

    items.sort((a, b) => b.rating - a.rating);

    const total = items.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginated = items.slice(offset, offset + limit);

    return { total, items: paginated };
  },

  async getExploreDetail(id: number) {
    const item = exploreDatabase.find(e => e.id === Number(id));
    if (!item) throw new Error("Explore place not found");
    return item;
  },

  // Events
  async getEvents(bucket?: string, category?: string) {
    let items = [...eventDatabase];

    if (bucket && bucket !== "All") {
      if (bucket === "This Weekend") {
        items = items.filter(e => e.id % 2 === 0);
      } else if (bucket === "Free Entry") {
        items = items.filter(e => e.fee.toLowerCase().includes("free"));
      }
    }

    if (category && category !== "All") {
      items = items.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
    }

    return { total: items.length, items };
  },

  // Search All
  async searchAll(q: string) {
    const s = q.toLowerCase().trim();
    if (!s) return { food: [], explore: [], events: [] };

    const foodMatches = foodDatabase.filter(f =>
      f.name.toLowerCase().includes(s) ||
      f.category.toLowerCase().includes(s) ||
      f.cuisine.toLowerCase().includes(s) ||
      f.area.toLowerCase().includes(s)
    ).slice(0, 6);

    const exploreMatches = exploreDatabase.filter(e =>
      e.name.toLowerCase().includes(s) ||
      e.category.toLowerCase().includes(s) ||
      e.area.toLowerCase().includes(s)
    ).slice(0, 6);

    const eventMatches = eventDatabase.filter(ev =>
      ev.event_name.toLowerCase().includes(s) ||
      ev.category.toLowerCase().includes(s) ||
      ev.venue.toLowerCase().includes(s) ||
      ev.area.toLowerCase().includes(s)
    ).slice(0, 6);

    return {
      food: foodMatches,
      explore: exploreMatches,
      events: eventMatches
    };
  },

  // New in Warangal
  async getNewPlaces() {
    return {
      food: foodDatabase.filter(f => f.is_new).slice(0, 8),
      explore: exploreDatabase.filter(e => e.is_new).slice(0, 8)
    };
  },

  // Dice & Go Randomizer
  async rollDice(mode: string, user_lat: number = 18.0073, user_lng: number = 79.5668, allow_familiar: boolean = false) {
    const visits = getStoredVisits();
    const visitedFoodIds = new Set(visits.filter(v => v.item_type === 'food').map(v => v.item_id));
    const visitedExpIds = new Set(visits.filter(v => v.item_type === 'explore').map(v => v.item_id));

    let pool: { item: any; type: 'food' | 'explore'; punchline: string }[] = [];

    if (mode === "food") {
      let fList = foodDatabase;
      if (!allow_familiar && visitedFoodIds.size < foodDatabase.length) {
        const unvisited = fList.filter(f => !visitedFoodIds.has(f.id));
        if (unvisited.length > 0) fList = unvisited;
      }
      pool = fList.map(item => ({
        item,
        type: 'food' as const,
        punchline: `Target locked! Head to ${item.name} for legendary ${item.best_known_for}.`
      }));
    } else if (mode === "explore") {
      let eList = exploreDatabase;
      if (!allow_familiar && visitedExpIds.size < exploreDatabase.length) {
        const unvisited = eList.filter(e => !visitedExpIds.has(e.id));
        if (unvisited.length > 0) eList = unvisited;
      }
      pool = eList.map(item => ({
        item,
        type: 'explore' as const,
        punchline: `Adventure unlocked! Explore ${item.name} — best visited during ${item.best_time}.`
      }));
    } else if (mode === "quick_hangout") {
      const cafes = foodDatabase.filter(f => f.category === "Cafes" || f.category === "Street Food");
      const lakes = exploreDatabase.filter(e => e.category === "Lakes" || e.category === "Parks");
      pool = [
        ...cafes.map(item => ({ item, type: 'food' as const, punchline: "Chai & chill vibes activated!" })),
        ...lakes.map(item => ({ item, type: 'explore' as const, punchline: "Quick fresh air escape found!" }))
      ];
    } else if (mode === "budget_bite") {
      const cheapFood = foodDatabase.filter(f => f.price_range.includes("₹") && !f.price_range.includes("₹₹₹"));
      pool = cheapFood.map(item => ({
        item,
        type: 'food' as const,
        punchline: `Pocket friendly feast! ${item.best_known_for} under ₹200.`
      }));
    } else if (mode === "night_owl") {
      const lateFood = foodDatabase.filter(f => f.closing_time.includes("11:") || f.closing_time.includes("12:") || f.closing_time.includes("10:"));
      pool = lateFood.map(item => ({
        item,
        type: 'food' as const,
        punchline: `Midnight craving solved at ${item.name}!`
      }));
    } else {
      // Wildcard
      pool = [
        ...foodDatabase.slice(0, 50).map(item => ({ item, type: 'food' as const, punchline: "Fate has chosen your feast!" })),
        ...exploreDatabase.slice(0, 30).map(item => ({ item, type: 'explore' as const, punchline: "Wildcard exploration roll!" }))
      ];
    }

    if (pool.length === 0) {
      pool = foodDatabase.slice(0, 10).map(item => ({ item, type: 'food' as const, punchline: "Delicious discovery awaits!" }));
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    const dist = calculateDistance(user_lat, user_lng, picked.item.latitude, picked.item.longitude);

    return {
      success: true,
      item: picked.item,
      item_type: picked.type,
      distance_km: dist,
      reason: `Rolled via ${mode.replace('_', ' ').toUpperCase()} generator. Top rated spot in ${picked.item.area}.`,
      arcade_punchline: picked.punchline
    };
  },

  // AI Planner
  async generateItinerary(payload: {
    situation: string;
    group_size: number;
    budget_per_person: number;
    vibe: string;
    duration_hours: number;
  }) {
    const budget = payload.budget_per_person || 500;
    const foodList = [...foodDatabase].sort(() => 0.5 - Math.random());
    const exploreList = [...exploreDatabase].sort(() => 0.5 - Math.random());

    const stop1 = foodList.find(f => f.category === "Tiffin" || f.category === "Cafes") || foodList[0];
    const stop2 = exploreList.find(e => e.category === "Monuments" || e.category === "Temples") || exploreList[0];
    const stop3 = foodList.find(f => f.category === "Biryani" || f.category === "Restaurants") || foodList[1];
    const stop4 = exploreList.find(e => e.category === "Lakes" || e.category === "Sunset Spots" || e.category === "Parks") || exploreList[1];

    const cost1 = Math.min(120, Math.floor(budget * 0.2));
    const cost2 = 30;
    const cost3 = Math.min(260, Math.floor(budget * 0.45));
    const cost4 = Math.min(80, Math.floor(budget * 0.15));
    const totalCost = cost1 + cost2 + cost3 + cost4;

    return {
      itinerary_title: `Epic Warangal ${payload.vibe.toUpperCase()} Itinerary`,
      situation: payload.situation,
      total_cost_per_person: totalCost,
      budget_remaining: Math.max(0, budget - totalCost),
      stops: [
        {
          order: 1,
          time_slot: "10:30 AM - 11:30 AM",
          item_type: "food",
          item_id: stop1.id,
          name: stop1.name,
          area: stop1.area,
          category: stop1.category,
          estimated_cost: cost1,
          activity_notes: `Kickoff at ${stop1.name} with authentic ${stop1.best_known_for}.`
        },
        {
          order: 2,
          time_slot: "11:45 AM - 01:15 PM",
          item_type: "explore",
          item_id: stop2.id,
          name: stop2.name,
          area: stop2.area,
          category: stop2.category,
          estimated_cost: cost2,
          activity_notes: `Explore the heritage and capture photos at ${stop2.name}.`
        },
        {
          order: 3,
          time_slot: "01:30 PM - 03:00 PM",
          item_type: "food",
          item_id: stop3.id,
          name: stop3.name,
          area: stop3.area,
          category: stop3.category,
          estimated_cost: cost3,
          activity_notes: `Feast time! Enjoy ${stop3.best_known_for} at ${stop3.name}.`
        },
        {
          order: 4,
          time_slot: "05:00 PM - 06:45 PM",
          item_type: "explore",
          item_id: stop4.id,
          name: stop4.name,
          area: stop4.area,
          category: stop4.category,
          estimated_cost: cost4,
          activity_notes: `Sunset unwind and chai by the breeze at ${stop4.name}.`
        }
      ]
    };
  },

  // Take a Challenge
  async takeChallenge(payload: { budget_limit: number; group_type: string }) {
    const limit = payload.budget_limit || 500;
    const cheapFoods = foodDatabase.filter(f => f.price_range.includes("₹") && !f.price_range.includes("₹₹₹"));
    const spots = [...cheapFoods].sort(() => 0.5 - Math.random()).slice(0, 2);
    const parks = exploreDatabase.filter(e => e.entry_fee.toLowerCase().includes("free") || e.category === "Lakes");
    const park = parks[Math.floor(Math.random() * parks.length)] || exploreDatabase[0];

    const c1 = 120;
    const c2 = 180;
    const c3 = 20;
    const total = c1 + c2 + c3;

    return {
      challenge_title: `₹${limit} Tri-City Pocket Challenge`,
      budget_limit: limit,
      total_estimated_cost: total,
      remaining_money: Math.max(0, limit - total),
      mission: "Complete all 3 spots and log them in your Adventure Diary to earn +250 XP!",
      stops: [
        {
          stop_number: 1,
          name: spots[0]?.name || "Warangal Chai Adda",
          type: "food",
          cost: c1,
          target: spots[0]?.best_known_for || "Irani Chai & Bun Maska"
        },
        {
          stop_number: 2,
          name: spots[1]?.name || "Local Biryani Point",
          type: "food",
          cost: c2,
          target: spots[1]?.best_known_for || "Mini Dum Biryani"
        },
        {
          stop_number: 3,
          name: park.name,
          type: "explore",
          cost: c3,
          target: "Sunset view & photo checkpoint"
        }
      ]
    };
  },

  // Solo Mode
  async getSoloRecommendations() {
    const quietCafes = foodDatabase.filter(f => f.category === "Cafes" || f.indoor_seating).slice(0, 5);
    const quietSpots = exploreDatabase.filter(e => e.category === "Lakes" || e.category === "Parks" || e.category === "Temples").slice(0, 5);

    return [
      ...quietCafes.map(c => ({
        id: c.id,
        name: c.name,
        type: 'food' as const,
        area: c.area,
        vibe: "Quiet corner & good coffee",
        rating: c.rating
      })),
      ...quietSpots.map(s => ({
        id: s.id,
        name: s.name,
        type: 'explore' as const,
        area: s.area,
        vibe: "Peaceful walk & introspection",
        rating: s.rating
      }))
    ];
  },

  // Visits & Diary
  async recordVisit(itemId: number, itemType: string, source: string = "Direct", notes: string = "") {
    const visits = getStoredVisits();
    const existing = visits.filter(v => v.item_id === itemId && v.item_type === itemType);
    const isNew = existing.length === 0;

    const newVisit = {
      id: Date.now(),
      item_id: itemId,
      item_type: itemType,
      visited_at: new Date().toISOString(),
      discovery_source: source,
      notes: notes
    };

    visits.push(newVisit);
    saveStoredVisits(visits);

    return {
      success: true,
      visit: newVisit,
      is_new_discovery: isNew,
      visit_count: existing.length + 1
    };
  },

  async getVisits() {
    const visits = getStoredVisits();
    return visits.map(v => {
      let place: any = null;
      if (v.item_type === 'food') place = foodDatabase.find(f => f.id === v.item_id);
      else if (v.item_type === 'explore') place = exploreDatabase.find(e => e.id === v.item_id);
      else if (v.item_type === 'event') place = eventDatabase.find(ev => ev.id === v.item_id);

      return {
        ...v,
        place_name: place?.name || place?.event_name || `Spot #${v.item_id}`,
        place_category: place?.category || "Place",
        place_area: place?.area || "Warangal",
        rating: place?.rating || 4.5
      };
    });
  },

  async getVisitStats() {
    const visits = getStoredVisits();
    const uniqueSpots = new Set(visits.map(v => `${v.item_type}-${v.item_id}`));
    const foodCount = visits.filter(v => v.item_type === 'food').length;
    const exploreCount = visits.filter(v => v.item_type === 'explore').length;

    let level = "Rookie Explorer";
    if (uniqueSpots.size >= 15) level = "Tri-City Champion";
    else if (uniqueSpots.size >= 8) level = "Street Veteran";
    else if (uniqueSpots.size >= 3) level = "Local Wanderer";

    return {
      total_visits: visits.length,
      unique_spots_explored: uniqueSpots.size,
      food_visits: foodCount,
      explore_visits: exploreCount,
      explorer_level: level,
      points: uniqueSpots.size * 100 + visits.length * 25
    };
  },

  // Favorites
  async getFavorites() {
    const favs = getStoredFavorites();
    return favs.map(f => {
      let place: any = null;
      if (f.item_type === 'food') place = foodDatabase.find(item => item.id === f.item_id);
      else if (f.item_type === 'explore') place = exploreDatabase.find(item => item.id === f.item_id);
      else if (f.item_type === 'event') place = eventDatabase.find(item => item.id === f.item_id);

      return {
        ...f,
        place: place || { id: f.item_id, name: `Place #${f.item_id}`, category: "Favorite" }
      };
    });
  },

  async addFavorite(itemId: number, itemType: string) {
    const favs = getStoredFavorites();
    if (!favs.some(f => f.item_id === itemId && f.item_type === itemType)) {
      favs.push({ id: Date.now(), item_id: itemId, item_type: itemType, created_at: new Date().toISOString() });
      saveStoredFavorites(favs);
    }
    return { success: true };
  },

  async removeFavorite(itemType: string, itemId: number) {
    let favs = getStoredFavorites();
    favs = favs.filter(f => !(f.item_id === itemId && f.item_type === itemType));
    saveStoredFavorites(favs);
    return { success: true };
  },

  // Calendar
  async getCalendar(year: number, month: number) {
    const visits = getStoredVisits();
    const daysMap: Record<number, any[]> = {};

    visits.forEach(v => {
      const d = new Date(v.visited_at);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        const day = d.getDate();
        if (!daysMap[day]) daysMap[day] = [];
        let place: any = null;
        if (v.item_type === 'food') place = foodDatabase.find(f => f.id === v.item_id);
        else if (v.item_type === 'explore') place = exploreDatabase.find(e => e.id === v.item_id);
        else if (v.item_type === 'event') place = eventDatabase.find(ev => ev.id === v.item_id);

        daysMap[day].push({
          name: place?.name || place?.event_name || `Spot #${v.item_id}`,
          type: v.item_type,
          area: place?.area || "Warangal"
        });
      }
    });

    const activeDays = Object.keys(daysMap).map(Number);
    return {
      year,
      month,
      total_explored_days: activeDays.length,
      active_days: activeDays,
      days_data: daysMap
    };
  },

  // Monthly Recap
  async getMonthlyRecap(monthStr: string) {
    const visits = getStoredVisits();
    const uniqueSpots = new Set(visits.map(v => `${v.item_type}-${v.item_id}`));

    return {
      month: monthStr,
      total_discoveries: uniqueSpots.size,
      top_category: "Biryani & Cafes",
      top_spot: foodDatabase[0]?.name || "Kakatiya Deluxe Mess",
      badge_awarded: "Mango Popsicle Adventurer 🥭",
      days_active: Math.min(30, uniqueSpots.size)
    };
  },

  async markRecapSeen(monthStr: string) {
    return { success: true };
  },

  // Admin
  async getAdminStats(_adminKey: string) {
    return {
      food_places: foodDatabase.length,
      explore_places: exploreDatabase.length,
      events: eventDatabase.length,
      total_records: foodDatabase.length + exploreDatabase.length + eventDatabase.length
    };
  },

  async createFoodPlace(payload: any) {
    const newId = foodDatabase.length + 1000;
    const newItem = {
      id: newId,
      name: payload.name,
      category: payload.category || "Biryani",
      cuisine: "Multi Cuisine",
      address: payload.address || "Hanamkonda, Warangal",
      area: payload.area || "Hanamkonda",
      latitude: 18.0073,
      longitude: 79.5668,
      maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payload.name + " Warangal")}`,
      opening_time: "11:00 AM",
      closing_time: "11:00 PM",
      rating: payload.rating || 4.5,
      review_count: 50,
      price_range: payload.price_range || "₹₹ (Moderate)",
      best_known_for: payload.best_known_for || "Special dishes",
      veg: payload.veg ?? true,
      non_veg: payload.non_veg ?? true,
      indoor_seating: true,
      outdoor_seating: false,
      parking: true,
      discounts: "Student discount 10%",
      seating_capacity: 40,
      instagram_url: "",
      images: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      description: "Added through Admin console.",
      is_new: true,
      is_featured: false
    };
    foodDatabase.unshift(newItem);
    return newItem;
  }
};
