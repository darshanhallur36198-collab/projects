import { collection, getDocs, query, where, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LogisticsAgency, ShipmentService } from '../types';

const SEED_AGENCIES: Partial<LogisticsAgency>[] = [
  {
    name: "VRL Logistics",
    rating: 4.8,
    specialties: ["Large Cargo", "Express Parcel"],
    hubsCount: 150,
    image: "https://images.unsplash.com/photo-1586528116311-ad86d525907a?w=800&q=80",
    headquarters: "Hubballi, India"
  },
  {
    name: "SRS Travel & Logistics",
    rating: 4.6,
    specialties: ["Small Parcel", "Bus Cargo"],
    hubsCount: 80,
    image: "https://images.unsplash.com/photo-1519003722824-192d992a7de3?w=800&q=80",
    headquarters: "Bengaluru, India"
  },
  {
    name: "Speedy Parcel",
    rating: 4.7,
    specialties: ["Next Day Delivery", "Documents"],
    hubsCount: 45,
    image: "https://images.unsplash.com/photo-1594833074313-5778a876779a?w=800&q=80",
    headquarters: "Mumbai, India"
  }
];

const SEED_SERVICES: Record<string, Partial<ShipmentService>[]> = {
  "VRL Logistics": [
    { name: "Express Cargo", basePrice: 250, description: "Fast delivery for large shipments.", weightCategory: "Up to 50kg" },
    { name: "Standard Parcel", basePrice: 80, description: "Economical delivery for boxes.", weightCategory: "Up to 5kg" }
  ],
  "SRS Travel & Logistics": [
    { name: "Bus Express", basePrice: 45, description: "Fast transit via bus network.", weightCategory: "Up to 2kg" }
  ]
};

export async function getAgencies(): Promise<LogisticsAgency[]> {
  const snapshot = await getDocs(collection(db, 'agencies'));
  if (snapshot.empty) {
    for (const agency of SEED_AGENCIES) {
      const docRef = await addDoc(collection(db, 'agencies'), agency);
      const serviceRef = collection(db, `agencies/${docRef.id}/services`);
      const services = SEED_SERVICES[agency.name as string] || [];
      for (const service of services) {
        await addDoc(serviceRef, { ...service, agencyId: docRef.id });
      }
    }
    return getAgencies();
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogisticsAgency));
}

export async function getAgencyServices(agencyId: string): Promise<ShipmentService[]> {
  const snapshot = await getDocs(collection(db, `agencies/${agencyId}/services`));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShipmentService));
}

export async function getAgencyById(id: string): Promise<LogisticsAgency | null> {
  const docRef = doc(db, 'agencies', id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } as LogisticsAgency : null;
}
