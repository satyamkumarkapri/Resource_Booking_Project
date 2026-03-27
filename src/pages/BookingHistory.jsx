import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Trash2 } from 'lucide-react';

const BookingHistory = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{"role":"user"}');

  // Normalize various stored date formats into DD/MM/YYYY
  const formatDateToDDMMYYYY = (input) => {
    if (!input && input !== 0) return '';
    if (typeof input === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(input)) return input; // already DD/MM/YYYY

    // Try Date constructor / ISO / timestamp
    let dateObj = null;
    if (typeof input === 'number') dateObj = new Date(input);
    else {
      const parsed = new Date(input);
      if (!isNaN(parsed)) dateObj = parsed;
    }
    if (dateObj && !isNaN(dateObj)) return dateObj.toLocaleDateString('en-GB');

    // Fallback: try to parse common dd/mm/yyyy or mm/dd/yyyy with separators
    if (typeof input === 'string') {
      const s = input.replace(/-/g, '/').trim();
      const parts = s.split('/');
      if (parts.length === 3) {
        const [p1, p2, p3] = parts.map(p => p.trim());
        if (p3 && p3.length === 4) {
          const n1 = Number(p1);
          const n2 = Number(p2);
          let day = p1, month = p2, year = p3;
          if (n1 > 12) { day = p1; month = p2; }
          else if (n2 > 12) { day = p2; month = p1; }
          else { day = p1; month = p2; } // default to day-first
          const d = new Date(Number(year), Number(month) - 1, Number(day));
          if (!isNaN(d)) return d.toLocaleDateString('en-GB');
        }
      }
    }

    return String(input);
  };

  const [bookings, setBookings] = useState(() => {
    const rawData = localStorage.getItem('user_bookings');
    try {
      const data = rawData ? JSON.parse(rawData) : [];
      const normalized = Array.isArray(data) ? data.map(item => ({
        ...item,
        date: formatDateToDDMMYYYY(item && item.date)
      })) : [];
      // Persist normalized dates back to localStorage so future loads are consistent
      localStorage.setItem('user_bookings', JSON.stringify(normalized));
      return normalized;
    } catch {
      return [];
    }
  });
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    // Optionally, listen for changes in localStorage from other tabs
    // Otherwise, this effect is not needed for initial load
  }, []);

  const clearHistory = () => {
    if (window.confirm(currentUser.role === 'admin' ? "Clear ALL reservations?" : "Clear your reservations?")) {
      if (currentUser.role === 'admin') {
        localStorage.removeItem('user_bookings');
        setBookings([]);
      } else {
        const remainingBookings = bookings.filter(b => b.accountEmail !== currentUser.email && b.userEmail !== currentUser.email);
        setBookings(remainingBookings);
        localStorage.setItem('user_bookings', JSON.stringify(remainingBookings));
      }
    }
  };

  const cancelBooking = (refToCancel) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      const cancelledBooking = bookings.find(b => b.ref === refToCancel);
      if (!cancelledBooking) return;
      
      // Increase stock when booking is cancelled
      const resources = JSON.parse(localStorage.getItem('resources') || '[]');
      const updatedResources = resources.map(res => {
        if (res.id === cancelledBooking.id) {
          return { ...res, stock: res.stock + 1 };
        }
        return res;
      });
      localStorage.setItem('resources', JSON.stringify(updatedResources));
      
      const updatedBookings = bookings.filter(b => b.ref !== refToCancel);
      setBookings(updatedBookings);
      localStorage.setItem('user_bookings', JSON.stringify(updatedBookings));
    }
  };

  const displayedBookings = currentUser.role === 'admin' 
    ? bookings 
    : bookings.filter(item => item.accountEmail === currentUser.email || item.userEmail === currentUser.email);

  if (displayedBookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center py-20 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2.5rem] transition-colors">
        <p className="text-slate-400 dark:text-slate-500 font-black italic">No reservations found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white italic transition-colors">
            {currentUser.role === 'admin' ? 'All System Reservations' : 'My Reservations'}
          </h2>
          {currentUser.role === 'admin' && (
            <span className="inline-block mt-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Admin Overview Area
            </span>
          )}
        </div>
        <button onClick={clearHistory} className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:text-red-700 transition-colors">
          <Trash2 size={16} /> {currentUser.role === 'admin' ? 'Clear Entire System' : 'Clear All'}
        </button>
      </div>

      {/* Print Bill Modal */}
      {printBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300 overflow-y-auto print:static print:bg-white print:p-0 print:block print-bill">
          {/* Sticky Close Header */}
          <div className="sticky top-0 left-0 right-0 p-4 flex justify-end gap-2 print:hidden z-[110] pointer-events-none">
            <div className="pointer-events-auto flex gap-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-500">
              <button
                onClick={() => setPrintBill(null)}
                className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur border border-slate-200/50 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-md"
              >
              Close
            </button>
            <button
              onClick={async () => {
                try {
                  const element = document.getElementById('bill-pdf-content');
                  if (!element) {
                    alert('Bill content not found');
                    return;
                  }

                  // Import required libraries
                  const html2canvas = (await import('html2canvas')).default;
                  const jsPDF = (await import('jspdf')).jsPDF;

                  // Generate canvas from HTML
                  const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false
                  });

                  // Calculate dimensions
                  const imgWidth = 210; // A4 width in mm
                  const pageHeight = 297; // A4 height in mm
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  let heightLeft = imgHeight;

                  // Create PDF
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  let position = 0;

                  const imgData = canvas.toDataURL('image/png');

                  // Add image to PDF with proper handling of multiple pages
                  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                  heightLeft -= pageHeight;

                  while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                  }

                  // Download PDF directly
                  pdf.save(`${printBill.ref}_BOOKit_Invoice.pdf`);
                  setPrintBill(null);
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  alert('Failed to generate PDF. Please try again.');
                }
              }}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all shadow-lg shadow-blue-500/50"
              >
                📥 PDF
              </button>
            </div>
          </div>

          {/* Modal Centering Wrapper */}
          <div className="min-h-[100vh] flex items-center justify-center p-4 pb-24">
            <div id="bill-pdf-content" className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300 print:shadow-none print:bg-white print:p-8 print:relative print:z-[100] print:mx-auto print:my-auto">
              
              {/* Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none print:opacity-20 opacity-5 z-0">
              <div className="text-center">
                <div className="text-9xl font-black text-blue-600">BOOKit</div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 space-y-6">
              
              {/* Header Section */}
              <div className="border-b-2 border-blue-200 pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-lg">B</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-blue-700">INVOICE</h2>
                      <p className="text-xs text-slate-500 font-bold">BOOKit Resource Booking</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">{printBill.ref}</p>
                    <p className="text-xs text-slate-500">{printBill.date}</p>
                  </div>
                </div>
              </div>

              {/* Customer & Invoice Info */}
              <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Bill To:</p>
                  <p className="text-lg font-black text-slate-800">{printBill.userName}</p>
                  <p className="text-sm text-slate-600">{printBill.userEmail}</p>
                  <p className="text-sm text-slate-600">{printBill.userMobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Invoice Details:</p>
                  <p className="text-sm"><span className="text-slate-500">Date:</span> <span className="font-bold text-slate-800">{printBill.date}</span></p>
                  <p className="text-sm"><span className="text-slate-500">Invoice #:</span> <span className="font-bold text-slate-800">{printBill.ref}</span></p>
                  <p className="text-sm"><span className="text-slate-500">Status:</span> <span className="font-bold text-green-600">{printBill.status}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                      <th className="px-4 py-3 text-left text-xs font-black text-blue-700 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-center text-xs font-black text-blue-700 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-black text-blue-700 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-black text-blue-700 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-800">{printBill.resourceName}</td>
                      <td className="px-4 py-4 text-center text-slate-600">1</td>
                      <td className="px-4 py-4 text-right text-slate-600">₹{printBill.price}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-800">₹{printBill.price}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="border-t-2 border-slate-200 pt-6 space-y-3 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-bold text-slate-800">₹{printBill.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
                      <span className="text-slate-600">GST (18%):</span>
                      <span className="font-bold text-slate-800">₹{(Number(printBill.price) * 0.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
                      <span className="font-black text-lg text-blue-700">Total:</span>
                      <span className="font-black text-2xl text-blue-700">₹{(Number(printBill.price) * 1.18).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="border-t-2 border-slate-200 pt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Notes:</p>
                    <p className="text-sm text-slate-600">Thank you for using BOOKit!</p>
                    <p className="text-sm text-slate-600 mt-2">For support, contact us at:</p>
                    <p className="text-xs text-blue-600 font-bold">25000031975@kluniversity.in</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">QR Code:</p>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`BOOKit|${printBill.ref}|${printBill.resourceName}|${printBill.userName}|${printBill.userMobile}|${printBill.date}|₹${(Number(printBill.price) * 1.18).toFixed(2)}`)}&size=100x100`} 
                      alt="QR Code"
                      className="w-24 h-24 mx-auto border-2 border-blue-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 text-center">
                  <p className="text-xs text-slate-500">©️ 2026 BOOKit - All Rights Reserved</p>
                </div>
              </div>

            </div>
            
            </div>
          </div>

        </div>
      )}

      <div className="space-y-6">
        {displayedBookings.map((item, index) => {
          const gst = (Number(item.price) * 0.18).toFixed(2);
          const total = (Number(item.price) * 1.18).toFixed(2);
          
          let expiryDateStr = "N/A";
          let isExpired = false;
          if (item.date) {
            const parts = item.date.split('/');
            if (parts.length === 3) {
              const d = new Date(parts[2], parts[1] - 1, parts[0]);
              d.setDate(d.getDate() + 5);
              expiryDateStr = d.toLocaleDateString('en-GB');
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (today > d) {
                isExpired = true;
              }
            }
          }

          return (
            <div key={index} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${index * 100}ms`}}>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.resourceName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-blue-200 dark:text-blue-900 text-3xl font-black italic">#</span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter italic">
                    {item.resourceName} #{item.id}
                  </h3>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isExpired ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30 animate-pulse'}`}>
                    {isExpired ? 'EXPIRED' : item.status}
                  </span>
                </div>
                {/* Captured User Info */}
                <div className="mt-3 grid grid-cols-2 gap-2 border-y border-slate-50 dark:border-slate-700 py-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 italic">
                    <User size={12} className="text-blue-500" /> {item.userName}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Phone size={12} className="text-blue-500" /> {item.userMobile}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-4 flex-wrap">
                  <p className="text-blue-600 dark:text-blue-400 font-black text-2xl tracking-tighter italic">₹{item.price}</p>
                  <p className="text-slate-300 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-700/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">Booked: {item.date}</p>
                  <p className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border ${isExpired ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/50' : 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-900/20 dark:border-orange-900/50'}`}>
                    Valid Till: {expiryDateStr}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">GST (18%): ₹{gst} | Total: ₹{total}</p>
                </div>
              </div>
              <div className="flex md:flex-col gap-2">
                <button onClick={() => setPrintBill(item)} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95 transition-all duration-200 hover:shadow-lg shadow-blue-100 dark:shadow-blue-900/30">Print</button>
                <button onClick={() => cancelBooking(item.ref)} className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all duration-200 hover:shadow-lg shadow-red-100 dark:shadow-red-900/30">Cancel</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingHistory;