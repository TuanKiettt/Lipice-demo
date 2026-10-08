import React from "react";

interface MainLayoutProps {
  stepNum: number;
  children: React.ReactNode;
}

const FOOT_ASSET = [
  {
    src: "/trái tim trái 1.png",
    alt: "Left heart",
    style:
      "absolute bottom-0 left-0 h-auto object-contain z-10 transition-all duration-700",
    beforeScroll: "w-[60%] sm:w-[50%]",
    afterScroll: "w-[45%] sm:w-[38%]",
  },

  {
    src: "/tim xanh không hiệu ứng 1.png",
    alt: "Center heart",
    style:
      "absolute left-1/2 -translate-x-1/2 object-contain z-30 drop-shadow-xl transition-all duration-700",
    beforeScroll: "bottom-6 w-20 sm:w-24",
    afterScroll: "bottom-3 w-14 sm:w-18",
  },

  {
    src: "/trái tim phải 1.png",
    alt: "Right heart",
    style:
      "absolute bottom-0 right-0 z-20 h-auto object-contain transition-all duration-700",
    beforeScroll: "w-[60%] sm:w-[50%]",
    afterScroll: "w-[45%] sm:w-[38%]",
  },
];

export function MainLayout ({ stepNum, children }: MainLayoutProps) {
  const isScroll = stepNum > 0;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-linear-to-r from-[#91C9EF] via-[#FFFFFF] to-[#BDE3F8]">
      {/* 2 Logo trên */}
      <div
        className={`absolute left-4 z-20 pointer-events-none transition-all duration-700 ${isScroll ? "top-3 max-w-27.5 sm:max-w-32.5" : "top-4 sm:top-6 max-w-45 sm:max-w-55"}`}
      >
        <img
          src="To LipIce 1.png"
          alt="logo left"
          className="w-auto h-auto object-contain"
          loading="eager"
        />
      </div>

      <div
        className={`absolute z-20 pointer-events-none ease-in-out transition-all duration-700
        ${
          isScroll
            ? "right-4 top-3 max-w-27.5 sm:max-w-32.5"
            : "left-1/2 top-[18%] sm:top-[16%] -translate-x-1/2 max-w-45 sm:max-w-55"
        }`}
      >
        <img
          src="logo 1.png"
          alt="Logo"
          className="w-auto h-auto object-contain"
        />
      </div>
      {/* Body */}
      <div
        className="h-full w-full"
      >
        {children}
      </div>
      {/* 3 Logo footer */}
      <div className={`absolute bottom-0 left-0 right-0 w-full z-20 pointer-events-none transition-all duration-700 ${isScroll ? "h-36 sm:h-40" : "h-48 sm:h-56"}`}
      >
        {FOOT_ASSET.map((item, index) => (
            <img 
            key={index}
            src={item.src} 
            alt={item.alt}
            className={`${item.style} ${isScroll ? item.afterScroll : item.beforeScroll}`} />
        ))}
      </div>
    </div>
  );
};
