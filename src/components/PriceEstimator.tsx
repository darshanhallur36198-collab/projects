import React, { useState } from 'react';
import { Calculator, ArrowRight, Package, MapPin, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShipmentApiService, PricingEstimate } from '../services/shipmentApiService';
import toast from 'react-hot-toast';

export default function PriceEstimator() {
  const [weight, setWeight] = useState(5);
  const [distance, setDistance] = useState(100);
  const [serviceType, setServiceType] = useState('standard');
  const [estimate, setEstimate] = useState<PricingEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateEstimate = async () => {
    setLoading(true);
    try {
      const data = await ShipmentApiService.getEstimate(weight, distance, serviceType);
      setEstimate(data);
      toast.success('Logistics Estimate Synchronized');
    } catch (e: any) {
      toast.error('Calculation Grid Sync Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] border-2 border-vibrant-tan p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-orange/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-vibrant-orange rounded-2xl flex items-center justify-center shadow-lg shadow-vibrant-orange/20">
          <Calculator className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight leading-none">Cost Prototype</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-vibrant-tan italic mt-1">Estimate tactical logistics spend</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-vibrant-orange ml-4">Payload (KG)</label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={16} />
            <input 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(Number(e.target.value))}
              className="input-vibrant !pl-12 !py-3 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-vibrant-orange ml-4">Transit Gap (KM)</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={16} />
            <input 
              type="number" 
              value={distance} 
              onChange={(e) => setDistance(Number(e.target.value))}
              className="input-vibrant !pl-12 !py-3 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-vibrant-orange ml-4">Protocol Level</label>
          <div className="relative">
            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={16} />
            <select 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              className="input-vibrant !pl-12 !py-3 text-sm appearance-none"
            >
              <option value="standard">Standard Grid</option>
              <option value="express">High Velocity</option>
              <option value="cargo">Heavy Cargo</option>
            </select>
          </div>
        </div>
      </div>

      <button 
        onClick={calculateEstimate}
        disabled={loading}
        className="btn-vibrant w-full py-4 text-xs shadow-lg shadow-vibrant-orange/20"
      >
        {loading ? 'CALCULATING...' : 'EXECUTE PREDICTION'}
        {!loading && <ArrowRight size={18} />}
      </button>

      <AnimatePresence>
        {estimate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 pt-8 border-t-2 border-vibrant-beige"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-vibrant-beige p-6 rounded-[25px] border border-vibrant-tan">
                <p className="text-[9px] font-black uppercase tracking-widest text-vibrant-tan mb-1">Estimated Cost</p>
                <p className="text-3xl font-black text-slate-900">${estimate.totalCost}</p>
                <p className="text-[9px] font-medium italic text-vibrant-orange mt-1">Rates synced via Grid-V3 API</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-[25px] text-white">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Arrival Window</p>
                <p className="text-3xl font-black">{estimate.estimatedETA} Hours</p>
                <p className="text-[9px] font-medium italic text-vibrant-teal mt-1">Dynamic Traffic Sync: ON</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
