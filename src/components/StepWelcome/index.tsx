interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Main Content */}
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-y-8 my-auto">
        {/* Tagline và Logo 30 năm */}
        <div className="flex w-full flex-col items-center gap-y-6">
          <img
            src="/tagline 1.png"
            alt="Tagline"
            className="w-auto max-w-112.5 h-auto object-contain"
          />
        </div>

        {/* Thời gian/Địa điểm */}
        <div className="flex w-full justify-center mt-4">
          <img
            src="/TIME 1.png"
            alt="time"
            className="w-auto max-w-162.5 h-auto object-contain"
          />
        </div>

        {/* Nút bấm bắt đầu */}
        <button
          className="border rounded-full border-white/55 bg-[#F553A7] px-10 py-3 hover:bg-pink-400 active:bg-pink-400 active:scale-95 transition-transform cursor-pointer shadow-lg"
          onClick={onNext}
          type="button"
        >
          <h1 className="uppercase text-white font-bold text-lg sm:text-xl">
            Bắt đầu tạo thiệp của bạn
          </h1>
        </button>
      </div>
    </section>
  );
}