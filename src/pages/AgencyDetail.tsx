import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Building2, Package, ShieldCheck, ChevronRight } from 'lucide-react';
import { getAgencyById, getAgencyServices } from '../services/dataService';
import { LogisticsAgency, ShipmentService } from '../types';
import { useCart } from '../components/CartContext';
import { motion } from 'motion/react';

export default function AgencyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<LogisticsAgency | null>(null);
  const [services, setServices] = useState<ShipmentService[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    Promise.all([getAgencyById(id), getAgencyServices(id)]).then(([data, serviceData]) => {
      setAgency(data);
      setServices(serviceData);
      setLoading(false);
    });
  }, [id]);

  const handleBooking = (service: ShipmentService) => {
    if (!agency) return;
    addToCart({ 
      id: service.id, 
      name: service.name, 
      price: service.basePrice, 
      image: '', 
      restaurantId: agency.id, 
      description: service.description, 
      category: 'service' 
    });
    navigate('/cart');
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading agency services...</div>;
  if (!agency) return <div className="p-8 text-center text-red-500 font-bold underline">Agency not found.</div>;

  return (
    <div className="py-4 lg:py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-vibrant-orange mb-8 font-black transition-colors uppercase tracking-widest text-[10px]">
        <ArrowLeft size={16} />
        Back to Manifests
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="relative h-72 rounded-[3rem] overflow-hidden mb-10 shadow-2xl border-2 border-vibrant-tan">
            <img src={agency.image} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-vibrant-orange rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-vibrant-orange/20 border border-white/20">Verified Tier-1 Partner</span>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Star size={14} className="text-vibrant-yellow fill-vibrant-yellow" />
                    <span className="text-xs font-black">{agency.rating}</span>
                 </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-2 uppercase tracking-tight leading-none">{agency.name}</h1>
              <p className="flex items-center gap-2 text-sm font-medium opacity-80 italic">
                <Building2 size={16} className="text-vibrant-orange" /> Headquarters: {agency.headquarters}
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
             <Package className="text-vibrant-orange" /> Available Grid Services
          </h2>
          <div className="grid gap-4">
            {services.map((service) => (
              <motion.div 
                key={service.id}
                whileHover={{ x: 10 }}
                className="card-vibrant p-6 flex items-center justify-between group border-2"
              >
                <div className="flex-1 pr-6">
                  <h4 className="font-black text-slate-900 mb-1 uppercase tracking-tight group-hover:text-vibrant-orange transition-colors text-lg leading-none">{service.name}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-3 italic">{service.description}</p>
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1 bg-vibrant-beige text-vibrant-orange text-[9px] font-black uppercase tracking-widest rounded-lg border border-vibrant-tan">
                        {service.weightCategory}
                     </span>
                     <span className="text-xl font-black text-slate-900 leading-none">₹{service.basePrice} <span className="text-[10px] font-bold text-vibrant-orange uppercase tracking-widest underline decoration-vibrant-orange/30 leading-none">Base Rate</span></span>
                  </div>
                </div>
                <button 
                  onClick={() => handleBooking(service)}
                  className="btn-vibrant whitespace-nowrap shadow-vibrant-orange/10"
                >
                  Book Unit
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-white p-8 rounded-[3rem] border-2 border-vibrant-tan sticky top-24 shadow-2xl">
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight underline decoration-vibrant-orange decoration-8 underline-offset-8">Agency Policy</h3>
              <div className="space-y-6">
                 {[
                   { icon: ShieldCheck, title: "Transit Insurance", desc: "Up to ₹50,000 coverage", color: "text-vibrant-teal" },
                   { icon: Building2, title: "Hub Storage", desc: "48 hours free storage", color: "text-vibrant-orange" },
                   { icon: Package, title: "Special Handling", desc: "Fragile item care", color: "text-vibrant-pink" }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 bg-vibrant-beige rounded-2xl flex items-center justify-center shrink-0 border border-vibrant-tan">
                         <item.icon size={20} className={item.color} />
                      </div>
                      <div className="flex flex-col justify-center">
                         <p className="font-black text-sm tracking-tight uppercase leading-none mb-1">{item.title}</p>
                         <p className="text-[10px] text-slate-400 font-bold italic leading-none">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-12 p-6 bg-vibrant-orange rounded-3xl border border-white/20 shadow-xl shadow-vibrant-orange/20 text-white">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 leading-none italic">Total active networks</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{agency.hubsCount}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Global Hub Units</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
