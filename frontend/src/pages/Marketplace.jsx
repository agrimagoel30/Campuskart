import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../features/products/productSlice';
import ProductCard from '../components/products/ProductCard';
import FilterSidebar from '../components/products/FilterSidebar';
import { Loader2, PackageX, ServerCrash, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Furniture', 'Hostel Essentials', 'Cycles', 'Sports', 'Lab Equipment', 'Stationery'];

const Marketplace = () => {
  const dispatch = useDispatch();
  const { products, isLoading, isError, message } = useSelector((state) => state.product);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: urlSearchQuery,
    category: '',
    sort: '-createdAt',
    page: 1,
    limit: 12
  });

  // Keep local search state in sync if URL changes (e.g. from Navbar search)
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: urlSearchQuery }));
  }, [urlSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let queryStr = `?page=${filters.page}&limit=${filters.limit}&sort=${filters.sort}`;
      if (filters.search) queryStr += `&search=${filters.search}`;
      if (filters.category && filters.category !== 'All') queryStr += `&category=${filters.category}`;

      dispatch(getProducts(queryStr));
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, dispatch]);

  const handleCategoryClick = (cat) => {
    setFilters({ ...filters, category: cat, page: 1 });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-brand-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] right-[10%] w-[50%] h-[100%] rounded-full bg-brand-600/30 blur-[100px]" />
          <div className="absolute top-[20%] -left-[10%] w-[30%] h-[80%] rounded-full bg-brand-500/20 blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
          >
            YOUR CAMPUS.<br />YOUR MARKETPLACE.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-brand-200 font-medium mb-10"
          >
            Buy smarter. Sell faster. Exclusively for NITS.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for books, cycles, electronics..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-14 pr-6 py-4 rounded-full text-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/30 shadow-xl transition-all"
            />
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10 relative z-20">
        
        {/* Category Chips Horizontal Scroll (Sticky) */}
        <div className="sticky top-20 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-slate-50/90 backdrop-blur-md pt-4 pb-4 mb-8 border-b border-slate-200/50">
          <div className="flex overflow-x-auto hide-scrollbar gap-3 snap-x pb-1">
            {CATEGORIES.map((cat) => {
              const isSelected = (filters.category === cat) || (cat === 'All' && !filters.category);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${
                    isSelected 
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 -translate-y-0.5' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar (Filters) */}
          <div className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar filters={filters} setFilters={setFilters} />
          </div>

          {/* Right Content (Product Grid) */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-2xl font-bold text-slate-900">
                {filters.category ? filters.category : 'Latest Listings'}
              </h2>
              <span className="text-sm font-medium text-slate-500">
                {products.length} results
              </span>
            </div>

            {/* Error State */}
            {isError && (
              <div className="bg-red-50 text-red-800 p-6 rounded-3xl mb-6 border border-red-100 flex items-center gap-4">
                <ServerCrash className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-bold text-lg">Failed to load products</h3>
                  <p className="text-sm opacity-90">{message}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
                <p className="text-slate-500 font-medium animate-pulse">Loading amazing deals...</p>
              </div>
            ) : products.length === 0 && !isError ? (
              /* Empty State */
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center h-[40vh]">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <PackageX className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  We couldn't find anything matching your filters. Try adjusting your search terms or clearing the category.
                </p>
                <button 
                  onClick={() => {
                    setFilters({ ...filters, search: '', category: '' });
                    setSearchParams({});
                  }}
                  className="mt-6 px-6 py-2.5 bg-brand-50 text-brand-700 font-semibold rounded-xl hover:bg-brand-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Success State: The Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            )}
            
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

export default Marketplace;
