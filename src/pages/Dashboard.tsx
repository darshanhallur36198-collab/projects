import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { Shipment } from '../types';
import { Package, Truck, Clock, CheckCircle2, TrendingUp, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'shipments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setShipments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const activeShipments = shipments.filter(s => ['booked', 'picked_up', 'at_hub', 'in_transit', 'out_for_delivery'].includes(s.status));
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;

  if (!user) return <div className="p-8 text-center text-slate-500 font-black italic">Protocol requires authentication for dashboard access.</div>;
  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Synchronizing agent dashboard...</div>;

  return (
    <div className="py-8 space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-vibrant-orange to-vibrant-yellow text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
         <div className="z-10">
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Welcome Back, {profile?.name || user.displayName}</h1>
            <p className="text-white/80 font-medium italic">Transit Intelligence: <span className="text-white font-black uppercase tracking-widest">{activeShipments.length} parcels currently moving</span></p>
         </div>
         <div className="flex items-center gap-4 z-10">
            <div className="text-center px-8 border-r border-white/20">
               <p className="text-4xl font-black tracking-tighter">{shipments.length}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Manifests</p>
            </div>
            <div className="text-center px-8">
               <p className="text-4xl font-black tracking-tighter text-white">{deliveredCount}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Delivered Success</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black uppercase tracking-tight">Active Shipments</h3>
               <Link to="/orders" className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange underline decoration-2 underline-offset-4">Browse Ledger</Link>
            </div>
            
            <div className="space-y-4">
               {activeShipments.length === 0 ? (
                 <div className="bg-white p-12 rounded-[3rem] border-2 border-vibrant-tan text-center">
                    <Package size={32} className="text-vibrant-tan mx-auto mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase italic">Your active manifest is currently blank.</p>
                 </div>
               ) : (
                 activeShipments.slice(0, 3).map((shipment, i) => (
                    <motion.div 
                      key={shipment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="card-vibrant p-6 flex items-center justify-between group"
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-vibrant-beige rounded-2xl flex items-center justify-center text-vibrant-orange shadow-sm border border-vibrant-tan">
                             <Truck size={24} />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 group-hover:text-vibrant-orange transition-colors uppercase tracking-tight">{shipment.agencyName}</h4>
                             <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase italic">HAWB: {shipment.trackingNumber}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-vibrant-orange text-white text-[9px] font-black uppercase tracking-widest rounded-md mb-2 shadow-lg shadow-vibrant-orange/20">
                             {shipment.status.replace('_', ' ')}
                          </span>
                          <Link to={`/order/${shipment.id}`} className="block text-[10px] font-black text-vibrant-orange uppercase tracking-widest italic group-hover:underline">Trace Live →</Link>
                       </div>
                    </motion.div>
                 ))
               )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border-2 border-vibrant-tan space-y-6">
               <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck size={20} className="text-vibrant-orange" /> Logistics Score
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-500 italic">User Reliability</span>
                     <span className="text-xs font-black text-slate-900 uppercase">98% Efficient</span>
                  </div>
                  <div className="w-full h-2 bg-vibrant-beige rounded-full overflow-hidden border border-vibrant-tan">
                     <div className="h-full bg-vibrant-orange w-[98%]" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">* Derived from 0 late pickups and high booking consistency.</p>
               </div>
            </div>

            <div className="bg-vibrant-orange p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-vibrant-orange/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
               <h3 className="text-lg font-black uppercase tracking-tight z-10 relative">SwiftDrop Prime</h3>
               <p className="text-xs font-medium text-orange-100 italic z-10 relative">Access terminal prioritization and flat 5% rewards on all regional manifests.</p>
               <button className="w-full py-3 bg-white text-vibrant-orange rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl z-10 relative">
                  Activate Prime Manifest
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
