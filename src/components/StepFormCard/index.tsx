import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { generateInvitation } from "../../store/invitationThunks";

interface StepFormCardProps {
  onBack: () => void; 
  onNext: () => void; 
}

export function StepFormCard({ onBack, onNext }: StepFormCardProps) {
  const dispatch = useAppDispatch();
  const {
    preview,
    uploadedImageUrl,
    generationLoading,
    generationError,
  } = useAppSelector(
    (state) => state.workflow,
  );
  const currentName = Cookies.get("GameName") || "";

  const handleCreateInvitation = async () => {
    const action = await dispatch(
      generateInvitation({ fullName: currentName.trim() }),
    );
    if (generateInvitation.fulfilled.match(action)) {
      onNext();
    }
  };

  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center px-4 overflow-y-auto py-6">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative flex flex-col items-center gap-5 my-auto border border-white/50">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FF4D94] text-white text-sm font-extrabold px-5 py-2 rounded-full shadow-md tracking-wide whitespace-nowrap z-20">
          THIỆP MỜI SỰ KIỆN
        </div>

        <div className="w-full flex flex-col items-center gap-2 ">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A2B4C] flex items-center justify-center gap-2">
              Xác nhận thông tin
            </h3>
          </div>

          <div className="w-full flex flex-col items-center gap-4 bg-[#F2FAFF] border border-[#9DD4FA] rounded-2xl p-5 shadow-inner">
            <div className="relative w-52 h-64 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="User Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  Chưa có ảnh
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Tên của bạn
              </span>
              <div className="w-full bg-white border border-blue-100 rounded-xl py-2.5 px-4 text-center text-base sm:text-lg font-bold text-[#1A2B4C] shadow-xs truncate">
                {currentName || "Chưa có tên"}
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={generationLoading}
              className="flex-1 py-2 bg-gray-100 text-[#F553A7] font-semibold rounded-2xl hover:bg-gray-200 transition cursor-pointer text-sm"
            >
              Chụp lại
            </button>
            <button
              type="button"
              onClick={handleCreateInvitation}
              disabled={
                !currentName.trim() ||
                !preview ||
                !uploadedImageUrl ||
                generationLoading
              }
              className="flex-1 bg-linear-to-r from-[#FF4D94] to-[#FF2A80] text-white text-sm font-bold py-2 px-2 rounded-2xl shadow-lg hover:opacity-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generationLoading ? "ĐANG TẠO THIỆP..." : "TẠO THIỆP NGAY"}
            </button>
          </div>
          {generationError && (
            <p
              role="alert"
              className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600"
            >
              {generationError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}