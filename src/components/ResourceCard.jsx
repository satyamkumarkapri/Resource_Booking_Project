import React from 'react';

const ResourceCard = ({ resource, onSelect }) => {
  if (!resource) return null;
  const { name, type, price, stock, image } = resource;
  const isAvailable = stock > 0;

  // Descriptions based on type
  const descriptions = {
    'Room': 'Professional workspace for meetings',
    'Electronic': 'Premium tech equipment',
    'Vehicle': 'Easy transportation solution',
    'Equipment': 'Professional-grade tools'
  };

  const description = descriptions[type] || 'Quality resource for your needs';

  return (
    <div className="relative bg-white dark:bg-slate-800 rounded-[1.8rem] shadow-md border border-slate-100 dark:border-slate-700 p-3 flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 group animate-in fade-in zoom-in overflow-hidden max-w-xs">
      
      {/* Animated Side Lines */}
      <div className="absolute left-0 top-1/4 w-1 h-10 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></div>
      <div className="absolute right-0 top-1/4 w-1 h-10 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></div>
      
      {/* Enhanced Image Container */}
      <div className="relative w-40 h-40 mb-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-black text-xs">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight text-center mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{name}</h3>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-1.5 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-1">{description}</p>

      {/* Type Badge */}
      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase mb-1.5 animate-pulse">{type}</span>

      {/* Price & Stock */}
      <div className="flex items-center gap-1.5 mb-2 w-full justify-center flex-wrap">
        <span className="text-lg font-black text-green-600 dark:text-green-400">₹{price}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all ${isAvailable ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>{isAvailable ? `In Stock (${stock})` : 'Out of Stock'}</span>
      </div>

      {/* Reserve Button */}
      <button
        disabled={!isAvailable}
        onClick={() => onSelect && onSelect(resource)}
        className={`w-full py-2 px-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${isAvailable ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-300 active:scale-95' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
        aria-disabled={!isAvailable}
      >
        {isAvailable ? 'Reserve Now' : 'Unavailable'}
      </button>
    </div>
  );
};

export default ResourceCard;