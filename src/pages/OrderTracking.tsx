import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shipment, ShipmentStatus } from '../types';
import { ShipmentApiService } from '../services/shipmentApiService';
import { CheckCircle2, Clock, Truck, Package, MapPin, ChevronRight, User, Navigation, Building2, Map, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const STATUS_CONFIG: Record<ShipmentStatus, { icon: any, label: string, desc: string, color: string, step: number }> = {
  'booked': { icon: Clock, label: 'Manifest Created', desc: 'Secure booking authorized', color: 'text-vibrant-teal', step: 1 },
  'picked_up': { icon: Package, label: 'Grid Entry', desc: 'Item synchronized into logistics grid', color: 'text-vibrant-teal', step: 2 },
  'at_hub': { icon: Building2, label: 'sorting Protocol', desc: 'Regional terminal processing active', color: 'text-vibrant-yellow', step: 3 },
  'in_transit': { icon: Truck, label: 'Macro Transit', desc: 'Moving between strategic logistics nodes', color: 'text-vibrant-orange', step: 4 },
  'out_for_delivery': { icon: Navigation, label: 'Final mile', desc: 'Tactical delivery in terminal vicinity', color: 'text-vibrant-teal', step: 5 },
  'delivered': { icon: CheckCircle2, label: 'Grid Exit', desc: 'Consignee confirmed and pod secured', color: 'text-vibrant-teal', step: 6 },
  'exception': { icon: Package, label: 'Grid Alert', desc: 'Logistics exception detected in chain', color: 'text-vibrant-pink', step: 0 },
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.panTo(center, {
      animate: true,
      duration: 3,
      easeLinearity: 0.25
    });
  }, [center, map]);
  return null;
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const prevStatusRef = React.useRef<ShipmentStatus | null>(null);

  // Check for success state from checkout
  useEffect(() => {
    const state = location.state as { newBooking?: boolean, trackingNumber?: string } | null;
    if (state?.newBooking && state?.trackingNumber) {
      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <span className="font-black text-[10px] uppercase tracking-widest text-blue-600">Shipment Confirmed</span>
            <span className="text-xs font-medium">Manifest created with HAWB: <span className="font-black uppercase tracking-tight text-slate-900">{state.trackingNumber}</span></span>
          </div>
        ),
        { duration: 5000, id: 'success-booking' }
      );
      // Clear state after showing toast
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'shipments', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Shipment;
        
        // Notify on status change
        if (prevStatusRef.current && prevStatusRef.current !== data.status) {
          const config = STATUS_CONFIG[data.status];
          toast(
            (t) => (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
                  <config.icon size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-0.5">Status Update</p>
                  <p className="text-xs font-black uppercase text-slate-900 mb-1">{config.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium italic">{config.desc}</p>
                </div>
              </div>
            ),
            { 
              duration: 6000,
              style: { borderRadius: '1.5rem', background: '#fff', border: '1px solid #f1f5f9', padding: '1rem', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }
            }
          );
        }
        
        prevStatusRef.current = data.status;
        setShipment({ id: snapshot.id, ...data });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [id]);

  // Mock transit movement for logistics demo - Optimized for real-time smoothness
  useEffect(() => {
    if (shipment?.status === 'out_for_delivery' && id) {
      if (!shipment.driverLocation) {
        updateDoc(doc(db, 'shipments', id), {
            driverLocation: { lat: 15.3647, lng: 75.1240 }
        });
        return;
      }

      const interval = setInterval(() => {
          updateDoc(doc(db, 'shipments', id), {
              'driverLocation.lat': shipment.driverLocation!.lat + (Math.random() * 0.0002),
              'driverLocation.lng': shipment.driverLocation!.lng + (Math.random() * 0.0002),
          });
      }, 3000); // 3s interval matching animation duration for seamless flow
      
      return () => clearInterval(interval);
    }
  }, [shipment?.status, id, shipment?.driverLocation?.lat, shipment?.driverLocation?.lng]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-black italic">Verifying transit manifest...</div>;
  if (!shipment) return <div className="p-8 text-center text-red-500 font-black underline">Shipment Not Found in Ledger.</div>;

  const currentStatus = STATUS_CONFIG[shipment.status];
  const Icon = currentStatus.icon;

  const vehiclePos: [number, number] = shipment.driverLocation 
    ? [shipment.driverLocation.lat, shipment.driverLocation.lng] 
    : [15.3647, 75.1240];

  const getEstimatedDelivery = () => {
    if (shipment.status === 'delivered') return { label: 'Delivered', sub: 'Successfully' };
    if (shipment.status === 'exception') return { label: 'Delayed', sub: 'Action Required' };
    
    const bookingDate = shipment.createdAt?.seconds 
      ? new Date(shipment.createdAt.seconds * 1000) 
      : new Date();
    
    let daysToAdd = 0;
    let timeLabel = "By 8:00 PM";

    switch (shipment.status) {
      case 'out_for_delivery':
        daysToAdd = 0;
        timeLabel = "Within 4 Hours";
        break;
      case 'in_transit':
        daysToAdd = 1;
        break;
      case 'at_hub':
        daysToAdd = 1;
        break;
      case 'picked_up':
        daysToAdd = 2;
        break;
      case 'booked':
      default:
        daysToAdd = 3;
        break;
    }

    const estDate = new Date(bookingDate);
    estDate.setDate(estDate.getDate() + daysToAdd);
    
    const isToday = new Date().toDateString() === estDate.toDateString();
    const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === estDate.toDateString();

    let dateLabel = estDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (isToday) dateLabel = "Today";
    if (isTomorrow) dateLabel = "Tomorrow";

    return { label: dateLabel, sub: timeLabel };
  };

  const estimation = getEstimatedDelivery();

  const simulateStatusChange = async (newStatus: ShipmentStatus) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await ShipmentApiService.updateStatus(id, newStatus, 
        newStatus === 'exception' ? 'Tactical terminal redirection: Address non-verified.' : undefined
      );
      toast.success(`Grid Update: ${newStatus.toUpperCase()} protocol active.`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">
      {/* Simulator - Only shown for testing push notifications */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] border-2 border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
           <div className="p-2 bg-slate-800 rounded-lg"><Navigation size={16} className="text-vibrant-orange" /></div>
           <p className="text-[10px] font-black uppercase tracking-widest leading-none">Simulation Overrides <span className="text-white/40 italic ml-2">(Development Only)</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
           {(['picked_up', 'out_for_delivery', 'delivered', 'exception'] as const).map(s => (
             <button
               key={s}
               disabled={isUpdating}
               onClick={() => simulateStatusChange(s)}
               className={`px-4 py-2 bg-slate-800 hover:bg-vibrant-orange hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-700 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {isUpdating ? 'SYNC...' : `Set ${s.replace('_', ' ')}`}
             </button>
           ))}
        </div>
      </div>

      {/* Shipment HUD */}
      <div className="bg-gradient-to-br from-vibrant-orange to-vibrant-yellow text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-2 border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                 <Icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 italic">Tracking manifest</p>
                <h2 className="text-xl font-black tracking-tight">{shipment.trackingNumber}</h2>
              </div>
           </div>
           <h1 className="text-4xl lg:text-5xl font-black mb-2 uppercase tracking-tighter leading-none">{currentStatus.label}</h1>
           <p className="text-white/90 font-medium italic mb-2">{currentStatus.desc}</p>
        </div>
        <div className="bg-white p-6 rounded-[35px] border-2 border-white/10 text-center min-w-[200px] shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange mb-2 italic underline decoration-vibrant-orange/30">Target delivery</p>
           <p className="text-2xl font-black uppercase text-slate-900 leading-none">{estimation.label}</p>
           <p className="text-[10px] font-black text-vibrant-orange mt-2 uppercase tracking-widest leading-none bg-vibrant-beige px-3 py-1 rounded-full border border-vibrant-tan inline-block">{estimation.sub}</p>
        </div>
      </div>

      {/* Exception Section */}
      {shipment.status === 'exception' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-vibrant-pink/5 border-2 border-vibrant-pink rounded-[3.5rem] p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 text-vibrant-pink">
             <AlertTriangle size={140} />
          </div>
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-vibrant-pink rounded-2xl flex items-center justify-center text-white shadow-xl shadow-vibrant-pink/20 border-2 border-white/20">
                   <AlertTriangle size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-vibrant-pink leading-none mb-1">Grid Alert manifest</p>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Security Exception Detected</h3>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="space-y-4">
                   <div className="bg-white p-7 rounded-[30px] border-2 border-vibrant-tan shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-pink mb-2 italic">Diagnosis</p>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed italic">
                         {shipment.exceptionDetails?.reason || "Consignee address non-verified at tactical terminal. Last-mile carrier reporting restricted access zone."}
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-vibrant-pink text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20">
                         TX-ID: {shipment.exceptionDetails?.code || "GRID-ERR-403"}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange flex items-center gap-2 underline decoration-vibrant-tan underline-offset-4">
                      <HelpCircle size={14} /> Recovery Protocol
                   </p>
                   <ul className="space-y-4">
                      {(shipment.exceptionDetails?.resolutionSteps || [
                         "Authorize alternate terminal drop-off.",
                         "Re-verify Consignee identification manifest.",
                         "Connect with Grid Control: 1800-VIBRANT-SUPP"
                      ]).map((step, i) => (
                        <li key={i} className="flex gap-4 text-xs font-bold text-slate-600 leading-tight">
                           <span className="flex-shrink-0 w-6 h-6 bg-vibrant-pink text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-vibrant-pink/20 italic">{i + 1}</span>
                           <span className="flex items-center">{step}</span>
                        </li>
                      ))}
                   </ul>
                   <button className="btn-vibrant !bg-black hover:!bg-vibrant-pink w-full">
                      Start Re-Route Sequence
                   </button>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Map Section */}
      <AnimatePresence>
        {shipment.status === 'out_for_delivery' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full relative rounded-[3.5rem] overflow-hidden shadow-2xl border-2 border-vibrant-tan z-0 h-[400px]"
          >
            <MapContainer 
              center={vehiclePos} 
              zoom={15} 
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={vehiclePos}>
                <Popup>
                  <div className="p-3 bg-white rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-tight text-vibrant-orange mb-1">Transit Carrier</p>
                    <p className="text-xs font-black text-slate-900 italic">Vibrant Express Logistic Unit</p>
                  </div>
                </Popup>
              </Marker>
              <MapUpdater center={vehiclePos} />
            </MapContainer>
            <div className="absolute top-8 left-8 z-[1000] space-y-3">
               <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border-2 border-vibrant-tan flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-vibrant-orange rounded-full animate-pulse shadow-lg shadow-vibrant-orange/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none">Global Grid Live Feed</span>
               </div>
            </div>
            <div className="absolute bottom-8 left-8 z-[1000] bg-black text-white p-6 rounded-[30px] shadow-2xl border border-white/10 flex gap-5 items-center">
                <div className="w-12 h-12 bg-vibrant-orange rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-vibrant-orange/20 border-2 border-white/20">
                   <Navigation size={22} className="text-white fill-white" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-vibrant-tan uppercase tracking-widest mb-1 italic opacity-60">Assigned Grid Agent</p>
                   <p className="text-sm font-black uppercase tracking-tight leading-none text-white">Agent 4892 • Terminal West</p>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-12">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border-2 border-vibrant-tan">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-vibrant-orange mb-12 flex items-center gap-3 underline decoration-vibrant-tan underline-offset-8">
                  <Map size={16} /> Grid Milestones
               </h3>
               
               <div className="relative pl-12 space-y-12">
                  <div className="absolute left-[23px] top-2 bottom-2 w-1 bg-vibrant-beige rounded-full" />
                  
                  {[
                    { status: 'booked', time: '10:00 AM', loc: 'Origin Booking Hub' },
                    { status: 'picked_up', time: '02:30 PM', loc: 'Collection Tactical Unit' },
                    { status: 'at_hub', time: '06:15 PM', loc: 'Regional Distribution Node' },
                    { status: 'in_transit', time: '09:00 PM', loc: 'Macro Transit Gateway' },
                    { status: 'out_for_delivery', time: 'SYNC', loc: 'Last-Mile Edge Center' }
                  ].map((step, i) => {
                    const isPassed = STATUS_CONFIG[shipment.status].step >= STATUS_CONFIG[step.status as ShipmentStatus].step;
                    const isCurrent = shipment.status === step.status;
                    
                    return (
                      <div key={i} className={`relative flex items-center gap-8 transition-opacity ${!isPassed ? 'opacity-30' : 'opacity-100'}`}>
                         <div className={`absolute -left-[14px] w-7 h-7 rounded-full border-4 border-white shadow-xl z-10 transition-all ${isPassed ? 'bg-vibrant-orange scale-110' : 'bg-vibrant-tan'}`} />
                         {isCurrent && <div className="absolute -left-[14px] w-7 h-7 bg-vibrant-orange rounded-full animate-ping opacity-30 shadow-lg shadow-vibrant-orange/50" />}
                         
                         <div className="min-w-[90px]">
                            <p className="text-[10px] font-black text-vibrant-tan uppercase italic leading-none font-mono">{step.time}</p>
                         </div>
                         <div className="flex-1">
                            <p className={`font-black text-sm uppercase tracking-tight leading-none mb-1 ${isCurrent ? 'text-vibrant-orange' : 'text-slate-900'}`}>{STATUS_CONFIG[step.status as ShipmentStatus].label}</p>
                            <p className="text-[10px] text-slate-500 font-bold italic leading-none">{step.loc}</p>
                         </div>
                         {isCurrent && (
                           <div className="bg-vibrant-orange/10 px-4 py-1.5 rounded-full border border-vibrant-orange/20">
                              <span className="text-[9px] font-black text-vibrant-orange uppercase tracking-widest italic">In Progress</span>
                           </div>
                         )}
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>
         
         <div className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[35px] border-2 border-vibrant-tan shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-vibrant-teal/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-teal mb-8 flex items-center gap-3">
                     <User size={16} /> CONSIGNEE MANIFEST
                  </h4>
                  <div className="space-y-4">
                     <div>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-2">{shipment.receiver.name}</p>
                        <p className="text-xs text-slate-500 font-bold italic leading-tight mb-4">{shipment.receiver.address}</p>
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-vibrant-beige rounded-2xl border border-vibrant-tan shadow-inner">
                           <span className="text-[9px] font-black text-vibrant-teal uppercase tracking-widest">COMMS:</span>
                           <span className="text-xs font-black text-slate-900 tracking-tighter">{shipment.receiver.phone}</span>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white p-10 rounded-[35px] border-2 border-vibrant-tan shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-vibrant-orange/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-orange mb-8 flex items-center gap-3">
                     <Package size={16} /> CARGO MANIFEST
                  </h4>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-slate-400 uppercase tracking-widest italic text-[10px]">Parcel protocol</span>
                        <span className="text-slate-900 uppercase tracking-tight font-mono">{shipment.parcelType}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-slate-400 uppercase tracking-widest italic text-[10px]">Net Payload</span>
                        <span className="text-slate-900 font-mono">{shipment.weight} KG</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-black">
                        <span className="text-slate-400 uppercase tracking-widest italic text-[10px]">Declared Value</span>
                        <span className="text-vibrant-teal uppercase italic font-mono decoration-vibrant-teal/20 underline">SECURED</span>
                     </div>
                  </div>
                  <div className="mt-8 pt-8 border-t-2 border-vibrant-tan border-dashed">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Billable Total</span>
                        <span className="text-3xl font-black text-vibrant-orange tracking-tighter font-mono leading-none">₹{shipment.totalCost.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between pt-10 border-t-2 border-vibrant-tan">
         <Link to="/orders" className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-tan hover:text-vibrant-orange transition-colors flex items-center gap-2 italic">
            <ChevronRight size={14} className="rotate-180" /> EXIT TO LEDGER
         </Link>
         <button className="btn-vibrant !bg-black hover:!bg-white hover:!text-black px-10">
            DOWNLOAD WAYBILL
         </button>
      </div>
    </div>
  );
}
