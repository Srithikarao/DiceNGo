import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm text-black">
      <div className="bg-[#EDD377] w-full max-w-sm rounded-2xl border-4 border-black shadow-retro-xl p-6 relative text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#F2E829] text-black hover:opacity-75 p-1.5 rounded-full border-2 border-black"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🥭</span>
          <div>
            <h2 className="font-pixel text-xs text-black font-black">DICE & GO WARANGAL</h2>
            <p className="text-xs text-black/80 font-mono font-bold">Join the Warangal Adventure Gang</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-[#F27430] border-2 border-black text-black font-bold text-xs p-2.5 rounded-lg shadow-retro-sm">
            {error}
          </div>
        )}

        {/* Step 1: Name */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-black text-black mb-1">
                What should the gang call you?
              </label>
              <p className="text-xs text-black/80 mb-2 font-mono font-medium">Your name appears on your Adventure Diary.</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John, Sneha, Rahul..."
                autoFocus
                className="w-full bg-[#F2E829] border-2 border-black focus:border-[#F27430] text-black px-4 py-3 rounded-xl font-heading text-base outline-none shadow-retro-sm placeholder:text-black/50"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-sm rounded-xl retro-btn flex items-center justify-center gap-2 transition-colors"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Phone Number */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <div className="text-xs text-black font-heading font-black mb-1">
                Hey {name}! 👋
              </div>
              <label className="block text-sm font-heading font-black text-black mb-1">
                Enter your mobile number
              </label>
              <p className="text-xs text-black/80 mb-2 font-mono font-medium">
                We'll send a 6-digit verification code.
              </p>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-black font-mono font-bold text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  autoFocus
                  className="w-full bg-[#F2E829] border-2 border-black focus:border-[#F27430] text-black pl-12 pr-4 py-3 rounded-xl font-mono text-base outline-none shadow-retro-sm placeholder:text-black/50"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3.5 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-sm rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
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
                <label className="block text-sm font-heading font-black text-black">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-black hover:underline font-mono font-bold"
                >
                  Change
                </button>
              </div>
              <p className="text-xs text-black/80 mb-2 font-mono font-medium">
                Sent to +91 {phone}. (Use test code <b className="text-black font-black bg-[#F2E829] px-1 rounded border border-black">123456</b>).
              </p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full bg-[#F2E829] border-2 border-black focus:border-[#F27430] text-center text-black font-mono text-xl font-black tracking-widest px-4 py-3 rounded-xl outline-none shadow-retro-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 bg-[#F27430] hover:bg-[#F2B949] text-black font-heading font-black text-sm rounded-xl retro-btn flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
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
            className="text-xs text-black hover:text-[#F27430] font-heading font-black flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <span>⚡ Instant Guest Access (No SMS needed)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
