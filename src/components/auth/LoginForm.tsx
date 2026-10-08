import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "../../schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../lib/supabase";

type LoginFormProps = {
  btnClass: string;
  onNext: () => void;
};

export function LoginForm({ btnClass, onNext }: LoginFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col items-center gap-4"
    >
      <div className="w-full space-y-3 text-left">
        <div>
          <input
            type="email"
            {...register("email")}
            placeholder="Email"
            autoComplete="email"
            className="w-full bg-[#F2FAFF] border rounded-3xl border-[#9DD4FA] py-3 px-4 text-center text-lg text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 text-center font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className="w-full bg-[#F2FAFF] border rounded-3xl border-[#9DD4FA] py-3 px-4 text-center text-lg text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 text-center font-medium">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="w-full rounded-xl bg-red-50 p-3 text-sm text-red-600 font-medium border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`${btnClass} w-full bg-[#F553A7] text-white outline-[#2a3cff] cursor-pointer shadow-md hover:bg-[#e04296] transition-colors disabled:opacity-30 rounded-3xl py-3 font-bold text-lg`}
      >
        {loading ? "Đang xử lý..." : "Đăng nhập"}
      </button>
    </form>
  );
}