import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { useAuth } from '../components/AuthContext';
import { ShoppingBag, ArrowRight, Trash2, MapPin, Package, Truck, ShieldCheck, Calendar } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAgencyById } from '../services/dataService';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, total, updateQuantity, clearCart } = useCart();
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState(1.0);
  const [dimensions, setDimensions] = useState({ length: 10, width: 10, height: 10 });
  const [distance, setDistance] = useState(15.5); // Default distance in KM
  const [parcelType, setParcelType] = useState('Small Parcel');
  const [pickupLocation, setPickupLocation] = useState('Hubballi Central Terminal');
  const [dropLocation, setDropLocation] = useState('Dharwad Logistics Park');
  
  const [preferredDate, setPreferredDate] = useState(() => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('Morning');
  const [deliverySlot, setDeliverySlot] = useState('Morning');

  // Dynamic Cost Calculations
  const basePrice = total;
  const weightSurcharge = Math.max(0, (weight - 2.0) * 85); 
  const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000;
  const volumeSurcharge = Math.max(0, (volume - 5) * 15);
  const distanceSurcharge = distance * 12; // ₹12 per KM
  const fragileSurcharge = parcelType === 'Fragile' ? 250 : 0; // Fixed handling fee for fragile
  
  const subtotal = basePrice + weightSurcharge + volumeSurcharge + distanceSurcharge + fragileSurcharge;
  const discount = subtotal > 1500 ? subtotal * 0.05 : 0; 
  const insuranceFee = (subtotal - discount) * 0.015; 
  const tax = (subtotal - discount + insuranceFee) * 0.18; 
  const finalTotal = subtotal - discount + insuranceFee + tax;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to book a shipment');
      navigate('/login');
      return;
    }

    // Validation Logic
    if (!weight || weight <= 0) {
      toast.error('Please enter a valid payload weight (must be greater than 0)');
      return;
    }

    if (weight > 1000) {
      toast.error('Maximum payload weight exceeded (limit: 1000 KG)');
      return;
    }

    if (!dimensions.length || dimensions.length <= 0) {
      toast.error('Please enter a valid package length');
      return;
    }

    if (!dimensions.width || dimensions.width <= 0) {
      toast.error('Please enter a valid package width');
      return;
    }

    if (!dimensions.height || dimensions.height <= 0) {
      toast.error('Please enter a valid package height');
      return;
    }

    if (!preferredDate) {
      toast.error('Please select a preferred manifest slot');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(preferredDate);
    if (selectedDate < today) {
      toast.error('Preferred date cannot be in the past');
      return;
    }

    setLoading(true);
    try {
      const agency = await getAgencyById(items[0].restaurantId);
      
      const shipmentData = {
        userId: user.uid,
        agencyId: items[0].restaurantId,
        agencyName: agency?.name || 'Unknown Agency',
        trackingNumber: `SD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        parcelType: parcelType,
        weight: Number(weight),
        dimensions: dimensions,
        distance: distance,
        pickupLocation: pickupLocation,
        dropLocation: dropLocation,
        preferredDeliveryDate: preferredDate,
        deliverySlot: deliverySlot,
        sender: { name: user.displayName || 'Sender', address: pickupLocation, phone: '9876543210' },
        receiver: { name: 'Recipient', address: dropLocation, phone: '9012345678' },
        status: 'booked',
        totalCost: finalTotal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'shipments'), shipmentData);
      clearCart();
      navigate(`/order/${docRef.id}`, { 
        state: { 
          newBooking: true, 
          trackingNumber: shipmentData.trackingNumber 
        } 
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to book shipment');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Package size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">No services selected</h2>
        <p className="text-slate-500 mb-8 max-w-xs font-medium italic">Please select a shipment service to proceed with booking.</p>
        <Link to="/" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all">
          Browse Agencies
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-tight underline decoration-vibrant-orange decoration-8 underline-offset-[12px]">Booking Manifest</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-vibrant p-8 space-y-8 border-2">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight">Services Selected</h3>
                <button onClick={clearCart} className="text-vibrant-tan hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
             </div>
             <div className="space-y-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-vibrant-beige rounded-2xl flex items-center justify-center text-vibrant-orange shrink-0 border border-vibrant-tan shadow-sm">
                       <Package size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm uppercase tracking-tight leading-none mb-1">{item.name}</h4>
                      <p className="text-xs text-slate-500 font-medium italic mb-3 leading-none">{item.description}</p>
                      <div className="flex items-center justify-between border-t border-vibrant-tan pt-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Quantity: {item.quantity} Unit</span>
                         <span className="text-sm font-black text-slate-900 tracking-tight leading-none font-mono">₹{(item.basePrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="card-vibrant p-8 border-2">
             <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                <MapPin className="text-vibrant-orange" size={20} /> Pickup & Delivery Routing
             </h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 bg-vibrant-beige rounded-[25px] border-2 border-vibrant-tan">
                   <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg">
                      <MapPin size={22} />
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-[10px] uppercase tracking-widest text-vibrant-orange opacity-60 leading-none mb-1 italic">Pickup Point manifest</p>
                      <input 
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:outline-none focus:ring-0 uppercase tracking-tight"
                        placeholder="ENTER PICKUP HUB OR ADDRESS..."
                      />
                   </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-vibrant-beige rounded-[25px] border-2 border-vibrant-orange/20 shadow-inner">
                   <div className="w-12 h-12 bg-vibrant-orange rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-vibrant-orange/20">
                      <ArrowRight size={22} />
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-[10px] uppercase tracking-widest text-vibrant-orange opacity-60 leading-none mb-1 italic">Destination manifest</p>
                      <input 
                        type="text"
                        value={dropLocation}
                        onChange={(e) => setDropLocation(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:outline-none focus:ring-0 uppercase tracking-tight"
                        placeholder="ENTER DESTINATION HUB..."
                      />
                   </div>
                </div>

                <div className="bg-black p-8 rounded-[35px] border border-white/10 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-orange/10 blur-3xl group-hover:bg-vibrant-orange/20 transition-all -translate-y-1/2 translate-x-1/2" />
                   <div className="relative z-10 flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-orange italic leading-none">Net Transit Distance</p>
                         <p className="text-xs font-medium text-slate-400 italic leading-none">Distance-weighted pricing applied (₹12/KM)</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <input 
                              type="number"
                              value={distance}
                              onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                              className="w-28 bg-white/5 border-2 border-white/10 rounded-2xl px-4 py-3 text-2xl font-black text-white text-center focus:outline-none focus:border-vibrant-orange transition-all font-mono"
                            />
                            <div className="absolute -top-3 -right-3 bg-vibrant-teal text-[8px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg border border-white/20">VERIFIED</div>
                         </div>
                         <span className="text-xs font-black text-vibrant-tan uppercase tracking-widest">KM</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="card-vibrant p-8 border-2">
             <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                <Truck className="text-vibrant-orange" size={20} /> Manifest Specifications
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange opacity-60 italic ml-1">Payload Weight (KG)</label>
                   <div className="relative">
                      <input 
                         type="number" 
                         step="0.1"
                         min="0.1"
                         value={weight}
                         onChange={(e) => setWeight(parseFloat(e.target.value))}
                         className="input-vibrant !py-5"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-vibrant-tan uppercase font-mono">KG</span>
                   </div>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest ml-1">* Threshold applies above 2.0 KG.</p>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange opacity-60 italic ml-1">Item Category</label>
                   <div className="relative">
                      <select 
                        value={parcelType}
                        onChange={(e) => setParcelType(e.target.value)}
                        className="input-vibrant appearance-none pr-12 !py-5 shadow-inner"
                      >
                         <option value="Document">📄 Document</option>
                         <option value="Small Parcel">📦 Small Parcel</option>
                         <option value="Large Parcel">🚛 Large Parcel</option>
                         <option value="Fragile">💎 Fragile Handling</option>
                      </select>
                      <ShieldCheck size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-vibrant-teal pointer-events-none" />
                   </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange opacity-60 italic ml-1 leading-none mb-1">Package Dimensions (cm³)</label>
                   <div className="grid grid-cols-3 gap-6">
                      <div className="relative">
                         <input 
                            type="number" 
                            value={dimensions.length}
                            onChange={(e) => setDimensions({...dimensions, length: parseInt(e.target.value) || 0})}
                            className="input-vibrant !py-4 text-center"
                            placeholder="L"
                         />
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-vibrant-tan uppercase">Length</span>
                      </div>
                      <div className="relative">
                         <input 
                            type="number" 
                            value={dimensions.width}
                            onChange={(e) => setDimensions({...dimensions, width: parseInt(e.target.value) || 0})}
                            className="input-vibrant !py-4 text-center"
                            placeholder="W"
                         />
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-vibrant-tan uppercase">Width</span>
                      </div>
                      <div className="relative">
                         <input 
                            type="number" 
                            value={dimensions.height}
                            onChange={(e) => setDimensions({...dimensions, height: parseInt(e.target.value) || 0})}
                            className="input-vibrant !py-4 text-center"
                            placeholder="H"
                         />
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-vibrant-tan uppercase">Height</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange opacity-60 italic ml-1">Preferred Slot</label>
                   <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                         <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="input-vibrant !py-5 uppercase font-mono shadow-inner"
                         />
                         <Calendar size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-vibrant-orange" />
                      </div>
                      
                      <div className="flex gap-2 flex-1">
                         {['Morning', 'Afternoon', 'Evening'].map((slot) => (
                            <button
                               key={slot}
                               type="button"
                               onClick={() => setDeliverySlot(slot)}
                               className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                                  deliverySlot === slot 
                                  ? 'bg-vibrant-orange text-white border-vibrant-orange shadow-lg shadow-vibrant-orange/20' 
                                  : 'bg-white text-slate-400 border-vibrant-tan hover:border-vibrant-orange/50'
                               }`}
                            >
                               {slot}
                            </button>
                         ))}
                      </div>
                   </div>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest ml-1">* Variable by region capacity. Logistics grid will prioritize selected window.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-vibrant-tan sticky top-24 shadow-2xl">
             <h3 className="text-xl font-black mb-8 uppercase tracking-tight underline decoration-vibrant-orange decoration-4 underline-offset-8">Cost Breakdown</h3>
             <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-xs font-bold font-mono">
                   <span className="text-slate-500 uppercase tracking-widest">Base Manifest</span>
                   <span className="font-black text-slate-900 leading-none">₹{basePrice.toFixed(2)}</span>
                </div>
                
                {weightSurcharge > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-slate-500 uppercase tracking-widest">Weight Delta</span>
                    <span className="font-black text-red-500 leading-none">+₹{weightSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {volumeSurcharge > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-slate-500 uppercase tracking-widest">Volumetric Delta</span>
                    <span className="font-black text-red-500 leading-none">+₹{volumeSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {fragileSurcharge > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-slate-500 uppercase tracking-widest">Fragile Protocol</span>
                    <span className="font-black text-vibrant-pink leading-none">+₹{fragileSurcharge.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-bold font-mono pt-3 border-t border-vibrant-tan">
                   <span className="text-slate-500 uppercase tracking-widest">Transit Range({distance}km)</span>
                   <span className="font-black text-slate-900 leading-none">₹{distanceSurcharge.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span className="text-vibrant-teal uppercase tracking-widest">Grid Loyalty</span>
                    <span className="font-black text-vibrant-teal leading-none">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-bold font-mono">
                   <span className="text-slate-500 uppercase tracking-widest">Insurance (1.5%)</span>
                   <span className="font-black text-slate-900 leading-none">₹{insuranceFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs font-bold font-mono">
                   <span className="text-slate-500 uppercase tracking-widest">Gov. Levy (GST 18%)</span>
                   <span className="font-black text-slate-900 leading-none">₹{tax.toFixed(2)}</span>
                </div>

                <div className="pt-8 mt-4 border-t-4 border-black border-double flex justify-between items-center text-3xl font-black uppercase tracking-tight">
                   <span>Final</span>
                   <span className="text-vibrant-orange font-mono">₹{finalTotal.toFixed(2)}</span>
                </div>
             </div>
             <button 
                onClick={handleCheckout}
                disabled={loading}
                className="btn-vibrant w-full py-5 text-sm shadow-xl shadow-vibrant-orange/20"
             >
                {loading ? 'SYNCHRONIZING...' : 'AUTHORIZE MANIFEST'}
                {!loading && <ArrowRight size={20} />}
             </button>
             <p className="mt-6 text-[9px] text-slate-400 font-black uppercase text-center tracking-[0.2em] leading-relaxed">By authorizing, you agree to the regional transit protocols and terminal handling rules.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
