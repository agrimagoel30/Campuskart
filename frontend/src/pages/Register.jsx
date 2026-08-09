import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SignUp } from '@clerk/clerk-react';
import { User, GraduationCap, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left side: Onboarding Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 relative flex-col justify-between overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] -left-[20%] w-[80%] h-[80%] rounded-full bg-brand-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 p-12 lg:px-16 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2.5 rounded-xl text-white shadow-lg">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">Campus<span className="text-brand-400">Cart</span></span>
          </div>

          <div className="mt-24 mb-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-10"
            >
              Join the Campus
            </motion.h1>
            
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1 bg-brand-500/20 p-3 rounded-xl text-brand-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">1. Your Identity</h3>
                  <p className="text-slate-400 mt-1 text-sm leading-relaxed">Tell us who you are. We use your real name to build trust in our community.</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1 bg-brand-500/20 p-3 rounded-xl text-brand-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">2. Secure Your Account</h3>
                  <p className="text-slate-400 mt-1 text-sm leading-relaxed">Protect your account with a strong password. You'll use this to manage your listings.</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1 bg-brand-500/20 p-3 rounded-xl text-brand-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">3. Verify Your NITS Email</h3>
                  <p className="text-slate-400 mt-1 text-sm leading-relaxed">We require an official NITS email to keep the marketplace exclusive to our students.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Registration Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-20 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="bg-brand-600 p-2 rounded-xl text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Campus<span className="text-brand-600">Cart</span></span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Start buying and selling with your fellow students.
            </p>
          </div>
          
          <div className="mt-8">
            <SignUp 
              path="/register"
              routing="path"
              signInUrl="/login"
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
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
