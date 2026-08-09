import { SlidersHorizontal, ArrowDownUp } from 'lucide-react';

const SORTS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
];

const FilterSidebar = ({ filters, setFilters }) => {
  const handleSortChange = (sortValue) => {
    setFilters({ ...filters, sort: sortValue, page: 1 });
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 sticky top-28">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <SlidersHorizontal className="h-5 w-5 text-slate-800" />
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4" />
          Sort By
        </h3>
        <div className="space-y-2">
          {SORTS.map((sort) => {
            const isSelected = filters.sort === sort.value;
            return (
              <button
                key={sort.value}
                onClick={() => handleSortChange(sort.value)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isSelected 
                    ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-500/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {sort.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
