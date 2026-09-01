import React from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
import produceTruckCargo from '../assets/images/produce_truck_cargo_1787818869404.jpg';
import {
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { User } from '../types/index.ts';

interface IntroHeroProps {
  currentUser: User | null;
  onExploreMarket?: () => void;
  onOpenLogin?: () => void;
  onOpenSignUp?: () => void;
  onOpenBrand?: () => void;
  onLogoutToGuest?: () => void;
  onOpenCallCenter?: () => void;
}

export const IntroHero: React.FC<IntroHeroProps> = ({
  currentUser,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-emerald-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/30">
      {/* Dynamic ambient lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mt-20"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Grid: Value Proposition + Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Brand & Direct Value */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="shrink-0">
                <img
                  src={agrilinkLogo}
                  alt="AgriLink Emblem"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-xl shadow-emerald-950/60 bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Agricultural Network
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-none mt-1">
                  AGRI<span className="text-emerald-400">LINK</span> ETHIOPIA
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200/80 font-medium mt-1">
                  Direct Farmer-to-Buyer Commerce • Cold-Chain Logistics • Agri-Finance
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Connecting smallholder farmers, commercial buyers, cold-chain transport, and digital escrow payments across Ethiopia for transparent, high-yield agricultural trade.
            </p>

            {/* Live Ecosystem Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
                <p className="text-xl font-black text-emerald-400">Direct Trade</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Fair Farm-Gate Prices</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
                <p className="text-xl font-black text-emerald-400">100% Escrow</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Telebirr & CBE Birr</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
                <p className="text-xl font-black text-emerald-400">Cold Chain</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Fresh Regional Corridors</p>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
                <p className="text-xl font-black text-emerald-400">Input Loans</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Awash Bank Backed</p>
              </div>
            </div>
          </div>

          {/* Right Column: Fresh Produce Transport Logistics Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-950/80 group">
              <img
                src={produceTruckCargo}
                alt="Direct Farm-to-Market Produce Cold-Chain Transport"
                className="w-full h-72 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/30 to-transparent"></div>
              
              {/* Floating Quality Tag */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-md">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  Arsi & Sidama Harvest Corridors
                </span>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" /> Cold Chain Fleet
                  </span>
                  <span className="text-[11px] text-emerald-300 font-medium">Addis Ababa Hub Active</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Fresh Produce Farm-to-Market Dispatch
                </h3>
                <p className="text-xs text-zinc-300 font-normal">
                  Inspected, graded, and delivered straight to processors, supermarkets, and hotels.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
