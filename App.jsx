import React, { useState, useEffect, useRef } from 'react';
import Globe from 'globe.gl';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlGv9VP_zU0dBenVwZVB269GH4D6JnxIA",
  authDomain: "pylot-25f9a.firebaseapp.com",
  projectId: "pylot-25f9a",
  storageBucket: "pylot-25f9a.appspot.com",
  messagingSenderId: "860155724285",
  appId: "1:860155724285:web:c65188288d1cba9991d994",
  measurementId: "G-B20HW2N15S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Custom hook for scroll animations
const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);
};

// Countdown Component
const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const targetDate = new Date('2025-09-15T00:00:00');
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-start fade-in">
      <div className="text-white/60 text-xs font-thin font-mono">
        <span>T-</span>
        <span>{formatNumber(timeLeft.days)}</span>
        <span>:</span>
        <span>{formatNumber(timeLeft.hours)}</span>
        <span>:</span>
        <span>{formatNumber(timeLeft.minutes)}</span>
      </div>
    </div>
  );
};

// Application Modal Component
const ApplicationModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !description) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'applications'), {
        email,
        description,
        timestamp: new Date()
      });
      
      setMessage('신청이 완료되었습니다.');
      setEmail('');
      setDescription('');
      
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage('오류가 발생했습니다.');
      console.error('Error adding document: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-black p-8 rounded-2xl w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-semibold text-white mb-6">파일럿 인사이트 리포트</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors duration-200"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/80 mb-2">간단한 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 min-h-[100px] transition-colors duration-200"
              placeholder="어떤 아이템을 테스트하고 싶으신가요?"
              required
            />
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('완료') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '제출 중...' : '1분만에 결과보기'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ onOpenModal }) => {
    const [scrollOpacity, setScrollOpacity] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const maxScroll = 200; // 스크롤이 200px 되면 완전히 투명해짐
        const opacity = Math.max(0, 1 - (scrollPosition / maxScroll));
        setScrollOpacity(opacity);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <header className={`fixed top-0 w-full z-50 pointer-events-auto ${
        scrollOpacity === 0 && !isMobileMenuOpen ? 'pointer-events-none' : ''
      }`} style={{ opacity: isMobileMenuOpen ? 1 : scrollOpacity }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center">
              <img src="/icons/text_logo_white.png" alt="Pylot" className="h-14 sm:h-16 object-contain" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium">핵심 기능</a>
              <a href="#cases" className="text-white/80 hover:text-white transition-colors font-medium">성공 사례</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium">요금 안내</a>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-6 py-2.5 text-white border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/40 transition-all font-medium">
              문의하기
            </button>
            <button
              onClick={onOpenModal}
              className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all"
            >
              AI 무료진단 시작하기
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>


      </div>
      
      {/* Full Screen Mobile Menu */}
        {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-70">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white p-2 hover:text-[#4A69FF] transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col justify-center items-center h-full space-y-12 text-center px-8">
              <div className="space-y-6">
                <a 
                  href="#features" 
                  className="block text-white/80 text-lg sm:text-xl font-light hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  핵심 기능
                </a>
                <a 
                  href="#cases" 
                  className="block text-white/80 text-lg sm:text-xl font-light hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  성공 사례
                </a>
                <a 
                  href="#pricing" 
                  className="block text-white/80 text-lg sm:text-xl font-light hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  요금 안내
                </a>
              </div>
              <div className="space-y-3 w-full max-w-[280px]">
                <button 
                  className="block w-full px-6 py-3 text-white/80 border border-white/20 rounded-md hover:text-white hover:border-white/40 transition-all duration-300 font-light text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                문의하기
              </button>
              <button
                  onClick={() => {
                    onOpenModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-all duration-300 text-base"
                >
                  AI 무료진단 시작하기
              </button>
            </div>
          </div>
      </div>
        </div>
      )}
    </header>
  );
};

// Hero Section Component
const HeroSection = ({ onOpenModal }) => {
  return (
    <section className="min-h-screen bg-black flex items-center relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {/* Desktop Video */}
        <video
          className="hidden md:block w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/video/desktop_background_video.mp4" type="video/mp4" />
        </video>
        
        {/* Mobile Video */}
        <video
          className="block md:hidden w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/video/mobile_background_video.mp4" type="video/mp4" />
        </video>
        
        {/* Video Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Bottom blur gradient for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/60 via-black/30 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center items-start pt-40 sm:pt-48">
        <div className="w-full max-w-4xl">
          <Countdown />
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.2] mb-8 sm:mb-12 fade-in">
            당신의<br />
            아이디어가<br />
            이륙하는곳
          </h1>
          <div className="fade-in">
                          <button
                onClick={onOpenModal}
                className="mobile-btn px-6 py-4 sm:px-8 sm:py-5 bg-black/60 border border-white/60 text-white font-semibold text-lg rounded-md backdrop-blur-sm active:bg-white active:text-black transition-colors duration-150 flex items-center gap-2 focus:outline-none focus-visible:outline-none"
              >
                아이디어 진단받기
                <svg className="w-4 h-4" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.9893 5.58371L12.2471 5.89914L11.9893 6.21555L8.10059 10.9782L7.3252 10.3454L10.5479 6.39914L1.39941 6.39914L1.39941 5.39914L10.5479 5.39914L7.3252 1.45383L8.10059 0.821014L11.9893 5.58371Z" fill="currentColor" fillOpacity="0.8" />
                </svg>
              </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Intro Section Component
const GlobeSection = () => {
  const globeRef = useRef();
  const [routes, setRoutes] = useState([]);
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    // 한국 중심의 주요 국제 항공 경로
    const mainRoutes = [
      // 아시아 태평양
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'HND', dstLat: 35.5494, dstLng: 139.7798 },
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'PEK', dstLat: 40.0799, dstLng: 116.6031 },
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'HKG', dstLat: 22.3080, dstLng: 113.9185 },
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'SIN', dstLat: 1.3644, dstLng: 103.9915 },
      // 유럽
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'LHR', dstLat: 51.4700, dstLng: -0.4543 },
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'CDG', dstLat: 49.0097, dstLng: 2.5479 },
      // 북미
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'LAX', dstLat: 33.9416, dstLng: -118.4085 },
      { srcIata: 'ICN', srcLat: 37.4691, srcLng: 126.4505, dstIata: 'JFK', dstLat: 40.6413, dstLng: -73.7781 }
    ];

    const processedRoutes = mainRoutes.map(route => ({
      ...route,
      srcAirport: { lat: route.srcLat, lng: route.srcLng },
      dstAirport: { lat: route.dstLat, lng: route.dstLng },
      airline: 'Pylot Air',
      arcAlt: 0.3
    }));

    setRoutes(processedRoutes);
    setAirports(mainRoutes.flatMap(route => [
      { lat: route.srcLat, lng: route.srcLng },
      { lat: route.dstLat, lng: route.dstLng }
    ]));
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    // 기존 캔버스 정리
    while (globeRef.current.firstChild) {
      globeRef.current.removeChild(globeRef.current.firstChild);
    }

    const OPACITY = 0.35;
    const globe = Globe()
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      .backgroundColor('#000000')
      .width(Math.min(window.innerWidth - 32, 800))
      .height(window.innerWidth < 640 ? 280 : 360)
      .pointOfView({ lat: 37.4691, lng: 126.4505, altitude: 2.5 })
      .arcLabel(d => `${d.airline}: ${d.srcIata} → ${d.dstIata}`)
      .arcStartLat(d => +d.srcAirport.lat)
      .arcStartLng(d => +d.srcAirport.lng)
      .arcEndLat(d => +d.dstAirport.lat)
      .arcEndLng(d => +d.dstAirport.lng)
      .arcAltitude(d => d.arcAlt)
      .arcDashLength(0.25)
      .arcDashGap(1)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(4000)
      .arcColor(() => [`rgba(255, 255, 255, ${OPACITY})`, `rgba(255, 255, 255, ${OPACITY})`])
      .arcsTransitionDuration(2000)
      .pointColor(() => '#ffffff')
      .pointAltitude(0)
      .pointRadius(0.02)
      .pointsMerge(true)
      .showAtmosphere(true)
      .atmosphereColor('#ffffff')
      .atmosphereAltitude(0.15)(globeRef.current);

    globe
      .pointsData(airports)
      .arcsData(routes);

    // Auto-rotate
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.35;

    const handleResize = () => {
      globe.width(Math.min(window.innerWidth - 32, 800));
      globe.height(window.innerWidth < 640 ? 280 : 360);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globe) {
        globe.controls().dispose();
        globe._destructor();
        // 캔버스 정리
        while (globeRef.current?.firstChild) {
          globeRef.current.removeChild(globeRef.current.firstChild);
        }
      }
    };
  }, [routes, airports]);

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            전 세계 어디서나 검증된 데이터
          </h2>
          <p className="text-white/70 text-base sm:text-lg">
            글로벌 사용자들의 실제 데이터를 기반으로 검증합니다
          </p>
        </div>
        <div className="flex justify-center items-center">
          <div ref={globeRef} className="w-full max-w-[800px] h-[280px] sm:h-[360px] relative" />
        </div>
      </div>
    </section>
  );
};

const OnboardingSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  return (
    <section className="bg-black py-8 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-white/70 text-lg sm:text-xl font-semibold mb-4 fade-in">
          확신을 가지고 출발하세요
        </h2>
        
        {/* First Problem */}
        <div className="mb-6 fade-in">
          <div className="h-px bg-white/20 mb-6"></div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-20 h-20 lg:w-32 lg:h-32 flex-shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src="/images/onboarding-1.jpg" 
                  alt="막연한 기대" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm lg:text-base font-semibold mb-1 lg:mb-2 whitespace-pre-line">
                {"막연한 기대를 가지고\n제품을 개발하고있나요?"}
              </h3>
              <p className={`text-white/70 text-xs lg:text-sm leading-relaxed transition-all duration-300 ${
                expandedIndex === 0 ? '' : 'line-clamp-2'
              }`}>
                성공할 것이라는 기대만으로 수개월의 시간과 비용을 쏟고 있진 않으신가요? 더 이상 '만들고 기도'하지 마세요. 성공하는 제품은 만들기 전에 데이터로 먼저 배웁니다. PYLOT이 당신의 아이디어를, 시장이 원하는 '확신'으로 바꿔드립니다.
              </p>
            </div>
            <button 
              onClick={() => toggleExpand(0)}
              className="flex-shrink-0 p-2 text-white/60 hover:text-white transition-colors focus:outline-none"
            >
              <svg 
                className={`w-5 h-5 lg:w-6 lg:h-6 transform transition-transform duration-300 ${
                  expandedIndex === 0 ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Second Problem */}
        <div className="mb-6 fade-in">
          <div className="h-px bg-white/20 mb-6"></div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-20 h-20 lg:w-32 lg:h-32 flex-shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src="/images/onboarding-2.jpg" 
                  alt="테스트 피드백" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm lg:text-base font-semibold mb-1 lg:mb-2 whitespace-pre-line">
                {"테스트 피드백이 모호하거나\n편향되어 있나요?"}
              </h3>
              <p className={`text-white/70 text-xs lg:text-sm leading-relaxed transition-all duration-300 ${
                expandedIndex === 1 ? '' : 'line-clamp-2'
              }`}>
                가족, 지인에게 받은 "좋아요"라는 피드백, 과연 시장에서도 통할까요? 우리 제품에 돈을 지불할 '진짜 고객'이 아닌, 편향된 그룹의 피드백은 오히려 잘못된 결정으로 이어질 수 있습니다. PYLOT은 서비스의 핵심 페르소나와 일치하는 사용자를 정확히 매칭하여, 날카롭고 유의미한 데이터만 수집합니다.
              </p>
            </div>
            <button 
              onClick={() => toggleExpand(1)}
              className="flex-shrink-0 p-2 text-white/60 hover:text-white transition-colors focus:outline-none"
            >
              <svg 
                className={`w-5 h-5 lg:w-6 lg:h-6 transform transition-transform duration-300 ${
                  expandedIndex === 1 ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
            </button>
          </div>
      </div>

        {/* Third Problem */}
        <div className="mb-6 fade-in">
          <div className="h-px bg-white/20 mb-6"></div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-20 h-20 lg:w-32 lg:h-32 flex-shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src="/images/onboarding-3.jpg" 
                  alt="사용자 이탈" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm lg:text-base font-semibold mb-1 lg:mb-2 whitespace-pre-line">
                {"제품 출시 후\n사용자 이탈의 이유를 모르고 있나요?"}
              </h3>
              <p className={`text-white/70 text-xs lg:text-sm leading-relaxed transition-all duration-300 ${
                expandedIndex === 2 ? '' : 'line-clamp-2'
              }`}>
                높은 이탈률의 원인은 대부분 서비스의 온보딩과정에 숨어있습니다. 유저가 핵심 가치를 경험하는 'Aha! Moment'에 도달하기 전에, 보이지 않는 허들을 마주하고 이탈하는 것입니다. PYLOT은 유저의 행동 데이터를 분석하여, 어떤 화면과 버튼에서 Pain Point를 느끼는지 정확히 짚어냅니다.
              </p>
            </div>
            <button
              onClick={() => toggleExpand(2)}
              className="flex-shrink-0 p-2 text-white/60 hover:text-white transition-colors focus:outline-none"
            >
              <svg 
                className={`w-5 h-5 lg:w-6 lg:h-6 transform transition-transform duration-300 ${
                  expandedIndex === 2 ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Final Divider */}
        <div className="h-px bg-white/20 fade-in"></div>
      </div>
    </section>
  );
};

const IntroSection = () => {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-black relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Astronaut Image */}
          <div className="flex-shrink-0 fade-in">
            <div className="relative">
              {/* Speech Bubble */}
              <div className="absolute -right-4 top-2 sm:right-0 sm:top-2 z-10 transform rotate-6">
                <div className="relative">
                  <div className="px-4 py-2 border border-white/30 rounded-xl bg-black/30 backdrop-blur-sm">
                    <p className="text-white text-xs sm:text-sm font-light whitespace-nowrap">Test it with Pylot.</p>
                  </div>
                  {/* Bubble dots */}
                  <div className="absolute -bottom-6 left-6 flex gap-1.5 transform -rotate-45">
                    <div className="w-1 h-1 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm"></div>
                    <div className="w-2 h-2 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm"></div>
                    <div className="w-2.5 h-2.5 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm"></div>
                  </div>
                </div>
              </div>
              
              <img 
                src="/images/astronaut.png" 
                alt="Astronaut" 
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain floating"
              />
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex-1 text-left">
                          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 fade-in">
                그 아이디어, 성공할까요?<br />
                <span className="text-base sm:text-base lg:text-lg font-light space-y-0.5 block"><br/>이제 데이터로 증명하고 확신으로 출시하세요.<br />Pylot은 아이디어 검증부터 UX 테스트까지<br />성공적인 시장 출시를 위한 단 하나의 솔루션입니다.</span>
              </h2>
            <div className="fade-in">
              <button className="px-6 py-3 border border-white/30 text-white text-lg font-medium rounded-lg hover:bg-white hover:text-black transition-all duration-300 focus:outline-none">
                더알아보기
            </button>
            </div>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-4 fade-in">
            
            </p>
            
          </div>
        </div>
      </div>
    </section>
  );
};

// Solution Section Component
const SolutionSection = ({ onOpenModal }) => {
  const steps = [
    {
      number: "1",
      title: "앱 등록",
      description: "시나리오·목표를 입력하면, 표준 시험계획서가 생성됩니다.",
      tooltip: true,
      image: "/images/app checklist.png"
    },
    {
      number: "2",
      title: "테스터 매칭 & 실행",
      description: "타깃 페르소나에 맞춘 실사용자가 테스트합니다.",
      badges: ["20대", "여성", "패션"],
      image: "/images/user.png"
    },
    {
      number: "3",
      title: "AI 리포트",
      description: "화면 녹화+클릭/스크롤 로그를 AI가 분석해 이탈 지점, 혼란 패턴, 개선 제안을 제공합니다.",
      chips: ["이탈 지점", "혼란 패턴", "개선 제안"],
      image: "/images/analysis.png"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#4A69FF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4A69FF] rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 fade-in">
            <span className="text-[#4A69FF]">Pylot</span>은 오직 데이터로 <br className="hidden sm:block" />
            성공을 보장합니다.
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto fade-in">
            3단계 간단한 프로세스로 확실한 인사이트를 얻으세요.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 sm:gap-6 fade-in">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#4A69FF] to-[#6B7FFF] text-white rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <img src={step.image} alt="" className="w-6 h-6 object-contain" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-white/80 mb-4 text-base sm:text-lg leading-relaxed">{step.description}</p>
                  {step.badges && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {step.badges.map((badge, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-sm font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.chips && (
                    <div className="flex gap-2 flex-wrap">
                      {step.chips.map((chip, i) => (
                        <span key={i} className="px-3 py-1 bg-[#4A69FF]/20 text-[#4A69FF] rounded-lg text-sm font-medium border border-[#4A69FF]/30">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-8">
              <button
                onClick={onOpenModal}
                className="px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-[#4A69FF] to-[#6B7FFF] text-white font-bold text-lg rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-[#4A69FF]/25"
              >
                🚀 내 아이템 테스트 시작
              </button>
            </div>
          </div>
          
          <div className="relative fade-in">
            <div className="relative w-full h-80 sm:h-96 lg:h-[500px] bg-gradient-to-br from-[#4A69FF]/20 to-[#4A69FF]/10 rounded-3xl flex items-center justify-center overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-20 h-20 border-2 border-[#4A69FF] rounded-lg"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 bg-[#4A69FF]/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-[#4A69FF]/30 rounded-lg transform rotate-45"></div>
              </div>
              
              <img src="/images/analysis.png" alt="AI Dashboard" className="w-64 h-64 sm:w-80 sm:h-80 object-contain relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Difference Section Component
const DifferenceSection = () => {
  const features = [
    {
      title: "실제 행동 데이터",
      description: "화면 녹화 + 클릭/스크롤 로그"
    },
    {
      title: "AI 분석 리포트",
      description: "불일치·이탈 원인 자동 추출"
    },
    {
      title: "빠른 실행",
      description: "24시간 내 결과 제공"
    }
  ];

  const comparison = [
    { feature: "실제 사용 행동 분석", survey: "❌", Pylot: "✅" },
    { feature: "AI 인사이트 도출", survey: "❌", Pylot: "✅" },
    { feature: "화면 녹화 제공", survey: "❌", Pylot: "✅" },
    { feature: "24시간 내 결과", survey: "❌", Pylot: "✅" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 fade-in">
          데이터의 사각지대를 분석합니다.
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 fade-in">
          사용자의 '의견' 뒤에 숨겨진 '행동' 데이터로 증명합니다.
        </p>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-[#4A69FF] rounded-full flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
            
            <div className="mt-12">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-3 text-left">기능</th>
                    <th className="py-3 text-center">설문 전용 툴</th>
                    <th className="py-3 text-center">Pylot</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">{row.feature}</td>
                      <td className="py-3 text-center text-2xl">{row.survey}</td>
                      <td className="py-3 text-center text-2xl">{row.Pylot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-center fade-in">
            <div className="w-80 h-80 bg-gradient-to-br from-[#4A69FF]/20 to-[#4A69FF]/10 rounded-full flex items-center justify-center">
              {/* 3D 이미지로 교체 */}
              <img src="/images/ai.png" alt="AI Analysis" className="w-64 h-64 object-contain" />
              {/* 임시 이모지 - 이미지 없을 때 */}
              {/* <span className="text-8xl">🤖</span> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Target Section Component
const TargetSection = () => {
  const targets = [
    {
      role: "CEO",
      icon: "👔",
      description: "실패 리스크를 데이터로 관리하고, 투자자에게는 성공의 근거를 제시하세요."
    },
    {
      role: "PM/기획자",
      icon: "✏️",
      description: "더 이상 팀원을 감으로 설득하지 마세요. 데이터로 우선순위를 증명하세요."
    },
    {
      role: "마케터/디자이너",
      icon: "🎯",
      description: "고객의 숨은 의도를 데이터로 파악하고, 가장 효과적인 경험을 설계하세요."
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16 fade-in">
          팀을 위한 최고의 엔지니어 크루
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {targets.map((target, index) => (
            <div key={index} className="text-center fade-in">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[#4A69FF]/30 to-[#4A69FF]/10 rounded-2xl flex items-center justify-center">
                {/* 3D 이미지로 교체 */}
                {target.role === "CEO" && <img src="/images/ceo.png" alt="CEO" className="w-24 h-24 object-contain" />}
                {target.role === "PM/기획자" && <img src="/images/pencil.png" alt="PM" className="w-24 h-24 object-contain" />}
                {target.role === "마케터/디자이너" && <img src="/images/target.png" alt="Marketer" className="w-24 h-24 object-contain" />}
                {/* 임시 이모지 - 이미지 없을 때 */}
                {/* <span className="text-6xl">{target.icon}</span> */}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{target.role}</h3>
              <p className="text-white/70">{target.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Social Proof Section Component
const SocialProofSection = () => {
  const logos = ["Company A", "Company B", "Company C", "Company D", "Company E"];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 fade-in">
          이미 많은 팀들이 Pylot과 함께<br />
          성공적인 시작을 경험했습니다.
        </h2>
        
        <div className="flex justify-center items-center gap-8 mb-12 fade-in">
          {logos.map((logo, index) => (
            <div key={index} className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">{logo}</span>
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-2xl fade-in">
          <p className="text-xl italic text-gray-700 mb-4">
            "Pylot 덕분에 2개월의 개발 시간과 수천만 원의 비용을 아꼈습니다. 무엇보다, 우리가 올바른 방향으로 가고 있다는 확신을 얻은 것이 가장 큰 수확입니다."
          </p>
          <p className="text-gray-600 font-semibold">- 주식회사 ABC / 김대표 CEO</p>
        </div>
      </div>
    </section>
  );
};

// Tester Recruitment Section Component
const TesterRecruitmentSection = () => {
  const benefits = [
    {
      icon: "☕️",
      title: "커피 한 잔의 여유, 15분",
      description: "평균 15분 내외의 짧은 테스트로 부담 없이 참여하세요."
    },
    {
      icon: "📱",
      title: "스마트폰만 있으면 OK",
      description: "복잡한 장비나 전문 지식은 필요 없어요. 스마트폰 하나로 충분합니다."
    },
    {
      icon: "💸",
      title: "참여 즉시 쌓이는 리워드",
      description: "테스트를 완료하면 약속된 리워드가 즉시 지급됩니다."
    }
  ];

  return (
    <section className="py-20 bg-[#F7F7F7]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 fade-in">
          스마트폰 하나로, 15분만에 부업 수익!
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm fade-in">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center gap-4 fade-in">
          <button className="px-8 py-3 bg-[#4A69FF] text-white font-semibold rounded-lg hover:bg-[#3A59EF] transition-colors">
            💼 지금 파일럿 되기
          </button>
          <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            ℹ️ 참여 방법 보기
          </button>
        </div>
      </div>
    </section>
  );
};

// Final CTA Section Component
const FinalCTASection = ({ onOpenModal }) => {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-t from-[#4A69FF]/30 to-transparent" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 fade-in">
            이제, 당신의 아이디어를 이륙시킬 시간입니다.
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto fade-in">
            Pylot의 데이터 기반 솔루션을 통해 성공을 향한 가장 빠른 항로를 발견하고, 자신 있게 다음 단계로 나아가십시오.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
            <button
              onClick={onOpenModal}
              className="px-8 py-4 bg-[#4A69FF] text-white font-semibold rounded-lg hover:bg-[#3A59EF] transition-colors"
            >
              무료 진단 시작하기
            </button>
            <button className="px-8 py-4 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">
              엔터프라이즈 상담
            </button>
          </div>
        </div>
        
        <div className="mt-16 flex justify-center fade-in">
          {/* 3D 로켓 이미지로 교체 */}
          <img src="/images/rocket.png" alt="Rocket Launch" className="w-64 h-64 object-contain" />
          {/* 임시 이모지 - 이미지 없을 때 */}
          {/* <div className="text-[200px] leading-none">🚀</div> */}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="py-12 bg-black border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Pylot</h3>
            <p className="text-white/60 text-sm">
              데이터로 증명하고,<br />
              확신으로 출시하세요.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white text-sm">회사소개</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm">이용약관</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm">개인정보처리방침</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white text-sm">FAQ</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm">문의하기</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm">파트너십</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-white/60 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-white/40 text-sm">
            © 2024 Pylot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useScrollAnimation();

// Styles are now handled by CSS imports

  return (
    <div className="min-h-screen">
      <Header onOpenModal={() => setIsModalOpen(true)} />
      <HeroSection onOpenModal={() => setIsModalOpen(true)} />
      <IntroSection />
      <OnboardingSection />
      <GlobeSection />
      <SolutionSection onOpenModal={() => setIsModalOpen(true)} />
      <DifferenceSection />
      <TargetSection />
      <SocialProofSection />
      <TesterRecruitmentSection />
      <FinalCTASection onOpenModal={() => setIsModalOpen(true)} />
      <Footer />
      
      <ApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default App;