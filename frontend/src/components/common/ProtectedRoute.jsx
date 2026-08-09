import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoading } = useSelector((state) => state.auth);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
      </div>
    );
  }

  // If not signed into Clerk, go to login
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // If signed into Clerk but MongoDB sync hasn't finished/failed
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
        <p className="text-slate-500 font-medium">Syncing profile...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
