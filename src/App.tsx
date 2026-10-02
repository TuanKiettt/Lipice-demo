import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import gsap from "gsap";
import { useAutoFetch } from "./hooks/useAutoFetch";
import { MainLayout } from "./layouts/MainLayout";
import { StepWelcome } from "./components/StepWelcome";
import { StepName } from "./components/StepName";
import { StepCapture } from "./components/StepCapture";
import { StepFormCard } from "./components/StepFormCard";
import { StepResult } from "./components/StepResult";

const BTN_CLASSES =
  "rounded-full px-10 py-4 text-xl font-semibold disabled:opacity-30 transition focus-visible:outline-4 focus-visible:outline-offset-4";

function App() {
  useAutoFetch({});

  const wrapRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

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
  setPreview(null);
  
  Cookies.remove("uploadedAvatar", { path: "" });
  Cookies.remove("uploadedAvatar", { path: "/" });
  
  localStorage.removeItem("uploadedAvatar");
  sessionStorage.removeItem("uploadedAvatar");
  window.location.reload();
};

  return (
    <MainLayout step={step}>
      <StepWelcome onNext={onStart} />

      <StepName
        nameRef={nameRef}
        name={name}
        setName={setName}
        btnClass={BTN_CLASSES}
        onNext={() => go(2)}
      />

      <StepCapture
        btnClass={BTN_CLASSES}
        onNext={() => go(3)}
        setPreview={setPreview}
      />

      {/* Truyền trực tiếp name và preview sang StepFormCard để không phải gọi API lấy lại */}
      <StepFormCard
        name={name}
        preview={preview}
        onBack={() => go(2)}
        onNext={() => go(4)}
      />

      <StepResult btnClass={BTN_CLASSES} onReset={reset} />
    </MainLayout>
  );
}

export default App;