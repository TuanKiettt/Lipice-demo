import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CaptureMode = "choice" | "camera" | "preview";
export type CaptureSource = "camera" | "file";

interface CaptureState {
  mode: CaptureMode;
  sourceType: CaptureSource | null;
  isStartingCamera: boolean;
  uploading: boolean;
  error: string;
}

const initialState: CaptureState = {
  mode: "choice",
  sourceType: null,
  isStartingCamera: false,
  uploading: false,
  error: "",
};

const captureSlice = createSlice({
  name: "capture",
  initialState,
  reducers: {
    setCaptureMode(state, action: PayloadAction<CaptureMode>) {
      state.mode = action.payload;
    },
    setCaptureSource(state, action: PayloadAction<CaptureSource | null>) {
      state.sourceType = action.payload;
    },
    setCameraStarting(state, action: PayloadAction<boolean>) {
      state.isStartingCamera = action.payload;
    },
    setUploading(state, action: PayloadAction<boolean>) {
      state.uploading = action.payload;
    },
    setCaptureError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    resetCapture() {
      return initialState;
    },
  },
});

export const {
  resetCapture,
  setCameraStarting,
  setCaptureError,
  setCaptureMode,
  setCaptureSource,
  setUploading,
} = captureSlice.actions;
export default captureSlice.reducer;
