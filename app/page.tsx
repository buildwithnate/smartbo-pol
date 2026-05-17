"use client";

import { supabase } from './lib/supabase';
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

// Define what a message looks like
interface Message {
  role: 'bot' | 'user';
  text: string;
}

export default function SmartBoPol() {
  // --- 1. SEARCH & CHAT STATES ---
  const [search, setSearch] = useState<string>("");
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "👋 Hi! I'm your AI assistant. Looking for a place in Polangui?" }
  ]);

  // --- 2. AUTH & PROFILE STATES ---
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [userRole, setUserRole] = useState<"tenant" | "landlord">("tenant");

  // --- 3. DATABASE & LISTING STATES ---
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [landlordCount, setLandlordCount] = useState(0); 
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]); 
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // New Listing Form States
  const [newPrice, setNewPrice] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newAmenities, setNewAmenities] = useState("");
  const [newContact, setNewContact] = useState(""); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // --- 4. DATA FETCHING & SESSION MANAGEMENT ---
  const fetchAllData = async () => {
    setLoading(true);
    
    const { data: listingsData, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (listingsError) console.error("Error fetching listings:", listingsError);
    else setListings(listingsData || []);

    if (listingsData) {
      const uniqueLandlords = new Set(listingsData.map(item => item.user_id)).size;
      setLandlordCount(uniqueLandlords);
    }

    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchAllData();

    // Load favorites from local storage
    const savedFavs = localStorage.getItem('smartbo_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 5. MANAGEMENT & ADMIN FUNCTIONS ---
  const handleVerifyListing = async (id: string) => {
    const { error } = await supabase.from('listings').update({ is_verified: true }).eq('id', id);
    if (error) alert("Error verifying: " + error.message);
    else fetchAllData();
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to permanently remove this listing?")) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) alert("Error deleting: " + error.message);
    else fetchAllData();
  };

  // --- 6. FAVORITES LOGIC ---
  const toggleFavorite = (id: string) => {
    let newFavs = [...favorites];
    if (newFavs.includes(id)) {
      newFavs = newFavs.filter(favId => favId !== id);
    } else {
      newFavs.push(id);
    }
    setFavorites(newFavs);
    localStorage.setItem('smartbo_favs', JSON.stringify(newFavs));
  };

  // --- 7. HANDLER FUNCTIONS ---
  const resetAuthFieldsLocal = () => {
    setEmail(""); setPassword(""); setUsername("");
  };

  const handleAuthAction = async () => {
    if (!email || !password || (!isLogin && !username)) return alert("Please fill in all fields.");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Check if the error is because they haven't verified their email
        if (error.message.includes("Email not confirmed")) {
          alert("Please check your inbox and click the verification link before logging in.");
        } else {
          alert(error.message); 
        }
      } else {
        setAuthModalOpen(false);
        resetAuthFieldsLocal();
      }
    } else {
      // Sign Up part
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, role: userRole } }
      });
      if (error) alert(error.message);
      else alert("Sign up successful! A verification link has been sent to your email. Please click it to activate your account.");
    }
  };

  const handlePostListing = async () => {
    if (!newPrice || !newLocation || !imageFile || !newContact) return alert("Please fill all fields!");
    setUploading(true);
    try {
      const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(fileName, imageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('listings').insert([{
        price: Number(newPrice), location: newLocation, amenities: newAmenities.split(',').map(item => item.trim()),
        contact_number: newContact, image_url: publicUrl, is_verified: false, user_id: user?.id 
      }]);
      if (dbError) throw dbError;
      alert("Property posted successfully!");
      setPostModalOpen(false);
      setImageFile(null);
      setNewPrice(""); setNewLocation(""); setNewAmenities(""); setNewContact("");
      fetchAllData();
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userMsg = userInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setUserInput("");
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, listings })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (e) { setMessages(prev => [...prev, { role: 'bot', text: "AI is currently offline." }]); }
  };

  // --- 8. SMART SEARCH & SECURITY FILTER ---
  const filteredListings = listings.filter(item => {
    const term = search.toLowerCase();
    const locMatch = item.location?.toLowerCase().includes(term);
    const priceMatch = item.price?.toString().includes(term);
    const rawAmenities = Array.isArray(item.amenities) ? item.amenities.join(',') : (item.amenities || "");
    const amMatch = rawAmenities.toLowerCase().includes(term);
    const matchesSearch = locMatch || priceMatch || amMatch;

    const isAdmin = user?.user_metadata?.role === 'admin';
    const isOwner = user?.id === item.user_id;
    const isVerified = item.is_verified === true;

    if (showOnlyFavorites && !favorites.includes(item.id)) return false;

    return matchesSearch && (isAdmin || isOwner || isVerified);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans selection:bg-blue-100">

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-2xl font-[900] bg-gradient-to-r from-[#2563eb] to-[#7c3aed] bg-clip-text text-transparent flex items-center gap-2 tracking-tighter italic">
          <span>🏠</span> SmartBo-Pol
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              {(user.user_metadata?.role === 'landlord' || user.user_metadata?.role === 'admin') && (
                <button onClick={() => setPostModalOpen(true)} className="bg-[#22c55e] text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-green-100 transition hover:bg-[#16a34a]">
                  + Post Property
                </button>
              )}
              <div className="flex flex-col items-end leading-none">
                <span className="text-[11px] font-black text-[#2563eb] uppercase tracking-widest">
                  @{user.user_metadata?.username || 'user'}
                </span>
                <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Log Out</button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => { setIsLogin(true); setAuthModalOpen(true); }} className="hidden sm:block text-[#475569] font-bold px-4 text-sm uppercase tracking-widest">Log In</button>
              <button onClick={() => { setIsLogin(false); setAuthModalOpen(true); }} className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white px-7 py-2.5 rounded-full font-bold shadow-xl shadow-blue-200 text-sm uppercase tracking-widest transition hover:scale-105">Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="py-24 md:py-32 px-6 text-center bg-gradient-to-b from-[#f0f4ff] to-white overflow-visible">
        <h1 className="text-5xl md:text-7xl font-[900] mb-8 bg-gradient-to-r from-[#1e3a8a] to-[#5b21b6] bg-clip-text text-transparent leading-[1.25] pb-4 max-w-5xl mx-auto tracking-tighter">
          Find Verified Accommodations in Polangui
        </h1>
        <p className="text-[#475569] max-w-2xl mx-auto mb-12 text-lg md:text-xl font-medium leading-relaxed">
          The official AI-integrated search engine for students, workers, and transients in Polangui, Albay.
        </p>

        <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#e2e8f0] flex flex-col sm:flex-row mb-16 items-center">
          <input
            type="text"
            placeholder="Search by barangay, price, or amenities..."
            className="flex-1 p-5 px-8 rounded-full outline-none text-lg text-black font-medium placeholder:text-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 pr-2">
            {/* FAVORITE TOGGLE ONLY FOR TENANTS */}
            {(user?.user_metadata?.role === 'tenant' || !user) && (
              <button 
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`p-4 rounded-full transition ${showOnlyFavorites ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-slate-50 text-slate-400'}`}
                  title="View Favorites"
              >
                  ❤️
              </button>
            )}
            <button className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white px-10 py-5 rounded-full font-black text-lg shadow-lg">🔍 SEARCH</button>
          </div>
        </div>

        <div className="flex justify-center gap-16 md:gap-24 opacity-80">
          <div className="text-center"><div className="text-4xl font-black text-[#2563eb]">{listings.filter(i => i.is_verified).length}</div><div className="text-[#64748b] font-bold text-[10px] uppercase tracking-[0.2em]">Verified Rooms</div></div>
          <div className="text-center"><div className="text-4xl font-black text-[#2563eb]">{landlordCount}+</div><div className="text-[#64748b] font-bold text-[10px] uppercase tracking-[0.2em]">Active Owners</div></div>
          <div className="text-center"><div className="text-4xl font-black text-[#2563eb]">100%</div><div className="text-[#64748b] font-bold text-[10px] uppercase tracking-[0.2em]">Secure Platform</div></div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { icon: "✅", title: "Human Verified", desc: "No fake listings. Every property is checked by our local Polangui team." },
          { icon: "🤖", title: "AI Precision", desc: "Our bot finds the best prices in specific barangays for you instantly." },
          { icon: "💬", title: "Smart Support", desc: "Chat with SmartBo to get landlord contact details and booking info." },
          { icon: "🛡️", title: "Data Secure", desc: "Compliant with Data Privacy Act to protect both tenants and owners." }
        ].map((f, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-[#e2e8f0] shadow-sm hover:shadow-2xl transition-all hover:border-blue-100 group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
            <h3 className="font-black text-xl mb-3">{f.title}</h3>
            <p className="text-[#64748b] text-sm leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* --- LISTINGS GRID --- */}
      <section className="py-24 px-6 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-14">
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter italic border-l-8 border-blue-600 pl-6 text-left">
                {showOnlyFavorites ? "❤️ My Favorite Stays" : "🏘️ Recently Added Stays"}
            </h2>
            {showOnlyFavorites && (
                <button onClick={() => setShowOnlyFavorites(false)} className="text-blue-600 font-bold text-sm uppercase tracking-widest hover:underline">View All Listings</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
            {loading ? (
              <div className="col-span-full text-center py-32 text-slate-300 font-black text-2xl animate-pulse uppercase tracking-[0.5em]">Fetching Data...</div>
            ) : filteredListings.length === 0 ? (
              <div className="col-span-full text-center py-32 text-slate-400 font-bold italic">
                {showOnlyFavorites ? "You haven't hearted any listings yet!" : `No listings match "${search}"`}
              </div>
            ) : (
              filteredListings.map((item) => (
                <div key={item.id} className="bg-white rounded-[48px] overflow-hidden shadow-2xl border border-[#e2e8f0] hover:-translate-y-4 transition-all group relative">
                  
                  {/* FAVORITE BUTTON (TENANT ONLY) */}
                  {(user?.user_metadata?.role === 'tenant' || !user) && (
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className={`absolute top-6 left-6 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110 active:scale-95 ${favorites.includes(item.id) ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-400'}`}
                    >
                      ❤️
                    </button>
                  )}

                  {/* ADMIN/OWNER CONTROLS (TOP RIGHT) */}
                  <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 items-end">
                    {user?.user_metadata?.role === 'admin' && !item.is_verified && (
                      <button onClick={() => handleVerifyListing(item.id)} className="bg-blue-600 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-xl hover:scale-105 transition">✓ Verify</button>
                    )}
                    {(user?.id === item.user_id || user?.user_metadata?.role === 'admin') && (
                      <button onClick={() => handleDeleteListing(item.id)} className="bg-red-500 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-xl hover:scale-105 transition">🗑 Delete</button>
                    )}
                  </div>

                  <div className="h-64 bg-slate-100 relative overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt="Room" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs tracking-widest uppercase italic">Property Visuals</div>
                    )}
                    {item.is_verified && <span className="absolute bottom-6 right-6 bg-[#22c55e] text-white text-[10px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-lg">Verified Stay</span>}
                  </div>
                  <div className="p-10">
                    <div className="text-4xl font-black text-[#2563eb] mb-2 tracking-tighter">₱{item.price?.toLocaleString()}<span className="text-sm text-slate-300 font-bold tracking-normal">/mo</span></div>
                    <p className="text-[#0f172a] font-black mb-6 uppercase text-sm tracking-widest border-l-4 border-blue-600 pl-3">📍 Barangay {item.location}</p>
                    
                    <a href={`tel:${item.contact_number}`} className="block w-full bg-blue-50 text-blue-600 text-center py-4 rounded-2xl font-[900] text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition mb-6 shadow-sm">
                      📞 Contact Owner
                    </a>

                    <div className="flex flex-wrap gap-2.5 border-t border-[#f1f5f9] pt-8">
                      {(() => {
                        const rawData = Array.isArray(item.amenities) ? item.amenities.join(',') : (item.amenities || "");
                        const cleanList = rawData.replace(/[\[\]"]/g, "").split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag !== "");
                        return cleanList.map((tag: string) => (
                            <span key={tag} className="bg-[#f8fafc] px-4 py-2 rounded-xl text-[10px] font-black text-[#64748b] uppercase border border-[#e2e8f0] shadow-sm">{tag}</span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0f172a] text-[#94a3b8] pt-32 pb-16 px-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">© 2026 SmartBo-Pol Project • Built for the Future</p>
      </footer>

      {/* --- LANDLORD POSTING MODAL --- */}
      {postModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[50px] p-12 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
            <button onClick={() => setPostModalOpen(false)} className="absolute top-12 right-12 text-slate-300 hover:text-black text-3xl font-black transition">×</button>
            <h2 className="text-4xl font-[900] mb-3 tracking-tighter text-[#0f172a]">List Property</h2>
            <p className="text-slate-400 mb-10 font-bold text-sm uppercase tracking-widest">Property Information</p>

            <div className="space-y-6">
              <input type="number" placeholder="Rent Amount" className="w-full border-2 border-[#f1f5f9] rounded-3xl px-8 py-5 outline-none focus:border-[#22c55e] bg-[#f8fafc] text-black font-black text-lg" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
              <input type="text" placeholder="Location (e.g. Barangay Napo)" className="w-full border-2 border-[#f1f5f9] rounded-3xl px-8 py-5 outline-none focus:border-[#22c55e] bg-[#f8fafc] text-black font-black text-lg" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
              <input type="text" placeholder="WiFi, AC, etc." className="w-full border-2 border-[#f1f5f9] rounded-3xl px-8 py-5 outline-none focus:border-[#22c55e] bg-[#f8fafc] text-black font-black text-lg" value={newAmenities} onChange={(e) => setNewAmenities(e.target.value)} />
              <input type="text" placeholder="Contact Number" className="w-full border-2 border-[#f1f5f9] rounded-3xl px-8 py-5 outline-none focus:border-[#22c55e] bg-[#f8fafc] text-black font-black text-lg" value={newContact} onChange={(e) => setNewContact(e.target.value)} />
              
              {/* STYLIZED UPLOAD AREA */}
              <div className="relative group">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className={`border-4 border-dashed rounded-[32px] p-10 text-center transition-all ${imageFile ? 'bg-green-50 border-green-400' : 'bg-slate-50 border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50'}`}>
                    <span className="text-3xl block mb-2">{imageFile ? "✅" : "📸"}</span>
                    <p className="font-black uppercase tracking-widest text-sm text-slate-600">
                        {imageFile ? imageFile.name : "Upload Property Picture"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Click or drag your image here</p>
                </div>
              </div>

              <button onClick={handlePostListing} disabled={uploading} className="w-full bg-[#22c55e] text-white font-[900] py-6 rounded-3xl hover:opacity-90 transition mt-6 uppercase tracking-[0.2em] shadow-2xl shadow-green-200 disabled:opacity-50">
                {uploading ? "UPLOADING DATA..." : "SUBMIT LISTING"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AUTH MODAL --- */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-lg z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[50px] p-12 shadow-2xl relative text-[#0f172a]">
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-12 right-12 text-slate-300 hover:text-black text-3xl font-black transition">×</button>
            <h2 className="text-4xl font-[900] mb-3 tracking-tighter text-center">{isLogin ? "Welcome" : "Join Us"}</h2>

            {!isLogin && (
              <div className="flex bg-[#f1f5f9] p-1.5 rounded-2xl mb-8 mt-8 border border-[#e2e8f0]">
                <button onClick={() => setUserRole("tenant")} className={`flex-1 py-3 rounded-xl text-xs font-[900] uppercase tracking-widest transition ${userRole === 'tenant' ? 'bg-white shadow-md text-[#2563eb]' : 'text-slate-400'}`}>Tenant</button>
                <button onClick={() => setUserRole("landlord")} className={`flex-1 py-3 rounded-xl text-xs font-[900] uppercase tracking-widest transition ${userRole === 'landlord' ? 'bg-white shadow-md text-[#2563eb]' : 'text-slate-400'}`}>Landlord</button>
              </div>
            )}

            <div className="space-y-5 mt-6">
              {!isLogin && (
                <input type="text" placeholder="Username" className="w-full border-2 border-[#f1f5f9] rounded-3xl px-7 py-4 outline-none focus:border-[#2563eb] bg-[#f8fafc] text-black font-bold shadow-inner" value={username} onChange={(e) => setUsername(e.target.value)} />
              )}
              <input type="email" placeholder="Email Address" className="w-full border-2 border-[#f1f5f9] rounded-3xl px-7 py-4 outline-none focus:border-[#2563eb] bg-[#f8fafc] text-black font-bold shadow-inner" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" className="w-full border-2 border-[#f1f5f9] rounded-3xl px-7 py-4 outline-none focus:border-[#2563eb] bg-[#f8fafc] text-black font-bold shadow-inner" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleAuthAction} className="w-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-black py-5 rounded-3xl hover:opacity-90 transition mt-6 shadow-2xl shadow-blue-200 uppercase tracking-widest">
                {isLogin ? "LOG IN" : "CREATE ACCOUNT"}
              </button>
              <button onClick={() => { setIsLogin(!isLogin); resetAuthFieldsLocal(); }} className="w-full text-[#2563eb] font-black text-[10px] uppercase tracking-[0.2em] mt-8 hover:underline text-center underline-offset-4">
                {isLogin ? "New here? Create an Account" : "Already have account? Log In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AI CHATBOT --- */}
      <div className={`fixed bottom-0 right-0 md:bottom-10 md:right-10 w-full md:w-[400px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)] md:rounded-[50px] border border-[#e2e8f0] overflow-hidden transition-all z-[100] ${chatOpen ? 'h-[650px]' : 'h-20'}`}>
        <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] p-6 text-white font-black flex justify-between cursor-pointer items-center" onClick={() => setChatOpen(!chatOpen)}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_15px_#22c55e]"></div>
            <span className="uppercase tracking-[0.2em] text-xs">SmartBo-Pol AI Assistant</span>
          </div>
          <span className="text-3xl leading-none">{chatOpen ? '×' : '+'}</span>
        </div>
        {chatOpen && (
          <div className="flex flex-col h-[570px]">
            <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#f8fafc]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[30px] text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-[#2563eb] text-white rounded-tr-none shadow-xl' : 'bg-white border text-slate-800 rounded-tl-none border-slate-100 shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-white flex gap-4">
              <input className="flex-1 border-2 border-[#f1f5f9] rounded-full px-8 py-4 text-sm outline-none bg-[#f8fafc] text-black font-bold focus:border-[#2563eb]" placeholder="Ask anything about Polangui stays..." value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} className="bg-[#2563eb] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition">➤</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const resetAuthFields = (setEmail: any, setPassword: any, setUsername: any) => {
    setEmail(""); setPassword(""); setUsername("");
};