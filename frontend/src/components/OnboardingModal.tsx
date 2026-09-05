import React, { useState } from 'react';
import { api } from '../services/api';
import { sound } from '../services/sound';
import { X, Sparkles, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'name' | 'phone' | 'otp'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please tell us your name!");
      return;
    }
    setError(null);
    sound.playClick();
    setStep('phone');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError(null);
    setLoading(true);
    sound.playClick();

    try {
      const res = await api.sendOtp(cleanPhone, name);
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
        setOtp(res.dev_otp); // auto-fill in dev mode
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Try demo mode!");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError(null);
    setLoading(true);
    sound.playClick();

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await api.verifyOtp(cleanPhone, otp.trim(), name.trim());
      sound.playJackpot();
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Try 123456.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async () => {
    sound.playClick();
    setLoading(true);
    try {
      const res = await api.demoLogin(name.trim() || "Warangal Explorer", "9876543210");
      sound.playJackpot();
      onSuccess(res.user);
      onClose();
    } catch (err) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-arcade-card w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X size={20} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎲</span>
          <div>
            <h2 className="font-pixel text-xs text-arcade-yellow">DICE & GO WARANGAL</h2>
            <p className="text-xs text-gray-400 font-mono">Join the Warangal Adventure Gang</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/80 border border-red-500 text-red-200 text-xs p-2.5 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-bold text-arcade-cyan mb-1">
                What should the gang call you?
              </label>
              <p className="text-xs text-gray-400 mb-2 font-mono">Your name appears on your Hangout Calendar & Adventure Diary.</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John, Sneha, Rahul..."
                autoFocus
                className="w-full bg-[#12111A] border-2 border-gray-700 focus:border-arcade-yellow text-white px-4 py-3 rounded-xl font-heading text-base outline-none shadow-retro-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-arcade-yellow hover:bg-yellow-400 text-black font-heading font-bold text-sm rounded-xl retro-btn flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Phone */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <div className="text-xs text-arcade-yellow font-heading font-bold mb-1">
                Hey {name}! 👋
              </div>
              <label className="block text-sm font-heading font-bold text-arcade-cyan mb-1">
                Enter your mobile number
              </label>
              <p className="text-xs text-gray-400 mb-2 font-mono">We'll send a 6-digit OTP for your Warangal diary pass.</p>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-400 font-mono text-sm">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  maxLength={10}
                  autoFocus
                  className="w-full bg-[#12111A] border-2 border-gray-700 focus:border-arcade-yellow text-white pl-12 pr-4 py-3 rounded-xl font-mono text-base outline-none shadow-retro-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-arcade-pink hover:bg-pink-500 text-white font-heading font-bold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Get OTP Code 📲"}
            </button>
          </form>
        )}

        {/* Step 3: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-heading font-bold text-arcade-cyan">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-gray-400 hover:text-white underline font-mono"
                >
                  Edit phone
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-2 font-mono">
                Code sent to +91 {phone}
              </p>

              {devOtp && (
                <div className="mb-2 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs p-2 rounded-lg font-mono flex items-center justify-between">
                  <span>Dev Mode OTP: <b>{devOtp}</b></span>
                  <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded">Auto-filled</span>
                </div>
              )}

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                autoFocus
                className="w-full bg-[#12111A] border-2 border-gray-700 focus:border-arcade-green text-center text-arcade-green font-mono text-xl tracking-widest px-4 py-3 rounded-xl outline-none shadow-retro-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-arcade-green hover:bg-emerald-400 text-black font-heading font-bold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Enter 🚀"}
            </button>
          </form>
        )}

        {/* Quick Demo Bypass */}
        <div className="mt-5 pt-4 border-t border-gray-800 text-center">
          <button
            type="button"
            onClick={handleDemoBypass}
            className="text-xs text-arcade-yellow/90 hover:text-arcade-yellow font-heading font-bold flex items-center justify-center gap-1.5 mx-auto"
          >
            <Sparkles size={14} /> Skip to instant Demo Mode (1-Tap)
          </button>
        </div>
      </div>
    </div>
  );
};
