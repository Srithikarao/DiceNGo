import React, { useState } from 'react';
import { X, Shield, Download, Upload, Plus, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [adminKey, setAdminKey] = useState('admin123');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Food Form State
  const [foodName, setFoodName] = useState('');
  const [foodCat, setFoodCat] = useState('Biryani');
  const [foodArea, setFoodArea] = useState('Hanamkonda');
  const [foodBest, setFoodBest] = useState('');
  const [foodRating, setFoodRating] = useState('4.5');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.getAdminStats(adminKey);
      setStats(data);
      setIsUnlocked(true);
      sound.playJackpot();
    } catch (err: any) {
      setError("Invalid Admin Key! (Try admin123)");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/admin/food`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey
        },
        body: JSON.stringify({
          name: foodName,
          category: foodCat,
          area: foodArea,
          best_known_for: foodBest || "Specialty",
          rating: parseFloat(foodRating) || 4.5,
          latitude: 18.0050,
          longitude: 79.5600,
          veg: true,
          non_veg: true,
          is_new: true
        })
      });
      sound.playStamp();
      setMsg("New food spot added successfully!");
      setFoodName('');
      setFoodBest('');
      // Refresh stats
      const updated = await api.getAdminStats(adminKey);
      setStats(updated);
    } catch (err) {
      setError("Failed to create food spot");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMsg(null);
    setError(null);
    try {
      await api.uploadExcel(file, adminKey);
      sound.playJackpot();
      setMsg("Excel workbook uploaded & database successfully refreshed!");
      const updated = await api.getAdminStats(adminKey);
      setStats(updated);
    } catch (err: any) {
      setError(err.message || "Failed to upload Excel workbook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-arcade-card w-full max-w-md rounded-2xl border-3 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto scanlines">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-gray-400 hover:text-white p-1.5 rounded-full z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-arcade-green tracking-widest uppercase">
            MANAGEMENT CONSOLE
          </div>
          <h2 className="font-pixel text-base text-white mt-0.5">
            🛡️ ADMIN DASHBOARD
          </h2>
          <p className="text-xs text-gray-400 font-heading">
            Live database management & Excel sync
          </p>
        </div>

        {error && (
          <div className="mb-3 bg-red-950/80 border border-red-500 text-red-200 text-xs p-2.5 rounded-lg flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {msg && (
          <div className="mb-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs p-2.5 rounded-lg flex items-center gap-2">
            <Check size={14} /> {msg}
          </div>
        )}

        {!isUnlocked ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-arcade-cyan mb-1">
                Enter Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="admin123"
                className="w-full bg-[#12111A] border-2 border-gray-700 focus:border-arcade-green text-white p-3 rounded-xl font-mono text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-arcade-green hover:bg-emerald-400 text-black font-heading font-bold text-sm rounded-xl retro-btn"
            >
              {loading ? "Authenticating..." : "Unlock Admin Controls 🔓"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Live Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 bg-[#12111A] p-3 rounded-xl border border-gray-800 text-center font-mono">
                <div>
                  <div className="text-sm font-bold text-arcade-yellow">{stats.food_places}</div>
                  <div className="text-[10px] text-gray-400">Food Spots</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-arcade-cyan">{stats.explore_places}</div>
                  <div className="text-[10px] text-gray-400">Explore</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-arcade-pink">{stats.events}</div>
                  <div className="text-[10px] text-gray-400">Events</div>
                </div>
              </div>
            )}

            {/* Excel Sync Section */}
            <div className="p-3 bg-[#12111A] rounded-xl border-2 border-black shadow-retro-sm">
              <div className="text-xs font-pixel text-arcade-yellow mb-1">
                EXCEL DATASET WORKBOOK 📊
              </div>
              <p className="text-[11px] text-gray-400 font-heading mb-3">
                Download current records or upload a new Excel file with Food, Explore & Events sheets.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="http://localhost:8000/admin/export-excel"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-gray-800 hover:bg-gray-700 text-white font-heading font-bold text-xs rounded-lg border border-black flex items-center justify-center gap-1 text-center"
                >
                  <Download size={13} /> Export Excel
                </a>

                <label className="py-2 bg-arcade-yellow hover:bg-yellow-400 text-black font-heading font-bold text-xs rounded-lg border border-black flex items-center justify-center gap-1 cursor-pointer text-center">
                  <Upload size={13} /> Upload Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Add Place Form */}
            <form onSubmit={handleCreateFood} className="p-3.5 bg-[#12111A] rounded-xl border-2 border-black shadow-retro-sm space-y-2.5">
              <div className="text-xs font-pixel text-arcade-green">
                QUICK ADD RESTAURANT / CAFE ➕
              </div>

              <div>
                <input
                  type="text"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="Restaurant or Cafe Name"
                  required
                  className="w-full bg-[#1A1826] border border-gray-700 text-white px-3 py-2 rounded-lg text-xs font-heading outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={foodCat}
                  onChange={e => setFoodCat(e.target.value)}
                  className="bg-[#1A1826] border border-gray-700 text-white px-2 py-2 rounded-lg text-xs font-heading outline-none"
                >
                  {["Biryani", "Cafes", "Tiffin", "Restaurants", "Drive-ins", "Fast Food", "Desserts"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={foodArea}
                  onChange={e => setFoodArea(e.target.value)}
                  placeholder="Area (e.g. Subedari)"
                  className="bg-[#1A1826] border border-gray-700 text-white px-3 py-2 rounded-lg text-xs font-heading outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={foodBest}
                  onChange={e => setFoodBest(e.target.value)}
                  placeholder="Best known for (e.g. Mutton Dum Biryani)"
                  className="w-full bg-[#1A1826] border border-gray-700 text-white px-3 py-2 rounded-lg text-xs font-heading outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-arcade-green hover:bg-emerald-400 text-black font-heading font-bold text-xs rounded-lg retro-btn flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add to Live Database
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
