import { IndianRupee, Eye, MessageCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { accessChat } from '../../features/chat/chatSlice';
import { toggleWishlist } from '../../features/auth/authSlice';
import { useAuth } from '@clerk/clerk-react';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';

  const handleContactSeller = async (e) => {
    e.stopPropagation();
    try {
      await dispatch(accessChat({ userId: product.sellerId, productId: product._id })).unwrap();
      navigate('/chat');
    } catch (error) {
      console.error('Failed to initiate chat', error);
    }
  };

  const isOwner = user && product.sellerId === (user.id || user._id);
  const isSold = product.status === 'Sold';

  const { getToken } = useAuth();
  
  const isWishlisted = user?.wishlist?.some(item => {
    // Backend populates wishlist, so item could be an object or an ID
    const itemId = item._id || item;
    return itemId === product._id;
  });

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await dispatch(toggleWishlist({ 
        productId: product._id, 
        isWishlisted, 
        getToken: () => getToken() 
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle wishlist', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/products/${product._id}`)}
      className="bg-white rounded-3xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all group cursor-pointer flex flex-col h-full relative"
    >
      <div className="relative h-60 w-full overflow-hidden bg-slate-50">
        <img 
          src={imageUrl} 
          alt={product.title} 
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out ${isSold ? 'grayscale opacity-60' : ''}`}
        />
        
        {/* Wishlist UI (Hidden for owner and sold items) */}
        {!isOwner && !isSold && (
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm">
            {product.condition}
          </span>
          <span className="bg-brand-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm capitalize">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1 relative">
        {/* Sold Overlay Banner */}
        {isSold && (
          <div className="absolute inset-x-0 -top-4 flex justify-center z-20">
            <span className="bg-slate-700 text-white px-6 py-1.5 rounded-full text-sm font-black tracking-widest uppercase shadow-md border-2 border-white">
              Sold Out
            </span>
          </div>
        )}

        <div className="flex justify-between items-start gap-4 mb-2 mt-2">
          <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${isSold ? 'text-slate-400 line-through' : 'text-slate-900'}`} title={product.title}>
            {product.title}
          </h3>
          <span className={`flex items-center font-black text-lg ${isSold ? 'text-slate-400' : 'text-brand-600'}`}>
            <IndianRupee className="h-4 w-4 mr-0.5 stroke-[3]" />
            {product.price}
          </span>
        </div>
        
        {/* Seller Info Placeholder if available */}
        <p className="text-sm text-slate-500 mb-6 flex-1">
          NITS Marketplace
        </p>
        
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Eye className="h-4 w-4" />
            <span className="font-medium">{product.views} views</span>
          </div>
          
          {isSold ? (
            <div className="text-sm font-bold text-slate-400 uppercase">Item Sold</div>
          ) : !isOwner && user ? (
            <button 
              onClick={handleContactSeller}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-brand-600 transition-colors font-semibold shadow-sm text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </button>
          ) : isOwner ? (
             <div className="flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
               Your Item
             </div>
          ) : (
            <div className="text-sm font-medium text-brand-600">Sign in to buy</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
