import React, { useState } from 'react';
import { X, Plus, Download, Upload, AlertCircle, Check } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [adminKey, setAdminKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Form states for adding place
  const [foodName, setFoodName] = useState('');
  const [foodCat, setFoodCat] = useState('Biryani');
  const [foodArea, setFoodArea] = useState('');
  const [foodBest, setFoodBest] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    sound.playClick();

    try {
      const data = await api.getAdminStats(adminKey);
      setStats(data);
      setIsUnlocked(true);
      sound.playJackpot();
    } catch (err: any) {
      setError(err.message || "Invalid Admin Key");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    setError('');
    setMsg('');
    setLoading(true);
    sound.playClick();

    try {
      await api.createFoodPlace(adminKey, {
        name: foodName,
        category: foodCat,
        area: foodArea || "Hanamkonda",
        best_known_for: foodBest || "Special items",
        rating: 4.5,
        review_count: 50,
        price_range: "₹₹ (Moderate)",
        veg: true,
        non_veg: true,
      });
      sound.playStamp();
      setMsg(`Added "${foodName}" to database successfully!`);
      setFoodName('');
      setFoodBest('');
      setFoodArea('');

      const updated = await api.getAdminStats(adminKey);
      setStats(updated);
    } catch (err: any) {
      setError(err.message || "Failed to add food place");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setMsg('');
    setLoading(true);
    sound.playClick();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto text-black">
      <div className="bg-[#EDD377] w-full max-w-md rounded-2xl border-4 border-black shadow-retro-xl p-5 relative max-h-[92vh] overflow-y-auto my-auto text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full z-10 border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-black tracking-widest uppercase font-black">
            MANAGEMENT CONSOLE
          </div>
          <h2 className="font-pixel text-base text-black mt-0.5 font-black">
            🛡️ ADMIN DASHBOARD
          </h2>
          <p className="text-xs text-black/80 font-heading font-semibold">
            Live database management & Excel sync
          </p>
        </div>

        {error && (
          <div className="mb-3 bg-[#F27430] border-2 border-black text-black font-bold text-xs p-2.5 rounded-lg flex items-center gap-2 shadow-retro-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {msg && (
          <div className="mb-3 bg-[#F2E829] border-2 border-black text-black font-bold text-xs p-2.5 rounded-lg flex items-center gap-2 shadow-retro-sm">
            <Check size={14} /> {msg}
          </div>
        )}

        {!isUnlocked ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-black text-black mb-1">
                Enter Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                placeholder="admin123"
                className="w-full bg-[#F2E829] border-2 border-black focus:border-[#F27430] text-black p-3 rounded-xl font-mono text-sm outline-none shadow-retro-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-sm rounded-xl retro-btn"
            >
              {loading ? "Authenticating..." : "Unlock Admin Controls 🔓"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Live Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 bg-[#F2B949] p-3 rounded-xl border-2 border-black text-center font-mono text-black font-bold shadow-retro-sm">
                <div>
                  <div className="text-sm font-black text-black">{stats.food_places}</div>
                  <div className="text-[10px] text-black/80">Food Spots</div>
                </div>
                <div>
                  <div className="text-sm font-black text-black">{stats.explore_places}</div>
                  <div className="text-[10px] text-black/80">Explore</div>
                </div>
                <div>
                  <div className="text-sm font-black text-black">{stats.events}</div>
                  <div className="text-[10px] text-black/80">Events</div>
                </div>
              </div>
            )}

            {/* Excel Sync Section */}
            <div className="p-3 bg-[#F2B949] rounded-xl border-2 border-black shadow-retro-sm text-black">
              <div className="text-xs font-pixel text-black mb-1 font-black">
                EXCEL DATASET WORKBOOK 📊
              </div>
              <p className="text-[11px] text-black/80 font-heading mb-3 font-medium">
                Download current records or upload a new Excel file with Food, Explore & Events sheets.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="http://localhost:8000/admin/export-excel"
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-[#EDD377] hover:bg-[#F2E829] text-black font-heading font-black text-xs rounded-lg border-2 border-black flex items-center justify-center gap-1 text-center"
                >
                  <Download size={13} /> Export Excel
                </a>

                <label className="py-2 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-xs rounded-lg border-2 border-black flex items-center justify-center gap-1 cursor-pointer text-center">
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
            <form onSubmit={handleCreateFood} className="p-3.5 bg-[#F2E829] rounded-xl border-2 border-black shadow-retro-sm space-y-2.5 text-black">
              <div className="text-xs font-pixel text-black font-black">
                QUICK ADD RESTAURANT / CAFE ➕
              </div>

              <div>
                <input
                  type="text"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  placeholder="Restaurant or Cafe Name"
                  required
                  className="w-full bg-[#EDD377] border-2 border-black text-black px-3 py-2 rounded-lg text-xs font-heading outline-none placeholder:text-black/60 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={foodCat}
                  onChange={e => setFoodCat(e.target.value)}
                  className="bg-[#EDD377] border-2 border-black text-black px-2 py-2 rounded-lg text-xs font-heading outline-none font-semibold"
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
                  className="bg-[#EDD377] border-2 border-black text-black px-3 py-2 rounded-lg text-xs font-heading outline-none placeholder:text-black/60 font-semibold"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={foodBest}
                  onChange={e => setFoodBest(e.target.value)}
                  placeholder="Best known for (e.g. Mutton Dum Biryani)"
                  className="w-full bg-[#EDD377] border-2 border-black text-black px-3 py-2 rounded-lg text-xs font-heading outline-none placeholder:text-black/60 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-xs rounded-lg retro-btn flex items-center justify-center gap-1.5"
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
