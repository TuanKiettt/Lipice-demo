import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import captureReducer from "./captureSlice";
import workflowReducer from "./workflowSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    capture: captureReducer,
    workflow: workflowReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
