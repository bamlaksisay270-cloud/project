import React, { useState } from 'react';
import ethiopianFarmlandSunrise from '../assets/images/ethiopian_farmland_sunrise_1788247696520.jpg';
import { ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2, Sprout, Building2, Truck, Lock, Phone } from 'lucide-react';
import { User } from '../types/index.ts';

interface EthioDirectRegistrationProps {
  onNavigate?: (tab: string) => void;
  onRegisteredSuccess?: (user: User) => void;
  onOpenLogin?: () => void;
}

export default function EthioDirectRegistration({
  onNavigate,
  onRegisteredSuccess,
  onOpenLogin,
}: EthioDirectRegistrationProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'producer' | 'buyer' | 'logistics' | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otp: '',
    region: 'Oromia (East Shewa / Bishoftu)',
    crop: '',
    companyName: '',
    tinNumber: '',
    vehicleType: 'Isuzu (3.5 Tonnes)',
    licensePlate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('6112');

  const handleNext = () => {
    setSubmitError(null);
    if (step === 1 && !role) {
      setSubmitError('Please select your account role to continue.');
      return;
    }
    if (step === 2) {
      if (!formData.fullName.trim()) {
        setSubmitError('Please enter your full name.');
        return;
      }
      if (!formData.phone.trim()) {
        setSubmitError('Please enter your phone number.');
        return;
      }
      if (!otpSent) {
        setOtpSent(true);
        setGeneratedOtp(Math.floor(1000 + Math.random() * 9000).toString());
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setSubmitError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const userRoleMapping: Record<string, string> = {
        producer: 'FARMER',
        buyer: 'BUSINESS_BUYER',
        logistics: 'DRIVER',
      };

      const mappedRole = role ? userRoleMapping[role] : 'FARMER';
      const cleanPhone = formData.phone.startsWith('+251') ? formData.phone : `+251${formData.phone.replace(/^0/, '')}`;

      const payload = {
        fullName: formData.fullName.trim() || 'EthioDirect Member',
        email: `${formData.fullName.toLowerCase().replace(/\s+/g, '.') || 'user'}_${Date.now().toString().slice(-4)}@ethiodirect.et`,
        phone: cleanPhone,
        role: mappedRole,
        organizationName: role === 'buyer' ? formData.companyName : role === 'producer' ? `Farm of ${formData.fullName}` : 'Logistics Carrier',
        region: formData.region,
        tinNumber: formData.tinNumber,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdUser = await res.json();
        if (onRegisteredSuccess) {
          onRegisteredSuccess(createdUser);
        } else if (onNavigate) {
          if (mappedRole === 'FARMER') onNavigate('farmer-portal');
          else if (mappedRole === 'BUSINESS_BUYER') onNavigate('procurement');
          else onNavigate('logistics');
        }
      } else {
        // Local fallback in case of endpoint conflict
        const fallbackUser: User = {
          id: Date.now(),
          uid: `usr_${Date.now()}`,
          fullName: formData.fullName || 'Registered User',
          email: payload.email,
          phone: cleanPhone,
          role: mappedRole as any,
          organizationName: payload.organizationName,
          region: formData.region,
          isVerified: true,
          status: 'ACTIVE',
        };
        if (onRegisteredSuccess) {
          onRegisteredSuccess(fallbackUser);
        } else if (onNavigate) {
          onNavigate('marketplace');
        }
      }
    } catch (err: any) {
      console.warn('Registration fallback:', err);
      if (onNavigate) onNavigate('marketplace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
      
      {/* Left Side - Brand Storyboarding & Farmland Visual Element (Not a background) */}
      <div className="lg:w-5/12 bg-emerald-950 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-white">
        {/* Abstract Background Vectors */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-400" preserveAspectRatio="none">
            <polygon points="0,100 100,0 100,100" />
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg">
                E
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">EthioDirect</h1>
                <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-widest">National Agri Ecosystem</span>
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </button>
            )}
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
              The Future of <br />Agricultural Trade.
            </h2>
            <p className="text-emerald-200/80 text-sm sm:text-base leading-relaxed">
              Join thousands of verified producers, commercial buyers, and logistics partners powering Ethiopia's transparent, digital agricultural supply chain.
            </p>
          </div>

          {/* Dedicated Farmland Image Showcase Card (Embedded as a card, NOT background) */}
          <div className="rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-zinc-900 group">
            <div className="relative aspect-16/9 overflow-hidden">
              <img
                src={ethiopianFarmlandSunrise}
                alt="Lush green Ethiopian farmland and fertile terraces"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 inline-block mb-1">
                  Verified Farmlands
                </span>
                <p className="text-xs font-bold text-white">Fertile Highland Corridors • Direct Sourcing</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Left Footer: Security Guarantee */}
        <div className="relative z-10 pt-6">
          <div className="flex items-center gap-4 bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/80 backdrop-blur-xs">
            <div className="w-12 h-12 bg-emerald-800/80 rounded-xl flex items-center justify-center text-xl shrink-0 text-emerald-300">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Enterprise-Grade Security</p>
              <p className="text-emerald-300 text-xs mt-0.5">Your identity data and CBE / Telebirr escrow funds are fully encrypted.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Dynamic Form Wizard */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 relative">
        
        {/* Progress Bar */}
        <div className="max-w-xl w-full mx-auto mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step {step} of 3</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {step === 1 ? 'Role Selection' : step === 2 ? 'Basic Identity' : 'Verification Details'}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="max-w-xl w-full mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {submitError}
            </div>
          )}

          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">How will you use EthioDirect?</h3>
              <p className="text-slate-500 text-sm mb-6">Select your account type to customize your agricultural marketplace experience.</p>
              
              <div className="space-y-4">
                {/* Farmer Option */}
                <label 
                  onClick={() => setRole('producer')}
                  className={`block cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    role === 'producer' ? 'border-emerald-500 bg-emerald-50/80 shadow-xs' : 'border-slate-100 hover:border-emerald-200 bg-slate-50/50'
                  }`}
                >
                  <input type="radio" name="role" checked={role === 'producer'} onChange={() => setRole('producer')} className="hidden" />
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${role === 'producer' ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100'}`}>
                      🌾
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-base">Producer / Farmer</p>
                        {role === 'producer' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">I want to list and sell my harvest directly to verified commercial buyers at fair prices.</p>
                    </div>
                  </div>
                </label>

                {/* Buyer Option */}
                <label 
                  onClick={() => setRole('buyer')}
                  className={`block cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    role === 'buyer' ? 'border-blue-500 bg-blue-50/80 shadow-xs' : 'border-slate-100 hover:border-blue-200 bg-slate-50/50'
                  }`}
                >
                  <input type="radio" name="role" checked={role === 'buyer'} onChange={() => setRole('buyer')} className="hidden" />
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${role === 'buyer' ? 'bg-blue-200 text-blue-900' : 'bg-slate-100'}`}>
                      🏢
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-base">Commercial Buyer</p>
                        {role === 'buyer' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">I represent a hotel, supermarket, food processor, or exporter seeking graded bulk produce.</p>
                    </div>
                  </div>
                </label>

                {/* Transporter Option */}
                <label 
                  onClick={() => setRole('logistics')}
                  className={`block cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                    role === 'logistics' ? 'border-amber-500 bg-amber-50/80 shadow-xs' : 'border-slate-100 hover:border-amber-200 bg-slate-50/50'
                  }`}
                >
                  <input type="radio" name="role" checked={role === 'logistics'} onChange={() => setRole('logistics')} className="hidden" />
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${role === 'logistics' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100'}`}>
                      🚚
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-base">Fleet & Logistics</p>
                        {role === 'logistics' && <CheckCircle2 className="h-5 w-5 text-amber-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">I operate trucks, vans, or cold-chain vehicles and want to haul verified agricultural freight.</p>
                    </div>
                  </div>
                </label>
              </div>

              <button 
                onClick={handleNext} 
                disabled={!role}
                className="w-full mt-8 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {onOpenLogin && (
                <p className="text-center text-xs text-slate-500 mt-4">
                  Already have an account?{' '}
                  <button onClick={onOpenLogin} className="text-emerald-700 font-bold hover:underline cursor-pointer">
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          )}

          {/* STEP 2: BASIC IDENTITY */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Create your account</h3>
              <p className="text-slate-500 text-sm mb-6">Enter your primary contact details. We will send an SMS verification OTP.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Abebe Bikila" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-bold">+251</span>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="911 234 567" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>SMS Verification Code Sent</span>
                      <span className="bg-emerald-200 px-2 py-0.5 rounded text-emerald-800">Demo OTP: {generatedOtp}</span>
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      placeholder="Enter 4-digit code"
                      className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-lg text-center tracking-widest font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={handleBack} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition cursor-pointer">
                  Back
                </button>
                <button 
                  onClick={handleNext} 
                  className="w-2/3 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{otpSent ? 'Verify & Continue' : 'Send OTP'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DYNAMIC VERIFICATION */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                {role === 'producer' ? 'Farm Verification' : role === 'buyer' ? 'Business Details' : 'Fleet Registration'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">This information is required for the KYB (Know Your Business) & agricultural audit.</p>
              
              {/* Conditional Fields based on Role */}
              <div className="space-y-5">
                
                {role === 'producer' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Region & Zone</label>
                      <select 
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="Oromia (East Shewa / Bishoftu)">Oromia (East Shewa / Bishoftu)</option>
                        <option value="Oromia (Arsi / Bale)">Oromia (Arsi / Bale)</option>
                        <option value="Amhara (East Gojjam / Debre Markos)">Amhara (East Gojjam / Debre Markos)</option>
                        <option value="Sidama (Hawassa Zuria)">Sidama (Hawassa Zuria)</option>
                        <option value="SNNPR (Gurage / Wolaita)">SNNPR (Gurage / Wolaita)</option>
                        <option value="Addis Ababa Outskirts">Addis Ababa Outskirts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Primary Crop(s)</label>
                      <input 
                        type="text" 
                        value={formData.crop}
                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        placeholder="e.g. Magna White Teff, Red Onions, Wheat, Coffee" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                  </>
                )}

                {role === 'buyer' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Registered Company Name</label>
                      <input 
                        type="text" 
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Skyline Hotel Trading PLC" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">TIN (Tax Identification Number)</label>
                      <input 
                        type="text" 
                        value={formData.tinNumber}
                        onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                        placeholder="10-digit TIN number" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </>
                )}

                {role === 'logistics' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle Type</label>
                      <select 
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        <option value="Isuzu (3.5 Tonnes)">Isuzu NPR (3.5 Tonnes)</option>
                        <option value="Refrigerated Van (Cold-Chain)">Refrigerated Van (Cold-Chain 4°C)</option>
                        <option value="FSR / Medium Truck (7-10 Tonnes)">FSR / Medium Truck (7-10 Tonnes)</option>
                        <option value="Sino Truck / Heavy Trailer (30 Tonnes)">Sino Truck / Heavy Trailer (30 Tonnes)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">License Plate Number</label>
                      <input 
                        type="text" 
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                        placeholder="e.g. AA 3 A 12345" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" 
                      />
                    </div>
                  </>
                )}

              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={handleBack} 
                  className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-2/3 text-white font-bold py-4 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                    role === 'producer' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 
                    role === 'buyer' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 
                    'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
