import React, { useState, useEffect, useMemo } from 'react';
import ResourceCard from '../components/ResourceCard';
import BookingForm from '../features/BookingForm';
import { api } from '../services/api';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch resources from the API service
    api.getResources().then(data => {
      let storedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      
      if (storedResources.length > 0) {
        // Always sync with latest API data but preserve local stock levels
        storedResources = data.map(backendItem => {
          const cachedItem = storedResources.find(sr => sr.id === backendItem.id);
          return cachedItem ? { ...backendItem, stock: cachedItem.stock } : backendItem;
        });
        localStorage.setItem('resources', JSON.stringify(storedResources));
        setResources(storedResources);
      } else {
        // First time: store the initial resources
        localStorage.setItem('resources', JSON.stringify(data));
        setResources(data);
      }
      setLoading(false);
    });
  }, []);

  // Auto-navigate to reservations after success
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/history');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  // Filter logic for the Search Bar and Category Tabs
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || res.type === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, resources]);

  const categories = ["All", "Electronic", "Vehicle", "Room", "Equipment"];

  return (
    <div className="px-8 py-10 bg-slate-50/30 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Resource Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Select a resource to begin your reservation.</p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-1">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                style={{transitionDelay: `${idx * 50}ms`}}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors duration-300" size={18} />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 group-hover:shadow-lg"
            />
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => <div key={n} className="h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem] animate-pulse-slow" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((res, idx) => (
              <div key={res.id} style={{animationDelay: `${idx * 50}ms`}}>
                <ResourceCard 
                  resource={res} 
                  onSelect={(resource) => setSelectedResource(resource)} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {selectedResource && (
          <BookingForm
            resource={selectedResource}
            onCancel={() => setSelectedResource(null)}
            onSuccess={() => {
              setSelectedResource(null);
              // Reload resources to reflect stock changes
              const updatedResources = JSON.parse(localStorage.getItem('resources') || '[]');
              setResources(updatedResources);
              setShowSuccess(true);
            }}
          />
        )}

        {/* Success Confirmation Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[150] animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-400 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 animate-in slide-in-from-top-4 duration-500 delay-100 tracking-tight">🎉 Booking Confirmed!</h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold mb-8 animate-in fade-in duration-500 delay-200">Your reservation has been successfully created.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-semibold animate-in fade-in duration-500 delay-300">
                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Redirecting to My Reservations...
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-400">
            <p className="text-slate-400 dark:text-slate-500 font-bold italic">No items found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;