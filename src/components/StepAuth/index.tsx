import RegisterForm from "../auth/RegisterForm";
import { LoginForm } from "../auth/LoginForm";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setActiveAuthForm } from "../../store/authSlice";

interface StepAuthProps {
  btnClass: string;
  onNext: () => void;
}

export function StepAuth({ btnClass, onNext }: StepAuthProps) {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector((state) => state.auth.activeForm === "login");

  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center px-6 text-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center gap-6 relative">
        {/* Nhãn sự kiện phía trên */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FF4D94] text-white text-sm font-extrabold px-5 py-2 rounded-xl shadow-md tracking-wide whitespace-nowrap z-20">
          THIỆP MỜI SỰ KIỆN
        </div>

        <h2 className="text-2xl font-bold text-[#173D86] flex items-center justify-center gap-2 mt-2">
          <img
            src="/heart 6 copy 3 1.png"
            alt="heart"
            className="w-6 h-6 object-contain"
          />
          {isLogin ? "Đăng nhập" : "Đăng ký tham gia"}
        </h2>

        {/* Tab chuyển đổi Đăng ký / Đăng nhập giống mẫu */}
        <div className="flex w-full bg-[#F2FAFF] p-1 rounded-2xl border border-[#9DD4FA]">
          <button
            type="button"
            onClick={() => dispatch(setActiveAuthForm("register"))}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              !isLogin
                ? "bg-[#FF4D94] text-white shadow-md"
                : "text-[#173D86] hover:bg-white/50"
            }`}
          >
            Đăng ký
          </button>
          <button
            type="button"
            onClick={() => dispatch(setActiveAuthForm("login"))}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isLogin
                ? "bg-[#FF4D94] text-white shadow-md"
                : "text-[#173D86] hover:bg-white/50"
            }`}
          >
            Đăng nhập
          </button>
        </div>

        {/* Hiển thị component con tương ứng dựa theo tab */}
        {!isLogin ? (
          <RegisterForm btnClass={btnClass} onNext={onNext} />
        ) : (
          <LoginForm btnClass={btnClass} onNext={onNext} />
        )}
      </div>
    </section>
  );
}