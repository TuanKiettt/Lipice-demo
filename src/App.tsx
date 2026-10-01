import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const btn =
  "rounded-full px-10 py-4 text-xl font-semibold disabled:opacity-30     transitionfocus-visible:outline-4 focus-visible:outline-offset-4";

function App() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(wrapRef.current, {
        y: -8,
        duration: 0.7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);

  const onStart = () => {
    gsap
      .timeline()
      .to(wrapRef.current, { scale: 0.9, duration: 0.12, ease: "power2.in" })
      .to(wrapRef.current, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    go(1, () => nameRef.current?.focus({ preventScroll: true }));
  };

  const go = (i: number, after?: () => void) => {
    setStep(i);
    if (after) setTimeout(after, 800);
  };

  const reset = () => {
    setName("");
    go(0);
  };

  return (
    <>
      <main className="h-dvh overflow-hidden">
        <div
          className="will-change-transform transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translate3d(0, -${step * 100}dvh, 0)` }}
        >
          <section
            className={`relative flex h-dvh w-full flex-col items-center justify-center gap-8 px-6 text-center bg-blue-500 text-white`}
          >
            <h1 className="text-4xl font-extrabold tracking-tight">
              Tagline + Logo
            </h1>
            <div ref={wrapRef} className="relative">
              <button
                className={`${btn} relative flex items-center gap-3 bg-[#ffd23f] text-[#1a1a2e] outline-white cursor-pointer`}
                onClick={onStart}
              >
                Bắt đầu
              </button>
            </div>
          </section>

          <section
            className={`relative flex h-dvh w-full flex-col items-center justify-center gap-8 px-6 text-center bg-blue-100 text-[#1a1a2e]`}
          >
            <h2 >
              nhập tên
            </h2>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && go(2)}
              placeholder="nhập tên"
              maxLength={30}
              className="w-full max-w-md border-b-4 border-[#2a3cff] bg-transparent py-3 text-center text-3xl outline-none placeholder:text-[#1a1a2e]/30"
            />
            <button
              className={`${btn} bg-[#2a3cff] text-white outline-[#2a3cff] cursor-pointer`}
              disabled={!name.trim()}
              onClick={() => go(2)}
            >
              Tiếp tục
            </button>
          </section>

          <section
            className={`relative flex h-dvh w-full flex-col items-center justify-center gap-8 px-6 text-center bg-[#14142b] text-white`}
          >
            <h2>
              Chọn ảnh <br /> hoặc <br /> Chụp ảnh
            </h2>

            <button
              className={`${btn} bg-[#2a3cff] text-white outline-white cursor-pointer`}
              onClick={() => go(3)}
            >
              Tạo ảnh
            </button>
          </section>

          <section
            className={`relative flex h-dvh w-full flex-col items-center justify-center gap-8 px-6 text-center bg-[#ffd23f] text-[#1a1a2e]`}
          >
            <h2 >
              Trang cuối
            </h2>
            <img
              src={"."}
              alt={`Ảnh AI`}
              className="aspect-[3/4] h-[40dvh] border-white border-2"
            />
            <button
              className={`${btn} bg-[#1a1a2e] text-white outline-[#1a1a2e] cursor-pointer`}
              onClick={reset}
            >
              Chơi lại
            </button>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
