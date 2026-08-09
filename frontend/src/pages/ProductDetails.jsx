import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails, deleteProduct, markProductAsSold, reset } from '../features/products/productSlice';
import { accessChat } from '../features/chat/chatSlice';
import Navbar from '../components/layout/Navbar';
import { ArrowLeft, MapPin, Building2, User, Loader2, Calendar, IndianRupee, MessageCircle, Edit, Trash2, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleProduct, isLoading, isError, isDeleteSuccess, message } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (singleProduct && singleProduct.images && singleProduct.images.length > 0) {
      setMainImage(singleProduct.images[0]);
    }
  }, [singleProduct]);

  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success('Product deleted successfully.');
      dispatch(reset());
      navigate('/');
    }
  }, [isDeleteSuccess, navigate, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
          <p className="text-slate-500 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (isError || !singleProduct) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-red-500 font-bold text-xl">Error loading product</p>
          <p className="text-slate-500">{message}</p>
          <Link to="/" className="text-brand-600 font-medium hover:underline">Return to Marketplace</Link>
        </div>
      </div>
    );
  }

  const isOwner = user && singleProduct.sellerId && (singleProduct.sellerId._id === (user.id || user._id));

  const handleContactSeller = async () => {
    try {
      await dispatch(accessChat({ userId: singleProduct.sellerId._id, productId: singleProduct._id })).unwrap();
      navigate('/chat');
    } catch (error) {
      console.error('Failed to initiate chat', error);
      toast.error('Could not start chat. Please try again.');
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(singleProduct._id));
    }
  };

  const handleMarkAsSold = () => {
    if (window.confirm("Are you sure you want to mark this product as sold? This cannot be undone.")) {
      dispatch(markProductAsSold(singleProduct._id));
    }
  };

  const isSold = singleProduct.status === 'Sold';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Marketplace
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Images (Sticky on Desktop) */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-28 space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-w-4 aspect-h-4 rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 relative group"
              >
                <img 
                  src={mainImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'} 
                  alt={singleProduct.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
              </motion.div>

              {singleProduct.images && singleProduct.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto py-2 hide-scrollbar">
                  {singleProduct.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden transition-all ${
                        mainImage === img 
                          ? 'border-2 border-brand-600 shadow-md scale-105' 
                          : 'border-2 border-transparent hover:border-brand-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Seller Card */}
          <div className="w-full lg:w-1/2 flex flex-col pt-2 lg:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {isSold ? (
                  <span className="px-4 py-1.5 bg-slate-600 text-white text-sm font-bold rounded-full uppercase tracking-wide">
                    SOLD
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-brand-50 text-brand-700 text-sm font-bold rounded-full uppercase tracking-wide">
                    {singleProduct.category}
                  </span>
                )}
                <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-full capitalize">
                  {singleProduct.condition}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-6">
                {singleProduct.title}
              </h1>

              <div className="flex items-end gap-4 mb-8">
                <div className={`text-5xl font-black flex items-center ${isSold ? 'text-slate-400' : 'text-brand-600'}`}>
                  <IndianRupee className="h-10 w-10 mr-1 stroke-[3]" />
                  {singleProduct.price}
                </div>
                {singleProduct.isNegotiable && !isSold && (
                  <span className="mb-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-100">
                    Negotiable
                  </span>
                )}
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl text-slate-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted On</p>
                    <p className="font-bold text-slate-900">{new Date(singleProduct.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl text-slate-500">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="font-bold text-slate-900 line-clamp-1">{singleProduct.hostelNumber || 'Campus'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-4">About this item</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                  {singleProduct.description}
                </p>
              </div>

              {/* Premium Seller Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 flex-shrink-0">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-slate-900">{singleProduct.sellerId?.name || 'Anonymous Student'}</p>
                        <ShieldCheck className="h-5 w-5 text-emerald-500" title="Verified Student" />
                      </div>
                      <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
                        <Building2 className="h-4 w-4 mr-1.5" />
                        {singleProduct.college || 'NIT Silchar'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {isOwner ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      {!isSold && (
                        <button 
                          onClick={handleMarkAsSold}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-xl border border-emerald-100 hover:bg-emerald-100 font-bold transition-all"
                        >
                          <ShieldCheck className="h-5 w-5" />
                          Mark as Sold
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/products/${singleProduct._id}/edit`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl hover:bg-slate-800 font-bold shadow-md transition-all hover:-translate-y-0.5"
                      >
                        <Edit className="h-5 w-5" />
                        Edit
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 hover:bg-red-100 font-bold transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {isSold ? (
                        <div className="w-full flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500 px-8 py-6 rounded-2xl border border-slate-200">
                          <p className="font-bold text-lg">This item has been sold</p>
                          <p className="text-sm">It is no longer available for purchase.</p>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={handleContactSeller}
                            className="w-full flex items-center justify-center gap-3 bg-brand-600 text-white px-8 py-4 rounded-2xl hover:bg-brand-700 font-bold shadow-lg shadow-brand-200 transition-all hover:-translate-y-0.5 text-lg"
                          >
                            <MessageCircle className="h-6 w-6" />
                            Chat with Seller
                          </button>
                          
                          {singleProduct.contactNumber && user && (
                            <a 
                              href={`tel:${singleProduct.contactNumber}`}
                              className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-8 py-4 rounded-2xl hover:bg-slate-50 font-bold border border-slate-200 transition-all"
                            >
                              <Phone className="h-5 w-5 text-slate-400" />
                              {singleProduct.contactNumber}
                            </a>
                          )}
                        </>
                      )}
                      
                      {!user && (
                         <div className="text-center mt-2">
                           <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                             Sign in to contact seller
                           </Link>
                         </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default ProductDetails;
