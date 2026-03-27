import React, { useState } from 'react';

const BookingForm = ({ resource, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation for 10-digit mobile number
    if (formData.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newReservation = {
      id: resource.id, // Maps to Resource #{item.id}
      resourceName: resource.name,
      price: resource.price || "500", // Fallback prevents ₹NaN error
      userName: formData.fullName,
      userEmail: formData.email,
      accountEmail: currentUser.email,
      userMobile: formData.mobile,
      // Store date in day-month-year format (DD/MM/YYYY)
      // Store date in day-month-year format (DD/MM/YYYY)
      date: new Date().toLocaleDateString('en-GB'),
      // Save resource image so history can show the booked item's picture
      image: resource.image || '',
      status: 'CONFIRMED',
      ref: `BK-${Math.floor(Math.random() * 10000)}`
    };

    // Decrease stock when booking is confirmed
    const resources = JSON.parse(localStorage.getItem('resources') || '[]');
    const updatedResources = resources.map(res => {
      if (res.id === resource.id && res.stock > 0) {
        return { ...res, stock: res.stock - 1 };
      }
      return res;
    });
    localStorage.setItem('resources', JSON.stringify(updatedResources));

    // Save to LocalStorage "temporary address"
    const existing = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    localStorage.setItem('user_bookings', JSON.stringify([newReservation, ...existing]));
    
      onSuccess(); // Triggers navigation to BookingHistory
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 tracking-tight italic">Booking: {resource.name}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
            <input type="text" required placeholder="Satyam Kumar Kapri" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
              value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email ID</label>
            <input type="email" required placeholder="name@university.in" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
            <input type="tel" required placeholder="9876543210" className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-2xl px-4 py-3 text-sm outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-blue-600'}`} 
              value={formData.mobile} onChange={(e) => {
                setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')});
                if(error) setError('');
              }} />
            {error && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 animate-pulse">{error}</p>}
          </div>
        </div>

        <button type="submit" className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
          Confirm Reservation
        </button>
        <button type="button" onClick={onCancel} className="w-full mt-2 text-slate-400 dark:text-slate-500 font-bold py-2 text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-400">Cancel</button>
      </form>
    </div>
  );
};

export default BookingForm;