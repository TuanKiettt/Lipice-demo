import React, { useRef, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { CameraIcon, FocusIcon, FolderOpenIcon } from "lucide-react";

interface StepCaptureProps {
  btnClass: string;
  onNext: () => void;
  setPreview: (val: string | null) => void;
}

const apiUpload = import.meta.env.VITE_API_UPLOAD;

export function StepCapture({
  btnClass,
  onNext,
  setPreview,
}: StepCaptureProps) {
  const [mode, setMode] = useState<"choice" | "camera" | "preview">("choice");
  const [preview, setLocalPreview] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"camera" | "file" | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // States quản lý tọa độ và zoom khi crop ảnh trực tiếp
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchDist, setTouchDist] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Mở camera từ thiết bị
  const startCamera = async () => {
    setSourceType("camera");
    setMode("camera");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1920, height: 1080 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Không thể mở camera:", err);
      setMode("choice");
      setSourceType(null);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const targetAspect = 3 / 4;
      let srcWidth = video.videoWidth || 640;
      let srcHeight = video.videoHeight || 480;
      let srcX = 0;
      let srcY = 0;

      if (srcWidth / srcHeight > targetAspect) {
        srcWidth = srcHeight * targetAspect;
        srcX = (video.videoWidth - srcWidth) / 2;
      } else {
        srcHeight = srcWidth / targetAspect;
        srcY = (video.videoHeight - srcHeight) / 2;
      }

      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, srcX, srcY, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        
        setImageObj(null);
        setLocalPreview(dataUrl);
        setPreview(dataUrl);
        stopCamera();
        setMode("preview");
      }
    }
  };

  const initImageForCrop = (dataUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageObj(img);
      const containerW = 208; // w-52
      const containerH = 256; // h-64
      const scaleX = containerW / img.width;
      const scaleY = containerH / img.height;
      const initialScale = Math.max(scaleX, scaleY);
      setScale(initialScale);
      setPosition({
        x: (containerW - img.width * initialScale) / 2,
        y: (containerH - img.height * initialScale) / 2,
      });
      setLocalPreview(dataUrl);
      setPreview(dataUrl);
      setMode("preview");
    };
    img.src = dataUrl;
  };

  const handleFileClick = () => {
    setSourceType("file");
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (resultUrl) {
          initImageForCrop(resultUrl);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (!preview) {
        setSourceType(null);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageObj) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageObj) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageObj) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchDist(dist);
    }
  };

  // Đã thêm e.preventDefault() để chặn sự kiện cuộn trang mặc định gây giật màn hình trên mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imageObj) return;
    e.preventDefault(); 

    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDist;
      setScale((prev) => Math.min(Math.max(prev * factor, 0.1), 10));
      setTouchDist(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDist(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageObj) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.1), 10));
  };

  const getCroppedImage = (): string => {
    if (!imageObj || sourceType === "camera") return preview || "";

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return preview || "";

    const containerW = 208; 
    const containerH = 256; 

    const sx = -position.x / scale;
    const sy = -position.y / scale;
    const sWidth = containerW / scale;
    const sHeight = containerH / scale;

    ctx.drawImage(
      imageObj,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  };

  const handleReset = () => {
    setLocalPreview(null);
    setImageObj(null);
    stopCamera();
    setSourceType(null);
    setCountdown(null);
    setMode("choice");
  };

  const startCountdown = () => {
    if (countdown !== null) return;
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleUploadAndNext = async () => {
    // Lấy chính xác ảnh (đã crop nếu là file, hoặc ảnh gốc nếu là camera)
    const finalDataUrl = sourceType === "file" ? getCroppedImage() : preview;
    if (!finalDataUrl) return;

    // Cập nhật lại preview cho chắc chắn
    setPreview(finalDataUrl);

    setIsUploading(true);
    try {
      const base64Data = finalDataUrl.replace(/^data:image\/\w+;base64,/, "");

      const formUploadImage = new FormData();
      formUploadImage.append("Procedure", "Upload_Avatar");
      formUploadImage.append("Parameters", base64Data);

      const response = await fetch(apiUpload, {
        method: "POST",
        body: formUploadImage,
        headers: {
          Authorization: `Bearer ${Cookies.get("bearer")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Tải ảnh lên server thất bại");
      }

      const result = await response.json();
      const serverFileName = result?.Objects?.[0]?.ResponseData;

      if (!serverFileName) {
        throw new Error("Không nhận được tên file từ server");
      }

      const targetImgUrl = `https://game.advietnam.vn/avatars/${serverFileName}`;
      Cookies.set("uploadedAvatar", targetImgUrl, { expires: 30 });

      setIsUploading(false);
      onNext();
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };
  
  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center px-6 text-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full flex flex-col items-center gap-5 relative">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FF4D94] text-white text-sm font-extrabold px-5 py-2 rounded-xl shadow-md tracking-wide whitespace-nowrap z-20">
          THIỆP MỜI SỰ KIỆN
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <img
              src="/heart 6 copy 3 1.png"
              alt="heart"
              className="w-6 h-6 object-contain"
            />
            {mode === "camera"
              ? "Chụp ảnh trực tiếp"
              : mode === "preview"
                ? sourceType === "file" ? "Căn chỉnh khung hình" : "Ảnh của bạn"
                : "Tải lên hoặc chụp ảnh"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {mode === "camera"
              ? countdown !== null
                ? `Đang chuẩn bị chụp trong ${countdown}s...`
                : "Căn chỉnh khuôn mặt ở giữa khung hình"
              : mode === "preview"
                ? sourceType === "file" 
                  ? "Giữ và kéo ảnh để di chuyển, dùng chuột/pinch để zoom" 
                  : "Xem lại ảnh trước khi tiếp tục"
                : "Chọn 1 ảnh chân dung rõ mặt nhé!"}
          </p>
        </div>

        {/* Giao diện 1: Lựa chọn */}
        {mode === "choice" && (
          <div className="flex flex-col gap-4 w-full my-2">
            <div
              onClick={startCamera}
              className="w-full h-36 border-2 border-dashed border-[#9DD4FA] bg-[#F2FAFF] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#e6f4ff] transition"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                <CameraIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-base">
                  Sử dụng Camera
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chụp trực tiếp từ thiết bị của bạn
                </p>
              </div>
            </div>

            <div
              onClick={handleFileClick}
              className="w-full h-36 border-2 border-dashed border-[#9DD4FA] bg-[#F2FAFF] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#e6f4ff] transition"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                <FolderOpenIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-base">
                  Chọn ảnh từ thiết bị
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hỗ trợ tùy chỉnh cắt ảnh trực tiếp
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Giao diện 2: Camera */}
        {mode === "camera" && (
          <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {countdown !== null && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
                <span className="text-6xl font-extrabold text-white animate-bounce drop-shadow-lg">
                  {countdown}
                </span>
              </div>
            )}

            <button
              onClick={startCountdown}
              disabled={countdown !== null}
              className={`absolute bottom-4 px-6 py-2.5 bg-[#F553A7] text-white font-bold rounded-full shadow-lg transition flex items-center gap-2 ${
                countdown !== null
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <span>
                <FocusIcon />
              </span>
              {countdown !== null ? "Đang chụp..." : "Chụp ngay"}
            </button>
          </div>
        )}

        {/* Giao diện 3: Preview */}
        {mode === "preview" && preview && (
          <div className="flex flex-col items-center gap-4 w-full">
            {sourceType === "file" && imageObj ? (
              <div
                className="relative w-52 h-64 rounded-2xl overflow-hidden border-2 border-[#9DD4FA] shadow-md cursor-grab active:cursor-grabbing select-none touch-none bg-gray-900 flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              >
                <img
                  src={imageObj.src}
                  alt="Crop preview"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: "top left",
                    position: "absolute",
                  }}
                  className="pointer-events-none"
                />
                <div className="absolute bottom-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
                  Kéo & Cuộn để chỉnh ảnh
                </div>
              </div>
            ) : (
              <div className="relative w-52 h-64 rounded-2xl overflow-hidden border-2 border-[#9DD4FA] shadow-md">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleReset}
                disabled={isUploading}
                className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium text-[#F553A7] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition cursor-pointer"
              >
                {sourceType === "camera" ? "Chụp lại" : "Chọn lại"}
              </button>
              <button
                disabled={isUploading}
                className={`flex-1 ${btnClass} text-xs bg-[#F553A7] text-white outline-[#2a3cff] cursor-pointer shadow-md hover:bg-[#F553A7] disabled:opacity-50`}
                onClick={handleUploadAndNext}
              >
                {isUploading ? "Đang lưu..." : "Tiếp tục"}
              </button>
            </div>
          </div>
        )}

        {mode === "camera" && countdown === null && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-800 underline cursor-pointer"
          >
            Quay lại lựa chọn
          </button>
        )}
      </div>
    </section>
  );
}