import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 註冊 GSAP 滾動插件
gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef(null); 
  const containerRef = useRef(null);
  
  // 核心動畫 Refs
  const egretHeadRef = useRef(null);
  const egretNeckRef = useRef(null);
  const crabRef = useRef(null);
  const textRef = useRef(null);
  
  // 🌊 流體海浪專用 Refs
  const waveContainerRef = useRef(null);
  const fluid1Ref = useRef(null);
  const fluid2Ref = useRef(null);
  const fluid3Ref = useRef(null);

  // 選項 A：填海造地互動 Refs
  const concreteRef = useRef(null);
  const mudflatRef = useRef(null);
  const poorCrabsRef = useRef([]);
  const btnRef = useRef(null);

  // 選項 B：儀表板 Refs
  const dashboardRef = useRef(null);

  // 【新增】迷你地圖的年份狀態
  const [mapYear, setMapYear] = useState(2025);
  const [hoveredPath, setHoveredPath] = useState('');
  const mapIframeRef = useRef(null);

  const showRedPoints = () => {
    if (mapIframeRef.current?.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'showRed' }, window.location.origin);
    }
  };

  const showBluePoints = () => {
    if (mapIframeRef.current?.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'showBlue' }, window.location.origin);
    }
  };

  const showBothPoints = () => {
    if (mapIframeRef.current?.contentWindow) {
      mapIframeRef.current.contentWindow.postMessage({ type: 'showBoth' }, window.location.origin);
    }
  };

  // 【物理引擎核心】：白鷺的骨架座標
  const animState = useRef({
    headX: 5, headY: -75, headRot: 0,
    c1X: -25, c1Y: -20, c2X: 10, c2Y: -50,
    crabX: 150, crabY: 170, crabRot: 0, crabScale: 1, crabOpacity: 1
  }).current;

  // 【全局動畫與 ScrollTrigger】
  useEffect(() => {
    let ctx = gsap.context(() => {
      
      // --- 🌊 背景流體持續波動動畫 ---
      gsap.to(fluid1Ref.current, { rotation: 360, duration: 18, repeat: -1, ease: "none" });
      gsap.to(fluid2Ref.current, { rotation: -360, duration: 22, repeat: -1, ease: "none" });
      gsap.to(fluid3Ref.current, { rotation: 360, duration: 28, repeat: -1, ease: "none" });

      // --- 首屏動畫：白鷺掠食 ---
      const renderFrame = () => {
        if(egretHeadRef.current) egretHeadRef.current.style.transform = `translate(${animState.headX}px, ${animState.headY}px) rotate(${animState.headRot}deg)`;
        if(egretNeckRef.current) egretNeckRef.current.setAttribute('d', `M 0,0 C ${animState.c1X},${animState.c1Y} ${animState.c2X},${animState.c2Y} ${animState.headX},${animState.headY}`);
        if(crabRef.current) {
          crabRef.current.style.transform = `translate(${animState.crabX}px, ${animState.crabY}px) rotate(${animState.crabRot}deg) scale(${animState.crabScale})`;
          crabRef.current.style.opacity = animState.crabOpacity;
        }
      };
      renderFrame();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", 
          end: "+=2500", 
          scrub: 1,      
          pin: true,     
        }
      });

      tl.to(textRef.current, { opacity: 0, y: -50, duration: 0.8 }, 0)
        .to(animState, { headX: -10, headY: -60, headRot: -15, c1X: -40, c1Y: -10, c2X: 20, c2Y: -30, duration: 0.8, ease: "power2.inOut", onUpdate: renderFrame }, "aim")
        .to(animState, { headX: 110, headY: 155, headRot: 35, c1X: 30, c1Y: 50, c2X: 70, c2Y: 100, duration: 0.25, ease: "power4.in", onUpdate: renderFrame }, "strike")
        .to(animState, { headX: -5, headY: -85, headRot: -25, c1X: -20, c1Y: -30, c2X: 20, c2Y: -50, crabX: 35, crabY: -75, crabRot: 720, duration: 1.2, ease: "power2.out", onUpdate: renderFrame }, "pull")
        .to(animState, { headY: -95, headRot: -45, crabX: 10, crabY: -80, crabScale: 0, crabOpacity: 0, duration: 0.4, ease: "back.in(2)", onUpdate: renderFrame }, "swallow")
        .to(animState, { headX: 5, headY: -75, headRot: 0, c1X: -25, c1Y: -20, c2X: 10, c2Y: -50, duration: 1, ease: "power2.inOut", onUpdate: renderFrame }, "relax")
        
        // 6. 🌊 終極版海嘯
        .to(waveContainerRef.current, { 
          y: "-300vh", 
          duration: 3, 
          ease: "power2.inOut" 
        }, "relax+=0.5");

      // --- 儀表板動畫 ---
      const bars = gsap.utils.toArray('.stat-bar');
      const nums = gsap.utils.toArray('.stat-num');
      
      ScrollTrigger.create({
        trigger: dashboardRef.current,
        start: "top 80%", 
        onEnter: () => {
          gsap.to(bars, { width: (i, el) => el.getAttribute("data-width"), duration: 1.5, ease: "power3.out", stagger: 0.3 });
          gsap.to(nums, { innerHTML: (i, el) => parseFloat(el.getAttribute("data-target")), duration: 1.5, snap: { innerHTML: 0.01 }, ease: "power3.out", stagger: 0.3 });
        },
        once: true 
      });

    }, appRef); 

    return () => ctx.revert();
  }, [animState]);

  // 【選項 A：填海造地動畫觸發函數】
  const triggerReclamation = () => {
    if (btnRef.current.disabled) return;
    btnRef.current.disabled = true;

    const tl = gsap.timeline();
    tl.to(concreteRef.current, { y: 0, duration: 0.8, ease: "bounce.out" })
      .to(mudflatRef.current, { backgroundColor: "#64748b", borderColor: "#475569", duration: 0.3 }, "-=0.6")
      .to(mudflatRef.current, { x: -15, y: 5, duration: 0.05, yoyo: true, repeat: 7 }, "-=0.6")
      .to(mudflatRef.current, { x: 0, y: 0, duration: 0.05 })
      .to(poorCrabsRef.current, { scaleY: 0.1, opacity: 0, duration: 0.2, stagger: 0.1 }, "-=0.7");
      
    btnRef.current.innerText = "生態已遭破壞";
    btnRef.current.classList.add("bg-slate-600", "cursor-not-allowed");
    btnRef.current.classList.remove("bg-red-600", "hover:bg-red-500");
  };

  return (
    <div ref={appRef} className="bg-[#eef2f5] min-h-screen font-sans overflow-x-hidden text-slate-800">
      
      {/* ================= 首屏：高階物理演算動畫區 ================= */}
      <div ref={containerRef} className="h-screen w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-100 to-[#d0b49f]">
        <div ref={textRef} className="absolute top-16 md:top-12 text-center z-40 px-4 max-w-4xl md:max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold text-slate-800 mb-4 tracking-wide shadow-sm">
            <span className="emoji-override">🕊️</span> Urbanization’s Cascading Effects
          </h1>
        </div>

        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center z-40 px-4">
          <div className="mt-4 flex justify-center">
            <span className="text-5xl md:text-6xl xl:text-7xl text-slate-900 animate-bounce">↓</span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-30"></div>

        <div className="absolute left-[18%] top-[55%] lg:top-[52%] z-20 overflow-visible scale-[0.95] md:scale-100 lg:scale-110 xl:scale-125">
          {/* 白鷺身體 */}
          <div className="absolute z-30" style={{ left: -25, top: -5 }}>
             <svg width="100" height="70" viewBox="-10 -10 120 90" className="overflow-visible">
               <path d="M 0,20 C 0,-10 60,-10 80,10 C 100,30 90,60 50,60 C 10,60 0,50 0,20 Z" fill="#ffffff" filter="drop-shadow(0px 8px 10px rgba(0,0,0,0.15))" />
               <path d="M 15,25 Q 60,10 85,30 Q 60,50 20,45 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
             </svg>
          </div>
          {/* 白鷺腿 */}
          <div className="absolute z-10 flex gap-4" style={{ left: 20, top: 40 }}>
            <div className="w-1.5 h-[140px] bg-[#d97706]"></div>
            <div className="w-1.5 h-[140px] bg-[#d97706]"></div>
          </div>
          {/* 白鷺脖子 */}
          <svg className="absolute z-20 overflow-visible" style={{ left: 0, top: 0 }}>
             <path ref={egretNeckRef} fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"/>
          </svg>
          {/* 白鷺頭部 */}
          <div ref={egretHeadRef} className="absolute z-40" style={{ transformOrigin: 'center bottom', left: -25, top: -20 }}>
             <svg width="80" height="40" viewBox="0 0 80 40" className="overflow-visible">
                <path d="M 40,20 L 85,25 L 40,28 Z" fill="#1e293b" />
                <path d="M 45,22 C 45,5 20,0 10,10 C 0,20 5,35 25,35 C 35,35 45,30 45,22 Z" fill="#ffffff" />
                <circle cx="30" cy="15" r="3.5" fill="#000000" />
                <circle cx="31" cy="14" r="1" fill="#ffffff" />
             </svg>
          </div>
          {/* 小螃蟹 */}
          <div ref={crabRef} className="absolute z-30" style={{ transformOrigin: 'center center' }}>
             <svg width="40" height="30" viewBox="0 0 40 30" className="overflow-visible">
               <path d="M10,20 Q0,10 -5,25 M15,22 Q5,15 0,30 M30,20 Q40,10 45,25 M25,22 Q35,15 40,30" stroke="#b91c1c" strokeWidth="2" fill="none" />
               <path d="M10,15 Q-5,0 5,5 M30,15 Q45,0 35,5" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
               <ellipse cx="20" cy="18" rx="14" ry="10" fill="#dc2626" />
               <circle cx="14" cy="8" r="3" fill="white" /><circle cx="14" cy="8" r="1.5" fill="black" />
               <circle cx="26" cy="8" r="3" fill="white" /><circle cx="26" cy="8" r="1.5" fill="black" />
             </svg>
          </div>
        </div>

        <div className="absolute bottom-0 w-full h-[25vh] bg-[#a98467] border-t-4 border-[#8a6b52] z-0 shadow-inner"></div>
        
        {/* ================= 🌊 終極防漏水流體海浪 ================= */}
        <div ref={waveContainerRef} className="absolute top-[150vh] left-0 w-full z-50 pointer-events-none flex justify-center">
          <div ref={fluid1Ref} className="absolute top-[0vh] w-[400vw] h-[400vw] rounded-[43%] bg-sky-400 opacity-90"></div>
          <div ref={fluid2Ref} className="absolute top-[30vh] w-[400vw] h-[400vw] rounded-[45%] bg-blue-600 opacity-95"></div>
          <div ref={fluid3Ref} className="absolute top-[100vh] w-[400vw] h-[400vw] rounded-[40%] bg-slate-900"></div>
          <div className="absolute top-[150vh] w-[200vw] h-[300vh] bg-slate-900"></div>
        </div>
      </div>

      {/* ================= 第二屏：海報學術內容區 ================= */}
      <div className="bg-slate-900 text-white min-h-screen py-24 px-6 md:px-12 flex flex-col items-center relative z-40">
        <div className="max-w-7xl w-full space-y-24">
          
          {/* 標題與摘要 */}
          <div className="text-center border-b border-slate-700 pb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-blue-300 mb-6 leading-tight">
              Urbanization’s Cascading Effects on Macao's Coastal Benthos and Apex Predators
            </h2>
            <p className="text-slate-400 text-xl tracking-wide mb-8">An Analysis Based on Biodiversity Indices and Mediation Modeling</p>
            <p className="text-slate-500 text-sm">Team: Sin Chak Ken, Lam Cheng Hou, Yeung Hiu Pok, Cheong U Hou, Lei Seng Chon</p>
          </div>

          {/* ABSTRACT & IMAGE */}
          <div className="grid grid-cols-1 gap-12 text-lg">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">
              <div>
                <h3 className="text-2xl font-bold text-amber-400 mb-6 border-l-4 border-amber-400 pl-4">ABSTRACT</h3>
                <p className="text-slate-300 leading-relaxed text-justify">
                  澳門沿岸被視為高度城市化的代表，其海岸線經歷了深度的城市化，改變了沿海的底棲棲息地，並可能影響了以底棲生物為食的頂級掠食者（如小白鷺 Egretta garzetta）。本研究旨在建立生物多樣性指數模型，探討棲地硬化如何引發生態營養級聯效應 (Trophic Cascade)。
                </p>
              </div>

              <div className="flex items-center justify-center">
                <img
                  src="/abstract-picture.jpg"
                  alt="Macao coastal ecology illustration"
                  className="w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-amber-400 mb-6 border-l-4 border-amber-400 pl-4">INTRODUCTION & BACKGROUND</h3>
              <p className="text-slate-300 leading-relaxed text-justify">
                傳統的海岸防護工程通常依賴於像混凝土海堤這種硬質結構，取代了天然的軟泥灘。這種「棲地同質化」(Habitat Homogenization) 嚴重影響了底棲生態系統，從而剝奪了鳥類的覓食地。本研究利用中介回歸模型探討填海工程對食物網的影響。
              </p>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* 棲地硬化與互動按鈕 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="h-full flex flex-col">
                <h2 className="text-3xl font-bold mb-6 text-blue-300">HABITAT HARDENING</h2>
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 h-full flex flex-col justify-between">
                   <div>
                     <p className="text-lg leading-relaxed text-slate-300 mb-6">
                       岸線硬化直接剝奪了潮間帶生物生存空間。點擊下方按鈕，模擬海堤建設對天然泥灘的毀滅性打擊。
                     </p>
                     <div className="relative w-full h-64 bg-[#a98467] rounded-lg overflow-hidden border border-slate-600 flex flex-col items-center justify-end" ref={mudflatRef}>
                        <div ref={concreteRef} className="absolute top-0 left-0 w-full h-[85%] bg-slate-400 border-b-8 border-slate-500 flex items-center justify-center z-20 -translate-y-[120%]">
                           <span className="text-slate-700 font-bold text-2xl tracking-widest opacity-30">CONCRETE</span>
                        </div>
                        <div className="w-full flex justify-around px-10 pb-4 z-10">
                           {[1, 2, 3, 4].map((_, i) => (
                             <svg key={i} ref={el => poorCrabsRef.current[i] = el} width="30" height="20" viewBox="0 0 40 30" className="overflow-visible">
                               <path d="M10,20 Q0,10 -5,25 M15,22 Q5,15 0,30 M30,20 Q40,10 45,25 M25,22 Q35,15 40,30" stroke="#b91c1c" strokeWidth="2" fill="none" />
                               <ellipse cx="20" cy="18" rx="14" ry="10" fill="#dc2626" />
                             </svg>
                           ))}
                        </div>
                        <button ref={btnRef} onClick={triggerReclamation} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300">
                          ⚠️ 執行填海工程
                        </button>
                     </div>
                   </div>
                </div>
             </div>

             {/* 公式與數據區 */}
             <div className="h-full flex flex-col">
                <h2 className="text-3xl font-bold mb-6 text-blue-300">DATA COMPILATION</h2>
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 h-full flex flex-col justify-between">
                   <div>
                     <p className="text-slate-300 mb-4">我們利用 2025-2026 澳門沿岸生態觀察數據，計算了多樣性指數：</p>
                     
                     <div className="bg-slate-900 p-4 rounded mb-4 text-center text-base text-emerald-300">
                       1. Shannon-Wiener Index (H') <br/>
                       <span className="text-xl mt-2 block">H' = - ∑ P<sub>i</sub> ln(P<sub>i</sub>)</span>
                     </div>
                     
                     <div className="bg-slate-900 p-4 rounded mb-4 text-center text-base text-amber-300">
                       2. Simpson Index (D) <br/>
                       <span className="text-xl mt-2 block">D = 1 - ∑ P<sub>i</sub><sup>2</sup></span>
                     </div>
                   </div>
                   
                   <p className="text-slate-400 text-sm mt-4 text-center">
                     * 用於評估多樣性崩塌與優勢物種的集中度。
                   </p>
                </div>
             </div>
          </div>

          <hr className="border-slate-800" />

          {/* 動態儀表板與中介模型 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="h-full min-h-[520px] flex flex-col">
                <h2 className="text-3xl font-bold mb-6 text-blue-300">BENTHIC COLLAPSE</h2>
                <div ref={dashboardRef} className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 h-full flex flex-col justify-between text-base md:text-lg">
                    <h3 className="text-xl font-bold mb-8 text-slate-200 border-b border-slate-600 pb-4">生態多樣性指數 (H') 崩潰對比</h3>
                    <div className="space-y-10">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-emerald-400 font-bold">天然軟相泥灘</span>
                                <span className="text-3xl font-bold stat-num" data-target="2.93">0.00</span>
                            </div>
                            <div className="w-full bg-slate-700 h-6 rounded-r-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 stat-bar" style={{ width: "0%" }} data-width="85%"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-red-400 font-bold">人工混凝土海堤</span>
                                <span className="text-3xl font-bold stat-num" data-target="1.29">0.00</span>
                            </div>
                            <div className="w-full bg-slate-700 h-6 rounded-r-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-red-700 to-red-500 stat-bar" style={{ width: "0%" }} data-width="35%"></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      由於城市干預，豐富的底棲生物退化為以單一優勢物種（如四齒大額蟹）為主的生態系統。覓食效率的大幅下降，使得小白鷺出現了「覓食荒漠」現象。
                    </p>
                </div>
             </div>

             {/* 新增互動 1：中介效應路徑圖 */}
             <div className="h-full min-h-[520px] flex flex-col">
                <h2 className="text-3xl font-bold mb-6 text-blue-300">MEDIATION MODELING</h2>
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 h-full flex flex-col justify-between text-base md:text-lg">
                  <p className="text-slate-300 mb-8">將滑鼠移到路徑上以查看中介係數：</p>
                  
                  <div className="relative w-full h-[360px] md:h-[420px] lg:h-[460px]">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="16" y1="18" x2="84" y2="18" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                      <line x1="19" y1="22" x2="50" y2="66" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="81" y1="22" x2="50" y2="66" stroke="#94a3b8" strokeWidth="1.5" />
                    </svg>

                    <div className="absolute left-[14.5%] top-[10.5%] z-10">
                      <div className="bg-slate-900 border-2 border-red-500 p-4 rounded-full w-28 h-28 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        填海工程
                      </div>
                    </div>

                    <div className="absolute left-1/2 top-[56%] -translate-x-1/2 z-10">
                      <div className="bg-slate-900 border-2 border-amber-500 p-4 rounded-full w-28 h-28 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        底棲生物
                      </div>
                    </div>

                    <div className="absolute right-[14.5%] top-[10.5%] z-10">
                      <div className="bg-slate-900 border-2 border-sky-500 p-4 rounded-full w-28 h-28 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                        小白鷺
                      </div>
                    </div>

                    <button type="button" onMouseEnter={() => setHoveredPath('direct')} onMouseLeave={() => setHoveredPath('')} className="absolute top-[14%] left-[18%] w-[64%] h-[16%] cursor-help bg-transparent border-none">
                      <span className={`${hoveredPath === 'direct' ? 'opacity-100' : 'opacity-0'} pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded text-red-300 transition-opacity z-20`}>
                        直接路徑
                      </span>
                    </button>

                    <button type="button" onMouseEnter={() => setHoveredPath('a')} onMouseLeave={() => setHoveredPath('')} className="absolute top-[18%] left-[6%] w-[32%] h-[58%] cursor-help bg-transparent border-none">
                      <span className={`${hoveredPath === 'a' ? 'opacity-100' : 'opacity-0'} pointer-events-none absolute -top-8 left-0 bg-slate-900 px-3 py-1 rounded text-amber-300 transition-opacity z-20`}>
                        路徑A：棲地流失
                      </span>
                    </button>

                    <button type="button" onMouseEnter={() => setHoveredPath('b')} onMouseLeave={() => setHoveredPath('')} className="absolute top-[18%] right-[6%] w-[32%] h-[58%] cursor-help bg-transparent border-none">
                      <span className={`${hoveredPath === 'b' ? 'opacity-100' : 'opacity-0'} pointer-events-none absolute -top-8 right-0 bg-slate-900 px-3 py-1 rounded text-sky-300 transition-opacity z-20`}>
                        路徑B：營養級擾動
                      </span>
                    </button>
                  </div>
                </div>
             </div>
          </div>

          <hr className="border-slate-800" />

          {/* 新增互動 2：微棲地探照燈 (Embankment Anomaly) */}
{/* ================= 互動 2：微棲地探照燈 (Embankment Anomaly) ================= */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-blue-300 text-center">EMBANKMENT ANOMALY & MICRO-REFUGIA</h2>
            <p className="text-center text-slate-300 mb-10 max-w-3xl mx-auto">
              在海岸調查中，我們發現了「異常現象」：多孔的拋石防波堤雖然是人工建築，但其複雜的微間隙 (Micro-gap) 為底棲生物提供了避難所。<b>請將滑鼠移過下方的海堤進行探索：</b>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[350px] md:h-[420px] xl:h-[500px]">
              
              {/* === 左側：平滑混凝土海堤 (Smooth Seawall) === */}
              <div className="bg-slate-800 rounded-xl relative overflow-hidden border-2 border-slate-600 flex flex-col justify-end group shadow-lg">
                 <div className="absolute top-4 left-4 text-white font-bold z-30 drop-shadow-md">平滑混凝土海堤 (Smooth Seawall)</div>
                 
                 <div className="w-full h-full relative flex items-end">
                    {/* 背景天空 */}
                    <div className="absolute inset-0 bg-slate-700/50"></div>
                    
                    {/* 巨大的平滑水泥斜坡 */}
                    <div className="w-full h-[85%] bg-slate-400 relative z-10 border-t-8 border-slate-300 shadow-[inset_0_-20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:bg-slate-500" 
                         style={{ clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)' }}>
                       {/* 水泥表面紋理 */}
                       <div className="w-full h-full opacity-10" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)' }}></div>
                    </div>
                    
                    {/* 底部死水 */}
                    <div className="absolute bottom-0 w-full h-[25%] bg-sky-900/60 z-20 border-t-2 border-sky-300/30"></div>
                    
                    {/* 文字提示 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center w-full pointer-events-none">
                       <p className="text-slate-200 font-bold text-2xl tracking-widest drop-shadow-lg opacity-40 group-hover:opacity-100 transition-opacity duration-300">零微間隙</p>
                       <p className="text-red-400 font-bold text-lg mt-2 drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">生物無法藏身</p>
                    </div>
                 </div>
              </div>

              {/* === 右側：多孔拋石防波堤 (Porous Riprap) === */}
              <div className="bg-slate-800 rounded-xl relative overflow-hidden border-2 border-slate-600 group cursor-crosshair shadow-lg">
                 <div className="absolute top-4 left-4 text-white font-bold z-30 drop-shadow-md">多孔拋石防波堤 (Porous Riprap)</div>
                 
                 <div className="absolute bottom-0 w-full h-[95%] flex items-end justify-center">
                    
                    {/* 🦀 站在岩石上的螃蟹 (Z-index 提高到 30，並精準對齊石頭尖端) */}
                    <div className="absolute bottom-[26%] left-[13%] text-5xl transition-all duration-500 translate-y-8 scale-50 origin-bottom group-hover:translate-y-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-30 drop-shadow-[0_5px_10px_rgba(239,68,68,0.8)]">🦀</div>
                    <div className="absolute bottom-[44%] left-[46%] text-6xl transition-all duration-700 translate-y-12 scale-50 origin-bottom group-hover:translate-y-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-30 delay-75 drop-shadow-[0_8px_15px_rgba(239,68,68,0.9)]">🦀</div>
                    <div className="absolute bottom-[32%] left-[82%] text-4xl transition-all duration-300 translate-y-6 scale-50 origin-bottom group-hover:translate-y-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-30 delay-150 drop-shadow-[0_5px_10px_rgba(239,68,68,0.8)]">🦀</div>
                    {/* 🪨 前景真實感石頭 (SVG繪製，多層疊加製造縫隙，覆蓋在螃蟹上方) */}
                    <svg className="absolute bottom-0 w-full h-[80%] z-20 pointer-events-none drop-shadow-2xl" viewBox="0 0 400 200" preserveAspectRatio="none">
                       {/* 底層深色巨石 */}
                       <path d="M-10,210 Q40,100 100,130 T220,110 T320,130 T410,90 L410,210 Z" fill="#334155" stroke="#1e293b" strokeWidth="2"/>
                       
                       {/* 中層獨立岩塊 (刻意留下縫隙讓螃蟹鑽出來) */}
                       <path d="M-20,220 Q10,120 70,135 Q120,140 110,220 Z" fill="#475569" stroke="#1e293b" strokeWidth="3"/>
                       <path d="M90,220 Q130,100 200,90 Q260,80 280,220 Z" fill="#64748b" stroke="#334155" strokeWidth="4"/>
                       <path d="M250,220 Q290,110 350,120 Q400,130 420,220 Z" fill="#475569" stroke="#1e293b" strokeWidth="3"/>
                       
                       {/* 前景點綴碎石 */}
                       <path d="M40,220 Q70,160 120,170 Q150,180 140,220 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="2"/>
                       <path d="M180,220 Q210,150 270,160 Q310,170 320,220 Z" fill="#334155" stroke="#0f172a" strokeWidth="2"/>
                    </svg>
                 </div>

                 {/* 探照燈陰影遮罩 (Hover時變透明) */}
                 <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors duration-500 pointer-events-none z-30"></div>
              </div>

            </div>

            <div className="mt-8 w-full bg-slate-900 rounded-[2rem] border border-slate-700 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.45)] overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),transparent_30%)] pointer-events-none"></div>
              <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 z-10">
                <div className="relative rounded-[1.75rem] bg-slate-800/90 border border-slate-700 p-6 overflow-hidden min-h-[420px] md:min-h-[480px] lg:min-h-[520px]">
                  <div className="absolute inset-x-6 top-6 h-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-400" />
                  <div className="absolute inset-x-8 top-16 h-20 rounded-3xl bg-slate-900/70 border border-slate-700"></div>
                  <div className="absolute left-10 top-24 w-28 h-28 rounded-full bg-slate-800/90 border border-slate-700 shadow-[0_0_25px_rgba(56,189,248,0.18)] flex items-center justify-center text-4xl text-sky-200 animate-emoji-shake">🕊️</div>
                  <div className="absolute right-10 top-24 w-28 h-28 rounded-full bg-slate-800/90 border border-slate-700 shadow-[0_0_25px_rgba(248,113,113,0.18)] flex items-center justify-center text-4xl text-orange-300 animate-emoji-shake">🦀</div>
                  <div className="absolute left-1/2 top-[26%] -translate-x-1/2 w-20 h-20 rounded-full bg-slate-900/80 border border-slate-700 shadow-[0_0_30px_rgba(148,163,184,0.18)] flex items-center justify-center text-3xl text-slate-200 animate-emoji-shake">▶</div>

                  <div className="absolute left-12 top-[58%] z-10 w-[30%] rounded-3xl bg-slate-900/80 border border-slate-700 p-4 shadow-lg text-center">
                    <p className="text-slate-400 text-sm uppercase tracking-[0.18em]">Stage 1</p>
                    <p className="mt-2 font-semibold text-slate-100">棲地碎片化</p>
                  </div>
                  <div className="absolute right-12 top-[58%] z-10 w-[30%] rounded-3xl bg-slate-900/80 border border-slate-700 p-4 shadow-lg text-center">
                    <p className="text-slate-400 text-sm uppercase tracking-[0.18em]">Stage 3</p>
                    <p className="mt-2 font-semibold text-slate-100">繁殖減少</p>
                  </div>
                  <div className="absolute left-1/2 bottom-24 -translate-x-1/2 z-30 w-[32%] max-w-[240px] rounded-3xl bg-slate-900/80 border border-slate-700 p-3 shadow-lg text-center">
                    <p className="text-slate-400 text-sm uppercase tracking-[0.18em]">Stage 2</p>
                    <p className="mt-2 font-semibold text-slate-100">覓食成本上升</p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                </div>

                <div className="flex flex-col justify-center gap-4 text-slate-100">
                  <h3 className="text-3xl font-bold text-blue-300">最終影響</h3>
                  <p className="text-base leading-relaxed text-slate-300">
                    這個場景現在像一個生態電影腳本：棲地碎片化、能量成本飆升，最後演變成獵物供給不足與繁殖周期崩潰。
                  </p>
                  <div className="grid gap-4">
                    <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">1</div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">影響一</p>
                          <p className="font-semibold text-slate-100">棲地可連續性斷裂</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">2</div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">影響二</p>
                          <p className="font-semibold text-slate-100">覓食距離與時間增加</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">3</div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">影響三</p>
                          <p className="font-semibold text-slate-100">繁殖成功機率下降</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

{/* 新增互動 3：迷你地理分佈地圖 (Little Map) */}{/* ================= 互動 3：真實大數據地圖 (Folium) ================= */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-blue-300 text-center">SPATIAL DISTRIBUTION IN 2026</h2>
            <p className="text-center text-slate-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              大數據空間運算揭示了海岸線硬化帶來的地理變化。這張是我們利用 Folium 繪製的真實大數據地圖。<br/>
              <span className="text-red-400 font-bold">紅色標記為小白鷺</span>，<span className="text-blue-400 font-bold">藍色標記為底棲生物</span>。您可以自由拖曳、縮放，並點擊圖標查看詳細數據。
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button onClick={showRedPoints} className="rounded-full bg-red-600 hover:bg-red-500 px-5 py-3 text-white font-semibold shadow-lg transition">
                Show Red Points
              </button>
              <button onClick={showBluePoints} className="rounded-full bg-blue-600 hover:bg-blue-500 px-5 py-3 text-white font-semibold shadow-lg transition">
                Show Blue Points
              </button>
              <button onClick={showBothPoints} className="rounded-full bg-slate-700 hover:bg-slate-600 px-5 py-3 text-white font-semibold shadow-lg transition">
                Show Both
              </button>
            </div>
            <div className="w-full p-2 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               <iframe 
                 ref={mapIframeRef}
                 src="/Macau_Ecology_Map.html" 
                 className="rounded-xl bg-white w-full aspect-video min-h-[520px]" 
                 title="Macau Ecology Spatial Map"
               />
            </div>
          </div>

          {/* 策略與總結表格 */}
          <div className="grid grid-cols-1 gap-12">
             <div className="text-center">
                <h2 className="text-3xl font-bold mb-6 text-blue-300">CONCLUSION & RECOVERY STRATEGIES</h2>
                <p className="text-slate-300 max-w-4xl mx-auto mb-10 leading-relaxed">
                  基於微棲地避難所理論 (Micro-refugia) 與動態源匯動態 (Source-Sink Dynamics)，我們建議在未來的填海工程中引入具有微間隙複雜度的生態工程（如多孔拋石），以確保底棲生物的基礎食物網，維持小白鷺等頂級掠食者的生態連通性。
                </p>
                
                {/* 海報上的表格 */}
                <div className="overflow-x-auto max-w-4xl mx-auto">
                  <table className="w-full text-left border-collapse bg-slate-800 rounded-lg overflow-hidden shadow-2xl">
                    <thead>
                      <tr className="bg-slate-700 text-blue-300">
                        <th className="p-4 border-b border-slate-600">海岸線微棲地類型</th>
                        <th className="p-4 border-b border-slate-600">特徵 / 濕地多樣性</th>
                        <th className="p-4 border-b border-slate-600">生態健康指數 (Simpson D)</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="hover:bg-slate-700/50 transition-colors">
                        <td className="p-4 border-b border-slate-600 font-bold text-emerald-400">天然軟相泥灘 (原生棲區)</td>
                        <td className="p-4 border-b border-slate-600">保留沉積動力，物種豐富</td>
                        <td className="p-4 border-b border-slate-600 text-lg">0.93 (強韌群落)</td>
                      </tr>
                      <tr className="hover:bg-slate-700/50 transition-colors">
                        <td className="p-4 border-b border-slate-600 font-bold text-red-400">人工混凝土海堤 (平滑硬區)</td>
                        <td className="p-4 border-b border-slate-600">微棲地喪失，1.29 (多樣性崩塌)</td>
                        <td className="p-4 border-b border-slate-600 text-lg">0.62 (僅剩四齒大額蟹)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="text-center pt-20 pb-10 text-slate-600 font-bold tracking-widest">
            <p>MACAU INSTITUTO SALESIANO © 2026</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;