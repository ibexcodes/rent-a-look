import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Trash2, ArrowLeft, CheckCircle2, Calendar, MapPin, Phone, ShieldCheck, AlertTriangle, Plus, Minus } from 'lucide-react';
import { useCart } from '../CartContext';
import { useFirebase } from '../FirebaseContext';

const PolicyModal = ({ isOpen, onAccept, onDecline }: { isOpen: boolean, onAccept: () => void, onDecline: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-botswana-blue" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-botswana-blue/10 flex items-center justify-center text-botswana-blue">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-display font-bold">Rental Policy</h3>
            </div>
            
            <div className="text-sm text-black/60 space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="p-4 bg-black/5 rounded-2xl border border-black/5">
                <h4 className="font-bold text-black mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Return Period
                </h4>
                <p>Items must be returned within 3 days of your event. Late returns incur a fee of P20 per day.</p>
              </div>
              
              <div className="p-4 bg-black/5 rounded-2xl border border-black/5">
                <h4 className="font-bold text-black mb-1 flex items-center gap-2">
                  <ShieldCheck size={14} /> Condition & Care
                </h4>
                <p>Please handle items with care. We handle all professional cleaning—no need to wash before returning!</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-700 mb-1 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Damage Policy
                </h4>
                <p className="text-emerald-600/80 text-xs">Minor wear and tear is covered. Significant damage or loss will be charged at the full replacement value.</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-amber-700 mb-1 flex items-center gap-2">
                  <AlertTriangle size={14} /> Cancellation
                </h4>
                <p className="text-amber-600/80 text-xs">Declining this policy will cancel your current order process.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={onDecline} 
                className="flex-1 py-4 rounded-full font-bold border border-black/10 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all uppercase tracking-widest text-xs"
              >
                Decline
              </button>
              <button 
                onClick={onAccept} 
                className="flex-1 py-4 rounded-full font-bold bg-black text-white hover:bg-botswana-blue transition-all uppercase tracking-widest text-xs shadow-lg shadow-black/10"
              >
                I Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, checkoutCart, cartTotal, isCartOpen, setIsCartOpen, rentalPeriod, setRentalPeriod, rentalDuration } = useCart();
  const { user, login } = useFirebase();
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Reset step when cart closes
  useEffect(() => {
    if (!isCartOpen) {
      setTimeout(() => setCheckoutStep('cart'), 300);
    }
  }, [isCartOpen]);

  const handleProceedToDetails = () => {
    if (!user) {
      login();
      return;
    }
    setCheckoutStep('details');
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setShowPolicyModal(true);
  };

  const onAcceptPolicy = async () => {
    setShowPolicyModal(false);
    setIsProcessing(true);
    try {
      await checkoutCart({
        deliveryAddress,
        phoneNumber
      });
      setCheckoutStep('success');
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDeclinePolicy = () => {
    setShowPolicyModal(false);
    setCheckoutStep('cart');
    // Optionally clear details or just go back to cart
  };

  return (
    <>
      <PolicyModal 
        isOpen={showPolicyModal} 
        onAccept={onAcceptPolicy} 
        onDecline={onDeclinePolicy} 
      />
      <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {checkoutStep === 'details' ? (
                  <button onClick={() => setCheckoutStep('cart')} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-black" />
                  </button>
                ) : (
                  <ShoppingBag size={24} className="text-botswana-blue" />
                )}
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">
                  {checkoutStep === 'cart' ? 'Your Cart' : checkoutStep === 'details' ? 'Checkout Details' : 'Order Confirmed'}
                </h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 'cart' && (
                cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-black/40">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-black/5 p-4 rounded-2xl">
                        <div className="w-20 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image || item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/400/500`} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold leading-tight mb-1">{item.name}</h4>
                            <p className="text-xs text-black/60 uppercase tracking-wider font-bold">
                              {item.category || 'Item'} {item.size ? `• Size: ${item.size}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-botswana-blue">
                                P{item.price * item.quantity * ((item.category === 'Shoes' || item.category === 'Wedding Gowns' || item.category === 'Graduation Gowns') ? rentalDuration : 1)}
                              </p>
                              {(item.category === 'Shoes' || item.category === 'Wedding Gowns' || item.category === 'Graduation Gowns') && rentalDuration > 1 && (
                                <p className="text-[10px] text-black/40 font-bold uppercase">P{item.price} × {rentalDuration} days</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-white/50 rounded-full p-1 border border-black/5">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {checkoutStep === 'details' && (
                <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b border-black/5 pb-2">Contact Information</h3>
                    <div>
                      <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                        <Phone size={16} /> Phone Number
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +267 71 234 567"
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                        <MapPin size={16} /> Delivery Address / Campus Location
                      </label>
                      <textarea 
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your full address or campus room number"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2">
                      <h3 className="font-bold text-lg">Rental Period (Optional)</h3>
                      {rentalDuration > 1 && (
                        <span className="bg-botswana-blue/10 text-botswana-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {rentalDuration} Days
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/60">If your order includes rental items, please specify the dates.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                          <Calendar size={16} /> From
                        </label>
                        <input 
                          type="date" 
                          value={rentalPeriod.start}
                          min={today}
                          onChange={(e) => setRentalPeriod({ ...rentalPeriod, start: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black/60 mb-1 flex items-center gap-2">
                          <Calendar size={16} /> To
                        </label>
                        <input 
                          type="date" 
                          value={rentalPeriod.end}
                          onChange={(e) => setRentalPeriod({ ...rentalPeriod, end: e.target.value })}
                          min={rentalPeriod.start || today}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:border-botswana-blue focus:ring-1 focus:ring-botswana-blue transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <CheckCircle2 size={80} className="text-emerald-500 mb-4" />
                  </motion.div>
                  <h3 className="text-3xl font-display font-bold uppercase tracking-tight">Order Placed!</h3>
                  <p className="text-black/60">
                    Thank you for your order. We'll be in touch shortly to confirm delivery details.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 px-8 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-botswana-blue transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {checkoutStep === 'cart' && cart.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-display font-bold text-botswana-blue">P{cartTotal}</span>
                </div>
                <button 
                  onClick={handleProceedToDetails}
                  className="w-full py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-botswana-blue transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}

            {checkoutStep === 'details' && (
              <div className="p-6 border-t border-black/5 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold">Total to Pay</span>
                  <span className="text-2xl font-display font-bold text-botswana-blue">P{cartTotal}</span>
                </div>
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full py-4 bg-botswana-blue text-white rounded-full font-bold uppercase tracking-widest hover:bg-botswana-blue/90 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};
