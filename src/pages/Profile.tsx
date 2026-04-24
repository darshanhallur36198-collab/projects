import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { LogOut, Heart, MapPin, Bell, Shield, Settings, Edit2, Check, X, Camera, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, profile, logOut, signIn, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium italic">Please authenticate with your agent portal to manage your logistics profile.</p>
        <Link 
          to="/login"
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-100"
        >
          Access Portal
        </Link>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditData({
      name: profile?.name || user.displayName || '',
      avatar: profile?.avatar || user.photoURL || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { icon: Heart, label: 'Service Favorites', color: 'text-vibrant-pink', bg: 'bg-vibrant-pink/10' },
    { icon: MapPin, label: 'Delivery Hubs', color: 'text-vibrant-teal', bg: 'bg-vibrant-teal/10' },
    { icon: Bell, label: 'Transit Notifications', color: 'text-vibrant-orange', bg: 'bg-vibrant-orange/10' },
    { icon: Shield, label: 'Security & Auth', color: 'text-vibrant-pink', bg: 'bg-vibrant-pink/10' },
    { icon: Settings, label: 'System Preferences', color: 'text-vibrant-tan', bg: 'bg-vibrant-tan/10' },
  ];

  const currentName = profile?.name || user.displayName;
  const currentAvatar = profile?.avatar || user.photoURL;

  return (
    <div className="py-8 max-w-xl mx-auto">
      <div className="bg-white rounded-[3.5rem] border-2 border-vibrant-tan shadow-2xl overflow-hidden mb-8">
         <div className="p-12 pb-8 flex flex-col items-center text-center relative">
            <button 
              onClick={isEditing ? () => setIsEditing(false) : handleStartEdit}
              className="absolute top-8 right-8 p-3 bg-vibrant-beige text-vibrant-tan rounded-[20px] hover:text-vibrant-orange transition-colors border-2 border-transparent hover:border-vibrant-tan shadow-inner"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
            </button>

            <div className="relative mb-8">
               <div className="absolute -inset-4 bg-gradient-to-tr from-vibrant-orange to-vibrant-yellow rounded-[40px] opacity-20 blur-xl animate-pulse" />
               <img src={isEditing ? editData.avatar : currentAvatar || ''} className="relative w-36 h-36 rounded-[35px] border-4 border-white shadow-2xl object-cover z-10" alt="" />
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-vibrant-orange border-4 border-white rounded-2xl flex items-center justify-center text-white z-20 shadow-xl">
                  <ShieldCheck size={20} />
               </div>
               {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-[35px] flex items-center justify-center text-white backdrop-blur-[4px] z-10 border-4 border-vibrant-orange/50">
                     <Camera size={32} />
                  </div>
               )}
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="editing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full space-y-6"
                >
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange opacity-70 italic text-left block ml-3 uppercase">Grid Operative Alias</label>
                      <input 
                         type="text" 
                         value={editData.name}
                         onChange={(e) => setEditData({...editData, name: e.target.value})}
                         className="input-vibrant !py-4 uppercase"
                         placeholder="Agent Name"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange opacity-70 italic text-left block ml-3 uppercase">Digital Identity Resource (URL)</label>
                      <input 
                         type="text" 
                         value={editData.avatar}
                         onChange={(e) => setEditData({...editData, avatar: e.target.value})}
                         className="input-vibrant !py-4"
                         placeholder="Protocol Avatar URL"
                      />
                   </div>
                   <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-vibrant w-full py-5 text-sm shadow-xl shadow-vibrant-orange/20"
                   >
                      {saving ? 'SYNCHRONIZING LEDGER...' : <><Check size={20} /> FINALIZe Manifest</>}
                   </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="viewing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">{currentName}</h2>
                  <p className="text-vibrant-tan font-black text-xs flex items-center justify-center gap-2 uppercase tracking-widest">
                     <span className="w-2 h-2 bg-vibrant-teal rounded-full animate-pulse" />
                     {user.email}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-3 px-8 py-3 bg-black text-white rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl italic border-2 border-white/5">
                     Authorized Grid Operative
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         <div className="px-8 py-10 border-t-2 border-vibrant-beige grid grid-cols-3 gap-4 bg-vibrant-beige/10">
            <div className="text-center">
               <p className="text-3xl font-black tracking-tighter text-slate-900 font-mono">142</p>
               <p className="text-[9px] uppercase font-black tracking-[0.2em] text-vibrant-tan mt-1">Grid Missions</p>
            </div>
            <div className="text-center border-x-2 border-vibrant-beige">
               <p className="text-3xl font-black tracking-tighter text-vibrant-orange font-mono">4.9</p>
               <p className="text-[9px] uppercase font-black tracking-[0.2em] text-vibrant-tan mt-1">Trust Score</p>
            </div>
            <div className="text-center">
               <p className="text-3xl font-black tracking-tighter text-vibrant-teal font-mono uppercase">Prime</p>
               <p className="text-[9px] uppercase font-black tracking-[0.2em] text-vibrant-tan mt-1">Security Tier</p>
            </div>
         </div>
      </div>

      <div className="space-y-4">
         {menuItems.map((item, index) => (
           <motion.button 
             key={item.label}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: index * 0.05 }}
             className="w-full bg-white p-6 rounded-[30px] border-2 border-vibrant-tan flex items-center gap-5 hover:border-vibrant-orange hover:shadow-xl hover:shadow-vibrant-orange/5 transition-all group active:scale-[0.98]"
           >
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-[20px] flex items-center justify-center shrink-0 shadow-inner border border-current/10`}>
                 <item.icon size={22} />
              </div>
              <span className="font-black text-slate-800 uppercase tracking-tight text-sm">{item.label}</span>
              <ChevronRight size={20} className="ml-auto text-vibrant-tan group-hover:text-vibrant-orange transition-colors" />
           </motion.button>
         ))}

         <button 
           onClick={logOut}
           className="w-full bg-white p-6 rounded-[30px] border-2 border-vibrant-tan flex items-center gap-5 hover:bg-vibrant-pink/5 hover:border-vibrant-pink/30 hover:shadow-xl hover:shadow-vibrant-pink/5 transition-all group text-vibrant-pink"
         >
            <div className="w-12 h-12 bg-vibrant-pink/10 text-vibrant-pink rounded-[20px] flex items-center justify-center shadow-inner border border-vibrant-pink/10">
               <LogOut size={22} />
            </div>
            <span className="font-black uppercase tracking-tight text-sm">Terminate Session</span>
         </button>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
