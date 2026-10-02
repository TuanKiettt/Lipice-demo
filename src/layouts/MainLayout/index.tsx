import React from "react";

interface MainLayoutProps {
  step: number;
  children: React.ReactNode;
}

export function MainLayout({ step, children }: MainLayoutProps) {
  const isScrolled = step > 0;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-linear-to-r from-[#91C9EF] via-[#FFFFFF] to-[#BDE3F8]">
      
      {/* 1. Trái tim trái (To LipIce 1.png): Luôn nằm cố định ở góc TRÁI trên */}
      <div className={`absolute left-4 z-20 pointer-events-none transition-all duration-700 ${isScrolled ? "top-3 max-w-[110px] sm:max-w-[130px]" : "top-4 sm:top-6 max-w-[180px] sm:max-w-[220px]"}`}>
        <img
          src="/To LipIce 1.png"
          alt="To Lipice"
          className="w-auto h-auto object-contain"
        />
      </div>

      {/* 2. Logo phải (logo 1.png): Giữa màn hình khi ở step 0, dịch lên góc phải khi step > 0 */}
      <div
        className={`absolute z-20 pointer-events-none transition-all duration-700 ease-in-out ${
          isScrolled
            ? "right-4 top-3 max-w-[110px] sm:max-w-[130px]"
            : "left-1/2 top-[18%] sm:top-[16%] -translate-x-1/2 max-w-[180px] sm:max-w-[220px]"
        }`}
      >
        <img
          src="/logo 1.png"
          alt="Logo"
          className="w-auto h-auto object-contain"
        />
      </div>

      {/* Khu vực trượt giữa các step */}
      <div
        className="will-change-transform transition-transform duration-1400 ease-[cubic-bezier(0.16,1,0.3,1)] h-full w-full"
        style={{ transform: `translate3d(0, -${step * 100}dvh, 0)` }}
      >
        {children}
      </div>

      {/* 3. Footer */}
      <div className={`absolute bottom-0 left-0 right-0 w-full z-20 pointer-events-none transition-all duration-700 ${isScrolled ? "h-36 sm:h-40" : "h-48 sm:h-56"}`}>
        
        {/* Mây bên trái */}
        <img
          src="/trái tim trái 1.png"
          alt="Left cloud"
          className={`absolute bottom-0 left-0 h-auto object-contain z-10 transition-all duration-700 ${isScrolled ? "w-[45%] sm:w-[38%]" : "w-[60%] sm:w-[50%]"}`}
        />

        {/* Mây bên phải */}
        <img
          src="/trái tim phải 1.png"
          alt="Right cloud"
          className={`absolute bottom-0 right-0 h-auto object-contain z-20 transition-all duration-700 ${isScrolled ? "w-[50%] sm:w-[42%]" : "w-[65%] sm:w-[55%]"}`}
        />

        {/* Cặp trái tim xanh ở giữa */}
        <img
          src="/tim xanh không hiệu ứng 1.png"
          alt="Blue hearts"
          className={`absolute left-1/2 -translate-x-1/2 object-contain z-30 drop-shadow-xl transition-all duration-700 ${isScrolled ? "bottom-3 w-14 sm:w-18" : "bottom-6 w-20 sm:w-24"}`}
        />
      </div>
    </main>
  );
}