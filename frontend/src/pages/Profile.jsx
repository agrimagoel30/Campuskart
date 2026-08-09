import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { getMe, updateProfile } from '../features/auth/authSlice';
import { getProducts } from '../features/products/productSlice';
import ProductCard from '../components/products/ProductCard';
import { Loader2, Camera, User as UserIcon, CheckCircle2, Edit3, X, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  
  const { user, stats, isProfileLoading } = useSelector((state) => state.auth);
  const { products, isLoading: productsLoading } = useSelector((state) => state.product);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Load data
  useEffect(() => {
    dispatch(getMe(() => getToken()));
  }, [dispatch]); // Removed getToken to prevent infinite loops

  // Load my listings
  useEffect(() => {
    if (user?._id) {
      dispatch(getProducts(`?sellerId=${user._id}`));
    }
  }, [dispatch, user?._id]);

  // Sync form data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    if (profileImage) {
      data.append('profilePhoto', profileImage);
    }

    try {
      await dispatch(updateProfile({ formData: data, getToken: () => getToken() })).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  if (isProfileLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Profile Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden sticky top-28">
            <div className="p-8 text-center relative">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                {imagePreview || user.profilePhoto ? (
                  <img 
                    src={imagePreview || user.profilePhoto} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-brand-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg mx-auto border-4 border-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow hover:bg-slate-800 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Profile Info */}
              {!isEditing ? (
                <>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                    {user.name}
                    {user.isEmailVerified && <CheckCircle2 className="h-5 w-5 text-brand-600" />}
                  </h1>
                  <p className="text-slate-500 flex items-center justify-center gap-2 mt-1">
                    <Mail className="h-4 w-4" /> {user.email}
                  </p>
                  
                  {user.isEmailVerified && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Student
                    </div>
                  )}

                  {user.bio && (
                    <p className="text-slate-600 mt-6 text-sm leading-relaxed border-t border-slate-100 pt-6">
                      "{user.bio}"
                    </p>
                  )}

                  <button 
                    onClick={() => setIsEditing(true)}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleFormSubmit} className="text-left mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows="3"
                        placeholder="Tell others about yourself..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button 
                      type="submit" 
                      disabled={isProfileLoading}
                      className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-medium transition-colors flex justify-center"
                    >
                      {isProfileLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        setImagePreview(null);
                        setProfileImage(null);
                        setFormData({ name: user.name, bio: user.bio || '' });
                      }}
                      className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 border-t border-slate-200 divide-x divide-slate-200 bg-slate-50/50">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats?.listings || 0}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Listings</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-brand-600">{stats?.sold || 0}</p>
                <p className="text-xs font-medium text-brand-600/70 uppercase tracking-wider mt-1">Sold</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-rose-500">{stats?.wishlist || 0}</p>
                <p className="text-xs font-medium text-rose-500/70 uppercase tracking-wider mt-1">Wishlist</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Listings Section */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">My Listings</h2>
            </div>
            
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : products?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                  <UserIcon className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No listings yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  You haven't listed any items for sale yet. Start selling to clear out your room!
                </p>
                <a 
                  href="/sell" 
                  className="inline-flex bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Sell an Item
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
