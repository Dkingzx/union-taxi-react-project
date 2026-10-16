import { useEffect, useState } from 'react';

// 1. BACKEND API BASE URL: Grab from .env or fallback to localhost
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [textScale, setTextScale] = useState(100);
  const [selectedCarRate, setSelectedCarRate] = useState(13);
  const [selectedCarBase, setSelectedCarBase] = useState(250);
  const [selectedCarName, setSelectedCarName] = useState('Maruti Swift Dzire');
  const [calcKm, setCalcKm] = useState(150);
  const [driverBata, setDriverBata] = useState(true);
  const [nightCharge, setNightCharge] = useState(false);
  const [tripType, setTripType] = useState('outstation');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    pickup: 'Bengaluru', dropoff: 'Mysore', car: 'Maruti Swift Dzire', price: '₹2,500'
  });
  const [introVisible, setIntroVisible] = useState(true);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [heroCar, setHeroCar] = useState('dzire');

  const total = calcKm * selectedCarRate + selectedCarBase + (driverBata ? 300 : 0) + (nightCharge ? 250 : 0);

  const changeTextScale = (delta) => {
    const next = Math.min(Math.max(textScale + delta, 100), 130);
    setTextScale(next);
    document.documentElement.setAttribute('data-text-scale', String(next));
  };

  const closeIntro = () => setIntroVisible(false);
  const replayIntro = () => setIntroVisible(true);

  const setCalcCar = (e, carType, ratePerKm, basePrice) => {
    const names = {
      dzire: 'Maruti Swift Dzire',
      swift: 'Maruti Swift',
      indica: 'Tata Indica',
      innova: 'Toyota Innova'
    };
    setSelectedCarRate(ratePerKm);
    setSelectedCarBase(basePrice);
    setSelectedCarName(names[carType] || 'Maruti Swift Dzire');
  };

  const selectFleetCar = (type) => setHeroCar(type);

  // 2. UPDATED BOOKING HANDLER WITH BACKEND FETCH CALL
  const handleHeroBooking = async (e) => {
    e.preventDefault();
    const carNames = {
      dzire: 'Maruti Suzuki Swift Dzire (Sedan - ₹13/km)',
      swift: 'Maruti Suzuki Swift (Hatchback - ₹12/km)',
      indica: 'Tata Indica (Budget Hatch - ₹12/km)',
      indigo: 'Tata Indigo (Economy Sedan - ₹13/km)',
      innova: 'Toyota Innova (7-Seater - ₹18/km)'
    };

    const bookingPayload = {
      tripType,
      pickup: pickup || 'City Center',
      dropoff: dropoff || 'Destination',
      car: carNames[heroCar],
      travelDate: document.getElementById('hero-date')?.value || '',
      pickupTime: document.getElementById('hero-time')?.value || '',
      price: 'Guaranteed Fixed Price'
    };

    // Send payload to Express Backend
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });
      const result = await response.json();
      console.log('Backend response:', result);
    } catch (error) {
      console.error('Error submitting booking to backend:', error);
    }

    setModalData({
      pickup: bookingPayload.pickup,
      dropoff: bookingPayload.dropoff,
      car: bookingPayload.car,
      price: '₹ Guaranteed Fixed Price'
    });
    setModalOpen(true);
  };

  // 3. UPDATED CALCULATED FARE HANDLER WITH BACKEND FETCH CALL
  const applyCalculatedFare = async () => {
    const bookingPayload = {
      tripType: 'calculated_fare',
      pickup: 'Selected Pickup Location',
      dropoff: `Destination (${calcKm} Km)`,
      car: selectedCarName,
      price: `₹${total}`
    };

    // Send payload to Express Backend
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });
      const result = await response.json();
      console.log('Backend response:', result);
    } catch (error) {
      console.error('Error submitting booking to backend:', error);
    }

    setModalData({
      pickup: bookingPayload.pickup,
      dropoff: bookingPayload.dropoff,
      car: bookingPayload.car,
      price: bookingPayload.price
    });
    setModalOpen(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-text-scale', String(textScale));
    const today = new Date().toISOString().split('T')[0];
    const dateElem = document.getElementById('hero-date');
    if (dateElem && !dateElem.value) dateElem.value = today;

    const revealElements = document.querySelectorAll('.reveal-element');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolledPercent = height > 0 ? (winScroll / height) * 100 : 0;
      const progressBar = document.getElementById('road-progress-bar');
      if (progressBar) progressBar.style.width = `${scrolledPercent}%`;

      const isScrollingDown = winScroll > lastScrollY;
      lastScrollY = winScroll;
      const cab1 = document.getElementById('road-cab-1');
      const cab2 = document.getElementById('road-cab-2');
      const cab1Pos = (scrolledPercent * 1.2) % 90;
      const cab2Pos = 90 - ((scrolledPercent * 1.1) % 90);
      if (cab1) {
        cab1.style.left = `${cab1Pos}%`;
        cab1.style.transform = isScrollingDown ? 'scaleX(1)' : 'scaleX(-1)';
      }
      if (cab2) {
        cab2.style.left = `${cab2Pos}%`;
        cab2.style.transform = isScrollingDown ? 'scaleX(-1)' : 'scaleX(1)';
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [textScale]);

  return (
    <>
      {introVisible && (
        <div id="intro-video-overlay" className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 transition-opacity duration-700">
          <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-yellow bg-black flex flex-col justify-between p-4 sm:p-6">
            <div className="relative z-20 flex justify-between items-center bg-black/60 p-2 sm:p-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img src="/assets/union-taxi-logo.jpeg" alt="Union Taxi Official Logo" className="h-8 sm:h-10 w-auto rounded-lg object-contain bg-white p-1" />
                <div>
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide block">UNION TAXI</span>
                  <span className="text-[10px] font-bold text-amber-400 hidden sm:block">Lets Ride Into Your Future Together</span>
                </div>
              </div>
              <button onClick={closeIntro} className="btn-tactile-primary px-5 py-2.5 text-xs flex items-center gap-2 shadow-glow">
                <span>Skip to Website</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <video id="union-intro-video" autoPlay muted loop playsInline className="w-full h-full object-cover">
                <source src="/assets/union-intro-video.mp4" type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Top Scroll Bar Driving Taxi Indicator */}
      <div id="road-progress-container">
        <div id="road-progress-bar">
          <svg id="scrolling-top-taxi" viewBox="0 0 120 60" className="drop-shadow">
            <path d="M10 38 Q15 22 35 20 L75 20 Q95 22 105 32 L112 38 Q118 42 118 48 L118 50 L2 50 L2 45 Q2 38 10 38 Z" fill="#FFC72C" stroke="#111827" strokeWidth="2"/>
            <path d="M35 22 L52 22 L52 34 L25 34 Z" fill="#111827"/>
            <path d="M58 22 L75 22 L85 34 L58 34 Z" fill="#111827"/>
            <rect x="45" y="14" width="22" height="6" fill="#111827" rx="2"/>
            <text x="47" y="19" fill="#FFC72C" fontSize="5" fontWeight="bold">TAXI</text>
            <circle cx="28" cy="50" r="8" fill="#111827"/>
            <circle cx="28" cy="50" r="3" fill="#E5E7EB"/>
            <circle cx="92" cy="50" r="8" fill="#111827"/>
            <circle cx="92" cy="50" r="3" fill="#E5E7EB"/>
          </svg>
        </div>
      </div>

      <header className="fixed top-0 left-0 w-full z-40 transition-all duration-300 pt-1 pb-3 px-3 sm:px-6" id="navbar">
        <div className="taxi-checker-strip rounded-t-xl"></div>
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-b-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-tactile border border-brand-border">
          <a href="#" className="flex items-center gap-3 group">
            <img src="/assets/union-taxi-logo.jpeg" alt="Union Taxi Logo" className="h-10 sm:h-12 w-auto object-contain rounded-lg p-0.5 border border-amber-300 bg-white shadow-sm group-hover:scale-105 transition-transform" />
            <div className="hidden sm:block">
              <span className="text-base sm:text-lg font-black text-brand-text tracking-tight block leading-tight">UNION TAXI</span>
              <span className="text-[10px] font-extrabold text-amber-700 block">Lets Ride Into Your Future Together</span>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-6 font-extrabold text-xs sm:text-sm text-brand-text">
            <a href="#home" className="hover:text-amber-600 transition-colors py-1">Home</a>
            <a href="#booking" className="hover:text-amber-600 transition-colors py-1">Book Ride</a>
            <a href="#fleet" className="hover:text-amber-600 transition-colors py-1">Indian Fleet</a>
            <a href="#calculator" className="hover:text-amber-600 transition-colors py-1">Fare Calculator</a>
            <a href="#services" className="hover:text-amber-600 transition-colors py-1">Services</a>
            <a href="#faq" className="hover:text-amber-600 transition-colors py-1">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="tel:+919876543210" className="btn-tactile-primary px-4 py-2 text-xs sm:text-sm flex items-center gap-1.5">
              <i className="fa-solid fa-phone"></i>
              <span>Call Cab</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-36 pb-12 md:pt-44 md:pb-20 bg-gradient-to-b from-amber-50/80 via-white to-brand-lightBg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left reveal-element">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
                <i className="fa-solid fa-handshake text-amber-600 text-sm"></i>
                <span>"Lets Ride Into Your Future Together"</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-text leading-tight tracking-tight">
                Reliable Indian Cabs <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600">
                  For Local & Outstation Journeys.
                </span>
              </h1>
              <p className="text-brand-muted text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Comfortable passenger cabs across India. Sanitised vehicles, verified drivers, transparent Indian Rupee (₹) billing, and senior citizen priority support.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="relative rounded-2xl overflow-hidden shadow-sm border-2 border-white h-28 sm:h-36 group">
                  <img src="https://content.jdmagicbox.com/comp/service_catalogue/sedan-car-on-rent-079pxx79.xx79.211109171553.f2h3-f6e08ax.jpg" alt="Maruti Swift Dzire Cab" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/80 backdrop-blur-sm text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded text-center">All Kinds of Cabs are Available</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-sm border-2 border-white h-28 sm:h-36 group">
                  <img src="/taxi-drivers.png" alt="Verified Drivers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/80 backdrop-blur-sm text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded text-center">Verified Drivers</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-sm border-2 border-white h-28 sm:h-36 group">
                  <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80" alt="Family & Senior Trips" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/80 backdrop-blur-sm text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded text-center">Family & Senior Trips</span>
                </div>
              </div>
            </div>

            {/* Quick Booking Form */}
            <div className="lg:col-span-5 reveal-element">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-yellow shadow-tactile relative" id="booking">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl font-extrabold text-brand-text">Book Union Cab</h2>
                    <p className="text-xs font-semibold text-gray-500">Fixed Fare Estimate in ₹</p>
                  </div>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    24/7 Available
                  </span>
                </div>
                <form id="hero-booking-form" onSubmit={handleHeroBooking} className="space-y-4">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-2xl">
                    <button type="button" onClick={() => setTripType('outstation')} id="btn-outstation" className={`trip-type-btn py-2 text-xs font-black rounded-xl ${tripType === 'outstation' ? 'bg-brand-yellow text-black shadow-sm' : 'text-gray-600'}`}>
                      Outstation
                    </button>
                    <button type="button" onClick={() => setTripType('local')} id="btn-local" className={`trip-type-btn py-2 text-xs font-bold ${tripType === 'local' ? 'bg-brand-yellow text-black shadow-sm' : 'text-gray-600'}`}>
                      Local Hourly
                    </button>
                    <button type="button" onClick={() => setTripType('airport')} id="btn-airport" className={`trip-type-btn py-2 text-xs font-bold ${tripType === 'airport' ? 'bg-brand-yellow text-black shadow-sm' : 'text-gray-600'}`}>
                      Airport Drop
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-brand-text mb-1">Pick-up Location</label>
                    <div className="relative">
                      <i className="fa-solid fa-circle-dot absolute left-3.5 top-3.5 text-amber-500 text-sm"></i>
                      <input type="text" required id="hero-pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Enter Pickup City or Address" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text font-bold focus:outline-none focus:border-brand-yellow" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-brand-text mb-1">Drop-off Location</label>
                    <div className="relative">
                      <i className="fa-solid fa-location-dot absolute left-3.5 top-3.5 text-red-500 text-sm"></i>
                      <input type="text" required id="hero-dropoff" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Enter Destination City" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text font-bold focus:outline-none focus:border-brand-yellow" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-brand-text mb-1">Travel Date</label>
                      <input type="date" required id="hero-date" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-yellow" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-brand-text mb-1">Pickup Time</label>
                      <input type="time" required id="hero-time" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-yellow" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-brand-text mb-1">Select Indian Cab Model</label>
                    <select id="hero-car-select" value={heroCar} onChange={(e) => setHeroCar(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-yellow">
                      <option value="dzire">Maruti Suzuki Swift Dzire (Sedan - ₹13/km)</option>
                      <option value="swift">Maruti Suzuki Swift (Hatchback - ₹12/km)</option>
                      <option value="indica">Tata Indica (Budget Hatch - ₹12/km)</option>
                      <option value="indigo">Tata Indigo (Economy Sedan - ₹13/km)</option>
                      <option value="innova">Toyota Innova (7-Seater - ₹18/km)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-tactile-primary w-full py-4 text-base font-black flex items-center justify-center gap-2 mt-2">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Get Fixed Price & Confirm Cab</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Scroll Road Lanes */}
      <div className="road-divider">
        <div className="road-dashes"></div>
        <div className="scroll-cab" id="road-cab-1" style={{ left: "10%" }}>
          <svg viewBox="0 0 120 60" className="h-9 w-auto drop-shadow-md">
            <path d="M10 38 Q15 22 35 20 L75 20 Q95 22 105 32 L112 38 Q118 42 118 48 L118 50 L2 50 L2 45 Q2 38 10 38 Z" fill="#FFC72C" stroke="#111827" strokeWidth="2"/>
            <path d="M35 22 L52 22 L52 34 L25 34 Z" fill="#111827"/>
            <path d="M58 22 L75 22 L85 34 L58 34 Z" fill="#111827"/>
            <rect x="45" y="13" width="24" height="7" fill="#111827" rx="2"/>
            <text x="47" y="18" fill="#FFC72C" fontSize="5" fontWeight="900">SWIFT</text>
            <circle cx="28" cy="50" r="8" fill="#111827"/>
            <circle cx="28" cy="50" r="3" fill="#E5E7EB"/>
            <circle cx="92" cy="50" r="8" fill="#111827"/>
            <circle cx="92" cy="50" r="3" fill="#E5E7EB"/>
          </svg>
        </div>
        <div className="scroll-cab" id="road-cab-2" style={{ left: "70%", transform: "scaleX(-1)" }}>
          <svg viewBox="0 0 120 60" className="h-9 w-auto drop-shadow-md">
            <path d="M10 38 Q15 22 35 20 L75 20 Q95 22 105 32 L112 38 Q118 42 118 48 L118 50 L2 50 L2 45 Q2 38 10 38 Z" fill="#111827" stroke="#FFC72C" strokeWidth="2"/>
            <path d="M35 22 L52 22 L52 34 L25 34 Z" fill="#FFC72C"/>
            <path d="M58 22 L75 22 L85 34 L58 34 Z" fill="#FFC72C"/>
            <rect x="45" y="13" width="24" height="7" fill="#FFC72C" rx="2"/>
            <text x="48" y="18" fill="#111827" fontSize="5" fontWeight="900">DZIRE</text>
            <circle cx="28" cy="50" r="8" fill="#FFC72C"/>
            <circle cx="28" cy="50" r="3" fill="#111827"/>
            <circle cx="92" cy="50" r="8" fill="#FFC72C"/>
            <circle cx="92" cy="50" r="3" fill="#111827"/>
          </svg>
        </div>
      </div>

      {/* Fleet Section */}
      <section id="fleet" className="py-16 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 reveal-element">
            <span className="text-amber-900 text-xs font-black uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300">Strictly Indian Cabs</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-text mt-3 mb-3">Our Popular Indian Fleet & Per-Km Rates</h2>
            <p className="text-brand-muted text-sm sm:text-base font-medium">Clean, fuel-efficient Maruti Swift, Dzire, Tata Indica, Indigo & Toyota Innova cabs with verified drivers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-element">
            <div className="bg-amber-50/70 rounded-3xl p-6 border-2 border-brand-yellow flex flex-col justify-between shadow-tactile transition-all hover:-translate-y-1">
              <div>
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-amber-300 group">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9HLF9j1TOEKgmlmUKUpdLyg5lkKA2zTiPVoEYBbiX3Q&s=10" alt="Maruti Swift Dzire" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">MOST POPULAR SEDAN</span>
                </div>
                <h3 className="text-lg font-black text-brand-text">Maruti Suzuki Swift Dzire</h3>
                <p className="text-xs font-bold text-amber-700 mb-3">Air Conditioned Sedan Cab</p>
                <div className="space-y-2 text-xs font-semibold text-gray-700 border-t border-amber-200 pt-3 mb-4">
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-user-group text-amber-600 w-5"></i> Passengers:</span> <span className="font-bold text-black">4 Adults</span></div>
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-suitcase text-amber-600 w-5"></i> Boot Space:</span> <span className="font-bold text-black">3 Large Bags</span></div>
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-snowflake text-amber-600 w-5"></i> Air Conditioned:</span> <span className="font-bold text-black">Yes</span></div>
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-3 bg-white p-2.5 rounded-xl border border-amber-200">
                  <span className="text-xs font-bold text-gray-600">Per Km Fare</span>
                  <span className="text-2xl font-black text-amber-800">₹13 <span className="text-xs text-gray-600 font-normal">/km</span></span>
                </div>
                <a href="#booking" onClick={() => selectFleetCar('dzire')} className="btn-tactile-primary w-full py-3 text-xs flex items-center justify-center gap-1">
                  <span>Book Swift Dzire</span> <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 flex flex-col justify-between transition-all hover:shadow-tactile hover:-translate-y-1">
              <div>
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-gray-200 group">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbhuxY9xNAE1hERefKo7jPSQmofXeFim30BCQoVR6y6w&s=10" alt="Maruti Suzuki Swift" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full">ECONOMY HATCH</span>
                </div>
                <h3 className="text-lg font-black text-brand-text">Maruti Suzuki Swift</h3>
                <p className="text-xs font-bold text-amber-700 mb-3">Compact Hatchback Cab</p>
                <div className="space-y-2 text-xs font-semibold text-gray-600 border-t border-gray-200 pt-3 mb-4">
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-user-group text-amber-500 w-5"></i> Passengers:</span> <span className="font-bold text-black">4 Passengers</span></div>
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-suitcase text-amber-500 w-5"></i> Luggage:</span> <span className="font-bold text-black">2 Medium Bags</span></div>
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-snowflake text-amber-500 w-5"></i> Air Conditioned:</span> <span className="font-bold text-black">Yes</span></div>
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-3 bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500">Per Km Fare</span>
                  <span className="text-2xl font-black text-brand-text">₹12 <span className="text-xs text-gray-500 font-normal">/km</span></span>
                </div>
                <a href="#booking" onClick={() => selectFleetCar('swift')} className="btn-tactile-secondary w-full py-3 text-xs flex items-center justify-center gap-1">
                  <span>Book Swift</span> <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 flex flex-col justify-between transition-all hover:shadow-tactile hover:-translate-y-1">
              <div>
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-gray-200 group">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQddEVBmRwLt0dbqCAE_buKJOBEpi9jCouFvjzBVYBgKg&s=10" alt="Tata Indica Indigo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 right-2 bg-blue-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full">CLASSIC FLEET</span>
                </div>
                <h3 className="text-lg font-black text-brand-text">Tata Indica / Indigo</h3>
                <p className="text-xs font-bold text-amber-700 mb-3">Budget Passenger Cab</p>
                <div className="space-y-2 text-xs font-semibold text-gray-600 border-t border-gray-200 pt-3 mb-4">
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-user-group text-amber-500 w-5"></i> Passengers:</span> <span className="font-bold text-black">4 Passengers</span></div>
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-suitcase text-amber-500 w-5"></i> Luggage:</span> <span className="font-bold text-black">3 Bags</span></div>
                  <div className="flex items-center justify-between"><span><i className="fa-solid fa-snowflake text-amber-500 w-5"></i> Air Conditioned:</span> <span className="font-bold text-black">Yes</span></div>
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-3 bg-white p-2.5 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500">Per Km Fare</span>
                  <span className="text-2xl font-black text-brand-text">₹12 - ₹13 <span className="text-xs text-gray-500 font-normal">/km</span></span>
                </div>
                <a href="#booking" onClick={() => selectFleetCar('indica')} className="btn-tactile-secondary w-full py-3 text-xs flex items-center justify-center gap-1">
                  <span>Book Indica / Indigo</span> <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-16 bg-brand-lightBg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 reveal-element">
            <span className="text-amber-900 text-xs font-black uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300">Transparent Upfront Billing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-text mt-3 mb-3">Indian Rupee (₹) Fare Calculator</h2>
            <p className="text-brand-muted text-sm sm:text-base font-medium">Adjust trip distance in kilometers and select your preferred Indian cab to calculate total trip fare in ₹ Rupees.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch reveal-element">
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-tactile flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-brand-text mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-amber-500"></i> Trip Distance & Vehicle Selection
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-extrabold mb-2">
                      <span className="text-brand-text">Estimated Distance (Km):</span>
                      <span className="text-amber-700 text-lg font-black"><span id="calc-km-val">{calcKm}</span> Km</span>
                    </div>
                    <input type="range" id="calc-km" min="10" max="500" value={calcKm} step="10" onChange={(e) => setCalcKm(Number(e.currentTarget.value))} className="w-full accent-amber-500 h-3 bg-gray-200 rounded-lg cursor-pointer"/>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-brand-text mb-2">Choose Cab Model:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={(e) => setCalcCar(e, 'dzire', 13, 250)} className="calc-car-btn active-calc-car p-3 rounded-2xl border-2 border-brand-yellow bg-amber-50 text-left font-bold transition-all">
                        <span className="text-xs font-black block">Swift Dzire</span>
                        <span className="text-[11px] text-amber-700 font-extrabold">₹13 / km</span>
                      </button>
                      <button type="button" onClick={(e) => setCalcCar(e, 'swift', 12, 220)} className="calc-car-btn p-3 rounded-2xl border-2 border-gray-200 text-left font-bold transition-all hover:border-amber-400">
                        <span className="text-xs font-black block">Maruti Swift</span>
                        <span className="text-[11px] text-amber-700 font-extrabold">₹12 / km</span>
                      </button>
                      <button type="button" onClick={(e) => setCalcCar(e, 'indica', 12, 220)} className="calc-car-btn p-3 rounded-2xl border-2 border-gray-200 text-left font-bold transition-all hover:border-amber-400">
                        <span className="text-xs font-black block">Tata Indica</span>
                        <span className="text-[11px] text-amber-700 font-extrabold">₹12 / km</span>
                      </button>
                      <button type="button" onClick={(e) => setCalcCar(e, 'innova', 18, 400)} className="calc-car-btn p-3 rounded-2xl border-2 border-gray-200 text-left font-bold transition-all hover:border-amber-400">
                        <span className="text-xs font-black block">Toyota Innova</span>
                        <span className="text-[11px] text-amber-700 font-extrabold">₹18 / km</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 cursor-pointer">
                      <input type="checkbox" id="calc-driver-chk" checked={driverBata} onChange={(e) => setDriverBata(e.currentTarget.checked)} className="accent-amber-500 w-4 h-4"/>
                      <span>Driver Bata (+₹300)</span>
                    </label>
                    <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 cursor-pointer">
                      <input type="checkbox" id="calc-night-chk" checked={nightCharge} onChange={(e) => setNightCharge(e.currentTarget.checked)} className="accent-amber-500 w-4 h-4"/>
                      <span>Night Charge (+₹250)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-6 sm:p-8 rounded-3xl text-white shadow-glow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full">Estimated Fare</span>
                  <span className="text-xs bg-white text-black font-extrabold px-3 py-1 rounded-full">Guaranteed Fixed Fare</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-100 mb-1">Total Trip Price</p>
                  <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                    ₹<span id="calc-total-rupees">{total}</span>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm border-t border-white/20 pt-4 font-semibold">
                  <div className="flex justify-between">
                    <span>Distance Charge ({calcKm} km @ ₹{selectedCarRate}/km)</span>
                    <span className="font-bold">₹{calcKm * selectedCarRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Fixed Charge</span>
                    <span className="font-bold">₹{selectedCarBase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Driver Allowance (Bata)</span>
                    <span className="font-bold">₹{driverBata ? 300 : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Night Allowance (10 PM - 6 AM)</span>
                    <span className="font-bold">₹{nightCharge ? 250 : 0}</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <a href="#booking" onClick={() => applyCalculatedFare()} className="w-full bg-white text-gray-950 font-black py-4 rounded-full text-base transition-all shadow-xl hover:bg-gray-100 flex items-center justify-center gap-2">
                  <span>Book Cab at ₹<span id="calc-btn-fare">{total}</span></span>
                  <i className="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 reveal-element">
            <span className="text-amber-900 text-xs font-black uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300">Why Choose Union Taxi</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-text mt-3 mb-3">Designed for Families, Youth & Grandparents</h2>
            <p className="text-brand-muted text-sm sm:text-base font-medium">Sanitised vehicles, courteous drivers, 24/7 phone booking, and zero hidden night charges.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal-element">
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black text-xl flex items-center justify-center shadow-md">
                <i className="fa-solid fa-heart-pulse"></i>
              </div>
              <h3 className="text-lg font-black text-brand-text">Senior Citizen Priority</h3>
              <p className="text-xs font-semibold text-gray-600 leading-relaxed">Doorstep assistance for grandparents and older passengers, patient local drivers, and phone dispatch support.</p>
            </div>
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black text-xl flex items-center justify-center shadow-md">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="text-lg font-black text-brand-text">GPS Tracked & Safe</h3>
              <p className="text-xs font-semibold text-gray-600 leading-relaxed">Every Maruti Swift and Dzire cab in our fleet is GPS tracked with 24/7 central dispatch monitoring for complete peace of mind.</p>
            </div>
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black font-black text-xl flex items-center justify-center shadow-md">
                <i className="fa-solid fa-receipt"></i>
              </div>
              <h3 className="text-lg font-black text-brand-text">Transparent Rupee Prices</h3>
              <p className="text-xs font-semibold text-gray-600 leading-relaxed">Zero surge pricing or surprise rates. Know your exact fixed total fare in ₹ Rupees before starting your trip.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-brand-lightBg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 reveal-element">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-text">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-1">Everything you need to know about Union Taxi</p>
          </div>
          <div className="space-y-4 reveal-element">
            <details className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm group">
              <summary className="font-extrabold text-sm sm:text-base text-brand-text cursor-pointer flex justify-between items-center">
                <span>Which Indian car models are available for booking?</span>
                <i className="fa-solid fa-chevron-down text-amber-500 group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-3 pt-3 border-t border-gray-100">We provide clean Maruti Suzuki Swift Dzire (Sedan), Maruti Suzuki Swift (Hatchback), Tata Indica / Indigo, and Toyota Innova 7-seater cabs.</p>
            </details>
            <details className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm group">
              <summary className="font-extrabold text-sm sm:text-base text-brand-text cursor-pointer flex justify-between items-center">
                <span>How are trip fares calculated?</span>
                <i className="fa-solid fa-chevron-down text-amber-500 group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-3 pt-3 border-t border-gray-100">Fares are transparently calculated per kilometer in Indian Rupees (₹) plus standard driver bata. You can calculate your exact fare upfront using our live Fare Estimator.</p>
            </details>
            <details className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm group">
              <summary className="font-extrabold text-sm sm:text-base text-brand-text cursor-pointer flex justify-between items-center">
                <span>Can I book a cab via phone call for elderly family members?</span>
                <i className="fa-solid fa-chevron-down text-amber-500 group-open:rotate-180 transition-transform"></i>
              </summary>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-3 pt-3 border-t border-gray-100">Yes! You can call our 24/7 hotline directly at +91 98765 43210 to arrange doorstep pickup and luggage assistance for seniors.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/assets/union-taxi-logo.jpeg" alt="Union Taxi Official Logo" className="h-10 w-auto object-contain rounded-lg bg-white p-1" />
                <span className="text-xl font-black text-white">UNION TAXI</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed font-medium">Union Taxi provides reliable, senior-friendly Indian cab services with transparent Rupee pricing.</p>
              <p className="text-xs font-extrabold text-brand-yellow">"Lets Ride Into Your Future Together"</p>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm mb-4">Indian Fleet</h4>
              <ul className="space-y-2 text-xs font-medium text-stone-400">
                <li><a href="#fleet" className="hover:text-brand-yellow">Maruti Swift Dzire (₹13/km)</a></li>
                <li><a href="#fleet" className="hover:text-brand-yellow">Maruti Suzuki Swift (₹12/km)</a></li>
                <li><a href="#fleet" className="hover:text-brand-yellow">Tata Indica / Indigo (₹12/km)</a></li>
                <li><a href="#fleet" className="hover:text-brand-yellow">Toyota Innova (₹18/km)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm mb-4">Customer Support</h4>
              <ul className="space-y-3 text-xs font-medium text-stone-400">
                <li className="flex items-center gap-2"><i className="fa-solid fa-phone text-brand-yellow"></i> +91 98765 43210</li>
                <li className="flex items-center gap-2"><i className="fa-brands fa-whatsapp text-green-500"></i> +91 98765 43210</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-globe text-brand-yellow"></i> www.uniontaxi.in</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm mb-4">Booking Hours</h4>
              <p className="text-xs text-stone-400">24 Hours / 7 Days A Week</p>
              <p className="text-xs text-amber-400 font-bold mt-2">Senior Priority Dispatch Available</p>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-center text-xs text-stone-500">
            <p>© 2026 Union Taxi. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div id="booking-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border-2 border-brand-yellow shadow-2xl relative text-center">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-xl">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-3xl font-black">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-2xl font-black text-brand-text mb-1">Union Cab Confirmed!</h3>
            <p className="text-xs text-gray-500 font-bold mb-5">Our dispatch team will contact you with driver and cab details.</p>
            <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-2 text-xs font-bold text-gray-800 border border-gray-200 mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Pick-up:</span> <span id="modal-pickup-lbl">{modalData.pickup}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Drop-off:</span> <span id="modal-drop-lbl">{modalData.dropoff}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Cab Model:</span> <span id="modal-car-lbl" className="text-amber-800">{modalData.car}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2"><span className="text-gray-500">Total Fixed Price:</span> <span id="modal-price-lbl" className="text-base font-black text-black">{modalData.price}</span></div>
            </div>
            <button onClick={() => setModalOpen(false)} className="btn-tactile-primary w-full py-3 text-sm">
              Done & Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;