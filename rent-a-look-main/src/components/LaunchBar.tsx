import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, ShoppingBag, Menu, Search, X, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useFirebase } from '../FirebaseContext';

export const LaunchBar = () => {
  const location = useLocation();
  const { setIsCartOpen, cartItemCount } = useCart();
  const { user, profile, logout, loading } = useFirebase();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'Collection', href: '/collection', icon: <Search size={20} /> },
  ];

  const isSpecificAdmin = user?.email === "johansonsebudi@gmail.com";

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 shadow-2xl rounded-full p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`p-3 rounded-full transition-all ${
                  location.pathname === link.href
                    ? 'bg-black text-white'
                    : 'text-black/40 hover:bg-botswana-blue/10'
                }`}
              >
                {link.icon}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {!isSpecificAdmin && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 text-black/40 hover:bg-botswana-blue/10 rounded-full transition-all"
              >
                <ShoppingBag size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-botswana-blue text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setMenuOpen(true)}
              className="p-3 text-black/40 hover:bg-botswana-blue/10 rounded-full transition-all"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 bg-white z-[60] p-8 flex flex-col md:hidden"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 mt-12">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-5xl font-display font-bold">Home</Link>
              <Link to="/collection" onClick={() => setMenuOpen(false)} className="text-5xl font-display font-bold">Collection</Link>
              <Link to="/services" onClick={() => setMenuOpen(false)} className="text-5xl font-display font-bold">Services</Link>
              
              {user && !isSpecificAdmin && (
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-5xl font-display font-bold text-botswana-blue">Profile</Link>
              )}

              {!loading && !user && (
                <Link 
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-8 px-8 py-4 bg-botswana-blue text-white rounded-full text-xl font-bold text-center"
                >
                  Login
                </Link>
              )}

              {user && (
                <button 
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="mt-8 px-8 py-4 border border-black/10 rounded-full text-xl font-bold flex items-center justify-center gap-3"
                >
                  <LogOut size={24} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
