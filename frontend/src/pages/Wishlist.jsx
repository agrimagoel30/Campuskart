import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { getMe } from '../features/auth/authSlice';
import ProductCard from '../components/products/ProductCard';
import { Loader2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user, isProfileLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe(() => getToken()));
  }, [dispatch]);

  if (isProfileLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
      </div>
    );
  }

  if (!user) return null;

  const hasWishlist = user.wishlist && user.wishlist.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-rose-100 p-2.5 rounded-xl">
          <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
      </div>

      {hasWishlist ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {user.wishlist.map(product => (
            // user.wishlist should be populated by the backend, meaning each item is a product object
            <ProductCard key={product._id || product} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
          <div className="bg-rose-50 h-20 w-20 rounded-full flex items-center justify-center shadow-sm mx-auto mb-5">
            <Heart className="h-10 w-10 text-rose-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-base">
            Save items you like by clicking the heart icon on any product.
          </p>
          <Link 
            to="/" 
            className="inline-flex bg-brand-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            Browse Listings
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
