"use client";

import React, { useState } from 'react';

// Define what a message looks like
interface Message {
  role: 'bot' | 'user';
  text: string;
}

export default function SmartBoPol() {
  const [search, setSearch] = useState<string>("");
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "👋 Hi! I'm your AI assistant. Looking for a place in Polangui?" }
  ]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm checking our 150+ verified listings in Polangui for you..." }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 px-6 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <span>🏠</span> SmartBo-Pol
        </div>
        <div className="hidden lg:flex gap-8 font-medium text-slate-600 items-center">
          <a href="#" className="hover:text-blue-600 transition">Home</a>
          <a href="#" className="hover:text-blue-600 transition">Listings</a>
          <a href="#" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#" className="hover:text-blue-600 transition">About</a>
          <a href="#" className="hover:text-blue-600 transition">Contact</a>
        </div>
        <div className="flex gap-3">
          <button className="hidden sm:block border-2 border-blue-600 text-blue-600 px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition">Log In</button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition shadow-blue-200">Sign Up</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="py-16 md:py-24 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight max-w-4xl mx-auto">
          Find Verified Accommodations in Polangui with AI-Powered Precision
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-lg md:text-xl">
          SmartBo-Pol connects students, workers, and transients to safe, verified rental spaces. No more scams — just trusted listings.
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-2xl border border-slate-100 flex flex-col sm:flex-row mb-12">
          <input 
            type="text" 
            placeholder="Search by barangay, price, or amenities..." 
            className="flex-1 p-4 px-8 rounded-full outline-none text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 sm:py-0 rounded-full font-bold text-lg hover:opacity-90 transition">
            🔍 Search
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-4">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">150+</div>
            <div className="text-slate-500 font-medium">Verified Listings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">50+</div>
            <div className="text-slate-500 font-medium">Landlords</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">98%</div>
            <div className="text-slate-500 font-medium">Satisfied Tenants</div>
          </div>
        </div>
      </header>

      {/* --- WHY CHOOSE US (FEATURES) --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Why Choose SmartBo-Pol?</h2>
        <p className="text-slate-500 text-center mb-12">AI-integrated features designed for your safety and convenience</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: "✅", title: "Verified Listings", desc: "Every property is manually verified by administrators to prevent scams." },
            { icon: "🤖", title: "AI Recommendations", desc: "Get personalized suggestions based on your budget and preferences." },
            { icon: "💬", title: "24/7 Chatbot", desc: "Instant answers to your questions about listings and availability." },
            { icon: "📊", title: "Review Analysis", desc: "AI-powered sentiment analysis of tenant reviews for better decisions." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- LISTINGS SECTION --- */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-3xl font-bold">🏘️ Recent Verified Listings</h2>
            <div className="flex gap-3">
              <select className="border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 outline-none focus:border-blue-500">
                <option>Price: Low to High</option>
                <option>All Barangays</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { price: "₱3,500", loc: "Barangay Centro", tags: ["🛏️ 1 Bed", "🚿 Shared Bath", "📶 WiFi"] },
              { price: "₱5,000", loc: "Barangay Napo", tags: ["🛏️ 2 Beds", "🚿 Own Bath", "❄️ AC"] },
              { price: "₱2,800", loc: "Barangay Poblacion", tags: ["🛏️ 1 Bed", "🍳 Kitchen", "📶 WiFi"] }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:-translate-y-2 transition-all">
                <div className="h-52 bg-slate-100 flex items-center justify-center relative text-slate-400 font-bold">
                  Property Photo
                  <span className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">✓ Verified</span>
                </div>
                <div className="p-6">
                  <div className="text-2xl font-black text-blue-600 mb-1">{item.price} / month</div>
                  <p className="text-slate-600 font-medium mb-4 flex items-center gap-1">📍 {item.loc}, Polangui</p>
                  <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500 border-t pt-4">
                    {item.tags.map(tag => <span key={tag} className="bg-slate-50 px-3 py-1 rounded-md">{tag}</span>)}
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t pt-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                    <div>
                      <div className="text-sm font-bold">Maria Santos</div>
                      <div className="text-xs text-yellow-500">★★★★★ 4.9</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-800 transition">View All Listings →</button>
          </div>
        </div>
      </section>

      {/* --- AI BANNER --- */}
      <section className="mx-6 my-10 max-w-7xl lg:mx-auto bg-gradient-to-r from-blue-600 to-purple-700 rounded-[40px] p-10 md:p-20 text-center text-white shadow-2xl shadow-blue-200">
        <h2 className="text-3xl md:text-5xl font-black mb-6">🧠 AI-Powered Recommendations Just for You</h2>
        <p className="text-blue-50 max-w-2xl mx-auto mb-10 text-lg opacity-90">
          Tell us your budget, preferred location, and must-have amenities. Our AI will find the perfect match — like a personal assistant, 24/7.
        </p>
        <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition shadow-xl">Try AI Matchmaker →</button>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h4 className="text-white font-black text-xl mb-6">SmartBo-Pol</h4>
            <div className="space-y-3 flex flex-col">
              <a href="#" className="hover:text-white transition">About Us</a>
              <a href="#" className="hover:text-white transition">How It Works</a>
              <a href="#" className="hover:text-white transition">Success Stories</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-xl mb-6">For Tenants</h4>
            <div className="space-y-3 flex flex-col">
              <a href="#" className="hover:text-white transition">Search Listings</a>
              <a href="#" className="hover:text-white transition">AI Recommendations</a>
              <a href="#" className="hover:text-white transition">Safety Tips</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-xl mb-6">For Landlords</h4>
            <div className="space-y-3 flex flex-col">
              <a href="#" className="hover:text-white transition">Post a Property</a>
              <a href="#" className="hover:text-white transition">Verification Process</a>
              <a href="#" className="hover:text-white transition">Management Tools</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-xl mb-6">Contact</h4>
            <div className="space-y-3 flex flex-col">
              <span className="flex items-center gap-2">📧 smartbopol@gmail.com</span>
              <span className="flex items-center gap-2">📍 Polangui, Albay</span>
              <span className="flex items-center gap-2">📞 0912 345 6789</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-10 text-center text-sm opacity-60">
          © 2024 SmartBo-Pol: An AI-Integrated Web Platform for Accommodation Search in Polangui. All rights reserved. | Data Privacy Act Compliant
        </div>
      </footer>

      {/* --- CHATBOT --- */}
      <div className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[400px] bg-white shadow-2xl md:rounded-[32px] border border-slate-200 overflow-hidden transition-all z-[100] ${chatOpen ? 'h-[600px]' : 'h-16'}`}>
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white font-bold flex justify-between cursor-pointer items-center"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-200"></div>
            <span className="text-lg">🤖 SmartBo AI Assistant</span>
          </div>
          <span className="text-2xl leading-none">{chatOpen ? '×' : '+'}</span>
        </div>
        
        {chatOpen && (
          <div className="flex flex-col h-[536px]">
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-white flex gap-3">
              <input 
                className="flex-1 border border-slate-200 rounded-full px-6 py-3 outline-none text-sm focus:border-blue-500 shadow-inner bg-slate-50"
                placeholder="Ask about accommodations..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}