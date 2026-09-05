import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Phone, Check } from 'lucide-react';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'name' | 'phone' | 'otp'>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name or nickname");
      return;
    }
    setError('');
    sound.playClick();
    setStep('phone');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError('');
    setLoading(true);
    sound.playClick();

    try {
      await api.sendOtp(phone, name);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || "Failed to send OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the verification code");
      return;
    }
    setError('');
    setLoading(true);
    sound.playClick();

    try {
      const res = await api.verifyOtp(phone, otp, name);
      sound.playJackpot();
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid OTP code");
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
      <div className="bg-[#241b12] w-full max-w-sm rounded-2xl border-3 border-black shadow-retro-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🥭</span>
          <div>
            <h2 className="font-pixel text-xs text-[#F2E829]">DICE & GO WARANGAL</h2>
            <p className="text-xs text-[#EDD377] font-mono">Join the Warangal Adventure Gang</p>
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
              <label className="block text-sm font-heading font-extrabold text-[#F2B949] mb-1">
                What should the gang call you?
              </label>
              <p className="text-xs text-gray-300 mb-2 font-mono">Your name appears on your Adventure Diary.</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John, Sneha, Rahul..."
                autoFocus
                className="w-full bg-[#18130d] border-2 border-black focus:border-[#F2B949] text-white px-4 py-3 rounded-xl font-heading text-base outline-none shadow-retro-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#F2E829] hover:bg-[#F2B949] text-black font-heading font-extrabold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 transition-colors"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <div className="text-xs text-[#F2E829] font-heading font-bold mb-1">
                Hey {name}! 👋
              </div>
              <label className="block text-sm font-heading font-extrabold text-[#F2B949] mb-1">
                Enter your mobile number
              </label>
              <p className="text-xs text-gray-300 mb-2 font-mono">
                We'll send a 6-digit verification code.
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-400 font-mono text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  autoFocus
                  className="w-full bg-[#18130d] border-2 border-black focus:border-[#F2B949] text-white pl-12 pr-4 py-3 rounded-xl font-mono text-base outline-none shadow-retro-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3.5 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-extrabold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send Verification OTP ⚡"}
            </button>
          </form>
        )}

        {/* Step 3: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-heading font-extrabold text-[#F2B949]">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-[#EDD377] hover:underline font-mono"
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-gray-300 mb-2 font-mono">
                Sent to +91 {phone}. (Use test code <b className="text-[#F2E829]">123456</b>).
              </p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full bg-[#18130d] border-2 border-black focus:border-[#EDD377] text-center text-[#F2E829] font-mono text-xl tracking-widest px-4 py-3 rounded-xl outline-none shadow-retro-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 bg-[#EDD377] hover:bg-[#F2B949] text-black font-heading font-extrabold text-sm rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifying..." : "Enter Warangal Arcade 🚀"}
            </button>
          </form>
        )}

        {/* Fast Demo Guest Access */}
        <div className="mt-5 pt-3 border-t-2 border-black text-center">
          <button
            type="button"
            onClick={handleDemoBypass}
            disabled={loading}
            className="text-xs text-[#F2B949] hover:text-[#F2E829] font-heading font-extrabold flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <span>⚡ Instant Guest Access (No SMS needed)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
