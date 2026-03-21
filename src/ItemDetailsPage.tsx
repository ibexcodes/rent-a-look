import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useCart } from './CartContext';
import { useFirebase } from './FirebaseContext';

interface ItemReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: any;
}

const ItemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { user, profile, loading: authLoading } = useFirebase();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Redirect specific admin
  useEffect(() => {
    if (!authLoading && user?.email === "johansonsebudi@gmail.com") {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      if (!id) throw new Error('Item ID is required');
      const docRef = doc(db, 'inventory', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Item not found');
      return { id: docSnap.id, ...docSnap.data() } as any;
    },
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['item-reviews', id],
    queryFn: async () => {
      if (!id) return [] as ItemReview[];

      const reviewsRef = collection(db, 'inventory', id, 'reviews');

      try {
        const orderedSnapshot = await getDocs(query(reviewsRef, orderBy('createdAt', 'desc')));
        return orderedSnapshot.docs.map((reviewDoc) => ({ id: reviewDoc.id, ...reviewDoc.data() } as ItemReview));
      } catch {
        const fallbackSnapshot = await getDocs(reviewsRef);
        return fallbackSnapshot.docs
          .map((reviewDoc) => ({ id: reviewDoc.id, ...reviewDoc.data() } as ItemReview))
          .sort((a, b) => {
            const aSeconds = a?.createdAt?.seconds ?? 0;
            const bSeconds = b?.createdAt?.seconds ?? 0;
            return bSeconds - aSeconds;
          });
      }
    },
    enabled: !!id,
  });

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const reviewSummaryText = useMemo(() => {
    if (reviewsLoading) return 'Loading reviews...';
    if (!reviews.length) return 'No reviews yet';
    return `${averageRating.toFixed(1)} (${reviews.length} Review${reviews.length === 1 ? '' : 's'})`;
  }, [reviews, reviewsLoading, averageRating]);

  const formatReviewDate = (createdAt: any) => {
    if (!createdAt) return 'Just now';

    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    if (typeof createdAt.seconds === 'number') {
      return new Date(createdAt.seconds * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    return 'Just now';
  };

  const getInitials = (name: string) => {
    if (!name) return 'AN';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (item) {
      await addToCart(item);
    }
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setReviewError(null);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    const trimmedReview = reviewText.trim();

    if (selectedRating < 1 || selectedRating > 5) {
      setReviewError('Please select a rating from 1 to 5.');
      return;
    }

    if (trimmedReview.length < 5) {
      setReviewError('Please write at least 5 characters.');
      return;
    }

    setReviewError(null);
    setIsSubmittingReview(true);

    try {
      const reviewAuthor =
        profile?.displayName ||
        user.displayName ||
        (user.email ? user.email.split('@')[0] : 'Anonymous');

      await addDoc(collection(db, 'inventory', id, 'reviews'), {
        userId: user.uid,
        userName: reviewAuthor,
        rating: selectedRating,
        comment: trimmedReview,
        createdAt: serverTimestamp(),
      });

      setReviewText('');
      setSelectedRating(5);
      setIsReviewModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['item-reviews', id] });
    } catch (submissionError) {
      console.error('Error submitting review:', submissionError);
      setReviewError('Could not submit your review right now. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-12 h-12 border-4 border-botswana-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
        <h2 className="text-3xl font-display font-bold mb-4 uppercase">Item Not Found</h2>
        <p className="text-black/60 mb-8">The item you are looking for does not exist or has been removed.</p>
        <Link to="/collection" className="px-8 py-4 bg-black text-white rounded-full font-bold">
          Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/collection" className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl bg-white">
                <img 
                  src={item.image || item.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/400/500`} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  {item.category}
                </span>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="text-botswana-blue fill-botswana-blue" />
                  ))}
                  <span className="text-xs font-bold text-black/40 ml-2 uppercase tracking-widest">{reviewSummaryText}</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-4 leading-none">
                  {item.name}
                </h1>
                <p className="text-3xl font-display font-bold text-botswana-blue">
                  P{item.price || 0}
                </p>
              </div>

              <div className="space-y-8 mb-10">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Description</h3>
                  <p className="text-black/60 leading-relaxed">
                    {item.description || `Premium ${item.category.toLowerCase()} designed for style and comfort. Perfect for graduations, professional events, and special occasions in Botswana. This piece features high-quality fabric and a tailored fit that ensures you look your best.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Size</h3>
                    <div className="w-12 h-12 rounded-xl border-2 border-botswana-blue flex items-center justify-center font-bold text-botswana-blue bg-botswana-blue/5">
                      {item.size}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Availability</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold text-black/60">
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={handleAddToCart}
                  disabled={item.stock <= 0}
                  className="flex-1 px-10 py-5 bg-black text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-botswana-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                  {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-black/5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-botswana-blue/10 flex items-center justify-center text-botswana-blue">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Verified Quality</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Clock size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Fast Rental</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/40">Clean & Ready</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section Placeholder */}
          <section className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-display font-bold uppercase tracking-tight">Customer Reviews</h2>
              <button
                onClick={handleOpenReviewModal}
                className="text-sm font-bold text-botswana-blue underline"
              >
                Write a Review
              </button>
            </div>

            {reviewsLoading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2].map((loadingCard) => (
                  <div key={loadingCard} className="h-56 rounded-[2.5rem] bg-black/5 animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm text-center">
                <p className="text-black/50">No reviews yet. Be the first to share your experience.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center font-bold">
                        {getInitials(review.userName)}
                      </div>
                      <div>
                        <p className="font-bold">{review.userName}</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((starIndex) => (
                            <Star
                              key={starIndex}
                              size={12}
                              className={
                                starIndex <= Number(review.rating || 0)
                                  ? 'text-botswana-blue fill-botswana-blue'
                                  : 'text-black/20'
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-black/60 italic leading-relaxed">"{review.comment}"</p>
                    <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-4">
                      {formatReviewDate(review.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] w-full max-w-xl p-8"
          >
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-6">Write a Review</h3>

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Your Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setSelectedRating(starValue)}
                    className="p-1"
                    aria-label={`Rate ${starValue} out of 5`}
                  >
                    <Star
                      size={24}
                      className={
                        starValue <= selectedRating
                          ? 'text-botswana-blue fill-botswana-blue'
                          : 'text-black/20'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">Your Review</p>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="Share your experience with this item..."
                rows={5}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-botswana-blue/30"
              />
            </div>

            {reviewError && <p className="text-sm text-red-500 mb-4">{reviewError}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="flex-1 py-3 rounded-full font-bold bg-black/5 hover:bg-black/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="flex-1 py-3 rounded-full font-bold bg-black text-white hover:bg-botswana-blue transition-colors disabled:opacity-60"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ItemDetailsPage;
