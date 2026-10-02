import React, { useState } from "react";
import Cookies from "js-cookie";

interface StepNameProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  name: string;
  setName: (val: string) => void;
  btnClass: string;
  onNext: () => void;
}

const apiGetUser = import.meta.env.VITE_API_GETUSER;

export function StepName({
  nameRef,
  name,
  setName,
  btnClass,
  onNext,
}: StepNameProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Thêm state báo lỗi nếu người dùng cố nhập số/ký tự đặc biệt

  // Cho phép nhập tự do để không bị lỗi bộ gõ tiếng Việt
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errorMessage) setErrorMessage(""); // Xóa thông báo lỗi khi người dùng gõ lại
  };

  // Hàm kiểm tra và gọi API lưu tên
  const handleSaveNameAndNext = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Kiểm tra xem tên có chứa số hoặc ký tự đặc biệt không (+ - * / @ # $ % ... các thứ)
    // Chỉ cho phép chữ cái tiếng Việt và khoảng trắng
    const invalidCharRegex = /[^a-zA-ZÀ-ỹĂăĐđÊêÎîÔôƠơƯư\s]/;
    if (invalidCharRegex.test(trimmedName)) {
      setErrorMessage("Tên không được chứa số hoặc ký tự đặc biệt!");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("Procedure", "Gamer_Update_Info");
      formData.append(
        "Parameters",
        JSON.stringify({
          GamerCode: Cookies.get("user_code") || "",
          GamerName: trimmedName,
        })
      );

      const response = await fetch(apiGetUser, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${Cookies.get("bearer")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lưu thông tin tên!");
      }
            
      Cookies.set("gamerName", trimmedName, { expires: 30 });
      console.log("Gamer name:", trimmedName);

      setIsLoading(false);
      onNext();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center px-6 text-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center gap-6">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FF4D94] text-white text-sm font-extrabold px-5 py-2 rounded-xl shadow-md tracking-wide whitespace-nowrap z-20">
          THIỆP MỜI SỰ KIỆN
        </div>
        <h2 className="text-2xl font-bold text-[#173D86] flex items-center justify-center gap-2">
          <img
            src="/heart 6 copy 3 1.png"
            alt="heart"
            className="w-6 h-6 object-contain"
          />
          Nhập tên của bạn
        </h2>

        <div className="w-full flex flex-col items-center gap-2">
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && !isLoading && handleSaveNameAndNext()}
            placeholder="Ví dụ: Nguyễn Văn A"
            maxLength={30}
            disabled={isLoading}
            className="w-full bg-[#F2FAFF] border rounded-3xl border-[#9DD4FA] py-3 px-4 text-center text-2xl text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
          />
          {/* Hiển thị lỗi nếu có chứa số hoặc ký tự lạ */}
          {errorMessage && (
            <span className="text-red-500 text-sm font-medium">{errorMessage}</span>
          )}
        </div>

        <button
          className={`${btnClass} w-full bg-[#F553A7] text-white outline-[#2a3cff] cursor-pointer shadow-md hover:bg-[#e04296] transition-colors disabled:opacity-30`}
          disabled={!name.trim() || isLoading}
          onClick={handleSaveNameAndNext}
        >
          {isLoading ? "Đang xử lý..." : "Tiếp tục"}
        </button>
      </div>
    </section>
  );
}