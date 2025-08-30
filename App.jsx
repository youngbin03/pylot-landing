import React, { useState, useEffect } from 'react';
import GlobeSection from './src/components/GlobeSection';
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

// Pilot Registration Modal Component
const PilotRegistrationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    gender: '',
    age: '',
    occupation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const ageRanges = [
    { value: '10-19', label: '10-19세' },
    { value: '20-29', label: '20-29세' },
    { value: '30-39', label: '30-39세' },
    { value: '40-49', label: '40-49세' },
    { value: '50-59', label: '50-59세' },
    { value: '60+', label: '60세 이상' }
  ];

  const occupations = [
    { value: 'student', label: '학생' },
    { value: 'office_worker', label: '사무직' },
    { value: 'service', label: '서비스업' },
    { value: 'manufacturing', label: '제조업' },
    { value: 'education', label: '교육' },
    { value: 'healthcare', label: '의료/보건' },
    { value: 'it', label: 'IT/기술' },
    { value: 'finance', label: '금융' },
    { value: 'marketing', label: '마케팅/광고' },
    { value: 'freelancer', label: '프리랜서' },
    { value: 'housewife', label: '주부' },
    { value: 'other', label: '기타' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
             const response = await fetch('/api/pilot-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // 자동 닫기 제거 - 사용자가 직접 닫도록 함
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-2 text-white/60 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {submitStatus !== 'success' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">파일럿 등록하기</h2>
            <p className="text-white/70 text-sm text-center mb-6">
              테스트 참여로 평균 4,900원을 받고 있어요!
            </p>
          </>
        )}
        
        {submitStatus === 'success' && (
          <div className="mb-6 mt-10">
            <h3 className="text-xl font-bold text-white mb-2 text-left">파일럿으로 합류하신걸 환영합니다!</h3>
            <p className="text-white/70 text-sm leading-relaxed text-left">
              환영 이메일을 발송했습니다.<br/>
              곧 새로운 테스트 기회를 알려드릴게요.
            </p>
            
            {/* Banner 이미지 추가 */}
            <div className="mt-6">
              <img 
                src="/icons/baner.webp" 
                alt="Pylot Banner" 
                className="w-full h-auto rounded-lg opacity-80"
              />
            </div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            등록 중 오류가 발생했습니다. 다시 시도해주세요.
          </div>
        )}
        
        {submitStatus !== 'success' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              이메일 주소
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              성별
            </label>
            <div className="flex gap-3">
                                    <button
                        type="button"
                        onClick={() => setFormData({...formData, gender: 'male'})}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-300 focus:outline-none ${
                          formData.gender === 'male'
                            ? 'border-white bg-white text-black font-semibold'
                            : 'border-white/30 text-white/70 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, gender: 'female'})}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-300 focus:outline-none ${
                          formData.gender === 'female'
                            ? 'border-white bg-white text-black font-semibold'
                            : 'border-white/30 text-white/70 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        여성
                      </button>
            </div>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              나이
            </label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/60 transition-colors"
              required
            >
              <option value="" className="bg-black text-white">나이대를 선택하세요</option>
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-black text-white">
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              직업군
            </label>
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/60 transition-colors"
              required
            >
              <option value="" className="bg-black text-white">직업을 선택하세요</option>
              {occupations.map((job) => (
                <option key={job.value} value={job.value} className="bg-black text-white">
                  {job.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            {isSubmitting ? '등록 중...' : '파일럿 등록하기'}
          </button>
        </form>
        )}
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
  const videoRef = React.useRef(null);
  const mobileVideoRef = React.useRef(null);
  
  React.useEffect(() => {
    // 비디오 자동재생 강제 시도
    const playVideo = async (videoElement) => {
      if (videoElement) {
        try {
          await videoElement.play();
        } catch (error) {
          console.log('비디오 자동재생 실패:', error);
          // 사용자 상호작용 후 재생하도록 이벤트 리스너 추가
          const playOnInteraction = () => {
            videoElement.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        }
      }
    };
    
    playVideo(videoRef.current);
    playVideo(mobileVideoRef.current);
  }, []);
  
  return (
    <section className="min-h-screen bg-black flex items-center relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {/* Desktop Video */}
        <video
          ref={videoRef}
          className="hidden md:block w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/stagesection_background.jpg"
        >
          <source src="/video/desktop_background_video.mp4" type="video/mp4" />
        </video>
        
        {/* Mobile Video */}
        <video
          ref={mobileVideoRef}
          className="block md:hidden w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/stagesection_background.jpg"
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
                {"제품 출시 후 사용자 이탈의\n 이유를 모르고 있나요?"}
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

// Lean Canvas Input Modal Component
const LeanCanvasInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customer: '',
    problem: '',
    solution: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.problem || !formData.solution) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      problem: '',
      solution: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 right-4 text-white/60 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white mb-3 text-start">아이디어 구체화</h2>
        <p className="text-white/70 text-sm text-start mb-6">
          3가지 질문에 답하시면 AI가 Lean Canvas를 생성해드립니다
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              1. 누구의 문제를 해결하고 싶으신가요? (타겟 고객)
            </label>
            <input
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
              placeholder="예: 강아지를 처음 키우는 초보 견주"
              required
            />
                </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              2. 그들은 현재 어떤 가장 큰 어려움을 겪고 있나요? (문제)
            </label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors resize-none"
              placeholder="예: 어떤 사료를 먹여야 할지 너무 막막해요"
              required
            />
              </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              3. 이 문제를 어떻게 해결해줄 수 있을까요? (솔루션)
            </label>
            <textarea
              name="solution"
              value={formData.solution}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors resize-none"
              placeholder="예: 강아지 종과 나이에 맞는 맞춤 사료 구독 서비스"
              required
            />
            </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.customer || !formData.problem || !formData.solution}
            className="w-full py-3 px-6 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            {isSubmitting ? 'AI가 분석 중...' : 'Lean Canvas 생성하기'}
          </button>
        </form>
        </div>
      </div>
  );
};

// Lean Canvas Result Modal Component
const LeanCanvasResultModal = ({ isOpen, onClose, leanCanvas, isLoading, error, inputData }) => {
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState(null);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);

  const handleRiskAnalysis = async () => {
    if (!inputData) {
      alert('입력 데이터가 없습니다.');
      return;
    }

    setIsRiskLoading(true);
    setRiskError(null);
    setShowRiskAnalysis(true);

    try {
      // API URL 설정 (Vite 프록시 사용)
      const apiUrl = '/api/risk-analysis';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) {
        throw new Error('리스크 분석에 실패했습니다');
      }

      const result = await response.json();
      setRiskAnalysis(result.data.riskAnalysis);
    } catch (err) {
      setRiskError(err.message);
    } finally {
      setIsRiskLoading(false);
    }
  };

  const downloadLeanCanvasAsImage = async () => {
    try {
      // html2canvas 동적 import
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById('lean-canvas-grid');
      if (!element) {
        alert('Lean Canvas를 찾을 수 없습니다.');
        return;
      }

      // 고해상도 캔버스 생성
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // 이미지 다운로드
      const link = document.createElement('a');
      link.download = `lean-canvas-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      alert('이미지 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 리스크 분석 이미지 다운로드 함수
  const downloadRiskAnalysisAsImage = async () => {
    try {
      // html2canvas 동적 import
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById('risk-analysis-content');
      if (!element) {
        alert('리스크 분석 결과를 찾을 수 없습니다.');
        return;
      }

      // 고해상도 캔버스 생성
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // 이미지 다운로드
      const link = document.createElement('a');
      link.download = `risk-analysis-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('리스크 분석 다운로드 중 오류 발생:', error);
      alert('리스크 분석 이미지 다운로드 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  const sections = [
    { key: 'problem', title: '1. 문제 (Problem)', position: 'col-span-1' },
    { key: 'solution', title: '4. 해결 방안 (Solution)', position: 'col-span-1' },
    { key: 'unique_value_proposition', title: '3. 고유 가치 제안 (UVP)', position: 'col-span-1' },
    { key: 'unfair_advantage', title: '9. 경쟁 우위', position: 'col-span-1' },
    { key: 'customer_segments', title: '2. 고객군', position: 'col-span-1' },
    { key: 'key_metrics', title: '8. 핵심 지표', position: 'col-span-2' },
    { key: 'channels', title: '5. 채널', position: 'col-span-3' },
    { key: 'cost_structure', title: '7. 비용 구조', position: 'col-span-2' },
    { key: 'revenue_streams', title: '6. 수익원', position: 'col-span-3' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-7xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white focus:outline-none z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center justify-center mb-6 relative">
          <h2 className="text-2xl font-bold text-white text-center">Lean Canvas</h2>
          {leanCanvas && !isLoading && !error && (
            <button
              onClick={() => downloadLeanCanvasAsImage()}
              className="absolute left-0 text-white/70 hover:text-white transition-all duration-300"
              title="이미지로 다운로드"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
      </div>
      
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/70">AI가 Lean Canvas를 생성하고 있습니다...</p>
        </div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">오류가 발생했습니다</p>
            <p className="text-white/60 text-sm">{error}</p>
                  </div>
        )}

        {leanCanvas && !isLoading && !error && (
          <div className="relative">
            {/* 슬라이드 가능한 컨테이너 */}
            <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
              <div className="grid grid-cols-5 gap-4 text-sm min-w-[800px]" id="lean-canvas-grid">
                {/* 첫 번째 행 */}
                <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">1. 문제 (Problem)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.problem?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">4. 해결 방안 (Solution)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.solution?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                    </div>

                <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">3. 고유 가치 제안 (UVP)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.unique_value_proposition?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                  </div>

                <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">9. 경쟁 우위</h3>
                  <ul className="space-y-2">
                    {leanCanvas.unfair_advantage?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                    </div>

                <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">2. 고객군</h3>
                  <ul className="space-y-2">
                    {leanCanvas.customer_segments?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                    </div>

                {/* 두 번째 행 */}
                <div className="col-span-2 border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">8. 핵심 지표 (Key Metrics)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.key_metrics?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-span-3 border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">5. 채널 (Channels)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.channels?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
              </div>

                {/* 세 번째 행 */}
                <div className="col-span-2 border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">7. 비용 구조 (Cost Structure)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.cost_structure?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="col-span-3 border border-white/20 rounded-lg p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-3 text-base">6. 수익원 (Revenue Streams)</h3>
                  <ul className="space-y-2">
                    {leanCanvas.revenue_streams?.map((item, index) => (
                      <li key={index} className="text-white/80 text-sm leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 리스크 분석 섹션 */}
        {leanCanvas && !isLoading && !error && (
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-white">🚨 핵심 리스크 분석</h3>
                {riskAnalysis && !isRiskLoading && !riskError && (
              <button
                    onClick={() => downloadRiskAnalysisAsImage()}
                    className="ml-4 text-white/70 hover:text-white transition-all duration-300"
                    title="이미지로 다운로드"
              >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
              </button>
                )}
            </div>
              <button
                onClick={handleRiskAnalysis}
                disabled={isRiskLoading}
                className="px-6 py-2 bg-red-600/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRiskLoading ? '분석 중...' : '리스크 분석하기'}
              </button>
          </div>
          
            {/* 리스크 분석 결과 */}
            {showRiskAnalysis && (
              <div>
                {isRiskLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-4"></div>
                      <p className="text-white/70 text-sm">AI가 핵심 리스크를 분석하고 있습니다...</p>
              </div>
                  </div>
                )}
              
                {riskError && (
                  <div className="text-center py-12">
                    <p className="text-red-400 mb-2">리스크 분석 중 오류가 발생했습니다</p>
                    <p className="text-white/60 text-sm">{riskError}</p>
            </div>
                )}

                {riskAnalysis && !isRiskLoading && !riskError && (
                  <div id="risk-analysis-content" className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    {/* Market Risk */}
                    <div className="border border-red-400/30 rounded-lg p-6 bg-red-600/5">
                      <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          riskAnalysis.market_risk.risk_level === 'HIGH' ? 'bg-red-500' :
                          riskAnalysis.market_risk.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <h4 className="text-lg font-semibold text-red-300">
                          {riskAnalysis.market_risk.title}
                        </h4>
          </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-white/60">당신의 가정:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.market_risk.assumption}</p>
        </div>
                        
                        <div>
                          <span className="text-red-300">실제 불확실성:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.market_risk.uncertainty}</p>
      </div>
                        
                        <div>
                          <span className="text-white/60">잠재적 영향:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.market_risk.impact}</p>
                        </div>
                        
                        <div className="bg-white/5 p-3 rounded-lg">
                          <span className="text-blue-300">💡 검증 방법:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.market_risk.validation_method}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Risk */}
                    <div className="border border-red-400/30 rounded-lg p-6 bg-red-600/5">
                      <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          riskAnalysis.product_risk.risk_level === 'HIGH' ? 'bg-red-500' :
                          riskAnalysis.product_risk.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <h4 className="text-lg font-semibold text-red-300">
                          {riskAnalysis.product_risk.title}
                        </h4>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-white/60">당신의 가정:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.product_risk.assumption}</p>
                        </div>
                        
                        <div>
                          <span className="text-orange-300">실제 불확실성:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.product_risk.uncertainty}</p>
                        </div>
                        
                        <div>
                          <span className="text-white/60">잠재적 영향:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.product_risk.impact}</p>
                        </div>
                        
                        <div className="bg-white/5 p-3 rounded-lg">
                          <span className="text-blue-300">💡 검증 방법:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.product_risk.validation_method}</p>
                        </div>
                      </div>
                    </div>

                    {/* Competitive Risk */}
                    <div className="border border-red-400/30 rounded-lg p-6 bg-red-600/5">
                      <div className="flex items-center mb-4">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          riskAnalysis.competitive_risk.risk_level === 'HIGH' ? 'bg-red-500' :
                          riskAnalysis.competitive_risk.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <h4 className="text-lg font-semibold text-red-300">
                          {riskAnalysis.competitive_risk.title}
                        </h4>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-white/60">당신의 가정:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.competitive_risk.assumption}</p>
                        </div>
                        
                        <div>
                          <span className="text-purple-300">실제 불확실성:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.competitive_risk.uncertainty}</p>
                        </div>
                        
                        <div>
                          <span className="text-white/60">잠재적 영향:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.competitive_risk.impact}</p>
                        </div>
                        
                        <div className="bg-white/5 p-3 rounded-lg">
                          <span className="text-blue-300">💡 검증 방법:</span>
                          <p className="text-white/80 mt-1">{riskAnalysis.competitive_risk.validation_method}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Stage Section Component
const StageSection = () => {
  const [currentStage, setCurrentStage] = useState('pre-product');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLeanCanvasInputOpen, setIsLeanCanvasInputOpen] = useState(false);
  const [isLeanCanvasResultOpen, setIsLeanCanvasResultOpen] = useState(false);
  const [leanCanvas, setLeanCanvas] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState(null);

  const handleLeanCanvasSubmit = async (formData) => {
    setIsGenerating(true);
    setError(null);
    setInputData(formData); // 입력 데이터 저장
    setIsLeanCanvasInputOpen(false);
    setIsLeanCanvasResultOpen(true);

    try {
      // API URL 설정 (Vite 프록시 사용)
      const apiUrl = '/api/lean-canvas';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Lean Canvas 생성에 실패했습니다');
      }

      const result = await response.json();
      setLeanCanvas(result.data.leanCanvas);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestScenarioClick = () => {
    if (selectedItem === 'pre-product-0') { // 문제정의 및 아이디어 구체화 선택된 경우
      setIsLeanCanvasInputOpen(true);
    } else {
      // 다른 항목들은 기본 동작 (추후 확장 가능)
      alert('해당 기능은 준비 중입니다.');
    }
  };
  
  const stages = [
    {
      id: 'pre-product',
      title: 'Pre-Product',
      items: [
        {
          title: '문제 정의 및 아이디어 구체화',
          tags: ['기획서', '시장조사']
        },
        {
          title: '고객 문제 검증 및 솔루션 탐색',
          tags: ['고객인터뷰']
        },
        {
          title: '핵심 UX/UI 설계',
          tags: ['와이어프레임', '기능정의서']
        }
      ]
    },
    {
      id: 'product-market-fit',
      title: 'Product-Market Fit',
      items: [
        {
          title: '디자인 기반 사용성 검증',
          tags: ['Figma', '프로토타입']
        },
        {
          title: '최소 기능 제품(MVP) 시장성 검증',
          tags: ['MVP', '베타버전']
        },
        {
          title: '정식 출시 전 최종 점검',
          tags: ['클로즈베타', '버그리포트']
        }
      ]
    },
    {
      id: 'scale-up',
      title: 'Scale-Up',
      items: [
        {
          title: '초기 리텐션 개선 및 활성화',
          tags: ['AhaMoment', '온보딩']
        },
        {
          title: '신규 기능 가치 검증 및 개선',
          tags: ['기능사용률', 'A/B테스트']
        },
        {
          title: '핵심 지표(KPI) 성장 및 최적화',
          tags: ['전환율(CRO)', '퍼널분석']
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-black relative">
      {/* Desktop Background Image */}
      <div 
        className="hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/stagesection_background.jpg)' }}
      ></div>
      
      {/* Background Overlay - Desktop only */}
      <div className="hidden lg:block absolute inset-0 bg-black/60"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-12 fade-in">
          당신의 아이디어는<br/>어느 단계에 있나요?
        </h2>

        {/* Desktop Layout */}
        <div className="hidden lg:flex justify-end mb-12">
          {/* Right Content */}
          <div className="w-1/2">
            {/* Stage Navigation */}
            <div className="flex space-x-4 mb-12">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setCurrentStage(stage.id)}
                  className={`text-base font-medium transition-all duration-300 pb-2 focus:outline-none focus-visible:outline-none ${
                  currentStage === stage.id
                    ? 'text-white border-b-2 border-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
                >
                  {stage.title}
                </button>
              ))}
                  </div>
        
            {/* Stage Content */}
            <div className="space-y-4 max-w-4xl">
              {stages.find(stage => stage.id === currentStage)?.items.map((item, index) => (
                <div key={index}>
                  {index > 0 && <div className="h-px bg-white/40 my-4" />}
                  <div 
                    className="flex items-center justify-between gap-4 cursor-pointer group"
                    onClick={() => setSelectedItem(currentStage + '-' + index)}
                  >
                <div className="flex-1">
                        <h3 className="text-white text-lg font-medium mb-3">{item.title}</h3>
                        <div className="flex gap-3">
                          {item.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="text-white/70 text-sm"
                            >
                              #{tag}
                        </span>
                      ))}
                    </div>
                    </div>
                      <div className="relative w-5 h-5 flex-shrink-0 min-h-0">
                        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${
                          selectedItem === currentStage + '-' + index
                            ? 'bg-white border-white scale-100'
                            : 'border-white/40 group-hover:border-white/80 scale-95 group-hover:scale-100'
                        }`} />
                        {selectedItem === currentStage + '-' + index && (
                          <svg
                            className="absolute inset-0 w-full h-full text-black p-[3px] transform scale-90"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                </div>
              </div>
            ))}
            </div>
            
            {/* Desktop Bottom Button */}
            <div className="flex justify-end mt-12">
              <button
                onClick={handleTestScenarioClick}
                className={`w-full px-8 py-3 font-medium rounded-lg transition-all duration-300 ${
                  selectedItem
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'text-white border border-white/60 hover:border-white'
                }`}
              >
                테스트 시나리오 보기
              </button>
            </div>
            </div>
          </div>
          
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Stage Navigation */}
          <div className="flex space-x-4 mb-12">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id)}
                className={`text-base font-medium transition-all duration-300 pb-2 focus:outline-none focus-visible:outline-none ${
                currentStage === stage.id
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
              >
                {stage.title}
              </button>
            ))}
            </div>
              
          {/* Stage Content */}
          <div className="space-y-4 max-w-4xl">
          {stages.find(stage => stage.id === currentStage)?.items.map((item, index) => (
            <div key={index}>
              {index > 0 && <div className="h-px bg-white/40 my-4" />}
              <div 
                className="flex items-center justify-between gap-4 cursor-pointer group"
                onClick={() => setSelectedItem(currentStage + '-' + index)}
              >
                  <div className="flex-1">
                    <h3 className="text-white text-lg font-medium mb-3">{item.title}</h3>
                    <div className="flex gap-3">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-white/70 text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
          </div>
        </div>
                  <div className="relative w-5 h-5 flex-shrink-0 min-h-0">
                    <div className={`absolute inset-0 rounded-full border-2 transition-all duration-200 ${
                      selectedItem === currentStage + '-' + index
                        ? 'bg-white border-white scale-100'
                        : 'border-white/40 group-hover:border-white/80 scale-95 group-hover:scale-100'
                    }`} />
                    {selectedItem === currentStage + '-' + index && (
                      <svg
                        className="absolute inset-0 w-full h-full text-black p-[3px] transform scale-90"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
      </div>
                </div>
            </div>
          ))}
        </div>

        {/* Bottom Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleTestScenarioClick}
            className={`w-full sm:w-auto px-8 py-3 font-medium rounded-lg transition-all duration-300 ${
              selectedItem
                ? 'bg-white text-black hover:bg-gray-100'
                : 'text-white border border-white/60 hover:border-white'
            }`}
          >
            테스트 시나리오 보기
          </button>
          </div>
        </div>
      </div>

      {/* Lean Canvas Modals */}
      <LeanCanvasInputModal
        isOpen={isLeanCanvasInputOpen}
        onClose={() => setIsLeanCanvasInputOpen(false)}
        onSubmit={handleLeanCanvasSubmit}
      />

      <LeanCanvasResultModal
        isOpen={isLeanCanvasResultOpen}
        onClose={() => {
          setIsLeanCanvasResultOpen(false);
          setLeanCanvas(null);
          setError(null);
          setInputData(null);
        }}
        leanCanvas={leanCanvas}
        isLoading={isGenerating}
        error={error}
        inputData={inputData}
      />
    </section>
  );
};

// Pricing Section Component
const PricingSection = ({ onOpenModal }) => {
  const [selectedStage, setSelectedStage] = useState('pre-product');
  const [numberOfTesters, setNumberOfTesters] = useState(20);
  const [targetAge, setTargetAge] = useState('');
  const [targetGender, setTargetGender] = useState('');
  const [detailedTarget, setDetailedTarget] = useState('');
  const [includeLogin, setIncludeLogin] = useState(false);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const stages = [
    {
      id: 'pre-product',
      title: 'Pre-Product',
      description: '아이디어 검증 및 UX 설계 단계',
      basePrice: 12500
    },
    {
      id: 'product-market-fit',
      title: 'Product-Market Fit',
      description: 'MVP/프로토타입 시장성 검증 단계',
      basePrice: 18750
    },
    {
      id: 'scale-up',
      title: 'Scale-Up',
      description: '출시 후 성장 및 최적화 단계',
      basePrice: 25000
    }
  ];

  const ageOptions = [
    { value: '', label: '나이 제한 없음' },
    { value: '10-19', label: '10-19세' },
    { value: '20-29', label: '20-29세' },
    { value: '30-39', label: '30-39세' },
    { value: '40-49', label: '40-49세' },
    { value: '50+', label: '50세 이상' }
  ];

  const calculatePrice = () => {
    const selectedStageData = stages.find(stage => stage.id === selectedStage);
    let basePrice = selectedStageData ? selectedStageData.basePrice : 12500;
    let totalPrice = basePrice * numberOfTesters;
    
    // 상세 타겟팅 추가 비용
    if (detailedTarget.trim()) {
      totalPrice *= 1.2; // 20% 추가
    }
    
    // 로그인 기능 추가 비용
    if (includeLogin) {
      totalPrice *= 1.15; // 15% 추가
    }
    
    return Math.round(totalPrice);
  };

  // 실시간 업데이트를 위한 useEffect
  const [currentPrice, setCurrentPrice] = useState(calculatePrice());
  
  React.useEffect(() => {
    setCurrentPrice(calculatePrice());
  }, [selectedStage, numberOfTesters, detailedTarget, includeLogin]);

  return (
    <section className="pt-20 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 text-left fade-in">
          당신의 시간을 성공에<br/>투자하는 가장 현명한 플랜
        </h2>
        <p className="text-lg text-white/70 text-left mb-8 fade-in">
          프로젝트에 맞는 테스트 옵션을 선택하고 실시간으로 예상 비용을 확인하세요
        </p>

        {/* Plan Check Button */}
        {!showPlanDetails && (
          <div className="flex justify-start mb-16 fade-in">
            <button
              onClick={() => {
                console.log('Button clicked, setting showPlanDetails to true');
                setShowPlanDetails(true);
              }}
              className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300"
            >
              플랜 확인하기
            </button>
              </div>
        )}

        {/* Plan Details */}
        {showPlanDetails && (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Options */}
          <div className="space-y-8">
            {/* Test Stage Selection */}
                <div>
              <h3 className="text-xl font-semibold text-white mb-6">테스트 단계</h3>
              <div className="grid gap-4">
                {stages.map((stage) => (
                  <label
                    key={stage.id}
                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedStage === stage.id
                        ? 'border-white bg-white/10'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stage"
                      value={stage.id}
                      checked={selectedStage === stage.id}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">[{stage.title}]</div>
                      <div className="text-white/70 text-sm">{stage.description}</div>
            </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedStage === stage.id ? 'border-white bg-white' : 'border-white/50'
                    }`}>
                      {selectedStage === stage.id && (
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      )}
              </div>
                  </label>
          ))}
        </div>
      </div>

            {/* Number of Testers */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">테스트 인원</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-white">
                  <span>1명</span>
                  <span className="font-semibold">{numberOfTesters}명</span>
                  <span>100명</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={numberOfTesters}
                  onChange={(e) => setNumberOfTesters(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider focus:outline-none"
                />
              </div>
            </div>

            {/* Target Conditions */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">테스터 조건</h3>
              <div className="space-y-4">
                {/* Age Dropdown */}
                <div>
                  <label className="block text-white/80 mb-2">나이</label>
                  <select
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/60 transition-colors duration-200"
                  >
                    {ageOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-black text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
            </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-white/80 mb-2">성별</label>
                  <div className="flex gap-3">
                    {[
                      { value: '', label: '선택안함' },
                      { value: 'male', label: '남성' },
                      { value: 'female', label: '여성' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTargetGender(option.value)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-300 focus:outline-none ${
                          targetGender === option.value
                            ? 'border-white bg-white/10 text-white'
                            : 'border-white/30 text-white/70 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                      ))}
            </div>
        </div>
        
                {/* Detailed Target */}
                <div>
                  <label className="block text-white/80 mb-2">상세타겟</label>
                  <textarea
                    value={detailedTarget}
                    onChange={(e) => setDetailedTarget(e.target.value)}
                    placeholder="예: 의료 업계 종사자, OTT 구독 경험 1년 이상"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/60 min-h-[80px] transition-colors duration-200"
                  />
            </div>
          </div>
        </div>

            {/* Login Feature Toggle */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">로그인 기능</h3>
              <div className="flex items-center justify-between">
                <span className="text-white/80">로그인/회원가입 과정이 필요한가요?</span>
                <button
                  onClick={() => setIncludeLogin(!includeLogin)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none min-h-0 ${
                    includeLogin ? 'bg-white' : 'bg-white/30'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform duration-300 ${
                      includeLogin ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
      </div>
            </div>
          </div>

          {/* Right Side - Summary & Price */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              {/* Estimated Price */}
              <div className="text-center mb-8">
                <h3 className="text-lg text-white/80 mb-2">예상 비용</h3>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 transition-all duration-500">
                  ₩ {currentPrice.toLocaleString()}
                </div>
                <p className="text-white/60 text-sm">VAT 별도</p>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-8">
                <h4 className="text-lg font-semibold text-white mb-4">선택 항목 요약</h4>
                <div className="space-y-2 text-white/80">
                  <div className="flex justify-between">
                    <span>테스트 단계:</span>
                    <span>{stages.find(s => s.id === selectedStage)?.title}</span>
              </div>
                  <div className="flex justify-between">
                    <span>테스터:</span>
                    <span>{numberOfTesters}명</span>
            </div>
                  <div className="flex justify-between">
                    <span>나이 조건:</span>
                    <span>{targetAge || '제한 없음'}</span>
        </div>
                  <div className="flex justify-between">
                    <span>성별 조건:</span>
                    <span>{targetGender === 'male' ? '남성' : targetGender === 'female' ? '여성' : '선택안함'}</span>
      </div>
                  <div className="flex justify-between">
                    <span>상세 타겟:</span>
                    <span className="text-right max-w-[150px] truncate">
                      {detailedTarget.trim() || '없음'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>로그인 테스트:</span>
                    <span>{includeLogin ? '포함' : '미포함'}</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={onOpenModal}
                className="w-full py-4 px-6 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                이 조건으로 테스트 시작하기
              </button>
            </div>
          </div>
        </div>
        )}

      </div>

      {/* Bottom Images - Full width, no padding */}
      <div className="mt-16">
        {/* Mobile Image */}
        <div className="block lg:hidden">
          <img 
            src="/images/rideshare_feature-mobile.jpg" 
            alt="Rideshare Feature Mobile" 
            className="w-full h-auto"
          />
        </div>
        
        {/* Desktop Image */}
        <div className="hidden lg:block">
          <img 
            src="/images/rideshare_feature.jpg" 
            alt="Rideshare Feature" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

// Solution Section Component
const SolutionSection = ({ onOpenModal }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const steps = [
    {
      title: "Step 1. 테스트 설계",
      description: "검증하고 싶은 시나리오와 핵심 목표를 알려주세요. Pylot이 최적의 테스트 계획을 자동으로 구성합니다.",
      image: "/images/effect-1.png"
    },
    {
      title: "Step 2. 실사용자 테스트 실행",
      description: "타겟 페르소나와 완벽히 일치하는 실제 사용자들이 당신의 서비스를 직접 경험하고, 영상, 음성을 포함한 모든 행동 데이터가 수집됩니다.",
      image: "/images/effect-2.png"
    },
    {
      title: "Step 3. AI 인사이트 리포트",
      description: "단순한 피드백이 아닌, 데이터 기반의 명확한 문제점을 찾아냅니다. AI가 구체적인 개선 방안까지 포함된 최종 리포트를 제공합니다.",
      image: "/images/effect-3.png"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  // 터치 이벤트 처리
  const handleTouchStart = (e) => {
    console.log('Touch start:', e.targetTouches[0].clientX);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // 스크롤 방지
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !touchEnd) {
      console.log('No touch data:', { touchStart, touchEnd });
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;
    
    console.log('Touch end:', { 
      touchStart, 
      touchEnd, 
      distance, 
      currentSlide,
      isLeftSwipe, 
      isRightSwipe 
    });

    if (isLeftSwipe && currentSlide < steps.length - 1) {
      console.log('Swiping to next slide');
      e.preventDefault();
      nextSlide();
    } else if (isRightSwipe && currentSlide > 0) {
      console.log('Swiping to previous slide');
      e.preventDefault();
      prevSlide();
    }
    
    // 상태 초기화
    setTouchStart(null);
    setTouchEnd(null);
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 0) {
      prevSlide();
    } else if (e.key === 'ArrowRight' && currentSlide < steps.length - 1) {
      nextSlide();
    }
  };

  // 마우스 휠 이벤트 처리
  const handleWheel = (e) => {
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    
    if (isHorizontalScroll) {
      e.preventDefault();
      if (e.deltaX > 10 && currentSlide < steps.length - 1) {
        nextSlide();
      } else if (e.deltaX < -10 && currentSlide > 0) {
        prevSlide();
      }
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 fade-in max-w-3xl">
            데이터로 아이디어의 <br/> 성공 항로를 설계합니다.
        </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl fade-in">
            3단계 프로토콜로 확실한 인사이트를 얻으세요
          </p>
          </div>
          
          <div className="relative fade-in">
          {/* Carousel Container */}
          {/* Mobile View */}
          <div 
            className="block lg:hidden relative h-[500px] overflow-hidden rounded-2xl select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <div 
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
            {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full relative cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(index);
                  }}
                >
                  {/* Background with reduced blur */}
                  <div className="relative h-full">
                    <img
                      src={step.image}
                      alt={step.title}
                      className={`w-full h-full object-cover transition-transform duration-400 ${
                        index === currentSlide ? 'animate-image-highlight' : ''
                      } ${index === 2 ? 'object-center' : 'object-top'}`}
                    />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
              </div>
              
                  {/* Content - Bottom aligned */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 pb-8 pointer-events-none">
                    <h3 
                      className={`text-xl sm:text-2xl font-bold mb-3 transition-all duration-1000 ${
                        index === currentSlide ? 'gradient-text-active' : 'text-white'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p 
                      className={`text-white/80 text-sm max-w-xl transition-all duration-1000 transform ${
                        index === currentSlide
                          ? 'translate-y-0 opacity-100 delay-400'
                          : 'translate-y-4 opacity-0'
                      }`}
                    >
                      {index === currentSlide ? step.description : ''}
                    </p>
            </div>
            </div>
          ))}
        </div>
        </div>
        
          {/* Desktop View */}
          <div 
            className="hidden lg:block relative h-[600px] overflow-hidden"
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-center justify-center h-full gap-6 px-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-out ${
                    index === currentSlide
                      ? 'w-[580px] h-[450px] opacity-100 scale-[1.02] z-10'
                      : 'w-[420px] h-[380px] opacity-75 scale-[0.98] hover:opacity-90 hover:scale-100'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                >
                  {/* Background with reduced blur - Desktop no cropping */}
                  <div className="relative h-full">
                    <img
                      src={step.image}
                      alt={step.title}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        index === currentSlide ? 'animate-image-highlight' : ''
                      } ${index === 2 ? 'object-center' : 'object-top'}`}
                    />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
          </div>
          
                  {/* Content Container - Bottom aligned for desktop too */}
                  <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 pb-8 pointer-events-none">
                    {/* Title - Always visible with size animation */}
                    <h3 className={`font-bold mb-4 leading-tight transition-all duration-1000 ${
                      index === currentSlide 
                        ? 'text-xl lg:text-2xl gradient-text-active opacity-100 scale-105' 
                        : 'text-sm lg:text-base text-white/90 opacity-90 scale-100'
                    }`}>
                      {step.title}
                    </h3>
                    
                    {/* Description - Always present but invisible when not active */}
                    <p className={`text-white/80 text-sm lg:text-base max-w-md leading-relaxed transition-all duration-1000 ${
                      index === currentSlide
                        ? 'opacity-100 translate-y-0 delay-400'
                        : 'opacity-0 translate-y-2'
                    }`}>
                      {step.description}
                    </p>
            </div>
            </div>
          ))}
        </div>
        </div>
        
          {/* Navigation Row - Bottom */}
          <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-between px-4">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center text-white focus:outline-none focus-visible:outline-none active:outline-none"
              style={{ outline: 'none', border: 'none' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
          </button>

            {/* Dots Navigation - Center */}
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 min-h-0 min-w-0 p-0 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white scale-110'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
        </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center text-white focus:outline-none focus-visible:outline-none active:outline-none"
              style={{ outline: 'none', border: 'none' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
          </button>
        </div>
        </div>


      </div>
    </section>
  );
};







// Tester Recruitment Section Component
const TesterRecruitmentSection = ({ onOpenPilotModal }) => {
  return (
    <section className="bg-black">
      {/* Hero Section with Background Image */}
      <div className="py-20 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/HS-hero.webp)' }}
        ></div>
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/70"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white my-6 fade-in">
              스마트폰 15분, 새로운 수익
          </h2>
        
            <p className="text-lg sm:text-lg font-medium text-white mb-6 fade-in">
              당신의 경험을 가치로 만들어보세요
            </p>
            

            </div>
          </div>
        </div>
        
      {/* Content Section with Black Background */}
      <div className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 text-left">
              <p className="text-base sm:text-lg text-white/90 leading-relaxed fade-in mt-6">
                출퇴근길 단 15분, 당신의 솔직한 경험이 새로운 서비스를 만드는 최고의 피드백이 됩니다. 테스트 매칭을 위한 당신의 관심사와 프로필을 알려주세요. 내게 꼭 맞는 새로운 테스트가 등록되면 채널톡 알림을 보내드려요. 안내에 따라 편안하게 테스트를 진행해주세요.
              </p>
              
              <p className="text-base sm:text-lg text-white/90 leading-relaxed fade-in">
                당신의 소중한 시간에 대한 합리적인 보상, 테스트 완료 즉시 지급되는 리워드로 지금 바로 경험하세요.
              </p>
              
        </div>
            
            {/* Process Steps Graph */}
            <div className="mt-12 mb-8 fade-in">
              <div className="relative max-w-2xl mx-auto">
                {/* Text Labels */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-xs sm:text-sm font-medium">수락</span>
                  <span className="text-white text-xs sm:text-sm font-medium">설치</span>
                  <span className="text-white text-xs sm:text-sm font-medium">수행</span>
                  <span className="text-white text-xs sm:text-sm font-medium">제출</span>
                  <span className="text-white text-xs sm:text-sm font-medium">리워드</span>
      </div>
                
                {/* Dots and Lines */}
                <div className="relative flex items-center justify-between px-1 pr-3">
                  {/* Step 1 */}
                  <div className="relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full shadow-2xl"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-sm opacity-80"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-md opacity-40"></div>
      </div>
      
                  {/* Line 1 */}
                  <div className="flex-1 h-px bg-gradient-to-r from-white/60 to-white/40"></div>
                  
                  {/* Step 2 */}
                  <div className="relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full shadow-2xl"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-sm opacity-80"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-md opacity-40"></div>
                  </div>
                  
                  {/* Line 2 */}
                  <div className="flex-1 h-px bg-gradient-to-r from-white/60 to-white/40"></div>
                  
                  {/* Step 3 */}
                  <div className="relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full shadow-2xl"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-sm opacity-80"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-md opacity-40"></div>
                  </div>
                  
                  {/* Line 3 */}
                  <div className="flex-1 h-px bg-gradient-to-r from-white/60 to-white/40"></div>
                  
                  {/* Step 4 */}
                  <div className="relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full shadow-2xl"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-sm opacity-80"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-md opacity-40"></div>
                  </div>
                  
                  {/* Line 4 */}
                  <div className="flex-1 h-px bg-gradient-to-r from-white/60 to-white/40"></div>
                  
                  {/* Step 5 */}
                  <div className="relative z-10">
                    <div className="w-3 h-3 bg-white rounded-full shadow-2xl"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-sm opacity-80"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full blur-md opacity-40"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Button at the bottom */}
            <div className="flex justify-center mt-12 fade-in">
            <button
                onClick={onOpenPilotModal}
                className="w-full sm:w-96 lg:w-[500px] px-8 py-4 border border-white text-white font-semibold text-lg rounded-lg hover:bg-white hover:text-black transition-all duration-300 focus:outline-none"
            >
                지금 파일럿 되기
            </button>
          </div>
        </div>
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
              데이터로 증명하고, 확신으로 출시하세요.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white text-sm">문의하기</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm">이용약관</a></li>
              <li><a href="#" className="text-white/60 hover:text-white text-sm">개인정보처리방침</a></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-white/40 text-sm">
            © 2025 Pylot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);
  
  useScrollAnimation();

// Styles are now handled by CSS imports

  return (
    <div className="min-h-screen">
      <Header onOpenModal={() => setIsModalOpen(true)} />
      <HeroSection onOpenModal={() => setIsModalOpen(true)} />
      <IntroSection />
      <OnboardingSection />
      {/* <GlobeSection /> */}
      <SolutionSection onOpenModal={() => setIsModalOpen(true)} />
      <StageSection />
      <PricingSection onOpenModal={() => setIsModalOpen(true)} />
      <TesterRecruitmentSection onOpenPilotModal={() => setIsPilotModalOpen(true)} />
      <Footer />
      
      <ApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <PilotRegistrationModal 
        isOpen={isPilotModalOpen} 
        onClose={() => setIsPilotModalOpen(false)} 
      />
    </div>
  );
};

export default App;