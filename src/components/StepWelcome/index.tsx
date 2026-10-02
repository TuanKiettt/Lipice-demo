interface StepWelcomeProps {
  onNext: () => void; // Hoặc hàm chuyển bước tương ứng của bạn
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <section 
      onClick={onNext}
      className="relative flex h-dvh w-full flex-col items-center justify-center px-6 text-center overflow-hidden cursor-pointer"
    >
      {/* Container chính chứa các phần còn lại ở giữa màn hình */}
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-y-8">
        
        {/* 2. Phần Tagline và Logo 30 năm */}
        <div className="flex w-full flex-col items-center gap-y-6">
          <img 
            src="/tagline 1.png" 
            alt="Tagline" 
            className="w-auto max-w-[450px] h-auto object-contain" 
          />
        </div>

        {/* 3. Phần Thời gian/Địa điểm (TIME 1.png) */}
        <div className="flex w-full justify-center mt-4">
          <img 
            src="/TIME 1.png" 
            alt="time" 
            className="w-auto max-w-[650px] h-auto object-contain" 
          />
        </div>

      </div>
    </section>
  );
}