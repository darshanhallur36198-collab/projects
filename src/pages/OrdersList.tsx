import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { Shipment, ShipmentStatus } from '../types';
import { Package, ChevronRight, Clock, Search, Filter, Calendar, X, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const STATUS_FILTERS: { label: string, value: ShipmentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Booked', value: 'booked' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
];

function HighlightedText({ text, highlight }: { text: string | undefined, highlight: string }) {
  if (!text) return null;
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function OrdersList() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const term = searchTerm.toLowerCase();
      const agencyMatch = !searchTerm || shipment.agencyName?.toLowerCase().includes(term);
      const trackingMatch = !searchTerm || shipment.trackingNumber?.toLowerCase().includes(term);
      
      let dateSearchMatch = false;
      if (shipment.createdAt?.seconds) {
        const dateStr = new Date(shipment.createdAt.seconds * 1000).toLocaleDateString().toLowerCase();
        dateSearchMatch = dateStr.includes(term);
      }
      const searchMatch = agencyMatch || trackingMatch || dateSearchMatch;

      const statusMatch = statusFilter === 'all' || shipment.status === statusFilter;

      let rangeMatch = true;
      if (shipment.createdAt?.seconds) {
        const orderDate = new Date(shipment.createdAt.seconds * 1000);
        orderDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) rangeMatch = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (orderDate > end) rangeMatch = false;
        }
      }

      return searchMatch && statusMatch && rangeMatch;
    });
  }, [shipments, searchTerm, statusFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    startDate !== '',
    endDate !== ''
  ].filter(Boolean).length;

  if (!user) return <div className="p-8 text-center text-slate-500 font-bold italic underline">Auth required to access logistics history.</div>;
  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Scanning shipments...</div>;

  return (
    <div className="py-8">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight uppercase underline decoration-vibrant-orange decoration-8 underline-offset-[12px]">Shipment Ledger</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 shadow-lg",
              showFilters || activeFiltersCount > 0 
                ? "bg-vibrant-orange border-vibrant-orange text-white shadow-vibrant-orange/20" 
                : "bg-white border-vibrant-tan text-slate-600 hover:border-vibrant-orange/50"
            )}
          >
            <Filter size={14} />
            Manifest Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white text-vibrant-orange w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-orange" size={18} />
            <input 
              type="text" 
              placeholder="Scan Tracking Manifest #, Agency or HAWB Date..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-vibrant-tan rounded-2xl text-sm font-bold focus:outline-none focus:border-vibrant-orange transition-all shadow-sm shadow-vibrant-tan/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-white border-2 border-vibrant-tan text-slate-900 rounded-[2rem] p-8 space-y-8 shadow-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-vibrant-orange uppercase tracking-[0.2em] mb-4 block">Manifest Status</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FILTERS.map(filter => (
                        <button
                          key={filter.value}
                          onClick={() => setStatusFilter(filter.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                            statusFilter === filter.value 
                              ? "bg-vibrant-orange border-vibrant-orange text-white" 
                              : "bg-vibrant-beige border-vibrant-tan text-slate-500 hover:border-vibrant-orange/20"
                          )}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-vibrant-orange uppercase tracking-[0.2em] mb-4 block">Booking Window</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-vibrant-orange" size={14} />
                        <input 
                          type="date" 
                          className="w-full pl-10 pr-3 py-3 bg-vibrant-beige border-2 border-vibrant-tan rounded-xl text-xs font-bold focus:outline-none focus:border-vibrant-orange"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <span className="text-vibrant-tan font-black">/</span>
                      <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-vibrant-orange" size={14} />
                        <input 
                          type="date" 
                          className="w-full pl-10 pr-3 py-3 bg-vibrant-beige border-2 border-vibrant-tan rounded-xl text-xs font-bold focus:outline-none focus:border-vibrant-orange"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-vibrant-tan flex items-center justify-between">
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-black text-slate-400 hover:text-vibrant-orange flex items-center gap-2 uppercase tracking-widest transition-colors"
                  >
                    <X size={14} />
                    Reset Manifest Views
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="px-8 py-3 bg-vibrant-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-vibrant-orange/10"
                  >
                    Apply Grid Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {filteredShipments.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-vibrant-tan text-center shadow-sm">
           <div className="w-24 h-24 bg-vibrant-beige rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-vibrant-tan" />
           </div>
           <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Manifest Empty</h3>
           <p className="text-slate-400 mb-8 max-w-xs mx-auto font-medium italic">
              We could not identify any bookings in the current logistics grid matching your parameters.
           </p>
           {(searchTerm || statusFilter !== 'all' || startDate || endDate) ? (
             <button onClick={clearFilters} className="font-black text-xs text-vibrant-orange uppercase tracking-widest underline decoration-2 underline-offset-4">Reset Grid Manifest</button>
           ) : (
             <Link to="/" className="inline-block px-10 py-4 bg-vibrant-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-vibrant-orange/10">
               New Booking Manifest
             </Link>
           )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredShipments.map((shipment, index) => (
            <motion.div
              key={shipment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link 
                to={`/order/${shipment.id}`} 
                className="group bg-white p-8 rounded-[2.5rem] border-2 border-vibrant-tan flex items-center justify-between hover:border-vibrant-orange hover:shadow-2xl hover:shadow-vibrant-orange/[0.05] transition-all"
              >
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-lg transition-colors shadow-sm border-2",
                    shipment.status === 'delivered' ? 'bg-green-50 border-green-100 text-green-500' : 
                    shipment.status === 'exception' ? 'bg-red-50 border-red-100 text-red-500' :
                    'bg-vibrant-beige border-vibrant-tan text-vibrant-orange'
                  )}>
                     {shipment.status === 'delivered' ? '✓' : shipment.status === 'exception' ? '!' : <Package size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-black text-slate-900 group-hover:text-vibrant-orange transition-colors uppercase tracking-tight text-lg leading-none">
                        <HighlightedText text={shipment.agencyName} highlight={searchTerm} />
                      </h4>
                      <span className="px-3 py-1 bg-vibrant-orange text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg shadow-vibrant-orange/10">
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-5 text-slate-400">
                       <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest leading-none">
                         <Hash size={12} className="text-vibrant-orange" /> 
                         <HighlightedText text={shipment.trackingNumber} highlight={searchTerm} />
                       </span>
                       <span className="w-1.5 h-1.5 bg-vibrant-tan rounded-full" />
                       <span className="flex items-center gap-1.5 text-[10px] font-bold italic leading-none">
                         <Clock size={12} className="text-vibrant-orange" /> 
                         <HighlightedText 
                            text={new Date(shipment.createdAt?.seconds * 1000).toLocaleDateString()} 
                            highlight={searchTerm} 
                         />
                       </span>
                       <span className="w-1.5 h-1.5 bg-vibrant-tan rounded-full" />
                       <span className="text-[10px] font-black text-slate-900 leading-none">₹{shipment.totalCost.toFixed(2)}</span>
                       {shipment.deliverySlot && (
                         <>
                           <span className="w-1.5 h-1.5 bg-vibrant-tan rounded-full" />
                           <span className="px-2 py-0.5 bg-vibrant-beige text-vibrant-orange rounded-md text-[8px] font-bold uppercase tracking-widest">{shipment.deliverySlot}</span>
                         </>
                       )}
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl border-2 border-vibrant-tan flex items-center justify-center text-vibrant-tan group-hover:text-vibrant-orange group-hover:border-vibrant-orange transition-all shadow-sm">
                  <ChevronRight size={24} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
