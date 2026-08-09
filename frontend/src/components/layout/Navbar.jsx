import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../features/auth/authSlice';
import { useClerk } from '@clerk/clerk-react';
import { ShoppingBag, LogOut, PlusCircle, MessageCircle, Search, Menu, X, User, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { signOut } = useClerk();
  const { user } = useSelector((state) => state.auth);
  const { chats } = useSelector((state) => state.chat);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalUnread = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  const wishlistCount = user?.wishlist?.length || 0;

  const onLogout = async () => {
    await signOut();
    dispatch(clearUser());
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-600 p-2 rounded-xl text-white group-hover:bg-brand-700 transition-colors shadow-sm">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Campus<span className="text-brand-600">Cart</span></span>
            </Link>
          </div>
          
          {/* Removed Desktop Search */}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/chat" 
                  className="relative flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors font-medium text-sm"
                >
                  <div className="relative">
                    <MessageCircle className="h-5 w-5" />
                    {totalUnread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                  <span>Messages</span>
                </Link>

                <Link 
                  to="/wishlist" 
                  className="relative flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors font-medium text-sm"
                >
                  <div className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span>Wishlist</span>
                </Link>
                
                <Link 
                  to="/sell" 
                  className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-brand-700 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Sell Item</span>
                </Link>
                
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 bg-slate-100 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  
                  <button
                    onClick={onLogout}
                    className="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="bg-brand-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-brand-700 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-slate-500 hover:text-brand-600 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Removed Mobile Search */}

              {user ? (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl mb-4 transition-colors">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5" />
                      <span>Messages</span>
                    </div>
                    {totalUnread > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {totalUnread} new
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5" />
                      <span>Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    to="/sell"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>Sell an Item</span>
                  </Link>
                  
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-base font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-base font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
