import React, { useState, useEffect, useRef } from 'react';
import Globe from 'globe.gl';

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
        <div className="mb-8">
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

export default GlobeSection;
