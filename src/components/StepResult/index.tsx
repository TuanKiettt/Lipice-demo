interface StepResultProps {
  btnClass: string;
  onReset: () => void;
}

export function StepResult({ btnClass, onReset }: StepResultProps) {
  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center px-6 text-center">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-gray-800">Thành quả của bạn</h2>
        <img
          src="."
          alt="Ảnh AI"
          className="aspect-3/4 h-[35dvh] border-white border-2 rounded-lg shadow-inner object-cover bg-gray-100"
        />
        <button
          className={`${btnClass} w-full bg-[#1a1a2e] text-white outline-[#1a1a2e] cursor-pointer shadow-md hover:bg-black`}
          onClick={onReset}
        >
          Chơi lại
        </button>
      </div>
    </section>
  );
}