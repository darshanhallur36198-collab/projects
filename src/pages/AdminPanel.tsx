import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shipment, LogisticsAgency } from '../types';
import { Package, Truck, Building2, User, TrendingUp, AlertTriangle, CheckCircle2, Navigation, Trash2, Plus, Users, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  createdAt: any;
}

export default function AdminPanel() {
  const [totalShipments, setTotalShipments] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);
  const [activeShipments, setActiveShipments] = useState<Shipment[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchAgencies = async () => {
      const snapshot = await getDocs(collection(db, 'agencies'));
      setTotalAgencies(snapshot.size);
    };

    // Orders Listener
    const ordersQuery = query(collection(db, 'shipments'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setTotalShipments(snapshot.size);
      setActiveShipments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)));
    });

    // Admins Listener
    const adminsQuery = query(collection(db, 'admins'));
    const unsubscribeAdmins = onSnapshot(adminsQuery, (snapshot) => {
      setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser)));
      setLoading(false);
    });

    fetchAgencies();
    return () => {
      unsubscribeOrders();
      unsubscribeAdmins();
    };
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminId || !newAdminEmail) {
      toast.error('Please provide both UID and Email');
      return;
    }

    setIsAdding(true);
    try {
      await setDoc(doc(db, 'admins', newAdminId), {
        email: newAdminEmail,
        createdAt: serverTimestamp()
      });
      setNewAdminEmail('');
      setNewAdminId('');
      toast.success('Admin authorization granted');
    } catch (error) {
      toast.error('Failed to grant authorization');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!window.confirm('Revoke administrative access for this agent?')) return;

    try {
      await deleteDoc(doc(db, 'admins', id));
      toast.success('Authorization revoked');
    } catch (error) {
      toast.error('Failed to revoke access');
    }
  };

  const stats = [
    { label: 'Total Volume', value: totalShipments, icon: Package, color: 'text-vibrant-teal', bg: 'bg-vibrant-teal/10' },
    { label: 'Active Agencies', value: totalAgencies, icon: Building2, color: 'text-vibrant-teal', bg: 'bg-vibrant-teal/10' },
    { label: 'In Transit', value: activeShipments.filter(s => s.status === 'in_transit').length, icon: Truck, color: 'text-vibrant-orange', bg: 'bg-vibrant-orange/10' },
    { label: 'Authorized Agents', value: admins.length, icon: ShieldCheck, color: 'text-vibrant-pink', bg: 'bg-vibrant-pink/10' },
  ];

  if (loading) return <div className="p-8 text-center text-vibrant-tan font-black italic">Synchronizing Control Center manifest...</div>;

  return (
    <div className="py-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black uppercase tracking-tight underline decoration-vibrant-orange decoration-8 underline-offset-8">Grid Command Center</h1>
            <p className="text-vibrant-tan font-black italic mt-4 text-[10px] uppercase tracking-widest leading-none">Global tactical monitoring & root administrative terminal.</p>
         </div>
         <div className="flex items-center gap-4 bg-black text-white px-8 py-4 rounded-[25px] shadow-2xl border border-white/10">
            <div className="w-3 h-3 bg-vibrant-teal rounded-full animate-pulse shadow-lg shadow-vibrant-teal/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Network Live Link</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {stats.map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="card-vibrant p-10 border-2"
           >
              <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-current/10 shadow-inner`}>
                 <stat.icon size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-tan mb-2 italic">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter font-mono">{stat.value}</p>
           </motion.div>
         ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border-2 border-vibrant-tan shadow-sm overflow-hidden">
         <div className="p-10 border-b-2 border-vibrant-beige flex items-center justify-between bg-vibrant-beige/10">
            <h3 className="font-black uppercase tracking-tight flex items-center gap-3 italic">
               <Navigation size={20} className="text-vibrant-orange" /> Global Transit stream
            </h3>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-vibrant-tan bg-white px-4 py-1.5 rounded-full border border-vibrant-tan">Protocol: GRID_v2</span>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-vibrant-beige/30 text-[9px] font-black uppercase tracking-[0.2em] text-vibrant-tan">
                     <th className="px-10 py-5">HAWB IDENTIFIER</th>
                     <th className="px-10 py-5">GRID STATUS</th>
                     <th className="px-10 py-5">TACTICAL AGENCY</th>
                     <th className="px-10 py-5">TRANSIT ROUTE</th>
                     <th className="px-10 py-5">LEDGER TOTAL</th>
                     <th className="px-10 py-5">HUD</th>
                  </tr>
               </thead>
               <tbody className="divide-y-2 divide-vibrant-beige">
                  {activeShipments.slice(0, 10).map(shipment => (
                    <tr key={shipment.id} className="hover:bg-vibrant-beige/20 transition-colors group">
                       <td className="px-10 py-6 font-black text-xs text-slate-900 tracking-tight">{shipment.trackingNumber}</td>
                       <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic border-2 border-current/10 ${
                             shipment.status === 'delivered' ? 'bg-vibrant-teal/10 text-vibrant-teal' :
                             shipment.status === 'exception' ? 'bg-vibrant-pink/10 text-vibrant-pink' :
                             shipment.status === 'in_transit' ? 'bg-vibrant-orange/10 text-vibrant-orange' :
                             'bg-vibrant-tan/10 text-vibrant-tan'
                          }`}>
                             {shipment.status.replace('_', ' ')}
                          </span>
                       </td>
                       <td className="px-10 py-6 font-black text-[10px] text-vibrant-tan uppercase italic tracking-tight">{shipment.agencyName}</td>
                       <td className="px-10 py-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest max-w-xs truncate">
                          {shipment.sender.address} <span className="text-vibrant-orange mx-2">→</span> {shipment.receiver.address}
                       </td>
                       <td className="px-10 py-6 font-black text-xs text-slate-900 font-mono">₹{shipment.totalCost.toFixed(2)}</td>
                       <td className="px-10 py-6">
                          <Link to={`/order/${shipment.id}`} className="w-10 h-10 flex items-center justify-center text-vibrant-tan shadow-inner hover:text-vibrant-orange hover:bg-white border-2 border-transparent hover:border-vibrant-tan rounded-xl transition-all">
                             <Navigation size={18} />
                          </Link>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white rounded-[3.5rem] border-2 border-vibrant-tan shadow-sm overflow-hidden flex flex-col">
            <div className="p-10 border-b-2 border-vibrant-beige bg-vibrant-beige/10">
               <h3 className="font-black uppercase tracking-tight flex items-center gap-3">
                  <Users size={20} className="text-vibrant-pink" /> Authorized Agents
               </h3>
               <p className="text-[9px] text-vibrant-tan font-black uppercase tracking-widest mt-2 block">System credentials manifest</p>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[450px]">
               <div className="divide-y-2 divide-vibrant-beige">
                  {admins.map((admin, i) => (
                    <motion.div 
                      key={admin.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 flex items-center justify-between hover:bg-vibrant-beige/10 transition-colors group"
                    >
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg border-2 border-white/10">
                             <ShieldCheck size={20} />
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{admin.email}</p>
                             <p className="text-[9px] font-black text-vibrant-tan uppercase tracking-[0.2em] italic">{admin.id}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleRemoveAdmin(admin.id)}
                         className="w-10 h-10 flex items-center justify-center text-vibrant-tan hover:text-vibrant-pink hover:bg-vibrant-pink/5 rounded-xl transition-all"
                       >
                          <Trash2 size={18} />
                       </button>
                    </motion.div>
                  ))}
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3.5rem] border-2 border-vibrant-tan shadow-sm p-12 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-orange/5 rounded-full blur-3xl" />
            <div className="mb-10 relative z-10">
               <h3 className="text-2xl font-black uppercase tracking-tight mb-3 italic underline decoration-vibrant-orange decoration-4 underline-offset-4">Elevate Authorization</h3>
               <p className="text-vibrant-tan text-[10px] font-black uppercase tracking-widest leading-relaxed">Grant root administrative status to valid grid agents by synchronizing system identity keys.</p>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-6 relative z-10">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-vibrant-orange opacity-70 ml-2 italic">Agent Security Key (UID)</label>
                  <input 
                    type="text"
                    value={newAdminId}
                    onChange={(e) => setNewAdminId(e.target.value)}
                    className="input-vibrant !py-5 uppercase tracking-tight"
                    placeholder="UID MANIFEST..."
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-vibrant-orange opacity-70 ml-2 italic">Verified comms channel (EMAIL)</label>
                  <input 
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="input-vibrant !py-5 italic"
                    placeholder="AGENT@VIBRANT.GRID"
                  />
               </div>
               <button 
                 type="submit"
                 disabled={isAdding}
                 className="btn-vibrant w-full py-5 text-xs shadow-xl shadow-vibrant-orange/20 mt-4"
               >
                  {isAdding ? 'SYNCHRONIZING Clearance...' : <><Plus size={18} /> Authorize system Agent</>}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
}
