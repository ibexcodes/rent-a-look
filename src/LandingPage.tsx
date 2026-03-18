import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Briefcase, 
  Footprints, 
  ArrowRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  Menu, 
  X,
  Instagram,
  Twitter,
  Facebook,
  LogOut,
  User as UserIcon,
  History
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useFirebase } from './FirebaseContext';
import { useCart } from './CartContext';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// --- Constants & Config ---

const IMAGE_ASSETS = {
  HERO_MAIN: "https://i.pinimg.com/736x/68/f3/f6/68f3f663a7fa1f1e8c11e77cca50d7ad.jpg",
  HERO_SECONDARY: "https://i.pinimg.com/1200x/20/a5/66/20a56673b1d6e0ac73501a96c89cf766.jpg",
  HOW_IT_WORKS: "https://i.pinimg.com/736x/ac/ff/81/acff81b58c899a90aa6c6681936ef69e.jpg",
};

// --- Components ---

const Hero = () => {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-botswana-blue/10 text-botswana-blue text-xs font-bold uppercase tracking-wider mb-6">
            <Star size={14} fill="currentColor" />
            <span>Built for UB, BIUST, Botho, BSBS & More</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] tracking-tighter mb-6 md:mb-8 text-balance uppercase">
            Nna le <span className="font-serif italic font-normal text-botswana-blue lowercase">Styl.</span> <br/>Spend <span className="font-serif italic font-normal lowercase">Less.</span>
          </h1>
          <p className="text-base md:text-lg text-black/60 max-w-md mb-8 md:mb-10 leading-relaxed">
            Professional graduation gowns, presentation outfits & styling services — built for every fashionista in Botswana. Look sharp, save your Pula.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/collection" className="px-6 md:px-8 py-3 md:py-4 bg-black text-white rounded-full font-medium flex items-center gap-2 group hover:gap-4 hover:bg-botswana-blue transition-all text-sm md:text-base">
              Explore Collection <ArrowRight size={20} />
            </Link>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-black border-2 border-black rounded-full font-medium flex items-center gap-2 group hover:bg-black hover:text-white transition-all text-sm md:text-base"
            >
              How It Works
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-8 lg:mt-0 px-4 md:px-8 lg:px-0"
        >
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl rotate-2">
            <img 
              src={IMAGE_ASSETS.HERO_MAIN} 
              alt="University of Botswana student" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-4 -left-0 md:-bottom-6 md:-left-6 aspect-square w-32 md:w-48 rounded-2xl overflow-hidden shadow-xl -rotate-6 border-4 md:border-8 border-white">
            <img 
              src={IMAGE_ASSETS.HERO_SECONDARY} 
              alt="Fashion graduation vibes in Botswana" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute top-8 right-0 md:top-12 md:-right-6 bg-white p-3 md:p-4 rounded-2xl shadow-lg flex items-center gap-2 md:gap-3 animate-bounce">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-botswana-blue/10 rounded-full flex items-center justify-center text-botswana-blue">
              <ShieldCheck size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold">Botswana Verified</p>
              <p className="text-[8px] md:text-[10px] text-black/40">Quality guaranteed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Browse", desc: "Check our online catalog or visit our fashion pop-up.", icon: <ShoppingBag size={24} /> },
    { title: "Pick & Fit", desc: "Try it on! We offer fitting sessions every Tuesday.", icon: <Star size={24} /> },
    { title: "Rock It", desc: "Wear it to your event and feel like a million bucks.", icon: <Briefcase size={24} /> },
    { title: "Return", desc: "Drop it off at the hub. We handle the cleaning.", icon: <Clock size={24} /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-display font-bold mb-8 leading-tight">Simple. Fast.<br/>Fashion Ready.</h2>
            <div className="space-y-8">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-botswana-blue">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                    <p className="text-white/60 text-sm max-w-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-botswana-blue/10 rounded-full blur-3xl animate-pulse"></div>
            <img 
              src={IMAGE_ASSETS.HOW_IT_WORKS} 
              alt="Students studying at a Botswana university library" 
              className="relative rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => item.category !== 'Blazers').slice(0, 4);

  const seedData = async () => {
    const sampleItems = [
      { name: "UB Graduation Gown", category: "Gowns", price: 150, stock: 50, size: "L", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" },
      { name: "Complete Presentation Outfit", category: "Bundles", price: 120, stock: 15, size: "M", imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80" },
      { name: "BIUST Graduation Gown", category: "Gowns", price: 150, stock: 30, size: "S", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" },
      { name: "Black Midi Dress", category: "Dresses", price: 50, stock: 25, size: "M", imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" },
      { name: "Formal Shoes", category: "Shoes", price: 25, size: "L", stock: 15, imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80" },
      { name: "Tailored Trouser", category: "Trousers", price: 60, size: "M", stock: 12, imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80" },
      { name: "Basic T-shirt", category: "T-shirts", price: 20, size: "L", stock: 25, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
      { name: "Premium Wedding Gown", category: "Wedding Gowns", price: 500, size: "M", stock: 3, imageUrl: "https://images.unsplash.com/photo-1594552072238-18546115fb57?w=800&q=80" }
    ];

    for (const item of sampleItems) {
      await addDoc(collection(db, 'inventory'), item);
    }
  };

  return (
    <section id="inventory" className="py-24 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl w-full">
            <h2 className="text-4xl font-display font-bold mb-4 uppercase tracking-tight">Popular Items</h2>
            <p className="text-black/60 text-lg">A preview of our most sought-after pieces.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/collection')}
              className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-botswana-blue transition-colors"
            >
              View Full Collection
            </button>
            {profile?.role === 'admin' && (
              <button onClick={seedData} className="text-xs font-bold text-botswana-blue underline">Seed Sample Data</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-black/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-black/5">
            <ShoppingBag className="mx-auto mb-4 text-black/20" size={48} />
            <p className="text-black/40 font-medium">No items found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-white mb-6 relative shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img src={item.image || item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/400/500`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {item.category}
                    </span>
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-1 group-hover:text-botswana-blue transition-colors">{item.name}</h4>
                <p className="text-botswana-blue font-bold">P{item.price}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default function LandingPage() {
  const { user, loading } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <main>
        <Hero />
        <Inventory />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
