export const api = {
  getResources: async () => {
    // Return mock data for the dashboard so the app renders
    return [
      { id: 1, name: "Conference Room A", type: "Room", price: "500", stock: 2, image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=400&q=80" },
      { id: 2, name: "Dell XPS 15", type: "Electronic", price: "32000", stock: 5, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80" },
      { id: 3, name: "Toyota Innova", type: "Vehicle", price: "2000000", stock: 1, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80" },
      { id: 4, name: "Meeting Pod", type: "Room", price: "35000", stock: 4, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" },
      { id: 5, name: "Sony A7III Camera", type: "Equipment", price: "8000", stock: 0, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80" },
      { id: 6, name: "MacBook Pro M3", type: "Electronic", price: "150000", stock: 3, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80" },
      { id: 7, name: "iPad Pro 12.9\"", type: "Electronic", price: "90000", stock: 8, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80" },
      { id: 8, name: "Tesla Model 3", type: "Vehicle", price: "4000000", stock: 2, image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400&q=80" },
      { id: 9, name: "Epson Projector 4K", type: "Equipment", price: "40000", stock: 6, image: "https://shorturl.at/Qd6Bl" },
      { id: 10, name: "Main Auditorium", type: "Room", price: "500000", stock: 1, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80" },
      { id: 11, name: "Manfrotto Tripod", type: "Equipment", price: "15000", stock: 12, image: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=400&q=80" },
      { id: 12, name: "Hyundai Creta", type: "Vehicle", price: "1500000", stock: 4, image: "https://shorturl.at/pdqCN" },
      { id: 13, name: "Yamaha R15", type: "Vehicle", price: "100000", stock: 6, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80" },
      { id: 14, name: "Logitech MX Master 3", type: "Electronic", price: "1000", stock: 15, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80" },
      { id: 15, name: "Small Discussion Room", type: "Room", price: "2000", stock: 3, image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80" },
      { id: 16, name: "Studio Ring Light", type: "Equipment", price: "800", stock: 20, image: "https://shorturl.at/ChbMv" },
      { id: 17, name: "PlayStation 5", type: "Electronic", price: "5000", stock: 2, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80" },
      { id: 18, name: "Ford Mustang GT", type: "Vehicle", price: "6000000", stock: 1, image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80" }
    ];
  },
  loginUser: async (email, password, role, name) => {
    // Simulating a network delay with async/await
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (role === 'admin' && password === 'admin') {
      return { email, name: 'Administrator', role: 'admin' };
    } else if (role === 'user' && password === 'password') {
      return { email, name: name || email.split('@')[0], role: 'user' };
    } else {
      throw new Error(`Invalid password for ${role} role!`);
    }
  }
};
