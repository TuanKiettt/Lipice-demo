import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterFormData } from "../../schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../../lib/supabase";
import Cookies from "js-cookie";

const apiGetUser = import.meta.env.VITE_API_GETUSER;

type RegisterFormProps = {
  btnClass: string;
  onNext: () => void;
};

export default function RegisterForm({ btnClass, onNext }: RegisterFormProps) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");
    setMessage("");

    let hasSession: boolean;
    try {
      const { data: authData, error: registerError } =
        await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              name: data.name.trim(),
              phone: data.phone,
            },
          },
        });

      if (registerError) throw registerError;
      hasSession = authData.session !== null;
    } catch (registerError) {
      console.error("Không thể đăng ký:", registerError);
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Không thể đăng ký lúc này. Vui lòng thử lại.",
      );
      setLoading(false);
      return;
    }

    if (apiGetUser) {
      try {
        const trimmedName = data.name.trim();
        const formData = new FormData();
        formData.append("Procedure", "Gamer_Update_Info");
        formData.append(
          "Parameters",
          JSON.stringify({
            GameCode: Cookies.get("user_code"),
            GameName: trimmedName,
          }),
        );

        await fetch(apiGetUser, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${Cookies.get("bearer")}`,
        },
      });

      } catch (err) {
        console.error("Không thể cập nhật tên trong hệ thống game:", err);
      }
    }

    Cookies.set("GameName", data.name.trim());
    setLoading(false);

    if (!hasSession) {
      setMessage(
        "Supabase chưa tạo phiên đăng nhập. Nếu đây là tài khoản mới, hãy kiểm tra email để xác nhận; nếu đã có tài khoản, hãy chuyển sang Đăng nhập.",
      );
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
            {...register("name")}
            placeholder="Họ và tên"
            autoComplete="name"
            className="w-full bg-[#F2FAFF] border rounded-3xl border-[#9DD4FA] py-3 px-4 text-center text-lg text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 text-center font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <input
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
            {...register("phone")}
            placeholder="Số điện thoại"
            autoComplete="tel"
            className="w-full bg-[#F2FAFF] border rounded-3xl border-[#9DD4FA] py-3 px-4 text-center text-lg text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500 text-center font-medium">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Mật khẩu"
            autoComplete="new-password"
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

      {message && (
        <div className="w-full rounded-xl bg-green-50 p-3 text-sm text-green-600 font-medium border border-green-200">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`${btnClass} w-full bg-[#F553A7] text-white outline-[#2a3cff] cursor-pointer shadow-md hover:bg-[#e04296] transition-colors disabled:opacity-30 rounded-3xl py-3 font-bold text-lg`}
      >
        {loading ? "Đang xử lý..." : "Đăng ký"}
      </button>
    </form>
  );
}