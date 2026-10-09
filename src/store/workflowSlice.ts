import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { generateInvitation } from "./invitationThunks";

export type WorkflowStep = 0 | 1 | 2 | 3 | 4;

interface WorkflowState {
  step: WorkflowStep;
  preview: string | null;
  uploadedImageUrl: string | null;
  generatedMediaUrl: string | null;
  generationLoading: boolean;
  generationError: string;
}

const initialState: WorkflowState = {
  step: 0,
  preview: null,
  uploadedImageUrl: null,
  generatedMediaUrl: null,
  generationLoading: false,
  generationError: "",
};

const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<WorkflowStep>) {
      state.step = action.payload;
    },
    advanceAfterAuth(state) {
      if (state.step === 1) {
        state.step = 2;
      }
    },
    setPreview(state, action: PayloadAction<string | null>) {
      state.preview = action.payload;
    },
    setUploadedImageUrl(state, action: PayloadAction<string | null>) {
      state.uploadedImageUrl = action.payload;
    },
    resetWorkflow() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateInvitation.pending, (state) => {
        state.generationLoading = true;
        state.generationError = "";
        state.generatedMediaUrl = null;
      })
      .addCase(generateInvitation.fulfilled, (state, action) => {
        state.generationLoading = false;
        state.generatedMediaUrl = action.payload;
      })
      .addCase(generateInvitation.rejected, (state, action) => {
        state.generationLoading = false;
        state.generationError =
          action.payload ?? action.error.message ?? "Không thể tạo thiệp bằng AI.";
      });
  },
});

export const {
  advanceAfterAuth,
  resetWorkflow,
  setPreview,
  setStep,
  setUploadedImageUrl,
} = workflowSlice.actions;
export default workflowSlice.reducer;
