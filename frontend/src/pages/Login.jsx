import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SignIn } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If successfully logged in, redirect to home/dashboard
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left side: Branding / Value Prop (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative flex-col justify-between overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-800/50 blur-3xl" />
          <div className="absolute top-[60%] right-[10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-3xl" />
        </div>

        <div className="relative z-10 p-12 lg:px-20 lg:py-16 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-xl text-brand-600 shadow-lg">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <span className="font-extrabold text-3xl text-white tracking-tight">Campus<span className="text-brand-400">Cart</span></span>
          </div>

          <div className="mt-auto mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              Your campus.<br/>
              <span className="text-brand-400">Your community.</span><br/>
              Your marketplace.
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-6 w-6 text-brand-400" />
                <span className="text-lg">Exclusive to NITS students</span>
              </div>
              <div className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-6 w-6 text-brand-400" />
                <span className="text-lg">Secure & verified campus marketplace</span>
              </div>
              <div className="flex items-center gap-3 text-brand-100">
                <CheckCircle2 className="h-6 w-6 text-brand-400" />
                <span className="text-lg">Buy, sell, and connect instantly</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center lg:text-left">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="bg-brand-600 p-2 rounded-xl text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Campus<span className="text-brand-600">Cart</span></span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your account.
            </p>
          </div>
          
          <div className="mt-8">
            <SignIn 
              path="/login"
              routing="path"
              signUpUrl="/register"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none p-0 bg-transparent rounded-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3 text-base shadow-md font-semibold transition-all hover:-translate-y-0.5",
                  formFieldInput: "block w-full py-3 border rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all",
                  formFieldLabel: "text-sm font-semibold text-slate-700",
                  footer: "hidden"
                }
              }}
            />
          </div>
          
          <div className="text-center mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
