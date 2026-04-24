import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Building2, MapPin, Search, Package, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getAgencies } from '../services/dataService';
import { LogisticsAgency } from '../types';
import PriceEstimator from '../components/PriceEstimator';
import PriceEstimator from '../components/PriceEstimator';

export default function Home() {
  const [agencies, setAgencies] = useState<LogisticsAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAgencies().then(data => {
      setAgencies(data);
      setLoading(false);
    });
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) navigate(`/order/${trackingId.trim()}`);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium italic">Connecting to logistics network...</div>;

  return (
    <div className="py-8 space-y-16">
      {/* Hero Tracking Section */}
      <section className="relative bg-gradient-to-br from-vibrant-orange to-vibrant-yellow rounded-[3.5rem] p-12 lg:p-20 overflow-hidden shadow-2xl shadow-vibrant-orange/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-2xl">
           <h1 className="text-4xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-[0.85]">Fast Track <br /><span className="text-white/80 underline decoration-white/40 decoration-8 underline-offset-[10px]">Your Cargo</span></h1>
           <p className="text-white/90 text-lg font-medium mb-10 italic max-w-lg">Enter your HAWB or tracking manifest number to view real-time logistics status and micro-transit updates.</p>
           
           <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vibrant-orange" size={20} />
                 <input 
                    type="text" 
                    placeholder="ENTER TRACKING NUMBER (E.G. SD-1234)..."
                    className="w-full pl-16 pr-6 py-5 bg-white border-2 border-vibrant-tan rounded-[25px] text-vibrant-orange font-black text-sm tracking-widest placeholder:text-vibrant-tan focus:outline-none focus:border-white transition-all uppercase"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                 />
              </div>
              <button 
                type="submit"
                className="btn-vibrant py-5 px-10 whitespace-nowrap !bg-black hover:!bg-white hover:!text-black"
              >
                Trace Parcel <ChevronRight size={18} />
              </button>
           </form>
           
           <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-vibrant-beige overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="" />
                   </div>
                 ))}
              </div>
              <p className="text-xs font-bold text-white/80 tracking-tight uppercase"><span className="text-white font-black text-sm">24,000+</span> logistics experts on standby</p>
           </div>
        </div>
        
        {/* Abstract Cargo Icon */}
        <div className="hidden lg:block absolute right-12 bottom-12 opacity-10 pointer-events-none rotate-12">
           <Package size={340} className="text-white" />
        </div>
      </section>

      {/* Category Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         {[
           { icon: '📦', label: 'E-Commerce', bg: '#FFF4E0' },
           { icon: '📄', label: 'Documents', bg: '#E0F4FF' },
           { icon: '🏢', label: 'B2B Freight', bg: '#FFE0E0' },
           { icon: '❄️', label: 'Cold Chain', bg: '#E0FFE8' },
           { icon: '💎', label: 'Fragile', bg: '#F4E0FF' }
         ].map((cat, i) => (
           <div key={i} className="bg-white p-6 rounded-[30px] border-2 border-vibrant-tan flex flex-col items-center gap-3 hover:border-vibrant-yellow transition-all cursor-pointer shadow-sm shadow-vibrant-tan/20">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-inner" style={{ backgroundColor: cat.bg }}>
                 {cat.icon}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">{cat.label}</span>
           </div>
         ))}
      </div>

      {/* Cost Estimator Bridge */}
      <section className="max-w-4xl mx-auto px-4 md:px-0">
        <PriceEstimator />
      </section>

      <div>
        <div className="flex items-center justify-between mb-8">
           <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Partner Network</h2>
              <p className="text-slate-500 font-medium italic">Select from our verified tier-1 logistics agencies.</p>
           </div>
           <button className="text-xs font-black uppercase tracking-widest text-vibrant-orange hover:text-black underline decoration-2 underline-offset-4">Explore Full Manifest</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agencies.map((agency, index) => (
            <motion.div
              key={agency.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/agency/${agency.id}`} className="card-vibrant group block">
                <div className="relative h-64 overflow-hidden bg-vibrant-beige">
                  <img 
                    src={agency.image} 
                    alt={agency.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-5 right-5 bg-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl border border-vibrant-tan">
                    <Star size={14} className="text-vibrant-yellow fill-vibrant-yellow" />
                    <span className="text-xs font-black text-slate-900">{agency.rating}</span>
                  </div>
                  <div className="absolute top-5 left-5 bg-vibrant-teal text-white px-3 py-1.5 rounded-xl shadow-xl font-black text-[10px] uppercase tracking-widest">
                    ACTIVE HUB
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-vibrant-orange transition-colors uppercase tracking-tight leading-none">{agency.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {agency.specialties.map(spec => (
                      <span key={spec} className="px-3 py-1 bg-vibrant-beige text-[9px] font-black text-vibrant-orange rounded-lg border border-vibrant-tan uppercase tracking-widest leading-none">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-vibrant-tan flex items-center justify-between text-slate-400">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grid Presence</p>
                       <span className="flex items-center gap-1 text-xs font-black text-slate-900 uppercase tracking-tighter"><Building2 size={16} className="text-vibrant-orange" /> {agency.hubsCount} Global Hubs</span>
                    </div>
                    <div className="text-right">
                       <div className="w-10 h-10 bg-vibrant-beige rounded-xl flex items-center justify-center text-vibrant-orange group-hover:bg-vibrant-orange group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={20} />
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
