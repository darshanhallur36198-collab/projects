import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Truck, User as UserIcon, Package, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';

import { cn } from '../lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { items } = useCart();
  const { user, signIn } = useAuth();
  const { permission, requestPermission } = useNotifications();

  // Auto request for demo purposes when user is logged in and permission is default
  React.useEffect(() => {
    if (user && permission === 'default') {
      requestPermission();
    }
  }, [user, permission]);
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'Explore', path: '/' },
    { icon: Truck, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Booking', path: '/cart', badge: totalItems },
    { icon: UserIcon, label: 'Account', path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-vibrant-beige pb-24 lg:pb-0 lg:pl-[100px]">
      <Toaster position="top-right" />
      {/* Sidebar for Desktop */}
      <aside className="fixed top-0 left-0 bottom-0 w-[100px] bg-white border-r-2 border-vibrant-tan z-50 hidden lg:flex flex-col items-center py-10 gap-10">
         <Link to="/" className="w-12 h-12 bg-vibrant-orange rounded-[18px] flex items-center justify-center shadow-lg shadow-vibrant-orange/30">
            <div className="w-6 h-3 bg-white rounded-sm translate-x-1" />
         </Link>

         <nav className="flex flex-col gap-8">
            {navItems.slice(0, 4).map((item) => {
               const isActive = location.pathname === item.path;
               const Icon = item.icon;
               return (
                 <Link 
                   key={item.path}
                   to={item.path}
                   className={cn(
                     "w-[50px] h-[50px] rounded-[18px] flex items-center justify-center transition-all duration-300 relative",
                     isActive ? "bg-vibrant-orange text-white shadow-lg shadow-vibrant-orange/30" : "bg-[#FFF0E8] text-vibrant-orange hover:bg-vibrant-orange hover:text-white"
                   )}
                 >
                    <Icon size={20} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-vibrant-yellow text-slate-900 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {item.badge}
                      </span>
                    )}
                 </Link>
               );
            })}
         </nav>
      </aside>

      {/* Header for Desktop */}
      <header className="fixed top-0 left-[100px] right-0 z-40 hidden bg-white/90 border-b-2 border-vibrant-tan backdrop-blur-md lg:block">
        <div className="max-w-7xl mx-auto px-10 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-vibrant-orange" size={20} />
            <span className="text-sm font-black uppercase tracking-tight">Park Avenue Logistics Terminal</span>
          </div>

          <div className="flex-1 max-w-md mx-10">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={18} />
                <input 
                  type="text" 
                  placeholder="Scan Tracking Manifest..."
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-vibrant-tan rounded-[20px] text-xs font-bold focus:outline-none focus:border-vibrant-orange transition-all"
                />
             </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-vibrant-orange">Authorized Agent</p>
                  <p className="text-xs font-black uppercase tracking-tight">{user.displayName}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-vibrant-tan bg-vibrant-beige flex items-center justify-center overflow-hidden">
                   {user.photoURL ? <img src={user.photoURL} alt="" /> : <UserIcon size={20} className="text-vibrant-orange" />}
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-8 py-3 bg-vibrant-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-xl shadow-vibrant-orange/20"
              >
                Access Portal
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-10 lg:pt-[100px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-vibrant-tan px-6 py-4 lg:hidden">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 relative",
                  isActive ? "text-vibrant-orange" : "text-slate-300"
                )}
              >
                <div className={cn(
                   "w-12 h-12 rounded-[18px] flex items-center justify-center transition-all",
                   isActive ? "bg-vibrant-orange text-white shadow-lg shadow-vibrant-orange/10" : ""
                )}>
                   <Icon size={24} />
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-0 bg-vibrant-yellow text-slate-900 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
