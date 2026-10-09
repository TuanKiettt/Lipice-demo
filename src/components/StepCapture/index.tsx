import { useEffect, useRef, useState } from "react";
import { Camera, FolderOpen, Focus } from "lucide-react";
import { Cropper, type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { supabase } from "../../lib/supabase";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setCameraStarting,
  setCaptureError,
  setCaptureMode,
  setCaptureSource,
  setUploading,
} from "../../store/captureSlice";
import {
  setPreview,
  setUploadedImageUrl,
} from "../../store/workflowSlice";

interface StepCaptureProps {
  onNext: () => void;
  btnClass: string;
}

type UploadUrlResponse = {
  upload_url: string;
  url: string;
};

const isUploadUrlResponse = (value: unknown): value is UploadUrlResponse =>
  typeof value === "object" &&
  value !== null &&
  "upload_url" in value &&
  typeof value.upload_url === "string" &&
  value.upload_url.length > 0 &&
  "url" in value &&
  typeof value.url === "string" &&
  value.url.length > 0;

export function StepCapture({
  onNext,
  btnClass,
}: StepCaptureProps) {
  const dispatch = useAppDispatch();
  const { mode, sourceType, isStartingCamera, error, uploading } =
    useAppSelector((state) => state.capture);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Đổi tên state nội bộ tránh trùng lặp
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<ReactCropperElement>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!stream || !video) return;

    let active = true;
    video.srcObject = stream;
    video.play().catch((playError: unknown) => {
      if (!active) return;
      console.error("Không thể phát video camera:", playError);
      dispatch(setCaptureError("Không thể hiển thị camera. Vui lòng thử lại."));
      setStream(null);
      dispatch(setCaptureMode("choice"));
      dispatch(setCaptureSource(null));
    });

    return () => {
      active = false;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [dispatch, stream]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current !== null) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    dispatch(setCaptureError(""));
    dispatch(setCaptureSource("camera"));
    dispatch(setCaptureMode("camera"));
    dispatch(setCameraStarting(true));

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt này không hỗ trợ truy cập camera.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1920, height: 1080 },
        audio: false,
      });
      setStream(mediaStream);
    } catch (cameraError) {
      console.error("Không thể mở camera:", cameraError);
      dispatch(
        setCaptureError(
          cameraError instanceof DOMException &&
            cameraError.name === "NotAllowedError"
            ? "Bạn chưa cấp quyền sử dụng camera. Hãy cấp quyền rồi thử lại."
            : "Không thể mở camera. Vui lòng kiểm tra thiết bị và thử lại.",
        ),
      );
      dispatch(setCaptureMode("choice"));
      dispatch(setCaptureSource(null));
    } finally {
      dispatch(setCameraStarting(false));
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (
      !video ||
      !canvas ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      dispatch(
        setCaptureError(
          "Camera chưa sẵn sàng. Vui lòng chờ một chút rồi thử lại.",
        ),
      );
      return;
    }

    const targetAspect = 3 / 4;
    let sourceWidth = video.videoWidth;
    let sourceHeight = video.videoHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (sourceWidth / sourceHeight > targetAspect) {
      sourceWidth = sourceHeight * targetAspect;
      sourceX = (video.videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = sourceWidth / targetAspect;
      sourceY = (video.videoHeight - sourceHeight) / 2;
    }

    canvas.width = 600;
    canvas.height = 800;
    const context = canvas.getContext("2d");
    if (!context) {
      dispatch(
        setCaptureError("Không thể xử lý ảnh từ camera. Vui lòng thử lại."),
      );
      return;
    }

    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    context.restore();

    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    dispatch(setCaptureError(""));
    dispatch(setCaptureMode("preview"));
    setStream(null);
  };

  const startCountdown = () => {
    if (countdown !== null || isStartingCamera) return;

    let remaining = 3;
    dispatch(setCaptureError(""));
    setCountdown(remaining);
    countdownIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining === 0) {
        if (countdownIntervalRef.current !== null) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        capturePhoto();
        return;
      }
      setCountdown(remaining);
    }, 1000);
  };

  const handleFileClick = () => {
    dispatch(setCaptureError(""));
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dispatch(setCaptureError("Vui lòng chọn một tệp hình ảnh."));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        dispatch(
          setCaptureError("Không thể đọc ảnh đã chọn. Vui lòng thử tệp khác."),
        );
        return;
      }
      dispatch(setCaptureSource("file"));
      setPreviewUrl(reader.result);
      dispatch(setCaptureError(""));
      dispatch(setCaptureMode("preview"));
    };
    reader.onerror = () => {
      dispatch(
        setCaptureError("Không thể đọc ảnh đã chọn. Vui lòng thử tệp khác."),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setStream(null);
    setPreviewUrl(null);
    dispatch(setPreview(null));
    dispatch(setUploadedImageUrl(null));
    dispatch(setCaptureSource(null));
    dispatch(setCaptureError(""));
    dispatch(setCaptureMode("choice"));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = async () => {
    if (!previewUrl) {
      dispatch(
        setCaptureError("Vui lòng chụp ảnh hoặc chọn ảnh trước khi tiếp tục."),
      );
      return;
    }

    dispatch(setUploading(true));
    dispatch(setCaptureError(""));

    try {
      const finalPreview =
        sourceType === "file"
          ? cropperRef.current?.cropper
              .getCroppedCanvas({
                width: 600,
                height: 800,
                imageSmoothingQuality: "high",
              })
              .toDataURL("image/jpeg", 0.9)
          : previewUrl;

      if (!finalPreview) {
        dispatch(
          setCaptureError(
            "Chưa thể xử lý ảnh. Vui lòng căn chỉnh hoặc chọn ảnh khác.",
          ),
        );
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user || !session.access_token) {
        throw new Error("Bạn cần đăng nhập trước khi lưu ảnh.");
      }

      const blob = await fetch(finalPreview).then((response) => response.blob());
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error("Ảnh sau khi xử lý vượt quá giới hạn 5 MB.");
      }

      const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
      const callPrivateFunction = async (
        path: string,
        body: Record<string, string>,
      ): Promise<unknown> => {
        const response = await fetch(`${functionsUrl}/${path}`, {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const responseText = await response.text();
        let responseData: unknown = responseText;
        try {
          responseData = JSON.parse(responseText) as unknown;
        } catch {
          // Keep the response text so non-JSON errors remain visible.
        }

        if (!response.ok) {
          const detail =
            typeof responseData === "object" &&
            responseData !== null &&
            "error" in responseData &&
            typeof responseData.error === "string"
              ? responseData.error
              : typeof responseData === "string"
                ? responseData
                : response.statusText;
          throw new Error(`${path} thất bại (${response.status}): ${detail}`);
        }

        return responseData;
      };

      const uploadInfo = await callPrivateFunction(
        "private/create_upload_url",
        { content_type: "image/jpeg" },
      );
      if (!isUploadUrlResponse(uploadInfo)) {
        throw new Error("API tạo URL upload trả về dữ liệu không hợp lệ.");
      }

      const uploadResponse = await fetch(uploadInfo.upload_url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      if (!uploadResponse.ok) {
        const detail = await uploadResponse.text();
        throw new Error(
          `Upload ảnh thất bại (${uploadResponse.status}): ${detail || uploadResponse.statusText}`,
        );
      }

      await callPrivateFunction("private/update_avatar_url", {
        avatar_url: uploadInfo.url,
      });

      console.log("avatar_url:", uploadInfo.url);

      dispatch(setPreview(finalPreview));
      dispatch(setUploadedImageUrl(uploadInfo.url));
      onNext();
    } catch (cropError) {
      console.error("Không thể upload hoặc cập nhật ảnh đại diện:", cropError);
      dispatch(
        setCaptureError(
          cropError instanceof Error
            ? cropError.message
            : "Không thể upload hoặc cập nhật ảnh đại diện. Vui lòng thử lại.",
        ),
      );
    } finally {
      dispatch(setUploading(false));
    }
  };

  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col items-center gap-5 overflow-y-visible rounded-2xl bg-white/90 p-6 pt-10 shadow-xl backdrop-blur-md sm:p-8 sm:pt-10 my-auto">
        <div className="absolute -top-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#FF4D94] px-5 py-2 text-sm font-extrabold tracking-wide text-white shadow-md">
          THIỆP MỜI SỰ KIỆN
        </div>

        <div className="mt-2 flex flex-col items-center gap-1">
          <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-800 sm:text-2xl">
            <img
              src="/heart 6 copy 3 1.png"
              alt=""
              aria-hidden="true"
              className="h-6 w-6 object-contain"
            />
            {mode === "camera"
              ? "Chụp ảnh trực tiếp"
              : mode === "preview"
                ? sourceType === "file"
                  ? "Căn chỉnh khung hình"
                  : "Ảnh của bạn"
                : "Tải ảnh lên hoặc chụp ảnh"}
          </h2>
          <p className="text-xs text-gray-500 sm:text-sm">
            {mode === "camera"
              ? countdown !== null
                ? `Đang chuẩn bị chụp trong ${countdown}s...`
                : "Căn chỉnh khuôn mặt ở giữa khung hình"
              : mode === "preview"
                ? sourceType === "file"
                  ? "Di chuyển và thu phóng để căn chỉnh ảnh"
                  : "Xem lại ảnh trước khi tiếp tục"
                : "Chọn một ảnh chân dung rõ mặt nhé!"}
          </p>
        </div>

        {mode === "choice" && (
          <div className="my-2 flex w-full flex-col gap-4">
            <button
              type="button"
              onClick={startCamera}
              disabled={isStartingCamera}
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#9DD4FA] bg-[#F2FAFF] transition hover:bg-[#e6f4ff] disabled:opacity-60 cursor-pointer"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Camera className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold text-gray-800">
                  {isStartingCamera ? "Đang mở camera..." : "Sử dụng Camera"}
                </span>
                <span className="mt-0.5 block text-xs text-gray-400">
                  Chụp trực tiếp từ thiết bị của bạn
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={handleFileClick}
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#9DD4FA] bg-[#F2FAFF] transition hover:bg-[#e6f4ff] cursor-pointer"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FolderOpen
                  className="h-6 w-6 text-blue-500"
                  aria-hidden="true"
                />
              </span>
              <span>
                <span className="block text-base font-semibold text-gray-800">
                  Chọn ảnh từ thiết bị
                </span>
                <span className="mt-0.5 block text-xs text-gray-400">
                  Có thể căn chỉnh khung hình trước khi tiếp tục
                </span>
              </span>
            </button>
          </div>
        )}

        {mode === "camera" && (
          <div className="flex w-full flex-col items-center gap-4">
            {/* Khung hiển thị camera: ép thành hình vuông hoàn toàn */}
            <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-inner mx-auto aspect-square">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              {countdown !== null && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                  <span className="animate-bounce text-6xl font-extrabold text-white drop-shadow-lg">
                    {countdown}
                  </span>
                </div>
              )}
              {isStartingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-medium text-white">
                  Đang mở camera...
                </div>
              )}
            </div>

            {/* Dùng flex-row để icon nằm ngang cùng hàng với chữ */}
            <button
              type="button"
              onClick={startCountdown}
              disabled={countdown !== null || isStartingCamera}
              className="inline-flex flex-row items-center justify-center gap-2 rounded-full bg-[#F553A7] px-8 py-3 font-bold text-white shadow-lg transition hover:bg-[#e04296] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <Focus className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{countdown !== null ? "Đang chụp..." : "Chụp ngay"}</span>
            </button>

            {countdown === null && (
              <button
                type="button"
                onClick={handleReset}
                className="block w-full text-sm text-gray-500 underline hover:text-gray-800 cursor-pointer"
              >
                Quay lại lựa chọn
              </button>
            )}
          </div>
        )}

        {mode === "preview" && previewUrl && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="h-64 w-52 overflow-hidden rounded-2xl border-2 border-[#9DD4FA] bg-gray-900 shadow-md">
              {sourceType === "file" ? (
                <Cropper
                  ref={cropperRef}
                  src={previewUrl}
                  style={{ height: "100%", width: "100%" }}
                  aspectRatio={3 / 4}
                  viewMode={1}
                  dragMode="move"
                  autoCropArea={1}
                  responsive
                  restore={false}
                  guides
                  background={false}
                  checkOrientation
                  alt="Căn chỉnh ảnh chân dung"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Ảnh xem trước"
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-medium text-[#F553A7] transition hover:bg-blue-100 cursor-pointer"
              >
                {sourceType === "camera" ? "Chụp lại" : "Chọn lại"}
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={uploading}
                className={`${btnClass} flex-1 rounded-xl bg-[#F553A7] px-3 py-2.5 text-sm text-white shadow-md hover:bg-[#e04296] cursor-pointer`}
              >
                {uploading ? "Đang lưu ảnh..." : "Tiếp tục"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
