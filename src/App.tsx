import { useCallback, useRef, useState } from "react";
import Cookies from "js-cookie";
import gsap from "gsap";
import type { Session } from "@supabase/supabase-js";
import { MainLayout } from "./layouts/MainLayout";
import { StepWelcome } from "./components/StepWelcome";
import { StepAuth } from "./components/StepAuth";
import { StepCapture } from "./components/StepCapture";
import { StepFormCard } from "./components/StepFormCard";
import { StepResult } from "./components/StepResult";
import { useSupabaseSession } from "./hooks/useSupabaseSession";
import { supabase } from "./lib/supabase";

const BTN_CLASSES =
  "rounded-full px-10 py-4 text-xl font-semibold disabled:opacity-30 transition focus-visible:outline-4 focus-visible:outline-offset-4";

function App() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const handleSessionChange = useCallback((nextSession: Session | null) => {
    if (nextSession) {
      setStep((currentStep) => (currentStep === 1 ? 2 : currentStep));
    } else {
      setStep(0);
      setPreview(null);
    }
  }, []);
  const { session, loading } = useSupabaseSession(handleSessionChange);

  if (loading) {
    return <p className="text-center mt-20 text-lg">Đang kiểm tra phiên đăng nhập...</p>;
  }

  const animateTransition = (nextStep: number) => {
    gsap
      .timeline()
      .to(wrapRef.current, { scale: 0.9, duration: 0.12, ease: "power2.in" })
      .to(wrapRef.current, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    setStep(nextStep);
  };

  const reset = () => {
    setPreview(null);
    Cookies.remove("uploadedAvatar", { path: "" });
    Cookies.remove("uploadedAvatar", { path: "/" });
    localStorage.removeItem("uploadedAvatar");
    sessionStorage.removeItem("uploadedAvatar");
    window.location.reload();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out:", error);
    }
  };

  return (
    <MainLayout stepNum={step}>
      {session && (
        <button 
          onClick={handleSignOut}
          className="absolute top-4 right-4 z-50 bg-white/80 px-4 py-2 rounded-full shadow text-sm font-medium text-red-600 hover:bg-white"
        >
          Đăng xuất
        </button>
      )}

      <div ref={wrapRef} className="w-full h-full flex flex-col items-center justify-center">
        {step === 0 && (
          <StepWelcome onNext={() => animateTransition(session ? 2 : 1)} />
        )}

        {step === 1 && (
          <StepAuth 
            btnClass={BTN_CLASSES} 
            onNext={() => animateTransition(2)} 
          />
        )}

        {step === 2 && (
          <StepCapture
            btnClass={BTN_CLASSES}
            onNext={() => animateTransition(3)}
            setPreview={setPreview}
          />
        )}

        {step === 3 && (
          <StepFormCard
            preview={preview}
            onBack={() => animateTransition(2)}
            onNext={() => animateTransition(4)}
          />
        )}

        {step === 4 && (
          <StepResult btnClass={BTN_CLASSES} onReset={reset} />
        )}
      </div>
    </MainLayout>
  );
}

export default App;